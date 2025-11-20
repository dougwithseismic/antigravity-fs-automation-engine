import { NodeExecutionArgs, NodeExecutionResult } from '@repo/types';
import { AntigravityNode } from '../../../types';
import { FilterNodeInputSchema } from './types';

export class FilterNode implements AntigravityNode {
    name = 'filter';
    displayName = 'Filter';
    description = 'Filters input data based on a condition';
    version = 1;
    defaults = {};

    async execute({ input, node }: NodeExecutionArgs): Promise<NodeExecutionResult> {
        // Merge input and node data
        const rawInput = { ...node.data, ...input };

        // Validate input
        const validation = FilterNodeInputSchema.safeParse(rawInput);

        if (!validation.success) {
            return {
                status: 'failed',
                error: `Invalid input: ${validation.error.message}`
            };
        }

        const { field, operator, value, data: inputData } = validation.data;
        const data = inputData || rawInput; // Fallback to raw input if data not provided

        const fieldValue = data[field];
        let match = false;

        switch (operator) {
            case 'equals':
                match = fieldValue === value;
                break;
            case 'contains':
                match = String(fieldValue).includes(String(value));
                break;
            case 'exists':
                match = fieldValue !== undefined && fieldValue !== null;
                break;
            default:
                return {
                    status: 'failed',
                    error: `Unknown operator: ${operator}`
                };
        }

        return {
            status: 'success',
            output: {
                match,
                field,
                operator,
                fieldValue,
                expectedValue: value
            }
        };
    }
}
