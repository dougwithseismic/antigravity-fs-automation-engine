import { Clock4 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Badge } from '../../badge';

export interface NodeFooterProps {
    /** Node type label */
    type: string;

    /** Duration/timing info */
    duration?: string;

    /** Additional className */
    className?: string;
}

/**
 * NodeFooter - Bottom section of a node card
 *
 * Displays node type badge and timing information.
 *
 * @example
 * <NodeFooter type="action" duration="2s" />
 */
export function NodeFooter({
    type,
    duration = 'Instant',
    className
}: NodeFooterProps) {
    return (
        <div className={cn(
            'border-t border-dashed border-[#1f2738]/50 px-4 py-3.5',
            'flex items-center justify-between bg-[#0c1220]/40 backdrop-blur-sm',
            className
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
    );
}
