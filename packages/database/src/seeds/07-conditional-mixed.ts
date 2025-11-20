import { buildWorkflow } from './helpers';

/**
 * Scenario 7: A/B Testing with Google Search Mockup
 * User selects traffic source (PPC, Shopping, Organic)
 * Different paths based on selection with realistic landing pages
 */
export const conditionalMixedWorkflow = buildWorkflow({
    name: 'A/B Testing Flow',
    description: 'Interactive Google search → Different experiences based on traffic source (PPC/Shopping/Organic)',
    nodes: [
        {
            id: '1',
            type: 'start',
            position: { x: 350, y: 100 },
            data: {
                label: 'Start',
                description: 'A/B test entry point',
                handles: [
                    { id: '1-flow-out', type: 'source', dataType: 'flow', label: 'Out' },
                    { id: '1-context', type: 'source', dataType: 'json', label: 'Context' }
                ]
            }
        },
        {
            id: '2',
            type: 'google-search',
            position: { x: 350, y: 200 },
            data: {
                label: 'Google Search Mockup',
                description: 'Simulate search results with traffic source selection',
                searchQuery: 'best running shoes 2025',
                handles: [
                    { id: '2-flow-in', type: 'target', dataType: 'flow', label: 'In' },
                    { id: '2-flow-out', type: 'source', dataType: 'flow', label: 'Out' },
                    { id: '2-query', type: 'target', dataType: 'string', label: 'Query' },
                    { id: '2-source', type: 'source', dataType: 'string', label: 'Source' },
                    { id: '2-results', type: 'source', dataType: 'json', label: 'Results' }
                ]
            },
            environment: 'client'
        },
        {
            id: '3',
            type: 'switch',
            position: { x: 350, y: 300 },
            data: {
                label: 'Route by Traffic Source',
                description: 'Branch based on selected traffic source',
                switchKey: 'source',
                handles: [
                    { id: '3-flow-in', type: 'target', dataType: 'flow', label: 'In' },
                    { id: '3-flow-out', type: 'source', dataType: 'flow', label: 'Out' },
                    { id: '3-value', type: 'target', dataType: 'string', label: 'Value' }
                ]
            }
        },
        // PPC Branch
        {
            id: '4',
            type: 'discount',
            position: { x: 100, y: 400 },
            data: {
                label: 'PPC: 25% Discount',
                description: 'Generate PPC-specific discount code',
                prefix: 'PPC25',
                percentage: 25,
                handles: [
                    { id: '4-flow-in', type: 'target', dataType: 'flow', label: 'In' },
                    { id: '4-flow-out', type: 'source', dataType: 'flow', label: 'Out' },
                    { id: '4-properties', type: 'target', dataType: 'json', label: 'Properties' },
                    { id: '4-code', type: 'source', dataType: 'string', label: 'Code' }
                ]
            }
        },
        {
            id: '5',
            type: 'window-alert',
            position: { x: 100, y: 500 },
            data: {
                label: 'PPC: Show Code',
                description: 'Display PPC offer alert',
                message: 'Special PPC offer! Your code: {{code}}',
                handles: [
                    { id: '5-flow-in', type: 'target', dataType: 'flow', label: 'In' },
                    { id: '5-flow-out', type: 'source', dataType: 'flow', label: 'Out' },
                    { id: '5-message', type: 'target', dataType: 'string', label: 'Message' }
                ]
            },
            environment: 'client'
        },
        // Shopping Branch
        {
            id: '6',
            type: 'discount',
            position: { x: 350, y: 400 },
            data: {
                label: 'Shopping: 15% Discount',
                description: 'Generate shopping-specific discount code',
                prefix: 'SHOP15',
                percentage: 15,
                handles: [
                    { id: '6-flow-in', type: 'target', dataType: 'flow', label: 'In' },
                    { id: '6-flow-out', type: 'source', dataType: 'flow', label: 'Out' },
                    { id: '6-properties', type: 'target', dataType: 'json', label: 'Properties' },
                    { id: '6-code', type: 'source', dataType: 'string', label: 'Code' }
                ]
            }
        },
        {
            id: '7',
            type: 'window-alert',
            position: { x: 350, y: 500 },
            data: {
                label: 'Shopping: Product Offer',
                description: 'Display product-specific offer',
                message: 'Product-specific offer! Code: {{code}}',
                handles: [
                    { id: '7-flow-in', type: 'target', dataType: 'flow', label: 'In' },
                    { id: '7-flow-out', type: 'source', dataType: 'flow', label: 'Out' },
                    { id: '7-message', type: 'target', dataType: 'string', label: 'Message' }
                ]
            },
            environment: 'client'
        },
        // Organic Branch
        {
            id: '8',
            type: 'analytics',
            position: { x: 600, y: 400 },
            data: {
                label: 'Organic: Track Visit',
                description: 'Track organic traffic visit',
                eventName: 'organic_visit',
                handles: [
                    { id: '8-flow-in', type: 'target', dataType: 'flow', label: 'In' },
                    { id: '8-flow-out', type: 'source', dataType: 'flow', label: 'Out' },
                    { id: '8-event-data', type: 'target', dataType: 'json', label: 'Event Data' }
                ]
            }
        },
        {
            id: '9',
            type: 'email',
            position: { x: 600, y: 500 },
            data: {
                label: 'Organic: Nurture Email',
                description: 'Send nurture email sequence',
                provider: 'klaviyo',
                templateId: 'nurture_sequence',
                handles: [
                    { id: '9-flow-in', type: 'target', dataType: 'flow', label: 'In' },
                    { id: '9-flow-out', type: 'source', dataType: 'flow', label: 'Out' },
                    { id: '9-to', type: 'target', dataType: 'string', label: 'To' },
                    { id: '9-variables', type: 'target', dataType: 'json', label: 'Variables' },
                    { id: '9-recipient', type: 'source', dataType: 'string', label: 'Recipient' },
                    { id: '9-sent', type: 'source', dataType: 'boolean', label: 'Sent' }
                ]
            }
        }
    ],
    edges: [
        { id: 'e1-2', source: '1', target: '2' },
        { id: 'e2-3', source: '2', target: '3', sourceHandle: 'source', targetHandle: 'value' },
        // Switch to three branches
        { id: 'e3-4', source: '3', target: '4', condition: 'ppc' },
        { id: 'e3-6', source: '3', target: '6', condition: 'shopping' },
        { id: 'e3-8', source: '3', target: '8', condition: 'organic' },
        // PPC path
        { id: 'e4-5', source: '4', target: '5', sourceHandle: 'code', targetHandle: 'message' },
        // Shopping path
        { id: 'e6-7', source: '6', target: '7', sourceHandle: 'code', targetHandle: 'message' },
        // Organic path
        { id: 'e8-9', source: '8', target: '9', sourceHandle: 'eventName', targetHandle: 'variables' }
    ]
});
