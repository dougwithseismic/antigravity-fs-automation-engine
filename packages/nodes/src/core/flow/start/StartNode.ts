import { NodeExecutionArgs, NodeExecutionResult } from '@repo/types';
import { AntigravityNode } from '../../../types';

/**
 * StartNode - Entry point for workflows
 * Simply passes through input data to the next node
 */
export class StartNode implements AntigravityNode {
    name = 'start';
    displayName = 'Start';
    description = 'Entry point for workflow execution';
    version = 1;
    environment: 'server' = 'server';
    defaults = {};
    inputs = ['payload'];
    outputs = ['payload', 'started'];

    handles = [
        // Control Flow - Start node typically only has flow-out
        {
            id: 'flow-out',
            type: 'source' as const,
            dataType: 'flow' as const,
            label: 'Out'
        },
        // Data Inputs
        {
            id: 'payload',
            type: 'target' as const,
            dataType: 'json' as const,
            label: 'Initial Payload'
        },
        // Data Outputs
        {
            id: 'payload',
            type: 'source' as const,
            dataType: 'json' as const,
            label: 'Payload'
        },
        {
            id: 'started',
            type: 'source' as const,
            dataType: 'boolean' as const,
            label: 'Started'
        }
    ];

    ui = {
        icon: 'start',
        inputs: [
            {
                id: 'payload',
                label: 'Initial Payload',
                description: 'Data passed into the workflow (e.g., user, cart, request context)',
                type: 'textarea' as const,
                placeholder: '{\n  "userId": "123",\n  "email": "demo@example.com"\n}',
                connection: {
                    enabled: true,
                    type: 'json'
                }
            }
        ],
        outputs: [
            {
                id: 'payload',
                label: 'Payload',
                type: 'json'
            },
            {
                id: 'started',
                label: 'Started',
                type: 'boolean'
            }
        ]
    };

    async execute({ input, node }: NodeExecutionArgs): Promise<NodeExecutionResult> {
        const payload = input && typeof input === 'object' ? input : {};

        // Start node returns clean started flag and echoes the payload
        return {
            status: 'success',
            output: {
                started: true,
                ...payload,
                payload
            }
        };
    }
}
