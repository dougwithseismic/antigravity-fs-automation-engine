import { buildWorkflow } from './helpers';

/**
 * Scenario 9: Banner A/B Test
 * Randomly show banner vs no banner
 * Track which variant performs better
 */
export const bannerABTestWorkflow = buildWorkflow({
    name: 'Banner A/B Test',
    description: 'Randomly show banner vs no banner → Track conversion rates',
    nodes: [
        {
            id: '1',
            type: 'start',
            position: { x: 300, y: 100 },
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
            type: 'analytics',
            position: { x: 300, y: 200 },
            data: {
                label: 'Log Test Start',
                description: 'Track A/B test initialization',
                eventName: 'ab_test_started',
                handles: [
                    { id: '2-flow-in', type: 'target', dataType: 'flow', label: 'In' },
                    { id: '2-flow-out', type: 'source', dataType: 'flow', label: 'Out' },
                    { id: '2-event-data', type: 'target', dataType: 'json', label: 'Event Data' }
                ]
            }
        },
        {
            id: '3',
            type: 'switch',
            position: { x: 300, y: 300 },
            data: {
                label: 'A/B Split',
                description: 'Randomly assign variant',
                switchKey: 'variant',
                randomize: true,
                options: ['A', 'B'],
                handles: [
                    { id: '3-flow-in', type: 'target', dataType: 'flow', label: 'In' },
                    { id: '3-flow-out', type: 'source', dataType: 'flow', label: 'Out' },
                    { id: '3-variant', type: 'source', dataType: 'string', label: 'Variant' }
                ]
            }
        },
        // Variant A: Show Banner
        {
            id: '4',
            type: 'analytics',
            position: { x: 150, y: 400 },
            data: {
                label: 'Variant A: Track',
                description: 'Log banner variant shown',
                eventName: 'variant_a_shown',
                handles: [
                    { id: '4-flow-in', type: 'target', dataType: 'flow', label: 'In' },
                    { id: '4-flow-out', type: 'source', dataType: 'flow', label: 'Out' },
                    { id: '4-event-data', type: 'target', dataType: 'json', label: 'Event Data' }
                ]
            }
        },
        {
            id: '5',
            type: 'banner-form',
            position: { x: 150, y: 500 },
            data: {
                label: 'Variant A: Banner',
                description: 'Show promotional banner',
                message: '🎁 Special offer! Enter your email for 20% off',
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
            type: 'discount',
            position: { x: 150, y: 600 },
            data: {
                label: 'Generate Code',
                description: 'Create 20% discount code',
                prefix: 'BANNER20',
                percentage: 20,
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
            type: 'analytics',
            position: { x: 150, y: 700 },
            data: {
                label: 'Variant A: Conversion',
                description: 'Track banner conversion',
                eventName: 'variant_a_converted',
                handles: [
                    { id: '7-flow-in', type: 'target', dataType: 'flow', label: 'In' },
                    { id: '7-flow-out', type: 'source', dataType: 'flow', label: 'Out' },
                    { id: '7-event-data', type: 'target', dataType: 'json', label: 'Event Data' }
                ]
            }
        },
        // Variant B: No Banner (Direct offer)
        {
            id: '8',
            type: 'analytics',
            position: { x: 450, y: 400 },
            data: {
                label: 'Variant B: Track',
                description: 'Log direct message variant shown',
                eventName: 'variant_b_shown',
                handles: [
                    { id: '8-flow-in', type: 'target', dataType: 'flow', label: 'In' },
                    { id: '8-flow-out', type: 'source', dataType: 'flow', label: 'Out' },
                    { id: '8-event-data', type: 'target', dataType: 'json', label: 'Event Data' }
                ]
            }
        },
        {
            id: '9',
            type: 'window-alert',
            position: { x: 450, y: 500 },
            data: {
                label: 'Variant B: Direct Message',
                description: 'Display discount code alert',
                message: 'Welcome! Use code DIRECT15 for 15% off your order',
                handles: [
                    { id: '9-flow-in', type: 'target', dataType: 'flow', label: 'In' },
                    { id: '9-flow-out', type: 'source', dataType: 'flow', label: 'Out' },
                    { id: '9-message', type: 'target', dataType: 'string', label: 'Message' }
                ]
            },
            environment: 'client'
        },
        {
            id: '10',
            type: 'analytics',
            position: { x: 450, y: 600 },
            data: {
                label: 'Variant B: Acknowledged',
                description: 'Track alert acknowledgment',
                eventName: 'variant_b_acknowledged',
                handles: [
                    { id: '10-flow-in', type: 'target', dataType: 'flow', label: 'In' },
                    { id: '10-flow-out', type: 'source', dataType: 'flow', label: 'Out' },
                    { id: '10-event-data', type: 'target', dataType: 'json', label: 'Event Data' }
                ]
            }
        },
        // Convergence
        {
            id: '11',
            type: 'analytics',
            position: { x: 300, y: 800 },
            data: {
                label: 'Log Test Complete',
                description: 'Track A/B test completion',
                eventName: 'ab_test_completed',
                handles: [
                    { id: '11-flow-in', type: 'target', dataType: 'flow', label: 'In' },
                    { id: '11-flow-out', type: 'source', dataType: 'flow', label: 'Out' },
                    { id: '11-event-data', type: 'target', dataType: 'json', label: 'Event Data' }
                ]
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
        { id: 'e5-6', source: '5', target: '6', sourceHandle: 'email', targetHandle: 'properties' },
        { id: 'e6-7', source: '6', target: '7' },
        { id: 'e7-11', source: '7', target: '11' },
        // Variant B path
        { id: 'e8-9', source: '8', target: '9' },
        { id: 'e9-10', source: '9', target: '10' },
        { id: 'e10-11', source: '10', target: '11' }
    ]
});
