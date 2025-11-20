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
            data: { label: 'Server Start' }
        },
        {
            id: '2',
            type: 'analytics',
            position: { x: 100, y: 200 },
            data: {
                label: 'Log Visit',
                eventName: 'user_visit'
            }
        },
        {
            id: '3',
            type: 'banner-form',
            position: { x: 100, y: 300 },
            data: {
                label: 'Get Email (Client)',
                message: 'Get 20% off!'
            },
            environment: 'client'
        },
        {
            id: '4',
            type: 'shopify',
            position: { x: 100, y: 400 },
            data: {
                label: 'Generate Code (Server)',
                resource: 'discount',
                operation: 'create',
                payload: `{
  "code": "SAVE20",
  "percentage": 20
}`
            }
        },
        {
            id: '5',
            type: 'email',
            position: { x: 100, y: 500 },
            data: {
                label: 'Send Code (Server)',
                provider: 'klaviyo',
                templateId: 'discount_code'
            }
        },
        {
            id: '6',
            type: 'window-alert',
            position: { x: 100, y: 600 },
            data: {
                label: 'Show Success (Client)',
                message: 'Check your email for your code!'
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
