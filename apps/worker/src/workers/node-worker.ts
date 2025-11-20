import { Worker, Job } from 'bullmq';
import { redisConnection } from '../config/redis';
import { db } from '@repo/database';
import { executions, workflows } from '@repo/database/schema';
import { eq } from 'drizzle-orm';
import { createLogger, withExecutionContext, Logger } from '@repo/logger';
import { nodeExecutionCounter, nodeExecutionDuration } from '@repo/metrics';
import { ExecutionContext, NodeExecutionResult, WorkflowNode } from '@repo/types';

// Import execution state service and node registry
import { executionStateService, ExecutionState } from '../services/execution-state';
import { sandbox } from '../services/sandbox';
import { nodeRegistry } from '../registry/node-registry';

type WorkerNodeResult = {
    status: 'completed' | 'failed' | 'suspended';
    output?: any;
    error?: any;
};

/**
 * Execute node logic by type
 * Special handling for CodeNode (uses sandbox), all others use registry
 */
const logger = createLogger({ name: 'node-worker' });

const executeNodeLogic = async (
    node: WorkflowNode,
    input: any,
    context: ExecutionContext,
    jobLogger?: Logger
): Promise<WorkerNodeResult> => {
    const log = jobLogger || logger;
    const nodeType = node.type;
    log.debug({ nodeType, inputKeys: Object.keys(input) }, 'Executing node logic');

    // Special case: CodeNode uses SandboxService
    if (nodeType === 'code') {
        const code = input.code || node.data?.code;
        if (!code) {
            throw new Error('No code provided for CodeNode');
        }

        try {
            const result = await sandbox.execute(code, { input, context });
            return { status: 'completed', output: result };
        } catch (error: any) {
            throw new Error(`CodeNode execution failed: ${error.message}`);
        }
    }

    // All other nodes: use registry
    const nodeExecutor = nodeRegistry.get(nodeType);
    if (!nodeExecutor) {
        throw new Error(`Unknown node type: ${nodeType}`);
    }

    try {
        // Execute node using its executor
        const result = await nodeExecutor.execute({
            node,
            input,
            context,
        });

        return {
            status: result.status === 'success' ? 'completed' : result.status,
            output: result.output,
        };
    } catch (error: any) {
        throw new Error(`${nodeType} execution failed: ${error.message}`);
    }
};

import { NODE_EXECUTION_QUEUE, getScheduledQueue } from '../config/queues';

// ... (imports)

const QUEUE_NAME = NODE_EXECUTION_QUEUE;

export class NodeWorker {
    private worker: Worker;

    constructor() {
        this.worker = new Worker(QUEUE_NAME, this.processJob.bind(this), {
            connection: redisConnection,
            concurrency: 10,
        });

        this.worker.on('completed', (job) => {
            logger.info({ jobId: job.id, executionId: job.data.executionId, nodeId: job.data.nodeId }, 'Node job completed');
        });

        this.worker.on('failed', (job, err) => {
            logger.error({ 
                jobId: job?.id, 
                executionId: job?.data?.executionId, 
                nodeId: job?.data?.nodeId,
                error: err.message,
                stack: err.stack 
            }, 'Node job failed');
        });
    }

