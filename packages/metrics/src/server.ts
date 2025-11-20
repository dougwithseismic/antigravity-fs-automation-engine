import http, { Server } from 'http';
import { register } from './registry';

export interface MetricsServerOptions {
  port?: number;
  endpoint?: string;
  onError?: (error: unknown) => void;
}

export const startMetricsServer = (options: MetricsServerOptions = {}): Server => {
  const port = options.port ?? Number(process.env.METRICS_PORT || 9464);
  const endpoint = options.endpoint ?? '/metrics';

  const server = http.createServer(async (req, res) => {
    if (!req.url) {
      res.statusCode = 400;
      res.end('Bad Request');
      return;
    }

    const [path] = req.url.split('?');

    if (path !== endpoint) {
      res.statusCode = 404;
      res.end('Not Found');
      return;
    }

    try {
      res.setHeader('Content-Type', register.contentType);
      const metrics = await register.metrics();
      res.end(metrics);
    } catch (error) {
      res.statusCode = 500;
      res.end('Failed to collect metrics');
      options.onError?.(error);
    }
  });

  server.listen(port);

  return server;
};
