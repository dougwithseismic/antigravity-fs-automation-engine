import { useState, useEffect, useRef, useCallback } from 'react';
import { fetchWorkflow, executeWorkflow, getExecutionStatus, resumeExecution, type Workflow, type ExecutionStatus } from '../api';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { WorkflowGraph } from './WorkflowGraph';
import './WorkflowExecution.css';
import './GoogleMockup.css';
import './DesktopLanding.css';

interface WorkflowExecutionAsyncProps {
    workflowId: string;
    onBack: () => void;
}

// Configuration for node-specific UI behavior
// In a real app, this might come from the backend or a shared config
const NODE_CONFIG: Record<string, { name: string; role?: 'banner' | 'discount' | 'condition' | 'action' }> = {
    '1': { name: 'Page Load (Start)' },
    '2': { name: 'Is PPC? (Condition)', role: 'condition' },
    '3': { name: 'Show Banner (Client)', role: 'banner' },
    '4': { name: 'Log Lead (Analytics)' },
    '5': { name: 'Generate Code (Discount)', role: 'discount' },
    '6': { name: 'Show Code (Alert)', role: 'condition' },
    '7': { name: 'Klaviyo Email', role: 'action' }, // Parallel node
    '8': { name: 'Log Organic Visit', role: 'action' }
};

