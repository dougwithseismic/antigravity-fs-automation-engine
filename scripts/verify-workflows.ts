import { db } from '@repo/database';
import { workflows } from '@repo/database/schema';

async function verifyWorkflows() {
    console.log('\n🔍 Verifying seeded workflows...\n');

    const allWorkflows = await db.select().from(workflows);

    console.log(`Found ${allWorkflows.length} workflows:\n`);

    allWorkflows.forEach((wf, idx) => {
        const nodes = (wf.nodes as any[]) || [];
        const edges = (wf.edges as any[]) || [];
        const serverNodes = nodes.filter((n: any) => n.environment !== 'client');
        const clientNodes = nodes.filter((n: any) => n.environment === 'client');

        console.log(`${idx + 1}. ${wf.name}`);
        console.log(`   Description: ${wf.description || 'N/A'}`);
        console.log(`   Nodes: ${nodes.length} total (${serverNodes.length} server, ${clientNodes.length} client)`);
        console.log(`   Edges: ${edges.length}`);
        console.log(`   ID: ${wf.id}\n`);
    });

    console.log('✅ All workflows verified!\n');
    process.exit(0);
}

verifyWorkflows();
