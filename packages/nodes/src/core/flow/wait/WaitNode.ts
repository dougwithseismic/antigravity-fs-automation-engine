import { NodeExecutionArgs, NodeExecutionResult } from '@repo/types';
import { AntigravityNode } from '../../../types';

export class WaitNode implements AntigravityNode {
    name = 'wait';
    displayName = 'Wait';
    description = 'Description for wait';
    version = 1;
    defaults = {};

    async execute({ input, node }: NodeExecutionArgs): Promise<NodeExecutionResult> {
        const amount = input.amount || node.data?.amount || 1;
        const unit = input.unit || node.data?.unit || 'seconds';

        // In a real implementation, we would calculate the resume time
        // and pass it to the engine via a specific return type or side effect.
        // For now, we just return 'suspended' to simulate a wait.

        return {
            status: 'suspended',
            output: {
                resumeAfter: { amount, unit }
            }
        };
    }
}
