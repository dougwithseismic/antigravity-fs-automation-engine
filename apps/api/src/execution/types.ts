
export interface WorkflowNode {
    id: string;
    type: string;
    position: { x: number; y: number };
    data: Record<string, any>;
    environment?: 'server' | 'client'; // Default to 'server' if undefined
}

export interface WorkflowEdge {
    id: string;
    source: string;
    target: string;
    sourceHandle?: string | null;
    targetHandle?: string | null;
}

export interface NodeExecutionResult {
    status: 'success' | 'failed' | 'skipped' | 'suspended';
    output?: any;
    error?: string;
}

export interface ExecutionContext {
    workflowId: number;
    executionId: number;
    input: any;
    results: Record<string, NodeExecutionResult>;
}

export type NodeExecutionArgs = {
    node: WorkflowNode;
    input: any;
    context: ExecutionContext;
    signal?: AbortSignal;
};

export interface NodeExecutor {
    execute(args: NodeExecutionArgs): Promise<NodeExecutionResult>;
}
