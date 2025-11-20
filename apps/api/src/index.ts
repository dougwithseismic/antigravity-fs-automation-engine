import "dotenv/config";
import { serve } from "@hono/node-server";
import { client } from "@repo/database";
import { config } from "./config";
import { app } from "./app";
import { createLogger } from "@repo/logger";

const logger = createLogger({ name: 'api' });
const port = config.port;

const server = serve(
    {
        fetch: app.fetch,
        port,
    },
    (info) => {
        logger.info({
            appName: config.appName,
            port: info.port,
            urls: {
                local: `http://localhost:${info.port}`,
                docs: `http://localhost:${info.port}/reference`,
                openapi: `http://localhost:${info.port}/doc`,
            }
        }, 'API server started successfully');
    },
);

const shutdown = async () => {
    logger.info('Shutdown signal received');
    server.close();
    await client.end();
    logger.info('Server closed gracefully');
    process.exit(0);
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

