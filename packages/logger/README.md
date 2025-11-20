# @repo/logger

Production-ready structured logging for Antigravity using Pino.

## Features

- 🎯 **Structured JSON Logging**: All logs are JSON formatted for easy parsing and aggregation
- 🎨 **Pretty Development Logs**: Human-readable, colorized output in development
- 🔍 **Distributed Tracing**: Built-in support for correlation IDs and execution context
- 🔒 **Automatic Redaction**: Sensitive fields are automatically redacted
- ⚙️ **Environment Aware**: Different configurations for development and production
- 📊 **Log Level Control**: Configurable via `LOG_LEVEL` environment variable

## Installation

This package is part of the Antigravity monorepo and is available as a workspace package:

```json
{
  "dependencies": {
    "@repo/logger": "workspace:*"
  }
}
```

## Usage

### Basic Logger

```typescript
import { createLogger } from '@repo/logger';

const logger = createLogger({ name: 'worker' });

logger.info('Worker started');
logger.error({ error: err.message }, 'Failed to process job');
```

### Execution Context (Distributed Tracing)

Bind execution context to trace logs across a workflow:

```typescript
import { createLogger, withExecutionContext } from '@repo/logger';

const baseLogger = createLogger({ name: 'worker' });

// Create a child logger with execution context
const executionLogger = withExecutionContext(baseLogger, {
  executionId: 123,
  workflowId: 456,
  traceId: 'abc-123-def-456',
});

// All logs will include the context
executionLogger.info({ nodeId: 'node-1', duration: 230 }, 'Node completed');
executionLogger.error({ nodeId: 'node-2', error: 'Timeout' }, 'Node failed');
```

**Output (production)**:
```json
{
  "level": "info",
  "time": "2025-11-20T17:30:00.000Z",
  "name": "worker",
  "executionId": 123,
  "workflowId": 456,
  "traceId": "abc-123-def-456",
  "nodeId": "node-1",
  "duration": 230,
  "msg": "Node completed"
}
```

### Child Loggers

Create child loggers to add persistent context:

```typescript
const logger = createLogger({ name: 'api' });

// Create a child logger for a specific request
const requestLogger = logger.child({ requestId: 'req-123', userId: 456 });

requestLogger.info('Processing request');
requestLogger.info('Request completed');
// Both logs will include requestId and userId
```

### Log Levels

```typescript
logger.debug({ data: someData }, 'Detailed debug info');
logger.info({ event: 'workflow_started' }, 'Workflow started');
logger.warn({ queue: 'node-execution', depth: 1000 }, 'Queue depth high');
logger.error({ error: err.message, stack: err.stack }, 'Failed to execute node');
logger.fatal({ error: err.message }, 'Database connection lost');
```

## Configuration

### Environment Variables

- `LOG_LEVEL`: Set the minimum log level (`debug`, `info`, `warn`, `error`, `fatal`)
  - Default: `debug` in development, `info` in production
- `NODE_ENV`: Set to `development` for pretty-printed logs, `production` for JSON

### Redacted Fields

The following fields are automatically redacted from logs:
- `password`
- `apiKey` / `api_key`
- `token`
- `secret`
- `authorization`
- `cookie`
- `session`

## Examples

### Worker Usage

```typescript
import { createLogger, withExecutionContext } from '@repo/logger';

const logger = createLogger({ name: 'node-worker' });

async function processJob(job: Job) {
  const jobLogger = withExecutionContext(logger, {
    executionId: job.data.executionId,
    workflowId: job.data.workflowId,
    jobId: job.id,
  });

  jobLogger.info({ nodeId: job.data.nodeId }, 'Processing node');
  
  try {
    const result = await executeNode(job.data);
    jobLogger.info({ nodeId: job.data.nodeId, duration: result.duration }, 'Node completed');
  } catch (error) {
    jobLogger.error({ 
      nodeId: job.data.nodeId, 
      error: error.message,
      stack: error.stack 
    }, 'Node execution failed');
  }
}
```

### API Usage

```typescript
import { createLogger } from '@repo/logger';

const logger = createLogger({ name: 'api' });

app.use('*', async (c, next) => {
  const requestId = crypto.randomUUID();
  const requestLogger = logger.child({ requestId });
  
  c.set('logger', requestLogger);
  
  requestLogger.info({ 
    method: c.req.method, 
    path: c.req.path 
  }, 'Request started');
  
  await next();
  
  requestLogger.info({ 
    method: c.req.method, 
    path: c.req.path,
    status: c.res.status
  }, 'Request completed');
});
```

## Best Practices

1. **Always use structured data**: Pass objects as the first parameter, message as second
   ```typescript
   // Good ✅
   logger.info({ userId: 123, action: 'login' }, 'User logged in');
   
   // Bad ❌
   logger.info(`User ${userId} logged in with action ${action}`);
   ```

2. **Use child loggers for context**: Don't repeat context in every log call
   ```typescript
   // Good ✅
   const executionLogger = logger.child({ executionId: 123 });
   executionLogger.info('Started');
   executionLogger.info('Completed');
   
   // Bad ❌
   logger.info({ executionId: 123 }, 'Started');
   logger.info({ executionId: 123 }, 'Completed');
   ```

3. **Include error objects**: Always pass error objects for stack traces
   ```typescript
   // Good ✅
   logger.error({ error: err.message, stack: err.stack }, 'Failed');
   
   // Bad ❌
   logger.error(`Failed: ${err}`);
   ```

4. **Use appropriate log levels**:
   - `debug`: Very detailed information for debugging
   - `info`: Normal operational messages
   - `warn`: Warning messages, potential issues
   - `error`: Error events that might still allow the application to continue
   - `fatal`: Critical errors that cause the application to abort

## License

MIT
