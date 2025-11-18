import { db, workflows, eq } from '@repo/database';
import { executeWorkflow } from './execution/engine';

async function verifyHybrid() {
    // 1. Create a Hybrid Workflow
    const [wf] = await db.insert(workflows).values({
        name: 'Hybrid Verification Workflow',
        nodes: [
            { id: '1', type: 'start', data: { label: 'Start' } },
            { id: '2', type: 'window-alert', data: { message: 'Hello from Server' }, environment: 'client' }
        ],
        edges: [
            { source: '1', target: '2' }
        ]
    }).returning();

    if (!wf) {
        throw new Error('Failed to create workflow');
    }

    console.log('Created Workflow:', wf.id);

    // 2. Execute
    const result = await executeWorkflow(wf.id, {});

    console.log('Execution Result:', JSON.stringify(result, null, 2));

    if (result.status === 'waiting' && result.nextStep?.nodeId === '2') {
        console.log('SUCCESS: Server suspended and returned client node!');
    } else {
        console.error('FAILURE: Server did not suspend correctly.');
        process.exit(1);
    }
}

verifyHybrid().catch(console.error).finally(() => process.exit(0));
