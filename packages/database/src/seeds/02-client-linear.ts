import { buildWorkflow } from './helpers';

/**
 * Scenario 2: Client-Only Linear Workflow
 * All nodes execute on client in sequence
 * Server orchestrates but all execution is client-side
 */
export const clientLinearWorkflow = buildWorkflow({
    name: 'User Onboarding Wizard',
    description: 'Multi-step client-side form wizard with progressive data collection',
    nodes: [
        {
            id: '1',
            type: 'start',
            position: { x: 100, y: 100 },
            data: {
                label: 'Start',
                description: 'User onboarding entry point',
                handles: [
                    { id: '1-flow-out', type: 'source', dataType: 'flow', label: 'Out' },
                    { id: '1-context', type: 'source', dataType: 'json', label: 'Context' }
                ]
            },
            environment: 'client'
        },
        {
            id: '2',
            type: 'banner-form',
            position: { x: 100, y: 200 },
            data: {
                label: 'Collect Email',
                description: 'Capture user email address',
                message: 'Enter your email to continue',
                handles: [
                    { id: '2-flow-in', type: 'target', dataType: 'flow', label: 'In' },
                    { id: '2-flow-out', type: 'source', dataType: 'flow', label: 'Out' },
                    { id: '2-message', type: 'target', dataType: 'string', label: 'Message' },
                    { id: '2-email', type: 'source', dataType: 'string', label: 'Email' },
                    { id: '2-form-data', type: 'source', dataType: 'json', label: 'Form Data' }
                ]
            },
            environment: 'client'
        },
        {
            id: '3',
            type: 'window-alert',
            position: { x: 100, y: 300 },
            data: {
                label: 'Show Thank You',
                description: 'Display thank you message',
                message: 'Thank you for subscribing!',
                handles: [
                    { id: '3-flow-in', type: 'target', dataType: 'flow', label: 'In' },
                    { id: '3-flow-out', type: 'source', dataType: 'flow', label: 'Out' },
                    { id: '3-message', type: 'target', dataType: 'string', label: 'Message' }
                ]
            },
            environment: 'client'
        },
        {
            id: '4',
            type: 'window-alert',
            position: { x: 100, y: 400 },
            data: {
                label: 'Show Confirmation',
                description: 'Remind user to check email',
                message: 'Check your email for confirmation',
                handles: [
                    { id: '4-flow-in', type: 'target', dataType: 'flow', label: 'In' },
                    { id: '4-flow-out', type: 'source', dataType: 'flow', label: 'Out' },
                    { id: '4-message', type: 'target', dataType: 'string', label: 'Message' }
                ]
            },
            environment: 'client'
        }
    ],
    edges: [
        { id: 'e1-2', source: '1', target: '2' },
        { id: 'e2-3', source: '2', target: '3', sourceHandle: 'email', targetHandle: 'message' },
        { id: 'e3-4', source: '3', target: '4' }
    ]
});
