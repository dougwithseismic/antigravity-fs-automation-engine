import { NodeExecutionArgs, NodeExecutionResult } from '@repo/types';
import { AntigravityNode } from '../../../types';

export class CodeNode implements AntigravityNode {
    name = 'code';
    displayName = 'Code';
    description = 'Description for code';
    version = 1;
    inputs = ['code', 'mode'];
    outputs = ['result'];

    handles = [
        // Control Flow
        {
            id: 'flow-in',
            type: 'target' as const,
            dataType: 'flow' as const,
            label: 'In'
        },
        {
            id: 'flow-out',
            type: 'source' as const,
            dataType: 'flow' as const,
            label: 'Out'
        },
        // Data Inputs
        {
            id: 'code',
            type: 'target' as const,
            dataType: 'string' as const,
            label: 'JavaScript Code'
        },
        {
            id: 'mode',
            type: 'target' as const,
            dataType: 'string' as const,
            label: 'Execution Mode'
        },
        // Data Outputs
        {
            id: 'result',
            type: 'source' as const,
            dataType: 'json' as const,
            label: 'Result'
        }
    ];

    retry = {
        attempts: 1, // Code errors are likely permanent - don't retry
        backoff: {
            type: 'fixed' as const,
            delay: 0,
        },
    };
    defaults = {};
    ui = {
        icon: 'code',
        inputs: [
            {
                id: 'code',
                label: 'JavaScript',
                type: 'textarea' as const,
                placeholder: '// return something from here',
                required: true,
                connection: {
                    enabled: true,
                    type: 'string'
                }
            },
            {
                id: 'mode',
                label: 'Execution Mode',
                type: 'select' as const,
                defaultValue: 'runOnce',
                options: ['runOnce']
            }
        ],
        outputs: [
            {
                id: 'result',
                label: 'Result',
                type: 'json'
            }
        ]
    };

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
