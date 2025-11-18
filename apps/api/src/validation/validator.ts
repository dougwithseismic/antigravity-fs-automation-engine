import { WorkflowNode } from '../execution/types';
import { NodeDataSchemas } from './schemas';

export interface ValidationError {
    nodeId: string;
    message: string;
}

export function validateWorkflow(nodes: WorkflowNode[]): ValidationError[] {
    const errors: ValidationError[] = [];

    for (const node of nodes) {
        const schema = NodeDataSchemas[node.type];
        if (schema) {
            const result = schema.safeParse(node.data);
            if (!result.success) {
                if (result.error) {
                    // Zod 4 uses 'issues' instead of 'errors'
                    const issues = result.error.issues || result.error.errors;
                    if (Array.isArray(issues)) {
                        issues.forEach((err: any) => {
                            errors.push({
                                nodeId: node.id,
                                message: `[${node.type}] ${err.path.join('.')}: ${err.message}`
                            });
                        });
                    }
                }
            }
        }
    }

    return errors;
}
