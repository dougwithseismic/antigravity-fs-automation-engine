import { ReactNode } from 'react';
import { Handle, Position } from '@xyflow/react';
import { cn } from '../../lib/utils';
import { Badge } from '../../badge';
import { Clock4 } from 'lucide-react';

export interface NodeHandle {
    id: string;
    type: 'target' | 'source';
    dataType: 'flow' | 'string' | 'number' | 'boolean' | 'json' | 'tool' | 'model' | 'credential';
    label?: string;
    acceptsMultiple?: boolean;
}

export interface BaseNodeProps {
    id: string;
    selected?: boolean;
    type: string;
    label: string;
    description?: string;
    duration?: string;
    icon: ReactNode;
    handles?: NodeHandle[];
    children?: ReactNode;
    className?: string;
}

/**
 * NodeContainer - Shared container for all nodes
 * Handles the outer shell, header, footer, and flow handles
 */
export function NodeContainer({
    selected,
    type,
    label,
    description,
    duration = 'Instant',
    icon,
    handles = [],
    children,
    className
}: BaseNodeProps) {
    const flowInputs = handles.filter(h => h.type === 'target' && h.dataType === 'flow');
    const flowOutputs = handles.filter(h => h.type === 'source' && h.dataType === 'flow');

    return (
        <div className={cn(
            // Base styles with glass effect
            'relative w-80 rounded-xl transition-all duration-200 ease-out',
            'bg-[#0f1626]/80 backdrop-blur-xl backdrop-saturate-150',
            'border border-[#1d2233]/60 text-slate-200',
            'shadow-[0_22px_70px_-46px_rgba(0,0,0,0.7),0_0_0_1px_rgba(255,255,255,0.03)]',
            // Hover state (applied by parent .react-flow__node:hover)
            'hover:-translate-y-0.5 hover:shadow-[0_28px_80px_-48px_rgba(77,93,255,0.38),0_0_0_1px_rgba(77,93,255,0.1)]',
            'hover:border-[#1d2233]/80',
            // Selected state
            selected && 'border-[#4d5dff]/70 shadow-[0_30px_80px_-46px_rgba(77,93,255,0.45),0_0_0_1px_rgba(77,93,255,0.2)]',
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
                        '!w-3 !h-3 !bg-[#4d5dff] !border-2 !border-white',
                        'shadow-[0_0_0_3px_rgba(59,90,241,0.15)]',
                        '!-left-1.5'
                    )}
                    style={{ top: 20 }}
                />
            ))}

            {/* Header */}
            <div className={cn(
                'flex items-start gap-3.5 px-4 py-3.5',
                'bg-gradient-to-br from-[rgba(77,93,255,0.12)] via-[rgba(77,93,255,0.06)] to-[rgba(23,196,146,0.1)]',
                'backdrop-blur-sm',
                'border-b border-dashed border-[#1f2738]/50'
            )}>
                <div className={cn(
                    'w-11 h-11 rounded-xl border border-[#1d2233]/40 bg-[#0c1220]/60',
                    'backdrop-blur-sm backdrop-saturate-150',
                    'inline-flex items-center justify-center text-[#c6d2ff]',
                    'shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]'
                )}>
                    {icon}
                </div>
                <div className="flex flex-col gap-0.5 flex-1">
                    <p className="m-0 text-[0.95rem] font-bold tracking-tight text-slate-200">
                        {label}
                    </p>
                    {description && (
                        <p className="m-0 text-gray-400 text-[0.82rem] leading-[1.35]">
                            {description}
                        </p>
                    )}
                </div>
                <span className={cn(
                    'inline-flex items-center px-2.5 py-1 rounded-full',
                    'bg-[rgba(77,93,255,0.16)] backdrop-blur-sm text-[#c6d2ff]',
                    'border border-[#1d2233]/40',
                    'shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]',
                    'text-[0.7rem] font-bold tracking-wider uppercase'
                )}>
                    {type}
                </span>
            </div>

            {/* Body - Custom content from children */}
            {children}

            {/* Footer */}
            <div className={cn(
                'border-t border-dashed border-[#1f2738]/50 px-4 py-3.5',
                'flex items-center justify-between bg-[#0c1220]/40 backdrop-blur-sm'
            )}>
                <Badge variant="outline" className={cn(
                    'bg-[rgba(77,93,255,0.16)] backdrop-blur-sm text-[#c6d2ff]',
                    'border-[#1d2233]/40 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]',
                    'rounded-full px-2.5 py-1.5 text-[0.78rem] font-bold'
                )}>
                    {type}
                </Badge>
                <span className="inline-flex items-center gap-1.5 text-slate-400 text-[0.78rem]">
                    <Clock4 className="h-3 w-3" />
                    {duration}
                </span>
            </div>

            {/* Flow Output Handles */}
            {flowOutputs.map((handle) => (
                <Handle
                    key={handle.id}
                    type="source"
                    position={Position.Right}
                    id={handle.id}
                    className={cn(
                        '!w-3 !h-3 !bg-[#17c492] !border-2 !border-white',
                        'shadow-[0_0_0_3px_rgba(23,196,146,0.18)]',
                        '!-right-1.5'
                    )}
                    style={{ top: 20 }}
                />
            ))}
        </div>
    );
}

