import { describe, it, expect } from 'vitest';
import { FilterNode } from './FilterNode';
import { createMockExecutionArgs } from '../../../test-utils';

describe('FilterNode', () => {
    it('should match equals operator', async () => {
        const node = new FilterNode();
        const args = createMockExecutionArgs(
            { type: 'filter' },
            {
                field: 'status',
                value: 'active',
                data: { status: 'active', id: 1 }
            }
        );
        const result = await node.execute(args);

        expect(result.status).toBe('success');
        expect(result.output?.match).toBe(true);
        expect(result.output?.data).toEqual({ status: 'active', id: 1 });
    });

    it('should not match equals operator', async () => {
        const node = new FilterNode();
        const args = createMockExecutionArgs(
            { type: 'filter' },
            {
                field: 'status',
                value: 'active',
                data: { status: 'inactive', id: 1 }
            }
        );
        const result = await node.execute(args);

        expect(result.status).toBe('success');
        expect(result.output?.match).toBe(false);
        expect(result.output?.data).toBeNull();
    });

    it('should match contains operator', async () => {
        const node = new FilterNode();
        const args = createMockExecutionArgs(
            { type: 'filter' },
            {
                field: 'tags',
                operator: 'contains',
                value: 'urgent',
                data: { tags: 'urgent,high', id: 1 }
            }
        );
        const result = await node.execute(args);

        expect(result.status).toBe('success');
        expect(result.output?.match).toBe(true);
    });

    it('should fail if field is missing', async () => {
        const node = new FilterNode();
        const args = createMockExecutionArgs(
            { type: 'filter' },
            { value: 'active' } // Missing field
        );
        const result = await node.execute(args);

        expect(result.status).toBe('failed');
        expect(result.error).toContain('Invalid input');
    });
});
