import { buildWorkflow } from './helpers';

/**
 * Scenario 8: Hybrid Customer Segmentation
 * Client collects user info → Server routes based on data → Client shows personalized offer
 * Demonstrates complex client-server interaction with conditional logic
 */
export const hybridSegmentationWorkflow = buildWorkflow({
    name: 'Hybrid Customer Segmentation',
    description: 'Client form → Server VIP check → Personalized client experience',
    nodes: [
        {
            id: '1',
            type: 'start',
            position: { x: 300, y: 100 },
            data: {
                label: 'Start',
                description: 'Segmentation entry point',
                handles: [
                    { id: '1-flow-out', type: 'source', dataType: 'flow', label: 'Out' },
                    { id: '1-context', type: 'source', dataType: 'json', label: 'Context' }
                ]
            }
        },
        {
            id: '2',
            type: 'banner-form',
            position: { x: 300, y: 200 },
            data: {
                label: 'Collect User Info',
                description: 'Collect user details for personalization',
                message: 'Enter your details to see your personalized offer',
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
            type: 'analytics',
            position: { x: 300, y: 300 },
            data: {
                label: 'Log Submission',
                description: 'Track form submission',
                eventName: 'form_submitted',
                handles: [
                    { id: '3-flow-in', type: 'target', dataType: 'flow', label: 'In' },
                    { id: '3-flow-out', type: 'source', dataType: 'flow', label: 'Out' },
                    { id: '3-event-data', type: 'target', dataType: 'json', label: 'Event Data' }
                ]
            }
        },
        {
            id: '4',
            type: 'condition',
            position: { x: 300, y: 400 },
            data: {
                label: 'Check if VIP',
                description: 'Evaluate VIP status from email',
                condition: {
                    key: 'email',
                    operator: 'contains',
                    value: 'vip'
                },
                handles: [
                    { id: '4-flow-in', type: 'target', dataType: 'flow', label: 'In' },
                    { id: '4-flow-out', type: 'source', dataType: 'flow', label: 'Out' },
                    { id: '4-value', type: 'target', dataType: 'string', label: 'Value' },
                    { id: '4-result', type: 'source', dataType: 'boolean', label: 'Result' }
                ]
            }
        },
        // VIP Path
        {
            id: '5',
            type: 'discount',
            position: { x: 150, y: 500 },
            data: {
                label: 'VIP: 30% Discount',
                description: 'Generate VIP discount code',
                prefix: 'VIP30',
                percentage: 30,
                handles: [
                    { id: '5-flow-in', type: 'target', dataType: 'flow', label: 'In' },
                    { id: '5-flow-out', type: 'source', dataType: 'flow', label: 'Out' },
                    { id: '5-properties', type: 'target', dataType: 'json', label: 'Properties' },
                    { id: '5-code', type: 'source', dataType: 'string', label: 'Code' }
                ]
            }
        },
        {
            id: '6',
            type: 'window-alert',
            position: { x: 150, y: 600 },
            data: {
                label: 'VIP: Premium Offer',
                description: 'Show premium VIP offer',
                message: '🌟 Welcome VIP! Your exclusive code: {{code}}',
                handles: [
                    { id: '6-flow-in', type: 'target', dataType: 'flow', label: 'In' },
                    { id: '6-flow-out', type: 'source', dataType: 'flow', label: 'Out' },
                    { id: '6-message', type: 'target', dataType: 'string', label: 'Message' }
                ]
            },
            environment: 'client'
        },
        // Regular Path
        {
            id: '7',
            type: 'discount',
            position: { x: 450, y: 500 },
            data: {
                label: 'Regular: 10% Discount',
                description: 'Generate standard discount code',
                prefix: 'SAVE10',
                percentage: 10,
                handles: [
                    { id: '7-flow-in', type: 'target', dataType: 'flow', label: 'In' },
                    { id: '7-flow-out', type: 'source', dataType: 'flow', label: 'Out' },
                    { id: '7-properties', type: 'target', dataType: 'json', label: 'Properties' },
                    { id: '7-code', type: 'source', dataType: 'string', label: 'Code' }
                ]
            }
        },
        {
            id: '8',
            type: 'window-alert',
            position: { x: 450, y: 600 },
            data: {
                label: 'Regular: Standard Offer',
                description: 'Show standard offer',
                message: 'Thanks! Your discount code: {{code}}',
                handles: [
                    { id: '8-flow-in', type: 'target', dataType: 'flow', label: 'In' },
                    { id: '8-flow-out', type: 'source', dataType: 'flow', label: 'Out' },
                    { id: '8-message', type: 'target', dataType: 'string', label: 'Message' }
                ]
            },
            environment: 'client'
        },
        // Convergence
        {
            id: '9',
            type: 'analytics',
            position: { x: 300, y: 700 },
            data: {
                label: 'Log Conversion',
                description: 'Track offer shown event',
                eventName: 'offer_shown',
                handles: [
                    { id: '9-flow-in', type: 'target', dataType: 'flow', label: 'In' },
                    { id: '9-flow-out', type: 'source', dataType: 'flow', label: 'Out' },
                    { id: '9-event-data', type: 'target', dataType: 'json', label: 'Event Data' }
                ]
            }
        }
    ],
    edges: [
        { id: 'e1-2', source: '1', target: '2' },
        { id: 'e2-3', source: '2', target: '3' },
        { id: 'e3-4', source: '3', target: '4', sourceHandle: 'email', targetHandle: 'value' },
        // Conditional branches
        { id: 'e4-5', source: '4', target: '5', condition: 'true' },
        { id: 'e4-7', source: '4', target: '7', condition: 'false' },
        // VIP path
        { id: 'e5-6', source: '5', target: '6', sourceHandle: 'code', targetHandle: 'message' },
        { id: 'e6-9', source: '6', target: '9' },
        // Regular path
        { id: 'e7-8', source: '7', target: '8', sourceHandle: 'code', targetHandle: 'message' },
        { id: 'e8-9', source: '8', target: '9' }
    ]
});
