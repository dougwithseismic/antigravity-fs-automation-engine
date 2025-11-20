import { Redis } from 'ioredis';

const redis = new Redis({
    host: 'localhost',
    port: 6379,
});

async function verify() {
    try {
        console.log('Connecting to Redis...');
        await redis.ping();
        console.log('✅ Redis connection successful (PONG)');

        await redis.set('antigravity:test', 'hello world');
        const value = await redis.get('antigravity:test');
        console.log(`✅ Redis read/write successful: ${value}`);

        await redis.del('antigravity:test');
        process.exit(0);
    } catch (error) {
        console.error('❌ Redis connection failed:', error);
        process.exit(1);
    }
}

verify();
