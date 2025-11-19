import { describe, it, expect, beforeEach } from 'vitest';
import { executeWorkflow } from '../engine';
import { db } from '@repo/database';
import { workflows, executionSteps, executions } from '@repo/database';
import { eq } from 'drizzle-orm';

describe('PPC Nodes Integration', () => {
    beforeEach(async () => {
        await db.delete(executionSteps);
        await db.delete(executions);
        await db.delete(workflows);
    });

    it('should execute ExtractQueryParamsNode', async () => {
        // 1. Create Workflow with Nodes embedded
        const [workflow] = await db.insert(workflows).values({
            name: 'Extract Query Params Workflow',
            nodes: [
                {
                    id: '1',
                    type: 'extract-query-params',
                    position: { x: 0, y: 0 },
                    data: { url: 'https://example.com?source=ppc&campaign=summer' }
                }
            ],
            edges: []
        }).returning();

        // 2. Execute
        const result = await executeWorkflow(workflow!.id, {});

        // 3. Verify
        expect(result.status).toBe('completed');
        expect(result.results?.['1']?.status).toBe('success');
        expect(result.results?.['1']?.output).toEqual({ source: 'ppc', campaign: 'summer' });
    });

    it('should execute FilterNode (match)', async () => {
        // 1. Create Workflow
        const [workflow] = await db.insert(workflows).values({
            name: 'Filter Match Workflow',
            nodes: [
                {
                    id: '1',
                    type: 'filter',
                    position: { x: 0, y: 0 },
                    data: {
                        field: 'role',
                        value: 'admin',
                        data: { role: 'admin', name: 'Alice' }
                    }
                }
            ],
            edges: []
        }).returning();

        // 2. Execute
        const result = await executeWorkflow(workflow!.id, {});

        // 3. Verify
        expect(result.status).toBe('completed');
        expect(result.results?.['1']?.status).toBe('success');
        expect(result.results?.['1']?.output?.match).toBe(true);
        expect(result.results?.['1']?.output?.data).toEqual({ role: 'admin', name: 'Alice' });
    });

    it('should execute FilterNode (no match)', async () => {
        // 1. Create Workflow
        const [workflow] = await db.insert(workflows).values({
            name: 'Filter No Match Workflow',
            nodes: [
                {
                    id: '1',
                    type: 'filter',
                    position: { x: 0, y: 0 },
                    data: {
                        field: 'role',
                        value: 'admin',
                        data: { role: 'user', name: 'Bob' }
                    }
                }
            ],
            edges: []
        }).returning();

        // 2. Execute
        const result = await executeWorkflow(workflow!.id, {});

        // 3. Verify
        expect(result.status).toBe('completed');
        expect(result.results?.['1']?.status).toBe('success');
        expect(result.results?.['1']?.output?.match).toBe(false);
        expect(result.results?.['1']?.output?.data).toBeNull();
    });
});
