import { buildWorkflow } from './helpers';

export const agentWorkflow = buildWorkflow({
    name: 'AI Agent with Tools',
    description: 'An AI agent that can use tools to answer questions.',
    nodes: [
        {
            id: '1',
            type: 'start',
            position: { x: 100, y: 300 },
            data: { label: 'Start' }
        },
        {
            id: '2',
            type: 'agent',
            position: { x: 600, y: 300 },
            data: {
                label: 'Support Agent',
                instructions: 'You are a helpful customer support agent. Use the available tools to look up order information.'
            }
        },
        {
            id: '3',
            type: 'shopify', // Using shopify as a tool provider
            position: { x: 600, y: 600 },
            data: {
                label: 'Get Order Tool',
                resource: 'order',
                operation: 'get'
            }
        },
        {
            id: '4',
            type: 'credential',
            position: { x: 300, y: 100 },
            data: {
                label: 'OpenAI API Key',
                key: 'OPENAI_API_KEY'
            }
        },
        {
            id: '7',
            type: 'shopify-credential',
            position: { x: 300, y: 600 },
            data: {
                label: 'Shopify Auth',
                shopUrl: 'demo.myshopify.com'
            }
        },
        {
            id: '6',
            type: 'llm-provider',
            position: { x: 300, y: 300 },
            data: {
                label: 'GPT-4 Provider',
                model: 'gpt-4'
            }
        },
        {
            id: '5',
            type: 'window-alert',
            position: { x: 900, y: 300 },
            data: {
                label: 'Show Response'
            }
        }
    ],
    edges: [
        // Control Flow
        {
            id: 'e1-6',
            source: '1',
            target: '6',
            sourceHandle: 'flow-out',
            targetHandle: 'flow-in'
        },
        {
            id: 'e6-2',
            source: '6',
            target: '2',
            sourceHandle: 'flow-out',
            targetHandle: 'flow-in'
        },
        {
            id: 'e2-5',
            source: '2',
            target: '5',
            sourceHandle: 'flow-out',
            targetHandle: 'flow-in'
        },
        // Data Flow
        {
            id: 'e4-6',
            source: '4', // Credential
            target: '6', // LLM Provider
            sourceHandle: 'credential',
            targetHandle: 'credential'
        },
        {
            id: 'e6-2-model',
            source: '6', // LLM Provider
            target: '2', // Agent
            sourceHandle: 'provider',
            targetHandle: 'model'
        },
        {
            id: 'e7-3',
            source: '7', // Shopify Credential
            target: '3', // Shopify Tool
            sourceHandle: 'credential',
            targetHandle: 'credential'
        },
        {
            id: 'e3-2',
            source: '3', // Shopify Tool
            target: '2', // Agent
            sourceHandle: 'tool',
            targetHandle: 'tools'
        },
        {
            id: 'e2-5-data',
            source: '2', // Agent
            target: '5', // Alert
            sourceHandle: 'response',
            targetHandle: 'message'
        }
    ]
});
