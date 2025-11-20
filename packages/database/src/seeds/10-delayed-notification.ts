import { buildWorkflow } from './helpers';

/**
 * Scenario 10: Delayed Notification
 * Shows banner → Wait 10 seconds → Show follow-up message
 * Demonstrates time-based workflow orchestration
 */
export const delayedNotificationWorkflow = buildWorkflow({
    name: 'Delayed Notification',
    description: 'Collect email → Wait 10 seconds → Show follow-up message',
    nodes: [
        {
            id: '1',
            type: 'start',
            position: { x: 300, y: 100 },
            data: {
                label: 'Start',
                description: 'Delayed notification entry point',
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
                label: 'Collect Email',
                description: 'Capture email for launch notification',
                message: 'Get notified when we launch!',
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
                label: 'Log Signup',
                description: 'Track email collection event',
                eventName: 'email_collected',
                handles: [
                    { id: '3-flow-in', type: 'target', dataType: 'flow', label: 'In' },
                    { id: '3-flow-out', type: 'source', dataType: 'flow', label: 'Out' },
                    { id: '3-event-data', type: 'target', dataType: 'json', label: 'Event Data' }
                ]
            }
        },
        {
            id: '4',
            type: 'window-alert',
            position: { x: 300, y: 400 },
            data: {
                label: 'Immediate Confirmation',
                description: 'Show instant confirmation message',
                message: '✅ Thanks! We\'ll send you an update in a moment...',
                handles: [
                    { id: '4-flow-in', type: 'target', dataType: 'flow', label: 'In' },
                    { id: '4-flow-out', type: 'source', dataType: 'flow', label: 'Out' },
                    { id: '4-message', type: 'target', dataType: 'string', label: 'Message' }
                ]
            },
            environment: 'client'
        },
        {
            id: '5',
            type: 'wait',
            position: { x: 300, y: 500 },
            data: {
                label: 'Wait 10 Seconds',
                description: 'Pause workflow for 10 seconds',
                amount: 10,
                unit: 'seconds',
                handles: [
                    { id: '5-flow-in', type: 'target', dataType: 'flow', label: 'In' },
                    { id: '5-flow-out', type: 'source', dataType: 'flow', label: 'Out' },
                    { id: '5-resumeAfter', type: 'source', dataType: 'string', label: 'Resume After' }
                ]
            }
        },
        {
            id: '6',
            type: 'discount',
            position: { x: 300, y: 600 },
            data: {
                label: 'Generate Welcome Code',
                description: 'Create welcome discount code',
                prefix: 'WELCOME',
                percentage: 10,
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
            position: { x: 300, y: 700 },
            data: {
                label: 'Delayed Offer',
                description: 'Display delayed offer message',
                message: '🎉 As a thank you, here\'s 10% off: {{code}}',
                handles: [
                    { id: '7-flow-in', type: 'target', dataType: 'flow', label: 'In' },
                    { id: '7-flow-out', type: 'source', dataType: 'flow', label: 'Out' },
                    { id: '7-message', type: 'target', dataType: 'string', label: 'Message' }
                ]
            },
            environment: 'client'
        },
        {
            id: '8',
            type: 'analytics',
            position: { x: 300, y: 800 },
            data: {
                label: 'Log Offer Shown',
                description: 'Track delayed offer display',
                eventName: 'delayed_offer_shown',
                handles: [
                    { id: '8-flow-in', type: 'target', dataType: 'flow', label: 'In' },
                    { id: '8-flow-out', type: 'source', dataType: 'flow', label: 'Out' },
                    { id: '8-event-data', type: 'target', dataType: 'json', label: 'Event Data' }
                ]
            }
        }
    ],
    edges: [
        { id: 'e1-2', source: '1', target: '2' },
        { id: 'e2-3', source: '2', target: '3', sourceHandle: 'email', targetHandle: 'properties' },
        { id: 'e3-4', source: '3', target: '4' },
        { id: 'e4-5', source: '4', target: '5' },
        { id: 'e5-6', source: '5', target: '6', sourceHandle: 'resumeAfter', targetHandle: 'properties' },
        { id: 'e6-7', source: '6', target: '7', sourceHandle: 'code', targetHandle: 'message' },
        { id: 'e7-8', source: '7', target: '8' }
    ]
});
