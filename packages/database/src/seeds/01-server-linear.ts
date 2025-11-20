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
                description: 'Entry point with request payload'
            }
        },
        {
            id: '2',
            type: 'credential',
            position: { x: 120, y: 220 },
            data: {
                label: 'Load Shopify Token',
                key: 'SHOPIFY_ADMIN_TOKEN'
            }
        },
        {
            id: '3',
            type: 'shopify',
            position: { x: 120, y: 340 },
            data: {
                label: 'Create Shopify Code',
                resource: 'discount',
                operation: 'create',
                payload: `{
  "code": "WELCOME10",
  "usage_limit": 1
}`
            }
        },
        {
            id: '4',
            type: 'email',
            position: { x: 120, y: 460 },
            data: {
                label: 'Send Welcome Email',
                provider: 'sendgrid',
                templateId: 'welcome_shopify',
                to: 'customer@example.com',
                variables: {
                    code: '{{code}}',
                    offer: '10% off your first order'
                }
            }
        },
        {
            id: '5',
            type: 'analytics',
            position: { x: 120, y: 580 },
            data: {
                label: 'Log Complete',
                eventName: 'workflow_completed'
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
