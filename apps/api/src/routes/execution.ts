import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { executeWorkflow, resumeExecution } from "../execution/engine";
const app = new OpenAPIHono();

const ExecutionResultSchema = z.object({
    success: z.boolean().optional(),
    data: z.any().optional(),
    error: z.string().optional(),
});

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
                        schema: z.record(z.string(), z.any()).optional(),
                    },
                },
            },
        },
        responses: {
            200: {
                content: {
                    "application/json": {
                        schema: ExecutionResultSchema,
                    },
                },
                description: "Execution result",
            },
        },
    }),
    async (c) => {
        const id = Number(c.req.param("id"));
        const body = await c.req.json().catch(() => ({})); // Optional body

        console.log("Executing workflow", id);

        const result = await executeWorkflow(id, body);

        console.log("Workflow execution completed", id, result.status);
        return c.json(result as any, 200);
    },
);

app.openapi(
    createRoute({
        method: "post",
        path: "/executions/{id}/resume", // Changed path to be more RESTful for executions
        request: {
            params: z.object({
                id: z.string().transform((v) => Number(v)),
            }),
            body: {
                content: {
                    "application/json": {
                        schema: z.object({
                            nodeId: z.string(),
                            data: z.record(z.string(), z.any()).optional(),
                        }),
                    },
                },
            },
        },
        responses: {
            200: {
                content: {
                    "application/json": {
                        schema: ExecutionResultSchema,
                    },
                },
                description: "Resume result",
            },
            500: {
                content: {
                    "application/json": {
                        schema: z.object({ error: z.string() }),
                    },
                },
                description: "Server error",
            },
        },
    }),
    async (c) => {
        const id = Number(c.req.param("id"));
        const body = await c.req.json();

        console.log("Resuming execution", id, body.nodeId);

        try {
            const result = await resumeExecution(id, body.nodeId, body.data || {});
            console.log("Execution resumed", id, result.status);
            return c.json(result as any, 200);
        } catch (e: any) {
            console.error("Resume failed", e);
            return c.json({ error: e.message }, 500);
        }
    },
);



export default app;
