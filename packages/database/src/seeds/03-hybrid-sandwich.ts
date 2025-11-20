import { buildWorkflow } from './helpers';

/**
 * Scenario 3: Hybrid Sandwich (Server → Client → Server)
 * Server processes, waits for client input, continues on server
 * Classic suspended workflow pattern
 */
export const hybridSandwichWorkflow = buildWorkflow({
    name: 'Lead Capture & Qualification',
    description: 'Client form collection → Server processing → Client confirmation flow',
    nodes: [
        {
            id: '1',
            type: 'start',
            position: { x: 100, y: 100 },
            data: {
                label: 'Server Start',
                description: 'Server-side workflow initiation',
                handles: [
                    { id: '1-flow-out', type: 'source', dataType: 'flow', label: 'Out' },
                    { id: '1-context', type: 'source', dataType: 'json', label: 'Context' }
                ]
            }
        },
        {
            id: '2',
            type: 'analytics',
            position: { x: 100, y: 200 },
            data: {
                label: 'Log Visit',
                description: 'Track user page visit',
                eventName: 'user_visit',
                handles: [
                    { id: '2-flow-in', type: 'target', dataType: 'flow', label: 'In' },
                    { id: '2-flow-out', type: 'source', dataType: 'flow', label: 'Out' },
                    { id: '2-event-data', type: 'target', dataType: 'json', label: 'Event Data' }
                ]
            }
        },
        {
            id: '3',
            type: 'banner-form',
            position: { x: 100, y: 300 },
            data: {
                label: 'Get Email (Client)',
                description: 'Collect email for discount',
                message: 'Get 20% off!',
                handles: [
                    { id: '3-flow-in', type: 'target', dataType: 'flow', label: 'In' },
                    { id: '3-flow-out', type: 'source', dataType: 'flow', label: 'Out' },
                    { id: '3-message', type: 'target', dataType: 'string', label: 'Message' },
                    { id: '3-email', type: 'source', dataType: 'string', label: 'Email' },
                    { id: '3-form-data', type: 'source', dataType: 'json', label: 'Form Data' }
                ]
            },
            environment: 'client'
        },
        {
            id: '4',
            type: 'shopify',
            position: { x: 100, y: 400 },
            data: {
                label: 'Generate Code (Server)',
                description: 'Create discount in Shopify',
                resource: 'discount',
                operation: 'create',
                payload: `{
  "code": "SAVE20",
  "percentage": 20
}`,
                handles: [
                    { id: '4-flow-in', type: 'target', dataType: 'flow', label: 'In' },
                    { id: '4-flow-out', type: 'source', dataType: 'flow', label: 'Out' },
                    { id: '4-credential', type: 'target', dataType: 'string', label: 'Credential' },
                    { id: '4-payload', type: 'target', dataType: 'json', label: 'Payload' },
                    { id: '4-data', type: 'source', dataType: 'json', label: 'Response' }
                ]
            }
        },
        {
            id: '5',
            type: 'email',
            position: { x: 100, y: 500 },
            data: {
                label: 'Send Code (Server)',
                description: 'Email discount code',
                provider: 'klaviyo',
                templateId: 'discount_code',
                handles: [
                    { id: '5-flow-in', type: 'target', dataType: 'flow', label: 'In' },
                    { id: '5-flow-out', type: 'source', dataType: 'flow', label: 'Out' },
                    { id: '5-to', type: 'target', dataType: 'string', label: 'To' },
                    { id: '5-variables', type: 'target', dataType: 'json', label: 'Variables' },
                    { id: '5-sent', type: 'source', dataType: 'boolean', label: 'Sent' }
                ]
            }
        },
        {
            id: '6',
            type: 'window-alert',
            position: { x: 100, y: 600 },
            data: {
                label: 'Show Success (Client)',
                description: 'Confirm email sent',
                message: 'Check your email for your code!',
                handles: [
                    { id: '6-flow-in', type: 'target', dataType: 'flow', label: 'In' },
                    { id: '6-flow-out', type: 'source', dataType: 'flow', label: 'Out' },
                    { id: '6-message', type: 'target', dataType: 'string', label: 'Message' }
                ]
            },
            environment: 'client'
        }
    ],
    edges: [
        { id: 'e1-2', source: '1', target: '2' },
        { id: 'e2-3', source: '2', target: '3' },
        { id: 'e3-4', source: '3', target: '4' },
        { id: 'e3-5', source: '3', target: '5', sourceHandle: 'email', targetHandle: 'to' },
        { id: 'e4-5', source: '4', target: '5', sourceHandle: 'data', targetHandle: 'variables' },
        { id: 'e5-6', source: '5', target: '6' }
    ]
});
