import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { db, workflows, eq } from "@repo/database";
const app = new OpenAPIHono();

const WorkflowSchema = z.object({
    id: z.number().openapi({ example: 1 }),
    name: z.string().openapi({ example: "My Workflow" }),
    nodes: z.any().openapi({ example: [] }), // Relaxed to any to handle JSONValue
    edges: z.any().openapi({ example: [] }), // Relaxed to any to handle JSONValue
    createdAt: z.string().optional(),
    updatedAt: z.string().optional(),
});

const CreateWorkflowSchema = z.object({
    name: z.string().optional().openapi({ example: "New Workflow" }),
    nodes: z.any().optional(),
    edges: z.any().optional(),
});

const UpdateWorkflowSchema = z.object({
    name: z.string().optional(),
    nodes: z.any().optional(),
    edges: z.any().optional(),
});

const ErrorSchema = z.object({
    error: z.string(),
});

// List workflows
app.openapi(
    createRoute({
        method: "get",
        path: "/",
        responses: {
            200: {
                content: {
                    "application/json": {
                        schema: z.array(WorkflowSchema),
                    },
                },
                description: "List of workflows",
            },
        },
    }),
    async (c) => {
        const result = await db.query.workflows.findMany({
            orderBy: (workflows, { desc }) => [desc(workflows.updatedAt)],
        });
        // Cast result to match schema if necessary, but z.any() should handle it
        return c.json(result as any);
    },
);

// Get workflow by ID
app.openapi(
    createRoute({
        method: "get",
        path: "/{id}",
        request: {
            params: z.object({
                id: z.string().transform((v) => Number(v)),
            }),
        },
        responses: {
            200: {
                content: {
                    "application/json": {
                        schema: WorkflowSchema,
                    },
                },
                description: "Workflow details",
            },
            404: {
                content: {
                    "application/json": {
                        schema: ErrorSchema,
                    },
                },
                description: "Workflow not found",
            },
        },
    }),
    async (c) => {
        const id = Number(c.req.param("id"));
        const result = await db.query.workflows.findFirst({
            where: eq(workflows.id, id),
        });
        if (!result) return c.json({ error: "Workflow not found" }, 404);
        return c.json(result as any, 200);
    },
);

import { validateWorkflow } from "../validation/validator";

// ... imports

// Create workflow
app.openapi(
    createRoute({
        method: "post",
        path: "/",
        request: {
            body: {
                content: {
                    "application/json": {
                        schema: CreateWorkflowSchema,
                    },
                },
            },
        },
        responses: {
            200: {
                content: {
                    "application/json": {
                        schema: WorkflowSchema,
                    },
                },
                description: "Created workflow",
            },
            400: {
                content: {
                    "application/json": {
                        schema: ErrorSchema,
                    },
                },
                description: "Validation error",
            },
        },
    }),
    async (c) => {
        const body = await c.req.json();
        console.log("Creating workflow", body.name);

        if (body.nodes) {
            const errors = validateWorkflow(body.nodes);
            if (errors.length > 0) {
                return c.json({ error: `Validation failed: ${errors.map(e => e.message).join(", ")}` }, 400);
            }
        }

        const result = await db
            .insert(workflows)
            .values({
                name: body.name || "Untitled Workflow",
                nodes: body.nodes || [],
                edges: body.edges || [],
            })
            .returning();

        console.log("Workflow created", result[0]?.id);
        return c.json(result[0] as any, 200);
    },
);

// Update workflow
app.openapi(
    createRoute({
        method: "put",
        path: "/{id}",
        request: {
            params: z.object({
                id: z.string().transform((v) => Number(v)),
            }),
            body: {
                content: {
                    "application/json": {
                        schema: UpdateWorkflowSchema,
                    },
                },
            },
        },
        responses: {
            200: {
                content: {
                    "application/json": {
                        schema: WorkflowSchema,
                    },
                },
                description: "Updated workflow",
            },
            404: {
                content: {
                    "application/json": {
                        schema: ErrorSchema,
                    },
                },
                description: "Workflow not found",
            },
            400: {
                content: {
                    "application/json": {
                        schema: ErrorSchema,
                    },
                },
                description: "Validation error",
            },
        },
    }),
    async (c) => {
        const id = Number(c.req.param("id"));
        const body = await c.req.json();

        console.log("Updating workflow", id);

        if (body.nodes) {
            const errors = validateWorkflow(body.nodes);
            if (errors.length > 0) {
                return c.json({ error: `Validation failed: ${errors.map(e => e.message).join(", ")}` }, 400);
            }
        }

        const result = await db
            .update(workflows)
            .set({
                name: body.name,
                nodes: body.nodes,
                edges: body.edges,
                updatedAt: new Date(),
            })
            .where(eq(workflows.id, id))
            .returning();

        if (result.length === 0) {
            console.warn("Workflow not found for update", id);
            return c.json({ error: "Workflow not found" }, 404);
        }

        console.log("Workflow updated", id);
        return c.json(result[0] as any, 200);
    },
);

// Delete workflow
app.openapi(
    createRoute({
        method: "delete",
        path: "/{id}",
        request: {
            params: z.object({
                id: z.string().transform((v) => Number(v)),
            }),
        },
        responses: {
            200: {
                content: {
                    "application/json": {
                        schema: z.object({ message: z.string() }),
                    },
                },
                description: "Workflow deleted",
            },
            404: {
                content: {
                    "application/json": {
                        schema: ErrorSchema,
                    },
                },
                description: "Workflow not found",
            },
        },
    }),
    async (c) => {
        const id = Number(c.req.param("id"));

        console.log("Deleting workflow", id);

        const result = await db
            .delete(workflows)
            .where(eq(workflows.id, id))
            .returning();

        if (result.length === 0) {
            console.warn("Workflow not found for deletion", id);
            return c.json({ error: "Workflow not found" }, 404);
        }

        console.log("Workflow deleted", id);
        return c.json({ message: "Workflow deleted" }, 200);
    },
);

// Execute workflow
app.openapi(
    createRoute({
        method: "post",
        path: "/{id}/execute",
        request: {
            params: z.object({
                id: z.string().transform((v) => Number(v)),
            }),
            body: {
                content: {
                    "application/json": {
                        schema: z.object({
                            input: z.any().optional(),
                        }),
                    },
                },
            },
        },
        responses: {
            200: {
                content: {
                    "application/json": {
                        schema: z.object({
                            executionId: z.number(),
                            status: z.string(),
                        }),
                    },
                },
                description: "Execution started",
            },
            404: {
                content: {
                    "application/json": {
                        schema: ErrorSchema,
                    },
                },
                description: "Workflow not found",
            },
        },
    }),
    async (c) => {
        const id = Number(c.req.param("id"));
        const body = await c.req.json().catch(() => ({})); // Optional body

        console.log("Executing workflow", id);

        // Verify workflow exists
        const workflow = await db.query.workflows.findFirst({
            where: eq(workflows.id, id),
        });

        if (!workflow) {
            return c.json({ error: "Workflow not found" }, 404);
        }

        // Start execution via orchestrator
        const { orchestrator } = await import("../execution/orchestrator");
        // Accept input either as body.input (legacy) or as the whole body
        const input = body.input !== undefined ? body.input : body;
        const execution = await orchestrator.startWorkflow(id, input);

        return c.json({
            executionId: execution.id,
            status: execution.status,
        }, 200);
    },
);

export default app;
