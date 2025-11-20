import { AntigravityNode, NodeExecutionArgs, NodeExecutionResult, NodeHandle } from '../../types';

export class LLMProviderNode implements AntigravityNode {
    name = 'llm-provider';
    displayName = 'LLM Provider';
    description = 'Configure a Language Model Provider';
    version = 1;
    inputs = ['credential', 'model'];
    outputs = ['provider'];
    category = 'AI' as const;
    tags = ['ai', 'llm', 'provider'];

    defaults = {
        model: 'gpt-4'
    };

    handles: NodeHandle[] = [
        // Control Flow
        { id: 'flow-in', type: 'target', dataType: 'flow', label: 'In' },
        { id: 'flow-out', type: 'source', dataType: 'flow', label: 'Out' },
        
        // Data Inputs
        { id: 'credential', type: 'target', dataType: 'credential', label: 'API Key' },
        
        // Data Outputs
        { id: 'provider', type: 'source', dataType: 'model', label: 'Model Provider' }
    ];

    ui = {
        icon: 'cpu',
        inputs: [
            {
                id: 'credential',
                label: 'API Key',
                type: 'select' as const,
                required: true,
                connection: {
                    enabled: true,
                    type: 'credentials.env'
                }
            },
            {
                id: 'model',
                label: 'Model',
                type: 'select' as const,
                defaultValue: 'gpt-4',
                options: ['gpt-4', 'gpt-3.5-turbo', 'claude-3-opus', 'claude-3-sonnet'],
                required: true
            }
        ],
        outputs: [
            {
                id: 'provider',
                label: 'Provider',
                type: 'model'
            }
        ]
    };

    async execute({ node, input }: NodeExecutionArgs): Promise<NodeExecutionResult> {
        const model = input.model || node.data.model || 'gpt-4';
        const credential = input.credential || node.data.credential;

        return {
            status: 'success',
            output: {
                provider: {
                    model,
                    credential,
                    type: 'openai' // Simplified for now
                }
            }
        };
    }
}
