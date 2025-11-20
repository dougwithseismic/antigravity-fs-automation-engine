import ivm from 'isolated-vm';

export class SandboxService {
    private static instance: SandboxService;

    private constructor() { }

    public static getInstance(): SandboxService {
        if (!SandboxService.instance) {
            SandboxService.instance = new SandboxService();
        }
        return SandboxService.instance;
    }

    /**
     * Executes code in a secure isolated environment
     */
    async execute(code: string, context: Record<string, any> = {}, timeoutMs = 5000): Promise<any> {
        const isolate = new ivm.Isolate({ memoryLimit: 128 });
        const contextHandle = await isolate.createContext();
        const jail = contextHandle.global;

        try {
            // 1. Setup global context
            await jail.set('global', jail.derefInto());

            // 2. Inject user context
            for (const [key, value] of Object.entries(context)) {
                if (typeof value === 'function') {
                    continue;
                }
                if (typeof value === 'object') {
                    const json = JSON.stringify(value);
                    await contextHandle.eval(`global.${key} = ${json}`);
                } else {
                    await jail.set(key, value);
                }
            }

            // 3. Wrap code with error handling inside the isolate
            const wrappedCode = `
                (async () => {
                    try {
                        global._result = await (async () => {
                            ${code}
                        })();
                        global._error = null;
                    } catch (e) {
                        global._result = null;
                        global._error = e.message || String(e);
                    }
                })()
            `;

            // 4. Compile and execute
            console.log('Compiling script...');
            const script = await isolate.compileScript(wrappedCode);
            console.log('Running script...');
            await script.run(contextHandle, { timeout: timeoutMs, promise: true });
            console.log('Script finished');

            // 5. Check for error
            const errorRef = await jail.get('_error');
            if (errorRef) {
                const error = await errorRef.copy();
                if (error) {
                    throw new Error(error);
                }
            }

            // 6. Retrieve result
            const resultRef = await jail.get('_result');
            if (!resultRef) return undefined;

            // If result is a reference (object), copy it out
            if (typeof resultRef === 'object' && resultRef !== null && resultRef.copy) {
                return await resultRef.copy();
            }

            // Primitive result
            return resultRef;

        } catch (error: any) {
            console.error('Sandbox internal error:', error);
            throw new Error(`Sandbox execution failed: ${error.message}`);
        } finally {
            // Cleanup
            contextHandle.release();
            isolate.dispose();
        }
    }
}

export const sandbox = SandboxService.getInstance();
