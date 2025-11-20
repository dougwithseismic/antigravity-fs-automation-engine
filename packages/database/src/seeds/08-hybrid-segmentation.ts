/**
 * Scenario 8: Hybrid Customer Segmentation
 * Client collects user info → Server routes based on data → Client shows personalized offer
 * Demonstrates complex client-server interaction with conditional logic
 */
export const hybridSegmentationWorkflow = {
    name: 'Hybrid Customer Segmentation',
    description: 'Client form → Server VIP check → Personalized client experience',
    nodes: [
        {
            id: '1',
            type: 'start',
            position: { x: 300, y: 100 },
            data: { label: 'Start' }
        },
        {
            id: '2',
            type: 'banner-form',
            position: { x: 300, y: 200 },
            data: {
                label: 'Collect User Info',
                message: 'Enter your details to see your personalized offer'
            },
            environment: 'client'
        },
        {
            id: '3',
            type: 'analytics',
            position: { x: 300, y: 300 },
            data: {
                label: 'Log Submission',
                eventName: 'form_submitted'
            }
        },
        {
            id: '4',
            type: 'condition',
            position: { x: 300, y: 400 },
            data: {
                label: 'Check if VIP',
                condition: {
                    key: 'email',
                    operator: 'contains',
                    value: 'vip'
                }
            }
        },
        // VIP Path
        {
            id: '5',
            type: 'discount',
            position: { x: 150, y: 500 },
            data: {
                label: 'VIP: 30% Discount',
                prefix: 'VIP30',
                percentage: 30
            }
        },
        {
            id: '6',
            type: 'window-alert',
            position: { x: 150, y: 600 },
            data: {
                label: 'VIP: Premium Offer',
                message: '🌟 Welcome VIP! Your exclusive code: {{code}}'
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
                prefix: 'SAVE10',
                percentage: 10
            }
        },
        {
            id: '8',
            type: 'window-alert',
            position: { x: 450, y: 600 },
            data: {
                label: 'Regular: Standard Offer',
                message: 'Thanks! Your discount code: {{code}}'
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
                eventName: 'offer_shown'
            }
        }
    ],
    edges: [
        { id: 'e1-2', source: '1', target: '2' },
        { id: 'e2-3', source: '2', target: '3' },
        { id: 'e3-4', source: '3', target: '4' },
        // Conditional branches
        { id: 'e4-5', source: '4', target: '5', condition: 'true' },
        { id: 'e4-7', source: '4', target: '7', condition: 'false' },
        // VIP path
        { id: 'e5-6', source: '5', target: '6' },
        { id: 'e6-9', source: '6', target: '9' },
        // Regular path
        { id: 'e7-8', source: '7', target: '8' },
        { id: 'e8-9', source: '8', target: '9' }
    ]
};
