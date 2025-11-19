import { describe, it, expect } from 'vitest';
import { WaitNode } from './WaitNode';
import { NodeExecutionArgs } from '@repo/types';

describe('WaitNode', () => {
    it('should execute successfully', async () => {
        const node = new WaitNode();
        const args: NodeExecutionArgs = {
            node: {
                id: 'test-node',
                type: 'wait',
                position: { x: 0, y: 0 },
                data: {}
            },
            input: { amount: 5, unit: 'seconds' },
            context: {
                workflowId: 1,
                executionId: 1,
                input: {},
                results: {}
            }
        };

        const result = await node.execute(args);

        expect(result.status).toBe('suspended');
        expect(result.output).toEqual({
            resumeAfter: { amount: 5, unit: 'seconds' }
        });
    });
});
