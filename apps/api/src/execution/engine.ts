import { Workflow, Execution } from "@repo/types";
import { db, executions, executionSteps, eq } from "@repo/database";
import { WorkflowNode, WorkflowEdge, ExecutionContext, NodeExecutionResult } from "./types";
import { getNodeExecutor } from "./nodes";
import { validateWorkflow } from "../validation/validator";

// Map to store AbortControllers for running executions
const abortControllers = new Map<number, AbortController>();

export function cancelExecution(executionId: number) {
    const controller = abortControllers.get(executionId);
    if (controller) {
        controller.abort();
        abortControllers.delete(executionId);
        console.log(`[Execution ${executionId}] Cancelled by user request`);
        return true;
    }
    return false;
}

export async function executeWorkflow(workflowId: number, inputData: Record<string, unknown> = {}) {
    // 1. Create execution record
    const [execution] = await db
        .insert(executions)
        .values({
            workflowId,
            status: "running",
            data: inputData,
            startedAt: new Date(),
        })
        .returning();

    if (!execution) {
        throw new Error("Failed to create execution");
    }

    return runExecution(execution.id, workflowId, inputData);
}

export async function resumeExecution(executionId: number, nodeId: string, inputData: any) {
    // 1. Get execution
    const execution = await db.query.executions.findFirst({
        where: eq(executions.id, executionId)
    });

    if (!execution) throw new Error("Execution not found");
    if (execution.status !== 'waiting' && execution.status !== 'running') {
        throw new Error(`Cannot resume execution in status ${execution.status}`);
    }

    // 2. Update the suspended step
    await db.update(executionSteps)
        .set({
            status: 'completed',
            output: inputData,
            finishedAt: new Date()
        })
        .where(eq(executionSteps.executionId, executionId) && eq(executionSteps.nodeId, nodeId));

    // 3. Resume execution
    // We need to pass the *output* of the resumed node as input to its children
    // But runExecution expects initial input or we need to reconstruct state.
    // For simplicity, we'll reload the workflow and continue from the children of the resumed node.

    // Merge previous results with new input data for context if needed, 
    // but for now we just pass the resume options.
    const currentData = execution.data as Record<string, any> || {};

    return runExecution(executionId, execution.workflowId!, currentData, {
        resumeFromNodeId: nodeId,
        resumeInput: inputData
    });
}

