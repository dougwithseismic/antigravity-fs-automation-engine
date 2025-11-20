import { Redis } from 'ioredis';

const REDIS_HOST = process.env.REDIS_HOST || 'localhost';
const REDIS_PORT = parseInt(process.env.REDIS_PORT || '6379', 10);

export const redisConnection = new Redis({
    host: REDIS_HOST,
    port: REDIS_PORT,
    maxRetriesPerRequest: null, // Required for BullMQ
});

export const redisOptions = {
    host: REDIS_HOST,
    port: REDIS_PORT,
};
