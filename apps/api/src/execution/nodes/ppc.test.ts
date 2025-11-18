import { describe, it, expect } from 'vitest';
import { ConditionNodeExecutor, AnalyticsNodeExecutor, DiscountNodeExecutor } from './ppc';
import { ExecutionContext } from '../types';

describe('PPC Nodes', () => {
    it('ConditionNode should return true when match', async () => {
        const executor = new ConditionNodeExecutor();
        const node = {
            id: '1',
            type: 'condition',
            data: { condition: { key: 'utm_source', value: 'ppc' } },
            position: { x: 0, y: 0 },
            environment: 'server' as const
        };
        const input = { query: { utm_source: 'ppc' } };
        const context: ExecutionContext = {
            workflowId: 1,
            executionId: 1,
            input,
            results: {}
        };

        const result = await executor.execute({ node, input, context });
        expect(result.status).toBe('success');
        expect(result.output).toEqual({ result: true });
    });

    it('ConditionNode should return false when no match', async () => {
        const executor = new ConditionNodeExecutor();
        const node = {
            id: '1',
            type: 'condition',
            data: { condition: { key: 'utm_source', value: 'ppc' } },
            position: { x: 0, y: 0 },
            environment: 'server' as const
        };
        const input = { query: { utm_source: 'organic' } };
        const context: ExecutionContext = {
            workflowId: 1,
            executionId: 1,
            input,
            results: {}
        };

        const result = await executor.execute({ node, input, context });
        expect(result.status).toBe('success');
        expect(result.output).toEqual({ result: false });
    });

    it('DiscountNode should return a code', async () => {
        const executor = new DiscountNodeExecutor();
        const node = {
            id: '1',
            type: 'discount',
            data: {},
            position: { x: 0, y: 0 },
            environment: 'server' as const
        };
        const input = {};
        const context: ExecutionContext = {
            workflowId: 1,
            executionId: 1,
            input,
            results: {}
        };

        const result = await executor.execute({ node, input, context });
        expect(result.status).toBe('success');
        expect(result.output).toHaveProperty('code');
    });
});
