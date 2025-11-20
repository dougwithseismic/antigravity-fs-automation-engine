// Simplified NodeTypes - no dependency on @antigravity/nodes
// Demo-react doesn't need the full node registry, just needs to render basic nodes

import type { NodeProps } from '@xyflow/react';
import { DefaultNode } from './DefaultNode';

// Simple node type mapping - just use DefaultNode for everything
export const nodeTypes: Record<string, React.ComponentType<NodeProps>> = {
    start: DefaultNode,
    condition: DefaultNode,
    'banner-form': DefaultNode,
    analytics: DefaultNode,
    discount: DefaultNode,
    'window-alert': DefaultNode,
    email: DefaultNode,
    // Add more as needed
};
