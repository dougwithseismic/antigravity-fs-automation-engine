import { describe, it, expect } from 'vitest';
import { CodeNode } from './CodeNode';
import { NodeExecutionArgs } from '@repo/types';

describe('CodeNode', () => {
    it('should execute successfully', async () => {
        const node = new CodeNode();
        const args: NodeExecutionArgs = {
            node: {
                id: 'test-node',
                type: 'code',
                position: { x: 0, y: 0 },
                data: {}
            },
            input: { code: 'return 1 + 1;' },
            context: {
                workflowId: 1,
                executionId: 1,
                input: {},
                results: {}
            }
        };

        const result = await node.execute(args);

        if (result.status === 'failed') {
            console.error('CodeNode failed:', result.error);
        }
        expect(result.status).toBe('success');
        expect(result.output).toBe(2);
    });
});
