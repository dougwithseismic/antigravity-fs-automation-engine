import { NodeExecutionArgs, NodeExecutionResult } from '@repo/types';
import { AntigravityNode } from '../../types';

export class FetchNode implements AntigravityNode {
    name = 'fetch';
    displayName = 'HTTP Request';
    description = 'Make an HTTP request using fetch';
    version = 1;
    defaults = {
        method: 'GET',
        headers: {}
    };

    async execute({ node, input }: NodeExecutionArgs): Promise<NodeExecutionResult> {
        const url = (input.url as string) || (node.data.url as string);
        const method = (input.method as string) || (node.data.method as string) || 'GET';
        const headers = { ...(node.data.headers as Record<string, string>), ...(input.headers as Record<string, string>) };
        const body = input.body || node.data.body;

        if (!url) {
            throw new Error('URL is required');
        }

        try {
            const response = await fetch(url as string, {
                method: method as string,
                headers: headers as Record<string, string>,
                body: body ? JSON.stringify(body) : undefined,
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
