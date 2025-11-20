import { NodeExecutionArgs, NodeExecutionResult } from '@repo/types';
import { AntigravityNode } from '../../../types';

export class SwitchNode implements AntigravityNode {
    name = 'switch';
    displayName = 'Switch';
    description = 'Description for switch';
    version = 1;
    defaults = {};
    inputs = ['switchKey', 'value', 'options', 'randomize', 'rules'];
    outputs = ['route', 'routeIndex', 'matchedRule', 'value'];

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
            id: 'switchKey',
            type: 'target' as const,
            dataType: 'string' as const,
            label: 'Route Key'
        },
        {
            id: 'value',
            type: 'target' as const,
            dataType: 'string' as const,
            label: 'Runtime Value'
        },
        {
            id: 'options',
            type: 'target' as const,
            dataType: 'json' as const,
            label: 'Options'
        },
        {
            id: 'randomize',
            type: 'target' as const,
            dataType: 'boolean' as const,
            label: 'Randomize'
        },
        {
            id: 'rules',
            type: 'target' as const,
            dataType: 'json' as const,
            label: 'Rules'
        },
        // Data Outputs
        {
            id: 'route',
            type: 'source' as const,
            dataType: 'string' as const,
            label: 'Route'
        },
        {
            id: 'routeIndex',
            type: 'source' as const,
            dataType: 'number' as const,
            label: 'Route Index'
        },
        {
            id: 'matchedRule',
            type: 'source' as const,
            dataType: 'json' as const,
            label: 'Matched Rule'
        },
        {
            id: 'value',
            type: 'source' as const,
            dataType: 'string' as const,
            label: 'Input Value'
        }
    ];

    ui = {
        icon: 'switch',
        inputs: [
            {
                id: 'switchKey',
                label: 'Route Key',
                description: 'Key path on the input to branch on (e.g., "source" or "query.utm_source")',
                type: 'text' as const,
                placeholder: 'source',
                required: true
            },
            {
                id: 'value',
                label: 'Runtime Value',
                description: 'Optional explicit value to route on (otherwise uses switch key)',
                type: 'text' as const,
                placeholder: 'ppc',
                connection: {
                    enabled: true,
                    type: 'string'
                }
            },
            {
                id: 'options',
                label: 'Options',
                description: 'Available branches (JSON array)',
                type: 'textarea' as const,
                placeholder: '["A", "B"]'
            },
            {
                id: 'randomize',
                label: 'Randomize',
                type: 'select' as const,
                defaultValue: 'false',
                options: ['false', 'true']
            }
        ],
        outputs: [
            {
                id: 'route',
                label: 'Route',
                type: 'string'
            },
            {
                id: 'routeIndex',
                label: 'Route Index',
                type: 'number'
            },
            {
                id: 'matchedRule',
                label: 'Matched Rule',
                type: 'json'
            },
            {
                id: 'value',
                label: 'Input Value',
                type: 'string'
            }
        ]
    };

    async execute({ input, node }: NodeExecutionArgs): Promise<NodeExecutionResult> {
        const rules = input.rules || node.data?.rules || [];
        const fallback = input.fallback || node.data?.fallback || false;
        const randomize = input.randomize ?? node.data?.randomize;
        const options = this.normalizeOptions(input.options ?? node.data?.options);
        const value = input.value ?? this.getNestedValue({ ...node.data, ...input }, input.switchKey || node.data?.switchKey);

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
                        route: rule.value ?? rule.route ?? i,
                        matchedRule: rule,
                        value
                    }
                };
            }
        }

        if (fallback) {
            return {
                status: 'success',
                output: {
                    routeIndex: -1,
                    route: null,
                    fallback: true,
                    value
                }
            };
        }

        // A/B split style randomization
        const shouldRandomize = randomize === true || randomize === 'true';
        if (shouldRandomize && options.length > 0) {
            const routeIndex = Math.floor(Math.random() * options.length);
            return {
                status: 'success',
                output: {
                    routeIndex,
                    route: options[routeIndex],
                    matchedRule: null,
                    value,
                    randomize: true
                }
            };
        }

        // Deterministic routing based on value + options
        const routeIndex = options.length > 0 ? Math.max(options.indexOf(value), 0) : 0;
        const route = options.length > 0 ? options[routeIndex] : value ?? 'default';

        return {
            status: 'success',
            output: {
                routeIndex,
                route,
                matchedRule: null,
                value,
                options
            }
        };
    }

    private normalizeOptions(options: any): string[] {
        if (!options) return [];
        if (Array.isArray(options)) return options;
        if (typeof options === 'string') {
            try {
                const parsed = JSON.parse(options);
                return Array.isArray(parsed) ? parsed : [];
            } catch {
                return options.split(',').map(opt => opt.trim()).filter(Boolean);
            }
        }
        return [];
    }

    private getNestedValue(obj: any, path?: string): any {
        if (!path) return undefined;
        return path.split('.').reduce((current, key) => current?.[key], obj);
    }
}
