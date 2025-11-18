import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { ClientEngine, ClientNode } from './index';

// --- React Node Bridge ---

type NodeResolver = (data: any) => void;

export class ReactNode implements ClientNode {
    id: string;
    type: string;
    data: Record<string, any>;
    private onExecute: (input: any, resolve: NodeResolver) => void;

    constructor(id: string, type: string, data: Record<string, any> = {}, onExecute: (input: any, resolve: NodeResolver) => void) {
        this.id = id;
        this.type = type;
        this.data = data;
        this.onExecute = onExecute;
    }

    execute({ input }: { input: any }): Promise<any> {
        return new Promise((resolve) => {
            this.onExecute(input, resolve);
        });
    }
}

// --- Context & Provider ---

interface AntigravityContextType {
    engine: ClientEngine;
    activeNode: { nodeId: string; type: string; input: any } | null;
    submitStep: (data: any) => void;
    registerReactNode: (type: string) => void;
}

const AntigravityContext = createContext<AntigravityContextType | null>(null);

export const AntigravityProvider = ({ children, apiUrl, apiKey }: { children: React.ReactNode; apiUrl: string; apiKey?: string }) => {
    const engine = React.useMemo(() => new ClientEngine(apiUrl, apiKey), [apiUrl, apiKey]);
    const [activeNode, setActiveNode] = React.useState<{ nodeId: string; type: string; input: any } | null>(null);
    const resolverRef = useRef<NodeResolver | null>(null);

    const registerReactNode = useCallback((type: string) => {
        // Register a generic ReactNode that updates our state
        const node = new ReactNode(type, type, {}, (input, resolve) => {
            console.log(`[ReactSDK] Activating node ${type} with input`, input);
            setActiveNode({ nodeId: type, type, input }); // Note: using type as ID for simplicity in this bridge
            resolverRef.current = resolve;
        });
        engine.registerNode(node);
    }, [engine]);

    const submitStep = useCallback((data: any) => {
        if (resolverRef.current) {
            console.log('[ReactSDK] Submitting step with data', data);
            resolverRef.current(data);
            resolverRef.current = null;
            setActiveNode(null);
        } else {
            console.warn('[ReactSDK] No active step to submit');
        }
    }, []);

    return React.createElement(AntigravityContext.Provider, {
        value: { engine, activeNode, submitStep, registerReactNode }
    }, children);
};

export const useAntigravity = () => {
    const context = useContext(AntigravityContext);
    if (!context) {
        throw new Error("useAntigravity must be used within an AntigravityProvider");
    }
    return context;
};

// --- Hooks ---

export interface UseWorkflowResult {
    start: (input?: any) => Promise<void>;
    status: 'idle' | 'running' | 'waiting' | 'completed' | 'failed';
    currentStep: { nodeId: string; type: string; input: any } | null;
    data: any;
    error: string | null;
    isLoading: boolean;
    submit: (data: any) => void;
}

export const useWorkflow = (workflowId: string): UseWorkflowResult => {
    const { engine, activeNode, submitStep } = useAntigravity();
    const [status, setStatus] = useState<UseWorkflowResult['status']>('idle');
    const [data, setData] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    // Derived state
    const isLoading = status === 'running';
    const currentStep = activeNode; // Global active node from context

    const start = useCallback(async (input: any = {}) => {
        setStatus('running');
        setError(null);
        setData(null);

        try {
            await engine.execute({
                workflowId,
                input,
                onProgress: (stage: string, eventData: any) => {
                    if (stage === 'client-handoff') {
                        setStatus('waiting');
                    } else if (stage === 'client-processing') {
                        // Handled by ReactNode execution
                    } else if (stage === 'server-resume') {
                        setStatus('running');
                    } else if (stage === 'complete') {
                        setStatus('completed');
                        setData(eventData.result);
                    }
                }
            });
        } catch (err: any) {
            setStatus('failed');
            setError(err.message);
        }
    }, [engine, workflowId]);

    return { start, status, currentStep, data, error, isLoading, submit: submitStep };
};
