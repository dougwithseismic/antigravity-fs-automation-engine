import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { WorkflowOrchestrator } from "../execution/orchestrator";
import { db } from "@repo/database";
import { workflows } from "@repo/database/schema";
import { eq } from "drizzle-orm";

const app = new OpenAPIHono();
const orchestrator = new WorkflowOrchestrator();

const triggerWebhookRoute = createRoute({
    method: "post",
    path: "/:webhookId",
    tags: ["webhooks"],
    summary: "Trigger a workflow via webhook",
    description: "Starts a workflow execution for the given webhook ID. The body, query, and headers will be passed as input.",
    request: {
        params: z.object({
            webhookId: z.string().openapi({
                param: {
                    name: "webhookId",
                    in: "path",
                },
                example: "webhook-123",
            }),
        }),
    },
    responses: {
        200: {
            description: "Workflow started successfully",
            content: {
                "application/json": {
                    schema: z.object({
                        executionId: z.number(),
                        status: z.string(),
                    }),
                },
            },
        },
        404: {
            description: "Webhook not found",
            content: {
                "application/json": {
                    schema: z.object({
                        error: z.string(),
                    }),
                },
            },
        },
        500: {
            description: "Internal Server Error",
            content: {
                "application/json": {
                    schema: z.object({
                        error: z.string(),
                    }),
                },
            },
        },
    },
});

app.openapi(triggerWebhookRoute, async (c) => {
    const { webhookId } = c.req.valid("param");

    // Capture request details
    const body = await c.req.json().catch(() => ({})); // Handle non-JSON bodies gracefully
    const query = c.req.query();
    const headers = c.req.header();
    const method = c.req.method;
    const path = c.req.path;

    console.log(`🪝 Webhook triggered: ${webhookId}`);

    // 1. Find the workflow that contains a WebhookNode with this ID
    // For MVP, we'll assume the webhookId matches a specific node property or we just find ANY workflow with a WebhookNode
    // To make this robust, we'd need a lookup table or index.
    // For now, let's iterate workflows (inefficient but works for MVP) or assume webhookId IS the workflowId for simplicity?
    // Actually, let's stick to the plan: "Lookup workflow containing a WebhookNode with the matching ID/config"

    // Fetch all workflows (LIMITATION: This is bad for scale, but fine for MVP)
    const allWorkflows = await db.query.workflows.findMany();

    let targetWorkflowId: number | null = null;
    let targetNodeId: string | null = null;

    for (const wf of allWorkflows) {
        const nodes = wf.nodes as any[];
        // Find a WebhookNode
        const webhookNode = nodes.find((n: any) => n.type === 'webhook');

        if (webhookNode) {
            // Check if this webhook node matches the requested ID
            // For MVP, let's assume the webhookId passed in URL must match the Node ID (e.g. "1") 
            // OR a custom "webhookPath" property if we added one.
            // Let's use a simple convention: /webhooks/{workflowId} triggers the webhook node in that workflow.

            // Wait, the user might want multiple webhooks per workflow.
            // Let's try to match a "webhookId" property in the node defaults, or fallback to workflowId.

            // SIMPLIFICATION FOR MVP:
            // Route is /webhooks/:workflowId
            // We look for the FIRST WebhookNode in that workflow and trigger it.
            if (String(wf.id) === webhookId) {
                targetWorkflowId = wf.id;
                targetNodeId = webhookNode.id;
                break;
            }
        }
    }

    if (!targetWorkflowId) {
        return c.json({ error: "Webhook not found or workflow does not have a webhook trigger" }, 404);
    }

    try {
        // 2. Start the workflow
        // We pass the webhook data as the initial input
        const input = {
            body,
            query,
            headers,
            method,
            path
        };

        const execution = await orchestrator.startWorkflow(targetWorkflowId, input);

        return c.json({
            executionId: execution.id,
            status: execution.status,
        }, 200);
    } catch (error: any) {
        console.error("Failed to start workflow via webhook:", error);
        return c.json({ error: error.message }, 500);
    }
});

export default app;
