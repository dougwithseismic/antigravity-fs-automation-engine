import { Queue, QueueOptions } from 'bullmq';
export declare const WORKFLOW_EXECUTION_QUEUE = "workflow-execution-queue";
export declare const NODE_EXECUTION_QUEUE = "node-execution-queue";
export declare const defaultQueueOptions: QueueOptions;
export declare const getWorkflowQueue: () => Queue<any, any, string, any, any, string>;
export declare const getNodeQueue: () => Queue<any, any, string, any, any, string>;
//# sourceMappingURL=queues.d.ts.map