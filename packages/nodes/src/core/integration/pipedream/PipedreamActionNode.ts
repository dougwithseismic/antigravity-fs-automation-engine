import { AntigravityNode } from '../../../types';
import { NodeExecutionArgs, NodeExecutionResult } from '@repo/types';
import { PipedreamConnectClient } from './client';

/**
 * PipedreamActionNode - executes a Pipedream Connect component action.
 * This is a thin wrapper so we can lean on Pipedream's 3000+ connectors while
 * keeping orchestration inside Antigravity.
 */
export class PipedreamActionNode implements AntigravityNode {
    name = 'pipedream-action';
    displayName = 'Pipedream Action';
    description = 'Execute a Pipedream Connect action using a saved connection.';
    version = 1;
    category = 'Integration' as const;
    tags = ['pipedream', 'connect', 'integration'];
    environment: 'server' = 'server';

    private client = new PipedreamConnectClient();

    handles = [
        // Control Flow
        {
            id: 'flow-in',
            type: 'target' as const,
            dataType: 'flow' as const,
            label: 'In'
        },
        {
            id: 'flow-out',
            type: 'source' as const,
            dataType: 'flow' as const,
            label: 'Out'
        },
        // Data Inputs
        {
            id: 'componentId',
            type: 'target' as const,
            dataType: 'string' as const,
            label: 'Component ID'
        },
        {
            id: 'actionName',
            type: 'target' as const,
            dataType: 'string' as const,
            label: 'Action Name'
        },
        {
            id: 'connectionId',
            type: 'target' as const,
            dataType: 'string' as const,
            label: 'Connection ID'
        },
        {
            id: 'payload',
            type: 'target' as const,
            dataType: 'json' as const,
            label: 'Payload'
        },
        // Data Outputs
        {
            id: 'response',
            type: 'source' as const,
            dataType: 'json' as const,
            label: 'Response'
        }
    ];

    ui = {
        icon: 'plug',
        inputs: [
            {
                id: 'componentId',
                label: 'Component ID',
                type: 'text' as const,
                placeholder: '@pipedreams/monday',
                required: true,
            },
            {
                id: 'actionName',
                label: 'Action Name',
                type: 'text' as const,
                placeholder: 'create_item',
                required: true,
            },
            {
                id: 'connectionId',
                label: 'Connection ID',
                type: 'text' as const,
                placeholder: 'conn_xxx',
                connection: {
                    enabled: true,
                    type: 'pipedream.connection',
                },
            },
            {
                id: 'payload',
                label: 'Payload',
                type: 'textarea' as const,
                placeholder: '{\n  "boardId": "..."\n}',
            },
        ],
        outputs: [
            {
                id: 'response',
                label: 'Response',
                type: 'json',
            },
        ],
    };

    async execute({ input, node, context }: NodeExecutionArgs): Promise<NodeExecutionResult> {
        const componentId = input.componentId || node.data?.componentId;
        const actionName = input.actionName || node.data?.actionName;
        const connectionId = input.connectionId || node.data?.connectionId;
        const payload = input.payload || node.data?.payload || {};

        if (!componentId || !actionName) {
            return {
                status: 'failed',
                error: 'componentId and actionName are required',
            };
        }

        const response = await this.client.invokeAction({
            componentId,
            actionName,
            connectionId,
            input: payload,
        });

        return {
            status: 'success',
            output: {
                response: response.data,
                componentId,
                actionName,
                connectionId,
                workflowId: context.workflowId,
                executionId: context.executionId,
            },
        };
    }
}
