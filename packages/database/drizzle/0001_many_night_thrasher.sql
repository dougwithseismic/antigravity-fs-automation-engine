DO $$ BEGIN
 CREATE TYPE "execution_status" AS ENUM('pending', 'running', 'paused', 'completed', 'failed', 'cancelled');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "step_status" AS ENUM('pending', 'running', 'completed', 'failed', 'skipped');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "execution_steps" ALTER COLUMN "status" SET DATA TYPE step_status;--> statement-breakpoint
ALTER TABLE "executions" ALTER COLUMN "status" SET DATA TYPE execution_status;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "execution_steps_execution_id_idx" ON "execution_steps" ("execution_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "execution_steps_node_id_idx" ON "execution_steps" ("node_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "execution_steps_status_idx" ON "execution_steps" ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "executions_workflow_id_idx" ON "executions" ("workflow_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "executions_status_idx" ON "executions" ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "executions_user_id_idx" ON "executions" ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "executions_started_at_idx" ON "executions" ("started_at");