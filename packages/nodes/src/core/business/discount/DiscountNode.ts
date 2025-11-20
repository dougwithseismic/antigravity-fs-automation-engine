import { NodeExecutionArgs, NodeExecutionResult } from '@repo/types';
import { AntigravityNode } from '../../../types';

/**
 * DiscountNode - Generates discount codes
 * Creates unique discount codes for promotional campaigns
 */
export class DiscountNode implements AntigravityNode {
    name = 'discount';
    displayName = 'Discount Code Generator';
    description = 'Generates unique discount codes';
    version = 1;
    inputs = ['percentage', 'prefix'];
    outputs = ['code', 'percentage', 'expiresAt'];
    category = 'Business' as const;
    tags = ['promotion', 'discount', 'coupon'];
    defaults = {
        percentage: 10,
        prefix: 'WELCOME'
    };

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
            id: 'percentage',
            type: 'target' as const,
            dataType: 'number' as const,
            label: 'Discount %'
        },
        {
            id: 'prefix',
            type: 'target' as const,
            dataType: 'string' as const,
            label: 'Code Prefix'
        },
        // Data Outputs
        {
            id: 'code',
            type: 'source' as const,
            dataType: 'string' as const,
            label: 'Discount Code'
        },
        {
            id: 'percentage',
            type: 'source' as const,
            dataType: 'number' as const,
            label: 'Percentage'
        },
        {
            id: 'expiresAt',
            type: 'source' as const,
            dataType: 'string' as const,
            label: 'Expires At'
        }
    ];

    ui = {
        icon: 'discount',
        inputs: [
            {
                id: 'percentage',
                label: 'Discount %',
                description: 'Percentage discount amount',
                type: 'text' as const,
                defaultValue: '10',
                placeholder: '10'
            },
            {
                id: 'prefix',
                label: 'Code Prefix',
                description: 'Prefix for the discount code',
                type: 'text' as const,
                defaultValue: 'WELCOME',
                placeholder: 'WELCOME'
            }
        ],
        outputs: [
            {
                id: 'code',
                label: 'Discount Code',
                type: 'string'
            },
            {
                id: 'percentage',
                label: 'Percentage',
                type: 'number'
            },
            {
                id: 'expiresAt',
                label: 'Expires At',
                type: 'string'
            }
        ]
    };

    async execute({ input, node }: NodeExecutionArgs): Promise<NodeExecutionResult> {
        const percentage = node.data?.percentage || this.defaults.percentage;
        const prefix = node.data?.prefix || this.defaults.prefix;

        // Generate a unique code (simplified version)
        const uniqueId = Math.random().toString(36).substring(2, 8).toUpperCase();
        const code = `${prefix}${percentage}-${uniqueId}`;

        // In production, save to database and validate uniqueness
        console.log(`[Discount] Generated code: ${code} for ${percentage}% off`);

        return {
            status: 'success',
            output: {
                code,
                percentage,
                expiresAt: this.getExpiryDate(30) // 30 days from now
            }
        };
    }

    private getExpiryDate(daysFromNow: number): string {
        const date = new Date();
        date.setDate(date.getDate() + daysFromNow);
        return date.toISOString();
    }
}
