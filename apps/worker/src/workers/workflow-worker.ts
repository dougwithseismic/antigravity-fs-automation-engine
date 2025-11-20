import { Worker, Job } from 'bullmq';
import { redisConnection } from '../config/redis';
import { WORKFLOW_EXECUTION_QUEUE, getNodeQueue } from '../config/queues';
import { createLogger, withExecutionContext } from '@repo/logger';

const QUEUE_NAME = 'workflow-execution-queue';

import { db } from '@repo/database';
import { workflows, executions, executionSteps } from '@repo/database/schema';
import { eq } from 'drizzle-orm';
import { executionStateService } from '../services/execution-state';

const logger = createLogger({ name: 'workflow-worker' });

export class WorkflowWorker {
    private worker: Worker;

    constructor() {
        this.worker = new Worker(QUEUE_NAME, this.processJob.bind(this), {
            connection: redisConnection,
            concurrency: 5,
        });

        this.worker.on('completed', (job) => {
            logger.info({ jobId: job.id, executionId: job.data.executionId, workflowId: job.data.workflowId }, 'Workflow job completed');
        });

        this.worker.on('failed', (job, err) => {
            logger.error({ 
                jobId: job?.id, 
                executionId: job?.data?.executionId, 
                workflowId: job?.data?.workflowId,
                error: err.message,
                stack: err.stack 
            }, 'Workflow job failed');
        });
    }

    async processJob(job: Job) {
        const { workflowId, executionId, input, userId } = job.data;
        
        const jobLogger = withExecutionContext(logger, {
            executionId,
            workflowId,
            userId,
            jobId: job.id,
        });

        jobLogger.info('Processing workflow execution');

        // 1. Load workflow definition
        const workflow = await db.query.workflows.findFirst({
            where: eq(workflows.id, workflowId),
        });

        if (!workflow) {
            throw new Error(`Workflow ${workflowId} not found`);
        }

        // 2. Parse nodes and edges
        const nodes = workflow.nodes as any[];
        const edges = workflow.edges as any[];

        // 3. Find root nodes (nodes with no incoming edges)
        const targetNodeIds = new Set(edges.map((e: any) => e.target));
        const rootNodes = nodes.filter((n: any) => !targetNodeIds.has(n.id));

        if (rootNodes.length === 0) {
            jobLogger.warn('Workflow has no root nodes');
            return;
        }

        // 4. Initialize execution state in Redis
        await executionStateService.initState(executionId, workflowId);

        // 5. Update DB execution status to running (initial persist)
        await db.update(executions)
            .set({ status: 'running' })
            .where(eq(executions.id, executionId));

        // 5. Enqueue jobs for root nodes
        // We need a NodeQueue instance here.
        // Let's define the queue name locally for now.
        const NODE_QUEUE_NAME = 'node-execution-queue';
        const { Queue } = await import('bullmq');
        const nodeQueue = new Queue(NODE_QUEUE_NAME, { connection: redisConnection });

        for (const node of rootNodes) {
            await nodeQueue.add('execute-node', {
                executionId,
                nodeId: node.id,
                workflowId,
                input: input || {}, // Root nodes get the workflow input
                attempt: 1,
            }, {
                jobId: `exec-${executionId}-node-${node.id}`,
            });
            jobLogger.debug({ rootNodeId: node.id, rootNodeType: node.type }, 'Enqueued root node');
        }

        await nodeQueue.close();
    }
}
