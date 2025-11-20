import { AntigravityNode, NodeExecutionArgs, NodeExecutionResult } from '../../types';

export class AgentNode implements AntigravityNode {
    name = 'agent';
    displayName = 'Agent';
    description = 'Define the agent\'s instructions, then enter a task to complete using tools.';
    version = 1;
    inputs = ['model', 'instructions', 'tools', 'input'];
    outputs = ['response'];
    category = 'AI' as const;
    tags = ['llm', 'agent', 'ai'];

    defaults = {
        instructions: 'You are a helpful assistant.',
        input: ''
    };

    handles = [
        // Control Flow
        {
            id: 'flow-in',
            type: 'target' as const,
            dataType: 'flow' as const,
            label: 'In'
        },
        {
            id: 'flow-out',
            type: 'source' as const,
            dataType: 'flow' as const,
            label: 'Out'
        },
        // Data Inputs
        {
            id: 'model',
            type: 'target' as const,
            dataType: 'model' as const,
            label: 'Language Model'
        },
        {
            id: 'tools',
            type: 'target' as const,
            dataType: 'tool' as const,
            label: 'Tools',
            acceptsMultiple: true
        },
        {
            id: 'chat-input',
            type: 'target' as const,
            dataType: 'string' as const,
            label: 'Chat Input'
        },
        // Data Outputs
        {
            id: 'response',
            type: 'source' as const,
            dataType: 'string' as const,
            label: 'Response'
        }
    ];

    ui = {
        icon: 'agent',
        // UI configuration for the node settings panel (sidebar)
        inputs: [
            {
                id: 'model',
                label: 'Model Provider',
                type: 'select' as const, // Placeholder for connection
                placeholder: 'Connect LLM Provider...',
                required: true,
                connection: {
                    enabled: true,
                    type: 'model'
                }
            },
            {
                id: 'instructions',
                label: 'System Instructions',
                type: 'textarea' as const,
                defaultValue: 'You are a helpful assistant.',
                placeholder: 'Enter system instructions...',
                required: true
            },
            {
                id: 'tools',
                label: 'Tools',
                type: 'select' as const,
                placeholder: 'Connect tools...',
                connection: {
                    enabled: true,
                    type: 'tool'
                }
            },
            {
                id: 'chat-input',
                label: 'Chat Input',
                type: 'textarea' as const,
                placeholder: 'Enter message...',
                connection: {
                    enabled: true,
                    type: 'string'
                }
            }
        ],
        outputs: [
            {
                id: 'response',
                label: 'Response',
                type: 'string'
            }
        ]
    };

    async execute({ node, input }: NodeExecutionArgs): Promise<NodeExecutionResult> {
        // Mock execution for now
        return {
            status: 'success',
            output: {
                response: `Agent processed: ${input.input || node.data.input}`
            }
        };
    }
}
