import { NodeExecutionArgs, NodeExecutionResult } from '@repo/types';
import { AntigravityNode } from '../../../types';
import { FilterNodeInputSchema } from './types';

export class FilterNode implements AntigravityNode {
    name = 'filter';
    displayName = 'Filter';
    description = 'Filters input data based on a condition';
    version = 1;
    defaults = {
        operator: 'equals'
    };
    inputs = ['field', 'operator', 'value', 'data'];
    outputs = ['match', 'field', 'operator', 'fieldValue', 'expectedValue'];

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
            id: 'field',
            type: 'target' as const,
            dataType: 'string' as const,
            label: 'Field'
        },
        {
            id: 'operator',
            type: 'target' as const,
            dataType: 'string' as const,
            label: 'Operator'
        },
        {
            id: 'value',
            type: 'target' as const,
            dataType: 'string' as const,
            label: 'Value'
        },
        {
            id: 'data',
            type: 'target' as const,
            dataType: 'json' as const,
            label: 'Data Source'
        },
        // Data Outputs
        {
            id: 'match',
            type: 'source' as const,
            dataType: 'boolean' as const,
            label: 'Match'
        },
        {
            id: 'field',
            type: 'source' as const,
            dataType: 'string' as const,
            label: 'Field'
        },
        {
            id: 'operator',
            type: 'source' as const,
            dataType: 'string' as const,
            label: 'Operator'
        },
        {
            id: 'fieldValue',
            type: 'source' as const,
            dataType: 'string' as const,
            label: 'Field Value'
        },
        {
            id: 'expectedValue',
            type: 'source' as const,
            dataType: 'string' as const,
            label: 'Expected Value'
        }
    ];

    ui = {
        icon: 'filter',
        inputs: [
            {
                id: 'field',
                label: 'Field',
                description: 'Field or path to evaluate (e.g., "user.id")',
                type: 'text' as const,
                placeholder: 'user.id',
                required: true
            },
            {
                id: 'operator',
                label: 'Operator',
                type: 'select' as const,
                defaultValue: 'equals',
                options: ['equals', 'contains', 'exists']
            },
            {
                id: 'value',
                label: 'Value',
                description: 'Value to compare against (ignore for "exists")',
                type: 'text' as const,
                placeholder: '12345'
            },
            {
                id: 'data',
                label: 'Data Source',
                description: 'Optional object to evaluate instead of the raw input',
                type: 'textarea' as const,
                placeholder: '{ "user": { "id": "123" } }',
                connection: {
                    enabled: true,
                    type: 'json'
                }
            }
        ],
        outputs: [
            {
                id: 'match',
                label: 'Match',
                type: 'boolean'
            },
            {
                id: 'fieldValue',
                label: 'Field Value',
                type: 'string'
            }
        ]
    };

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
