import { NodeExecutionArgs, NodeExecutionResult } from '@repo/types';
import { AntigravityNode } from '../../../types';

export class CodeNode implements AntigravityNode {
    name = 'code';
    displayName = 'Code';
    description = 'Description for code';
    version = 1;
    retry = {
        attempts: 1, // Code errors are likely permanent - don't retry
        backoff: {
            type: 'fixed' as const,
            delay: 0,
        },
    };
    defaults = {};

    async execute({ input, node }: NodeExecutionArgs): Promise<NodeExecutionResult> {
        const code = input.code || node.data?.code;
        const mode = input.mode || node.data?.mode || 'runOnce';

        if (!code) {
            return {
                status: 'failed',
                error: 'No code provided'
            };
        }

        try {
            // Basic sandboxing using Node.js vm module
            // In a production environment, use vm2 or isolated-vm for better security
            const vm = require('vm');
            const sandbox = {
                input,
                console: {
                    log: (...args: any[]) => console.log('[CodeNode]', ...args),
                    error: (...args: any[]) => console.error('[CodeNode]', ...args),
                },
                // Add other safe globals here
            };

            const context = vm.createContext(sandbox);
            // Wrap code in an async function to allow return statements and await
            const wrappedCode = `(async () => {
                ${code}
            })()`;
            const script = new vm.Script(wrappedCode);

            // Execute the code
            const result = await script.runInContext(context);

            return {
                status: 'success',
                output: result
            };
        } catch (error: any) {
            return {
                status: 'failed',
                error: error.message
            };
        }
    }
}
