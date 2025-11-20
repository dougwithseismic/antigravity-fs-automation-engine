import { NodeExecutionArgs, NodeExecutionResult } from '@repo/types';
import { AntigravityNode } from '../../types';

/**
 * AnalyticsNode - Logs analytics events
 * In production, this would send events to analytics platforms
 */
export class AnalyticsNode implements AntigravityNode {
    name = 'analytics';
    displayName = 'Analytics';
    description = 'Log analytics events';
    version = 1;
    inputs = ['eventName', 'properties'];
    outputs = ['success', 'eventName', 'timestamp'];
    category = 'Integration' as const;
    tags = ['tracking', 'events', 'analytics'];
    defaults = {};

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
            id: 'eventName',
            type: 'target' as const,
            dataType: 'string' as const,
            label: 'Event Name'
        },
        {
            id: 'properties',
            type: 'target' as const,
            dataType: 'json' as const,
            label: 'Properties'
        },
        // Data Outputs
        {
            id: 'success',
            type: 'source' as const,
            dataType: 'boolean' as const,
            label: 'Success'
        },
        {
            id: 'eventName',
            type: 'source' as const,
            dataType: 'string' as const,
            label: 'Event Name'
        },
        {
            id: 'timestamp',
            type: 'source' as const,
            dataType: 'string' as const,
            label: 'Timestamp'
        }
    ];

    ui = {
        icon: 'analytics',
        inputs: [
            {
                id: 'eventName',
                label: 'Event Name',
                description: 'Name of the analytics event',
                type: 'text' as const,
                placeholder: 'lead_captured',
                required: true
            },
            {
                id: 'properties',
                label: 'Properties',
                description: 'Event properties (JSON)',
                type: 'textarea' as const,
                placeholder: '{\n  "source": "ppc"\n}'
            }
        ],
        outputs: [
            {
                id: 'success',
                label: 'Success',
                type: 'boolean'
            }
        ]
    };

    async execute({ input, node }: NodeExecutionArgs): Promise<NodeExecutionResult> {
        const eventName = node.data?.eventName || 'generic_event';
        const properties = node.data?.properties || {};

        // Merge input data with configured properties
        const eventData = {
            ...properties,
            ...input,
            timestamp: new Date().toISOString(),
            eventName
        };

        // In production, send to analytics platform (e.g., Mixpanel, Segment, GA)
        console.log(`[Analytics] Event: ${eventName}`, eventData);

        // Return only this node's output
        return {
            status: 'success',
            output: {
                eventName,
                timestamp: eventData.timestamp,
                success: true
            }
        };
    }
}
