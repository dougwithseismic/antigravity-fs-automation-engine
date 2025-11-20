import { TextareaHTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

export interface TextareaInputProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'className'> {
    /** Additional className */
    className?: string;
}

/**
 * TextareaInput - Styled textarea primitive
 *
 * @example
 * <TextareaInput rows={3} placeholder="Enter description" />
 */
export function TextareaInput({ className, ...props }: TextareaInputProps) {
    return (
        <textarea
            className={cn(
                'w-full border-none bg-transparent text-[0.9rem] text-slate-200 outline-none',
                'placeholder:text-[#6b7382] resize-none',
                className
            )}
            {...props}
        />
    );
}
