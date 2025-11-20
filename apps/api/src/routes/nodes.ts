import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { NodeRegistry } from "@antigravity/nodes";

const app = new OpenAPIHono();

const NodeHandleSchema = z.object({
    id: z.string(),
    type: z.enum(['target', 'source']),
    dataType: z.enum(['flow', 'string', 'number', 'boolean', 'json', 'tool', 'model', 'credential']),
    label: z.string().optional(),
    acceptsMultiple: z.boolean().optional(),
});

const NodeDefinitionSchema = z.object({
    name: z.string(),
    displayName: z.string(),
    description: z.string(),
    version: z.number(),
    handles: z.array(NodeHandleSchema).optional(),
    inputs: z.array(z.string()).optional(),
    outputs: z.array(z.string()).optional(),
    // Add other fields as needed
});

app.openapi(
    createRoute({
        method: "get",
        path: "/",
        responses: {
            200: {
                content: {
                    "application/json": {
                        schema: z.array(NodeDefinitionSchema),
                    },
                },
                description: "List of available nodes",
            },
        },
    }),
    (c) => {
        const registry = NodeRegistry.getInstance();
        const nodes = registry.getAllNodes();
        
        // Map to schema if necessary, or just return
        // We might want to strip out the 'execute' method or other server-side only props
        const safeNodes = nodes.map(node => ({
            name: node.name,
            displayName: node.displayName,
            description: node.description,
            version: node.version,
            handles: node.handles,
            inputs: node.inputs,
            outputs: node.outputs,
            ui: node.ui
        }));

        return c.json(safeNodes as any);
    },
);

export default app;
