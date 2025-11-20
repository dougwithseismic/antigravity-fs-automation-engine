import { NodeExecutionArgs, NodeExecutionResult } from '@repo/types';
import { AntigravityNode } from '../../../types';

/**
 * WindowAlertNode - Client-side alert display
 * This node execution indicates that client-side rendering is needed
 *
 * In production:
 * - Server processes template and returns data
 * - Client receives instruction to show alert
 * - Client displays alert with processed message
 * - Workflow completes
 */
export class WindowAlertNode implements AntigravityNode {
    name = 'window-alert';
    displayName = 'Window Alert';
    description = 'Display an alert message on the client side';
    version = 1;
    inputs = ['message'];
    outputs = ['displayed'];
    category = 'UI' as const;
    tags = ['alert', 'client', 'notification'];
    environment = 'client' as const;
    defaults = {};

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
            id: 'message',
            type: 'target' as const,
            dataType: 'string' as const,
            label: 'Message'
        },
        // Data Outputs
        {
            id: 'displayed',
            type: 'source' as const,
            dataType: 'boolean' as const,
            label: 'Displayed'
        }
    ];

    ui = {
        icon: 'alert',
        inputs: [
            {
                id: 'message',
                label: 'Message',
                description: 'Alert message (supports template variables like {{code}})',
                type: 'textarea' as const,
                placeholder: 'Your code is: {{code}}',
                required: true,
                connection: {
                    enabled: true,
                    type: 'string'
                }
            }
        ],
        outputs: [
            {
                id: 'displayed',
                label: 'Displayed',
                type: 'boolean'
            }
        ]
    };

    async execute({ input, node }: NodeExecutionArgs): Promise<NodeExecutionResult> {
        let message = node.data?.message || 'Alert';

        // Process template variables (e.g., {{5.code}})
        message = this.processTemplate(message, input);

        console.log(`[WindowAlert] Suspending for client interaction: "${message}"`);

        // MUST return 'suspended' status so execution stops and waits for client acknowledgment
        return {
            status: 'suspended',
            output: {
                _clientAction: 'window-alert',
                _clientMessage: message,
                _awaitingInput: {
                    type: 'alert',
                    acknowledged: false
                }
            }
        };
    }

    private processTemplate(template: string, data: any): string {
        // Template processing - replace {{key}} or {{nodeId.key}} with data[key]
        return template.replace(/\{\{([^}]+)\}\}/g, (match, key) => {
            const trimmedKey = key.trim();

            // Try direct key lookup first (e.g., {{code}})
            let value = this.getNestedValue(data, trimmedKey);

            // If not found and key contains a dot, try removing the node ID prefix
            // e.g., {{5.code}} -> try just 'code'
            if (value === undefined && trimmedKey.includes('.')) {
                const withoutNodeId = trimmedKey.split('.').slice(1).join('.');
                value = this.getNestedValue(data, withoutNodeId);
            }

            return value !== undefined ? String(value) : match;
        });
    }

    private getNestedValue(obj: any, path: string): any {
        return path.split('.').reduce((current, key) => current?.[key], obj);
    }
}
