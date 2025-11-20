import { pgTable, serial, text, timestamp, jsonb, integer, pgEnum, index } from "drizzle-orm/pg-core";

export const executionStatusEnum = pgEnum('execution_status', [
    'pending',
    'running',
    'paused',
    'suspended',
    'waiting',
    'completed',
    'failed',
    'cancelled'
]);

export const stepStatusEnum = pgEnum('step_status', [
    'pending',
    'running',
    'suspended',
    'completed',
    'failed',
    'skipped'
]);

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
    workflowId: integer("workflow_id").references(() => workflows.id),
    status: executionStatusEnum("status").notNull(),
    data: jsonb("data"),
    startedAt: timestamp("started_at").defaultNow().notNull(),
    finishedAt: timestamp("finished_at"),
    currentState: jsonb("current_state"),
    snapshotCount: integer("snapshot_count").default(0),
    pauseCount: integer("pause_count").default(0),
    totalSteps: integer("total_steps").default(0),
    completedSteps: integer("completed_steps").default(0),
    failedSteps: integer("failed_steps").default(0),
    userId: integer("user_id"),
}, (table) => ({
    workflowIdIdx: index("executions_workflow_id_idx").on(table.workflowId),
    statusIdx: index("executions_status_idx").on(table.status),
    userIdIdx: index("executions_user_id_idx").on(table.userId),
    startedAtIdx: index("executions_started_at_idx").on(table.startedAt),
}));

export const executionSteps = pgTable("execution_steps", {
    id: serial("id").primaryKey(),
    executionId: integer("execution_id").references(() => executions.id),
    nodeId: text("node_id").notNull(),
    status: stepStatusEnum("status").notNull(),
    input: jsonb("input"),
    output: jsonb("output"),
    startedAt: timestamp("started_at").defaultNow().notNull(),
    finishedAt: timestamp("finished_at"),
    attemptNumber: integer("attempt_number").default(0),
    lastError: text("last_error"),
    scheduledFor: timestamp("scheduled_for"),
    inputSchema: jsonb("input_schema"),
    outputSchema: jsonb("output_schema"),
    validationErrors: jsonb("validation_errors"),
}, (table) => ({
    executionIdIdx: index("execution_steps_execution_id_idx").on(table.executionId),
    nodeIdIdx: index("execution_steps_node_id_idx").on(table.nodeId),
    statusIdx: index("execution_steps_status_idx").on(table.status),
}));

import { relations } from "drizzle-orm";

export const workflowsRelations = relations(workflows, ({ many }) => ({
    executions: many(executions),
}));

export const executionsRelations = relations(executions, ({ one, many }) => ({
    workflow: one(workflows, {
        fields: [executions.workflowId],
        references: [workflows.id],
    }),
    steps: many(executionSteps),
}));

export const executionStepsRelations = relations(executionSteps, ({ one }) => ({
    execution: one(executions, {
        fields: [executionSteps.executionId],
        references: [executions.id],
    }),
}));
