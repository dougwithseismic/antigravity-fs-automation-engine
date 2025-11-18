import { z } from 'zod';

export const ConditionNodeSchema = z.object({
    condition: z.object({
        key: z.string().min(1, "Condition key is required"),
        value: z.string().min(1, "Condition value is required"),
        operator: z.enum(['equals', 'contains']).optional().default('equals')
    })
});

export const AnalyticsNodeSchema = z.object({
    eventName: z.string().min(1, "Event name is required")
});

export const DiscountNodeSchema = z.object({
    // Discount node might not need data if it just generates a code, 
    // but let's say it could take a 'type' or 'amount'
    type: z.string().optional(),
    amount: z.number().optional()
});

export const NodeDataSchemas: Record<string, z.ZodSchema> = {
    'condition': ConditionNodeSchema,
    'analytics': AnalyticsNodeSchema,
    'discount': DiscountNodeSchema,
    // Add others as needed
};
