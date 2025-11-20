import { ReactNode } from 'react';
import { Handle, Position } from '@xyflow/react';
import { cn } from '../../lib/utils';
import type { NodeState, NodeHandle } from './types';

export interface NodeCardProps {
    /** Card state (selected, executing, etc.) */
    state?: NodeState;

    /** Top slot - typically header with icon, title, badge */
    top?: ReactNode;

    /** Middle slot - main content area */
    middle?: ReactNode;

    /** Bottom slot - typically footer with metadata */
    bottom?: ReactNode;

    /** Flow handles configuration */
    handles?: NodeHandle[];

    /** Additional className */
    className?: string;

    /** Variant style */
    variant?: 'default' | 'client' | 'server';
}

/**
 * NodeCard - Base Lego block for all nodes
 *
 * Provides the card structure with top/middle/bottom slots,
 * state management, and flow handles.
 *
 * @example
 * <NodeCard
 *   state={{ selected: true }}
 *   top={<NodeHeader icon={<Icon />} title="My Node" badge="action" />}
 *   middle={<div>Content</div>}
 *   bottom={<NodeFooter type="action" duration="2s" />}
 *   handles={handles}
 * />
 */
export function NodeCard({
    state = {},
    top,
    middle,
    bottom,
    handles = [],
    className,
    variant = 'default'
}: NodeCardProps) {
    const flowInputs = handles.filter(h => h.type === 'target' && h.dataType === 'flow');
    const flowOutputs = handles.filter(h => h.type === 'source' && h.dataType === 'flow');

    return (
        <div className={cn(
            // Base card styles with glass effect
            'relative w-80 rounded-xl transition-all duration-200 ease-out',
            'bg-[#0f1626]/80 backdrop-blur-xl backdrop-saturate-150 border text-slate-200',
            'shadow-[0_22px_70px_-46px_rgba(0,0,0,0.7),0_0_0_1px_rgba(255,255,255,0.03)]',

            // Hover state
            'hover:-translate-y-0.5 hover:shadow-[0_28px_80px_-48px_rgba(77,93,255,0.38),0_0_0_1px_rgba(77,93,255,0.1)]',
            'hover:border-opacity-80',

            // Border color by state
            state.selected && 'border-[#4d5dff]/70 shadow-[0_30px_80px_-46px_rgba(77,93,255,0.45),0_0_0_1px_rgba(77,93,255,0.2)]',
            state.executing && 'border-[#17c492]/70 shadow-[0_26px_70px_-40px_rgba(23,196,146,0.45),0_0_0_1px_rgba(23,196,146,0.15)]',
            state.error && 'border-red-500/70 shadow-[0_26px_70px_-40px_rgba(239,68,68,0.45),0_0_0_1px_rgba(239,68,68,0.15)]',
            state.pending && 'opacity-70 border-dashed',
            !state.selected && !state.executing && !state.error && 'border-[#1d2233]/60',

            // Variant styles
            variant === 'client' && 'border-2 border-dashed border-yellow-500/30',

            className
        )}>
            {/* Flow Input Handles */}
            {flowInputs.map((handle) => (
                <Handle
                    key={handle.id}
                    type="target"
                    position={Position.Left}
                    id={handle.id}
                    className={cn(
                        '!w-3 !h-3 !border-2 !border-white',
                        state.executing
                            ? '!bg-[#2339c4] shadow-[0_0_0_3px_rgba(35,57,196,0.18)]'
                            : '!bg-[#4d5dff] shadow-[0_0_0_3px_rgba(59,90,241,0.15)]',
                        state.pending && '!bg-[#2a3248] shadow-[0_0_0_3px_rgba(42,50,72,0.5)]',
                        '!-left-1.5'
                    )}
                    style={{ top: 20 }}
                />
            ))}

            {/* Top Slot */}
            {top}

            {/* Middle Slot */}
            {middle}

            {/* Bottom Slot */}
            {bottom}

            {/* Flow Output Handles */}
            {flowOutputs.map((handle) => (
                <Handle
                    key={handle.id}
                    type="source"
                    position={Position.Right}
                    id={handle.id}
                    className={cn(
                        '!w-3 !h-3 !border-2 !border-white',
                        '!bg-[#17c492] shadow-[0_0_0_3px_rgba(23,196,146,0.18)]',
                        state.pending && '!bg-[#2a3248] shadow-[0_0_0_3px_rgba(42,50,72,0.5)]',
                        '!-right-1.5'
                    )}
                    style={{ top: 20 }}
                />
            ))}
        </div>
    );
}
