import { Queue, QueueOptions } from 'bullmq';
import { redisConnection } from './redis';

export const WORKFLOW_EXECUTION_QUEUE = 'workflow-execution-queue';
export const NODE_EXECUTION_QUEUE = 'node-execution-queue';

export const defaultQueueOptions: QueueOptions = {
    connection: redisConnection,
    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: 'exponential',
            delay: 1000,
        },
        removeOnComplete: {
            age: 24 * 3600, // Keep for 24 hours
            count: 1000,
        },
        removeOnFail: {
            age: 7 * 24 * 3600, // Keep for 7 days
        },
    },
};

// Singleton queue instances for API
let workflowQueue: Queue | null = null;
let nodeQueue: Queue | null = null;

export const getWorkflowQueue = () => {
    if (!workflowQueue) {
        workflowQueue = new Queue(WORKFLOW_EXECUTION_QUEUE, defaultQueueOptions);
    }
    return workflowQueue;
};

export const getNodeQueue = () => {
    if (!nodeQueue) {
        nodeQueue = new Queue(NODE_EXECUTION_QUEUE, defaultQueueOptions);
    }
    return nodeQueue;
};
