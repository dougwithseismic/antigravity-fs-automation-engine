import { Handle, Position } from '@xyflow/react';
import { cn } from '../../lib/utils';
import type { NodeHandle } from './types';

export interface DataHandleProps {
    /** Handle configuration */
    handle: NodeHandle;

    /** Position on node */
    position: 'left' | 'right';

    /** Custom style overrides */
    style?: React.CSSProperties;
}

/**
 * DataHandle - Data connection point for non-flow handles
 *
 * Renders a ReactFlow Handle with consistent styling.
 *
 * @example
 * <DataHandle
 *   handle={{ id: 'input', type: 'target', dataType: 'string' }}
 *   position="left"
 *   style={{ top: '50%' }}
 * />
 */
export function DataHandle({ handle, position, style }: DataHandleProps) {
    const isInput = handle.type === 'target';
    const positionMap = {
        left: Position.Left,
        right: Position.Right
    };

    return (
        <Handle
            type={handle.type}
            position={positionMap[position]}
            id={handle.id}
            className={cn(
                '!w-3 !h-3 !border-2 !border-white',
                isInput ? (
                    '!bg-[#4d5dff] shadow-[0_0_0_3px_rgba(59,90,241,0.15)]'
                ) : (
                    '!bg-[#17c492] shadow-[0_0_0_3px_rgba(23,196,146,0.18)]'
                )
            )}
            style={style}
        />
    );
}
