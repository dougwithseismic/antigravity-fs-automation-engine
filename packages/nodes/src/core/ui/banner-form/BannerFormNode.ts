import { NodeExecutionArgs, NodeExecutionResult } from '@repo/types';
import { AntigravityNode } from '../../../types';

/**
 * BannerFormNode - Client-side banner form display
 * This node execution indicates that client-side rendering is needed
 *
 * In production:
 * - Server returns 'suspended' status
 * - Client displays banner form
 * - User submits form
 * - Client sends resume request with form data
 * - Workflow continues from next node
 */
export class BannerFormNode implements AntigravityNode {
    name = 'banner-form';
    displayName = 'Banner Form';
    description = 'Display a banner form on the client side';
    version = 1;
    category = 'UI' as const;
    tags = ['form', 'client', 'banner', 'lead-capture'];
    environment = 'client' as const;
    defaults = {};

    ui = {
        icon: 'banner',
        inputs: [
            {
                id: 'message',
                label: 'Message',
                description: 'Banner message to display',
                type: 'text' as const,
                defaultValue: 'Submit your information',
                placeholder: 'Get 10% off!'
            }
        ],
        outputs: [
            {
                id: 'email',
                label: 'Email',
                type: 'string'
            },
            {
                id: 'name',
                label: 'Name',
                type: 'string'
            },
            {
                id: 'formData',
                label: 'Form Data',
                type: 'object'
            }
        ]
    };

    async execute({ input, node }: NodeExecutionArgs): Promise<NodeExecutionResult> {
        const message = node.data?.message || 'Submit your information';

        console.log(`[BannerForm] Suspending for client interaction: "${message}"`);

        // Return suspended status with data needed for client to render UI
        return {
            status: 'suspended',
            output: {
                _clientAction: 'banner-form',
                _clientMessage: message,
                _awaitingInput: {
                    type: 'form',
                    fields: ['email', 'name']
                }
            }
        };
    }
}
