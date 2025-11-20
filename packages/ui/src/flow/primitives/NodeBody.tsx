import { ReactNode } from 'react';
import { cn } from '../../lib/utils';

export interface NodeBodyProps {
    children: ReactNode;
    className?: string;
}

/**
 * NodeBody - Middle section container for node content
 *
 * Provides consistent padding and spacing for node inputs/content.
 *
 * @example
 * <NodeBody>
 *   <InputGroup label="Name">
 *     <TextInput placeholder="Enter name" />
 *   </InputGroup>
 * </NodeBody>
 */
export function NodeBody({ children, className }: NodeBodyProps) {
    return (
        <div className={cn(
            'p-4 grid gap-3 bg-[#0f1626]/60 backdrop-blur-sm text-slate-200',
            className
        )}>
            {children}
        </div>
    );
}
