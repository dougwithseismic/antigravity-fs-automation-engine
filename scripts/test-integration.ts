import 'dotenv/config';
import { db } from '@repo/database';
import { workflows } from '@repo/database/schema';
import { WorkflowWorker } from '../apps/worker/src/workers/workflow-worker';
import { NodeWorker } from '../apps/worker/src/workers/node-worker';
import { SchedulerWorker } from '../apps/worker/src/workers/scheduler-worker';
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
    console.log('🧪 Phase 5 Integration Tests\n');

    // Init workers
    new WorkflowWorker();
    new NodeWorker();
    new SchedulerWorker();
    await sleep(1000); // Let workers connect
    console.log('✅ Workers ready\n');

    let passed = 0, failed = 0;

    // Test 1: CodeNode
    console.log('Test 1: CodeNode');
    try {
        const [wf] = await db.insert(workflows).values({
            name: 'T1',
            nodes: [{ id: 'n1', type: 'code', data: { code: 'return { x: 42 };' } }],
            edges: [],
        }).returning();

        const { orchestrator } = await import('../apps/api/src/execution/orchestrator');
        const exec = await orchestrator.startWorkflow(wf.id, {}, undefined);
        const state = await waitFor(exec.id, 'completed', 5000);

        if (state?.stepResults['n1']?.x === 42) {
            console.log('✅ PASS\n');
            passed++;
        } else {
            console.log(`❌ FAIL\n`);
            failed++;
        }
    } catch (e: any) {
        console.log(`❌ FAIL - ${e.message}\n`);
        failed++;
    }

    // Test 2: Fetch → Code
    console.log('Test 2: Fetch → Code');
    try {
        const [wf] = await db.insert(workflows).values({
            name: 'T2',
            nodes: [
                { id: 'n1', type: 'fetch', data: { url: 'https://jsonplaceholder.typicode.com/users/1', method: 'GET' } },
                { id: 'n2', type: 'code', data: { code: 'return { name: input.data.name };' } },
            ],
            edges: [{ source: 'n1', target: 'n2' }],
        }).returning();

        const { orchestrator } = await import('../apps/api/src/execution/orchestrator');
        const exec = await orchestrator.startWorkflow(wf.id, {}, undefined);
        const state = await waitFor(exec.id, 'completed', 10000);

        if (state?.stepResults['n2']?.name) {
            console.log(`✅ PASS\n`);
            passed++;
        } else {
            console.log(`❌ FAIL\n`);
            failed++;
        }
    } catch (e: any) {
        console.log(`❌ FAIL - ${e.message}\n`);
        failed++;
    }

    // Test 3: WaitNode
    console.log('Test 3: WaitNode (2s)');
    try {
        const [wf] = await db.insert(workflows).values({
            name: 'T3',
            nodes: [
                { id: 'n1', type: 'wait', data: { amount: 2, unit: 'seconds' } },
                { id: 'n2', type: 'code', data: { code: 'return { ts: Date.now() };' } },
            ],
            edges: [{ source: 'n1', target: 'n2' }],
        }).returning();

        const { orchestrator } = await import('../apps/api/src/execution/orchestrator');
        const start = Date.now();
        const exec = await orchestrator.startWorkflow(wf.id, {}, undefined);
        const state = await waitFor(exec.id, 'completed', 8000);
        const elapsed = (Date.now() - start) / 1000;

        if (state?.stepResults['n2']?.ts && elapsed >= 2.0) {
            console.log(`✅ PASS (${elapsed.toFixed(1)}s)\n`);
            passed++;
        } else {
            console.log(`❌ FAIL\n`);
            failed++;
        }
    } catch (e: any) {
        console.log(`❌ FAIL - ${e.message}\n`);
        failed++;
    }

    console.log('='.repeat(30));
    console.log(`${passed}/3 passed`);
    console.log('='.repeat(30));
    process.exit(failed > 0 ? 1 : 0);
}

main().catch(e => {
    console.error(e);
    process.exit(1);
});