    async processJob(job: Job) {
        const { executionId, nodeId, workflowId, input, attempt = 1 } = job.data;
        const maxAttempts = 3;
        let nodeTypeLabel = 'unknown';
        let stepStartTime: string | null = null;
        
        // Create child logger with execution context
        const jobLogger = withExecutionContext(logger, {
            executionId,
            workflowId,
            nodeId,
            jobId: job.id,
        });

        jobLogger.info({ attempt, maxAttempts }, 'Processing node execution');

        // 1. Check idempotency (from Redis state)
        const currentState = await executionStateService.getState(executionId);
        if (!currentState) {
            throw new Error(`Execution state not found for ${executionId}`);
        }

        if (currentState.completedNodes.includes(nodeId)) {
            jobLogger.info('Step already completed, skipping');
            return currentState.stepsByNodeId[nodeId]?.output;
        }

        // 2. Update state: mark node as active
        await executionStateService.updateState(executionId, {
            addActiveNode: nodeId,
        });

        try {
            // 3. Load workflow to get node type
            const workflow = await db.query.workflows.findFirst({
                where: eq(workflows.id, workflowId),
            });

            if (!workflow) throw new Error('Workflow not found');

            const nodes = workflow.nodes as any[];
            const nodeDef = nodes.find((n: any) => n.id === nodeId);

            if (!nodeDef) throw new Error(`Node definition not found for ${nodeId}`);
            nodeTypeLabel = nodeDef.type;

            // 4. Create step record (started)
            stepStartTime = new Date().toISOString();
            await executionStateService.updateState(executionId, {
                addStep: {
                    nodeId,
                    nodeType: nodeDef.type,
                    status: 'running',
                    output: {},
                    startedAt: stepStartTime,
                },
            });

            // 5. Execute node (or suspend if client-side)
            jobLogger.debug({ nodeDef }, 'Loaded node definition');

            const executionContext = this.buildExecutionContext({
                workflowId,
                executionId,
                input,
                state: currentState,
                workflow,
            });

            let result: WorkerNodeResult;
            try {
                // If the node is intended for client execution, suspend immediately and emit metadata
                if (nodeDef.environment === 'client') {
                    result = {
                        status: 'suspended',
                        output: {
                            reason: 'client_execution',
                            nodeId,
                            workflowId,
                            executionId,
                            input,
                        },
                    };
                } else {
                    result = await executeNodeLogic(
                        {
                            id: nodeId,
                            type: nodeDef.type,
                            position: nodeDef.position,
                            data: nodeDef.data || {},
                            environment: nodeDef.environment,
                        },
                        input,
                        executionContext,
                        jobLogger
                    );
                }
            } catch (error: any) {
                // Handle unknown node type specifically - fail immediately, no retry
                if (error.message.includes('Unknown node type')) {
                    jobLogger.error({ error: error.message, stack: error.stack }, 'Unknown node type - configuration error');

                    const stepEndTime = new Date().toISOString();
                    const stepDurationSeconds = stepStartTime
                        ? (new Date(stepEndTime).getTime() - new Date(stepStartTime).getTime()) / 1000
                        : 0;
                    await executionStateService.updateState(executionId, {
                        status: 'failed',
                        removeActiveNode: nodeId,
                        updateStep: {
                            nodeId,
                            updates: {
                                status: 'failed',
                                completedAt: stepEndTime,
                                duration: new Date(stepEndTime).getTime() - new Date(stepStartTime).getTime(),
                                error: {
                                    message: error.message,
                                    stack: error.stack,
                                },
                            },
                        },
                    });
                    await executionStateService.persistState(executionId, db);
                    nodeExecutionCounter.labels(nodeTypeLabel, 'failed').inc();
                    nodeExecutionDuration.observe({ nodeType: nodeTypeLabel, status: 'failed' }, stepDurationSeconds);
                    return; // Stop execution
                }
                throw error; // Re-throw other errors for retry logic
            }

            // 6. Update step with result
            const stepEndTime = new Date().toISOString();
            const stepStatus = result.status === 'failed' ? 'failed' :
                              result.status === 'suspended' ? 'suspended' : 'completed';
            const stepDurationSeconds = stepStartTime
                ? (new Date(stepEndTime).getTime() - new Date(stepStartTime).getTime()) / 1000
                : 0;

            await executionStateService.updateState(executionId, {
                removeActiveNode: nodeId,
                completedNode: nodeId,
                updateStep: {
                    nodeId,
                    updates: {
                        status: stepStatus,
                        output: result.output,
                        completedAt: stepEndTime,
                        duration: new Date(stepEndTime).getTime() - new Date(stepStartTime).getTime(),
                    },
                },
                status: result.status === 'failed' ? 'failed' : currentState.status,
            });

            nodeExecutionCounter.labels(nodeTypeLabel, stepStatus).inc();
            nodeExecutionDuration.observe({ nodeType: nodeTypeLabel, status: stepStatus }, stepDurationSeconds);

            // 6. Handle result based on status
            if (result.status === 'suspended') {
                // Check if this is a WaitNode (has resumeAfter) or a client node
                if (result.output?.resumeAfter) {
                    // WaitNode: enqueue delayed job
                    await this.enqueueDelayedResume(workflowId, executionId, nodeId, result.output);
                } else {
                    // Client node: suspend execution and wait for resume request
                    jobLogger.info('Execution suspended - awaiting client interaction');
                    await executionStateService.updateState(executionId, {
                        status: 'suspended',
                        addActiveNode: nodeId, // Re-add as active (waiting)
                    });
                    await executionStateService.persistState(executionId, db);
                    // Don't enqueue children - wait for resume
                    // Return early - don't check for completion when suspended
                    return result.output;
                }
            } else if (result.status === 'completed') {
                // Normal node: enqueue children immediately
                await this.enqueueChildren(workflowId, executionId, nodeId, result.output);
            }

            // 7. Check if workflow is complete (only for non-suspended nodes)
            // Skip completion check ONLY if this exact node was just resumed (not descendants)
            // Check if _resumedAt was added in THIS execution, not propagated from parent
            const updatedState = await executionStateService.getState(executionId);
            const nodeStep = updatedState?.stepsByNodeId?.[nodeId];

            // Only skip if this node's result has _resumedAt AND it was added by the resume operation
            // (check if it's in the node's own step result, not just propagated in output)
            const wasDirectlyResumed = nodeStep?.output?._resumedAt !== undefined &&
                result.output?._resumedAt === nodeStep.output._resumedAt;

            if (!wasDirectlyResumed) {
                const isComplete = await this.isWorkflowComplete(executionId, workflowId);
                if (isComplete) {
                    // Mark complete and persist to DB
                    await executionStateService.updateState(executionId, {
                        status: 'completed',
                        activeNodes: [], // Clear all active nodes
                    });
                    await executionStateService.persistState(executionId, db);
                    jobLogger.info('Workflow execution completed and persisted to database');
                }
            } else {
                jobLogger.debug('Skipping completion check for resumed node - children still processing');
            }

            return result.output;

        } catch (error: any) {
            jobLogger.error({ 
                error: error.message, 
                stack: error.stack,
                attempt,
                maxAttempts 
            }, 'Error executing node');

            const errorStatus = attempt >= maxAttempts ? 'failed' : 'retrying';
            if (stepStartTime) {
                const errorDurationSeconds = (Date.now() - new Date(stepStartTime).getTime()) / 1000;
                nodeExecutionDuration.observe({ nodeType: nodeTypeLabel, status: errorStatus }, errorDurationSeconds);
            }
            nodeExecutionCounter.labels(nodeTypeLabel, errorStatus).inc();

            const errorDetails = {
                message: error.message || String(error),
                stack: error.stack,
                nodeId,
                attempt,
                timestamp: new Date().toISOString(),
            };

            // Check if this is the final attempt
            if (attempt >= maxAttempts) {
                jobLogger.error({ errorDetails }, 'Max retries reached - marking execution as failed');

                // Mark as permanently failed
                const failedStepEndTime = new Date().toISOString();
                await executionStateService.updateState(executionId, {
                    status: 'failed',
                    removeActiveNode: nodeId,
                    updateStep: {
                        nodeId,
                        updates: {
                            status: 'failed',
                            completedAt: failedStepEndTime,
                            error: errorDetails,
                        },
                    },
                });
                await executionStateService.persistState(executionId, db);

                // Don't re-throw - prevents further retries
                return;
            }

            // Store error for this attempt but allow retry
            await executionStateService.updateState(executionId, {
                updateStep: {
                    nodeId,
                    updates: {
                        error: { ...errorDetails, retrying: true },
                    },
                },
            });

            throw error; // Re-throw for BullMQ retry
        }
    }

