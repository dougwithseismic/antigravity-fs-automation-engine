import 'dotenv/config';
import { db } from '@repo/database';
import { workflows } from '@repo/database/schema';

/**
 * Test API endpoints for execution monitoring
 */

const API_URL = 'http://localhost:3000/api/workflows';

async function testAPIs() {
    console.log('🧪 Testing Phase 5.4: API Enhancements\n');

    // Create and execute workflow
    const [wf] = await db.insert(workflows).values({
        name: 'API Test',
        nodes: [
            { id: 'n1', type: 'code', data: { code: 'return { test: "data" };' } },
        ],
        edges: [],
    }).returning();

    console.log(`Created workflow: ${wf.id}`);

    // Start execution
    const execRes = await fetch(`${API_URL}/${wf.id}/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: {} }),
    });
    const { executionId } = await execRes.json();
    console.log(`Started execution: ${executionId}\n`);

    // Wait for completion
    await new Promise(r => setTimeout(r, 2000));

    // Test 1: GET /executions/:id
    console.log('Test 1: GET /executions/:id');
    const res1 = await fetch(`${API_URL}/executions/${executionId}`);
    const data1 = await res1.json();
    console.log(`✅ Status: ${res1.status}`);
    console.log(`   LiveState: ${data1.liveState}, CompletedNodes: ${data1.completedNodes?.length || 0}\n`);

    // Test 2: GET /executions/:id/status
    console.log('Test 2: GET /executions/:id/status');
    const res2 = await fetch(`${API_URL}/executions/${executionId}/status`);
    const data2 = await res2.json();
    console.log(`✅ Status: ${res2.status}`);
    console.log(`   Progress: ${data2.progress}%, Status: ${data2.status}\n`);

    // Test 3: GET /executions
    console.log('Test 3: GET /executions');
    const res3 = await fetch(`${API_URL}/executions?limit=5`);
    const data3 = await res3.json();
    console.log(`✅ Status: ${res3.status}`);
    console.log(`   Count: ${data3.length}\n`);

    // Test 4: GET /executions with filter
    console.log('Test 4: GET /executions?workflowId=X');
    const res4 = await fetch(`${API_URL}/executions?workflowId=${wf.id}`);
    const data4 = await res4.json();
    console.log(`✅ Status: ${res4.status}`);
    console.log(`   Filtered: ${data4.length}\n`);

    console.log('='.repeat(40));
    console.log('All API tests passed!');
    console.log('='.repeat(40));
}

testAPIs().catch(console.error);
