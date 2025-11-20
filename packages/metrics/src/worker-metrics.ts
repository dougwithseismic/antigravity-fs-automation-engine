import { Counter, Gauge, Histogram } from 'prom-client';
import { register, withPrefix } from './registry';

export const nodeExecutionCounter = new Counter({
  name: withPrefix('node_executions_total'),
  help: 'Total node execution attempts grouped by type and status',
  labelNames: ['nodeType', 'status'],
  registers: [register],
});

export const nodeExecutionDuration = new Histogram({
  name: withPrefix('node_execution_duration_seconds'),
  help: 'Node execution duration in seconds grouped by type and status',
  labelNames: ['nodeType', 'status'],
  buckets: [0.01, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10, 30],
  registers: [register],
});

export const queueJobGauge = new Gauge({
  name: withPrefix('queue_jobs'),
  help: 'BullMQ queue job counts by status',
  labelNames: ['queue', 'status'],
  registers: [register],
});

const QUEUE_STATUSES = [
  'waiting',
  'active',
  'completed',
  'failed',
  'delayed',
  'paused',
  'prioritized',
  'waiting-children',
] as const;

type QueueStatus = (typeof QUEUE_STATUSES)[number];

export const setQueueJobCounts = (queueName: string, counts: Partial<Record<QueueStatus, number>>) => {
  for (const status of QUEUE_STATUSES) {
    queueJobGauge.set(
      {
        queue: queueName,
        status,
      },
      counts[status] ?? 0
    );
  }
};
