# @repo/database

Shared database package using Drizzle ORM with PostgreSQL for the Antigravity workflow engine.

## Architecture

This package provides:
- **Schema definitions** with type-safe enums and indexes
- **Migration management** using Drizzle Kit
- **Database client** with connection pooling
- **TypeScript types** exported for the entire monorepo
- **Utility scripts** for database operations

## Development Workflow

### Making Schema Changes

**IMPORTANT**: Never commit schema changes without generating migrations first!

1. **Update `src/schema.ts`** with your changes
2. **Generate migration**: `pnpm db:generate`
3. **Review generated SQL** in `drizzle/` folder
4. **Test locally**: `pnpm db:migrate`
5. **Commit both** `schema.ts` and `drizzle/` files together

```bash
# Example workflow
pnpm db:generate                    # Generate migration
git add packages/database/src/schema.ts packages/database/drizzle/
git commit -m "Add user authentication schema"
```

### Available Scripts

- **`pnpm db:generate`** - Generate migration from schema changes
- **`pnpm db:migrate`** - Apply pending migrations to database
- **`pnpm db:push`** - Direct schema push (⚠️ dev only, dangerous!)
- **`pnpm db:reset`** - Delete all data (keeps schema intact)
- **`pnpm db:nuke`** - Drop entire schema (⚠️ destructive!)
- **`pnpm db:seed`** - Populate with test data (idempotent)

### Script Safety

| Script | Production | Data Loss | Use Case |
|--------|-----------|-----------|----------|
| `db:generate` | ✅ Safe | No | Generate migrations |
| `db:migrate` | ✅ Safe | No | Apply migrations |
| `db:push` | ❌ Dangerous | Possible | Quick dev iteration |
| `db:reset` | 🚫 Blocked | Yes | Clear test data |
| `db:nuke` | 🚫 Blocked | Yes | Fresh start |
| `db:seed` | ✅ Safe | No | Add test data |

Production safeguards:
- `db:nuke` and `db:reset` are **blocked** in `NODE_ENV=production`
- `db:nuke` rejects URLs containing `prod`, `.com`, or `rds.amazonaws`

## CI/CD Integration

Migrations run automatically in CI/CD:

```yaml
- name: Setup Database
  run: |
    pnpm --filter @repo/database db:migrate
    pnpm db:seed
```

The CI also validates that schema changes have migrations:

```yaml
- name: Check for uncommitted migrations
  run: |
    pnpm --filter @repo/database db:generate
    git diff --exit-code packages/database/drizzle/
```

If this check fails, you forgot to run `db:generate` locally!

## Type Safety

Import database types from the package:

```typescript
import type {
  Workflow,
  NewWorkflow,
  Execution,
  NewExecution,
  ExecutionStep,
  NewExecutionStep
} from '@repo/database';

// Use in your code
const workflow: Workflow = await db.query.workflows.findFirst({ ... });
const newExecution: NewExecution = {
  workflowId: 1,
  status: 'pending',
  data: { input: 'test' }
};
```

Import Drizzle utilities:

```typescript
import { db, eq, and, or, sql, desc, asc } from '@repo/database';

// Query examples
const workflows = await db.query.workflows.findMany({
  where: eq(workflows.id, 1),
  orderBy: desc(workflows.updatedAt)
});
```

## Schema Overview

### Tables

**workflows**
- Workflow definitions with nodes and edges
- Stores the visual workflow graph structure

**executions**
- Workflow execution instances
- Tracks status, timing, and execution state
- Uses `execution_status` enum: `pending | running | paused | completed | failed | cancelled`

**execution_steps**
- Individual node execution records
- Stores input/output, validation, and retry state
- Uses `step_status` enum: `pending | running | completed | failed | skipped`

### Indexes

Performance indexes on:
- `executions`: `workflow_id`, `status`, `user_id`, `started_at`
- `execution_steps`: `execution_id`, `node_id`, `status`

