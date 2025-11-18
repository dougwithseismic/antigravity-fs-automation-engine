import { NodeExecutor, NodeExecutionResult, NodeExecutionArgs, WorkflowNode, ExecutionContext } from "../types";

class StartNodeExecutor implements NodeExecutor {
    async execute({ node, input, context, signal }: NodeExecutionArgs): Promise<NodeExecutionResult> {
        return {
            status: 'success',
            output: input || {},
        };
    }
}

class WebhookNodeExecutor implements NodeExecutor {
    async execute({ node, input, context, signal }: NodeExecutionArgs): Promise<NodeExecutionResult> {
        // In a real system, this might wait for a webhook or process webhook data
        // For now, it acts like a start node that passes input
        return {
            status: 'success',
            output: {
                body: input.body,
                headers: input.headers,
                query: input.query,
            },
        };
    }
}

class ConsoleLogNodeExecutor implements NodeExecutor {
    async execute({ node, input, context, signal }: NodeExecutionArgs): Promise<NodeExecutionResult> {
        const message = node.data?.message || "No message configured";
        console.log(`[Workflow ${context.workflowId}][Execution ${context.executionId}][Node ${node.id}] Console Log: ${message}`);
        console.log(`[Workflow ${context.workflowId}][Execution ${context.executionId}][Node ${node.id}] Input Data:`, JSON.stringify(input, null, 2));

        return {
            status: 'success',
            output: { logged: true, input },
        };
    }
}

class DefaultNodeExecutor implements NodeExecutor {
    async execute({ node, input, context, signal }: NodeExecutionArgs): Promise<NodeExecutionResult> {
        return {
            status: 'success',
            output: { message: `Executed ${node.type}`, input },
        };
    }
}

import { HumanApprovalNodeExecutor } from './human';

import { ConditionNodeExecutor, AnalyticsNodeExecutor, DiscountNodeExecutor } from './ppc';

export const nodeRegistry: Record<string, new () => NodeExecutor> = {
    'start': StartNodeExecutor,
    'webhook': WebhookNodeExecutor,
    'console-log': ConsoleLogNodeExecutor,
    'human-approval': HumanApprovalNodeExecutor,
    'condition': ConditionNodeExecutor,
    'analytics': AnalyticsNodeExecutor,
    'discount': DiscountNodeExecutor,
};

export function getNodeExecutor(node: WorkflowNode): NodeExecutor {
    const ExecutorClass = nodeRegistry[node.type];
    if (ExecutorClass) {
        return new ExecutorClass();
    }

    // Fallback for client nodes or unknown nodes
    if (node.environment === 'client') {
        // Client nodes are handled by the client, but the server needs to know to suspend.
        return {
            execute: async ({ node, input, context }) => ({ status: 'suspended' })
        } as NodeExecutor;
    }

    return new DefaultNodeExecutor();
}
