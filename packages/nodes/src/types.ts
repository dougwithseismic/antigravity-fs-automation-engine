import { NodeExecutor, NodeExecutionArgs, NodeExecutionResult } from '@repo/types';
export { NodeExecutor, NodeExecutionArgs, NodeExecutionResult };

export type ExecutionEnvironment = 'server' | 'client';

export interface NodeRetryConfig {
    /** Number of retry attempts (default: 3) */
    attempts?: number;
    /** Backoff strategy */
    backoff?: {
        type: 'fixed' | 'exponential';
        /** Initial delay in milliseconds (default: 1000) */
        delay?: number;
    };
}

export interface NodeInputDefinition {
    id: string;
    label: string;
    description?: string;
    type: 'text' | 'select' | 'textarea' | 'password';
    defaultValue?: any;
    placeholder?: string;
    options?: string[];
    required?: boolean;
    connection?: {
        enabled: boolean;
        type?: string; // e.g., 'string', 'number', 'json', 'credentials.env'
    };
}

export interface NodeOutputDefinition {
    id: string;
    label: string;
    type: string; // e.g., 'string', 'credentials.env', 'json'
}

export interface AntigravityNode extends NodeExecutor {
    name: string;
    displayName: string;
    description: string;
    version: number;
    environment?: ExecutionEnvironment; // Where this node executes
    retry?: NodeRetryConfig; // Retry configuration for this node type
    defaults?: Record<string, any>;
    inputs?: string[];
    outputs?: string[];
    ui?: {
        icon?: string;
        inputs?: NodeInputDefinition[];
        outputs?: NodeOutputDefinition[];
    };

    execute(args: NodeExecutionArgs): Promise<NodeExecutionResult>;
}
