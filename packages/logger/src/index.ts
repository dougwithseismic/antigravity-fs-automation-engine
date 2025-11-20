import pino, { Logger, LoggerOptions } from 'pino';

/**
 * Configuration options for creating a logger instance
 */
export interface CreateLoggerOptions {
  /**
   * Name of the logger (e.g., 'worker', 'api', 'scheduler')
   */
  name: string;
  /**
   * Additional base context to include in all logs
   */
  base?: Record<string, unknown>;
  /**
   * Override the log level (defaults to LOG_LEVEL env var or 'info')
   */
  level?: string;
}

/**
 * Execution context that can be bound to logger instances for distributed tracing
 */
export interface ExecutionContext {
  executionId?: number;
  workflowId?: number;
  nodeId?: string;
  traceId?: string;
  spanId?: string;
  [key: string]: unknown;
}

/**
 * Re-export Pino's Logger type for consumers
 */
export type { Logger };

/**
 * Sensitive field names that should be redacted from logs
 */
const REDACT_FIELDS = [
  'password',
  'apiKey',
  'api_key',
  'token',
  'secret',
  'authorization',
  'cookie',
  'session',
];

/**
 * Determines if we're running in development mode
 */
const isDevelopment = process.env.NODE_ENV === 'development';

/**
 * Creates a configured Pino logger instance with production-ready defaults
 * 
 * @param options - Configuration options for the logger
 * @returns A configured Pino logger instance
 * 
 * @example
 * ```typescript
 * // Create a base logger for the worker
 * const logger = createLogger({ name: 'worker' });
 * logger.info('Worker started');
 * 
 * // Create a child logger with execution context
 * const executionLogger = logger.child({ executionId: 123, workflowId: 456 });
 * executionLogger.info({ nodeId: 'node-1' }, 'Processing node');
 * ```
 */
export function createLogger(options: CreateLoggerOptions): Logger {
  const { name, base = {}, level } = options;

  const logLevel = level || process.env.LOG_LEVEL || (isDevelopment ? 'debug' : 'info');

  const loggerOptions: LoggerOptions = {
    name,
    level: logLevel,
    
    // Base context included in all logs
    base: {
      ...base,
      pid: process.pid,
      hostname: process.env.HOSTNAME || 'unknown',
    },

    // Redact sensitive fields
    redact: {
      paths: REDACT_FIELDS,
      censor: '[REDACTED]',
    },

    // Format timestamps as ISO 8601
    timestamp: pino.stdTimeFunctions.isoTime,

    // Use pretty printing in development for better readability
    ...(isDevelopment && {
      transport: {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'HH:MM:ss.l',
          ignore: 'pid,hostname',
          singleLine: false,
        },
      },
    }),

    // Format log levels as strings instead of numbers
    formatters: {
      level: (label) => ({ level: label }),
    },
  };

  return pino(loggerOptions);
}

/**
 * Creates a child logger with execution context bound to it
 * This is useful for distributed tracing and correlating logs across a workflow execution
 * 
 * @param logger - Parent logger instance
 * @param context - Execution context to bind
 * @returns A child logger with the context bound
 * 
 * @example
 * ```typescript
 * const baseLogger = createLogger({ name: 'worker' });
 * 
 * // Bind execution context
 * const executionLogger = withExecutionContext(baseLogger, {
 *   executionId: 123,
 *   workflowId: 456,
 *   traceId: 'abc-123-def-456'
 * });
 * 
 * // All logs will include the context
 * executionLogger.info({ nodeId: 'node-1', duration: 230 }, 'Node completed');
 * // Output: { level: 'info', executionId: 123, workflowId: 456, traceId: 'abc-123-def-456', nodeId: 'node-1', duration: 230, msg: 'Node completed' }
 * ```
 */
export function withExecutionContext(logger: Logger, context: ExecutionContext): Logger {
  return logger.child(context);
}

/**
 * Generates a simple trace ID for correlation
 * In production, you might want to use a more sophisticated trace ID generation
 * or integrate with a distributed tracing system like OpenTelemetry
 * 
 * @returns A simple trace ID string
 */
export function generateTraceId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Export a default logger for convenience (should be replaced with named loggers in most cases)
export const defaultLogger = createLogger({ name: 'antigravity' });
