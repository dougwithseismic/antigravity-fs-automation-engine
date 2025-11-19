import { NodeExecutionArgs, NodeExecutionResult } from '@repo/types';
import { AntigravityNode } from '../../../types';
import { ExtractQueryParamsInputSchema } from './types';

export class ExtractQueryParamsNode implements AntigravityNode {
    name = 'extract-query-params';
    displayName = 'Extract Query Params';
    description = 'Parses query parameters from a URL string';
    version = 1;
    defaults = {};

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
            };
        } catch (error: any) {
            return {
                status: 'failed',
                error: `Invalid URL: ${error.message} `
            };
        }
    }
}
