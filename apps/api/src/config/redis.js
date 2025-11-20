"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.redisOptions = exports.redisConnection = void 0;
const ioredis_1 = require("ioredis");
const REDIS_HOST = process.env.REDIS_HOST || 'localhost';
const REDIS_PORT = parseInt(process.env.REDIS_PORT || '6379', 10);
exports.redisConnection = new ioredis_1.Redis({
    host: REDIS_HOST,
    port: REDIS_PORT,
    maxRetriesPerRequest: null, // Required for BullMQ
});
exports.redisOptions = {
    host: REDIS_HOST,
    port: REDIS_PORT,
};
