import { ReactNode } from 'react';
import { cn } from '../../lib/utils';

export interface OutputGroupProps {
    children: ReactNode;
    className?: string;
}

/**
 * OutputGroup - Container for node output items
 *
 * @example
 * <OutputGroup>
 *   <OutputItem label="Result" handle={<DataHandle... />} />
 *   <OutputItem label="Error" handle={<DataHandle... />} />
 * </OutputGroup>
 */
export function OutputGroup({ children, className }: OutputGroupProps) {
    return (
        <div className={cn('grid gap-2 px-4 pb-4', className)}>
            {children}
        </div>
    );
}
