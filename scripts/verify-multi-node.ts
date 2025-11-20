import 'dotenv/config';
import { db } from '@repo/database';
import { workflows, executions, executionSteps } from '@repo/database/schema';
import { eq } from 'drizzle-orm';
import { WorkflowWorker } from '../apps/worker/src/workers/workflow-worker';
import { NodeWorker } from '../apps/worker/src/workers/node-worker';

/**
 * Multi-node workflow test
 * Tests: Fetch → Filter chain
 */

async function runMultiNodeTest() {
    console.log('🚀 Starting Multi-Node Workflow Test');

    // Create workflow: Fetch users → Filter active users
    console.log('Creating multi-node workflow...');
    const [workflow] = await db.insert(workflows).values({
        name: 'Fetch and Filter Users',
        nodes: [
            {
                id: 'fetch-users',
                type: 'fetch',
                data: {
                    url: 'https://jsonplaceholder.typicode.com/users',
                    method: 'GET'
                }
            },
            {
                id: 'filter-active',
                type: 'filter',
                data: {
                    condition: 'id <= 3' // Filter first 3 users
                }
            }
        ],
        edges: [
            { source: 'fetch-users', target: 'filter-active' }
        ],
    }).returning();

    console.log('Workflow created:', workflow.id);

    // Start workers
    console.log('Starting workers...');
    const workflowWorker = new WorkflowWorker();
    const nodeWorker = new NodeWorker();

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

    // Poll for completion
    console.log('Waiting for completion...');
    for (let i = 0; i < 30; i++) {
        await new Promise(resolve => setTimeout(resolve, 1000));

        const exec = await db.query.executions.findFirst({
            where: eq(executions.id, execution.id),
            with: { steps: true },
        });

        console.log(`Status: ${exec?.status}, Steps: ${exec?.steps?.length || 0}`);

        if (exec?.status === 'completed') {
            console.log('\n✅ Workflow completed!');

            // Check steps
            const fetchStep = exec.steps.find((s: any) => s.nodeId === 'fetch-users');
            const filterStep = exec.steps.find((s: any) => s.nodeId === 'filter-active');

            console.log('\n📊 Results:');
            console.log('Fetch step:', fetchStep?.status);
            console.log('Fetched users:', Array.isArray(fetchStep?.output) ? filterStep?.output.length : 'N/A');

            console.log('\nFilter step:', filterStep?.status);
            console.log('Filtered users:', Array.isArray(filterStep?.output) ? filterStep?.output.length : 'N/A');

            if (filterStep?.status === 'completed' && Array.isArray(filterStep?.output) && filterStep.output.length === 3) {
                console.log('\n✅ Multi-node execution verified!');
                process.exit(0);
            } else {
                console.error('\n❌ Unexpected results');
                console.log('Filter output:', JSON.stringify(filterStep?.output, null, 2));
                process.exit(1);
            }
        }

        if (exec?.status === 'failed') {
            console.error('\n❌ Execution failed');
            const failedStep = exec.steps.find((s: any) => s.status === 'failed');
            console.error('Failed step:', failedStep);
            process.exit(1);
        }
    }

    console.error('❌ Execution timed out');
    process.exit(1);
}

runMultiNodeTest().catch(console.error);
