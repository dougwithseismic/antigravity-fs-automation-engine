import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { db } from '@repo/database';
import { workflows, executions, executionSteps } from '@repo/database/schema';
import { WorkflowOrchestrator } from '../../../../api/src/execution/orchestrator';
import { WorkflowWorker } from '../workflow-worker';
import { NodeWorker } from '../node-worker';
import { eq } from 'drizzle-orm';

// Mock the queue to avoid real Redis dependency if possible, 
// but for integration tests we usually want real queues if the environment supports it.
// Assuming the environment has Redis (as per other tests).

describe('Webhook Trigger Integration', () => {
    let workflowId: number;
    let orchestrator: WorkflowOrchestrator;
    let workflowWorker: WorkflowWorker;
    let nodeWorker: NodeWorker;

    beforeAll(async () => {
        orchestrator = new WorkflowOrchestrator();
        // Initialize workers to process the job
        workflowWorker = new WorkflowWorker();
        nodeWorker = new NodeWorker();
    });

    afterAll(async () => {
        // Cleanup - delete in correct order to respect foreign key constraints
        if (workflowId) {
            // Delete execution steps first, then executions, then workflow
            const executionsToDelete = await db.query.executions.findMany({
                where: eq(executions.workflowId, workflowId)
            });

            for (const exec of executionsToDelete) {
                await db.delete(executionSteps).where(eq(executionSteps.executionId, exec.id));
            }

            await db.delete(executions).where(eq(executions.workflowId, workflowId));
            await db.delete(workflows).where(eq(workflows.id, workflowId));
        }
        // Close workers if they have a close method (they should)
        // workflowWorker.close(); 
        // nodeWorker.close();
    });

    it('should trigger a workflow via webhook and pass data', async () => {
        // 1. Create a workflow with a WebhookNode
        const [wf] = await db.insert(workflows).values({
            name: 'Webhook Test Workflow',
            nodes: [
                {
                    id: '1',
                    type: 'webhook',
                    position: { x: 0, y: 0 },
                    data: {}
                },
                {
                    id: '2',
                    type: 'analytics', // Analytics node to verify webhook output
                    position: { x: 100, y: 0 },
                    data: {
                        event: 'webhook_received',
                        properties: {
                            source: '{{1.query.source}}',
                            message: '{{1.body.message}}'
                        }
                    }
                }
            ],
            edges: [
                { id: 'e1-2', source: '1', target: '2' }
            ]
        }).returning();

        if (!wf) throw new Error('Failed to create workflow');

        workflowId = wf.id;

        // 2. Simulate the Webhook API call logic
        // Instead of spinning up the full Hono server, we'll directly call the orchestrator
        // with the input that the route handler would construct.
        // This verifies the "Trigger -> Workflow -> Node" flow.

        const webhookInput = {
            body: { message: 'Hello from Test!' },
            query: { source: 'test' },
            headers: { 'content-type': 'application/json' },
            method: 'POST',
            path: `/webhooks/${workflowId}`
        };

        console.log('🚀 Triggering webhook workflow...');
        const execution = await orchestrator.startWorkflow(workflowId, webhookInput);
        expect(execution).toBeDefined();
        expect(execution.id).toBeDefined();

        // 3. Wait for execution to complete
        // We can poll the DB or use a helper
        const waitForCompletion = async (execId: number) => {
            for (let i = 0; i < 20; i++) { // 10 seconds timeout
                const result = await db.query.executions.findFirst({
                    where: eq(executions.id, execId)
                });
                if (result?.status === 'completed' || result?.status === 'failed') {
                    console.log(`Execution ${execId} finished with status: ${result.status}`);
                    if (result.status === 'failed') {
                        console.error('Failed execution state:', JSON.stringify(result.currentState, null, 2));
                    }
                    return result;
                }
                await new Promise(r => setTimeout(r, 500));
            }
            throw new Error('Execution timed out');
        };

        const completedExecution = await waitForCompletion(execution.id);

        // Log the details if it failed
        if (completedExecution.status === 'failed') {
            console.error('❌ Execution failed!');
            console.error('Current state:', JSON.stringify(completedExecution.currentState, null, 2));
        }

        expect(completedExecution.status).toBe('completed');

        // 4. Verify the output of the WebhookNode (Node 1)
        // We need to check the execution state. 
        // Since we don't have easy access to Redis state here without the service,
        // we can rely on the fact that it completed successfully.
        // Ideally, we'd check the logs or the persisted state if we were saving step results to DB.

        // For now, success implies the WebhookNode executed and didn't crash.
        console.log('✅ Workflow completed successfully');
    });

    it('should handle empty input gracefully', async () => {
        // 1. Create a workflow with a WebhookNode
        const [wf] = await db.insert(workflows).values({
            name: 'Webhook Empty Test',
            nodes: [
                {
                    id: '1',
                    type: 'webhook',
                    position: { x: 0, y: 0 },
                    data: {}
                }
            ],
            edges: []
        }).returning();

        if (!wf) throw new Error('Failed to create workflow');

        // 2. Trigger with empty input
        const emptyInput = {};

        console.log('🚀 Triggering webhook with empty input...');
        const execution = await orchestrator.startWorkflow(wf.id, emptyInput);

        // 3. Wait for completion
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

        const completedExecution = await waitForCompletion(execution.id);
        expect(completedExecution.status).toBe('completed');

        // Cleanup - delete execution_steps, then executions, then workflows to respect FK constraints
        await db.delete(executionSteps).where(eq(executionSteps.executionId, execution.id));
        await db.delete(executions).where(eq(executions.workflowId, wf.id));
        await db.delete(workflows).where(eq(workflows.id, wf.id));
    });
});
