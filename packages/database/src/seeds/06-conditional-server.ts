/**
 * Scenario 6: Conditional Branching (Server Only)
 * Condition node evaluates input and routes to different paths
 * All execution happens on server
 */
export const conditionalServerWorkflow = {
    name: 'Customer Segmentation',
    description: 'Route customers based on VIP status for personalized discount offers',
    nodes: [
        {
            id: '1',
            type: 'start',
            position: { x: 250, y: 100 },
            data: { label: 'Start' }
        },
        {
            id: '2',
            type: 'condition',
            position: { x: 250, y: 200 },
            data: {
                label: 'Check VIP Status',
                condition: {
                    key: 'user.vip',
                    operator: '==',
                    value: true
                }
            }
        },
        // True branch - VIP path
        {
            id: '3',
            type: 'discount',
            position: { x: 100, y: 300 },
            data: {
                label: 'VIP: 30% Discount',
                prefix: 'VIP30',
                percentage: 30
            }
        },
        {
            id: '4',
            type: 'email',
            position: { x: 100, y: 400 },
            data: {
                label: 'VIP: Premium Email',
                provider: 'klaviyo',
                templateId: 'vip_offer'
            }
        },
        // False branch - Regular path
        {
            id: '5',
            type: 'discount',
            position: { x: 400, y: 300 },
            data: {
                label: 'Regular: 10% Discount',
                prefix: 'SAVE10',
                percentage: 10
            }
        },
        {
            id: '6',
            type: 'email',
            position: { x: 400, y: 400 },
            data: {
                label: 'Regular: Standard Email',
                provider: 'sendgrid',
                templateId: 'standard_offer'
            }
        },
        // Convergence
        {
            id: '7',
            type: 'analytics',
            position: { x: 250, y: 500 },
            data: {
                label: 'Log Completion',
                eventName: 'offer_sent'
            }
        }
    ],
    edges: [
        { id: 'e1-2', source: '1', target: '2' },
        // Conditional branches
        { id: 'e2-3', source: '2', target: '3', condition: 'true' },
        { id: 'e2-5', source: '2', target: '5', condition: 'false' },
        // Continue to completion
        { id: 'e3-4', source: '3', target: '4' },
        { id: 'e5-6', source: '5', target: '6' },
        // Converge
        { id: 'e4-7', source: '4', target: '7' },
        { id: 'e6-7', source: '6', target: '7' }
    ]
};
