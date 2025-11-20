import { NodeExecutionArgs, NodeExecutionResult } from '@repo/types';
import { AntigravityNode } from '../../types';

export class FetchNode implements AntigravityNode {
    name = 'fetch';
    displayName = 'HTTP Request';
    description = 'Make an HTTP request using fetch';
    version = 1;
    inputs = ['url', 'method', 'headers', 'body', 'auth', 'mockResponse'];
    outputs = ['status', 'statusText', 'headers', 'data'];

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
            id: 'url',
            type: 'target' as const,
            dataType: 'string' as const,
            label: 'URL'
        },
        {
            id: 'method',
            type: 'target' as const,
            dataType: 'string' as const,
            label: 'Method'
        },
        {
            id: 'headers',
            type: 'target' as const,
            dataType: 'json' as const,
            label: 'Headers'
        },
        {
            id: 'body',
            type: 'target' as const,
            dataType: 'json' as const,
            label: 'Body'
        },
        {
            id: 'auth',
            type: 'target' as const,
            dataType: 'credential' as const,
            label: 'Credentials'
        },
        {
            id: 'mockResponse',
            type: 'target' as const,
            dataType: 'json' as const,
            label: 'Mock Response'
        },
        // Data Outputs
        {
            id: 'status',
            type: 'source' as const,
            dataType: 'number' as const,
            label: 'Status Code'
        },
        {
            id: 'statusText',
            type: 'source' as const,
            dataType: 'string' as const,
            label: 'Status Text'
        },
        {
            id: 'headers',
            type: 'source' as const,
            dataType: 'json' as const,
            label: 'Response Headers'
        },
        {
            id: 'data',
            type: 'source' as const,
            dataType: 'json' as const,
            label: 'Response Data'
        }
    ];

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
                defaultValue: '{}',
                connection: {
                    enabled: true,
                    type: 'json'
                }
            },
            {
                id: 'body',
                label: 'Body',
                type: 'textarea' as const,
                placeholder: '{"key": "value"}',
                defaultValue: '',
                connection: {
                    enabled: true,
                    type: 'json'
                }
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
            },
            {
                id: 'mockResponse',
                label: 'Mock Response',
                type: 'textarea' as const,
                placeholder: '{ "ok": true }',
                description: 'Optional mock response to avoid real network calls'
            }
        ],
        outputs: [
            {
                id: 'status',
                label: 'Status',
                type: 'number'
            },
            {
                id: 'data',
                label: 'Response Body',
                type: 'json'
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

        const mockResponse = input.mockResponse ?? node.data?.mockResponse;
        if (mockResponse) {
            let parsedMock = mockResponse;
            if (typeof mockResponse === 'string') {
                try {
                    parsedMock = JSON.parse(mockResponse);
                } catch {
                    // leave as string
                }
            }

            return {
                status: 'success',
                output: {
                    status: 200,
                    statusText: 'MOCK',
                    headers: {},
                    data: parsedMock
                }
            };
        }

        if (!url) {
            throw new Error('URL is required');
        }

        try {
            // Attach Authorization header if provided via credential connection
            const authToken = input.auth ?? node.data?.auth ?? input.value;
            if (authToken && typeof authToken === 'string') {
                headers = {
                    ...(headers as Record<string, string>),
                    Authorization: headers?.Authorization || `Bearer ${authToken}`
                };
            }

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
