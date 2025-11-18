export const ppcWorkflow = {
    name: 'PPC Landing Page Flow',
    nodes: [
        {
            id: '1',
            type: 'start',
            data: { label: 'Page Load' }
        },
        {
            id: '2',
            type: 'condition',
            data: {
                label: 'Is PPC?',
                condition: { key: 'utm_source', value: 'ppc' }
            }
        },
        {
            id: '3',
            type: 'banner-form',
            data: {
                label: 'Show Banner',
                message: 'Get 10% off your first order!'
            },
            environment: 'client'
        },
        {
            id: '4',
            type: 'analytics',
            data: {
                label: 'Log Lead',
                eventName: 'lead_captured'
            }
        },
        {
            id: '5',
            type: 'discount',
            data: {
                label: 'Generate Code'
            }
        },
        {
            id: '6',
            type: 'window-alert',
            data: {
                label: 'Show Code',
                message: 'Your code is: {{5.code}}'
            },
            environment: 'client'
        }
    ],
    edges: [
        { source: '1', target: '2' },
        { source: '2', target: '3', condition: 'true' }, // If PPC -> Banner
        { source: '3', target: '4' }, // Banner Submit -> Analytics
        { source: '4', target: '5' }, // Analytics -> Discount
        { source: '5', target: '6' }  // Discount -> Alert Code
    ]
};
