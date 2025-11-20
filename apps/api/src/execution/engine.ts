import { db, executions } from "@repo/database";
import { getWorkflowQueue } from "../config/queues";

/**
 * Execute a workflow asynchronously via the worker queue
 * This is the primary entry point for starting workflow executions
 */
export async function executeWorkflow(workflowId: number, inputData: Record<string, unknown> = {}, userId?: string) {
    // 1. Create execution record
    const [execution] = await db
        .insert(executions)
        .values({
            workflowId,
            status: "pending",
            data: inputData,
            startedAt: new Date(),
        })
        .returning();

    if (!execution) {
        throw new Error("Failed to create execution");
    }

    // 2. Enqueue job to worker
    const workflowQueue = getWorkflowQueue();
    await workflowQueue.add('start-workflow', {
        workflowId,
        executionId: execution.id,
        input: inputData,
        userId
    });

    console.log(`[Execution ${execution.id}] Enqueued for workflow ${workflowId}`);

    return {
        executionId: execution.id,
        status: 'queued',
        results: {}
    };
}
