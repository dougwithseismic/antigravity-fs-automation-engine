import { NodeExecutionArgs, NodeExecutionResult } from '@repo/types';
import { AntigravityNode } from '../../../types';

/**
 * ConditionNode - Evaluates a condition and routes workflow accordingly
 * Used for conditional branching based on input data
 */
export class ConditionNode implements AntigravityNode {
    name = 'condition';
    displayName = 'Condition';
    description = 'Evaluates a condition and routes workflow based on result';
    version = 1;
    category = 'Logic' as const;
    tags = ['condition', 'routing', 'branching'];
    defaults = {};

    ui = {
        icon: 'condition',
        inputs: [
            {
                id: 'key',
                label: 'Key Path',
                description: 'Nested path to the value (e.g., query.utm_source)',
                type: 'text' as const,
                placeholder: 'query.utm_source',
                required: true
            },
            {
                id: 'operator',
                label: 'Operator',
                type: 'select' as const,
                defaultValue: '==',
                options: ['==', '===', '!=', '>', '<', '>=', '<=', 'contains'],
                required: true
            },
            {
                id: 'value',
                label: 'Value',
                description: 'Value to compare against',
                type: 'text' as const,
                placeholder: 'ppc',
                required: true
            }
        ],
        outputs: [
            {
                id: 'result',
                label: 'Result',
                type: 'boolean'
            }
        ]
    };

    async execute({ input, node }: NodeExecutionArgs): Promise<NodeExecutionResult> {
        const condition = node.data?.condition;

        if (!condition) {
            return {
                status: 'failed',
                output: { error: 'No condition specified' }
            };
        }

        const { key, value, operator = '==' } = condition;

        // Get the value from input using nested key path (e.g., "query.utm_source")
        const inputValue = this.getNestedValue(input, key);

        // Evaluate condition
        let result = false;
        switch (operator) {
            case '==':
            case 'equals':
                result = inputValue == value;
                break;
            case '===':
            case 'strictEquals':
                result = inputValue === value;
                break;
            case '!=':
            case 'notEquals':
                result = inputValue != value;
                break;
            case '>':
            case 'greaterThan':
                result = inputValue > value;
                break;
            case '<':
            case 'lessThan':
                result = inputValue < value;
                break;
            case '>=':
            case 'greaterThanOrEqual':
                result = inputValue >= value;
                break;
            case '<=':
            case 'lessThanOrEqual':
                result = inputValue <= value;
                break;
            case 'contains':
                result = String(inputValue).includes(String(value));
                break;
            default:
                result = inputValue == value;
        }

        return {
            status: 'success',
            output: {
                result,
                key,
                inputValue,
                operator
            }
        };
    }

    private getNestedValue(obj: any, path: string): any {
        return path.split('.').reduce((current, key) => current?.[key], obj);
    }
}
