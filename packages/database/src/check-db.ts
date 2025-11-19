import "dotenv/config";
import { sql } from "drizzle-orm";
import { db, client } from "./index";

async function checkDb() {
    console.log("🔍 Checking database state...\n");

    try {
        // Check schemas
        const schemas = await db.execute(sql`
            SELECT schema_name
            FROM information_schema.schemata
            WHERE schema_name NOT IN ('information_schema', 'pg_catalog', 'pg_toast')
            ORDER BY schema_name
        `);
        console.log("📁 Schemas:");
        if (Array.isArray(schemas)) {
            schemas.forEach((row: any) => console.log(`   - ${row.schema_name}`));
        }

        // Check extensions
        const extensions = await db.execute(sql`
            SELECT extname, extversion
            FROM pg_extension
            ORDER BY extname
        `);
        console.log("\n🧩 Extensions:");
        if (Array.isArray(extensions)) {
            extensions.forEach((row: any) => console.log(`   - ${row.extname} (${row.extversion})`));
        }

        // Check tables
        const tables = await db.execute(sql`
            SELECT table_name
            FROM information_schema.tables
            WHERE table_schema = 'public'
            ORDER BY table_name
        `);
        console.log("📊 Tables:");
        console.log(tables);
        if (Array.isArray(tables)) {
            tables.forEach((row: any) => console.log(`   - ${row.table_name}`));
        }

        // Check enums with their schemas
        const enums = await db.execute(sql`
            SELECT n.nspname as schema_name, t.typname as enum_name
            FROM pg_type t
            JOIN pg_enum e ON t.oid = e.enumtypid
            JOIN pg_namespace n ON t.typnamespace = n.oid
            WHERE t.typtype = 'e'
            GROUP BY n.nspname, t.typname
            ORDER BY n.nspname, t.typname
        `);
        console.log("\n🏷️  Enums (by schema):");
        if (Array.isArray(enums)) {
            enums.forEach((row: any) => console.log(`   - ${row.schema_name}.${row.enum_name}`));
        }

        // Check indexes
        const indexes = await db.execute(sql`
            SELECT indexname
            FROM pg_indexes
            WHERE schemaname = 'public'
            ORDER BY indexname
        `);
        console.log("\n📑 Indexes:");
        if (Array.isArray(indexes)) {
            indexes.forEach((row: any) => console.log(`   - ${row.indexname}`));
        }

        console.log("\n✅ Database check complete.");
    } catch (error) {
        console.error("❌ Failed to check database:", error);
        process.exit(1);
    } finally {
        await client.end();
    }
}

checkDb();
