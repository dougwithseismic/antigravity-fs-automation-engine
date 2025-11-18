import { NodeExecutor, NodeExecutionArgs } from '../types';

export class ConditionNodeExecutor implements NodeExecutor {
    async execute({ node, input, context, signal }: NodeExecutionArgs) {
        const { condition } = node.data;
        // Simple evaluation: check if inputData[key] === value
        // In a real system, use a proper expression parser

        // For this demo, we expect input to contain 'query' from the trigger
        const query = input?.query || {};
        const match = query[condition.key] === condition.value;

        console.log(`[ConditionNode] Checking ${condition.key}=${condition.value} against`, query, `Match: ${match}`);

        return {
            status: 'success' as const,
            output: { result: match }
        };
    }
}

export class AnalyticsNodeExecutor implements NodeExecutor {
    async execute({ node, input, context, signal }: NodeExecutionArgs) {
        const { eventName } = node.data;
        console.log(`[AnalyticsNode] 📊 Logging Event: ${eventName}`, input);

        // Simulate DB write
        await new Promise(resolve => setTimeout(resolve, 500));

        return {
            status: 'success' as const,
            output: { logged: true, timestamp: new Date().toISOString() }
        };
    }
}

export class DiscountNodeExecutor implements NodeExecutor {
    async execute({ node, input, context, signal }: NodeExecutionArgs) {
        const code = 'SAVE10'; // In reality, generate or fetch from DB
        console.log(`[DiscountNode] 🎟️ Generated Code: ${code}`);

        return {
            status: 'success' as const,
            output: { code }
        };
    }
}
