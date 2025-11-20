import { AntigravityNode, NodeExecutionArgs, NodeExecutionResult } from '../../types';

export class AgentNode implements AntigravityNode {
    name = 'agent';
    displayName = 'Agent';
    description = 'Define the agent\'s instructions, then enter a task to complete using tools.';
    version = 1;
    category = 'AI' as const;
    tags = ['llm', 'agent', 'ai'];

    defaults = {
        instructions: 'You are a helpful assistant.',
        input: ''
    };

    ui = {
        icon: 'agent',
        inputs: [
            {
                id: 'model',
                label: 'Language Model',
                type: 'select' as const,
                defaultValue: 'gpt-4',
                options: ['gpt-4', 'gpt-3.5-turbo', 'claude-3-opus', 'claude-3-sonnet'],
                required: true,
                connection: {
                    enabled: true,
                    type: 'languageModel'
                }
            },
            {
                id: 'instructions',
                label: 'Agent Instructions',
                type: 'textarea' as const,
                defaultValue: 'You are a helpful assistant that can use tools.',
                placeholder: 'Enter system instructions...',
                required: true
            },
            {
                id: 'tools',
                label: 'Tools',
                type: 'select' as const, // Visual placeholder, effectively a connection point
                defaultValue: '',
                placeholder: 'Connect tools...',
                connection: {
                    enabled: true,
                    type: 'tool'
                }
            },
            {
                id: 'input',
                label: 'Input',
                type: 'textarea' as const,
                defaultValue: '',
                placeholder: 'Receiving input',
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
