import { Worker, Job } from 'bullmq';
import { redisConnection } from '../config/redis';
import { SCHEDULED_RESUME_QUEUE } from '../config/queues';
import { getNodeQueue } from '../config/queues';
import { createLogger, withExecutionContext } from '@repo/logger';

const logger = createLogger({ name: 'scheduler-worker' });

/**
 * SchedulerWorker processes delayed job resumptions
 * Handles WaitNode delays and scheduled workflow continuations
 */
export class SchedulerWorker {
    private worker: Worker;

    constructor() {
        this.worker = new Worker(SCHEDULED_RESUME_QUEUE, this.processJob.bind(this), {
            connection: redisConnection,
            concurrency: 3, // Lower concurrency for scheduled jobs
        });

        this.worker.on('completed', (job) => {
            logger.info({ jobId: job.id, executionId: job.data.executionId }, 'Scheduled job completed');
        });

        this.worker.on('failed', (job, err) => {
            logger.error({ 
                jobId: job?.id, 
                executionId: job?.data?.executionId,
                error: err.message,
                stack: err.stack 
            }, 'Scheduled job failed');
        });
    }

    async processJob(job: Job) {
        const { executionId, nodeId, nextNodes } = job.data;
        
        const jobLogger = withExecutionContext(logger, {
            executionId,
            nodeId,
            jobId: job.id,
        });

        jobLogger.info({ nextNodeCount: nextNodes?.length }, 'Resuming execution after delay');

        // Enqueue next nodes in node-execution-queue
        const nodeQueue = getNodeQueue();

        for (const nextNode of nextNodes) {
            await nodeQueue.add('execute-node', {
                executionId,
                nodeId: nextNode.nodeId,
                workflowId: nextNode.workflowId,
                input: nextNode.input || {},
                attempt: 1,
            }, {
                jobId: `exec-${executionId}-node-${nextNode.nodeId}`,
            });

            jobLogger.debug({ nextNodeId: nextNode.nodeId, workflowId: nextNode.workflowId }, 'Enqueued delayed node');
        }
    }
}
