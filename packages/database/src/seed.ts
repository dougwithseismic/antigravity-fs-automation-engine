import "dotenv/config";
import { db, client } from "./index";
import { workflows } from "./schema";

// Import all workflow scenarios
import { serverLinearWorkflow } from "./seeds/01-server-linear";
import { clientLinearWorkflow } from "./seeds/02-client-linear";
import { hybridSandwichWorkflow } from "./seeds/03-hybrid-sandwich";
import { parallelServerWorkflow } from "./seeds/04-parallel-server";
import { parallelMixedWorkflow } from "./seeds/05-parallel-mixed";
import { conditionalServerWorkflow } from "./seeds/06-conditional-server";
import { conditionalMixedWorkflow } from "./seeds/07-conditional-mixed";
import { hybridSegmentationWorkflow } from "./seeds/08-hybrid-segmentation";
import { bannerABTestWorkflow } from "./seeds/09-banner-ab-test";
import { delayedNotificationWorkflow } from "./seeds/10-delayed-notification";

async function seed() {
    console.log("🌱 Seeding database with comprehensive workflow examples...");

    try {
        // Check if already seeded
        const existingWorkflows = await db.select().from(workflows).limit(1);

        if (existingWorkflows.length > 0) {
            console.log("⏭️  Database already seeded, skipping...");
            return;
        }

        // Seed in transaction
        await db.transaction(async (tx) => {
            const workflowsToSeed = [
                serverLinearWorkflow,
                clientLinearWorkflow,
                hybridSandwichWorkflow,
                parallelServerWorkflow,
                parallelMixedWorkflow,
                conditionalServerWorkflow,
                conditionalMixedWorkflow,
                hybridSegmentationWorkflow,
                bannerABTestWorkflow,
                delayedNotificationWorkflow
            ];

            console.log("\n📋 Seeding workflows:");
            workflowsToSeed.forEach((wf, idx) => {
                console.log(`   ${idx + 1}. ${wf.name} - ${wf.description}`);
            });
            console.log("");

            await tx.insert(workflows).values(workflowsToSeed);

            console.log("✅ All workflows seeded successfully");
        });

        console.log("\n✅ Database seeding complete.");
        console.log("\n💡 Workflow Coverage:");
        console.log("   ✓ Server-only execution");
        console.log("   ✓ Client-only execution");
        console.log("   ✓ Hybrid execution (server ↔ client)");
        console.log("   ✓ Parallel execution (server branches)");
        console.log("   ✓ Parallel execution (mixed server/client)");
        console.log("   ✓ Conditional routing (server)");
        console.log("   ✓ Conditional routing (mixed)");
        console.log("   ✓ Interactive Google search mockup");
        console.log("   ✓ A/B testing with variants");
        console.log("   ✓ Time-delayed workflows\n");
    } catch (error) {
        console.error("❌ Failed to seed database:", error);
        process.exit(1);
    } finally {
        await client.end();
    }
}

seed();
