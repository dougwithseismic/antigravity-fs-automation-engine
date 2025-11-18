import "dotenv/config";
import { serve } from "@hono/node-server";
import { client } from "@repo/database";
import { config } from "./config";
import { app } from "./app";

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
