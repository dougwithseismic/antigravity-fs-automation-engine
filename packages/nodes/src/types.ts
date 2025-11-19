import { NodeExecutor, NodeExecutionArgs, NodeExecutionResult } from '@repo/types';

export interface AntigravityNode extends NodeExecutor {
    name: string;
    displayName: string;
    description: string;
    version: number;
    defaults?: Record<string, any>;
    inputs?: string[];
    outputs?: string[];

    execute(args: NodeExecutionArgs): Promise<NodeExecutionResult>;
}
