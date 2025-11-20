import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { executionService } from "../execution/execution-service";

const app = new OpenAPIHono();

const ErrorSchema = z.object({
    error: z.string(),
});

// GET /executions/:id - Get execution with state
app.openapi(
    createRoute({
        method: 'get',
        path: '/{id}',
        request: {
            params: z.object({
                id: z.string().transform(Number),
            }),
        },
        responses: {
            200: {
                content: {
                    'application/json': {
                        schema: z.object({
                            id: z.number(),
                            workflowId: z.number(),
                            status: z.string(),
                            data: z.any(),
                            startedAt: z.string(),
                            finishedAt: z.string().nullable(),
                            completedNodes: z.array(z.string()),
                            currentNode: z.string().nullable(),
                            steps: z.array(z.object({
                                nodeId: z.string(),
                                nodeType: z.string(),
                                status: z.string(),
                                output: z.object({}).passthrough(),
                                startedAt: z.string(),
                                completedAt: z.string().optional(),
                                duration: z.number().optional(),
                                error: z.object({
                                    message: z.string(),
                                    stack: z.string().optional(),
                                }).optional(),
                            })),
                            variables: z.object({}).passthrough(),
                            liveState: z.boolean(),
                        }),
                    },
                },
                description: 'Execution details with Redis state',
            },
            404: {
                content: { 'application/json': { schema: ErrorSchema } },
                description: 'Execution not found',
            },
        },
    }),
    async (c) => {
        const { id } = c.req.valid('param');
        const execution = await executionService.getExecutionWithState(id);

        if (!execution) {
            return c.json({ error: 'Execution not found' }, 404);
        }

        return c.json(execution);
    },
);

// GET /executions/:id/status - Quick status check
app.openapi(
    createRoute({
        method: 'get',
        path: '/{id}/status',
        request: {
            params: z.object({
                id: z.string().transform(Number),
            }),
        },
        responses: {
            200: {
                content: {
                    'application/json': {
                        schema: z.object({
                            status: z.string(),
                            completedNodes: z.number(),
                            totalNodes: z.number(),
                            currentNode: z.string().nullable(),
                            progress: z.number(),
                        }),
                    },
                },
                description: 'Quick execution status',
            },
            404: {
                content: { 'application/json': { schema: ErrorSchema } },
                description: 'Execution not found',
            },
        },
    }),
    async (c) => {
        const { id } = c.req.valid('param');
        const status = await executionService.getExecutionStatus(id);

        if (!status) {
            return c.json({ error: 'Execution not found' }, 404);
        }

        return c.json(status);
    },
);

// POST /executions/:id/cancel - Cancel execution
app.openapi(
    createRoute({
        method: 'post',
        path: '/{id}/cancel',
        request: {
            params: z.object({
                id: z.string().transform(Number),
            }),
        },
        responses: {
            200: {
                content: {
                    'application/json': {
                        schema: z.object({
                            success: z.boolean(),
                            executionId: z.number(),
                        }),
                    },
                },
                description: 'Execution cancelled',
            },
        },
    }),
    async (c) => {
        const { id } = c.req.valid('param');
        const result = await executionService.cancelExecution(id);
        return c.json(result);
    },
);

// POST /executions/:id/retry - Retry failed execution
app.openapi(
    createRoute({
        method: 'post',
        path: '/{id}/retry',
        request: {
            params: z.object({
                id: z.string().transform(Number),
            }),
        },
        responses: {
            200: {
                content: {
                    'application/json': {
                        schema: z.object({
                            success: z.boolean(),
                            executionId: z.number(),
                        }),
                    },
                },
                description: 'Execution retried',
            },
            400: {
                content: { 'application/json': { schema: ErrorSchema } },
                description: 'Cannot retry (not failed)',
            },
        },
    }),
    async (c) => {
        const { id } = c.req.valid('param');
        try {
            const result = await executionService.retryExecution(id);
            return c.json(result);
        } catch (error: any) {
            return c.json({ error: error.message }, 400);
        }
    },
);

// POST /executions/:id/resume - Resume suspended execution with client data
app.openapi(
    createRoute({
        method: "post",
        path: "/{id}/resume",
        request: {
            params: z.object({
                id: z.string().transform((v) => Number(v)),
            }),
            body: {
                content: {
                    "application/json": {
                        schema: z.object({
                            data: z.object({}).passthrough(), // Client-provided data (e.g., form fields)
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
                            status: z.string(),
                            message: z.string(),
                        }),
                    },
                },
                description: "Execution resumed",
            },
            400: {
                content: {
                    "application/json": {
                        schema: ErrorSchema,
                    },
                },
                description: "Cannot resume (not suspended or invalid state)",
            },
        },
    }),
    async (c) => {
        const id = Number(c.req.param("id"));
        const body = await c.req.json();

        console.log("Resuming execution", id, "with data:", body.data);

        try {
            const { orchestrator } = await import("../execution/orchestrator");
            const result = await orchestrator.resumeExecution(id, body.data);
            return c.json(result, 200);
        } catch (e: any) {
            console.error("Resume failed", e);
            return c.json({ error: e.message }, 400);
        }
    },
);

// GET /executions - List executions
app.openapi(
    createRoute({
        method: 'get',
        path: '/',
        request: {
            query: z.object({
                workflowId: z.string().transform(Number).optional(),
                status: z.string().optional(),
                limit: z.string().transform(Number).optional(),
                offset: z.string().transform(Number).optional(),
            }),
        },
        responses: {
            200: {
                content: {
                    'application/json': {
                        schema: z.array(z.object({
                            id: z.number(),
                            workflowId: z.number(),
                            status: z.string(),
                            data: z.any(),
                            startedAt: z.string(),
                            finishedAt: z.string().nullable(),
                        })),
                    },
                },
                description: 'List of executions',
            },
        },
    }),
    async (c) => {
        const filters = c.req.valid('query');
        const executions = await executionService.listExecutions(filters);
        return c.json(executions);
    },
);

export default app;