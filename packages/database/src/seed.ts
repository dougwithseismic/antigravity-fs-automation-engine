import "dotenv/config";
import { db, client } from "./index";
import { workflows } from "./schema";
import { ppcWorkflow } from "./seeds/ppc-workflow";

async function seed() {
    console.log("🌱 Seeding database...");

    try {
        // Seed Workflows
        console.log("   - Seeding workflows...");

        await db.insert(workflows).values(ppcWorkflow).returning();

        console.log("✅ Database seeding complete.");
    } catch (error) {
        console.error("❌ Failed to seed database:", error);
        process.exit(1);
    } finally {
        await client.end();
    }
}

seed();
