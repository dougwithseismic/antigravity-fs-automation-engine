import { NodeExecutionArgs, NodeExecutionResult } from '@repo/types';
import { AntigravityNode } from '../../../types';

/**
 * EmailNode - Sends transactional emails
 * Simulates sending an email via a provider like Klaviyo or SendGrid
 */
export class EmailNode implements AntigravityNode {
    name = 'email';
    displayName = 'Send Email';
    description = 'Sends a transactional email';
    version = 1;
    inputs = ['provider', 'templateId', 'to', 'variables'];
    outputs = ['emailSent', 'sentAt', 'recipient', 'provider'];
    category = 'Integration' as const;
    tags = ['email', 'klaviyo', 'sendgrid', 'transactional'];

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
            id: 'provider',
            type: 'target' as const,
            dataType: 'string' as const,
            label: 'Provider'
        },
        {
            id: 'templateId',
            type: 'target' as const,
            dataType: 'string' as const,
            label: 'Template ID'
        },
        {
            id: 'to',
            type: 'target' as const,
            dataType: 'string' as const,
            label: 'To Email'
        },
        {
            id: 'variables',
            type: 'target' as const,
            dataType: 'json' as const,
            label: 'Variables'
        },
        // Data Outputs
        {
            id: 'emailSent',
            type: 'source' as const,
            dataType: 'boolean' as const,
            label: 'Email Sent'
        },
        {
            id: 'sentAt',
            type: 'source' as const,
            dataType: 'string' as const,
            label: 'Sent At'
        },
        {
            id: 'recipient',
            type: 'source' as const,
            dataType: 'string' as const,
            label: 'Recipient'
        },
        {
            id: 'provider',
            type: 'source' as const,
            dataType: 'string' as const,
            label: 'Provider'
        }
    ];

    retry = {
        attempts: 5,
        backoff: {
            type: 'exponential' as const,
            delay: 2000,
        },
    };
    defaults = {
        provider: 'klaviyo',
        templateId: 'default'
    };

    ui = {
        icon: 'email',
        inputs: [
            {
                id: 'provider',
                label: 'Provider',
                description: 'Email service provider',
                type: 'select' as const,
                defaultValue: 'klaviyo',
                options: ['klaviyo', 'sendgrid', 'mailgun'],
                required: true
            },
            {
                id: 'templateId',
                label: 'Template ID',
                description: 'Email template identifier',
                type: 'text' as const,
                placeholder: 'welcome_offer',
                required: true
            },
            {
                id: 'to',
                label: 'To Email',
                description: 'Recipient email address',
                type: 'text' as const,
                placeholder: 'user@example.com',
                required: true,
                connection: {
                    enabled: true,
                    type: 'string'
                }
            },
            {
                id: 'variables',
                label: 'Variables',
                description: 'Template variables (JSON)',
                type: 'textarea' as const,
                placeholder: '{\n  "code": "...",\n  "name": "..."\n}',
                connection: {
                    enabled: true,
                    type: 'json'
                }
            }
        ],
        outputs: [
            {
                id: 'emailSent',
                label: 'Email Sent',
                type: 'boolean'
            },
            {
                id: 'sentAt',
                label: 'Sent At',
                type: 'string'
            },
            {
                id: 'recipient',
                label: 'Recipient',
                type: 'string'
            },
            {
                id: 'provider',
                label: 'Provider',
                type: 'string'
            }
        ]
    };

    async execute({ input, node }: NodeExecutionArgs): Promise<NodeExecutionResult> {
        const provider = node.data?.provider || this.defaults.provider;
        const templateId = node.data?.templateId || this.defaults.templateId;
        const email = input.to || input.email || input.formData?.email || node.data?.to;
        const variables = input.variables || node.data?.variables;

        if (!email) {
            console.warn(`[Email] No email address found in input. Skipping.`);
            return {
                status: 'success', // Treat as success to avoid blocking workflow? Or fail?
                output: { emailSent: false, reason: 'no_email' }
            };
        }

        console.log(`[Email] Sending email to ${email} via ${provider} (Template: ${templateId})`);

        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500));

        console.log(`[Email] Email sent successfully to ${email}`);

        return {
            status: 'success',
            output: {
                emailSent: true,
                provider,
                sentAt: new Date().toISOString(),
                recipient: email,
                variables
            }
        };
    }
}
