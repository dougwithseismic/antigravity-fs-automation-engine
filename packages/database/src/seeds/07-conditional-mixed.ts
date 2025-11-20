/**
 * Scenario 7: A/B Testing with Google Search Mockup
 * User selects traffic source (PPC, Shopping, Organic)
 * Different paths based on selection with realistic landing pages
 */
export const conditionalMixedWorkflow = {
    name: 'A/B Testing Flow',
    description: 'Interactive Google search → Different experiences based on traffic source (PPC/Shopping/Organic)',
    nodes: [
        {
            id: '1',
            type: 'start',
            position: { x: 350, y: 100 },
            data: { label: 'Start' }
        },
        {
            id: '2',
            type: 'google-search',
            position: { x: 350, y: 200 },
            data: {
                label: 'Google Search Mockup',
                searchQuery: 'best running shoes 2025'
            },
            environment: 'client'
        },
        {
            id: '3',
            type: 'switch',
            position: { x: 350, y: 300 },
            data: {
                label: 'Route by Traffic Source',
                switchKey: 'source'
            }
        },
        // PPC Branch
        {
            id: '4',
            type: 'discount',
            position: { x: 100, y: 400 },
            data: {
                label: 'PPC: 25% Discount',
                prefix: 'PPC25',
                percentage: 25
            }
        },
        {
            id: '5',
            type: 'window-alert',
            position: { x: 100, y: 500 },
            data: {
                label: 'PPC: Show Code',
                message: 'Special PPC offer! Your code: {{code}}'
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
                prefix: 'SHOP15',
                percentage: 15
            }
        },
        {
            id: '7',
            type: 'window-alert',
            position: { x: 350, y: 500 },
            data: {
                label: 'Shopping: Product Offer',
                message: 'Product-specific offer! Code: {{code}}'
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
                eventName: 'organic_visit'
            }
        },
        {
            id: '9',
            type: 'email',
            position: { x: 600, y: 500 },
            data: {
                label: 'Organic: Nurture Email',
                provider: 'klaviyo',
                templateId: 'nurture_sequence'
            }
        }
    ],
    edges: [
        { id: 'e1-2', source: '1', target: '2' },
        { id: 'e2-3', source: '2', target: '3' },
        // Switch to three branches
        { id: 'e3-4', source: '3', target: '4', condition: 'ppc' },
        { id: 'e3-6', source: '3', target: '6', condition: 'shopping' },
        { id: 'e3-8', source: '3', target: '8', condition: 'organic' },
        // PPC path
        { id: 'e4-5', source: '4', target: '5' },
        // Shopping path
        { id: 'e6-7', source: '6', target: '7' },
        // Organic path
        { id: 'e8-9', source: '8', target: '9' }
    ]
};
