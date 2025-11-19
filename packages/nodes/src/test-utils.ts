import { WorkflowNode, NodeExecutionArgs } from '@repo/types';

export function createMockNode(overrides: Partial<WorkflowNode> = {}): WorkflowNode {
    return {
        id: crypto.randomUUID(),
        type: 'test-node',
        position: { x: 0, y: 0 },
        data: {},
        ...overrides
    };
}

export function createMockContext(overrides: Partial<NodeExecutionArgs['context']> = {}): NodeExecutionArgs['context'] {
    return {
        workflowId: 123,
        executionId: 456,
        input: {},
        results: {},
        ...overrides
    };
}

export function createMockExecutionArgs(nodeOverrides: Partial<WorkflowNode> = {}, input: any = {}): NodeExecutionArgs {
    return {
        node: createMockNode(nodeOverrides),
        input,
        context: createMockContext(),
        signal: new AbortController().signal
    };
}
