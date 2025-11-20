import { describe, it, expect } from 'vitest';
import { MergeNode } from './MergeNode';
import { NodeExecutionArgs } from '@repo/types';

describe('MergeNode', () => {
    const mergeNode = new MergeNode();

    const createMockContext = (
        results: Record<string, any>,
        edges: Array<{ source: string; target: string }>
    ) => ({
        workflowId: 1,
        executionId: 1,
        input: {},
        results,
        workflow: { edges, nodes: [] }
    });

    it('should suspend when not all inputs are ready', async () => {
        const args: NodeExecutionArgs = {
            node: {
                id: 'merge-1',
                type: 'merge',
                position: { x: 0, y: 0 },
                data: { mode: 'append' }
            },
            input: {},
            context: createMockContext(
                {
                    'node-1': { status: 'success', output: { data: 'A' } }
                    // node-2 is missing (pending)
                },
                [
                    { source: 'node-1', target: 'merge-1' },
                    { source: 'node-2', target: 'merge-1' }
                ]
            )
        };

        const result = await mergeNode.execute(args);

        expect(result.status).toBe('suspended');
        expect(result.output.reason).toBe('waiting_for_inputs');
        expect(result.output.completed).toBe(1);
        expect(result.output.pending).toBe(1);
        expect(result.output.pendingNodes).toContain('node-2');
    });

    it('should merge outputs in append mode when all inputs ready', async () => {
        const args: NodeExecutionArgs = {
            node: {
                id: 'merge-1',
                type: 'merge',
                position: { x: 0, y: 0 },
                data: { mode: 'append' }
            },
            input: {},
            context: createMockContext(
                {
                    'node-1': { status: 'success', output: [{ id: 1 }, { id: 2 }] },
                    'node-2': { status: 'success', output: [{ id: 3 }, { id: 4 }] }
                },
                [
                    { source: 'node-1', target: 'merge-1' },
                    { source: 'node-2', target: 'merge-1' }
                ]
            )
        };

        const result = await mergeNode.execute(args);

        expect(result.status).toBe('success');
        expect(result.output.merged).toHaveLength(4);
        expect(result.output.merged).toEqual([
            { id: 1 },
            { id: 2 },
            { id: 3 },
            { id: 4 }
        ]);
        expect(result.output.sources).toContain('node-1');
        expect(result.output.sources).toContain('node-2');
    });

    it('should merge single items in append mode', async () => {
        const args: NodeExecutionArgs = {
            node: {
                id: 'merge-1',
                type: 'merge',
                position: { x: 0, y: 0 },
                data: { mode: 'append' }
            },
            input: {},
            context: createMockContext(
                {
                    'node-1': { status: 'success', output: { id: 1 } },
                    'node-2': { status: 'success', output: { id: 2 } }
                },
                [
                    { source: 'node-1', target: 'merge-1' },
                    { source: 'node-2', target: 'merge-1' }
                ]
            )
        };

        const result = await mergeNode.execute(args);

        expect(result.status).toBe('success');
        expect(result.output.merged).toEqual([{ id: 1 }, { id: 2 }]);
    });

    it('should merge in combine-by-position mode', async () => {
        const args: NodeExecutionArgs = {
            node: {
                id: 'merge-1',
                type: 'merge',
                position: { x: 0, y: 0 },
                data: { mode: 'combine-by-position' }
            },
            input: {},
            context: createMockContext(
                {
                    'node-1': { status: 'success', output: [{ a: 1 }, { a: 2 }] },
                    'node-2': { status: 'success', output: [{ b: 10 }, { b: 20 }] }
                },
                [
                    { source: 'node-1', target: 'merge-1' },
                    { source: 'node-2', target: 'merge-1' }
                ]
            )
        };

        const result = await mergeNode.execute(args);

        expect(result.status).toBe('success');
        expect(result.output.merged).toEqual([
            { a: 1, b: 10 },
            { a: 2, b: 20 }
        ]);
    });

    it('should handle uneven arrays in combine-by-position mode', async () => {
        const args: NodeExecutionArgs = {
            node: {
                id: 'merge-1',
                type: 'merge',
                position: { x: 0, y: 0 },
                data: { mode: 'combine-by-position' }
            },
            input: {},
            context: createMockContext(
                {
                    'node-1': { status: 'success', output: [{ a: 1 }, { a: 2 }, { a: 3 }] },
                    'node-2': { status: 'success', output: [{ b: 10 }] }
                },
                [
                    { source: 'node-1', target: 'merge-1' },
                    { source: 'node-2', target: 'merge-1' }
                ]
            )
        };

        const result = await mergeNode.execute(args);

        expect(result.status).toBe('success');
        expect(result.output.merged).toHaveLength(3);
        expect(result.output.merged[0]).toEqual({ a: 1, b: 10 });
        expect(result.output.merged[1]).toEqual({ a: 2 });
        expect(result.output.merged[2]).toEqual({ a: 3 });
    });

    it('should merge in combine-by-fields mode', async () => {
        const args: NodeExecutionArgs = {
            node: {
                id: 'merge-1',
                type: 'merge',
                position: { x: 0, y: 0 },
                data: { mode: 'combine-by-fields', mergeKey: 'id' }
            },
            input: {},
            context: createMockContext(
                {
                    'node-1': {
                        status: 'success',
                        output: [
                            { id: 1, name: 'Alice' },
                            { id: 2, name: 'Bob' }
                        ]
                    },
                    'node-2': {
                        status: 'success',
                        output: [
                            { id: 1, age: 30 },
                            { id: 2, age: 25 }
                        ]
                    }
                },
                [
                    { source: 'node-1', target: 'merge-1' },
                    { source: 'node-2', target: 'merge-1' }
                ]
            )
        };

        const result = await mergeNode.execute(args);

        expect(result.status).toBe('success');
        expect(result.output.merged).toHaveLength(2);
        expect(result.output.merged).toContainEqual({ id: 1, name: 'Alice', age: 30 });
        expect(result.output.merged).toContainEqual({ id: 2, name: 'Bob', age: 25 });
    });

    it('should fail when upstream node fails and continueOnPartialFailure is false', async () => {
        const args: NodeExecutionArgs = {
            node: {
                id: 'merge-1',
                type: 'merge',
                position: { x: 0, y: 0 },
                data: { mode: 'append', continueOnPartialFailure: false }
            },
            input: {},
            context: createMockContext(
                {
                    'node-1': { status: 'success', output: { data: 'A' } },
                    'node-2': { status: 'failed', error: 'Node failed' }
                },
                [
                    { source: 'node-1', target: 'merge-1' },
                    { source: 'node-2', target: 'merge-1' }
                ]
            )
        };

        const result = await mergeNode.execute(args);

        expect(result.status).toBe('failed');
        expect(result.output.error).toContain('failed');
        expect(result.output.failedNodes).toContain('node-2');
    });

    it('should continue when upstream node fails and continueOnPartialFailure is true', async () => {
        const args: NodeExecutionArgs = {
            node: {
                id: 'merge-1',
                type: 'merge',
                position: { x: 0, y: 0 },
                data: { mode: 'append', continueOnPartialFailure: true }
            },
            input: {},
            context: createMockContext(
                {
                    'node-1': { status: 'success', output: [{ id: 1 }] },
                    'node-2': { status: 'failed', error: 'Node failed' }
                },
                [
                    { source: 'node-1', target: 'merge-1' },
                    { source: 'node-2', target: 'merge-1' }
                ]
            )
        };

        const result = await mergeNode.execute(args);

        expect(result.status).toBe('success');
        expect(result.output.merged).toEqual([{ id: 1 }]);
        expect(result.output.skipped).toContain('node-2');
    });

    it('should fail when no workflow topology is provided', async () => {
        const args: NodeExecutionArgs = {
            node: {
                id: 'merge-1',
                type: 'merge',
                position: { x: 0, y: 0 },
                data: { mode: 'append' }
            },
            input: {},
            context: {
                workflowId: 1,
                executionId: 1,
                input: {},
                results: {}
            }
        };

        const result = await mergeNode.execute(args);

        expect(result.status).toBe('failed');
        expect(result.output.error).toContain('workflow topology');
    });

    it('should handle three or more inputs', async () => {
        const args: NodeExecutionArgs = {
            node: {
                id: 'merge-1',
                type: 'merge',
                position: { x: 0, y: 0 },
                data: { mode: 'append' }
            },
            input: {},
            context: createMockContext(
                {
                    'node-1': { status: 'success', output: [1] },
                    'node-2': { status: 'success', output: [2] },
                    'node-3': { status: 'success', output: [3] },
                    'node-4': { status: 'success', output: [4] }
                },
                [
                    { source: 'node-1', target: 'merge-1' },
                    { source: 'node-2', target: 'merge-1' },
                    { source: 'node-3', target: 'merge-1' },
                    { source: 'node-4', target: 'merge-1' }
                ]
            )
        };

        const result = await mergeNode.execute(args);

        expect(result.status).toBe('success');
        expect(result.output.merged).toEqual([1, 2, 3, 4]);
        expect(result.output.sources).toHaveLength(4);
    });
});
