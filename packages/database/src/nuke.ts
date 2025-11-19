import "dotenv/config";
import { sql } from "drizzle-orm";
import { db, client } from "./index";

async function nuke() {
    // Prevent running in production
    if (process.env.NODE_ENV === 'production') {
        console.error("❌ NUKE is disabled in production environment!");
        console.error("This operation would destroy all data and schema.");
        process.exit(1);
    }

    // Additional safety check for production-like database URLs
    const dbUrl = process.env.DATABASE_URL || '';
    if (dbUrl.includes('prod') || dbUrl.includes('.com') || dbUrl.includes('rds.amazonaws')) {
        console.error("❌ Database URL appears to be a production database!");
        console.error("NUKE is only allowed on local development databases.");
        process.exit(1);
    }

    console.log("☢️  Nuking database schema...");
    console.warn("⚠️  This will destroy ALL data and schema!");

    try {
        // Drop public schema and recreate it
        await db.execute(sql`DROP SCHEMA IF EXISTS public CASCADE`);
        await db.execute(sql`CREATE SCHEMA public`);

        // Grant permissions (standard for Postgres default setup)
        await db.execute(sql`GRANT ALL ON SCHEMA public TO postgres`);
        await db.execute(sql`GRANT ALL ON SCHEMA public TO public`);

        console.log("✅ Database schema nuked successfully.");
    } catch (error) {
        console.error("❌ Failed to nuke database:", error);
        process.exit(1);
    } finally {
        await client.end();
    }
}

nuke();
