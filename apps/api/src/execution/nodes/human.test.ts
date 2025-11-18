import { describe, it, expect } from 'vitest';
import { HumanApprovalNodeExecutor } from './human';
import { WorkflowNode, ExecutionContext } from '../types';

describe('HumanApprovalNode', () => {
    it('should return suspended status when executed normally', async () => {
        const executor = new HumanApprovalNodeExecutor();
        const node: WorkflowNode = {
            id: '1',
            type: 'human-approval',
            position: { x: 0, y: 0 },
            data: { label: 'Approval' }
        };
        const context: ExecutionContext = {
            workflowId: 1,
            executionId: 1,
            input: {},
            results: {}
        };

        const result = await executor.execute({ node, input: { some: 'input' }, context });

        expect(result.status).toBe('suspended');
        expect(result.output).toBeUndefined();
    });

    // Note: The resumption logic is handled by the engine passing the resume payload as input
    // or we might need a specific flag in context if we want to differentiate.
    // For now, the engine's resumeExecution updates the step output directly.
    // But if the node is re-executed (which it isn't in the current engine design for resume),
    // we might need to handle it.
    // In the current design:
    // 1. Engine runs -> Node returns suspended.
    // 2. User calls API -> Updates step output in DB -> Engine continues from *children*.
    // So the node itself is NOT re-executed upon resume.
    // Therefore, this single test case is sufficient for the node's execute method.
});
