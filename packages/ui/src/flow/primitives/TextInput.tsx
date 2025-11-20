import { InputHTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

export interface TextInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'className'> {
    /** Additional className */
    className?: string;
}

/**
 * TextInput - Styled text input primitive
 *
 * @example
 * <TextInput placeholder="Enter value" defaultValue="Hello" />
 */
export function TextInput({ className, ...props }: TextInputProps) {
    return (
        <input
            type="text"
            className={cn(
                'w-full border-none bg-transparent text-[0.9rem] text-slate-200 outline-none',
                'placeholder:text-[#6b7382]',
                className
            )}
            {...props}
        />
    );
}