/**
 * DataHandle - Renders a data input/output handle
 */
export function DataHandle({
    handle,
    position,
    style
}: {
    handle: NodeHandle;
    position: 'left' | 'right';
    style?: React.CSSProperties;
}) {
    // Safety check
    if (!handle || !handle.type || !handle.id) {
        console.warn('DataHandle received invalid handle:', handle);
        return null;
    }

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
                    '!bg-[#4d5dff] shadow-[0_0_0_3px_rgba(59,90,241,0.15)] !-left-1.5'
                ) : (
                    '!bg-[#17c492] shadow-[0_0_0_3px_rgba(23,196,146,0.18)] !-right-1.5'
                )
            )}
            style={style}
        />
    );
}

/**
 * Reusable Tailwind class strings for node internals
 */
export const nodeStyles = {
    body: 'p-4 grid gap-3 bg-[#0f1626]/60 backdrop-blur-sm text-slate-200',

    inputGroup: cn(
        'relative p-3 border border-[#1f2738]/50 rounded-xl',
        'bg-[#0c1220]/60 backdrop-blur-md backdrop-saturate-150',
        'shadow-[inset_0_1px_0_0_rgba(255,255,255,0.03)]',
        'transition-colors duration-200 text-slate-200',
        'hover:border-[#334155]/60 hover:bg-[#0c1220]/80'
    ),

    inputLabel: 'flex items-center justify-between text-[0.8rem] text-slate-200 font-bold mb-1.5',

    control: cn(
        'w-full border-none bg-transparent text-[0.9rem] text-slate-200 outline-none',
        'placeholder:text-[#6b7382]'
    ),

    controlSelect: cn(
        'w-full border-none bg-transparent text-[0.9rem] text-slate-200 outline-none',
        'placeholder:text-[#6b7382] appearance-none pr-10',
        'bg-[url("data:image/svg+xml,%3csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 20 20\'%3e%3cpath stroke=\'%236b7280\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'1.5\' d=\'M6 8l4 4 4-4\'/%3e%3c/svg%3e")]',
        'bg-[length:1.5em_1.5em] bg-[right_0.5rem_center] bg-no-repeat'
    ),

    helper: 'mt-1.5 text-[0.78rem] text-gray-400',

    typeIndicator: cn(
        'text-[0.65rem] text-slate-400 font-mono',
        'bg-slate-800 px-1 py-0.5 rounded border border-slate-700',
        'flex items-center gap-1'
    ),

    outputs: 'grid gap-2 px-4 pb-4',

    output: cn(
        'relative flex items-center justify-between',
        'px-2.5 py-2 rounded-[10px]',
        'border border-dashed border-[#1f2738]/50',
        'bg-[#0c1220]/60 backdrop-blur-sm text-slate-300',
        'shadow-[inset_0_1px_0_0_rgba(255,255,255,0.02)]'
    ),

    outputLabel: 'text-[0.8rem] font-bold',
} as const;
