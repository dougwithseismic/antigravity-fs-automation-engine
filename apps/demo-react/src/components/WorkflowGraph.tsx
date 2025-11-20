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

interface WorkflowGraphProps {
    nodes: WorkflowNode[];
    edges: Array<{ source: string; target: string }>;
    activeNodeId?: string;
    hoveredNodeId?: string;
    onNodeHover?: (nodeId: string | null) => void;
    executedNodeIds?: Set<string>;
}

export function WorkflowGraph({ nodes, edges, activeNodeId, hoveredNodeId, onNodeHover, executedNodeIds = new Set() }: WorkflowGraphProps) {
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

            return {
                id: `e${i}-${edge.source}-${edge.target}`,
                source: String(edge.source),
                target: String(edge.target),
                type: 'default',
                animated: isActiveEdge,
                markerEnd: {
                    type: MarkerType.ArrowClosed,
                    color: isPending ? '#444' : isActiveEdge ? '#4caf50' : '#646cff',
                },
                style: {
                    stroke: isPending ? '#444' : isActiveEdge ? '#4caf50' : '#646cff',
                    strokeWidth: 3,
                    opacity: isPending ? 0.3 : 1,
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
            >
                <Background />
                <Controls />

            </ReactFlow>
        </div>
    );
}
