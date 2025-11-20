import 'dotenv/config';
import { db } from '@repo/database';
import { workflows, executions } from '@repo/database/schema';
import { eq } from 'drizzle-orm';
import { WorkflowWorker } from '../apps/worker/src/workers/workflow-worker';
import { NodeWorker } from '../apps/worker/src/workers/node-worker';
import { SchedulerWorker } from '../apps/worker/src/workers/scheduler-worker';

/**
 * WaitNode test - verifies delayed execution
 * Tests: Wait 3 seconds → Code node
 */

async function runWaitNodeTest() {
    console.log('🚀 Starting WaitNode Test');

    // Create workflow: Wait 3 seconds → Code
    console.log('Creating wait workflow...');
    const [workflow] = await db.insert(workflows).values({
        name: 'Wait Then Execute',
        nodes: [
            {
                id: 'wait-node',
                type: 'wait',
                data: {
                    amount: 3,
                    unit: 'seconds'
                }
            },
            {
                id: 'code-after-wait',
                type: 'code',
                data: {
                    code: 'return { executedAt: new Date().toISOString() };'
                }
            }
        ],
        edges: [
            { source: 'wait-node', target: 'code-after-wait' }
        ],
    }).returning();

    console.log('Workflow created:', workflow.id);

    // Start workers
    console.log('Starting workers...');
    const workflowWorker = new WorkflowWorker();
    const nodeWorker = new NodeWorker();
    const schedulerWorker = new SchedulerWorker();

    // Execute workflow
    console.log('Starting execution...');
    const [execution] = await db.insert(executions).values({
        workflowId: workflow.id,
        status: 'pending',
        data: {},
        startedAt: new Date(),
    }).returning();

    const { orchestrator } = await import('../apps/api/src/execution/orchestrator');
    await orchestrator.startWorkflow(workflow.id, {}, undefined);

    console.log('Execution started:', execution.id);
    console.log('⏳ Waiting 3 seconds for delay...\n');

    const startTime = Date.now();

    // Poll for completion
    for (let i = 0; i < 40; i++) {
        await new Promise(resolve => setTimeout(resolve, 500));

        const exec = await db.query.executions.findFirst({
            where: eq(executions.id, execution.id),
            with: { steps: true },
        });

        const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
        console.log(`[${elapsed}s] Status: ${exec?.status}, Steps: ${exec?.steps?.length || 0}`);

        if (exec?.status === 'completed') {
            const totalTime = ((Date.now() - startTime) / 1000).toFixed(2);
            console.log(`\n✅ Workflow completed in ${totalTime}s!`);

            // Verify wait happened
            if (parseFloat(totalTime) >= 3.0) {
                console.log('✅ Wait delay honored (>= 3 seconds)');
            } else {
                console.error('❌ Wait delay NOT honored (<  3 seconds)');
                process.exit(1);
            }

            // Check CodeNode executed
            const codeStep = exec.steps.find((s: any) => s.nodeId === 'code-after-wait');
            if (codeStep?.status === 'completed') {
                console.log('✅ Code executed after wait');
                console.log('   Output:', codeStep.output);
                console.log('\n✅ WaitNode scheduling verified!');
                process.exit(0);
            } else {
                console.error('❌ Code did not execute');
                process.exit(1);
            }
        }

        if (exec?.status === 'failed') {
            console.error('\n❌ Execution failed');
            process.exit(1);
        }
    }

    console.error('❌ Execution timed out');
    process.exit(1);
}

runWaitNodeTest().catch(console.error);
