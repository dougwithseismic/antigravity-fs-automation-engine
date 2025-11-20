export interface WorkflowEdge {
    id?: string;
    source: string;
    target: string;
    sourceHandle?: string;
    targetHandle?: string;
    data?: {
        condition?: 'true' | 'false' | string;
        [key: string]: any;
    };
}

export type {
    WorkflowNode,
    NodeExecutionResult,
    ExecutionContext,
    NodeExecutionArgs,
    NodeExecutor
} from '@repo/types';
