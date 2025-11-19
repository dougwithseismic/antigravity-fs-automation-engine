import { useState, useEffect, useRef } from 'react';
import { ClientEngine } from '@antigravity/client-sdk';
import { NotifyNode, BannerNode } from '../nodes';
import { fetchWorkflow, type Workflow } from '../api';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { WorkflowGraph } from './WorkflowGraph';
import './WorkflowExecution.css';
import './GoogleMockup.css';
import './DesktopLanding.css';

interface WorkflowExecutionProps {
    workflowId: string;
    onBack: () => void;
}

export function WorkflowExecution({ workflowId, onBack }: WorkflowExecutionProps) {
    const [workflow, setWorkflow] = useState<Workflow | null>(null);
    const [status, setStatus] = useState<string>('Idle');
    const [activeZone, setActiveZone] = useState<'server' | 'client' | 'idle'>('idle');
    const [logs, setLogs] = useState<string[]>([]);
    const [currentData, setCurrentData] = useState<any>(null);

    // State snapshot for history replay
    interface StateSnapshot {
        stage: string;
        data: any;
        timestamp: number;
        nodeId: string | null;
        activeZone: 'server' | 'client' | 'idle';
        executedNodeIds: Set<string>;
    }

    // Server Execution History with full state snapshots
    const [executionHistory, setExecutionHistory] = useState<StateSnapshot[]>([]);
    const [selectedHistoryIndex, setSelectedHistoryIndex] = useState<number | null>(null);

    // Banner State
    const [bannerData, setBannerData] = useState<{ message: string, resolve: (email: string) => void } | null>(null);

    // Discount Code State
    const [discountCode, setDiscountCode] = useState<string | null>(null);

    // Active node tracking for graph visualization
    const [activeNodeId, setActiveNodeId] = useState<string | null>(null);

    // Hovered node tracking for bidirectional highlighting
    const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

    // Track executed nodes for graph visualization
    const [executedNodeIds, setExecutedNodeIds] = useState<Set<string>>(new Set());

    const engineRef = useRef<ClientEngine | null>(null);

    // Helper to determine node ID from stage and data
    const getNodeIdFromStage = (stage: string, data: any): string | null => {
        // Explicit nodeId in data (client stages)
        if (data?.nodeId) return String(data.nodeId);

        // Map stages to node IDs based on workflow structure
        // Node 1: Page Load (start)
        // Node 2: Is PPC? (server-processing after start)
        // Node 3: Banner Form (client-handoff with banner-form type)
        // Node 4: Log Lead (server-resume after node 3)
        // Node 5: Generate Code (server-processing before final notify)
        // Node 6: Notify (client-handoff with window-alert type)

        if (stage === 'start') return '1'; // Page Load node
        if (stage === 'server-processing' && data?.step === 'init') return '2'; // Is PPC?
        if (stage === 'client-handoff' && data?.type === 'banner-form') return '3';
        if (stage === 'server-resume' && data?.nodeId === '3') return '4'; // Log Lead
        if (stage === 'server-processing' && !data?.step) return '5'; // Generate Code
        if (stage === 'client-handoff' && data?.type === 'window-alert') return '6';

        return null;
    };

    useEffect(() => {
        fetchWorkflow(workflowId).then(setWorkflow).catch(console.error);

        const engine = new ClientEngine('http://localhost:3002');
        engine.registerNode(NotifyNode);
        engine.registerNode(BannerNode);
        engineRef.current = engine;

        const handleBanner = (e: Event) => {
            const customEvent = e as CustomEvent<{ message: string, resolve: (email: string) => void }>;
            setBannerData(customEvent.detail);
        };

        // Generic notification handler - determines what to show based on data
        const handleNotification = (e: Event) => {
            const customEvent = e as CustomEvent<{ type: string, data: any }>;
            const { data } = customEvent.detail;

            // If data has output.code, show discount code
            if (data?.output?.code) {
                setDiscountCode(data.output.code);
            }
            // Could handle other notification types here
        };

        window.addEventListener('show-banner', handleBanner);
        window.addEventListener('client-notification', handleNotification);
        return () => {
            window.removeEventListener('show-banner', handleBanner);
            window.removeEventListener('client-notification', handleNotification);
        };
    }, [workflowId]);

    const addLog = (msg: string) => setLogs(prev => [...prev, `${new Date().toLocaleTimeString()} - ${msg}`]);

    // Replay a specific state from history
    const replayState = (snapshot: StateSnapshot) => {
        setActiveNodeId(snapshot.nodeId);
        setActiveZone(snapshot.activeZone);
        setExecutedNodeIds(new Set(snapshot.executedNodeIds));
        setCurrentData(snapshot.data);

        // Restore client UI state based on the snapshot
        if (snapshot.stage === 'client-handoff' && snapshot.data?.type === 'banner-form') {
            // State when banner form should be shown
            setBannerData(null); // Clear for now, would need to reconstruct
            setDiscountCode(null);
        } else if (snapshot.stage === 'complete') {
            // Final state - show discount code from results
            const discountResult = snapshot.data?.result?.results?.['5'];
            if (discountResult?.output?.code) {
                setDiscountCode(discountResult.output.code);
            }
            setBannerData(null);
        } else {
            // Intermediate states
            setBannerData(null);
            setDiscountCode(null);
        }

        addLog(`Replaying state: ${snapshot.stage} (Node ${snapshot.nodeId})`);
    };

    const runWorkflow = async () => {
        if (!engineRef.current || !workflow) return;

        setStatus('Running...');
        setLogs([]);
        setExecutionHistory([]);
        setExecutedNodeIds(new Set()); // Reset executed nodes
        setActiveNodeId(null);
        setSelectedHistoryIndex(null);
        addLog('Starting workflow execution...');
        setCurrentData(null);
        setDiscountCode(null);
        setBannerData(null);

        try {
            // Simulate URL Params for PPC demo
            const input = { query: { utm_source: 'ppc', campaign: 'summer_sale' } };
            addLog(`Starting workflow ${workflowId} with input: ${JSON.stringify(input)}`);

            const result = await engineRef.current.execute({
                workflowId,
                input,
                onProgress: (stage, data) => {
                    console.log('Progress:', stage, data);

                    const nodeId = getNodeIdFromStage(stage, data);
                    const newZone: 'server' | 'client' | 'idle' =
                        stage.includes('client') ? 'client' :
                            stage === 'complete' ? 'idle' : 'server';

                    // Update executed nodes when a node completes
                    setExecutedNodeIds(prev => {
                        const newSet = new Set(prev);
                        if (nodeId && stage !== 'client-handoff') {
                            newSet.add(nodeId);
                        }

                        // Create state snapshot
                        const snapshot: StateSnapshot = {
                            stage,
                            data,
                            timestamp: Date.now(),
                            nodeId,
                            activeZone: newZone,
                            executedNodeIds: new Set(newSet)
                        };

                        setExecutionHistory(prev => [...prev, snapshot]);
                        return newSet;
                    });

                    setActiveNodeId(nodeId);
                    setActiveZone(newZone);

                    if (stage === 'start') {
                        addLog('Workflow started - Node 1: Page Load');
                        setCurrentData(input);
                    }
                    if (stage === 'server-processing') {
                        if (data?.step === 'init') {
                            addLog('Node 2: Checking if PPC traffic');
                        } else {
                            addLog(`Server processing node: ${nodeId}`);
                        }
                    }
                    if (stage === 'client-handoff') {
                        addLog(`Handoff to Client - Node ${nodeId}: ${data?.type}`);
                        setCurrentData(data);
                    }
                    if (stage === 'client-processing') {
                        addLog(`Client processing node ${nodeId}...`);
                    }
                    if (stage === 'server-resume') {
                        addLog(`Resuming on Server from node ${data?.nodeId}`);
                        setCurrentData(data);
                    }
                    if (stage === 'complete') {
                        addLog('Workflow Completed');
                        setCurrentData(data.result);
                        setStatus('Completed');

                        // Extract discount code from workflow results
                        // Node 5 is the discount generation node
                        const discountResult = data.result?.results?.['5'];
                        if (discountResult?.output?.code) {
                            setDiscountCode(discountResult.output.code);
                            addLog(`Discount code generated: ${discountResult.output.code}`);
                        }
                    }
                }
            });

            console.log('Execution Result:', result);

        } catch (err: any) {
            console.error(err);
            setStatus(`Failed: ${err.message}`);
            addLog(`Error: ${err.message}`);
            setActiveZone('idle');
        }
    };

    if (!workflow) return <div className="loading">Loading workflow details...</div>;

    return (
        <div className="execution-container">
            <header className="execution-header">
                <button onClick={onBack}>← Back</button>
                <h2>{workflow.name} <span className="id-badge">ID: {workflow.id}</span></h2>
                <div className="controls">
                    <span className={`status-badge ${status.toLowerCase()}`}>{status}</span>
                    <button className="run-btn" onClick={runWorkflow} disabled={status === 'Running...'}>
                        {status === 'Running...' ? 'Running...' : 'Run Workflow'}
                    </button>
                </div>
            </header>

            <PanelGroup direction="vertical" className="execution-body">
                {/* Main Visualization Area */}
                <Panel defaultSize={70} minSize={40}>
                    <PanelGroup direction="horizontal">
                        {/* Graph Column - Left */}
                        <Panel defaultSize={20} minSize={15}>
                            <div className={`zone-col graph-col`}>
                                <div className="zone-header">
                                    <h3>Workflow Graph</h3>
                                    <div className="zone-indicator">Visualization</div>
                                </div>
                                <div className="zone-content graph-content">
                                    {workflow && (
                                        <WorkflowGraph
                                            nodes={workflow.nodes as any[]}
                                            edges={workflow.edges as any[]}
                                            activeNodeId={activeNodeId || undefined}
                                            hoveredNodeId={hoveredNodeId || undefined}
                                            onNodeHover={setHoveredNodeId}
                                            executedNodeIds={executedNodeIds}
                                        />
                                    )}
                                </div>
                            </div>
                        </Panel>

                        <PanelResizeHandle className="resize-handle" />

                        {/* Client Column - Middle (Largest) */}
                        <Panel defaultSize={50} minSize={30}>
                            <div className={`zone-col client-col ${activeZone === 'client' ? 'active' : ''}`}>
                                <div className="zone-header">
                                    <h3>Client Side</h3>
                                    <div className="zone-indicator">Browser</div>
                                </div>
                                <div className="zone-content client-zone-content">
                                    {status === 'Idle' && (
                                        /* State 0: Google Search with PPC Ad */
                                        <div className="google-mockup">
                                            <div className="google-header">
                                                <div className="google-logo">Google</div>
                                                <div className="search-bar">
                                                    <span className="search-text">summer sale deals</span>
                                                </div>
                                            </div>
                                            <div className="search-results">
                                                <div className="ad-section">
                                                    <div className="ad-label">Sponsored</div>
                                                    <div
                                                        className="ppc-ad"
                                                        onClick={runWorkflow}
                                                        style={{ cursor: 'pointer' }}
                                                    >
                                                        <div className="ad-title">🔥 Summer Sale - Up to 50% Off!</div>
                                                        <div className="ad-url">www.example.com/sale</div>
                                                        <div className="ad-description">
                                                            Limited time offer. Shop now and save big on all products.
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="organic-result">
                                                    <div className="result-title">Summer Sale Tips...</div>
                                                    <div className="result-snippet">Find the best deals...</div>
                                                </div>
                                                <div className="organic-result">
                                                    <div className="result-title">Top Summer Discounts...</div>
                                                    <div className="result-snippet">Compare prices...</div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {status !== 'Idle' && (
                                        /* Landing Page with Browser Chrome */
                                        <div className="browser-window-fullwidth">
                                            <div className="browser-header">
                                                <div className="browser-dots">
                                                    <div className="dot red"></div>
                                                    <div className="dot yellow"></div>
                                                    <div className="dot green"></div>
                                                </div>
                                                <div className="browser-address-bar">
                                                    <div className="address-bar-content">
                                                        {currentData?.utm_source && currentData?.campaign
                                                            ? `https://example.com/sale?utm_source=${currentData.utm_source}&campaign=${currentData.campaign}`
                                                            : 'https://example.com/sale'}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="browser-content-fullwidth">
                                                <div className="landing-page-desktop">
                                                    <div className="landing-hero">
                                                        <h1 className="hero-title">☀️ Summer Sale</h1>
                                                        <p className="hero-subtitle">Limited Time Offer - Save Up To 50%</p>
                                                    </div>

                                                    <div className="landing-grid">
                                                        {/* Left: Product Grid */}
                                                        <div className="product-section">
                                                            <div className="product-grid-compact">
                                                                <div className="product-card-small">
                                                                    <div className="product-image-small"></div>
                                                                    <div className="product-name">Product 1</div>
                                                                    <div className="product-price">$49.99</div>
                                                                </div>
                                                                <div className="product-card-small">
                                                                    <div className="product-image-small"></div>
                                                                    <div className="product-name">Product 2</div>
                                                                    <div className="product-price">$39.99</div>
                                                                </div>
                                                                <div className="product-card-small">
                                                                    <div className="product-image-small"></div>
                                                                    <div className="product-name">Product 3</div>
                                                                    <div className="product-price">$29.99</div>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Right: Email Form / Discount Code */}
                                                        <div className="sidebar-section">
                                                            {bannerData ? (
                                                                <div className="email-capture-widget">
                                                                    <h3>{bannerData.message}</h3>
                                                                    <input
                                                                        type="email"
                                                                        className="email-input-field"
                                                                        placeholder="Enter your email"
                                                                        onKeyDown={(e) => {
                                                                            if (e.key === 'Enter') {
                                                                                bannerData.resolve((e.target as HTMLInputElement).value);
                                                                                setBannerData(null);
                                                                            }
                                                                        }}
                                                                    />
                                                                    <button
                                                                        className="email-submit-button"
                                                                        onClick={(e) => {
                                                                            const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                                                                            bannerData.resolve(input.value);
                                                                            setBannerData(null);
                                                                        }}
                                                                    >
                                                                        Get Offer
                                                                    </button>
                                                                </div>
                                                            ) : discountCode ? (
                                                                <div className="discount-widget">
                                                                    <h3>🎉 Special Offer!</h3>
                                                                    <div className="discount-code-box">{discountCode}</div>
                                                                    <p>Use this code at checkout</p>
                                                                </div>
                                                            ) : (
                                                                <div className="email-capture-widget placeholder">
                                                                    <h3>Get Exclusive Offers</h3>
                                                                    <div className="placeholder-text">Loading...</div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </Panel>

                        <PanelResizeHandle className="resize-handle" />

                        {/* Server Column - Right */}
                        <Panel defaultSize={30} minSize={20}>
                            <div className={`zone-col server-col ${activeZone === 'server' ? 'active' : ''}`}>
                                <div className="zone-header">
                                    <h3>Server Side</h3>
                                    <div className="zone-indicator">API</div>
                                </div>
                                <div className="zone-content">
                                    <div className="execution-history">
                                        {executionHistory.length === 0 ? (
                                            <div className="history-empty">
                                                <div className="server-icon">⚙️</div>
                                                <p>Waiting for execution...</p>
                                            </div>
                                        ) : (
                                            executionHistory.map((snapshot, i) => (
                                                <div
                                                    key={i}
                                                    className={`history-entry ${snapshot.stage.includes('server') || snapshot.stage === 'start' ? 'server-stage' : 'client-stage'} ${snapshot.nodeId === hoveredNodeId ? 'highlighted' : ''} ${selectedHistoryIndex === i ? 'selected' : ''}`}
                                                    onMouseEnter={() => snapshot.nodeId && setHoveredNodeId(snapshot.nodeId)}
                                                    onMouseLeave={() => setHoveredNodeId(null)}
                                                    onClick={() => {
                                                        setSelectedHistoryIndex(i);
                                                        replayState(snapshot);
                                                    }}
                                                >
                                                    <div className="history-header">
                                                        <span className="stage-name">
                                                            {snapshot.nodeId && `Node ${snapshot.nodeId}: `}
                                                            {snapshot.stage}
                                                        </span>
                                                        <span className="timestamp">{new Date(snapshot.timestamp).toLocaleTimeString()}</span>
                                                    </div>
                                                    <pre className="json-data">{JSON.stringify(snapshot.data, null, 2)}</pre>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </div>
                        </Panel>
                    </PanelGroup>
                </Panel>

                <PanelResizeHandle className="resize-handle-horizontal" />

                {/* Execution Logs Panel */}
                <Panel defaultSize={30} minSize={15} maxSize={50}>
                    <div className="logs-panel">
                        <h3>Execution Logs</h3>
                        <div className="logs-list">
                            {logs.map((log, i) => <div key={i} className="log-entry">{log}</div>)}
                        </div>
                    </div>
                </Panel>
            </PanelGroup>
        </div>
    );
}
