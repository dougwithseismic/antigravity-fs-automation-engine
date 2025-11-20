import { AntigravityNode } from '../../types';
import { NodeExecutionArgs, NodeExecutionResult } from '@repo/types';

export class WebhookNode implements AntigravityNode {
    name = 'webhook';
    displayName = 'Webhook Trigger';
    description = 'Starts a workflow when an HTTP request is received. Supports GET, POST, PUT, PATCH, DELETE, and OPTIONS.';
    version = 1;
    environment = 'server' as const;
    retry = {
        attempts: 3,
        backoff: {
            type: 'exponential' as const,
            delay: 5000, // Longer delay for webhook retries
        },
    };

    defaults = {
        method: 'POST',
        path: '/webhook'
    };

    inputs = ['method', 'path'];
    outputs = ['body', 'query', 'headers', 'method', 'path'];

    handles = [
        // Control Flow - Triggers typically only have flow-out
        {
            id: 'flow-out',
            type: 'source' as const,
            dataType: 'flow' as const,
            label: 'Out'
        },
        // Data Inputs - Allow dynamic configuration
        {
            id: 'method',
            type: 'target' as const,
            dataType: 'string' as const,
            label: 'HTTP Method'
        },
        {
            id: 'path',
            type: 'target' as const,
            dataType: 'string' as const,
            label: 'Webhook Path'
        },
        // Data Outputs
        {
            id: 'body',
            type: 'source' as const,
            dataType: 'json' as const,
            label: 'Body'
        },
        {
            id: 'query',
            type: 'source' as const,
            dataType: 'json' as const,
            label: 'Query'
        },
        {
            id: 'headers',
            type: 'source' as const,
            dataType: 'json' as const,
            label: 'Headers'
        },
        {
            id: 'method',
            type: 'source' as const,
            dataType: 'string' as const,
            label: 'Method'
        },
        {
            id: 'path',
            type: 'source' as const,
            dataType: 'string' as const,
            label: 'Path'
        }
    ];

    async execute(args: NodeExecutionArgs): Promise<NodeExecutionResult> {
        // The WebhookNode is a trigger, so its "execution" is mostly about passing through
        // the data that triggered it. The orchestrator/API will inject this data
        // into the initial execution state.

        // If the node is executed as part of a workflow (e.g. re-run), it might just return
        // the data that was passed to it.

        const { input } = args;

        console.log('🪝 WebhookNode executed with input:', JSON.stringify(input).substring(0, 100));

        return {
            status: 'success',
            output: {
                body: input?.body || {},
                query: input?.query || {},
                headers: input?.headers || {},
                method: input?.method || 'UNKNOWN',
                path: input?.path || ''
            }
        };
    }
}
