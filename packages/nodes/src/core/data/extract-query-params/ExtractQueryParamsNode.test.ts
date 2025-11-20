import { describe, it, expect } from 'vitest';
import { ExtractQueryParamsNode } from './ExtractQueryParamsNode';
import { createMockExecutionArgs } from '../../../test-utils';

describe('ExtractQueryParamsNode', () => {
    it('should extract query params from a valid URL', async () => {
        const node = new ExtractQueryParamsNode();
        const result = await node.execute({
            input: { url: 'https://example.com?foo=bar&baz=qux' },
            node: { id: '1', type: 'extract-query-params', data: {}, position: { x: 0, y: 0 } },
            context: {} as any,
            signal: new AbortController().signal
        });

        expect(result.status).toBe('success');
        expect(result.output).toEqual({
            params: { foo: 'bar', baz: 'qux' },
            paramCount: 2
        });
    });

    it('should handle URL without params', async () => {
        const node = new ExtractQueryParamsNode();
        const result = await node.execute({
            input: { url: 'https://example.com' },
            node: { id: '1', type: 'extract-query-params', data: {}, position: { x: 0, y: 0 } },
            context: {} as any,
            signal: new AbortController().signal
        });

        expect(result.status).toBe('success');
        expect(result.output).toEqual({
            params: {},
            paramCount: 0
        });
    });

    it('should fail with invalid URL', async () => {
        const node = new ExtractQueryParamsNode();
        const result = await node.execute({
            input: { url: 'not-a-url' },
            node: { id: '1', type: 'extract-query-params', data: {}, position: { x: 0, y: 0 } },
            context: {} as any,
            signal: new AbortController().signal
        });

        expect(result.status).toBe('failed');
        expect(result.error).toContain('Invalid input');
    });
});
