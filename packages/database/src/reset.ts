import "dotenv/config";
import { sql } from "drizzle-orm";
import { db, client } from "./index";
import { workflows, executions, executionSteps } from "./schema";

async function reset() {
    console.log("💥 Resetting database (truncating all tables)...");

    // Prevent running in production
    if (process.env.NODE_ENV === 'production') {
        console.error("❌ RESET is disabled in production environment!");
        console.error("This operation would destroy all data.");
        process.exit(1);
    }

    try {
        // Use Drizzle's delete instead of raw SQL for safety
        await db.transaction(async (tx) => {
            console.log("   - Deleting execution_steps...");
            await tx.delete(executionSteps);

            console.log("   - Deleting executions...");
            await tx.delete(executions);

            console.log("   - Deleting workflows...");
            await tx.delete(workflows);
        });

        console.log("✅ Database reset complete.");
    } catch (error) {
        console.error("❌ Failed to reset database:", error);
        process.exit(1);
    } finally {
        await client.end();
    }
}

reset();
