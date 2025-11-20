import { useState, useEffect, useRef, useCallback } from 'react';
import { fetchWorkflow, executeWorkflow, getExecutionStatus, resumeExecution, fetchNodes, type Workflow, type ExecutionStatus, type ExecutionStep } from '../api';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { WorkflowGraph } from './WorkflowGraph';
import { ClientNodeRenderer } from './ClientNodeRenderer';
import { ServerOutputDisplay } from './ServerOutputDisplay';
import { ExecutionTimeline } from './ExecutionTimeline';
import { stepsToNodeResults } from '../lib/utils';
import './WorkflowExecution.css';
import './ClientNodes.css';

interface GenericWorkflowExecutionProps {
    workflowId: string;
    onBack: () => void;
}

export function GenericWorkflowExecution({ workflowId, onBack }: GenericWorkflowExecutionProps) {
    const [workflow, setWorkflow] = useState<Workflow | null>(null);
    const [status, setStatus] = useState<string>('Idle');
    const [activeZone, setActiveZone] = useState<'server' | 'client' | 'idle'>('idle');
    const [logs, setLogs] = useState<string[]>([]);
    const [executionStatus, setExecutionStatus] = useState<ExecutionStatus | null>(null);
    const [currentExecutionId, setCurrentExecutionId] = useState<number | null>(null);
    
    // Node definitions from API
    const [nodeDefinitions, setNodeDefinitions] = useState<any[]>([]);

    // Steps array (new architecture)
    const [steps, setSteps] = useState<ExecutionStep[]>([]);

    // UI state
    const [activeClientNodes, setActiveClientNodes] = useState<any[]>([]);
    const [executedNodeIds, setExecutedNodeIds] = useState<Set<string>>(new Set());

    // Refs for polling
    const isPollingRef = useRef(false);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        // Fetch workflow and node definitions in parallel
        Promise.all([
            fetchWorkflow(workflowId),
            fetchNodes().catch(err => {
                console.error("Failed to fetch node definitions:", err);
                return [];
            })
        ]).then(([wf, nodes]) => {
            setWorkflow(wf);
            setNodeDefinitions(nodes);
        }).catch(console.error);
    }, [workflowId]);

    const addLog = useCallback((msg: string) => {
        const timestamp = new Date().toLocaleTimeString();
        setLogs(prev => [...prev, `${timestamp} - ${msg}`]);
    }, []);

    const getNodeInfo = useCallback((nodeId: string): any => {
        if (!workflow) return null;
        const nodes = workflow.nodes as any[];
        return nodes.find(n => n.id === nodeId);
    }, [workflow]);

    // Poll for status
    const pollStatus = useCallback(async () => {
        if (!currentExecutionId || !isPollingRef.current) return;

        try {
            const status = await getExecutionStatus(currentExecutionId);
            console.log(`[Poll] Status: ${status.status}, Active: ${status.currentState?.activeNodes?.join(',')}`);
            setExecutionStatus(status);

            // Extract steps from API response
            const executionSteps = status.steps;
            setSteps(executionSteps);

            const completedNodes = status.currentState?.completedNodes || [];
            const activeNodes = status.currentState?.activeNodes || [];

            setExecutedNodeIds(new Set(completedNodes));

            // Find active client nodes
            const clientNodes = activeNodes
                .map(nodeId => getNodeInfo(nodeId))
                .filter(node => node && node.environment === 'client');

            setActiveClientNodes(clientNodes);

            // Update zone
            if (status.status === 'running' || status.status === 'pending') {
                setActiveZone(clientNodes.length > 0 ? 'client' : 'server');
            } else if (status.status === 'suspended' || status.status === 'waiting') {
                setActiveZone('client');
                setStatus('Suspended - Awaiting User Input');
            } else if (status.status === 'completed') {
                setActiveZone('idle');
                setStatus('Completed');
                isPollingRef.current = false;
                addLog('✅ Workflow completed successfully!');
                return; // Stop polling
            } else if (status.status === 'failed') {
                setActiveZone('idle');
                setStatus('Failed');
                isPollingRef.current = false;
                addLog(`❌ Workflow failed`);
                return; // Stop polling
            }

            // Add logs for newly completed steps
            const newlyCompleted = completedNodes.filter(id => !executedNodeIds.has(id));
            newlyCompleted.forEach(nodeId => {
                const node = getNodeInfo(nodeId);
                const step = executionSteps.find(s => s.nodeId === nodeId);

                if (node && step) {
                    let logMsg = `${node.type} (${node.data?.label || nodeId})`;

                    // Add type-specific details from step output
                    if (node.type === 'discount' && step.output?.code) {
                        logMsg += ` → ${step.output.code}`;
                    } else if (node.type === 'condition' && step.output?._conditionResult !== undefined) {
                        logMsg += ` → ${step.output._conditionResult ? 'TRUE' : 'FALSE'}`;
                    } else if (node.type === 'analytics' && step.output?.eventName) {
                        logMsg += ` → ${step.output.eventName}`;
                    }

                    addLog(logMsg);
                }
            });

            // Continue polling (faster when active client nodes for better UX)
            const pollInterval = activeClientNodes.length > 0 ? 300 : 500;
            timeoutRef.current = setTimeout(pollStatus, pollInterval);

        } catch (error) {
            console.error('Error polling execution status:', error);
            timeoutRef.current = setTimeout(pollStatus, 1000);
        }
    }, [currentExecutionId, addLog, getNodeInfo, executedNodeIds]);

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
    }, [currentExecutionId]);

    const runWorkflow = async (initialInput: any = {}) => {
        if (!workflow) return;

        setStatus('Running...');
        setLogs([]);
        setExecutedNodeIds(new Set());
        setActiveClientNodes([]);
        setExecutionStatus(null);

        addLog('Starting workflow execution...');
        addLog(`Input: ${JSON.stringify(initialInput)}`);

        try {
            const { executionId } = await executeWorkflow(workflowId, initialInput);
            setCurrentExecutionId(executionId);
            addLog(`Execution started: ID ${executionId}`);
        } catch (err: any) {
            console.error(err);
            setStatus(`Failed: ${err.message}`);
            addLog(`Error: ${err.message}`);
            setActiveZone('idle');
        }
    };

    const handleClientNodeSubmit = async (nodeId: string, data: any) => {
        if (!currentExecutionId) return;

        addLog(`Client node ${nodeId} submitted: ${JSON.stringify(data)}`);

        // Show loading state while server processes
        setStatus('Processing...');

        try {
            const result = await resumeExecution(currentExecutionId, data);
            addLog(`✅ Execution resumed: ${result.message || result.status}`);

            // Immediately poll for updated state
            // Don't remove the node manually - let polling handle state updates
            setTimeout(() => pollStatus(), 100); // Quick poll to pick up new state

        } catch (error: any) {
            addLog(`❌ Failed to resume: ${error.message}`);
            setStatus(`Failed: ${error.message}`);
        }
    };

    if (!workflow) return <div className="loading">Loading workflow details...</div>;

    // Merge node definitions into workflow nodes
    const nodes = (workflow.nodes as any[]).map(node => {
        const def = nodeDefinitions.find(d => d.name === node.type);
        if (def) {
            return {
                ...node,
                data: {
                    ...node.data,
                    handles: def.handles, // Inject handles from definition
                    ui: def.ui // Inject UI config if needed
                }
            };
        }
        return node;
    });

    const hasClientNodes = nodes.some(n => n.environment === 'client');
    const statusClass = status.toLowerCase().includes('run')
        ? 'running'
        : status.toLowerCase().includes('complete')
            ? 'completed'
            : status.toLowerCase().includes('fail')
                ? 'failed'
                : status.toLowerCase().includes('idle')
                    ? 'idle'
                    : 'default';

    return (
        <div className="execution-container">
            <header className="execution-header">
                <button onClick={onBack}>← Back</button>
                <h2>{workflow.name} <span className="id-badge">ID: {workflow.id}</span></h2>
                <div className="controls">
                    <span className={`status-badge ${statusClass}`}>{status}</span>
                    {currentExecutionId && (
                        <span className="execution-id">Exec: #{currentExecutionId}</span>
                    )}
                    <button
                        className="run-btn"
                        onClick={() => runWorkflow({})}
                        disabled={status === 'Running...'}
                    >
                        {status === 'Running...' ? 'Running...' : 'Run Workflow'}
                    </button>
                </div>
            </header>

            <PanelGroup direction="vertical" className="execution-body">
                <Panel defaultSize={70} minSize={40}>
                    <PanelGroup direction="horizontal">
                        {/* Graph Column */}
                        <Panel defaultSize={hasClientNodes ? 20 : 30} minSize={15}>
                            <div className="zone-col graph-col">
                                <div className="zone-header">
                                    <h3>Workflow Graph</h3>
                                    <div className="zone-indicator">Visualization</div>
                                </div>
                                <div className="zone-content graph-content">
                                    <WorkflowGraph
                                        nodes={nodes}
                                        edges={workflow.edges as any[]}
                                        activeNodeId={activeClientNodes[0]?.id}
                                        executedNodeIds={executedNodeIds}
                                    />
                                </div>
                            </div>
                        </Panel>

                        <PanelResizeHandle className="resize-handle" />

                        {/* Client Column (only show if workflow has client nodes) */}
                        {hasClientNodes && (
                            <>
                                <Panel defaultSize={40} minSize={30}>
                                    <div className={`zone-col client-col ${activeZone === 'client' ? 'active' : ''}`}>
                                        <div className="zone-header">
                                            <h3>Client Side</h3>
                                            <div className="zone-indicator">Browser</div>
                                        </div>
                                        <div className="zone-content client-zone-content">
                                            {status === 'Idle' ? (
                                                <div className="idle-state">
                                                    <div className="idle-icon">🌐</div>
                                                    <p>Click "Run Workflow" to start</p>
                                                </div>
                                            ) : status === 'Processing...' ? (
                                                <div className="processing-state">
                                                    <div className="spinner">⚙️</div>
                                                    <p>Processing your submission...</p>
                                                </div>
                                            ) : activeClientNodes.length > 0 ? (
                                                <div className="client-nodes-container">
                                                    {activeClientNodes.map((node) => {
                                                        // Calculate step info
                                                        const allClientNodes = nodes.filter(n => n.environment === 'client');
                                                        const currentStep = allClientNodes.findIndex(n => n.id === node.id) + 1;
                                                        const totalSteps = allClientNodes.length;

                                                        return (
                                                            <ClientNodeRenderer
                                                                key={node.id}
                                                                node={node}
                                                                onSubmit={(data) => handleClientNodeSubmit(node.id, data)}
                                                                stepInfo={{ current: currentStep, total: totalSteps }}
                                                            />
                                                        );
                                                    })}
                                                </div>
                                            ) : (
                                                <div className="processing-state">
                                                    <div className="spinner">⚙️</div>
                                                    <p>{status === 'Completed' ? 'Workflow Completed' : 'Processing on server...'}</p>
                                                    {steps.length > 0 && (
                                                        <ServerOutputDisplay
                                                            nodeResults={stepsToNodeResults(steps)}
                                                            nodes={nodes}
                                                        />
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </Panel>
                                <PanelResizeHandle className="resize-handle" />
                            </>
                        )}

                        {/* Server Column */}
                        <Panel defaultSize={hasClientNodes ? 40 : 70} minSize={20}>
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
                                            <>
                                                {/* Execution Timeline */}
                                                {steps.length > 0 && (
                                                    <ExecutionTimeline steps={steps} nodes={nodes} />
                                                )}

                                                {/* Server Output Display */}
                                                {steps.length > 0 && (
                                                    <ServerOutputDisplay
                                                        nodeResults={stepsToNodeResults(steps)}
                                                        nodes={nodes}
                                                    />
                                                )}

                                                {/* Execution State Summary */}
                                                <div className="history-entry server-stage">
                                                    <div className="history-header">
                                                        <span className="stage-name">Execution State</span>
                                                        <span className={`timestamp ${executionStatus.status === 'completed' ? 'completed' : ''}`}>
                                                            {executionStatus.status}
                                                        </span>
                                                    </div>
                                                    <div className="state-summary">
                                                        <div>Completed: {executedNodeIds.size} / {nodes.length} nodes</div>
                                                        {steps.length > 0 && (
                                                            <div>Steps recorded: {steps.length}</div>
                                                        )}
                                                        {activeClientNodes.length > 0 && (
                                                            <div>Waiting for client: {activeClientNodes.map(n => n.type).join(', ')}</div>
                                                        )}
                                                    </div>
                                                </div>
                                            </>
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
                            {logs.length === 0 ? (
                                <div className="logs-empty">No activity yet</div>
                            ) : (
                                logs.map((log, i) => <div key={i} className="log-entry">{log}</div>)
                            )}
                        </div>
                    </div>
                </Panel>
            </PanelGroup>
        </div>
    );
}
