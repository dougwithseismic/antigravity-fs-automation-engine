import "dotenv/config";
import { serve } from "@hono/node-server";
import { OpenAPIHono } from "@hono/zod-openapi";
import { apiReference } from "@scalar/hono-api-reference";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { client } from "@repo/database";
import { pinoLogger } from "hono-pino";
import pino from "pino";
import pretty from "pino-pretty";

import { config } from "./config";
import workflows from "./routes/workflows";
import execution from "./routes/execution";

import { authMiddleware } from "./middleware/auth";

const app = new OpenAPIHono();

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
    return c.json({ error: err.message, stack: err.stack }, 500);
});

app.get("/", (c) => {
    return c.json({ message: "n8n clone API" });
});

// Apply auth middleware to sensitive routes
app.use("/workflows/*", authMiddleware);

app.route("/workflows", workflows);
app.route("/workflows", execution); // Mounts at /workflows/:id/execute

app.doc("/doc", {
    openapi: "3.0.0",
    info: {
        version: "1.0.0",
        title: "n8n Clone API",
    },
});

app.get(
    "/reference",
    apiReference({
        theme: "deepSpace",
        spec: {
            url: "/doc",
        },
    } as any),
);

const port = config.port;

const server = serve(
    {
        fetch: app.fetch,
        port,
    },
    (info) => {
        console.log(`🚀 ${config.appName} server is running!`);
        console.log(`   - Local:        http://localhost:${info.port}`);
        console.log(`   - Documentation: http://localhost:${info.port}/reference`);
        console.log(`   - OpenAPI Spec:  http://localhost:${info.port}/doc`);
    },
);

const shutdown = async () => {
    console.log("Shutting down...");
    server.close();
    await client.end();
    console.log("Server closed");
    process.exit(0);
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
