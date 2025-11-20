import { ReactNode } from 'react';
import { cn } from '../../lib/utils';

export interface NodeHeaderProps {
    /** Icon element */
    icon: ReactNode;

    /** Node title */
    title: string;

    /** Optional description */
    description?: string;

    /** Badge text (usually node type) */
    badge?: string;

    /** Additional className */
    className?: string;
}

/**
 * NodeHeader - Top section of a node card
 *
 * Contains icon, title, description, and type badge.
 *
 * @example
 * <NodeHeader
 *   icon={<Play className="h-4 w-4" />}
 *   title="Start"
 *   description="Entry point for workflow"
 *   badge="trigger"
 * />
 */
export function NodeHeader({
    icon,
    title,
    description,
    badge,
    className
}: NodeHeaderProps) {
    return (
        <div className={cn(
            'flex items-start gap-3.5 px-4 py-3.5',
            'bg-gradient-to-br from-[rgba(77,93,255,0.12)] via-[rgba(77,93,255,0.06)] to-[rgba(23,196,146,0.1)]',
            'backdrop-blur-sm',
            'border-b border-dashed border-[#1f2738]/50',
            className
        )}>
            {/* Icon */}
            <div className={cn(
                'w-11 h-11 rounded-xl border border-[#1d2233]/40',
                'bg-[#0c1220]/60 backdrop-blur-sm backdrop-saturate-150',
                'shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]',
                'inline-flex items-center justify-center text-[#c6d2ff]',
                'shrink-0'
            )}>
                {icon}
            </div>

            {/* Title & Description */}
            <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                <h3 className="m-0 text-[0.95rem] font-bold tracking-tight text-slate-200 truncate">
                    {title}
                </h3>
                {description && (
                    <p className="m-0 text-gray-400 text-[0.82rem] leading-[1.35] truncate">
                        {description}
                    </p>
                )}
            </div>

            {/* Badge */}
            {badge && (
                <span className={cn(
                    'inline-flex items-center px-2.5 py-1 rounded-full shrink-0',
                    'bg-[rgba(77,93,255,0.16)] backdrop-blur-sm text-[#c6d2ff]',
                    'border border-[#1d2233]/40',
                    'shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]',
                    'text-[0.7rem] font-bold tracking-wider uppercase'
                )}>
                    {badge}
                </span>
            )}
        </div>
    );
}
