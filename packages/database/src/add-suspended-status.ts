import 'dotenv/config';
import { client } from './index';

async function addSuspendedStatus() {
    try {
        console.log('Adding "suspended" to execution_status enum...');

        // Note: This requires a direct SQL query as Drizzle doesn't support ALTER TYPE
        await client.unsafe(`
            ALTER TYPE execution_status ADD VALUE IF NOT EXISTS 'suspended';
        `);

        console.log('✅ Successfully added "suspended" status to execution_status enum');
    } catch (error: any) {
        console.error('Error:', error.message);
        if (error.message.includes('already exists')) {
            console.log('✅ Status "suspended" already exists');
        }
    } finally {
        await client.end();
    }
}

addSuspendedStatus();
