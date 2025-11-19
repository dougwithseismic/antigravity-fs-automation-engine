import { z } from 'zod';

export const FilterNodeInputSchema = z.object({
    field: z.string().min(1).describe('The field to check in the input data'),
    operator: z.enum(['equals', 'contains', 'exists']).default('equals').describe('The comparison operator'),
    value: z.any().optional().describe('The value to compare against'),
    data: z.record(z.string(), z.any()).optional().describe('The data object to check (defaults to input)'),
});

export type FilterNodeInput = z.infer<typeof FilterNodeInputSchema>;

export const FilterNodeOutputSchema = z.object({
    match: z.boolean(),
    data: z.record(z.string(), z.any()).nullable(),
});

export type FilterNodeOutput = z.infer<typeof FilterNodeOutputSchema>;
