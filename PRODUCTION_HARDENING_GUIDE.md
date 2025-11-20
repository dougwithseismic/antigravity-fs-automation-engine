# Production Hardening Guide - Learn as You Build

**Date**: November 20, 2025  
**Goal**: Transform Antigravity from beta-ready to production-ready  
**Approach**: Learn each concept, then implement it together

---

## 📚 Core Concepts Explained

Before we dive into implementation, let's understand the key concepts we'll be working with.

### 1. Dead Letter Queue (DLQ) 💀

**What is it?**
Think of a Dead Letter Queue as a "hospital for sick jobs" - when a job fails after all retry attempts, instead of losing it forever, we send it to a special queue where we can:
- Examine what went wrong
- Fix the underlying issue
- Manually retry if needed
- Collect metrics on failure patterns

**Real-world analogy**: 
Imagine you're a postal service. When a letter can't be delivered after 3 attempts (wrong address, recipient moved, etc.), instead of throwing it away, you send it to a "Dead Letter Office" where staff can investigate and potentially resolve the issue.

**Why do we need it?**
```typescript
// WITHOUT DLQ
try {
  await processOrder(order);
} catch (error) {
  // Order fails, error logged, data LOST forever ❌
  console.error('Order processing failed:', error);
}

// WITH DLQ
try {
  await processOrder(order);
} catch (error) {
  // Job goes to DLQ for investigation ✅
  await deadLetterQueue.add({
    originalJob: order,
    error: error.message,
    failedAt: new Date(),
    attemptCount: 3
  });
  // Now we can:
  // - View it in a dashboard
  // - Fix the bug that caused failure
  // - Replay the job after fix
}
```

**In Antigravity**:
When a workflow node fails (e.g., email service down, API timeout, bad data), after 3 retries it goes to DLQ. You get alerted, can see exactly what failed, and decide:
- Is this a bug? → Fix code, replay job
- Is this bad data? → Fix data, replay job
- Is this expected? → Mark as resolved

---

### 2. Prometheus Metrics 📊

**What is it?**
Prometheus is like a "health tracker" for your application. It collects **metrics** (numbers about your system) and lets you:
- Create dashboards (graphs showing performance over time)
- Set alerts (notify me if error rate > 5%)
- Debug issues (what happened at 3pm when the system slowed down?)

**Key metrics concepts**:

```typescript
// COUNTER - Things that only go up (like a car's odometer)
// Example: Total number of executions
const executionsTotal = new Counter({
  name: 'antigravity_executions_total',
  help: 'Total number of workflow executions',
  labelNames: ['status'] // We can split by 'completed', 'failed', etc.
});

executionsTotal.inc({ status: 'completed' }); // Add 1 to the counter
// Result: antigravity_executions_total{status="completed"} = 1,523

// GAUGE - Things that go up and down (like a thermometer)
// Example: Active executions right now
const activeExecutions = new Gauge({
  name: 'antigravity_active_executions',
  help: 'Number of currently running executions'
});

activeExecutions.inc(); // Started an execution
activeExecutions.dec(); // Finished an execution
// Result: antigravity_active_executions = 42

// HISTOGRAM - Track distribution of values
// Example: How long do executions take?
const executionDuration = new Histogram({
  name: 'antigravity_execution_duration_seconds',
  help: 'Execution duration in seconds',
  buckets: [0.1, 0.5, 1, 2, 5, 10] // Group by these time ranges
});

const start = Date.now();
await executeWorkflow();
const duration = (Date.now() - start) / 1000;
executionDuration.observe(duration); // Record: 2.3 seconds

// Prometheus then lets you query:
// - What's the average execution time? (2.1s)
// - What's the 95th percentile? (4.5s - 95% finish in under 4.5s)
// - How many took > 5s? (23 executions)
```

**Why do we need it?**
Without metrics, you're flying blind:
- "The app feels slow" → But how slow? Which part? Since when?
- "We had an outage" → How many users affected? Which feature broke?
- "Should we scale up?" → Is CPU high? Are queues backing up?

