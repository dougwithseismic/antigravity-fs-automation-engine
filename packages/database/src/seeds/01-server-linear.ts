import { buildWorkflow } from './helpers';

/**
 * Scenario 1: Server-Only Linear Workflow
 * Server hits Shopify via Fetch + env credential, emails code, logs completion
 */
export const serverLinearWorkflow = buildWorkflow({
    name: 'E-Commerce Order Processing',
    description: 'Server-side order processing with Shopify discount creation and email notifications',
    nodes: [
        {
            id: '1',
            type: 'start',
            position: { x: 120, y: 100 },
            data: {
                label: 'Start Checkout',
                description: 'Entry point with request payload',
                handles: [
                    { id: '1-flow-out', type: 'source', dataType: 'flow', label: 'Out' },
                    { id: '1-payload', type: 'source', dataType: 'json', label: 'Payload' }
                ]
            }
        },
        {
            id: '2',
            type: 'credential',
            position: { x: 120, y: 220 },
            data: {
                label: 'Load Shopify Token',
                description: 'Retrieve Shopify admin token',
                key: 'SHOPIFY_ADMIN_TOKEN',
                handles: [
                    { id: '2-flow-in', type: 'target', dataType: 'flow', label: 'In' },
                    { id: '2-flow-out', type: 'source', dataType: 'flow', label: 'Out' },
                    { id: '2-value', type: 'source', dataType: 'string', label: 'Credential' }
                ]
            }
        },
        {
            id: '3',
            type: 'shopify',
            position: { x: 120, y: 340 },
            data: {
                label: 'Create Shopify Code',
                description: 'Generate discount code in Shopify',
                resource: 'discount',
                operation: 'create',
                payload: `{
  "code": "WELCOME10",
  "usage_limit": 1
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
            position: { x: 120, y: 460 },
            data: {
                label: 'Send Welcome Email',
                description: 'Email discount code to customer',
                provider: 'sendgrid',
                templateId: 'welcome_shopify',
                to: 'customer@example.com',
                variables: {
                    code: '{{code}}',
                    offer: '10% off your first order'
                },
                handles: [
                    { id: '4-flow-in', type: 'target', dataType: 'flow', label: 'In' },
                    { id: '4-flow-out', type: 'source', dataType: 'flow', label: 'Out' },
                    { id: '4-to', type: 'target', dataType: 'string', label: 'To' },
                    { id: '4-variables', type: 'target', dataType: 'json', label: 'Variables' },
                    { id: '4-recipient', type: 'source', dataType: 'string', label: 'Recipient' },
                    { id: '4-sent', type: 'source', dataType: 'boolean', label: 'Sent' }
                ]
            }
        },
        {
            id: '5',
            type: 'analytics',
            position: { x: 120, y: 580 },
            data: {
                label: 'Log Complete',
                description: 'Track workflow completion',
                eventName: 'workflow_completed',
                handles: [
                    { id: '5-flow-in', type: 'target', dataType: 'flow', label: 'In' },
                    { id: '5-flow-out', type: 'source', dataType: 'flow', label: 'Out' },
                    { id: '5-properties', type: 'target', dataType: 'json', label: 'Properties' }
                ]
            }
        }
    ],
    edges: [
        { id: 'e1-2', source: '1', target: '2' },
        { id: 'e2-3', source: '2', target: '3', sourceHandle: 'value', targetHandle: 'credential' },
        { id: 'e1-3', source: '1', target: '3', sourceHandle: 'payload', targetHandle: 'payload' },
        { id: 'e3-4', source: '3', target: '4', sourceHandle: 'data', targetHandle: 'variables' },
        { id: 'e1-4', source: '1', target: '4', sourceHandle: 'payload', targetHandle: 'to' },
        { id: 'e4-5', source: '4', target: '5', sourceHandle: 'recipient', targetHandle: 'properties' }
    ]
});
