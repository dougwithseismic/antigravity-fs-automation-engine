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
import { nodeTypes } from './NodeTypes';

interface WorkflowNode {
    id: string;
    type: string;
    data: any;
    position: { x: number; y: number };
    environment?: string;
}

interface WorkflowEdge {
    id?: string;
    source: string;
    target: string;
    sourceHandle?: string | null;
    targetHandle?: string | null;
    condition?: string;
    style?: 'solid' | 'dashed' | 'dotted' | 'long-dash' | 'dash-dot';
}

interface WorkflowGraphProps {
    nodes: WorkflowNode[];
    edges: WorkflowEdge[];
    activeNodeId?: string;
    hoveredNodeId?: string;
    onNodeHover?: (nodeId: string | null) => void;
    executedNodeIds?: Set<string>;
    edgeType?: 'default' | 'straight' | 'step' | 'smoothstep';
    snapToGrid?: boolean;
    snapGrid?: [number, number];
}

export function WorkflowGraph({
    nodes,
    edges,
    activeNodeId,
    hoveredNodeId,
    onNodeHover,
    executedNodeIds = new Set(),
    edgeType = 'default',
    snapToGrid = false,
    snapGrid = [15, 15],
}: WorkflowGraphProps) {
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

    // Helper function to build flow nodes
    const buildFlowNodes = (): Node[] => {
        return nodes.map((node, index) => {
            const nodeId = String(node.id);
            const isClientNode = node.environment === 'client';

            // For server nodes, infer execution if a later node is active
            // E.g., if node 6 is active, nodes 1-5 must have executed
            const inferredExecution = isClientNode ? false :
                activeNodeId ? parseInt(nodeId) < parseInt(activeNodeId) : false;

            const hasExecuted = executedNodeIds.has(nodeId) || inferredExecution;
            const isActive = activeNodeId === nodeId;
            const isHovered = hoveredNodeId === nodeId;
            const isPending = !hasExecuted && !isActive;

            // Determine node state class
            const stateClass = isPending ? 'pending-node' :
                isActive ? 'active-node' :
                    hasExecuted ? 'executed-node' : '';

            return {
                id: nodeId,
                type: node.type || 'start', // Use actual node type
                position: node.position || { x: 150, y: index * 120 },
                data: {
                    label: node.data?.label || `Node ${nodeId}`,
                    ...node.data,
                },
                className: [stateClass, isHovered ? 'hovered-node' : ''].filter(Boolean).join(' '),
            };
        });
    };

    // Helper function to build flow edges
    const buildFlowEdges = (): Edge[] => {
        return edges.map((edge, i) => {
            const sourceExecuted = executedNodeIds.has(String(edge.source));
            const isActiveEdge = activeNodeId === String(edge.source) || activeNodeId === String(edge.target);
            const isPending = !sourceExecuted;
            const baseColor = '#3b5af1';
            const pendingColor = '#cdd5e7';
            const activeColor = '#0ea36e';

            return {
                id: edge.id || `e${i}-${edge.source}-${edge.target}`,
                source: String(edge.source),
                target: String(edge.target),
                sourceHandle: edge.sourceHandle || undefined,
                targetHandle: edge.targetHandle || undefined,
                type: edgeType,
                animated: isActiveEdge,
                label: edge.condition ? `when ${edge.condition}` : undefined,
                markerEnd: {
                    type: MarkerType.ArrowClosed,
                    color: isPending ? pendingColor : isActiveEdge ? activeColor : baseColor,
                },
                style: {
                    stroke: isPending ? pendingColor : isActiveEdge ? activeColor : baseColor,
                    strokeWidth: 2.7,
                    opacity: isPending ? 0.35 : 1,
                    strokeDasharray: edge.style ? getStrokeDashArray(edge.style) : (isPending ? '8 8' : undefined),
                },
            };
        });
    };

    const [flowNodesState, setFlowNodes, onNodesChange] = useNodesState(buildFlowNodes());
    const [flowEdgesState, setFlowEdges, onEdgesChange] = useEdgesState(buildFlowEdges());

    // Update nodes and edges when props change
    useEffect(() => {
        setFlowNodes(buildFlowNodes());
        setFlowEdges(buildFlowEdges());
    }, [activeNodeId, hoveredNodeId, executedNodeIds, nodes, edges]);

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
                onNodeMouseEnter={(_, node) => onNodeHover?.(node.id)}
                onNodeMouseLeave={() => onNodeHover?.(null)}
                snapToGrid={snapToGrid}
                snapGrid={snapGrid}
            >
                <Background color="#1f2738" gap={20} size={1} />
                <Controls />

            </ReactFlow>
        </div>
    );
}
