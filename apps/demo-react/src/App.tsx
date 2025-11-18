import { useState, useEffect } from 'react';
import { ClientEngine } from '@antigravity/client-sdk';
import type { ClientNode } from '@antigravity/client-sdk';
import { motion } from 'framer-motion';
import './App.css';

// 1. Define Client Nodes
const WindowAlertNode: ClientNode = {
    id: 'window-alert',
    type: 'window-alert',
    data: {},
    execute: async ({ input }: { input: { message: string } }) => {
        // Simulate processing time for visualization
        await new Promise(resolve => setTimeout(resolve, 1000));
        alert(`[Client Node] Message from Server: ${input.message}`);
        return { status: 'success', output: { confirmed: true } };
    }
};

const BannerNode: ClientNode = {
    id: 'banner-form',
    type: 'banner-form',
    data: {},
    execute: async ({ input }: { input: { message: string } }) => {
        return new Promise((resolve) => {
            // In a real app, you might mount a component here.
            // For this demo, we'll use a simple prompt or custom UI event.
            // Let's simulate a UI interaction via a custom event that App.tsx listens to,
            // or just use a window.prompt for simplicity in this "SDK" layer, 
            // BUT the user wants a "Banner". 

            // Better approach for a "Banner": 
            // The SDK triggers an event that the UI observes to render the banner.
            // The UI then calls a callback to resolve this promise.

            // For simplicity in this file, let's use a global event emitter pattern
            // or just direct DOM manipulation if we were lazy, but let's do it React-way via an event.

            const event = new CustomEvent('show-banner', {
                detail: {
                    message: input.message,
                    resolve: (email: string) => resolve({ status: 'success', output: { email } })
                }
            });
            window.dispatchEvent(event);
        });
    }
};

function App() {
    const [status, setStatus] = useState<string>('Idle');
    const [workflowId, setWorkflowId] = useState<string>('5');
    const [activeZone, setActiveZone] = useState<'server' | 'client' | 'idle'>('idle');
    const [payload, setPayload] = useState<unknown>(null);

    // Banner State
    const [bannerData, setBannerData] = useState<{ message: string, resolve: (email: string) => void } | null>(null);
    const [email, setEmail] = useState('');

    useEffect(() => {
        const handleBanner = (e: Event) => {
            const customEvent = e as CustomEvent<{ message: string, resolve: (email: string) => void }>;
            setBannerData(customEvent.detail);
        };
        window.addEventListener('show-banner', handleBanner);
        return () => window.removeEventListener('show-banner', handleBanner);
    }, []);

    const submitBanner = () => {
        if (bannerData) {
            bannerData.resolve(email);
            setBannerData(null);
            setEmail('');
        }
    };

    const runWorkflow = async () => {
        setStatus('Starting...');
        setActiveZone('idle');
        setPayload(null);

        try {
            // Or use the new registerReactNode?
            // The current App.tsx uses engine.execute directly which is now managed by useWorkflow hook?
            // Actually, the App.tsx in demo-react is NOT using useWorkflow hook yet. It's using ClientEngine directly.
            // So the provider change doesn't affect this file unless it uses the Provider.
            // Let me check if it uses Provider. It does NOT seem to use Provider in the return statement.
            // It just instantiates ClientEngine.

            const engine = new ClientEngine('http://localhost:3002');
            engine.registerNode(WindowAlertNode);
            engine.registerNode(BannerNode);

            setStatus('Running...');

            // Simulate URL Params
            const input = { query: { utm_source: 'ppc' } };

            await engine.execute({
                workflowId,
                input,
                onProgress: (stage, data) => {
                    console.log('Progress:', stage, data);

                    if (data) {
                        if (stage === 'start') setPayload(input);
                        if (stage === 'client-handoff') setPayload(data.type);
                        if (stage === 'client-processing') setPayload("User Action Required...");
                        if (stage === 'server-resume') setPayload("Resuming...");
                        if (stage === 'complete') setPayload(data.result);
                    }

                    if (stage === 'start' || stage === 'server-resume' || stage === 'server-processing') {
                        setActiveZone('server');
                        setStatus(`Server Processing... (${stage})`);
                    } else if (stage === 'client-handoff' || stage === 'client-processing') {
                        setActiveZone('client');
                        setStatus(`Client Processing... (${stage})`);
                    } else if (stage === 'complete') {
                        setActiveZone('idle');
                        setStatus('Completed');
                    }
                }
            });

        } catch (err: unknown) {
            const error = err as Error;
            console.error(error);
            setStatus(`Failed: ${error.message}`);
            setActiveZone('idle');
        }
    };



    return (
        <div className="container">
            <h1>Antigravity Hybrid Execution</h1>

            <div className="visualization">
                <div className={`zone server ${activeZone === 'server' ? 'active' : ''}`}>
                    <h2>Server (API)</h2>
                    <div className="icon">☁️</div>
                    {activeZone === 'server' && <pre className="payload">{JSON.stringify(payload, null, 2)}</pre>}
                </div>

                <div className="path">
                    {activeZone !== 'idle' && (
                        <motion.div
                            className="packet"
                            animate={{
                                x: activeZone === 'client' ? 200 : 0,
                                backgroundColor: activeZone === 'client' ? '#646cff' : '#ff6464'
                            }}
                            transition={{ type: "spring", stiffness: 50 }}
                        />
                    )}
                </div>

                <div className={`zone client ${activeZone === 'client' ? 'active' : ''}`}>
                    <h2>Client (Browser)</h2>
                    <div className="icon">💻</div>
                    {activeZone === 'client' && <pre className="payload">{JSON.stringify(payload, null, 2)}</pre>}

                    {bannerData && (
                        <div className="banner-overlay">
                            <div className="banner">
                                <h3>🎉 Special Offer!</h3>
                                <p>{bannerData.message}</p>
                                <input
                                    type="email"
                                    placeholder="Enter email for discount"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                />
                                <button onClick={submitBanner}>Claim Code</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="controls">
                <input
                    type="text"
                    value={workflowId}
                    onChange={(e) => setWorkflowId(e.target.value)}
                    placeholder="Workflow ID"
                />
                <button onClick={runWorkflow} disabled={activeZone !== 'idle'}>
                    {activeZone === 'idle' ? 'Start Workflow' : 'Running...'}
                </button>
                <p className="status">{status}</p>
            </div>
        </div>
    );
}

export default App;
