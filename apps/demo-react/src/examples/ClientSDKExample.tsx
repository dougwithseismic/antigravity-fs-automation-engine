/**
 * Example: How to properly use the Client SDK
 *
 * This demonstrates the correct way to integrate the client SDK
 * with client-side nodes (banner-form, window-alert, etc.)
 */

import { useEffect } from 'react';
import { AntigravityProvider, useWorkflow, useAntigravity } from '@antigravity/client-sdk/react';

// Example 1: Simple workflow execution with client SDK
function WorkflowWithSDK({ workflowId }: { workflowId: string }) {
    const { registerReactNode } = useAntigravity();
    const { start, status, currentStep, submit, data, error, isLoading } = useWorkflow(workflowId);

    // Register client nodes once when component mounts
    useEffect(() => {
        registerReactNode('banner-form');
        registerReactNode('window-alert');
        registerReactNode('start');
    }, [registerReactNode]);

    return (
        <div className="workflow-sdk-example">
            <h2>Client SDK Workflow Example</h2>

            {/* Start Button */}
            <button
                onClick={() => start({ user: { vip: true, name: 'John Doe' } })}
                disabled={isLoading}
            >
                {isLoading ? 'Running...' : 'Start Workflow'}
            </button>

            {/* Status Display */}
            <div className="status-badge">{status}</div>

            {/* Client Node Rendering */}
            {status === 'waiting' && currentStep && (
                <div className="client-node-active">
                    <h3>Client Node: {currentStep.type}</h3>

                    {currentStep.type === 'banner-form' && (
                        <BannerFormUI
                            message={currentStep.input?._clientMessage}
                            onSubmit={(formData) => submit(formData)}
                        />
                    )}

                    {currentStep.type === 'window-alert' && (
                        <AlertUI
                            message={currentStep.input?._clientMessage}
                            onAcknowledge={() => submit({ acknowledged: true })}
                        />
                    )}
                </div>
            )}

            {/* Completed State */}
            {status === 'completed' && (
                <div className="workflow-result">
                    <h3>✅ Workflow Completed</h3>
                    <pre>{JSON.stringify(data, null, 2)}</pre>
                </div>
            )}

            {/* Error State */}
            {status === 'failed' && error && (
                <div className="workflow-error">
                    <h3>❌ Workflow Failed</h3>
                    <p>{error}</p>
                </div>
            )}
        </div>
    );
}

// Example 2: Simple UI components for client nodes
function BannerFormUI({ message, onSubmit }: { message: string; onSubmit: (data: any) => void }) {
    return (
        <div className="banner-form">
            <h4>{message}</h4>
            <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                onSubmit(Object.fromEntries(formData));
            }}>
                <input name="email" type="email" placeholder="Email" required />
                <input name="name" type="text" placeholder="Name" />
                <button type="submit">Submit</button>
            </form>
        </div>
    );
}

function AlertUI({ message, onAcknowledge }: { message: string; onAcknowledge: () => void }) {
    return (
        <div className="alert-ui">
            <p>{message}</p>
            <button onClick={onAcknowledge}>OK</button>
        </div>
    );
}

// Example 3: App wrapper with provider
export function ClientSDKApp() {
    return (
        <AntigravityProvider apiUrl="http://localhost:3002">
            <WorkflowWithSDK workflowId="1" />
        </AntigravityProvider>
    );
}

/**
 * Key Points:
 *
 * 1. ✅ Wrap app with AntigravityProvider
 * 2. ✅ Register client nodes using registerReactNode()
 * 3. ✅ Use useWorkflow() hook for each workflow execution
 * 4. ✅ Render client nodes when status === 'waiting'
 * 5. ✅ Call submit() with user data to resume workflow
 * 6. ✅ Let SDK handle all suspend/resume logic
 *
 * What the SDK handles automatically:
 * - Polling for workflow status
 * - Detecting when client nodes suspend execution
 * - Managing execution state
 * - Resuming workflows with user input
 * - Error handling and retries
 *
 * What you need to do:
 * - Register node types at component mount
 * - Render UI for active client nodes
 * - Call submit() with user input
 */
