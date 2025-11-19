import { useEffect } from 'react';
import ReactFlow, {
    type Node,
    type Edge,
    Background,
    Controls,
    useNodesState,
    useEdgesState,
    type NodeTypes,
    MarkerType,
    Handle,
    Position,
} from 'reactflow';
import 'reactflow/dist/style.css';
import './WorkflowGraph.css';

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

// Custom node component with hover details and connection handles
function CustomNode({ data }: { data: any }) {
    const isClientNode = data.environment === 'client';

    return (
        <div className="custom-node">
            <Handle type="target" position={Position.Top} />
            <div className="node-header">
                <div className={`environment-badge ${isClientNode ? 'client-env' : 'server-env'}`}>
                    {isClientNode ? '🖥️ Client' : '⚙️ Server'}
                </div>
            </div>
            <div className="node-label">{data.label || data.type}</div>
            {data.tooltip && (
                <div className="node-tooltip">
                    <div className="tooltip-content">{data.tooltip}</div>
                </div>
            )}
            <Handle type="source" position={Position.Bottom} />
        </div>
    );
}

// Define nodeTypes outside component to avoid recreating on each render
const nodeTypes: NodeTypes = {
    custom: CustomNode,
};

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

            console.log(`Node ${nodeId}: hasExecuted=${hasExecuted}, isActive=${isActive}, isPending=${isPending}, inferred=${inferredExecution}, class=${stateClass}`);

            return {
                id: nodeId,
                type: 'custom',
                position: node.position || { x: 150, y: index * 120 },
                data: {
                    label: node.data?.label || `Node ${nodeId}`,
                    type: node.type,
                    environment: node.environment,
                    tooltip: `Type: ${node.type}\nID: ${nodeId}\nEnv: ${node.environment || 'server'}`,
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
        console.log(`activeNodeId changed to: ${activeNodeId}, executedNodeIds: ${Array.from(executedNodeIds).join(', ')}`);
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
