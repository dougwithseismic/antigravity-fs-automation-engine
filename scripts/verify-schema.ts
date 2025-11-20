import 'dotenv/config';
import { db } from '@repo/database';
import { sql } from 'drizzle-orm';

/**
 * Verify database schema has all required columns
 */
async function verifySchema() {
    console.log('🔍 Verifying Database Schema\n');

    try {
        // Check executions table columns using raw query
        const result: any = await db.execute(sql`
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns
            WHERE table_name = 'executions'
            ORDER BY ordinal_position;
        `);

        const columns = result;
        console.log('Executions table columns:');
        columns.forEach((col: any) => {
            console.log(`- ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
        });

        // Check if user_id exists
        const hasUserId = columns.some((col: any) => col.column_name === 'user_id');

        if (hasUserId) {
            console.log('\n✅ user_id column exists');
        } else {
            console.log('\n❌ user_id column MISSING');
            console.log('\nRun: cd packages/database && pnpm db:push');
            process.exit(1);
        }

        // Try to insert a test execution with userId
        console.log('\n🧪 Testing execution insert with userId...');

        // First create a test workflow
        const wfResult: any = await db.execute(sql`
            INSERT INTO workflows (name, nodes, edges)
            VALUES ('Test Workflow', '[]', '[]')
            RETURNING id;
        `);
        const workflowId = wfResult[0].id;

        const insertResult: any = await db.execute(sql`
            INSERT INTO executions (workflow_id, status, data, user_id)
            VALUES (${workflowId}, 'pending', '{}', 123)
            RETURNING id, user_id;
        `);

        console.log('✅ Insert successful:', insertResult[0]);

        // Clean up
        await db.execute(sql`DELETE FROM executions WHERE user_id = 123;`);
        await db.execute(sql`DELETE FROM workflows WHERE id = ${workflowId};`);

        console.log('\n✅ All schema checks passed!');
        process.exit(0);

    } catch (error: any) {
        console.error('\n❌ Schema verification failed:');
        console.error(error.message);
        process.exit(1);
    }
}

verifySchema();
