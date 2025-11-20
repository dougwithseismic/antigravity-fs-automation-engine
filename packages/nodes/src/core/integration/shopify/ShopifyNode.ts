import { NodeExecutionArgs, NodeExecutionResult } from '@repo/types';
import { AntigravityNode, NodeHandle } from '../../../types';

export class ShopifyNode implements AntigravityNode {
    name = 'shopify';
    displayName = 'Shopify';
    description = 'Interact with Shopify API';
    version = 1;
    inputs = ['credential', 'resource', 'operation', 'payload'];
    outputs = ['data'];
    
    // New Architecture: Handles
    handles: NodeHandle[] = [
        // Control Flow
        { id: 'flow-in', type: 'target', dataType: 'flow', label: 'In' },
        { id: 'flow-out', type: 'source', dataType: 'flow', label: 'Out' },
        
        // Data Inputs
        { id: 'credential', type: 'target', dataType: 'credential', label: 'Shopify Credential' },
        { id: 'payload', type: 'target', dataType: 'json', label: 'Payload' },
        
        // Data Outputs
        { id: 'data', type: 'source', dataType: 'json', label: 'Response' },
        { id: 'tool', type: 'source', dataType: 'tool', label: 'Tool' }
    ];

    retry = {
        attempts: 3,
        backoff: {
            type: 'exponential' as const,
            delay: 1000,
        },
    };
    
    ui = {
        icon: 'shopping-bag',
        inputs: [
            {
                id: 'credential',
                label: 'Shopify Credential',
                type: 'select' as const,
                required: true,
                connection: {
                    enabled: true,
                    type: 'credentials.shopify'
                }
            },
            {
                id: 'resource',
                label: 'Resource',
                type: 'select' as const,
                required: true,
                options: ['discount', 'product', 'order'],
                defaultValue: 'discount'
            },
            {
                id: 'operation',
                label: 'Operation',
                type: 'select' as const,
                required: true,
                options: ['create', 'get', 'update', 'delete'],
                defaultValue: 'create'
            },
            {
                id: 'payload',
                label: 'Payload',
                type: 'textarea' as const,
                description: 'JSON payload for the operation',
                placeholder: '{\n  "code": "SUMMER_SALE"\n}',
                connection: {
                    enabled: true,
                    type: 'json'
                }
            }
        ],
        outputs: [
            {
                id: 'data',
                label: 'Response',
                type: 'json'
            }
        ]
    };

    async execute({ node, input }: NodeExecutionArgs): Promise<NodeExecutionResult> {
        const resource = input.resource || node.data.resource || 'discount';
        const operation = input.operation || node.data.operation || 'create';
        const credential = input.credential || node.data.credential;
        
        let payload = input.payload || node.data.payload || {};
        if (typeof payload === 'string') {
            try {
                payload = JSON.parse(payload);
            } catch (e) {
                // keep as is or empty object
                payload = {};
            }
        }

        // Mock execution logic based on resource and operation
        let resultData: any = {};

        if (resource === 'discount' && operation === 'create') {
            resultData = {
                id: 'gid://shopify/PriceRule/1234567890',
                title: payload.code || 'NEW_DISCOUNT',
                value_type: 'percentage',
                value: '-10.0',
                customer_selection: 'all',
                target_type: 'line_item',
                target_selection: 'all',
                allocation_method: 'across',
                starts_at: new Date().toISOString(),
                code: payload.code || 'NEW_DISCOUNT'
            };
        } else if (resource === 'product' && operation === 'get') {
             resultData = {
                id: 'gid://shopify/Product/9876543210',
                title: 'Cool T-Shirt',
                handle: 'cool-t-shirt',
                status: 'active',
                variants: [
                    { id: 'gid://shopify/ProductVariant/1', title: 'Small', price: '19.99' },
                    { id: 'gid://shopify/ProductVariant/2', title: 'Medium', price: '19.99' }
                ]
            };
        } else if (resource === 'order' && operation === 'get') {
             resultData = {
                id: 'gid://shopify/Order/1122334455',
                name: '#1001',
                total_price: '45.00',
                currency: 'USD',
                customer: {
                    first_name: 'John',
                    last_name: 'Doe',
                    email: 'john@example.com'
                }
            };
        } else {
            // Default mock for other operations
            resultData = {
                mock: true,
                resource,
                operation,
                payload,
                message: 'Operation executed successfully (mock)'
            };
        }

        return {
            status: 'success',
            output: {
                data: resultData
            }
        };
    }
}
