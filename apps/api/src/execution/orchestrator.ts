import { getWorkflowQueue } from '../config/queues';
import { db } from '@repo/database';
import { executions, executionSteps, workflows } from '@repo/database/schema';
import { eq } from 'drizzle-orm';

export class WorkflowOrchestrator {
    /**
     * Starts a new workflow execution asynchronously
     */
    async startWorkflow(workflowId: number, input: any, userId?: number) {
        // Debug logging
        console.log('🔍 DATABASE_URL:', process.env.DATABASE_URL);
        console.log('🔍 Creating execution with userId:', userId);

        // 1. Create execution record in DB
        const [execution] = await db.insert(executions).values({
            workflowId,
            status: 'pending',
            startedAt: new Date(),
            data: input,
            userId,
        }).returning();

        if (!execution) {
            throw new Error('Failed to create execution record');
        }

        // 2. Enqueue job in workflow-execution-queue
        const queue = getWorkflowQueue();
        await queue.add('start-workflow', {
            workflowId,
            executionId: execution.id,
            input,
            userId,
        }, {
            jobId: `exec-${execution.id}`, // Deduplication
        });

        return execution;
    }

    /**
     * Resumes a suspended execution with client-provided data
     */
    async resumeExecution(executionId: number, clientData: any) {
        console.log('🔄 Resuming execution', executionId, 'with client data:', clientData);

        // 1. Get current execution state
        const execution = await db.query.executions.findFirst({
            where: eq(executions.id, executionId),
        });

        if (!execution) {
            throw new Error(`Execution ${executionId} not found`);
        }

        if (execution.status !== 'suspended' && execution.status !== 'waiting') {
            throw new Error(`Execution ${executionId} is not suspended (status: ${execution.status})`);
        }

        if (!execution.workflowId) {
            throw new Error(`Execution ${executionId} has no associated workflow`);
        }

        // 2. Get the current node from execution state
        // Note: activeNodes should contain the suspended node
        const { executionStateService } = await import('../../../worker/src/services/execution-state.js');
        const state = await executionStateService.getState(executionId);

        if (!state || state.activeNodes.length === 0) {
            throw new Error(`No active nodes found for execution ${executionId}`);
        }

        // For now, we assume the first active node is the one being resumed
        // In a more complex scenario, clientData should include nodeId
        const suspendedNodeId = state.activeNodes[0];

        if (!suspendedNodeId) {
            throw new Error(`No suspended node found in active nodes for execution ${executionId}`);
        }

        console.log(`Resuming from node ${suspendedNodeId}`);

        // 3. Get workflow to find children of the suspended node
        const workflow = await db.query.workflows.findFirst({
            where: eq(workflows.id, execution.workflowId),
        });

        if (!workflow) {
            throw new Error('Workflow not found');
        }

        // 4. Merge client data with the current node's output
        const currentNodeStep = state.stepsByNodeId?.[suspendedNodeId];
        const currentNodeResult = currentNodeStep?.output || {};
        const mergedOutput = {
            ...currentNodeResult,
            ...clientData,
            _resumedAt: new Date().toISOString()
        };

        // 5. Update state - mark suspended node as complete with merged data
        await executionStateService.updateState(executionId, {
            status: 'running',
            completedNode: suspendedNodeId,
            removeActiveNode: suspendedNodeId,
            updateStep: {
                nodeId: suspendedNodeId,
                updates: {
                    status: 'completed',
                    output: mergedOutput,
                    completedAt: new Date().toISOString(),
                },
            },
        });

        // 6. Update DB status to running
        console.log(`[EXEC-${executionId}] Status transition: ${execution.status} -> running`);
        await db.update(executions)
            .set({ status: 'running' })
            .where(eq(executions.id, executionId));

        // 7. Enqueue children of the suspended node
        const edges = workflow.edges as any[];
        const childEdges = edges.filter((e: any) => e.source === suspendedNodeId);

        const { getNodeQueue } = await import('../config/queues.js');
        const nodeQueue = getNodeQueue();

        for (const edge of childEdges) {
            await nodeQueue.add('execute-node', {
                executionId,
                nodeId: edge.target,
                workflowId: execution.workflowId,
                input: mergedOutput, // Pass merged data to children
                attempt: 1,
            }, {
                jobId: `exec-${executionId}-node-${edge.target}-resumed`,
            });
            console.log(`✅ Enqueued child node ${edge.target} with client data`);
        }

        return { status: 'resumed', message: `Execution ${executionId} resumed from node ${suspendedNodeId}` };
    }

    /**
     * Gets the current status of an execution
     */
    async getExecutionStatus(executionId: number) {
        const execution = await db.query.executions.findFirst({
            where: eq(executions.id, executionId),
            with: {
                steps: true,
            },
        });

        if (!execution) return null;

        // If running or suspended, try to get live state from Redis
        if (execution.status === 'running' || execution.status === 'suspended') {
            const { executionStateService } = await import('../../../worker/src/services/execution-state.js');
            const liveState = await executionStateService.getState(executionId);

            if (liveState) {
                return {
                    ...execution,
                    currentState: liveState, // Override stale DB state with live Redis state
                    // We can also merge completedNodes if needed, but currentState is the source of truth for the engine
                };
            }
        }

        return execution;
    }
}

export const orchestrator = new WorkflowOrchestrator();
