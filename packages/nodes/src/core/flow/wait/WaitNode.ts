import { NodeExecutionArgs, NodeExecutionResult } from '@repo/types';
import { AntigravityNode } from '../../../types';

export class WaitNode implements AntigravityNode {
    name = 'wait';
    displayName = 'Wait';
    description = 'Description for wait';
    version = 1;
    environment: 'server' = 'server';
    defaults = {
        amount: 10,
        unit: 'seconds'
    };
    inputs = ['amount', 'unit', 'resumePayload'];
    outputs = ['resumeAfter', 'resumePayload'];

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
            id: 'amount',
            type: 'target' as const,
            dataType: 'number' as const,
            label: 'Amount'
        },
        {
            id: 'unit',
            type: 'target' as const,
            dataType: 'string' as const,
            label: 'Unit'
        },
        {
            id: 'resumePayload',
            type: 'target' as const,
            dataType: 'json' as const,
            label: 'Resume Payload'
        },
        // Data Outputs
        {
            id: 'resumeAfter',
            type: 'source' as const,
            dataType: 'json' as const,
            label: 'Resume After'
        },
        {
            id: 'resumePayload',
            type: 'source' as const,
            dataType: 'json' as const,
            label: 'Resume Payload'
        }
    ];

    ui = {
        icon: 'clock',
        inputs: [
            {
                id: 'amount',
                label: 'Amount',
                description: 'How long to wait before resuming',
                type: 'text' as const,
                defaultValue: '10',
                placeholder: '10',
                required: true
            },
            {
                id: 'unit',
                label: 'Unit',
                type: 'select' as const,
                defaultValue: 'seconds',
                options: ['seconds', 'minutes', 'hours', 'days']
            },
            {
                id: 'resumePayload',
                label: 'Payload to Resume With',
                description: 'Optional data to forward once the wait is over',
                type: 'textarea' as const,
                placeholder: '{ "reason": "delayed_retry" }',
                connection: {
                    enabled: true,
                    type: 'json'
                }
            }
        ],
        outputs: [
            {
                id: 'resumeAfter',
                label: 'Resume After',
                type: 'object'
            },
            {
                id: 'resumePayload',
                label: 'Resume Payload',
                type: 'json'
            }
        ]
    };

    async execute({ input, node }: NodeExecutionArgs): Promise<NodeExecutionResult> {
        const amount = input.amount || node.data?.amount || 1;
        const unit = input.unit || node.data?.unit || 'seconds';
        const resumePayload = input.resumePayload || node.data?.resumePayload;

        // In a real implementation, we would calculate the resume time
        // and pass it to the engine via a specific return type or side effect.
        // For now, we just return 'suspended' to simulate a wait.

        return {
            status: 'suspended',
            output: {
                resumeAfter: { amount, unit },
                resumePayload: resumePayload || null
            }
        };
    }
}
