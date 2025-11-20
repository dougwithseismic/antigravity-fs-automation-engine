import 'dotenv/config';
import { Worker } from 'bullmq';
import { redisConnection } from './config/redis';
import { WorkflowWorker } from './workers/workflow-worker';
import { NodeWorker } from './workers/node-worker';
import { SchedulerWorker } from './workers/scheduler-worker';
import { createLogger } from '@repo/logger';

const logger = createLogger({ name: 'worker' });

async function main() {
    logger.info('Starting Antigravity Worker');

    // Initialize workers
    const workflowWorker = new WorkflowWorker();
    const nodeWorker = new NodeWorker();
    const schedulerWorker = new SchedulerWorker();

    logger.info({
        workers: [
            'WorkflowWorker (workflow-execution-queue)',
            'NodeWorker (node-execution-queue)',
            'SchedulerWorker (scheduled-resume-queue)'
        ]
    }, 'Workers initialized successfully');

    logger.info('Ready to process jobs');

    // Graceful shutdown handler
    process.on('SIGTERM', async () => {
        logger.info('SIGTERM received, initiating graceful shutdown');
        // TODO: Add proper graceful shutdown logic (close workers, wait for active jobs)
        process.exit(0);
    });

    process.on('SIGINT', async () => {
        logger.info('SIGINT received, initiating graceful shutdown');
        process.exit(0);
    });
}

main().catch((error) => {
    logger.fatal({ error: error.message, stack: error.stack }, 'Failed to start worker');
    process.exit(1);
});