With metrics:
- "Execution time went from 2s to 12s at 3:15pm" → Check deploys at 3:10pm
- "Email node is failing 40% of the time" → Email service is down
- "Queue has 10,000 jobs waiting" → Scale up workers NOW

---

### 3. Redis Streams 🌊

**What is it?**
Redis Streams is like a **timeline** or **event log**. Every event gets written to the stream with a timestamp, and you can:
- Read events in order
- Replay old events
- Have multiple consumers reading the same stream
- Never lose events (they're persisted)

**Real-world analogy**:
Think of Redis Streams like a **Twitter timeline**:
- Events are like tweets (timestamped, ordered)
- You can scroll back to see old tweets
- Multiple people can follow the same timeline
- New tweets appear in real-time

**Comparison to other patterns**:

```typescript
// PATTERN 1: Pub/Sub (like a radio broadcast)
redis.publish('channel', 'Hello'); // Send message
redis.subscribe('channel', (msg) => console.log(msg)); // Listen

// PROBLEM: If subscriber isn't listening RIGHT NOW, message is lost
// EXAMPLE: If your worker crashes for 2 seconds, it misses all events

// PATTERN 2: Streams (like a DVR)
redis.xadd('stream', '*', 'message', 'Hello'); // Add to stream
redis.xread('STREAMS', 'stream', '0'); // Read from beginning

// ADVANTAGE: Messages are SAVED. You can:
// - Read from the start
// - Read from where you left off
// - Multiple consumers can each track their position
```

**In Antigravity**:
```typescript
// Every time a node completes, we write to stream:
await redis.xadd(
  'execution:123:events',
  '*', // Auto-generate timestamp ID
  'event', 'step-completed',
  'nodeId', 'node-5',
  'status', 'success'
);

// Stream now contains:
// 1668012345678-0 → { event: 'step-started', nodeId: 'node-1' }
// 1668012346001-0 → { event: 'step-completed', nodeId: 'node-1' }
// 1668012347234-0 → { event: 'step-started', nodeId: 'node-2' }
// ... and so on

// Benefits:
// 1. Complete audit trail of execution
// 2. Can replay execution to debug issues
// 3. Multiple clients can watch progress (real-time dashboard)
// 4. Events survive crashes
```

---

### 4. Server-Sent Events (SSE) 📡

**What is it?**
SSE is a browser technology that lets the **server push updates to the client** over HTTP. It's one-way (server → client) and perfect for:
- Real-time notifications
- Progress updates
- Live feeds

**Comparison**:

```typescript
// TRADITIONAL (Client polls server every second)
setInterval(async () => {
  const status = await fetch('/api/status'); // New request every second
  updateUI(status);
}, 1000);
// PROBLEM: 60 requests/minute, even if nothing changed

// SSE (Server pushes when something happens)
const eventSource = new EventSource('/api/stream');
eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data);
  updateUI(data); // Only updates when server sends
};
// ADVANTAGE: Real-time, no wasted requests

// WEBSOCKETS (Two-way communication)
const ws = new WebSocket('/api/ws');
ws.send('Hello server'); // Client → Server
ws.onmessage = (msg) => console.log(msg); // Server → Client
// ADVANTAGE: Bidirectional, but more complex
```

**When to use what**:
- **SSE**: Server needs to push updates to client (✅ Your use case!)
- **WebSockets**: Both sides need to send messages frequently (chat apps)
- **Polling**: Fallback when SSE/WS not available (rare nowadays)

**In Antigravity**:
```typescript
// Server sends execution progress in real-time
app.get('/executions/:id/stream', (c) => {
  c.header('Content-Type', 'text/event-stream');
  
  const stream = c.streamText(async (stream) => {
    // Send initial state
    await stream.write(`data: ${JSON.stringify({ status: 'started' })}\n\n`);
    
    // When node completes, push update
    await stream.write(`data: ${JSON.stringify({ 
      event: 'step-completed',
      nodeId: '5' 
    })}\n\n`);
  });
  
  return stream;
});

// Client receives real-time updates
const events = new EventSource('/executions/123/stream');
events.onmessage = (e) => {
  const data = JSON.parse(e.data);
  if (data.event === 'step-completed') {
    showProgress(`Step ${data.nodeId} complete!`);
  }
};
```

---

### 5. Circuit Breaker 🔌

**What is it?**
A circuit breaker protects your system from cascading failures by **automatically stopping calls to a failing service**.

**Real-world analogy**:
Your home electrical circuit breaker:
- When too much current flows (overload), it **trips** (opens)
- This prevents wires from overheating and causing a fire
- You fix the problem, then **reset** the breaker
- Electricity flows again

**In software**:

```typescript
// WITHOUT Circuit Breaker
async function sendEmail(email) {
  try {
    await emailService.send(email); // Takes 30s to timeout
  } catch (error) {
    // Try again... another 30s timeout
    // Try again... another 30s timeout
    // Total: 90 seconds of users waiting!
  }
}

// WITH Circuit Breaker
const breaker = new CircuitBreaker(sendEmail, {
  timeout: 3000,        // Fail after 3s
  errorThreshold: 50,   // Open after 50% errors
  resetTimeout: 30000   // Try again after 30s
});

// States:
// CLOSED (normal): Requests go through
// OPEN (tripped): Requests FAIL FAST (instant error)
// HALF-OPEN (testing): Allow 1 request to test if service recovered

await breaker.fire(email);
// If email service is down:
// - First few requests: Try and fail (3s each)
// - After 50% fail rate: Circuit OPENS
// - Next 1000 requests: INSTANT failure (no waiting!)
// - After 30s: Try one request (HALF-OPEN)
//   - If succeeds: CLOSE circuit (back to normal)
//   - If fails: Stay OPEN for another 30s
```

**Why do we need it?**
Without circuit breaker:
- Email service goes down
- Every workflow with email node waits 30s to timeout
- Queue backs up with 1000s of waiting jobs
- Workers are blocked waiting for timeouts
- System becomes unresponsive

With circuit breaker:
- Email service goes down
- First few fail (3s each)
- Circuit opens
- Next jobs fail INSTANTLY
- Queue keeps moving (other nodes still work)
- System stays responsive
- Circuit auto-retries every 30s until service recovers

---

### 6. Structured Logging 📝

**What is it?**
Instead of console.log with random strings, structured logging outputs **JSON objects** with consistent fields.

```typescript
// UNSTRUCTURED (bad)
console.log('User 123 started workflow 456');
console.log('Node email_1 failed with error: Timeout');
console.log('Execution 789 completed in 2.3s');

// PROBLEM:
// - Hard to search: "Show me all errors for user 123"
// - Hard to parse: Need regex to extract data
// - Inconsistent: Sometimes "User 123", sometimes "user=123"

// STRUCTURED (good)
logger.info({
  event: 'workflow_started',
  userId: 123,
  workflowId: 456,
  timestamp: '2025-11-20T17:18:00Z'
});

logger.error({
  event: 'node_failed',
  nodeId: 'email_1',
  nodeType: 'email',
  error: 'Timeout',
  executionId: 789,
  duration: 3000
});

// ADVANTAGE:
// - Easy to search: logger.query({ userId: 123, event: 'node_failed' })
// - Easy to analyze: "What % of email nodes fail?"
// - Consistent fields: Always userId, executionId, timestamp
// - Works with log aggregators (DataDog, CloudWatch, Elasticsearch)
```

**Log levels**:
```typescript
logger.debug({ msg: 'Very detailed info' });    // Development only
logger.info({ msg: 'Normal operation' });       // Workflow started
logger.warn({ msg: 'Something unusual' });      // Retry after timeout
logger.error({ msg: 'Something failed' });      // Node execution failed
logger.fatal({ msg: 'System is broken' });      // Database down
```

---

## 🎯 Implementation Roadmap

Now that you understand the concepts, here's our plan:

### Week 1: Foundation (Observability)
**Goal**: See what's happening in your system

**Day 1-2**: Structured Logging
- [ ] Install Pino logger
- [ ] Replace console.log in worker
- [ ] Replace console.log in API
- [ ] Add correlation IDs

**Day 3-4**: Prometheus Metrics
- [ ] Install prom-client
- [ ] Add basic counters (executions, nodes)
- [ ] Add histograms (duration)
- [ ] Expose /metrics endpoint
- [ ] Set up local Prometheus + Grafana

**Day 5**: Dashboard Setup
- [ ] Create Grafana dashboard
- [ ] Add graphs for key metrics
- [ ] Test alert rules

**Learning outcomes**:
- ✅ You'll understand distributed tracing
- ✅ You'll see execution patterns visually
- ✅ You'll know how to debug production issues

---

### Week 2: Resilience (Error Handling)
**Goal**: Handle failures gracefully

**Day 1-2**: Dead Letter Queue
- [ ] Create DLQ queue in BullMQ
- [ ] Add error categorization
- [ ] Send permanent failures to DLQ
- [ ] Create DLQ viewer endpoint

**Day 3-4**: Circuit Breakers
- [ ] Install opossum
- [ ] Wrap email node
- [ ] Wrap webhook node
- [ ] Wrap fetch node
- [ ] Add circuit breaker metrics

**Day 5**: Testing
- [ ] Simulate service failures
- [ ] Verify DLQ captures failures
- [ ] Verify circuit breakers open/close
- [ ] Load test

**Learning outcomes**:
- ✅ You'll understand failure modes
- ✅ You'll design resilient systems
- ✅ You'll handle cascading failures

---

### Week 3: Real-time (Client Communication)
**Goal**: Better user experience

**Day 1-2**: Redis Pub/Sub for SSE
- [ ] Add Redis publish on state changes
- [ ] Create SSE endpoint
- [ ] Test with curl

**Day 3-4**: Client SDK Updates
- [ ] Replace while loop with EventSource
- [ ] Handle real-time events
- [ ] Show progress indicators
- [ ] Test in demo-react

**Day 5**: Polish
- [ ] Add reconnection logic
- [ ] Add error handling
- [ ] Update documentation

**Learning outcomes**:
- ✅ You'll understand event-driven architecture
- ✅ You'll build real-time features
- ✅ You'll improve UX dramatically

---

### Week 4: Operations (Production-Ready)
**Goal**: Deploy confidently

**Day 1-2**: Health Checks & Graceful Shutdown
- [ ] Add health endpoints
- [ ] Implement graceful shutdown
- [ ] Test with Docker

**Day 3-4**: State Management Hardening
- [ ] Add Redis fallback to PostgreSQL
- [ ] Add state validation
- [ ] Add recovery mechanisms

**Day 5**: Security & Documentation
- [ ] Input validation
- [ ] Secrets management
- [ ] Update deployment docs
- [ ] Create runbooks

**Learning outcomes**:
- ✅ You'll understand operational concerns
- ✅ You'll deploy safely
- ✅ You'll handle incidents confidently

---

## 📖 Tutorial Format

For each implementation, I'll provide:

1. **Concept refresh**: Quick reminder of what we're building
2. **Code walkthrough**: Step-by-step implementation
3. **Why it works**: Explanation of the mechanism
4. **Testing**: How to verify it works
5. **Common mistakes**: What to avoid
6. **Next steps**: What to build on top

---

## 🚀 Ready to Start?

We'll begin with **Week 1, Day 1: Structured Logging** because:
- It's the foundation for everything else
- It's immediately useful for debugging
- It's the easiest to implement
- It gives you quick wins

Once logging is in place, you'll be able to see exactly what's happening when we add metrics, DLQ, circuit breakers, etc.

**Next**: I'll create the first tutorial - "Day 1: Structured Logging with Pino"

Let me know when you're ready, and we'll start coding together! 🎓
