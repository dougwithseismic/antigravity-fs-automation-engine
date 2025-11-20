import { ReactNode } from 'react';
import { cn } from '../../lib/utils';

export interface InputSelectorProps {
    /** The selected input value to display */
    value?: string;

    /** Placeholder when no value is selected */
    placeholder?: string;

    /** Color variant for the value display */
    variant?: 'default' | 'blue' | 'green' | 'purple' | 'amber' | 'pink';

    /** Optional prefix label */
    prefix?: ReactNode;

    /** Optional suffix label */
    suffix?: ReactNode;

    /** Additional className */
    className?: string;

    /** Click handler */
    onClick?: () => void;
}

const variantColors = {
    default: 'text-slate-300',
    blue: 'text-blue-400',
    green: 'text-green-400',
    purple: 'text-purple-400',
    amber: 'text-amber-400',
    pink: 'text-pink-400',
};

/**
 * InputSelector - Display selected input with styled badge
 *
 * Shows the selected input value in a styled container matching
 * the aesthetic of the condition node preview.
 *
 * @example
 * <InputSelector
 *   value="user.email"
 *   variant="blue"
 *   placeholder="Select an input..."
 * />
 *
 * @example
 * <InputSelector
 *   prefix={<span className="text-slate-400">from</span>}
 *   value="fetchNode.response"
 *   variant="green"
 * />
 */
export function InputSelector({
    value,
    placeholder = 'Select input...',
    variant = 'blue',
    prefix,
    suffix,
    className,
    onClick
}: InputSelectorProps) {
    return (
        <div
            className={cn(
                'rounded-lg bg-slate-800/50 px-3 py-2 font-mono text-xs',
                'border border-slate-700/50',
                'transition-colors duration-200',
                onClick && 'cursor-pointer hover:bg-slate-800/70 hover:border-slate-600/50',
                className
            )}
            onClick={onClick}
        >
            {prefix && (
                <>
                    <span className="text-slate-400">{prefix}</span>
                    {' '}
                </>
            )}

            <span className={cn(
                value ? variantColors[variant] : 'text-slate-500',
                'font-medium'
            )}>
                {value || placeholder}
            </span>

            {suffix && (
                <>
                    {' '}
                    <span className="text-slate-400">{suffix}</span>
                </>
            )}
        </div>
    );
}
