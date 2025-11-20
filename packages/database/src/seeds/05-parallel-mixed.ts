import { buildWorkflow } from './helpers';

/**
 * Scenario 5: Parallel Mixed (Server + Client)
 * One branch runs on server, one suspends for client
 * Tests complex orchestration with mixed execution environments
 */
export const parallelMixedWorkflow = buildWorkflow({
    name: 'Interactive Survey',
    description: 'Parallel execution with server-side analytics and client-side user interaction',
    nodes: [
        {
            id: '1',
            type: 'start',
            position: { x: 250, y: 100 },
            data: { label: 'Start' }
        },
        {
            id: '2',
            type: 'analytics',
            position: { x: 250, y: 200 },
            data: {
                label: 'Log Split',
                eventName: 'parallel_split'
            }
        },
        // Branch A - Server only
        {
            id: '3',
            type: 'shopify',
            position: { x: 100, y: 300 },
            data: {
                label: 'Server: Generate Code',
                resource: 'discount',
                operation: 'create',
                payload: `{
  "code": "AUTO",
  "percentage": 10
}`
            }
        },
        {
            id: '4',
            type: 'email',
            position: { x: 100, y: 400 },
            data: {
                label: 'Server: Send Email',
                provider: 'klaviyo',
                templateId: 'auto_send'
            }
        },
        // Branch B - Client suspended
        {
            id: '5',
            type: 'banner-form',
            position: { x: 400, y: 300 },
            data: {
                label: 'Client: Collect Feedback',
                message: 'How did we do?'
            },
            environment: 'client'
        },
        {
            id: '6',
            type: 'window-alert',
            position: { x: 400, y: 400 },
            data: {
                label: 'Client: Show Thanks',
                message: 'Thanks for your feedback!'
            },
            environment: 'client'
        },
        // Convergence node - marks workflow complete
        {
            id: '7',
            type: 'analytics',
            position: { x: 250, y: 500 },
            data: {
                label: 'Survey Complete',
                eventName: 'survey_complete'
            }
        }
    ],
    edges: [
        { id: 'e1-2', source: '1', target: '2' },
        // Split into parallel branches
        { id: 'e2-3', source: '2', target: '3' },
        { id: 'e2-5', source: '2', target: '5' },
        // Continue branches
        { id: 'e3-4', source: '3', target: '4', sourceHandle: 'data', targetHandle: 'variables' },
        { id: 'e5-6', source: '5', target: '6' },
        // Converge back to single node
        { id: 'e4-7', source: '4', target: '7', sourceHandle: 'recipient', targetHandle: 'properties' },
        { id: 'e6-7', source: '6', target: '7' }
    ]
});
