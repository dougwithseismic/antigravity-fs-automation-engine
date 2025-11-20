import { AntigravityNode } from '../../types';
import { NodeExecutionArgs, NodeExecutionResult } from '@repo/types';

export class RouteChangeNode implements AntigravityNode {
    name = 'route-change';
    displayName = 'Route Change Trigger';
    description = 'Triggers when the browser URL matches a specified pattern.';
    version = 1;
    environment = 'client' as const;

    defaults = {
        pathPattern: '/' // Matches any route by default
    };

    inputs = [];
    outputs = ['path', 'params', 'query', 'hash'];

    handles = [
        // Control Flow - Triggers typically only have flow-out
        {
            id: 'flow-out',
            type: 'source' as const,
            dataType: 'flow' as const,
            label: 'Out'
        },
        // Data Outputs
        {
            id: 'path',
            type: 'source' as const,
            dataType: 'string' as const,
            label: 'Path'
        },
        {
            id: 'params',
            type: 'source' as const,
            dataType: 'json' as const,
            label: 'Params'
        },
        {
            id: 'query',
            type: 'source' as const,
            dataType: 'json' as const,
            label: 'Query'
        },
        {
            id: 'hash',
            type: 'source' as const,
            dataType: 'string' as const,
            label: 'Hash'
        }
    ];

    async execute(args: NodeExecutionArgs): Promise<NodeExecutionResult> {
        // The RouteChangeNode is a client-side trigger.
        // Its "execution" is mostly about passing through the navigation data
        // that triggered it. The client SDK will inject this data when the
        // route changes.

        const { input } = args;

        console.log('🧭 RouteChangeNode executed with navigation data:', JSON.stringify(input).substring(0, 100));

        return {
            status: 'success',
            output: {
                path: input?.path || '',
                params: input?.params || {},
                query: input?.query || {},
                hash: input?.hash || ''
            }
        };
    }

    /**
     * Check if the current path matches the configured pattern
     * Supports wildcards: /products/* matches /products/123
     */
    matchesPattern(path: string, pattern: string): boolean {
        // Simple wildcard matching
        // Convert pattern to regex: /products/* -> /^\/products\/.*/
        const regexPattern = pattern
            .replace(/\*/g, '.*')
            .replace(/\//g, '\\/');

        const regex = new RegExp(`^${regexPattern}$`);
        return regex.test(path);
    }
}
