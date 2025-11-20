import { db } from '@repo/database';
import { executions, executionSteps, workflows } from '@repo/database/schema';
import { eq, desc } from 'drizzle-orm';
import Redis from 'ioredis';

// Import ExecutionStateService from worker
// Since we can't import from worker directly, we'll recreate the Redis access
const redis = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
    db: parseInt(process.env.REDIS_DB || '0'),
});

interface ExecutionStep {
    nodeId: string;
    nodeType: string;
    status: string;
    output: Record<string, any>;
    startedAt: string;
    completedAt?: string;
    duration?: number;
    error?: { message: string; stack?: string };
}

interface ExecutionState {
    executionId: number;
    workflowId: number;
    status: string;
    completedNodes: string[];
    currentNode?: string | null;
    steps: ExecutionStep[];
    stepsByNodeId: Record<string, ExecutionStep>;
    variables: Record<string, any>;
    startedAt: string;
    updatedAt: string;
}

export class ExecutionService {
    /**
     * Get execution with Redis state
     */
    async getExecutionWithState(executionId: number) {
        // Get from DB
        const execution = await db.query.executions.findFirst({
            where: eq(executions.id, executionId),
        });

        if (!execution) {
            return null;
        }

        // Get Redis state
        const stateKey = `exec:${executionId}:state`;
        const stateJson = await redis.get(stateKey);
        const state: ExecutionState | null = stateJson ? JSON.parse(stateJson) : null;

        return {
            ...execution,
            // Add Redis state if available
            completedNodes: state?.completedNodes || [],
            currentNode: state?.currentNode || null,
            steps: state?.steps || [],
            variables: state?.variables || {},
            liveState: !!state, // Indicates if Redis state is available
        };
    }

    /**
     * Get quick status (Redis only)
     */
    async getExecutionStatus(executionId: number, workflowId?: number) {
        const stateKey = `exec:${executionId}:state`;
        const stateJson = await redis.get(stateKey);

        if (!stateJson) {
            // Fallback to DB
            const execution = await db.query.executions.findFirst({
                where: eq(executions.id, executionId),
            });

            return execution ? {
                status: execution.status,
                completedNodes: 0,
                totalNodes: 0,
                currentNode: null,
                progress: execution.status === 'completed' ? 100 : 0,
            } : null;
        }

        const state: ExecutionState = JSON.parse(stateJson);

        // Get total nodes from workflow if workflowId provided
        let totalNodes = 0;
        if (workflowId || state.workflowId) {
            const workflow = await db.query.workflows.findFirst({
                where: eq(workflows.id, workflowId || state.workflowId),
            });
            totalNodes = (workflow?.nodes as any[])?.length || 0;
        }

        return {
            status: state.status,
            completedNodes: state.completedNodes.length,
            totalNodes,
            currentNode: state.currentNode,
            progress: totalNodes > 0 ? Math.round((state.completedNodes.length / totalNodes) * 100) : 0,
        };
    }

    /**
     * Cancel execution
     */
    async cancelExecution(executionId: number) {
        // Update Redis state to cancelled
        const stateKey = `exec:${executionId}:state`;
        const stateJson = await redis.get(stateKey);

        if (stateJson) {
            const state: ExecutionState = JSON.parse(stateJson);
            state.status = 'cancelled';
            state.updatedAt = new Date().toISOString();
            await redis.set(stateKey, JSON.stringify(state));
        }

        // Update DB
        await db.update(executions)
            .set({
                status: 'failed', // Use 'failed' for now, can add 'cancelled' to schema later
                finishedAt: new Date(),
            })
            .where(eq(executions.id, executionId));

        // TODO: Remove pending jobs from BullMQ queues
        // This requires importing Queue and removing jobs by pattern

        return { success: true, executionId };
    }

    /**
     * Retry failed execution
     */
    async retryExecution(executionId: number) {
        const execution = await db.query.executions.findFirst({
            where: eq(executions.id, executionId),
        });

        if (!execution) {
            throw new Error('Execution not found');
        }

        if (execution.status !== 'failed') {
            throw new Error('Can only retry failed executions');
        }

        // Get workflow to find failed node
        const workflow = await db.query.workflows.findFirst({
            where: (workflows, { eq }) => eq(workflows.id, execution.workflowId!),
        });

        if (!workflow) {
            throw new Error('Workflow not found');
        }

        // Clear Redis state and reset
        const stateKey = `exec:${executionId}:state`;
        await redis.del(stateKey);

        // Re-initialize state
        const initialState = {
            executionId,
            workflowId: execution.workflowId,
            status: 'running',
            completedNodes: [],
            activeNodes: [],
            steps: [],
            stepsByNodeId: {},
            variables: {},
            startedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        await redis.set(stateKey, JSON.stringify(initialState), 'EX', 60 * 60 * 24 * 30);

        // Update DB
        await db.update(executions)
            .set({
                status: 'running',
                finishedAt: null,
            })
            .where(eq(executions.id, executionId));

        // Re-enqueue workflow (will start from beginning)
        const { Queue } = await import('bullmq');
        const { redisConnection } = await import('../../../worker/src/config/redis');
        const workflowQueue = new Queue('workflow-execution-queue', { connection: redisConnection });

        await workflowQueue.add('start-workflow', {
            workflowId: execution.workflowId,
            executionId,
            input: execution.data || {},
        });

        await workflowQueue.close();

        return { success: true, executionId };
    }

    /**
     * List executions with filters
     */
    async listExecutions(filters: {
        workflowId?: number;
        status?: string;
        limit?: number;
        offset?: number;
    }) {
        const { workflowId, status, limit = 20, offset = 0 } = filters;

        let query = db.select().from(executions);

        if (workflowId) {
            query = query.where(eq(executions.workflowId, workflowId)) as any;
        }

        if (status) {
            query = query.where(eq(executions.status, status as any)) as any;
        }

        const results = await query
            .orderBy(desc(executions.startedAt))
            .limit(limit)
            .offset(offset);

        return results;
    }
}

export const executionService = new ExecutionService();
