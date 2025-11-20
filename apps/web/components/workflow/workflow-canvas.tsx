"use client"

import { useCallback } from 'react'
import {
    ReactFlow,
    Background,
    Controls,
    MiniMap,
    Panel,
    useReactFlow,
    type Node,
    type Edge,
    type OnNodesChange,
    type OnEdgesChange,
    type OnConnect,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { nodeTypes } from './custom-nodes'
import { cn } from '@/lib/utils'
import { Plus } from 'lucide-react'

interface WorkflowCanvasProps {
    nodes: Node[]
    edges: Edge[]
    onNodesChange: OnNodesChange
    onEdgesChange: OnEdgesChange
    onConnect: OnConnect
    onNodeSelect?: (node: Node | null) => void
}

export function WorkflowCanvas({
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    onNodeSelect,
}: WorkflowCanvasProps) {
    const { setNodes } = useReactFlow()

    const handleNodeClick = useCallback(
        (_event: React.MouseEvent, node: Node) => {
            onNodeSelect?.(node)
        },
        [onNodeSelect]
    )

    const handlePaneClick = useCallback(() => {
        onNodeSelect?.(null)
    }, [onNodeSelect])

    const addNode = useCallback(
        (type: 'tool' | 'web' | 'agent') => {
            const newNode: Node = {
                id: `${type}-${Date.now()}`,
                type,
                position: { x: Math.random() * 400, y: Math.random() * 400 },
                data: {
                    label: type.charAt(0).toUpperCase() + type.slice(1),
                    description: `New ${type} node`,
                },
            }
            setNodes((nds) => [...nds, newNode])
        },
        [setNodes]
    )

    return (
        <div className="h-full w-full relative">
            <ReactFlow
                nodes={nodes}
                edges={edges}

                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onNodeClick={handleNodeClick}
                onPaneClick={handlePaneClick}
                nodeTypes={nodeTypes}
                fitView
                className="bg-background"
                defaultEdgeOptions={{
                    style: { stroke: 'var(--color-primary)', strokeWidth: 2 },
                    animated: true,
                }}
            >
                <Background
                    gap={40}
                    size={1}
                    color="var(--color-border)"
                    className="opacity-50"
                />
                <Controls
                    className="bg-card border border-border/50 rounded-lg shadow-lg"
                    showInteractive={false}
                />
                <MiniMap
                    className="bg-card border border-border/50 rounded-lg shadow-lg"
                    nodeColor="var(--color-primary)"
                    maskColor="rgba(0, 0, 0, 0.7)"

                />

                {/* Add Node Panel */}
                <Panel position="top-left" className="flex gap-2 ml-2 mt-2">
                    <button
                        onClick={() => addNode('tool')}
                        className={cn(
                            "flex items-center gap-2 px-3 py-2 rounded-lg",
                            "bg-card border border-border/50 hover:border-primary/50",
                            "text-sm font-medium text-foreground hover:text-primary",
                            "transition-all shadow-lg hover:shadow-primary/20"
                        )}
                    >
                        <Plus className="h-4 w-4" />
                        Tool
                    </button>
                    <button
                        onClick={() => addNode('web')}
                        className={cn(
                            "flex items-center gap-2 px-3 py-2 rounded-lg",
                            "bg-card border border-border/50 hover:border-primary/50",
                            "text-sm font-medium text-foreground hover:text-primary",
                            "transition-all shadow-lg hover:shadow-primary/20"
                        )}
                    >
                        <Plus className="h-4 w-4" />
                        Web
                    </button>
                    <button
                        onClick={() => addNode('agent')}
                        className={cn(
                            "flex items-center gap-2 px-3 py-2 rounded-lg",
                            "bg-card border border-primary/30 hover:border-primary/50",
                            "text-sm font-medium text-primary hover:text-primary",
                            "transition-all shadow-lg hover:shadow-primary/20",
                            "bg-primary/5"
                        )}
                    >
                        <Plus className="h-4 w-4" />
                        Agent
                    </button>
                </Panel>
            </ReactFlow>
        </div>
    )
}
