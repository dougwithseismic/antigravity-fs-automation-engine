import { z } from 'zod';

const ConditionNodeSchema = z.object({
    condition: z.object({
        key: z.string().min(1, "Condition key is required"),
        value: z.string().min(1, "Condition value is required"),
        operator: z.enum(['equals', 'contains']).optional().default('equals')
    })
});

const invalidData = {
    condition: { value: 'bar' }
};

console.log('Testing Zod Validation...');
const result = ConditionNodeSchema.safeParse(invalidData);
console.log('Success:', result.success);
if (!result.success) {
    console.log('Error keys:', Object.keys(result.error));
    // @ts-ignore
    console.log('Errors array:', result.error.errors);
    // @ts-ignore
    console.log('Issues array:', result.error.issues);
} else {
    console.log('Data:', result.data);
}