    /**
     * Get incoming edges for a node
     */
    private getIncomingEdges(nodeId: string, edges: any[]): any[] {
        return edges.filter((e: any) => e.target === nodeId);
    }

    /**
     * Check if all inputs are ready for a node with multiple incoming edges
     */
    private async areAllInputsReady(
        executionId: number,
        nodeId: string,
        edges: any[]
    ): Promise<boolean> {
        const incomingEdges = this.getIncomingEdges(nodeId, edges);

        // If there are 0 or 1 incoming edges, no need to wait
        if (incomingEdges.length <= 1) {
            return true;
        }

        // Check if all source nodes have completed
        const state = await executionStateService.getState(executionId);
        if (!state) return false;

        return incomingEdges.every((edge: any) => {
            return state.completedNodes.includes(edge.source);
        });
    }

    private async isWorkflowComplete(executionId: number, workflowId: number): Promise<boolean> {
        const state = await executionStateService.getState(executionId);
        if (!state) return false;

        // Load workflow to check for remaining edges
        const workflow = await db.query.workflows.findFirst({
            where: eq(workflows.id, workflowId),
        });

        if (!workflow) return false;

        const edges = workflow.edges as any[];

        // Check if there are any executable edges remaining
        // An edge is executable if:
        // 1. Its source node has been completed
        // 2. Its target node hasn't been completed yet
        // 3. If the source node has condition results, the edge condition matches
        for (const completedNodeId of state.completedNodes) {
            const outgoingEdges = edges.filter((e: any) => e.source === completedNodeId);

            for (const edge of outgoingEdges) {
                // Skip if target already completed
                if (state.completedNodes.includes(edge.target)) continue;

                // Check if this edge should be followed based on condition
                const nodeStep = state.stepsByNodeId?.[completedNodeId];
                if (nodeStep?.output?.result !== undefined) {
                    // If edge has no condition property, skip it
                    if (!edge.condition) continue;

                    // Convert edge condition to boolean
                    const edgeCondition = edge.condition === 'true' || edge.condition === true;

                    // Only follow if condition matches
                    if (edgeCondition !== nodeStep.output.result) continue;
                }

                // Found an executable edge - workflow is not complete
                return false;
            }
        }

        // No executable edges found - workflow is complete
        return true;
    }

