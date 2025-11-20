"use client";

import { useState, useEffect, useCallback, use } from "react";
import { ReactFlowProvider, useNodesState, useEdgesState, addEdge, type Node, type Edge } from '@xyflow/react';
import { WorkflowSidebar } from "@/components/workflow/workflow-sidebar";
import { WorkflowCanvas } from "@/components/workflow/workflow-canvas";
import { WorkflowConfigPanel } from "@/components/workflow/workflow-config-panel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Save, Play } from "lucide-react";

function WorkflowEditorContent({ id }: { id: string }) {
    const [selectedNode, setSelectedNode] = useState<Node | null>(null);
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

    const handleNodeSelect = useCallback((node: Node | null) => {
        setSelectedNode(node);
    }, []);

    const handleUpdateNode = useCallback((nodeId: string, data: any) => {
        setNodes((nds) =>
            nds.map((node) => {
                if (node.id === nodeId) {
                    return { ...node, data: { ...node.data, ...data } };
                }
                return node;
            })
        );
    }, [setNodes]);

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
        <div className="h-screen flex bg-background">
            {/* Icon Sidebar */}
            <WorkflowSidebar />

            {/* Main Content */}
            <div className="flex-1 flex flex-col ml-14">
                {/* Top Bar */}
                <header className="h-14 border-b border-border/50 bg-card/50 backdrop-blur-sm flex items-center justify-between px-4 z-10">
                    <Input
                        value={workflowName}
                        onChange={(e) => setWorkflowName(e.target.value)}
                        className="max-w-xs bg-background/50 border-border/50 font-medium"
                        placeholder="Workflow name"
                    />
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleSave}
                            disabled={isSaving}
                            className="gap-2"
                        >
                            <Save className="h-4 w-4" />
                            {isSaving ? "Saving..." : "Save"}
                        </Button>
                        <Button
                            size="sm"
                            onClick={handleExecute}
                            className="gap-2 bg-primary hover:bg-primary/90"
                        >
                            <Play className="h-4 w-4" />
                            Run
                        </Button>
                    </div>
                </header>

                {/* Canvas + Config Panel */}
                <div className="flex-1 flex overflow-hidden">
                    <div className="flex-1">
                        <WorkflowCanvas
                            nodes={nodes}
                            edges={edges}
                            onNodesChange={onNodesChange}
                            onEdgesChange={onEdgesChange}
                            onConnect={onConnect}
                            onNodeSelect={handleNodeSelect}
                        />
                    </div>
                    <WorkflowConfigPanel
                        selectedNode={selectedNode}
                        onUpdateNode={handleUpdateNode}
                    />
                </div>
            </div>
        </div>
    );
}

export default function WorkflowEditorPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);

    return (
        <ReactFlowProvider>
            <WorkflowEditorContent id={id} />
        </ReactFlowProvider>
    );
}
