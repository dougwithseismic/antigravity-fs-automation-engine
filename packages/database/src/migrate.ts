import "dotenv/config";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { db, client } from "./index";

async function runMigrations() {
    console.log("🔄 Running migrations...");

    try {
        await migrate(db, { migrationsFolder: "./drizzle" });
        console.log("✅ Migrations completed successfully");
    } catch (error) {
        console.error("❌ Migration failed:", error);
        process.exit(1);
    } finally {
        await client.end();
    }
}

runMigrations();
