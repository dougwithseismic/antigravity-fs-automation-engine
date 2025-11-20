import { z } from 'zod';

export const ExtractQueryParamsInputSchema = z.object({
    url: z.string().url().describe('The URL to extract query parameters from'),
});

export type ExtractQueryParamsInput = z.infer<typeof ExtractQueryParamsInputSchema>;

export const ExtractQueryParamsOutputSchema = z.object({
    params: z.record(z.string(), z.string()).describe('Key-value pairs of query parameters'),
    paramCount: z.number().describe('Total params extracted'),
}).describe('Parsed query parameters');

export type ExtractQueryParamsOutput = z.infer<typeof ExtractQueryParamsOutputSchema>;
