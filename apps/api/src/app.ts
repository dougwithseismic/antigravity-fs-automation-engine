import "dotenv/config";
import { OpenAPIHono } from "@hono/zod-openapi";
import { apiReference } from "@scalar/hono-api-reference";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { config } from "./config";
import workflows from "./routes/workflows";
import executions from "./routes/executions";
import webhooks from "./routes/webhooks";
import nodes from "./routes/nodes";
import { authMiddleware } from "./middleware/auth";

export const app = new OpenAPIHono({
    defaultHook: (result, c) => {
        if (!result.success) {
            console.error("Validation Error:", result.error);
            return c.json({
                error: "Validation failed",
                details: result.error
            }, 400);
        }
    }
});

app.use("*", logger());
app.use(
    "*",
    cors({
        origin: (origin) => {
            if (config.allowedOrigins.includes("*")) return "*";
            return config.allowedOrigins.includes(origin) ? origin : null;
        },
        allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allowHeaders: ["Content-Type", "Authorization", "x-api-key"],
        exposeHeaders: ["Content-Length"],
        maxAge: 600,
        credentials: true,
    })
);

app.onError((err, c) => {
    console.error("Global Error:", err);
    console.error("Error Stack:", err.stack);
    return c.json({ error: err.message || "Internal Server Error", stack: process.env.NODE_ENV !== "production" ? err.stack : undefined }, 500);
});

app.get("/", (c) => {
    return c.json({ message: "n8n clone API" });
});

// Apply auth middleware to sensitive routes
app.use("/workflows/*", authMiddleware);
app.use("/executions/*", authMiddleware);
app.use("/nodes/*", authMiddleware);

// IMPORTANT: For OpenAPI to work properly with sub-routes,
// we need to mount them before calling app.doc()
// The sub-apps must be OpenAPIHono instances
app.route("/workflows", workflows);
app.route("/executions", executions);
app.route("/webhooks", webhooks);
app.route("/nodes", nodes);

// Generate OpenAPI documentation
app.doc("/doc", {
    openapi: "3.0.0",
    info: {
        version: "1.0.0",
        title: "Antigravity API",
        description: "Workflow automation API with execution monitoring"
    },
    servers: [
        {
            url: `http://localhost:${config.port}`,
            description: "Development server"
        }
    ],
    tags: [
        {
            name: "workflows",
            description: "Workflow management endpoints"
        },
        {
            name: "executions",
            description: "Execution monitoring endpoints"
        }
    ]
});

// Scalar API reference UI
app.get(
    "/reference",
    apiReference({
        theme: "deepSpace",
        spec: {
            url: "/doc",
        },
    } as any),
);
