import { NodeExecutionArgs, NodeExecutionResult } from '@repo/types';
import { AntigravityNode } from '../../types';

export class FetchNode implements AntigravityNode {
    name = 'fetch';
    displayName = 'HTTP Request';
    description = 'Make an HTTP request using fetch';
    version = 1;
    retry = {
        attempts: 4,
        backoff: {
            type: 'exponential' as const,
            delay: 1000,
        },
    };
    defaults = {
        method: 'GET',
        headers: {}
    };

    ui = {
        icon: 'globe',
        inputs: [
            {
                id: 'url',
                label: 'URL',
                type: 'text' as const,
                placeholder: 'https://api.example.com',
                required: true
            },
            {
                id: 'method',
                label: 'Method',
                type: 'select' as const,
                defaultValue: 'GET',
                options: ['GET', 'POST', 'PUT', 'DELETE'],
                required: true
            },
            {
                id: 'headers',
                label: 'Headers',
                type: 'textarea' as const,
                placeholder: '{"Content-Type": "application/json"}',
                defaultValue: '{}'
            },
            {
                id: 'body',
                label: 'Body',
                type: 'textarea' as const,
                placeholder: '{"key": "value"}',
                defaultValue: ''
            },
            {
                id: 'auth',
                label: 'Credentials',
                type: 'select' as const,
                defaultValue: '',
                connection: {
                    enabled: true,
                    type: 'credentials.env'
                }
            }
        ]
    };

    async execute({ node, input }: NodeExecutionArgs): Promise<NodeExecutionResult> {
        const url = (input.url as string) || (node.data.url as string);
        const method = (input.method as string) || (node.data.method as string) || 'GET';
        
        let headers = input.headers || node.data.headers || {};
        if (typeof headers === 'string') {
            try {
                headers = JSON.parse(headers);
            } catch (e) {
                headers = {};
            }
        }

        let body = input.body || node.data.body;
        if (typeof body === 'string' && body.trim().startsWith('{') && body.trim().endsWith('}')) {
             try {
                body = JSON.parse(body);
            } catch (e) {
                // Keep as string if parse fails
            }
        }

        if (!url) {
            throw new Error('URL is required');
        }

        try {
            const response = await fetch(url as string, {
                method: method as string,
                headers: headers as Record<string, string>,
                body: body ? (typeof body === 'string' ? body : JSON.stringify(body)) : undefined,
            });

            const responseHeaders: Record<string, string> = {};
            response.headers.forEach((value, key) => {
                responseHeaders[key] = value;
            });

            const data = await response.json().catch(() => null);

            return {
                status: 'success',
                output: {
                    status: response.status,
                    statusText: response.statusText,
                    headers: responseHeaders,
                    data
                }
            };
        } catch (error: any) {
            return {
                status: 'failed',
                error: error.message
            };
        }
    }
}
