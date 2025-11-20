import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { db } from '@repo/database';
import { workflows, executions, executionSteps } from '@repo/database/schema';
import { NodeWorker } from '../node-worker';
import { WorkflowWorker } from '../workflow-worker';
import { executionStateService } from '../../services/execution-state';
import { nodeRegistry } from '../../registry/node-registry';

// Import workflow seeds directly
import { serverLinearWorkflow } from '../../../../../packages/database/src/seeds/01-server-linear';
import { clientLinearWorkflow } from '../../../../../packages/database/src/seeds/02-client-linear';
import { hybridSandwichWorkflow } from '../../../../../packages/database/src/seeds/03-hybrid-sandwich';
import { parallelServerWorkflow } from '../../../../../packages/database/src/seeds/04-parallel-server';
import { parallelMixedWorkflow } from '../../../../../packages/database/src/seeds/05-parallel-mixed';
import { conditionalServerWorkflow } from '../../../../../packages/database/src/seeds/06-conditional-server';
import { conditionalMixedWorkflow } from '../../../../../packages/database/src/seeds/07-conditional-mixed';

describe('Comprehensive Workflow Integration Tests', () => {
    let nodeWorker: NodeWorker;
    let workflowWorker: WorkflowWorker;

    beforeEach(async () => {
        // Clean database
        await db.delete(executionSteps);
        await db.delete(executions);
        await db.delete(workflows);

        nodeWorker = new NodeWorker();
        workflowWorker = new WorkflowWorker();

        // Clear Redis state
        await executionStateService['redis'].flushdb();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('Scenario 1: Server-Only Linear Workflow', () => {
        it('should execute all server nodes sequentially to completion', async () => {
            // 1. Seed workflow
            const [workflow] = await db.insert(workflows).values(serverLinearWorkflow).returning();

            // 2. Create execution
            const [execution] = await db.insert(executions).values({
                workflowId: workflow.id,
                status: 'pending',
                startedAt: new Date()
            }).returning();

            // 3. Initialize state
            await executionStateService.initState(execution.id, workflow.id);

            // 4. Execute workflow (start node)
            const startJob = {
                id: 'wf-1',
                data: {
                    workflowId: workflow.id,
                    executionId: execution.id,
                    input: {}
                }
            };
            await workflowWorker.processJob(startJob as any);

            // 5. Process all nodes
            await nodeWorker.processJob({ id: 'n-1', data: { executionId: execution.id, nodeId: '1', workflowId: workflow.id, input: {}, attempt: 1 } } as any);
            await nodeWorker.processJob({ id: 'n-2', data: { executionId: execution.id, nodeId: '2', workflowId: workflow.id, input: {}, attempt: 1 } } as any);
            await nodeWorker.processJob({ id: 'n-3', data: { executionId: execution.id, nodeId: '3', workflowId: workflow.id, input: {}, attempt: 1 } } as any);
            await nodeWorker.processJob({ id: 'n-4', data: { executionId: execution.id, nodeId: '4', workflowId: workflow.id, input: {}, attempt: 1 } } as any);
            await nodeWorker.processJob({ id: 'n-5', data: { executionId: execution.id, nodeId: '5', workflowId: workflow.id, input: {}, attempt: 1 } } as any);

            // 6. Verify completion
            const state = await executionStateService.getState(execution.id);
            expect(state?.status).toBe('completed');
            expect(state?.completedNodes).toHaveLength(5);
            expect(state?.completedNodes).toContain('1');
            expect(state?.completedNodes).toContain('5');
        });
    });

    describe('Scenario 2: Client-Only Linear Workflow', () => {
        it('should suspend at each client node', async () => {
            // 1. Seed workflow
            const [workflow] = await db.insert(workflows).values(clientLinearWorkflow).returning();

            // 2. Create execution
            const [execution] = await db.insert(executions).values({
                workflowId: workflow.id,
                status: 'pending',
                startedAt: new Date()
            }).returning();

            // 3. Initialize and execute
            await executionStateService.initState(execution.id, workflow.id);
            await workflowWorker.processJob({ id: 'wf-1', data: { workflowId: workflow.id, executionId: execution.id, input: {} } } as any);

            // 4. Process first client node - should suspend
            await nodeWorker.processJob({ id: 'n-1', data: { executionId: execution.id, nodeId: '1', workflowId: workflow.id, input: {}, attempt: 1 } } as any);

            const state1 = await executionStateService.getState(execution.id);
            expect(state1?.status).toBe('suspended');
            expect(state1?.activeNodes).toContain('1');
        });
    });

    describe('Scenario 3: Hybrid Sandwich (Server → Client → Server)', () => {
        it('should execute server nodes, suspend for client, then continue on server', async () => {
            const [workflow] = await db.insert(workflows).values(hybridSandwichWorkflow).returning();
            const [execution] = await db.insert(executions).values({
                workflowId: workflow.id,
                status: 'pending',
                startedAt: new Date()
            }).returning();

            await executionStateService.initState(execution.id, workflow.id);
            await workflowWorker.processJob({ id: 'wf-1', data: { workflowId: workflow.id, executionId: execution.id, input: {} } } as any);

            // Execute server nodes
            await nodeWorker.processJob({ id: 'n-1', data: { executionId: execution.id, nodeId: '1', workflowId: workflow.id, input: {}, attempt: 1 } } as any);
            await nodeWorker.processJob({ id: 'n-2', data: { executionId: execution.id, nodeId: '2', workflowId: workflow.id, input: {}, attempt: 1 } } as any);

            // Hit client node - should suspend
            await nodeWorker.processJob({ id: 'n-3', data: { executionId: execution.id, nodeId: '3', workflowId: workflow.id, input: {}, attempt: 1 } } as any);

            let state = await executionStateService.getState(execution.id);
            expect(state?.status).toBe('suspended');
            expect(state?.completedNodes).toContain('2');
            expect(state?.activeNodes).toContain('3');

            // Resume with client data
            await executionStateService.updateState(execution.id, {
                status: 'running',
                completedNode: '3',
                removeActiveNode: '3',
                stepResult: { nodeId: '3', output: { email: 'test@example.com', _resumedAt: new Date().toISOString() } }
            });

            // Continue server execution
            await nodeWorker.processJob({ id: 'n-4', data: { executionId: execution.id, nodeId: '4', workflowId: workflow.id, input: { email: 'test@example.com' }, attempt: 1 } } as any);
            await nodeWorker.processJob({ id: 'n-5', data: { executionId: execution.id, nodeId: '5', workflowId: workflow.id, input: {}, attempt: 1 } } as any);

            // Hit final client node
            await nodeWorker.processJob({ id: 'n-6', data: { executionId: execution.id, nodeId: '6', workflowId: workflow.id, input: {}, attempt: 1 } } as any);

            state = await executionStateService.getState(execution.id);
            expect(state?.completedNodes).toContain('4'); // Server discount node
            expect(state?.completedNodes).toContain('5'); // Server email node
        });
    });

    describe('Scenario 4: Parallel Server Branches', () => {
        it('should execute both branches in parallel and complete when both finish', async () => {
            const [workflow] = await db.insert(workflows).values(parallelServerWorkflow).returning();
            const [execution] = await db.insert(executions).values({
                workflowId: workflow.id,
                status: 'pending',
                startedAt: new Date()
            }).returning();

            await executionStateService.initState(execution.id, workflow.id);
            await workflowWorker.processJob({ id: 'wf-1', data: { workflowId: workflow.id, executionId: execution.id, input: {} } } as any);

            // Execute start and split
            await nodeWorker.processJob({ id: 'n-1', data: { executionId: execution.id, nodeId: '1', workflowId: workflow.id, input: {}, attempt: 1 } } as any);
            await nodeWorker.processJob({ id: 'n-2', data: { executionId: execution.id, nodeId: '2', workflowId: workflow.id, input: {}, attempt: 1 } } as any);

            // Execute both branches in parallel
            await nodeWorker.processJob({ id: 'n-3', data: { executionId: execution.id, nodeId: '3', workflowId: workflow.id, input: {}, attempt: 1 } } as any);
            await nodeWorker.processJob({ id: 'n-5', data: { executionId: execution.id, nodeId: '5', workflowId: workflow.id, input: {}, attempt: 1 } } as any);

            let state = await executionStateService.getState(execution.id);
            expect(state?.status).not.toBe('completed'); // Should NOT be complete yet

            // Complete both branches
            await nodeWorker.processJob({ id: 'n-4', data: { executionId: execution.id, nodeId: '4', workflowId: workflow.id, input: {}, attempt: 1 } } as any);
            await nodeWorker.processJob({ id: 'n-6', data: { executionId: execution.id, nodeId: '6', workflowId: workflow.id, input: {}, attempt: 1 } } as any);

            state = await executionStateService.getState(execution.id);
            expect(state?.status).toBe('completed');
            expect(state?.completedNodes).toHaveLength(6);
        });
    });

    describe('Scenario 5: Parallel Mixed (Server + Client)', () => {
        it('should execute server branch while client branch suspends', async () => {
            const [workflow] = await db.insert(workflows).values(parallelMixedWorkflow).returning();
            const [execution] = await db.insert(executions).values({
                workflowId: workflow.id,
                status: 'pending',
                startedAt: new Date()
            }).returning();

            await executionStateService.initState(execution.id, workflow.id);
            await workflowWorker.processJob({ id: 'wf-1', data: { workflowId: workflow.id, executionId: execution.id, input: {} } } as any);

            // Execute start and split
            await nodeWorker.processJob({ id: 'n-1', data: { executionId: execution.id, nodeId: '1', workflowId: workflow.id, input: {}, attempt: 1 } } as any);
            await nodeWorker.processJob({ id: 'n-2', data: { executionId: execution.id, nodeId: '2', workflowId: workflow.id, input: {}, attempt: 1 } } as any);

            // Execute server branch completely
            await nodeWorker.processJob({ id: 'n-3', data: { executionId: execution.id, nodeId: '3', workflowId: workflow.id, input: {}, attempt: 1 } } as any);
            await nodeWorker.processJob({ id: 'n-4', data: { executionId: execution.id, nodeId: '4', workflowId: workflow.id, input: {}, attempt: 1 } } as any);

            // Start client branch - should suspend
            await nodeWorker.processJob({ id: 'n-5', data: { executionId: execution.id, nodeId: '5', workflowId: workflow.id, input: {}, attempt: 1 } } as any);

            const state = await executionStateService.getState(execution.id);
            expect(state?.status).toBe('suspended');
            expect(state?.completedNodes).toContain('3'); // Server branch completed
            expect(state?.completedNodes).toContain('4');
            expect(state?.activeNodes).toContain('5'); // Client branch suspended
        });
    });

    describe('Scenario 6: Conditional Server Routing', () => {
        it('should route to VIP path when condition is true', async () => {
            const [workflow] = await db.insert(workflows).values(conditionalServerWorkflow).returning();
            const [execution] = await db.insert(executions).values({
                workflowId: workflow.id,
                status: 'pending',
                startedAt: new Date()
            }).returning();

            await executionStateService.initState(execution.id, workflow.id);
            await workflowWorker.processJob({ id: 'wf-1', data: { workflowId: workflow.id, executionId: execution.id, input: { user: { vip: true } } } } as any);

            // Execute through condition
            await nodeWorker.processJob({ id: 'n-1', data: { executionId: execution.id, nodeId: '1', workflowId: workflow.id, input: { user: { vip: true } }, attempt: 1 } } as any);
            await nodeWorker.processJob({ id: 'n-2', data: { executionId: execution.id, nodeId: '2', workflowId: workflow.id, input: { user: { vip: true } }, attempt: 1 } } as any);

            // Should route to VIP path (node 3)
            await nodeWorker.processJob({ id: 'n-3', data: { executionId: execution.id, nodeId: '3', workflowId: workflow.id, input: { user: { vip: true }, _conditionResult: true }, attempt: 1 } } as any);
            await nodeWorker.processJob({ id: 'n-4', data: { executionId: execution.id, nodeId: '4', workflowId: workflow.id, input: {}, attempt: 1 } } as any);
            await nodeWorker.processJob({ id: 'n-7', data: { executionId: execution.id, nodeId: '7', workflowId: workflow.id, input: {}, attempt: 1 } } as any);

            const state = await executionStateService.getState(execution.id);
            expect(state?.completedNodes).toContain('3'); // VIP discount
            expect(state?.completedNodes).toContain('4'); // VIP email
            expect(state?.completedNodes).not.toContain('5'); // Regular path NOT taken
        });

        it('should route to regular path when condition is false', async () => {
            const [workflow] = await db.insert(workflows).values(conditionalServerWorkflow).returning();
            const [execution] = await db.insert(executions).values({
                workflowId: workflow.id,
                status: 'pending',
                startedAt: new Date()
            }).returning();

            await executionStateService.initState(execution.id, workflow.id);
            await workflowWorker.processJob({ id: 'wf-1', data: { workflowId: workflow.id, executionId: execution.id, input: { user: { vip: false } } } } as any);

            // Execute through condition
            await nodeWorker.processJob({ id: 'n-1', data: { executionId: execution.id, nodeId: '1', workflowId: workflow.id, input: { user: { vip: false } }, attempt: 1 } } as any);
            await nodeWorker.processJob({ id: 'n-2', data: { executionId: execution.id, nodeId: '2', workflowId: workflow.id, input: { user: { vip: false } }, attempt: 1 } } as any);

            // Should route to regular path (node 5)
            await nodeWorker.processJob({ id: 'n-5', data: { executionId: execution.id, nodeId: '5', workflowId: workflow.id, input: { user: { vip: false }, _conditionResult: false }, attempt: 1 } } as any);
            await nodeWorker.processJob({ id: 'n-6', data: { executionId: execution.id, nodeId: '6', workflowId: workflow.id, input: {}, attempt: 1 } } as any);
            await nodeWorker.processJob({ id: 'n-7', data: { executionId: execution.id, nodeId: '7', workflowId: workflow.id, input: {}, attempt: 1 } } as any);

            const state = await executionStateService.getState(execution.id);
            expect(state?.completedNodes).toContain('5'); // Regular discount
            expect(state?.completedNodes).toContain('6'); // Regular email
            expect(state?.completedNodes).not.toContain('3'); // VIP path NOT taken
        });
    });

    describe('Scenario 7: Conditional Mixed Routing', () => {
        it('should route to PPC client path when utm_source=ppc', async () => {
            const [workflow] = await db.insert(workflows).values(conditionalMixedWorkflow).returning();
            const [execution] = await db.insert(executions).values({
                workflowId: workflow.id,
                status: 'pending',
                startedAt: new Date()
            }).returning();

            await executionStateService.initState(execution.id, workflow.id);
            await workflowWorker.processJob({ id: 'wf-1', data: { workflowId: workflow.id, executionId: execution.id, input: { query: { utm_source: 'ppc' } } } } as any);

            // Execute through condition
            await nodeWorker.processJob({ id: 'n-1', data: { executionId: execution.id, nodeId: '1', workflowId: workflow.id, input: { query: { utm_source: 'ppc' } }, attempt: 1 } } as any);
            await nodeWorker.processJob({ id: 'n-2', data: { executionId: execution.id, nodeId: '2', workflowId: workflow.id, input: { query: { utm_source: 'ppc' } }, attempt: 1 } } as any);

            // Should route to PPC path (client node 3)
            await nodeWorker.processJob({ id: 'n-3', data: { executionId: execution.id, nodeId: '3', workflowId: workflow.id, input: { _conditionResult: true }, attempt: 1 } } as any);

            const state = await executionStateService.getState(execution.id);
            expect(state?.status).toBe('suspended'); // Suspended at client node
            expect(state?.activeNodes).toContain('3');
            expect(state?.completedNodes).not.toContain('6'); // Organic path NOT taken
        });

        it('should route to organic server path when utm_source is not ppc', async () => {
            const [workflow] = await db.insert(workflows).values(conditionalMixedWorkflow).returning();
            const [execution] = await db.insert(executions).values({
                workflowId: workflow.id,
                status: 'pending',
                startedAt: new Date()
            }).returning();

            await executionStateService.initState(execution.id, workflow.id);
            await workflowWorker.processJob({ id: 'wf-1', data: { workflowId: workflow.id, executionId: execution.id, input: { query: { utm_source: 'organic' } } } } as any);

            // Execute through condition
            await nodeWorker.processJob({ id: 'n-1', data: { executionId: execution.id, nodeId: '1', workflowId: workflow.id, input: { query: { utm_source: 'organic' } }, attempt: 1 } } as any);
            await nodeWorker.processJob({ id: 'n-2', data: { executionId: execution.id, nodeId: '2', workflowId: workflow.id, input: { query: { utm_source: 'organic' } }, attempt: 1 } } as any);

            // Should route to organic path (server nodes 6, 7)
            await nodeWorker.processJob({ id: 'n-6', data: { executionId: execution.id, nodeId: '6', workflowId: workflow.id, input: { _conditionResult: false }, attempt: 1 } } as any);
            await nodeWorker.processJob({ id: 'n-7', data: { executionId: execution.id, nodeId: '7', workflowId: workflow.id, input: {}, attempt: 1 } } as any);

            const state = await executionStateService.getState(execution.id);
            expect(state?.status).toBe('completed');
            expect(state?.completedNodes).toContain('6'); // Organic analytics
            expect(state?.completedNodes).toContain('7'); // Organic email
            expect(state?.completedNodes).not.toContain('3'); // PPC path NOT taken
        });
    });
});
