import { NodeExecutionArgs, NodeExecutionResult } from '@repo/types';
import { AntigravityNode } from '../../../types';

/**
 * GoogleSearchNode - Client-side Google search mockup
 * Shows realistic Google search results (PPC, Shopping, Organic)
 * User clicks on a result type, sees landing page with UTM parameters,
 * and the workflow routes based on their choice
 */
export class GoogleSearchNode implements AntigravityNode {
    name = 'google-search';
    displayName = 'Google Search Mockup';
    description = 'Display Google search results mockup with different traffic sources';
    version = 1;
    inputs = ['searchQuery'];
    outputs = ['source', 'utmParams'];
    category = 'UI' as const;
    tags = ['search', 'client', 'interactive', 'utm', 'ab-test'];
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
            id: 'searchQuery',
            type: 'target' as const,
            dataType: 'string' as const,
            label: 'Search Query'
        },
        // Data Outputs
        {
            id: 'source',
            type: 'source' as const,
            dataType: 'string' as const,
            label: 'Traffic Source'
        },
        {
            id: 'utmParams',
            type: 'source' as const,
            dataType: 'json' as const,
            label: 'UTM Parameters'
        }
    ];

    ui = {
        icon: 'search',
        inputs: [
            {
                id: 'searchQuery',
                label: 'Search Query',
                description: 'The search query to display in the mockup',
                type: 'text' as const,
                defaultValue: 'best running shoes 2025',
                placeholder: 'running shoes'
            }
        ],
        outputs: [
            {
                id: 'source',
                label: 'Traffic Source',
                type: 'string'
            },
            {
                id: 'utmParams',
                label: 'UTM Parameters',
                type: 'object'
            }
        ]
    };

    async execute({ input, node }: NodeExecutionArgs): Promise<NodeExecutionResult> {
        const searchQuery = node.data?.searchQuery || 'best running shoes 2025';

        console.log(`[GoogleSearch] Suspending for user to choose traffic source: "${searchQuery}"`);

        // Return suspended status with data needed for client to render Google search mockup
        return {
            status: 'suspended',
            output: {
                _clientAction: 'google-search',
                _clientMessage: `Choose how you arrived (PPC, Shopping, or Organic)`,
                _awaitingInput: {
                    type: 'google-search',
                    searchQuery,
                    sources: ['ppc', 'shopping', 'organic']
                }
            }
        };
    }
}
