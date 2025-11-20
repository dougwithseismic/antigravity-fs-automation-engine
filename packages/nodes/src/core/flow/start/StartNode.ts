import { NodeExecutionArgs, NodeExecutionResult } from '@repo/types';
import { AntigravityNode } from '../../../types';

/**
 * StartNode - Entry point for workflows
 * Simply passes through input data to the next node
 */
export class StartNode implements AntigravityNode {
    name = 'start';
    displayName = 'Start';
    description = 'Entry point for workflow execution';
    version = 1;
    defaults = {};

    async execute({ input, node }: NodeExecutionArgs): Promise<NodeExecutionResult> {
        // Start node returns clean started flag
        return {
            status: 'success',
            output: {
                started: true,
                ...(input && typeof input === 'object' ? input : {})
            }
        };
    }
}
