import { AntigravityNode, NodeExecutionArgs, NodeExecutionResult } from '../../types';

export class CredentialNode implements AntigravityNode {
    name = 'credential';
    displayName = 'Credentials';
    description = 'Load credentials from environment variables';
    version = 1;
    category = 'Utility' as const;
    tags = ['env', 'secrets', 'auth'];

    defaults = {
        key: ''
    };

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
                id: 'value',
                label: 'Value',
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
