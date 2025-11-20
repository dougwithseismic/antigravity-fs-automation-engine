import { ReactNode } from 'react';

/**
 * Node handle types for data flow
 */
export interface NodeHandle {
    id: string;
    type: 'target' | 'source';
    dataType: 'flow' | 'string' | 'number' | 'boolean' | 'json' | 'object' | 'array' | 'any' | 'tool' | 'model' | 'credential';
    label?: string;
    acceptsMultiple?: boolean;
}

/**
 * Base node state
 */
export interface NodeState {
    selected?: boolean;
    pending?: boolean;
    executing?: boolean;
    executed?: boolean;
    error?: boolean;
}

/**
 * Node card variant styles
 */
export type NodeVariant = 'default' | 'trigger' | 'action' | 'logic' | 'data' | 'ui';

/**
 * Common props for primitive components
 */
export interface PrimitiveComponentProps {
    className?: string;
    children?: ReactNode;
}
