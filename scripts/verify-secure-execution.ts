import 'dotenv/config';
import { orchestrator } from '../apps/api/src/execution/orchestrator';
import { WorkflowWorker } from '../apps/worker/src/workers/workflow-worker';
import { NodeWorker } from '../apps/worker/src/workers/node-worker';
import { db } from '@repo/database';
import { workflows, executions, executionSteps } from '@repo/database/schema';
import { eq } from 'drizzle-orm';
import 'dotenv/config';

async function main() {
    console.log('🚀 Starting Secure Execution Verification');

    // 1. Create a workflow with a Code Node
    console.log('Creating secure workflow...');
    const [workflow] = await db.insert(workflows).values({
        name: 'Secure Code Workflow',
        nodes: [
            {
                id: 'code-node',
                type: 'code',
                data: {
                    code: 'return { foo: "bar" };'
                }
            }
        ],
        edges: [],
    }).returning();

    console.log(`Workflow created: ${workflow.id}`);

    // 2. Start Workers
    console.log('Starting workers...');
    const wfWorker = new WorkflowWorker();
    const nodeWorker = new NodeWorker();

    // 3. Start Execution
    console.log('Starting execution...');
    const execution = await orchestrator.startWorkflow(workflow.id, { value: 'secure world' });
    console.log(`Execution started: ${execution.id}`);

    // 4. Poll for completion
    console.log('Waiting for completion...');
    let attempts = 0;
    while (attempts < 10) {
        await new Promise(r => setTimeout(r, 1000));

        const steps = await db.select().from(executionSteps).where(eq(executionSteps.executionId, execution.id));

        if (steps.length > 0) {
            const step = steps[0];
            console.log(`Step status: ${step.status}`);

            if (step.status === 'completed') {
                console.log('Output:', JSON.stringify(step.output, null, 2));
                if (step.output.foo === 'bar') {
                    console.log('✅ Secure execution verified!');
                    process.exit(0);
                } else {
                    console.error('❌ Unexpected output');
                    process.exit(1);
                }
            } else if (step.status === 'failed') {
                console.error('❌ Step failed:', step.output);
                process.exit(1);
            }
        }

        attempts++;
    }

    console.error('❌ Execution timed out');
    process.exit(1);
}

main().catch(console.error);