async function runExecution(executionId: number, workflowId: number, initialInput: any, resumeOptions?: { resumeFromNodeId: string, resumeInput: any }) {
    // Create and store AbortController
    const controller = new AbortController();
    abortControllers.set(executionId, controller);

    try {
        // 2. Fetch workflow
        const wf = await db.query.workflows.findFirst({
            where: (workflows, { eq }) => eq(workflows.id, workflowId)
        });

        if (!wf) {
            throw new Error("Workflow not found");
        }

        console.log(`[Execution ${executionId}] Running workflow ${wf.name} (${wf.id})`);

        // 3. Parse Nodes and Edges
        const nodes = (wf.nodes || []) as WorkflowNode[];
        const edges = (wf.edges || []) as WorkflowEdge[];

        // Validation Check
        const validationErrors = validateWorkflow(nodes);
        if (validationErrors.length > 0) {
            throw new Error(`Workflow validation failed: ${validationErrors.map(e => e.message).join(", ")}`);
        }

        const nodeMap = new Map<string, WorkflowNode>();
        nodes.forEach(node => nodeMap.set(node.id, node));

        const adjacencyList = new Map<string, string[]>();
        const incomingEdgesCount = new Map<string, number>();

        edges.forEach(edge => {
            if (!adjacencyList.has(edge.source)) {
                adjacencyList.set(edge.source, []);
            }
            adjacencyList.get(edge.source)?.push(edge.target);

            incomingEdgesCount.set(edge.target, (incomingEdgesCount.get(edge.target) || 0) + 1);
        });

        // 4. Determine Start Nodes / Queue
        const queue: { nodeId: string; input: any }[] = [];
        const results: Record<string, NodeExecutionResult> = initialInput.results || {}; // Preserve existing results if passed

        if (resumeOptions) {
            // If resuming, we start from the children of the resumed node
            const children = adjacencyList.get(resumeOptions.resumeFromNodeId) || [];
            children.forEach(childId => {
                queue.push({
                    nodeId: childId,
                    input: resumeOptions.resumeInput
                });
            });
            // Also load previous results if needed (omitted for brevity, assuming stateless nodes for now)
        } else {
            // Standard start
            nodes.forEach(node => {
                const isRoot = (incomingEdgesCount.get(node.id) || 0) === 0;
                if (isRoot) {
                    queue.push({ nodeId: node.id, input: initialInput });
                }
            });
        }

        const context: ExecutionContext = {
            workflowId,
            executionId,
            input: initialInput,
            results
        };

        let steps = 0;
        const MAX_STEPS = 100;
        let suspended = false;

        while (queue.length > 0 && steps < MAX_STEPS) {
            // Check for cancellation
            if (controller.signal.aborted) {
                throw new Error("Execution cancelled");
            }

            const { nodeId, input } = queue.shift()!;
            steps++;

            const node = nodeMap.get(nodeId);
            if (!node) continue;

            // 1. Idempotency Check: Check if step already exists and is completed
            const existingStep = await db.query.executionSteps.findFirst({
                where: (steps, { and, eq }) => and(
                    eq(steps.executionId, executionId),
                    eq(steps.nodeId, nodeId),
                    eq(steps.status, 'completed')
                )
            });

            if (existingStep) {
                console.log(`[Execution ${executionId}] Skipping node ${node.id} (Already Completed)`);
                results[nodeId] = {
                    status: 'success', // Treat as success
                    output: existingStep.output
                };

                // Add children to queue
                const outgoingEdges = edges.filter(e => e.source === nodeId);
                for (const edge of outgoingEdges) {
                    queue.push({ nodeId: edge.target, input: existingStep.output });
                }
                continue;
            }

            // Check environment
            if (node.environment === 'client') {
                console.log(`[Execution ${executionId}] Suspending for Client Handoff at node ${node.id}`);

                // Persist suspension
                await db.insert(executionSteps).values({
                    executionId,
                    nodeId,
                    status: 'suspended', // Or a specific 'client_handoff' status if we want to be precise
                    input,
                    startedAt: new Date()
                });

                await db.update(executions)
                    .set({
                        status: 'waiting', // Waiting for client
                        data: results,
                        finishedAt: null
                    })
                    .where(eq(executions.id, executionId));

                return {
                    executionId,
                    status: 'waiting',
                    results,
                    nextStep: {
                        nodeId: node.id,
                        input,
                        type: node.type,
                        data: node.data
                    }
                };
            }

            console.log(`[Execution ${executionId}] Executing node ${node.id} (${node.type})`);

            // Persist Step Start
            await db.insert(executionSteps).values({
                executionId,
                nodeId,
                status: 'running',
                input,
                startedAt: new Date()
            });

            try {
                const executor = getNodeExecutor(node);
                const result = await executor.execute({ node, input, context, signal: controller.signal });

                results[node.id] = result;

                // Persist Step Completion
                await db.update(executionSteps)
                    .set({
                        status: result.status,
                        output: result.output,
                        finishedAt: new Date()
                    })
                    .where(eq(executionSteps.executionId, executionId) && eq(executionSteps.nodeId, nodeId));

                if (result.status === 'suspended') {
                    console.log(`[Execution ${executionId}] Suspended at node ${node.id}`);
                    suspended = true;
                    break; // Stop execution
                }

                if (result.status === 'success') {
                    const children = adjacencyList.get(node.id) || [];
                    children.forEach(childId => {
                        queue.push({
                            nodeId: childId,
                            input: result.output
                        });
                    });
                }
            } catch (err: any) {
                console.error(`[Execution ${executionId}] Node ${node.id} failed:`, err);
                results[node.id] = { status: 'failed', error: err.message };

                await db.update(executionSteps)
                    .set({
                        status: 'failed',
                        output: { error: err.message },
                        finishedAt: new Date()
                    })
                    .where(eq(executionSteps.executionId, executionId) && eq(executionSteps.nodeId, nodeId));

                if (controller.signal.aborted) {
                    throw new Error("Execution cancelled");
                }
            }
        }

        // 6. Update execution record
        const finalStatus = suspended ? 'waiting' : 'completed';

        // Fetch latest execution data to merge
        const latestExecution = await db.query.executions.findFirst({
            where: eq(executions.id, executionId)
        });

        const mergedData = {
            ...(latestExecution?.data as Record<string, any> || {}),
            ...results
        };

        await db
            .update(executions)
            .set({
                status: finalStatus,
                data: mergedData,
                finishedAt: suspended ? null : new Date(),
            })
            .where(eq(executions.id, executionId));

        console.log(`[Execution ${executionId}] ${finalStatus}`);
        return { executionId, status: finalStatus, results: mergedData };

    } catch (error: any) {
        console.error("Execution failed:", error);
        await db
            .update(executions)
            .set({
                status: "failed",
                data: { error: error.message },
                finishedAt: new Date(),
            })
            .where(eq(executions.id, executionId));

        return { executionId, status: "failed", error: error.message };
    } finally {
        // Cleanup controller
        abortControllers.delete(executionId);
    }
}
