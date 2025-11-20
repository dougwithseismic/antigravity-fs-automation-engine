import { describe, it, expect } from 'vitest';
import { PipedreamActionNode } from './PipedreamActionNode';
import { NodeExecutionArgs } from '@repo/types';

const baseArgs: NodeExecutionArgs = {
    node: {
        id: 'pd1',
        type: 'pipedream-action',
        position: { x: 0, y: 0 },
        data: {
            componentId: '@pipedreams/slack',
            actionName: 'send_message',
            connectionId: 'conn_test',
            payload: { text: 'hello' },
        },
    },
    input: {},
    context: {
        workflowId: 10,
        executionId: 20,
        input: {},
        results: {},
    },
};

describe('PipedreamActionNode', () => {
    it('returns mocked response using configured data', async () => {
        const node = new PipedreamActionNode();
        const result = await node.execute(baseArgs);

        expect(result.status).toBe('success');
        expect(result.output?.response?.mocked).toBe(true);
        expect(result.output?.componentId).toBe('@pipedreams/slack');
        expect(result.output?.actionName).toBe('send_message');
        expect(result.output?.connectionId).toBe('conn_test');
        expect(result.output?.workflowId).toBe(10);
        expect(result.output?.executionId).toBe(20);
    });

    it('fails when required identifiers are missing', async () => {
        const node = new PipedreamActionNode();
        const args: NodeExecutionArgs = {
            ...baseArgs,
            node: { ...baseArgs.node, data: {} },
        };

        const result = await node.execute(args);
        expect(result.status).toBe('failed');
        expect(result.error).toBeTruthy();
    });
});
