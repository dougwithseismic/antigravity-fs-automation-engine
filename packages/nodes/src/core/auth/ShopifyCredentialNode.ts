import { AntigravityNode, NodeExecutionArgs, NodeExecutionResult, NodeHandle } from '../../types';

export class ShopifyCredentialNode implements AntigravityNode {
    name = 'shopify-credential';
    displayName = 'Shopify Credentials';
    description = 'Configure Shopify API credentials';
    version = 1;
    inputs = ['shopUrl', 'accessToken'];
    outputs = ['credential'];
    category = 'Utility' as const;
    tags = ['auth', 'shopify', 'credential'];

    defaults = {
        shopUrl: '',
        accessToken: ''
    };

    handles: NodeHandle[] = [
        // Control Flow
        { id: 'flow-in', type: 'target', dataType: 'flow', label: 'In' },
        { id: 'flow-out', type: 'source', dataType: 'flow', label: 'Out' },
        
        // Data Outputs
        { id: 'credential', type: 'source', dataType: 'credential', label: 'Shopify Credential' }
    ];

    ui = {
        icon: 'key',
        inputs: [
            {
                id: 'shopUrl',
                label: 'Shop URL',
                type: 'text' as const,
                placeholder: 'my-shop.myshopify.com',
                required: true
            },
            {
                id: 'accessToken',
                label: 'Access Token',
                type: 'password' as const,
                placeholder: 'shpat_...',
                required: true
            }
        ],
        outputs: [
            {
                id: 'credential',
                label: 'Credential',
                type: 'credentials.shopify'
            }
        ]
    };

    async execute({ node, input }: NodeExecutionArgs): Promise<NodeExecutionResult> {
        const shopUrl = input.shopUrl || node.data.shopUrl;
        const accessToken = input.accessToken || node.data.accessToken;

        if (!shopUrl || !accessToken) {
            throw new Error('Shop URL and Access Token are required');
        }

        return {
            status: 'success',
            output: {
                credential: {
                    shopUrl,
                    accessToken,
                    type: 'shopify'
                }
            }
        };
    }
}
