import { pgTable, serial, text, timestamp, jsonb } from "drizzle-orm/pg-core";

export const workflows = pgTable("workflows", {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    nodes: jsonb("nodes").default("[]").notNull(),
    edges: jsonb("edges").default("[]").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const executions = pgTable("executions", {
    id: serial("id").primaryKey(),
    workflowId: serial("workflow_id").references(() => workflows.id),
    status: text("status").notNull(), // 'pending', 'running', 'completed', 'failed', 'waiting'
    data: jsonb("data"),
    startedAt: timestamp("started_at").defaultNow().notNull(),
    finishedAt: timestamp("finished_at"),
});

export const executionSteps = pgTable("execution_steps", {
    id: serial("id").primaryKey(),
    executionId: serial("execution_id").references(() => executions.id),
    nodeId: text("node_id").notNull(),
    status: text("status").notNull(), // 'pending', 'running', 'completed', 'failed', 'suspended'
    input: jsonb("input"),
    output: jsonb("output"),
    startedAt: timestamp("started_at").defaultNow().notNull(),
    finishedAt: timestamp("finished_at"),
});
