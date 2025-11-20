import 'dotenv/config';
import { orchestrator } from '../apps/api/src/execution/orchestrator';
import { WorkflowWorker } from '../apps/worker/src/workers/workflow-worker';
import { NodeWorker } from '../apps/worker/src/workers/node-worker';
import { db } from '@repo/database';
import { workflows, executions, executionSteps } from '@repo/database/schema';
import { eq } from 'drizzle-orm';

async function main() {
    console.log('🚀 Starting Async Engine Verification');

    // 1. Create a test workflow
    console.log('Creating test workflow...');
    const [workflow] = await db.insert(workflows).values({
        name: 'Async Test Workflow',
        nodes: [
            { id: 'node-1', type: 'test-node', data: { value: 'start' } },
            { id: 'node-2', type: 'test-node', data: { value: 'end' } }
        ],
        edges: [
            { id: 'edge-1', source: 'node-1', target: 'node-2' }
        ],
    }).returning();

    console.log(`Workflow created: ${workflow.id}`);

    // 2. Start Workers
    console.log('Starting workers...');
    const wfWorker = new WorkflowWorker();
    const nodeWorker = new NodeWorker();

    // 3. Start Execution
    console.log('Starting execution...');
    const execution = await orchestrator.startWorkflow(workflow.id, { test: true });
    console.log(`Execution started: ${execution.id}`);

    // 4. Poll for completion
    console.log('Waiting for completion...');
    let attempts = 0;
    while (attempts < 10) {
        await new Promise(r => setTimeout(r, 1000));

        const status = await orchestrator.getExecutionStatus(execution.id);
        console.log(`Status: ${status?.status}`);

        // Check steps
        const steps = await db.select().from(executionSteps).where(eq(executionSteps.executionId, execution.id));
        console.log(`Steps completed: ${steps.length}`);
        steps.forEach(s => console.log(` - ${s.nodeId}: ${s.status}`));

        if (steps.length === 2 && steps.every(s => s.status === 'completed')) {
            console.log('✅ Execution completed successfully!');
            process.exit(0);
        }

        attempts++;
    }

    console.error('❌ Execution timed out');
    process.exit(1);
}

main().catch(console.error);
