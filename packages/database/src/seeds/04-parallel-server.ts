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
            data: { label: 'Start' }
        },
        {
            id: '2',
            type: 'analytics',
            position: { x: 250, y: 200 },
            data: {
                label: 'Log Event',
                eventName: 'split_start'
            }
        },
        // Branch A - Analytics path
        {
            id: '3',
            type: 'analytics',
            position: { x: 100, y: 300 },
            data: {
                label: 'Track Conversion',
                eventName: 'conversion_tracked'
            }
        },
        {
            id: '4',
            type: 'analytics',
            position: { x: 100, y: 400 },
            data: {
                label: 'Log Attribution',
                eventName: 'attribution_logged'
            }
        },
        // Branch B - Email path
        {
            id: '5',
            type: 'shopify',
            position: { x: 400, y: 300 },
            data: {
                label: 'Generate Code',
                resource: 'discount',
                operation: 'create',
                payload: `{
  "code": "PARALLEL",
  "percentage": 15
}`
            }
        },
        {
            id: '6',
            type: 'email',
            position: { x: 400, y: 400 },
            data: {
                label: 'Send Email',
                provider: 'sendgrid',
                templateId: 'parallel_complete'
            }
        },
        // Convergence node - marks workflow complete
        {
            id: '7',
            type: 'analytics',
            position: { x: 250, y: 500 },
            data: {
                label: 'All Channels Complete',
                eventName: 'multi_channel_complete'
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