    async enqueueChildren(workflowId: number, executionId: number, parentNodeId: string, output: any) {
        const workflow = await db.query.workflows.findFirst({
            where: eq(workflows.id, workflowId),
        });

        if (!workflow) return;

        const edges = workflow.edges as any[];
        let childEdges = edges.filter((e: any) => e.source === parentNodeId);

        // Filter edges based on condition results ONLY if this is a condition node
        // Check if the parent node is a condition node by looking it up
        const nodes = workflow.nodes as any[];
        const parentNode = nodes.find((n: any) => n.id === parentNodeId);
        const isConditionNode = parentNode?.type === 'condition';

        if (isConditionNode && output.result !== undefined) {
            const conditionResult = output.result;
            childEdges = childEdges.filter((e: any) => {
                // If edge has no condition property, skip it (it won't be followed after a condition node)
                if (!e.condition) return false;

                // Convert edge condition to boolean
                const edgeCondition = e.condition === 'true' || e.condition === true;

                // Include edge if its condition matches the result
                return edgeCondition === conditionResult;
            });

            logger.debug({ conditionResult, edgeCount: childEdges.length, parentNodeId }, 'Filtered edges based on condition result');
        }

        const { Queue } = await import('bullmq');
        const nodeQueue = new Queue(QUEUE_NAME, { connection: redisConnection });

        // Get state to build merged input from all previous steps
        const state = await executionStateService.getState(executionId);
        if (!state) throw new Error(`Execution state not found: ${executionId}`);

        // Build input from all completed steps (for accessing previous node outputs)
        const mergedInput = (state.steps || []).reduce((acc, step) => {
            return { ...acc, ...step.output };
        }, {});

        for (const edge of childEdges) {
            // Check if the target node requires multiple inputs
            const allInputsReady = await this.areAllInputsReady(executionId, edge.target, edges);

            if (!allInputsReady) {
                logger.debug(
                    { targetNodeId: edge.target, executionId, workflowId },
                    'Node has multiple inputs - waiting for other inputs to complete'
                );
                continue; // Skip enqueuing - another parent will enqueue when ready
            }

            await nodeQueue.add('execute-node', {
                executionId,
                nodeId: edge.target,
                workflowId,
                input: mergedInput, // Pass merged outputs as input to child
                attempt: 1,
            }, {
                jobId: `exec-${executionId}-node-${edge.target}`,
            });
            logger.debug({ targetNodeId: edge.target, executionId, workflowId }, 'Enqueued child node');
        }

        await nodeQueue.close();
    }

