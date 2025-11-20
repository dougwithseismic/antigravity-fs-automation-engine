import { describe, it, expect } from 'vitest';
import { HumanApprovalNode } from './HumanApprovalNode';
import { NodeExecutionArgs } from '@repo/types';

const baseArgs: NodeExecutionArgs = {
    node: {
        id: 'human1',
        type: 'human-approval',
        position: { x: 0, y: 0 },
        data: {
            prompt: 'Approve this change?',
        },
    },
    input: {},
    context: {
        workflowId: 1,
        executionId: 2,
        input: {},
        results: {},
    },
};

describe('HumanApprovalNode', () => {
    it('suspends execution with approval metadata', async () => {
        const node = new HumanApprovalNode();
        const result = await node.execute(baseArgs);

        expect(result.status).toBe('suspended');
        expect(result.output?.approvalTaskId).toBeDefined();
        expect(result.output?.resumeToken).toBeDefined();
        expect(result.output?.channel).toBe('slack');
        expect(result.output?.prompt).toBe('Approve this change?');
        expect(result.output?.workflowId).toBe(1);
        expect(result.output?.executionId).toBe(2);
    });

    it('respects input overrides', async () => {
        const node = new HumanApprovalNode();
        const args: NodeExecutionArgs = {
            ...baseArgs,
            input: {
                prompt: 'Please review this deployment',
                channel: 'email',
                timeoutSeconds: 120,
            },
        };

        const result = await node.execute(args);

        expect(result.output?.channel).toBe('email');
        expect(result.output?.prompt).toBe('Please review this deployment');
        expect(result.output?.timeoutSeconds).toBe(120);
    });
});
