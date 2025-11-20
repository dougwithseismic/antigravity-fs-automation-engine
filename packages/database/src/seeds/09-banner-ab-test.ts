/**
 * Scenario 9: Banner A/B Test
 * Randomly show banner vs no banner
 * Track which variant performs better
 */
export const bannerABTestWorkflow = {
    name: 'Banner A/B Test',
    description: 'Randomly show banner vs no banner → Track conversion rates',
    nodes: [
        {
            id: '1',
            type: 'start',
            position: { x: 300, y: 100 },
            data: { label: 'Start' }
        },
        {
            id: '2',
            type: 'analytics',
            position: { x: 300, y: 200 },
            data: {
                label: 'Log Test Start',
                eventName: 'ab_test_started'
            }
        },
        {
            id: '3',
            type: 'switch',
            position: { x: 300, y: 300 },
            data: {
                label: 'A/B Split',
                switchKey: 'variant',
                randomize: true,
                options: ['A', 'B']
            }
        },
        // Variant A: Show Banner
        {
            id: '4',
            type: 'analytics',
            position: { x: 150, y: 400 },
            data: {
                label: 'Variant A: Track',
                eventName: 'variant_a_shown'
            }
        },
        {
            id: '5',
            type: 'banner-form',
            position: { x: 150, y: 500 },
            data: {
                label: 'Variant A: Banner',
                message: '🎁 Special offer! Enter your email for 20% off'
            },
            environment: 'client'
        },
        {
            id: '6',
            type: 'discount',
            position: { x: 150, y: 600 },
            data: {
                label: 'Generate Code',
                prefix: 'BANNER20',
                percentage: 20
            }
        },
        {
            id: '7',
            type: 'analytics',
            position: { x: 150, y: 700 },
            data: {
                label: 'Variant A: Conversion',
                eventName: 'variant_a_converted'
            }
        },
        // Variant B: No Banner (Direct offer)
        {
            id: '8',
            type: 'analytics',
            position: { x: 450, y: 400 },
            data: {
                label: 'Variant B: Track',
                eventName: 'variant_b_shown'
            }
        },
        {
            id: '9',
            type: 'window-alert',
            position: { x: 450, y: 500 },
            data: {
                label: 'Variant B: Direct Message',
                message: 'Welcome! Use code DIRECT15 for 15% off your order'
            },
            environment: 'client'
        },
        {
            id: '10',
            type: 'analytics',
            position: { x: 450, y: 600 },
            data: {
                label: 'Variant B: Acknowledged',
                eventName: 'variant_b_acknowledged'
            }
        },
        // Convergence
        {
            id: '11',
            type: 'analytics',
            position: { x: 300, y: 800 },
            data: {
                label: 'Log Test Complete',
                eventName: 'ab_test_completed'
            }
        }
    ],
    edges: [
        { id: 'e1-2', source: '1', target: '2' },
        { id: 'e2-3', source: '2', target: '3' },
        // A/B Split
        { id: 'e3-4', source: '3', target: '4', condition: 'A' },
        { id: 'e3-8', source: '3', target: '8', condition: 'B' },
        // Variant A path
        { id: 'e4-5', source: '4', target: '5' },
        { id: 'e5-6', source: '5', target: '6' },
        { id: 'e6-7', source: '6', target: '7' },
        { id: 'e7-11', source: '7', target: '11' },
        // Variant B path
        { id: 'e8-9', source: '8', target: '9' },
        { id: 'e9-10', source: '9', target: '10' },
        { id: 'e10-11', source: '10', target: '11' }
    ]
};
