import type { JobType, Queue } from 'bullmq';
import { startMetricsServer, setQueueJobCounts } from '@repo/metrics';
import { createLogger } from '@repo/logger';

const logger = createLogger({ name: 'worker-metrics' });

const METRICS_POLL_INTERVAL_MS = Number(process.env.METRICS_POLL_INTERVAL_MS || '5000');
const METRICS_ENDPOINT = process.env.METRICS_ENDPOINT || '/metrics';
const JOB_STATUSES: JobType[] = [
    'waiting',
    'active',
    'completed',
    'failed',
    'delayed',
    'paused',
    'prioritized',
    'waiting-children',
];

const pollQueueCounts = async (queue: Queue) => {
    const counts = await queue.getJobCounts(...JOB_STATUSES);
    setQueueJobCounts(queue.name, counts);
};

export const startWorkerMetrics = (queues: Queue[]) => {
    const metricsServer = startMetricsServer({
        endpoint: METRICS_ENDPOINT,
        onError: (error) => logger.error({ error }, 'Metrics endpoint failed to respond'),
    });
    const address = metricsServer.address();
    if (address && typeof address === 'object') {
        logger.info({ port: address.port, endpoint: METRICS_ENDPOINT }, 'Metrics server started');
    } else {
        logger.info({ endpoint: METRICS_ENDPOINT }, 'Metrics server started');
    }

    const poll = async () => {
        for (const queue of queues) {
            try {
                await pollQueueCounts(queue);
            } catch (error) {
                logger.warn({ queue: queue.name, error }, 'Failed to collect queue metrics');
            }
        }
    };

    poll().catch((error) => logger.error({ error }, 'Initial metrics collection failed'));

    setInterval(() => {
        poll().catch((error) => logger.error({ error }, 'Metrics collection failed'));
    }, METRICS_POLL_INTERVAL_MS);
};
