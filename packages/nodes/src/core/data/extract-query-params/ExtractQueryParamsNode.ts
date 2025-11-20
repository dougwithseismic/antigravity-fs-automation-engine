import { NodeExecutionArgs, NodeExecutionResult } from '@repo/types';
import { AntigravityNode } from '../../../types';
import { ExtractQueryParamsInputSchema } from './types';

export class ExtractQueryParamsNode implements AntigravityNode {
    name = 'extract-query-params';
    displayName = 'Extract Query Params';
    description = 'Parses query parameters from a URL string';
    version = 1;
    defaults = {};
    inputs = ['url'];
    outputs = ['params', 'paramCount'];

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
        // Data Outputs
        {
            id: 'params',
            type: 'source' as const,
            dataType: 'json' as const,
            label: 'Params'
        },
        {
            id: 'paramCount',
            type: 'source' as const,
            dataType: 'number' as const,
            label: 'Param Count'
        }
    ];

    ui = {
        icon: 'data',
        inputs: [
            {
                id: 'url',
                label: 'URL',
                description: 'Full URL containing the query string',
                type: 'text' as const,
                placeholder: 'https://example.com?utm_source=ppc',
                required: true,
                connection: {
                    enabled: true,
                    type: 'string'
                }
            }
        ],
        outputs: [
            {
                id: 'params',
                label: 'Params',
                type: 'json'
            },
            {
                id: 'paramCount',
                label: 'Param Count',
                type: 'number'
            }
        ]
    };

    async execute({ input, node }: NodeExecutionArgs): Promise<NodeExecutionResult> {
        // Merge input and node data
        const rawInput = { ...node.data, ...input };

        // Validate input
        const validation = ExtractQueryParamsInputSchema.safeParse(rawInput);

        if (!validation.success) {
            return {
                status: 'failed',
                error: `Invalid input: ${validation.error.message} `
            };
        }

        const { url: urlString } = validation.data;

        try {
            const url = new URL(urlString);
            const params = Object.fromEntries(url.searchParams.entries());

            return {
                status: 'success',
                output: params
                    ? {
                        params,
                        paramCount: Object.keys(params).length
                    }
                    : { params: {}, paramCount: 0 }
            };
        } catch (error: any) {
            return {
                status: 'failed',
                error: `Invalid URL: ${error.message} `
            };
        }
    }
}
