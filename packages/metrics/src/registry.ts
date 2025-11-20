import { Registry, collectDefaultMetrics } from 'prom-client';

const rawPrefix = process.env.METRICS_PREFIX ?? 'antigravity_';
const normalizedPrefix = rawPrefix.endsWith('_') ? rawPrefix : `${rawPrefix}_`;

export const register = new Registry();

collectDefaultMetrics({
  register,
  prefix: normalizedPrefix,
});

export const metricsPrefix = normalizedPrefix;

export const withPrefix = (name: string) => `${normalizedPrefix}${name}`;
