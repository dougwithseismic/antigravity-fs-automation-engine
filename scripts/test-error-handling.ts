import 'dotenv/config';
import { db } from '@repo/database';
import { workflows, executions } from '@repo/database/schema';
import { eq } from 'drizzle-orm';
import { WorkflowWorker } from '../apps/worker/src/workers/workflow-worker';
import { NodeWorker } from '../apps/worker/src/workers/node-worker';
import { executionStateService } from '../apps/worker/src/services/execution-state';

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

async function waitFor(executionId: number, status: string, timeout = 10000) {
    const start = Date.now();
    while (Date.now() - start < timeout) {
        const state = await executionStateService.getState(executionId);
        if (state?.status === status) return state;
        await sleep(200);
    }
    return null;
}

async function main() {
    console.log('🧪 Phase 5.3: Error Handling Tests\n');

    new WorkflowWorker();
    new NodeWorker();
    await sleep(1000);
    console.log('✅ Workers ready\n');

    let passed = 0, failed = 0;

    // Test 1: Error details stored
    console.log('Test 1: Error Details Storage');
    try {
        const [wf] = await db.insert(workflows).values({
            name: 'Error Test',
            nodes: [{ id: 'n1', type: 'code', data: { code: 'throw new Error("Test error");' } }],
            edges: [],
        }).returning();

        const { orchestrator } = await import('../apps/api/src/execution/orchestrator');
        const exec = await orchestrator.startWorkflow(wf.id, {}, undefined);
        const state = await waitFor(exec.id, 'failed', 15000);

        if (state?.stepResults['n1']?.error?.message === 'Test error') {
            console.log('✅ PASS\n');
            passed++;
        } else {
            console.log('❌ FAIL\n');
            failed++;
        }
    } catch (e: any) {
        console.log(`❌ FAIL - ${e.message}\n`);
        failed++;
    }

    // Test 2: Retry endpoint
    console.log('Test 2: Retry Endpoint');
    try {
        const [wf] = await db.insert(workflows).values({
            name: 'Retry Test',
            nodes: [{ id: 'n1', type: 'code', data: { code: 'return { ok: true };' } }],
            edges: [],
        }).returning();

        const { orchestrator } = await import('../apps/api/src/execution/orchestrator');
        const exec = await orchestrator.startWorkflow(wf.id, {}, undefined);
        await waitFor(exec.id, 'completed', 5000);

        // Mark as failed  
        await db.update(executions).set({ status: 'failed' }).where(eq(executions.id, exec.id));

        // Retry
        const { executionService } = await import('../apps/api/src/execution/execution-service');
        const result = await executionService.retryExecution(exec.id);

        if (result.success) {
            console.log('✅ PASS\n');
            passed++;
        } else {
            console.log('❌ FAIL\n');
            failed++;
        }
    } catch (e: any) {
        console.log(`❌ FAIL - ${e.message}\n`);
        failed++;
    }

    console.log('='.repeat(30));
    console.log(`${passed}/2 passed`);
    console.log('='.repeat(30));
    process.exit(failed > 0 ? 1 : 0);
}

main().catch(e => {
    console.error(e);
    process.exit(1);
});
