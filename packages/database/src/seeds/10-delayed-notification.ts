/**
 * Scenario 10: Delayed Notification
 * Shows banner → Wait 10 seconds → Show follow-up message
 * Demonstrates time-based workflow orchestration
 */
export const delayedNotificationWorkflow = {
    name: 'Delayed Notification',
    description: 'Collect email → Wait 10 seconds → Show follow-up message',
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
                label: 'Collect Email',
                message: 'Get notified when we launch!'
            },
            environment: 'client'
        },
        {
            id: '3',
            type: 'analytics',
            position: { x: 300, y: 300 },
            data: {
                label: 'Log Signup',
                eventName: 'email_collected'
            }
        },
        {
            id: '4',
            type: 'window-alert',
            position: { x: 300, y: 400 },
            data: {
                label: 'Immediate Confirmation',
                message: '✅ Thanks! We\'ll send you an update in a moment...'
            },
            environment: 'client'
        },
        {
            id: '5',
            type: 'wait',
            position: { x: 300, y: 500 },
            data: {
                label: 'Wait 10 Seconds',
                duration: 10,
                unit: 'seconds'
            }
        },
        {
            id: '6',
            type: 'discount',
            position: { x: 300, y: 600 },
            data: {
                label: 'Generate Welcome Code',
                prefix: 'WELCOME',
                percentage: 10
            }
        },
        {
            id: '7',
            type: 'window-alert',
            position: { x: 300, y: 700 },
            data: {
                label: 'Delayed Offer',
                message: '🎉 As a thank you, here\'s 10% off: {{code}}'
            },
            environment: 'client'
        },
        {
            id: '8',
            type: 'analytics',
            position: { x: 300, y: 800 },
            data: {
                label: 'Log Offer Shown',
                eventName: 'delayed_offer_shown'
            }
        }
    ],
    edges: [
        { id: 'e1-2', source: '1', target: '2' },
        { id: 'e2-3', source: '2', target: '3' },
        { id: 'e3-4', source: '3', target: '4' },
        { id: 'e4-5', source: '4', target: '5' },
        { id: 'e5-6', source: '5', target: '6' },
        { id: 'e6-7', source: '6', target: '7' },
        { id: 'e7-8', source: '7', target: '8' }
    ]
};
