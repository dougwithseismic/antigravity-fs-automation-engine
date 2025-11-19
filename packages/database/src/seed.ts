import "dotenv/config";
import { db, client } from "./index";
import { workflows } from "./schema";
import { ppcWorkflow } from "./seeds/ppc-workflow";

async function seed() {
    console.log("🌱 Seeding database...");

    try {
        // Check if already seeded
        const existingWorkflows = await db.select().from(workflows).limit(1);

        if (existingWorkflows.length > 0) {
            console.log("⏭️  Database already seeded, skipping...");
            return;
        }

        // Seed in transaction
        await db.transaction(async (tx) => {
            // Seed Workflows
            console.log("   - Seeding workflows...");
            await tx.insert(workflows).values(ppcWorkflow);
            console.log("✅ Workflows seeded");
        });

        console.log("✅ Database seeding complete.");
    } catch (error) {
        console.error("❌ Failed to seed database:", error);
        process.exit(1);
    } finally {
        await client.end();
    }
}

seed();
