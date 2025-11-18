"use client";

import React, { useCallback } from 'react';
import {
    ReactFlow,
    MiniMap,
    Controls,
    Background,
    useNodesState,
    useEdgesState,
    addEdge,
    BackgroundVariant,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { ScifiNode } from './scifi-node';

const nodeTypes = {
    scifi: ScifiNode,
};

export interface WorkflowCanvasProps {
    nodes: any[];
    edges: any[];
    onNodesChange: (changes: any) => void;
    onEdgesChange: (changes: any) => void;
    onConnect: (connection: any) => void;
    onNodeSelect?: (node: any) => void;
}

export function WorkflowCanvas({
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    onNodeSelect
}: WorkflowCanvasProps) {
    const onNodeClick = useCallback(
        (_: React.MouseEvent, node: any) => {
            onNodeSelect?.(node);
        },
        [onNodeSelect],
    );

    return (
        <div style={{ width: '100%', height: '100%' }} className="bg-slate-950 scifi-grid">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                nodeTypes={nodeTypes}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onNodeClick={onNodeClick}
            >
                <Controls />
                <MiniMap />
                <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
            </ReactFlow>
        </div>
    );
}
