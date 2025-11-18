import { NodeExecutor, NodeExecutionResult, NodeExecutionArgs } from "../types";

export class HumanApprovalNodeExecutor implements NodeExecutor {
    async execute({ node, input, context, signal }: NodeExecutionArgs): Promise<NodeExecutionResult> {
        return {
            status: 'suspended',
        };
    }
}