### Relationships

```
workflows (1) ──→ (many) executions
executions (1) ──→ (many) execution_steps
```

## Connection Configuration

Environment variables:

- **`DATABASE_URL`** (required) - PostgreSQL connection string
- **`DB_POOL_SIZE`** (optional) - Connection pool size (default: 10)
- **`NODE_ENV`** (optional) - Environment (blocks dangerous ops in production)

Connection pooling is configured with:
- Max connections: 10 (or `DB_POOL_SIZE`)
- Idle timeout: 20 seconds
- Connect timeout: 10 seconds

## Migration Strategy

We use **versioned migrations** to prevent schema drift:

1. Schema changes are tracked in `src/schema.ts` (source of truth)
2. Migrations are generated via `drizzle-kit generate:pg`
3. Migrations are **committed to git** in `drizzle/` folder
4. Production applies migrations sequentially via `db:migrate`

### Why Not Direct Push?

`db:push` directly syncs schema without migrations:
- ❌ No version history
- ❌ Can't rollback changes
- ❌ Different environments can drift
- ❌ No audit trail

Use `db:push` **only** for rapid local iteration, never in CI/CD or production.

## Troubleshooting

### "Column does not exist" errors

**Cause**: Database schema out of sync with code

**Solution**:
```bash
pnpm db:migrate  # Apply pending migrations
```

### "Schema changes detected without migrations" in CI

**Cause**: You updated `schema.ts` but didn't generate migrations

**Solution**:
```bash
pnpm db:generate
git add packages/database/drizzle/
git commit --amend --no-edit
git push --force-with-lease
```

### Migration conflicts after merge

**Cause**: Multiple branches generated migrations with same number

**Solution**:
```bash
# Regenerate migrations after merge
rm -rf drizzle/
pnpm db:generate
git add drizzle/
git commit -m "Regenerate migrations after merge"
```

## Examples

### Create a new workflow

```typescript
import { db, workflows, type NewWorkflow } from '@repo/database';

const newWorkflow: NewWorkflow = {
  name: 'My Workflow',
  nodes: [{ id: '1', type: 'start', data: {} }],
  edges: []
};

const [workflow] = await db.insert(workflows)
  .values(newWorkflow)
  .returning();
```

### Start an execution

```typescript
import { db, executions, type NewExecution } from '@repo/database';

const newExecution: NewExecution = {
  workflowId: 1,
  status: 'pending',
  data: { input: 'test data' }
};

const [execution] = await db.insert(executions)
  .values(newExecution)
  .returning();
```

### Query with relations

```typescript
import { db, eq, workflows } from '@repo/database';

const workflow = await db.query.workflows.findFirst({
  where: eq(workflows.id, 1),
  with: {
    executions: {
      orderBy: (executions, { desc }) => [desc(executions.startedAt)],
      limit: 10,
      with: {
        steps: true
      }
    }
  }
});
```

## Best Practices

1. **Always generate migrations** - Never skip this step
2. **Review generated SQL** - Ensure migrations do what you expect
3. **Test migrations locally** - Run `db:migrate` before pushing
4. **Commit schema + migrations together** - Keep them in sync
5. **Use transactions** - Wrap multiple operations in `db.transaction()`
6. **Use enums for status** - Type-safe status values prevent bugs
7. **Index frequently queried columns** - Already done for common queries
8. **Export types** - Share types across the monorepo

## Package Exports

```typescript
// Main export
import { db, client } from '@repo/database';

// Schema export
import { workflows, executions, executionSteps } from '@repo/database/schema';

// Types
import type { Workflow, Execution } from '@repo/database';

// Utilities
import { eq, and, or, sql, desc, asc } from '@repo/database';
```

## Version History

- **v1.0.0** - Initial schema with workflows, executions, execution_steps
- **v1.1.0** - Added status enums, indexes, and type exports
- **v1.2.0** - Migration workflow, safety checks, improved documentation
