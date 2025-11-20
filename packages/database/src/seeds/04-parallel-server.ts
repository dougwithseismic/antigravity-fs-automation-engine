import { buildWorkflow } from './helpers';

/**
 * Scenario 4: Parallel Server Branches
 * Server splits into parallel branches, both execute simultaneously
 * Workflow completes when both branches finish
 */
export const parallelServerWorkflow = buildWorkflow({
    name: 'Multi-Channel Notification',
    description: 'Parallel server branches for simultaneous email, analytics, and tracking',
    nodes: [
        {
            id: '1',
            type: 'start',
            position: { x: 250, y: 100 },
            data: {
                label: 'Start',
                description: 'Multi-channel workflow entry',
                handles: [
                    { id: '1-flow-out', type: 'source', dataType: 'flow', label: 'Out' },
                    { id: '1-context', type: 'source', dataType: 'json', label: 'Context' }
                ]
            }
        },
        {
            id: '2',
            type: 'analytics',
            position: { x: 250, y: 200 },
            data: {
                label: 'Log Event',
                description: 'Track split initiation',
                eventName: 'split_start',
                handles: [
                    { id: '2-flow-in', type: 'target', dataType: 'flow', label: 'In' },
                    { id: '2-flow-out', type: 'source', dataType: 'flow', label: 'Out' },
                    { id: '2-event-data', type: 'target', dataType: 'json', label: 'Event Data' }
                ]
            }
        },
        // Branch A - Analytics path
        {
            id: '3',
            type: 'analytics',
            position: { x: 100, y: 300 },
            data: {
                label: 'Track Conversion',
                description: 'Log conversion metrics',
                eventName: 'conversion_tracked',
                handles: [
                    { id: '3-flow-in', type: 'target', dataType: 'flow', label: 'In' },
                    { id: '3-flow-out', type: 'source', dataType: 'flow', label: 'Out' },
                    { id: '3-event-data', type: 'target', dataType: 'json', label: 'Event Data' }
                ]
            }
        },
        {
            id: '4',
            type: 'analytics',
            position: { x: 100, y: 400 },
            data: {
                label: 'Log Attribution',
                description: 'Track attribution data',
                eventName: 'attribution_logged',
                handles: [
                    { id: '4-flow-in', type: 'target', dataType: 'flow', label: 'In' },
                    { id: '4-flow-out', type: 'source', dataType: 'flow', label: 'Out' },
                    { id: '4-event-data', type: 'target', dataType: 'json', label: 'Event Data' }
                ]
            }
        },
        // Branch B - Email path
        {
            id: '5',
            type: 'shopify',
            position: { x: 400, y: 300 },
            data: {
                label: 'Generate Code',
                description: 'Create discount code',
                resource: 'discount',
                operation: 'create',
                payload: `{
  "code": "PARALLEL",
  "percentage": 15
}`,
                handles: [
                    { id: '5-flow-in', type: 'target', dataType: 'flow', label: 'In' },
                    { id: '5-flow-out', type: 'source', dataType: 'flow', label: 'Out' },
                    { id: '5-credential', type: 'target', dataType: 'string', label: 'Credential' },
                    { id: '5-payload', type: 'target', dataType: 'json', label: 'Payload' },
                    { id: '5-data', type: 'source', dataType: 'json', label: 'Response' }
                ]
            }
        },
        {
            id: '6',
            type: 'email',
            position: { x: 400, y: 400 },
            data: {
                label: 'Send Email',
                description: 'Email completion notification',
                provider: 'sendgrid',
                templateId: 'parallel_complete',
                handles: [
                    { id: '6-flow-in', type: 'target', dataType: 'flow', label: 'In' },
                    { id: '6-flow-out', type: 'source', dataType: 'flow', label: 'Out' },
                    { id: '6-to', type: 'target', dataType: 'string', label: 'To' },
                    { id: '6-variables', type: 'target', dataType: 'json', label: 'Variables' },
                    { id: '6-recipient', type: 'source', dataType: 'string', label: 'Recipient' },
                    { id: '6-sent', type: 'source', dataType: 'boolean', label: 'Sent' }
                ]
            }
        },
        // Convergence node - marks workflow complete
        {
            id: '7',
            type: 'analytics',
            position: { x: 250, y: 500 },
            data: {
                label: 'All Channels Complete',
                description: 'Track multi-channel completion',
                eventName: 'multi_channel_complete',
                handles: [
                    { id: '7-flow-in', type: 'target', dataType: 'flow', label: 'In' },
                    { id: '7-flow-out', type: 'source', dataType: 'flow', label: 'Out' },
                    { id: '7-properties', type: 'target', dataType: 'json', label: 'Properties' }
                ]
            }
        }
    ],
    edges: [
        { id: 'e1-2', source: '1', target: '2' },
        // Split into parallel branches
        { id: 'e2-3', source: '2', target: '3' },
        { id: 'e2-5', source: '2', target: '5' },
        // Continue branches
        { id: 'e3-4', source: '3', target: '4' },
        { id: 'e5-6', source: '5', target: '6', sourceHandle: 'data', targetHandle: 'variables' },
        // Converge back to single node
        { id: 'e4-7', source: '4', target: '7' },
        { id: 'e6-7', source: '6', target: '7', sourceHandle: 'recipient', targetHandle: 'properties' }
    ]
});
