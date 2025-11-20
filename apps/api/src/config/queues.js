"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNodeQueue = exports.getWorkflowQueue = exports.defaultQueueOptions = exports.NODE_EXECUTION_QUEUE = exports.WORKFLOW_EXECUTION_QUEUE = void 0;
const bullmq_1 = require("bullmq");
const redis_1 = require("./redis");
exports.WORKFLOW_EXECUTION_QUEUE = 'workflow-execution-queue';
exports.NODE_EXECUTION_QUEUE = 'node-execution-queue';
exports.defaultQueueOptions = {
    connection: redis_1.redisConnection,
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
let workflowQueue = null;
let nodeQueue = null;
const getWorkflowQueue = () => {
    if (!workflowQueue) {
        workflowQueue = new bullmq_1.Queue(exports.WORKFLOW_EXECUTION_QUEUE, exports.defaultQueueOptions);
    }
    return workflowQueue;
};
exports.getWorkflowQueue = getWorkflowQueue;
const getNodeQueue = () => {
    if (!nodeQueue) {
        nodeQueue = new bullmq_1.Queue(exports.NODE_EXECUTION_QUEUE, exports.defaultQueueOptions);
    }
    return nodeQueue;
};
exports.getNodeQueue = getNodeQueue;
