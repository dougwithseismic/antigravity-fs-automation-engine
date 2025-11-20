/**
 * Scenario 2: Client-Only Linear Workflow
 * All nodes execute on client in sequence
 * Server orchestrates but all execution is client-side
 */
export const clientLinearWorkflow = {
    name: 'User Onboarding Wizard',
    description: 'Multi-step client-side form wizard with progressive data collection',
    nodes: [
        {
            id: '1',
            type: 'start',
            position: { x: 100, y: 100 },
            data: { label: 'Start' },
            environment: 'client'
        },
        {
            id: '2',
            type: 'banner-form',
            position: { x: 100, y: 200 },
            data: {
                label: 'Collect Email',
                message: 'Enter your email to continue'
            },
            environment: 'client'
        },
        {
            id: '3',
            type: 'window-alert',
            position: { x: 100, y: 300 },
            data: {
                label: 'Show Thank You',
                message: 'Thank you for subscribing!'
            },
            environment: 'client'
        },
        {
            id: '4',
            type: 'window-alert',
            position: { x: 100, y: 400 },
            data: {
                label: 'Show Confirmation',
                message: 'Check your email for confirmation'
            },
            environment: 'client'
        }
    ],
    edges: [
        { id: 'e1-2', source: '1', target: '2' },
        { id: 'e2-3', source: '2', target: '3' },
        { id: 'e3-4', source: '3', target: '4' }
    ]
};
