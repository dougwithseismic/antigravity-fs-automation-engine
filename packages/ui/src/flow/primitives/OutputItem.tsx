import { ReactNode } from 'react';
import { cn } from '../../lib/utils';
import { DataHandle } from './DataHandle';
import type { NodeHandle } from './types';

export interface OutputItemProps {
    /** Output label */
    label: string;

    /** Data handle element (DEPRECATED: use handleData instead) */
    handle?: ReactNode;

    /** Handle configuration (preferred over `handle` prop) */
    handleData?: NodeHandle;

    /** Additional className */
    className?: string;
}

/**
 * OutputItem - Single output with label and handle
 *
 * @example
 * // New way (preferred)
 * <OutputItem
 *   label="Result"
 *   handleData={{ id: 'result', type: 'source', dataType: 'string' }}
 * />
 *
 * @example
 * // Old way (deprecated)
 * <OutputItem
 *   label="Result"
 *   handle={<DataHandle handle={handle} position="right" />}
 * />
 */
export function OutputItem({ label, handle, handleData, className }: OutputItemProps) {
    return (
        <div className={cn(
            'relative flex items-center justify-between',
            'px-2.5 py-2 rounded-[10px]',
            'border border-dashed border-[#1f2738]/50',
            'bg-[#0c1220]/60 backdrop-blur-sm text-slate-300',
            'shadow-[inset_0_1px_0_0_rgba(255,255,255,0.02)]',
            className
        )}>
            <span className="text-[0.8rem] font-bold">{label}</span>
            {/* New way: use handleData prop */}
            {handleData && (
                <DataHandle
                    handle={handleData}
                    position="right"
                    style={{ right: -6 }}
                />
            )}
            {/* Fallback to old handle prop for backwards compatibility */}
            {!handleData && handle}
        </div>
    );
}
