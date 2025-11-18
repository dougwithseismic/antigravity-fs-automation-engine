import "dotenv/config";
import { sql } from "drizzle-orm";
import { db, client } from "./index";

async function reset() {
    console.log("💥 Nuking database...");

    try {
        // Disable triggers to allow truncation of tables with foreign keys
        await db.execute(sql`SET session_replication_role = 'replica'`);

        const tables = ["execution_steps", "executions", "workflows"];

        for (const table of tables) {
            await db.execute(sql.raw(`TRUNCATE TABLE ${table} RESTART IDENTITY CASCADE`));
            console.log(`   - Truncated ${table}`);
        }

        // Re-enable triggers
        await db.execute(sql`SET session_replication_role = 'origin'`);

        console.log("✅ Database reset complete.");
    } catch (error) {
        console.error("❌ Failed to reset database:", error);
        process.exit(1);
    } finally {
        await client.end();
    }
}

reset();
