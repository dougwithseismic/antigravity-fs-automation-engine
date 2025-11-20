/**
 * Scenario 1: Server-Only Linear Workflow
 * All nodes execute on server in sequence
 * No client interaction required
 */
export const serverLinearWorkflow = {
    name: 'E-Commerce Order Processing',
    description: 'Server-side order processing with discount code generation and email notifications',
    nodes: [
        {
            id: '1',
            type: 'start',
            position: { x: 100, y: 100 },
            data: { label: 'Start' }
        },
        {
            id: '2',
            type: 'analytics',
            position: { x: 100, y: 200 },
            data: {
                label: 'Log Start',
                eventName: 'workflow_started'
            }
        },
        {
            id: '3',
            type: 'discount',
            position: { x: 100, y: 300 },
            data: {
                label: 'Generate Code',
                prefix: 'AUTO',
                percentage: 10
            }
        },
        {
            id: '4',
            type: 'email',
            position: { x: 100, y: 400 },
            data: {
                label: 'Send Email',
                provider: 'sendgrid',
                templateId: 'welcome'
            }
        },
        {
            id: '5',
            type: 'analytics',
            position: { x: 100, y: 500 },
            data: {
                label: 'Log Complete',
                eventName: 'workflow_completed'
            }
        }
    ],
    edges: [
        { id: 'e1-2', source: '1', target: '2' },
        { id: 'e2-3', source: '2', target: '3' },
        { id: 'e3-4', source: '3', target: '4' },
        { id: 'e4-5', source: '4', target: '5' }
    ]
};
