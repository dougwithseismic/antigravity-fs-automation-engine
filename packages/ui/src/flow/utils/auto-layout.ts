import dagre from 'dagre';
import type { Node, Edge } from '@xyflow/react';

export interface LayoutOptions {
    direction?: 'TB' | 'BT' | 'LR' | 'RL'; // Top-Bottom, Bottom-Top, Left-Right, Right-Left
    nodeWidth?: number;
    nodeHeight?: number;
    rankSep?: number; // Separation between ranks (levels)
    nodeSep?: number; // Separation between nodes in the same rank
    edgeSep?: number; // Separation between edges
}

/**
 * Auto-layout nodes using dagre algorithm
 *
 * @param nodes - Array of React Flow nodes
 * @param edges - Array of React Flow edges
 * @param options - Layout configuration options
 * @returns Array of nodes with calculated positions
 */
export function getAutoLayoutedNodes(
    nodes: Node[],
    edges: Edge[],
    options: LayoutOptions = {}
): Node[] {
    const {
        direction = 'TB',
        nodeWidth = 350,
        nodeHeight = 150,
        rankSep = 100,
        nodeSep = 80,
        edgeSep = 10,
    } = options;

    // Create a new directed graph
    const dagreGraph = new dagre.graphlib.Graph();
    dagreGraph.setDefaultEdgeLabel(() => ({}));

    // Set graph layout options
    dagreGraph.setGraph({
        rankdir: direction,
        ranksep: rankSep,
        nodesep: nodeSep,
        edgesep: edgeSep,
    });

    // Add nodes to dagre graph
    nodes.forEach((node) => {
        dagreGraph.setNode(node.id, {
            width: node.width || nodeWidth,
            height: node.height || nodeHeight,
        });
    });

    // Add edges to dagre graph
    edges.forEach((edge) => {
        dagreGraph.setEdge(edge.source, edge.target);
    });

    // Calculate layout
    dagre.layout(dagreGraph);

    // Apply calculated positions to nodes
    return nodes.map((node) => {
        const nodeWithPosition = dagreGraph.node(node.id);

        return {
            ...node,
            position: {
                x: nodeWithPosition.x - (node.width || nodeWidth) / 2,
                y: nodeWithPosition.y - (node.height || nodeHeight) / 2,
            },
        };
    });
}

/**
 * Helper to create nodes and edges with auto-layout applied
 */
export function createAutoLayoutedElements(
    nodes: Omit<Node, 'position'>[],
    edges: Edge[],
    options?: LayoutOptions
): { nodes: Node[]; edges: Edge[] } {
    // Add default positions (will be overwritten by dagre)
    const nodesWithDefaultPos = nodes.map((node) => ({
        ...node,
        position: { x: 0, y: 0 },
    })) as Node[];

    const layoutedNodes = getAutoLayoutedNodes(nodesWithDefaultPos, edges, options);

    return {
        nodes: layoutedNodes,
        edges,
    };
}
