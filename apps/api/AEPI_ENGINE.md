# AEPI Engine (Antigravity Execution & Persistence Interface)

The AEPI Engine is a stateful, graph-based workflow orchestration engine designed for reliability, observability, and human-in-the-loop interactions.

## Architecture

The engine operates on a **Directed Acyclic Graph (DAG)** model where nodes represent units of work and edges represent the flow of data and control.

### Core Components

1.  **Workflow**: The definition of the graph (Nodes & Edges).
2.  **Execution**: An instance of a running workflow.
3.  **ExecutionStep**: A persistent record of a single node execution, including input, output, status, and timing.
4.  **NodeExecutor**: The logic for executing a specific node type.

## State Machine

The engine implements a state machine for both Executions and Steps.

### Execution Statuses
- `running`: The workflow is actively processing nodes.
- `waiting`: The workflow is suspended, waiting for external input (e.g., Human Approval).
- `completed`: All reachable nodes have been executed successfully.
- `failed`: An error occurred that stopped execution.

### Step Statuses
- `pending`: Scheduled for execution.
- `running`: Currently executing.
- `suspended`: Execution halted, waiting for resume signal.
- `completed`: Successfully finished.
- `failed`: Execution failed.

## Persistence & Resumability

Every step of the execution is persisted to the database (`execution_steps` table). This allows the engine to:
1.  **Audit Trail**: Full history of inputs and outputs for every node.
2.  **Suspend/Resume**: When a node returns `suspended`, the engine halts and saves the state. The execution can be resumed later via API, picking up exactly where it left off.

## Human-in-the-Loop

The `HumanApprovalNode` demonstrates the engine's capability to pause for human intervention.
1.  Workflow reaches `HumanApprovalNode`.
2.  Node returns `suspended`.
3.  Execution status updates to `waiting`.
4.  External system (UI/Email) requests user approval.
5.  User approves via API (`POST /workflows/executions/{id}/resume`).
6.  Engine resumes, passing approval data to downstream nodes.

## Extensibility

New node types can be added by implementing the `NodeExecutor` interface and registering them in the `nodeRegistry`.

```typescript
interface NodeExecutor {
    execute(node: WorkflowNode, input: any, context: ExecutionContext): Promise<NodeExecutionResult>;
}
```
