import { describe, it, expect, beforeAll } from 'vitest';
import { db } from '@repo/database';
import { workflows, executions, executionSteps } from '@repo/database/schema';
import { WorkflowOrchestrator } from '../../../../api/src/execution/orchestrator';
import { WorkflowWorker } from '../workflow-worker';
import { NodeWorker } from '../node-worker';
import { eq } from 'drizzle-orm';

describe('Webhook Edge Cases Integration', () => {
    let orchestrator: WorkflowOrchestrator;
    let workflowWorker: WorkflowWorker;
    let nodeWorker: NodeWorker;

    beforeAll(async () => {
        orchestrator = new WorkflowOrchestrator();
        workflowWorker = new WorkflowWorker();
        nodeWorker = new NodeWorker();
    });

    it('should handle multiple webhooks triggering different workflows concurrently', async () => {
        // Create two workflows with webhook nodes
        const [wf1] = await db.insert(workflows).values({
            name: 'Webhook Workflow 1',
            nodes: [
                { id: '1', type: 'webhook', position: { x: 0, y: 0 }, data: {} }
            ],
            edges: []
        }).returning();

        const [wf2] = await db.insert(workflows).values({
            name: 'Webhook Workflow 2',
            nodes: [
                { id: '1', type: 'webhook', position: { x: 0, y: 0 }, data: {} }
            ],
            edges: []
        }).returning();

        if (!wf1 || !wf2) throw new Error('Failed to create workflows');

        // Trigger both concurrently
        const [exec1, exec2] = await Promise.all([
            orchestrator.startWorkflow(wf1.id, { source: 'wf1' }),
            orchestrator.startWorkflow(wf2.id, { source: 'wf2' })
        ]);

        expect(exec1.id).toBeDefined();
        expect(exec2.id).toBeDefined();
        expect(exec1.id).not.toBe(exec2.id);

        // Wait for completion
        const waitForCompletion = async (execId: number) => {
            for (let i = 0; i < 20; i++) {
                const result = await db.query.executions.findFirst({
                    where: eq(executions.id, execId)
                });
                if (result?.status === 'completed' || result?.status === 'failed') {
                    return result;
                }
                await new Promise(r => setTimeout(r, 500));
            }
            throw new Error('Execution timed out');
        };

        const [completed1, completed2] = await Promise.all([
            waitForCompletion(exec1.id),
            waitForCompletion(exec2.id)
        ]);

        expect(completed1.status).toBe('completed');
        expect(completed2.status).toBe('completed');

        // Cleanup
        await db.delete(executionSteps).where(eq(executionSteps.executionId, exec1.id));
        await db.delete(executionSteps).where(eq(executionSteps.executionId, exec2.id));
        await db.delete(executions).where(eq(executions.workflowId, wf1.id));
        await db.delete(executions).where(eq(executions.workflowId, wf2.id));
        await db.delete(workflows).where(eq(workflows.id, wf1.id));
        await db.delete(workflows).where(eq(workflows.id, wf2.id));
    });

    it('should handle webhook with large JSON payload', async () => {
        const [wf] = await db.insert(workflows).values({
            name: 'Large Payload Webhook',
            nodes: [
                { id: '1', type: 'webhook', position: { x: 0, y: 0 }, data: {} }
            ],
            edges: []
        }).returning();

        if (!wf) throw new Error('Failed to create workflow');

        // Create large payload
        const largePayload = {
            items: Array.from({ length: 100 }, (_, i) => ({
                id: i,
                name: `Item ${i}`,
                description: 'A'.repeat(100), // 100 chars each
                metadata: {
                    tags: ['tag1', 'tag2', 'tag3'],
                    nested: { value: i * 2 }
                }
            }))
        };

        const execution = await orchestrator.startWorkflow(wf.id, {
            body: largePayload,
            query: {},
            headers: {},
            method: 'POST',
            path: '/webhooks/large'
        });

        const waitForCompletion = async (execId: number) => {
            for (let i = 0; i < 20; i++) {
                const result = await db.query.executions.findFirst({
                    where: eq(executions.id, execId)
                });
                if (result?.status === 'completed' || result?.status === 'failed') {
                    return result;
                }
                await new Promise(r => setTimeout(r, 500));
            }
            throw new Error('Execution timed out');
        };

        const completed = await waitForCompletion(execution.id);
        expect(completed.status).toBe('completed');

        // Cleanup
        await db.delete(executionSteps).where(eq(executionSteps.executionId, execution.id));
        await db.delete(executions).where(eq(executions.workflowId, wf.id));
        await db.delete(workflows).where(eq(workflows.id, wf.id));
    });

    it('should handle webhook with special characters in data', async () => {
        const [wf] = await db.insert(workflows).values({
            name: 'Special Chars Webhook',
            nodes: [
                { id: '1', type: 'webhook', position: { x: 0, y: 0 }, data: {} }
            ],
            edges: []
        }).returning();

        if (!wf) throw new Error('Failed to create workflow');

        const specialPayload = {
            body: {
                message: "Test with 'quotes', \"double quotes\", and\nnewlines",
                unicode: '测试 🚀 émojis',
                html: '<script>alert("xss")</script>'
            },
            query: { 'param-with-dash': 'value' },
            headers: {},
            method: 'POST',
            path: '/webhooks/special'
        };

        const execution = await orchestrator.startWorkflow(wf.id, specialPayload);

        const waitForCompletion = async (execId: number) => {
            for (let i = 0; i < 20; i++) {
                const result = await db.query.executions.findFirst({
                    where: eq(executions.id, execId)
                });
                if (result?.status === 'completed' || result?.status === 'failed') {
                    return result;
                }
                await new Promise(r => setTimeout(r, 500));
            }
            throw new Error('Execution timed out');
        };

        const completed = await waitForCompletion(execution.id);
        expect(completed.status).toBe('completed');

        // Cleanup
        await db.delete(executionSteps).where(eq(executionSteps.executionId, execution.id));
        await db.delete(executions).where(eq(executions.workflowId, wf.id));
        await db.delete(workflows).where(eq(workflows.id, wf.id));
    });
});
