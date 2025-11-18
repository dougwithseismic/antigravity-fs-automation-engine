"use client";
import { useState, useEffect, useCallback, use } from "react";
import Link from "next/link";
import { WorkflowCanvas } from "../../../components/workflow/canvas";
import { Sidebar } from "../../../components/workflow/sidebar";
import { useNodesState, useEdgesState, addEdge, type Node, type Edge } from '@xyflow/react';

export default function WorkflowEditorPage({ params }: { params: Promise<{ id: string }> }): React.ReactNode {
    const { id } = use(params);
    const [selectedNode, setSelectedNode] = useState<any>(null);
    const [workflowName, setWorkflowName] = useState("Loading...");
    const [isSaving, setIsSaving] = useState(false);

    const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

    // Fetch workflow data
    useEffect(() => {
        const fetchWorkflow = async () => {
            try {
                const res = await fetch(`http://localhost:3002/workflows/${id}`);
                if (!res.ok) throw new Error("Failed to fetch workflow");
                const data = await res.json();
                setWorkflowName(data.name);

                // Ensure nodes/edges are arrays and have positions
                const safeNodes = Array.isArray(data.nodes) ? data.nodes.map((node: any, index: number) => ({
                    ...node,
                    position: node.position || { x: 100 + (index * 200), y: 100 + (index * 50) } // Default layout
                })) : [];

                setNodes(safeNodes);
                setEdges(Array.isArray(data.edges) ? data.edges : []);
            } catch (e) {
                console.error(e);
                alert("Failed to load workflow");
            }
        };
        fetchWorkflow();
    }, [id, setNodes, setEdges]);

    const onConnect = useCallback(
        (params: any) => setEdges((eds) => addEdge(params, eds)),
        [setEdges],
    );

    const handleNodeSelect = (node: any) => {
        setSelectedNode(node);
    };

    const handleUpdateNode = (nodeId: string, data: any) => {
        setNodes((nds) =>
            nds.map((node) => {
                if (node.id === nodeId) {
                    return { ...node, data: { ...node.data, ...data } };
                }
                return node;
            })
        );
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const res = await fetch(`http://localhost:3002/workflows/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: workflowName,
                    nodes,
                    edges,
                }),
            });
            if (!res.ok) throw new Error("Failed to save");
            // Visual feedback could be added here
        } catch (e) {
            alert('Failed to save workflow');
        } finally {
            setIsSaving(false);
        }
    };

    const handleExecute = async () => {
        try {
            const res = await fetch(`http://localhost:3002/workflows/${id}/execute`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({}),
            });
            const data = await res.json();
            alert(`Execution Status: ${data.status}`);
        } catch (e) {
            alert('Execution failed');
        }
    };

    return (
        <div className="flex h-screen flex-col bg-slate-950 text-blue-100 font-sans selection:bg-blue-500/30">
            <div className="p-4 border-b border-blue-900/50 flex justify-between items-center bg-slate-900/80 backdrop-blur-md z-20 shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
                <div className="flex items-center gap-4">
                    <Link href="/" className="text-blue-500 hover:text-blue-400 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7" /><path d="M19 12H5" /></svg>
                    </Link>
                    <h1 className="font-bold text-xl tracking-wider uppercase text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">{workflowName}</h1>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="bg-slate-800 hover:bg-slate-700 text-blue-200 px-6 py-2 rounded-full border border-blue-900/50 transition-all text-sm font-medium tracking-wide uppercase disabled:opacity-50"
                    >
                        {isSaving ? "Saving..." : "Save Protocol"}
                    </button>
                    <button onClick={handleExecute} className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-full border border-blue-400/50 shadow-[0_0_15px_rgba(59,130,246,0.5)] transition-all hover:shadow-[0_0_25px_rgba(59,130,246,0.8)] text-sm font-medium tracking-wide uppercase">
                        Execute Protocol
                    </button>
                </div>
            </div>
            <div className="flex flex-1 relative overflow-hidden">
                <div className="flex-1 relative z-10">
                    <WorkflowCanvas
                        nodes={nodes}
                        edges={edges}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        onConnect={onConnect}
                        onNodeSelect={handleNodeSelect}
                    />
                </div>
                <Sidebar selectedNode={selectedNode} onUpdateNode={handleUpdateNode} />
            </div>
        </div>
    );
}
