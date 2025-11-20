import { AntigravityNode, NodeExecutionArgs, NodeExecutionResult } from '../../types';

export class CredentialNode implements AntigravityNode {
    name = 'credential';
    displayName = 'Credentials';
    description = 'Load credentials from environment variables';
    version = 1;
    inputs = ['key'];
    outputs = ['value'];
    category = 'Utility' as const;
    tags = ['env', 'secrets', 'auth'];

    defaults = {
        key: ''
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
        // Data Outputs
        {
            id: 'credential',
            type: 'source' as const,
            dataType: 'credential' as const,
            label: 'Credential'
        }
    ];

    ui = {
        icon: 'key',
        inputs: [
            {
                id: 'key',
                label: 'Environment Variable',
                type: 'text' as const,
                placeholder: 'OPENAI_API_KEY',
                required: true
            }
        ],
        outputs: [
            {
                id: 'credential',
                label: 'Credential',
                type: 'credentials.env'
            }
        ]
    };

    async execute({ node, input }: NodeExecutionArgs): Promise<NodeExecutionResult> {
        const key = (input.key as string) || (node.data.key as string);

        if (!key) {
            throw new Error('Credential key is required');
        }

        // In a real implementation, this would securely access env vars
        // For now, we'll just return a placeholder or mock
        const value = process.env[key] || `[MOCK_CREDENTIAL_FOR_${key}]`;

        return {
            status: 'success',
            output: {
                value
            }
        };
    }
}