    /**
     * Enqueue delayed resume job for WaitNode
     */
    async enqueueDelayedResume(workflowId: number, executionId: number, nodeId: string, output: any) {
        const { resumeAfter } = output;
        if (!resumeAfter) {
            throw new Error('WaitNode output missing resumeAfter');
        }

        // Calculate delay in milliseconds
        const { amount, unit } = resumeAfter;
        let delayMs = 0;

        switch (unit) {
            case 'seconds':
                delayMs = amount * 1000;
                break;
            case 'minutes':
                delayMs = amount * 60 * 1000;
                break;
            case 'hours':
                delayMs = amount * 60 * 60 * 1000;
                break;
            case 'days':
                delayMs = amount * 24 * 60 * 60 * 1000;
                break;
            default:
                delayMs = amount * 1000; // Default to seconds
        }

        logger.info({ amount, unit, delayMs, executionId, nodeId }, 'Scheduling delayed resume');

        // Get child nodes
        const workflow = await db.query.workflows.findFirst({
            where: eq(workflows.id, workflowId),
        });

        if (!workflow) return;

        const edges = workflow.edges as any[];
        const childEdges = edges.filter((e: any) => e.source === nodeId);

        // Enqueue delayed job in scheduled-resume-queue
        const scheduledQueue = getScheduledQueue();

        await scheduledQueue.add('resume-execution', {
            executionId,
            nodeId,
            nextNodes: childEdges.map((e: any) => ({
                nodeId: e.target,
                workflowId,
                input: output,
            })),
        }, {
            delay: delayMs,
            jobId: `scheduled-${executionId}-${nodeId}-${Date.now()}`,
        });

        logger.info({ executionId, nodeId, delayMs, nextNodeCount: childEdges.length }, 'Scheduled resume job');
    }

    /**
     * Build execution context passed into node executors.
     * Includes prior step results to enable nodes to read past outputs.
     */
    private buildExecutionContext({
        workflowId,
        executionId,
        input,
        state,
        workflow,
    }: {
        workflowId: number;
        executionId: number;
        input: any;
        state: ExecutionState;
        workflow?: any;
    }): ExecutionContext {
        const results: Record<string, NodeExecutionResult> = {};

        Object.values(state?.stepsByNodeId || {}).forEach((step) => {
            const normalizedStatus: NodeExecutionResult['status'] =
                step.status === 'failed'
                    ? 'failed'
                    : step.status === 'suspended'
                        ? 'suspended'
                        : 'success';

            results[step.nodeId] = {
                status: normalizedStatus,
                output: step.output,
                error: step.error?.message,
            };
        });

        return {
            workflowId,
            executionId,
            input,
            results,
            steps: state?.steps || [],
            workflow: workflow ? {
                nodes: workflow.nodes || [],
                edges: workflow.edges || []
            } : undefined,
        };
    }
}
