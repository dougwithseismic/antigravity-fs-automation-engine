import { z } from "@hono/zod-openapi";
import "dotenv/config";

const EnvSchema = z.object({
    PORT: z.coerce.number().default(3002),
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
    DATABASE_URL: z.string().url(),
    LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace"]).default("info"),
});

export type Env = z.infer<typeof EnvSchema>;

let env: Env;

try {
    env = EnvSchema.parse(process.env);
} catch (e) {
    const error = e as z.ZodError;
    console.error("❌ Invalid environment variables:");
    console.error(JSON.stringify(error.flatten().fieldErrors, null, 2));
    process.exit(1);
}

export const config = {
    port: process.env.PORT ? parseInt(process.env.PORT) : 3002,
    appName: "Antigravity API",
    apiKey: process.env.API_KEY,
    allowedOrigins: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(",") : ["*"],
};
