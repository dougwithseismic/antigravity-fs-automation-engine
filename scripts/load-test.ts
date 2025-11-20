import 'dotenv/config';
import { db } from '@repo/database';
import { workflows } from '@repo/database/schema';
import { WorkflowWorker } from '../apps/worker/src/workers/workflow-worker';
import { NodeWorker } from '../apps/worker/src/workers/node-worker';
import { SchedulerWorker } from '../apps/worker/src/workers/scheduler-worker';
import { executionStateService } from '../apps/worker/src/services/execution-state';

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

async function loadTest() {
    console.log('🚀 Load Test: High Throughput Engine\n');
    console.log('Target: 50,000+ RPS\n');

    // Start workers
    new WorkflowWorker();
    new NodeWorker();
    new SchedulerWorker();
    await sleep(1000);
    console.log('✅ Workers started\n');

    // Create test workflow
    const [wf] = await db.insert(workflows).values({
        name: 'Load Test Workflow',
        nodes: [
            { id: 'n1', type: 'code', data: { code: 'return { x: 1 };' } },
        ],
        edges: [],
    }).returning();

    console.log(`Created workflow: ${wf.id}\n`);

    // Test parameters
    const totalExecutions = 1000;
    const concurrency = 100;

    console.log(`Configuration:`);
    console.log(`- Total Executions: ${totalExecutions}`);
    console.log(`- Concurrency: ${concurrency}\n`);

    const { orchestrator } = await import('../apps/api/src/execution/orchestrator');
    const startTime = Date.now();
    let completed = 0;
    let failed = 0;

    // Execute in batches
    const batches = Math.ceil(totalExecutions / concurrency);

    for (let batch = 0; batch < batches; batch++) {
        const batchSize = Math.min(concurrency, totalExecutions - (batch * concurrency));
        const promises = [];

        for (let i = 0; i < batchSize; i++) {
            const promise = orchestrator.startWorkflow(wf.id, { batch, i }, undefined)
                .then(() => completed++)
                .catch(() => failed++);
            promises.push(promise);
        }

        await Promise.all(promises);

        if (batch % 10 === 0) {
            const elapsed = (Date.now() - startTime) / 1000;
            const rps = completed / elapsed;
            console.log(`Progress: ${completed}/${totalExecutions} (${rps.toFixed(0)} RPS)`);
        }
    }

    // Wait for all to complete
    console.log('\nWaiting for executions to complete...');
    await sleep(5000);

    // Calculate stats
    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000;
    const rps = totalExecutions / duration;

    console.log('\n' + '='.repeat(50));
    console.log('LOAD TEST RESULTS');
    console.log('='.repeat(50));
    console.log(`Total Executions: ${totalExecutions}`);
    console.log(`Completed: ${completed}`);
    console.log(`Failed: ${failed}`);
    console.log(`Duration: ${duration.toFixed(2)}s`);
    console.log(`Throughput: ${rps.toFixed(0)} RPS`);
    console.log('='.repeat(50));

    if (rps >= 50000) {
        console.log('\n✅ Target achieved: 50k+ RPS');
    } else if (rps >= 10000) {
        console.log('\n⚠️  Good: 10k+ RPS (below 50k target)');
    } else {
        console.log('\n❌ Below target: < 10k RPS');
    }

    process.exit(0);
}

loadTest().catch(e => {
    console.error('Load test error:', e);
    process.exit(1);
});
