import { buildWorkflow } from './helpers';

export const agentWorkflow = buildWorkflow({
    name: 'AI Agent with Tools',
    description: 'An AI agent that can use tools to answer questions.',
    nodes: [
        {
            id: '1',
            type: 'start',
            position: { x: 100, y: 300 },
            data: {
                label: 'Start',
                description: 'Agent workflow entry point',
                handles: [
                    { id: '1-flow-out', type: 'source', dataType: 'flow', label: 'Out' },
                    { id: '1-context', type: 'source', dataType: 'json', label: 'Context' }
                ]
            }
        },
        {
            id: '2',
            type: 'agent',
            position: { x: 600, y: 300 },
            data: {
                label: 'Support Agent',
                description: 'AI agent with Shopify order lookup capability',
                instructions: 'You are a helpful customer support agent. Use the available tools to look up order information.',
                handles: [
                    { id: '2-flow-in', type: 'target', dataType: 'flow', label: 'In' },
                    { id: '2-flow-out', type: 'source', dataType: 'flow', label: 'Out' },
                    { id: '2-instructions', type: 'target', dataType: 'string', label: 'Instructions' },
                    { id: '2-chat-input', type: 'target', dataType: 'string', label: 'Input' },
                    { id: '2-response', type: 'source', dataType: 'string', label: 'Response' },
                    { id: '2-confidence', type: 'source', dataType: 'number', label: 'Confidence' }
                ]
            }
        },
        {
            id: '3',
            type: 'shopify', // Using shopify as a tool provider
            position: { x: 600, y: 600 },
            data: {
                label: 'Get Order Tool',
                description: 'Shopify order lookup tool for agent',
                resource: 'order',
                operation: 'get',
                handles: [
                    { id: '3-flow-in', type: 'target', dataType: 'flow', label: 'In' },
                    { id: '3-flow-out', type: 'source', dataType: 'flow', label: 'Out' },
                    { id: '3-credential', type: 'target', dataType: 'string', label: 'Credential' },
                    { id: '3-payload', type: 'target', dataType: 'json', label: 'Payload' },
                    { id: '3-data', type: 'source', dataType: 'json', label: 'Response' }
                ]
            }
        },
        {
            id: '4',
            type: 'credential',
            position: { x: 300, y: 100 },
            data: {
                label: 'OpenAI API Key',
                description: 'OpenAI authentication credential',
                key: 'OPENAI_API_KEY',
                handles: [
                    { id: '4-flow-in', type: 'target', dataType: 'flow', label: 'In' },
                    { id: '4-flow-out', type: 'source', dataType: 'flow', label: 'Out' },
                    { id: '4-value', type: 'source', dataType: 'string', label: 'Credential' }
                ]
            }
        },
        {
            id: '7',
            type: 'shopify-credential',
            position: { x: 300, y: 600 },
            data: {
                label: 'Shopify Auth',
                description: 'Shopify store authentication',
                shopUrl: 'demo.myshopify.com',
                handles: [
                    { id: '7-flow-in', type: 'target', dataType: 'flow', label: 'In' },
                    { id: '7-flow-out', type: 'source', dataType: 'flow', label: 'Out' },
                    { id: '7-value', type: 'source', dataType: 'string', label: 'Credential' }
                ]
            }
        },
        {
            id: '6',
            type: 'llm-provider',
            position: { x: 300, y: 300 },
            data: {
                label: 'GPT-4 Provider',
                description: 'Configure GPT-4 as LLM provider',
                model: 'gpt-4',
                handles: [
                    { id: '6-flow-in', type: 'target', dataType: 'flow', label: 'In' },
                    { id: '6-flow-out', type: 'source', dataType: 'flow', label: 'Out' },
                    { id: '6-credential', type: 'target', dataType: 'string', label: 'Credential' },
                    { id: '6-provider', type: 'source', dataType: 'string', label: 'Provider' }
                ]
            }
        },
        {
            id: '5',
            type: 'window-alert',
            position: { x: 900, y: 300 },
            data: {
                label: 'Show Response',
                description: 'Display agent response to user',
                handles: [
                    { id: '5-flow-in', type: 'target', dataType: 'flow', label: 'In' },
                    { id: '5-flow-out', type: 'source', dataType: 'flow', label: 'Out' },
                    { id: '5-message', type: 'target', dataType: 'string', label: 'Message' }
                ]
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
