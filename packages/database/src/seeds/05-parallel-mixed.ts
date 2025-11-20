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
            data: {
                label: 'Start',
                description: 'Survey entry point',
                handles: [
                    { id: '1-flow-out', type: 'source', dataType: 'flow', label: 'Out' },
                    { id: '1-context', type: 'source', dataType: 'json', label: 'Context' }
                ]
            }
        },
        {
            id: '2',
            type: 'analytics',
            position: { x: 250, y: 200 },
            data: {
                label: 'Log Split',
                description: 'Track parallel execution start',
                eventName: 'parallel_split',
                handles: [
                    { id: '2-flow-in', type: 'target', dataType: 'flow', label: 'In' },
                    { id: '2-flow-out', type: 'source', dataType: 'flow', label: 'Out' },
                    { id: '2-event-data', type: 'target', dataType: 'json', label: 'Event Data' }
                ]
            }
        },
        // Branch A - Server only
        {
            id: '3',
            type: 'shopify',
            position: { x: 100, y: 300 },
            data: {
                label: 'Server: Generate Code',
                description: 'Create automatic discount code',
                resource: 'discount',
                operation: 'create',
                payload: `{
  "code": "AUTO",
  "percentage": 10
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
                label: 'Server: Send Email',
                description: 'Send automated email notification',
                provider: 'klaviyo',
                templateId: 'auto_send',
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
        // Branch B - Client suspended
        {
            id: '5',
            type: 'banner-form',
            position: { x: 400, y: 300 },
            data: {
                label: 'Client: Collect Feedback',
                description: 'Display feedback collection form',
                message: 'How did we do?',
                handles: [
                    { id: '5-flow-in', type: 'target', dataType: 'flow', label: 'In' },
                    { id: '5-flow-out', type: 'source', dataType: 'flow', label: 'Out' },
                    { id: '5-message', type: 'target', dataType: 'string', label: 'Message' },
                    { id: '5-email', type: 'source', dataType: 'string', label: 'Email' },
                    { id: '5-form-data', type: 'source', dataType: 'json', label: 'Form Data' }
                ]
            },
            environment: 'client'
        },
        {
            id: '6',
            type: 'window-alert',
            position: { x: 400, y: 400 },
            data: {
                label: 'Client: Show Thanks',
                description: 'Display thank you message',
                message: 'Thanks for your feedback!',
                handles: [
                    { id: '6-flow-in', type: 'target', dataType: 'flow', label: 'In' },
                    { id: '6-flow-out', type: 'source', dataType: 'flow', label: 'Out' },
                    { id: '6-message', type: 'target', dataType: 'string', label: 'Message' }
                ]
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
                description: 'Track survey completion',
                eventName: 'survey_complete',
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
