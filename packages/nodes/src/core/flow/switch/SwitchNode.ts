import { NodeExecutionArgs, NodeExecutionResult } from '@repo/types';
import { AntigravityNode } from '../../../types';

export class SwitchNode implements AntigravityNode {
    name = 'switch';
    displayName = 'Switch';
    description = 'Description for switch';
    version = 1;
    defaults = {};

    async execute({ input, node }: NodeExecutionArgs): Promise<NodeExecutionResult> {
        const rules = input.rules || node.data?.rules || [];
        const fallback = input.fallback || node.data?.fallback || false;

        // Rules structure: [{ condition: '==', value: 'foo', variable: 'bar' }]
        // For simplicity in this iteration, we'll assume rules return an index

        for (let i = 0; i < rules.length; i++) {
            const rule = rules[i];
            // Basic evaluation logic (expand as needed)
            // This is a placeholder for actual rule evaluation engine
            if (rule.condition === 'true') {
                return {
                    status: 'success',
                    output: {
                        routeIndex: i,
                        matchedRule: rule
                    }
                };
            }
        }

        if (fallback) {
            return {
                status: 'success',
                output: {
                    routeIndex: -1,
                    fallback: true
                }
            };
        }

        return {
            status: 'success',
            output: {
                routeIndex: null,
                noMatch: true
            }
        };
    }
}
