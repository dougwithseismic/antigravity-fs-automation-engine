import { describe, it, expect } from 'vitest';
import { SwitchNode } from './SwitchNode';
import { NodeExecutionArgs } from '@repo/types';

describe('SwitchNode', () => {
    it('should execute successfully', async () => {
        const node = new SwitchNode();
        const args: NodeExecutionArgs = {
            node: {
                id: 'test-node',
                type: 'switch',
                position: { x: 0, y: 0 },
                data: {}
            },
            input: {
                rules: [{ condition: 'true' }],
                foo: 'bar'
            },
            context: {
                workflowId: 1,
                executionId: 1,
                input: {},
                results: {}
            }
        };

        const result = await node.execute(args);

        expect(result.status).toBe('success');
        expect(result.output).toEqual({
            routeIndex: 0,
            route: 0,
            matchedRule: { condition: 'true' },
            value: undefined
        });
    });
});
