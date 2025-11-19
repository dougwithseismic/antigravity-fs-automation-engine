import "dotenv/config";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// Validate DATABASE_URL
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
    throw new Error('DATABASE_URL environment variable is required');
}

// Debug logging
console.log('📦 @repo/database initializing with URL:', connectionString);

// Create postgres client with connection pooling
export const client = postgres(connectionString, {
    max: parseInt(process.env.DB_POOL_SIZE || '10'),
    idle_timeout: 20,
    connect_timeout: 10,
});

// Create Drizzle instance
export const db = drizzle(client, { schema });

// Export schema and common Drizzle utilities
export * from "./schema";
export { eq, and, or, sql, desc, asc } from "drizzle-orm";

// Export inferred types for type safety
export type Workflow = typeof schema.workflows.$inferSelect;
export type NewWorkflow = typeof schema.workflows.$inferInsert;
export type Execution = typeof schema.executions.$inferSelect;
export type NewExecution = typeof schema.executions.$inferInsert;
export type ExecutionStep = typeof schema.executionSteps.$inferSelect;
export type NewExecutionStep = typeof schema.executionSteps.$inferInsert;
