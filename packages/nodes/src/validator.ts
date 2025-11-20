import { z } from 'zod';
import { AntigravityNode, NodeInputDefinition } from './types';

export function createNodeInputSchema(node: AntigravityNode): z.ZodObject<any> {
    const shape: Record<string, z.ZodTypeAny> = {};

    if (!node.ui?.inputs) {
        return z.object({});
    }

    for (const input of node.ui.inputs) {
        let schema: z.ZodTypeAny = z.any();

        // Base type validation
        if (input.type === 'text' || input.type === 'textarea' || input.type === 'password' || input.type === 'select') {
            schema = z.string();
        }

        // Required validation
        if (input.required) {
            schema = schema.refine(
                (val) => val !== undefined && val !== null && val !== '',
                { message: `${input.label} is required` }
            );
        } else {
            schema = schema.optional().or(z.literal(''));
        }

        shape[input.id] = schema;
    }

    return z.object(shape);
}

export function validateNodeInputs(node: AntigravityNode, inputs: Record<string, any>) {
    const schema = createNodeInputSchema(node);
    return schema.safeParse(inputs);
}
