import { SelectHTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

export interface SelectInputProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'className'> {
    /** Additional className */
    className?: string;
}

/**
 * SelectInput - Styled select dropdown primitive
 *
 * Features custom dropdown arrow via background image.
 *
 * @example
 * <SelectInput>
 *   <option value="a">Option A</option>
 *   <option value="b">Option B</option>
 * </SelectInput>
 */
export function SelectInput({ className, children, ...props }: SelectInputProps) {
    return (
        <select
            className={cn(
                'w-full border-none bg-transparent text-[0.9rem] text-slate-200 outline-none',
                'placeholder:text-[#6b7382] appearance-none pr-10',
                'bg-[url("data:image/svg+xml,%3csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 20 20\'%3e%3cpath stroke=\'%236b7280\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'1.5\' d=\'M6 8l4 4 4-4\'/%3e%3c/svg%3e")]',
                'bg-[length:1.5em_1.5em] bg-[right_0.5rem_center] bg-no-repeat',
                className
            )}
            {...props}
        >
            {children}
        </select>
    );
}
