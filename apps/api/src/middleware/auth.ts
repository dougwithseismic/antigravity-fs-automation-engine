import { createMiddleware } from "hono/factory";
import { config } from "../config";

export const authMiddleware = createMiddleware(async (c, next) => {
    const apiKey = c.req.header("x-api-key");

    if (!config.apiKey) {
        // If no API key is configured, allow all requests (dev mode or insecure)
        // Ideally, we should log a warning here.
        return await next();
    }

    if (apiKey !== config.apiKey) {
        return c.json({ error: "Unauthorized" }, 401);
    }

    await next();
});
