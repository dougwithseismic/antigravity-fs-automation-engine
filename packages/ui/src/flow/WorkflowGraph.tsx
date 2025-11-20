import { useEffect } from 'react';
import {
    ReactFlow,
    type Node,
    type Edge,
    Background,
    Controls,
    useNodesState,
    useEdgesState,
    MarkerType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import './WorkflowGraph.css';
import { getNodeTypes } from './node-registry';

interface WorkflowNode {
    id: string;
    type: string;
    data: any;
    position: { x: number; y: number };
    className?: string;
}

interface WorkflowEdge {
    id?: string;
    source: string;
    target: string;
    sourceHandle?: string | null;
    targetHandle?: string | null;
    label?: string;
    animated?: boolean;
    style?: 'solid' | 'dashed' | 'dotted' | 'long-dash' | 'dash-dot';
}

interface WorkflowGraphProps {
    nodes: WorkflowNode[];
    edges: WorkflowEdge[];
    onNodeClick?: (nodeId: string) => void;
    onEdgeClick?: (edgeId: string) => void;
    edgeType?: 'default' | 'straight' | 'step' | 'smoothstep';
    snapToGrid?: boolean;
    snapGrid?: [number, number];
}

export function WorkflowGraph({
    nodes,
    edges,
    onNodeClick,
    onEdgeClick,
    edgeType = 'default',
    snapToGrid = false,
    snapGrid = [15, 15],
}: WorkflowGraphProps) {
    const nodeTypes = getNodeTypes();

    // Helper function to build flow nodes
    const buildFlowNodes = (): Node[] => {
        return nodes.map((node) => ({
            id: String(node.id),
            type: node.type || 'default',
            position: node.position,
            data: node.data,
            className: node.className,
        }));
    };

    // Helper function to get stroke dash array based on style
    const getStrokeDashArray = (style?: string): string | undefined => {
        switch (style) {
            case 'dashed':
                return '8 8';
            case 'dotted':
                return '2 6';
            case 'long-dash':
                return '16 8';
            case 'dash-dot':
                return '12 4 2 4';
            case 'solid':
            default:
                return undefined;
        }
    };

    // Helper function to build flow edges
    const buildFlowEdges = (): Edge[] => {
        return edges.map((edge, i) => ({
            id: edge.id || `e${i}-${edge.source}-${edge.target}`,
            source: String(edge.source),
            target: String(edge.target),
            sourceHandle: edge.sourceHandle || undefined,
            targetHandle: edge.targetHandle || undefined,
            type: edgeType,
            animated: edge.animated || false,
            label: edge.label,
            labelBgPadding: [10, 6],
            labelBgBorderRadius: 12,
            markerEnd: {
                type: MarkerType.ArrowClosed,
                color: '#3b5af1',
            },
            style: {
                stroke: '#3b5af1',
                strokeWidth: 2.7,
                strokeDasharray: getStrokeDashArray(edge.style),
            },
        }));
    };

    const [flowNodesState, setFlowNodes, onNodesChange] = useNodesState(buildFlowNodes());
    const [flowEdgesState, setFlowEdges, onEdgesChange] = useEdgesState(buildFlowEdges());

    // Update nodes and edges when props change
    useEffect(() => {
        setFlowNodes(buildFlowNodes());
        setFlowEdges(buildFlowEdges());
    }, [nodes, edges]);

    return (
        <div className="workflow-graph-container">
            <ReactFlow
                nodes={flowNodesState}
                edges={flowEdgesState}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                nodeTypes={nodeTypes}
                fitView
                attributionPosition="bottom-left"
                onNodeClick={(_, node) => onNodeClick?.(node.id)}
                onEdgeClick={(_, edge) => onEdgeClick?.(edge.id)}
                snapToGrid={snapToGrid}
                snapGrid={snapGrid}
            >
                <Background color="#1f2738" gap={20} size={1} />
                <Controls />
            </ReactFlow>
        </div>
    );
}