export function WorkflowExecutionAsync({ workflowId, onBack }: WorkflowExecutionAsyncProps) {
    const [workflow, setWorkflow] = useState<Workflow | null>(null);
    const [status, setStatus] = useState<string>('Idle');
    const [activeZone, setActiveZone] = useState<'server' | 'client' | 'idle'>('idle');
    const [logs, setLogs] = useState<string[]>([]);
    const [executionStatus, setExecutionStatus] = useState<ExecutionStatus | null>(null);
    const [currentExecutionId, setCurrentExecutionId] = useState<number | null>(null);

    // UI state
    const [bannerData, setBannerData] = useState<{ message: string } | null>(null);
    const [discountCode, setDiscountCode] = useState<string | null>(null);
    const [activeNodeId, setActiveNodeId] = useState<string | null>(null);
    const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
    const [executedNodeIds, setExecutedNodeIds] = useState<Set<string>>(new Set());

    // Refs for polling control
    const isPollingRef = useRef(false);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        fetchWorkflow(workflowId).then(setWorkflow).catch(console.error);
    }, [workflowId]);

    const getLogMessageForNode = useCallback((nodeId: string, result: any): string => {
        const config = NODE_CONFIG[nodeId];
        const nodeName = config?.name || `Node ${nodeId}`;

        // Special messages based on role or specific ID
        if (config?.role === 'condition') {
            // Only for the actual condition node
            if (nodeId === '2') {
                return `${nodeName}: ${result._conditionResult ? 'PPC traffic detected' : 'Non-PPC traffic'}`;
            }
            // For other nodes that might be misused as condition (like Node 6 'Show Code')
            return `${nodeName}: Completed`;
        }
        if (config?.role === 'discount' && result.code) {
            return `${nodeName}: Generated ${result.code}`;
        }
        if (config?.role === 'action') {
            return `${nodeName}: Executed`;
        }

        return `${nodeName}: Completed`;
    }, []);

    const addLog = useCallback((msg: string) => {
        const timestamp = new Date().toLocaleTimeString();
        setLogs(prev => [...prev, `${timestamp} - ${msg}`]);
    }, []);

    const updateUIFromStatus = useCallback((status: ExecutionStatus) => {
        // Prioritize root-level stepResults (always up-to-date) over currentState.stepResults (can be stale during transitions)
        const stepResults = status.stepResults || status.currentState?.stepResults || {};

        // Check for UI-driving nodes based on config roles
        Object.entries(NODE_CONFIG).forEach(([nodeId, config]) => {
            const result = stepResults[nodeId];
            if (!result) return;

            if (config.role === 'banner' && result._clientAction === 'banner-form') {
                setBannerData({ message: result._clientMessage || 'Get 10% off!' });
            }

            if (config.role === 'discount' && result.code) {
                setDiscountCode(result.code);
                setBannerData(null); // Hide banner when code is shown
            }
        });

        // Update logs for each newly completed node
        const completedNodes = status.currentState?.completedNodes || status.completedNodes || [];
        completedNodes.forEach(nodeId => {
            const result = stepResults[nodeId];
            if (result) {
                const logMessage = getLogMessageForNode(nodeId, result);
                // Simple deduping check
                if (logMessage && !logs.some(log => log.includes(logMessage))) {
                    addLog(logMessage);
                }
            }
        });
    }, [logs, addLog, getLogMessageForNode]);

    // Poll for status
    const pollStatus = useCallback(async () => {
        if (!currentExecutionId || !isPollingRef.current) return;

        try {
            const status = await getExecutionStatus(currentExecutionId);
            console.log(`[Poll] Status: ${status.status}, Active: ${status.currentState?.activeNodes?.join(',')}`);
            setExecutionStatus(status);

            // Update executed nodes from Redis state (prioritize root-level which is always current)
            const completedNodes = status.completedNodes || status.currentState?.completedNodes || [];
            setExecutedNodeIds(new Set(completedNodes));

            // Update active nodes
            const activeNodes = status.currentState?.activeNodes || [];
            setActiveNodeId(activeNodes.length > 0 ? activeNodes[0] : null); // Fallback for UI that expects single ID

            // Update zone
            if (status.status === 'running' && activeNodes.length > 0) {
                setActiveZone('server');
            } else if (status.status === 'completed') {
                setActiveZone('idle');
            }

            // Check for UI updates
            updateUIFromStatus(status);

            // Handle suspended/waiting status
            if (status.status === 'suspended' || status.status === 'waiting') {
                setStatus('Suspended - Awaiting User Input');
                setActiveZone('client'); // Highlight client side
                // Don't stop polling - we'll resume after user interaction
            }

            // Stop polling if completed or failed
            if (status.status === 'completed' || status.status === 'failed') {
                setStatus(status.status === 'completed' ? 'Completed' : 'Failed');
                isPollingRef.current = false; // Stop polling loop

                if (status.status === 'completed') {
                    addLog('Workflow completed successfully!');
                } else {
                    addLog(`Workflow failed: ${JSON.stringify(status.currentState)}`);
                }
            } else {
                // Schedule next poll
                timeoutRef.current = setTimeout(pollStatus, 500);
            }
        } catch (error) {
            console.error('Error polling execution status:', error);
            // Retry even on error, but maybe slower?
            timeoutRef.current = setTimeout(pollStatus, 1000);
        }
    }, [currentExecutionId, addLog, updateUIFromStatus]);

    // Start polling when execution ID changes
    useEffect(() => {
        if (!currentExecutionId) {
            isPollingRef.current = false;
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            return;
        }

        isPollingRef.current = true;
        pollStatus();

        return () => {
            isPollingRef.current = false;
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentExecutionId]); // Only re-poll when execution ID changes

    const runWorkflow = async (source: 'ppc' | 'organic' = 'ppc') => {
        if (!workflow) return;

        setStatus('Running...');
        setLogs([]);
        setExecutedNodeIds(new Set());
        setActiveNodeId(null);
        setDiscountCode(null);
        setBannerData(null);
        setExecutionStatus(null);

        // Store traffic source for URL display
        (window as any).__trafficSource = source;

        addLog('Starting workflow execution...');

        try {
            // Simulate URL Params based on traffic source
            const input = source === 'ppc'
                ? { query: { utm_source: 'ppc', campaign: 'summer_sale' } }
                : { query: { utm_source: 'organic' } };

            addLog(`Traffic Source: ${source}`);
            addLog(`Input: ${JSON.stringify(input)}`);

            const { executionId } = await executeWorkflow(workflowId, input);
            setCurrentExecutionId(executionId);
            addLog(`Execution started: ID ${executionId}`);

        } catch (err: any) {
            console.error(err);
            setStatus(`Failed: ${err.message}`);
            addLog(`Error: ${err.message}`);
            setActiveZone('idle');
        }
    };

    const handleBannerSubmit = async (email: string, name: string) => {
        if (!currentExecutionId) return;

        addLog(`Submitting form: email=${email}, name=${name}`);
        setBannerData(null); // Hide banner immediately

        try {
            // Send resume request with real user data
            const result = await resumeExecution(currentExecutionId, {
                formData: {
                    email,
                    name,
                    submittedAt: new Date().toISOString()
                }
            });

            addLog(`✅ Execution resumed: ${result.message}`);
            setStatus('Running...');
        } catch (error: any) {
            addLog(`❌ Failed to resume: ${error.message}`);
            setStatus(`Failed: ${error.message}`);
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
                    {currentExecutionId && (
                        <span className="execution-id">Exec: #{currentExecutionId}</span>
                    )}
                    <button className="run-btn" onClick={() => runWorkflow('ppc')} disabled={status === 'Running...'}>
                        {status === 'Running...' ? 'Running...' : 'Run Workflow'}
                    </button>
                </div>
            </header>

            <PanelGroup direction="vertical" className="execution-body">
                <Panel defaultSize={70} minSize={40}>
                    <PanelGroup direction="horizontal">
                        {/* Graph Column */}
                        <Panel defaultSize={20} minSize={15}>
                            <div className="zone-col graph-col">
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

                        {/* Client Column */}
                        <Panel defaultSize={50} minSize={30}>
                            <div className={`zone-col client-col ${activeZone === 'client' ? 'active' : ''}`}>
                                <div className="zone-header">
                                    <h3>Client Side</h3>
                                    <div className="zone-indicator">Browser</div>
                                </div>
                                <div className="zone-content client-zone-content">
                                    {status === 'Idle' && (
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
                                                    <div className="ppc-ad" onClick={() => runWorkflow('ppc')} style={{ cursor: 'pointer' }}>
                                                        <div className="ad-title">🔥 Summer Sale - Up to 50% Off!</div>
                                                        <div className="ad-url">www.example.com/sale</div>
                                                        <div className="ad-description">
                                                            Limited time offer. Shop now and save big on all products.
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="organic-section">
                                                    <div className="organic-result" onClick={() => runWorkflow('organic')} style={{ cursor: 'pointer' }}>
                                                        <div className="ad-title">Example Store - Summer Collection</div>
                                                        <div className="ad-url">www.example.com</div>
                                                        <div className="ad-description">
                                                            Browse our latest summer collection. Free shipping on orders over $50.
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {status !== 'Idle' && (
                                        <div className="browser-window-fullwidth">
                                            <div className="browser-header">
                                                <div className="browser-dots">
                                                    <div className="dot red"></div>
                                                    <div className="dot yellow"></div>
                                                    <div className="dot green"></div>
                                                </div>
                                                <div className="browser-address-bar">
                                                    <div className="address-bar-content">
                                                        {(window as any).__trafficSource === 'organic'
                                                            ? 'https://example.com'
                                                            : 'https://example.com/sale?utm_source=ppc&campaign=summer_sale'}
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
                                                        <div className="product-section">
                                                            <div className="product-grid-compact">
                                                                {[1, 2, 3].map(i => (
                                                                    <div key={i} className="product-card-small">
                                                                        <div className="product-image-small"></div>
                                                                        <div className="product-name">Product {i}</div>
                                                                        <div className="product-price">${49.99 - (i * 10)}</div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>

                                                        <div className="sidebar-section">
                                                            {bannerData ? (
                                                                <div className="email-capture-widget">
                                                                    <h3>{bannerData.message}</h3>
                                                                    <input
                                                                        type="text"
                                                                        className="email-input-field"
                                                                        placeholder="Your name"
                                                                        defaultValue=""
                                                                        id="name-input"
                                                                    />
                                                                    <input
                                                                        type="email"
                                                                        className="email-input-field"
                                                                        placeholder="Your email"
                                                                        defaultValue=""
                                                                        id="email-input"
                                                                    />
                                                                    <button
                                                                        className="email-submit-button"
                                                                        onClick={() => {
                                                                            const nameInput = document.getElementById('name-input') as HTMLInputElement;
                                                                            const emailInput = document.getElementById('email-input') as HTMLInputElement;
                                                                            handleBannerSubmit(emailInput.value, nameInput.value);
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
                                                            ) : (status === 'Completed' && (window as any).__trafficSource === 'organic') ? (
                                                                <div className="email-capture-widget">
                                                                    <h3>✨ Thank You for Visiting!</h3>
                                                                    <p style={{ fontSize: '0.9rem', color: '#888', marginTop: '1rem' }}>
                                                                        Browse our summer collection and enjoy free shipping on orders over $50.
                                                                    </p>
                                                                </div>
                                                            ) : (
                                                                <div className="email-capture-widget placeholder">
                                                                    <h3>Get Exclusive Offers</h3>
                                                                    <div className="placeholder-text">Processing...</div>
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

                        {/* Server Column */}
                        <Panel defaultSize={30} minSize={20}>
                            <div className={`zone-col server-col ${activeZone === 'server' ? 'active' : ''}`}>
                                <div className="zone-header">
                                    <h3>Server Side</h3>
                                    <div className="zone-indicator">API + Worker</div>
                                </div>
                                <div className="zone-content">
                                    <div className="execution-history">
                                        {!executionStatus ? (
                                            <div className="history-empty">
                                                <div className="server-icon">⚙️</div>
                                                <p>Waiting for execution...</p>
                                            </div>
                                        ) : (
                                            <div className="history-entry server-stage">
                                                <div className="history-header">
                                                    <span className="stage-name">Execution State</span>
                                                    <span className={`timestamp ${executionStatus.status === 'completed' ? 'completed' : ''}`}>
                                                        {executionStatus.status === 'completed' ? 'All nodes completed ✓' : executionStatus.status}
                                                    </span>
                                                </div>
                                                <div className="state-summary">
                                                    <div>Completed: {executedNodeIds.size} nodes</div>
                                                    {activeNodeId && <div>Current: Node {activeNodeId} {status === 'Running...' && executedNodeIds.size > 0 && '(+ parallel)'}</div>}
                                                </div>
                                                {executionStatus.stepResults && (
                                                    <pre className="json-data">
                                                        {JSON.stringify(executionStatus.stepResults, null, 2)}
                                                    </pre>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </Panel>
                    </PanelGroup>
                </Panel>

                <PanelResizeHandle className="resize-handle-horizontal" />

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
