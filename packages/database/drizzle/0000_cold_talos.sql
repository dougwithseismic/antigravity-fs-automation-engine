CREATE TABLE IF NOT EXISTS "execution_steps" (
	"id" serial PRIMARY KEY NOT NULL,
	"execution_id" integer,
	"node_id" text NOT NULL,
	"status" text NOT NULL,
	"input" jsonb,
	"output" jsonb,
	"started_at" timestamp DEFAULT now() NOT NULL,
	"finished_at" timestamp,
	"attempt_number" integer DEFAULT 0,
	"last_error" text,
	"scheduled_for" timestamp,
	"input_schema" jsonb,
	"output_schema" jsonb,
	"validation_errors" jsonb
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "executions" (
	"id" serial PRIMARY KEY NOT NULL,
	"workflow_id" integer,
	"status" text NOT NULL,
	"data" jsonb,
	"started_at" timestamp DEFAULT now() NOT NULL,
	"finished_at" timestamp,
	"current_state" jsonb,
	"snapshot_count" integer DEFAULT 0,
	"pause_count" integer DEFAULT 0,
	"total_steps" integer DEFAULT 0,
	"completed_steps" integer DEFAULT 0,
	"failed_steps" integer DEFAULT 0,
	"user_id" integer
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "workflows" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"nodes" jsonb DEFAULT '[]' NOT NULL,
	"edges" jsonb DEFAULT '[]' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "execution_steps" ADD CONSTRAINT "execution_steps_execution_id_executions_id_fk" FOREIGN KEY ("execution_id") REFERENCES "executions"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "executions" ADD CONSTRAINT "executions_workflow_id_workflows_id_fk" FOREIGN KEY ("workflow_id") REFERENCES "workflows"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
