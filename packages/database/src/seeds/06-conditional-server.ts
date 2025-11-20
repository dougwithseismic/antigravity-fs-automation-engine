import { buildWorkflow } from './helpers';

/**
 * Scenario 6: Conditional Branching (Server Only)
 * Condition node evaluates input and routes to different paths
 * All execution happens on server
 */
export const conditionalServerWorkflow = buildWorkflow({
    name: 'Customer Segmentation',
    description: 'Route customers based on VIP status for personalized discount offers',
    nodes: [
        {
            id: '1',
            type: 'start',
            position: { x: 250, y: 100 },
            data: {
                label: 'Start',
                description: 'Customer workflow entry',
                handles: [
                    { id: '1-flow-out', type: 'source', dataType: 'flow', label: 'Out' },
                    { id: '1-user', type: 'source', dataType: 'json', label: 'User' }
                ]
            }
        },
        {
            id: '2',
            type: 'condition',
            position: { x: 250, y: 200 },
            data: {
                label: 'Check VIP Status',
                description: 'Evaluate customer tier',
                condition: {
                    key: 'user.vip',
                    operator: '==',
                    value: true
                },
                handles: [
                    { id: '2-flow-in', type: 'target', dataType: 'flow', label: 'In' },
                    { id: '2-flow-out', type: 'source', dataType: 'flow', label: 'Out' },
                    { id: '2-value', type: 'target', dataType: 'json', label: 'Value' },
                    { id: '2-result', type: 'source', dataType: 'boolean', label: 'Result' }
                ]
            }
        },
        // True branch - VIP path
        {
            id: '3',
            type: 'shopify',
            position: { x: 100, y: 300 },
            data: {
                label: 'VIP: 30% Discount',
                description: 'Generate premium discount',
                resource: 'discount',
                operation: 'create',
                payload: `{
  "code": "VIP30",
  "percentage": 30
}`,
                handles: [
                    { id: '3-flow-in', type: 'target', dataType: 'flow', label: 'In' },
                    { id: '3-flow-out', type: 'source', dataType: 'flow', label: 'Out' },
                    { id: '3-credential', type: 'target', dataType: 'string', label: 'Credential' },
                    { id: '3-payload', type: 'target', dataType: 'json', label: 'Payload' },
                    { id: '3-data', type: 'source', dataType: 'json', label: 'Response' }
                ]
            }
        },
        {
            id: '4',
            type: 'email',
            position: { x: 100, y: 400 },
            data: {
                label: 'VIP: Premium Email',
                description: 'Send VIP offer email',
                provider: 'klaviyo',
                templateId: 'vip_offer',
                handles: [
                    { id: '4-flow-in', type: 'target', dataType: 'flow', label: 'In' },
                    { id: '4-flow-out', type: 'source', dataType: 'flow', label: 'Out' },
                    { id: '4-to', type: 'target', dataType: 'string', label: 'To' },
                    { id: '4-variables', type: 'target', dataType: 'json', label: 'Variables' },
                    { id: '4-sent', type: 'source', dataType: 'boolean', label: 'Sent' }
                ]
            }
        },
        // False branch - Regular path
        {
            id: '5',
            type: 'shopify',
            position: { x: 400, y: 300 },
            data: {
                label: 'Regular: 10% Discount',
                description: 'Generate standard discount',
                resource: 'discount',
                operation: 'create',
                payload: `{
  "code": "SAVE10",
  "percentage": 10
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
                label: 'Regular: Standard Email',
                description: 'Send standard offer email',
                provider: 'sendgrid',
                templateId: 'standard_offer',
                handles: [
                    { id: '6-flow-in', type: 'target', dataType: 'flow', label: 'In' },
                    { id: '6-flow-out', type: 'source', dataType: 'flow', label: 'Out' },
                    { id: '6-to', type: 'target', dataType: 'string', label: 'To' },
                    { id: '6-variables', type: 'target', dataType: 'json', label: 'Variables' },
                    { id: '6-sent', type: 'source', dataType: 'boolean', label: 'Sent' }
                ]
            }
        },
        // Convergence
        {
            id: '7',
            type: 'analytics',
            position: { x: 250, y: 500 },
            data: {
                label: 'Log Completion',
                description: 'Track offer completion',
                eventName: 'offer_sent',
                handles: [
                    { id: '7-flow-in', type: 'target', dataType: 'flow', label: 'In' },
                    { id: '7-flow-out', type: 'source', dataType: 'flow', label: 'Out' },
                    { id: '7-event-data', type: 'target', dataType: 'json', label: 'Event Data' }
                ]
            }
        }
    ],
    edges: [
        { id: 'e1-2', source: '1', target: '2' },
        // Conditional branches
        { id: 'e2-3', source: '2', target: '3', condition: 'true' },
        { id: 'e2-5', source: '2', target: '5', condition: 'false' },
        // Continue to completion
        { id: 'e3-4', source: '3', target: '4', sourceHandle: 'data', targetHandle: 'variables' },
        { id: 'e5-6', source: '5', target: '6', sourceHandle: 'data', targetHandle: 'variables' },
        // Converge
        { id: 'e4-7', source: '4', target: '7' },
        { id: 'e6-7', source: '6', target: '7' }
    ]
});
