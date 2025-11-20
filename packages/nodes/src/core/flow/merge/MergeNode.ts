import { NodeExecutionArgs, NodeExecutionResult } from '@repo/types';
import { AntigravityNode } from '../../../types';

/**
 * MergeNode - Waits for multiple upstream nodes to complete and merges their outputs
 * Implements Promise.all pattern for workflow branching
 */
export class MergeNode implements AntigravityNode {
    name = 'merge';
    displayName = 'Wait for All';
    description = 'Synchronizes parallel branches (Promise.all pattern)';
    version = 1;
    category = 'Flow Control' as const;
    tags = ['sync', 'synchronization', 'await', 'promise-all', 'merge'];
    defaults = {
        mode: 'append',
        continueOnPartialFailure: false
    };

    handles = [
        {
            id: 'flow-in',
            type: 'target' as const,
            dataType: 'flow' as const,
            label: 'In',
            acceptsMultiple: true // Key: accepts multiple connections
        },
        {
            id: 'flow-out',
            type: 'source' as const,
            dataType: 'flow' as const,
            label: 'Out'
        }
    ];

    ui = {
        icon: 'git-merge',
        inputs: [
            {
                id: 'mode',
                label: 'Combine Mode',
                description: 'How to merge branch outputs',
                type: 'select' as const,
                defaultValue: 'append',
                options: ['append', 'combine-by-position', 'combine-by-fields'],
                required: true
            },
            {
                id: 'mergeKey',
                label: 'Merge Key',
                description: 'Field to match on (for combine-by-fields mode)',
                type: 'text' as const,
                placeholder: 'id'
            },
            {
                id: 'continueOnPartialFailure',
                label: 'Continue on Partial Failure',
                description: 'Continue if some inputs fail',
                type: 'select' as const,
                defaultValue: 'false',
                options: ['false', 'true']
            }
        ],
        outputs: [
            {
                id: 'merged',
                label: 'Merged Data',
                type: 'json'
            }
        ]
    };

    async execute({ input, context, node }: NodeExecutionArgs): Promise<NodeExecutionResult> {
        const mode = node.data?.mode || input.mode || 'append';
        const mergeKey = node.data?.mergeKey || input.mergeKey;
        const continueOnPartialFailure =
            node.data?.continueOnPartialFailure === true ||
            node.data?.continueOnPartialFailure === 'true' ||
            input.continueOnPartialFailure === true;

        // Get workflow topology to find incoming edges
        const workflow = (context as any).workflow;
        if (!workflow || !workflow.edges) {
            return {
                status: 'failed',
                output: {
                    error: 'MergeNode requires workflow topology in execution context'
                }
            };
        }

        // Find all incoming edges to this node
        const incomingEdges = workflow.edges.filter((e: any) => e.target === node.id);

        if (incomingEdges.length === 0) {
            return {
                status: 'failed',
                output: { error: 'MergeNode has no incoming connections' }
            };
        }

        // Check if all source nodes have completed
        const sourceNodes = incomingEdges.map((e: any) => e.source);
        const completedSources: string[] = [];
        const pendingSources: string[] = [];
        const failedSources: string[] = [];

        for (const sourceId of sourceNodes) {
            const sourceResult = context.results?.[sourceId];

            if (!sourceResult) {
                pendingSources.push(sourceId);
            } else if (sourceResult.status === 'failed') {
                failedSources.push(sourceId);
            } else if (sourceResult.status === 'success') {
                completedSources.push(sourceId);
            } else {
                pendingSources.push(sourceId);
            }
        }

        // If there are pending sources, suspend execution
        if (pendingSources.length > 0) {
            return {
                status: 'suspended',
                output: {
                    reason: 'waiting_for_inputs',
                    total: sourceNodes.length,
                    completed: completedSources.length,
                    pending: pendingSources.length,
                    failed: failedSources.length,
                    pendingNodes: pendingSources,
                    completedNodes: completedSources,
                    failedNodes: failedSources
                }
            };
        }

        // Handle failed sources
        if (failedSources.length > 0 && !continueOnPartialFailure) {
            return {
                status: 'failed',
                output: {
                    error: `${failedSources.length} upstream node(s) failed`,
                    failedNodes: failedSources
                }
            };
        }

        // All inputs ready - merge them
        const outputs = completedSources.map(sourceId => {
            const result = context.results[sourceId];
            return {
                nodeId: sourceId,
                data: result.output
            };
        });

        let merged: any;

        switch (mode) {
            case 'append':
                merged = this.mergeAppend(outputs);
                break;
            case 'combine-by-position':
                merged = this.mergeCombineByPosition(outputs);
                break;
            case 'combine-by-fields':
                merged = this.mergeCombineByFields(outputs, mergeKey);
                break;
            default:
                merged = this.mergeAppend(outputs);
        }

        return {
            status: 'success',
            output: {
                merged,
                sources: completedSources,
                mode,
                skipped: failedSources.length > 0 ? failedSources : undefined
            }
        };
    }

    /**
     * Append mode: Concatenate all outputs into a single array
     */
    private mergeAppend(outputs: Array<{ nodeId: string; data: any }>): any[] {
        const result: any[] = [];

        for (const { data } of outputs) {
            if (Array.isArray(data)) {
                result.push(...data);
            } else {
                result.push(data);
            }
        }

        return result;
    }

    /**
     * Combine by position: Zip outputs together by index
     */
    private mergeCombineByPosition(outputs: Array<{ nodeId: string; data: any }>): any[] {
        const arrays = outputs.map(({ data }) =>
            Array.isArray(data) ? data : [data]
        );

        const maxLength = Math.max(...arrays.map(arr => arr.length));
        const result: any[] = [];

        for (let i = 0; i < maxLength; i++) {
            const combined: any = {};

            outputs.forEach(({ nodeId }, idx) => {
                const value = arrays[idx][i];
                if (value !== undefined) {
                    if (typeof value === 'object' && !Array.isArray(value)) {
                        Object.assign(combined, value);
                    } else {
                        combined[nodeId] = value;
                    }
                }
            });

            result.push(combined);
        }

        return result;
    }

    /**
     * Combine by fields: SQL-like join on matching field values
     */
    private mergeCombineByFields(
        outputs: Array<{ nodeId: string; data: any }>,
        mergeKey?: string
    ): any[] {
        if (!mergeKey) {
            // If no merge key, fall back to append
            return this.mergeAppend(outputs);
        }

        const arrays = outputs.map(({ data }) =>
            Array.isArray(data) ? data : [data]
        );

        // Build index from first array
        const [firstArray, ...restArrays] = arrays;
        const indexMap = new Map<any, any>();

        for (const item of firstArray) {
            const keyValue = item?.[mergeKey];
            if (keyValue !== undefined) {
                indexMap.set(keyValue, { ...item });
            }
        }

        // Merge remaining arrays
        for (const array of restArrays) {
            for (const item of array) {
                const keyValue = item?.[mergeKey];
                if (keyValue !== undefined && indexMap.has(keyValue)) {
                    Object.assign(indexMap.get(keyValue), item);
                }
            }
        }

        return Array.from(indexMap.values());
    }
}
