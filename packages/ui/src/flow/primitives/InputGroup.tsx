import { ReactNode, ReactElement, cloneElement, isValidElement } from 'react';
import { cn } from '../../lib/utils';
import { Lock } from 'lucide-react';
import { DataHandle } from './DataHandle';
import type { NodeHandle } from './types';

export interface InputGroupProps {
    /** Input label */
    label: string;

    /** Type indicator badge (e.g., "string", "json", "number") */
    typeIndicator?: string | ReactNode;

    /** Helper text below input */
    helper?: string;

    /** Input element(s) */
    children: ReactNode;

    /** Data handle element (positioned absolutely) - DEPRECATED: use handleData instead */
    handle?: ReactNode;

    /** Handle configuration (preferred over `handle` prop) */
    handleData?: NodeHandle;

    /** Additional className */
    className?: string;

    /** Required field indicator */
    required?: boolean;

    /** Secret/sensitive field - shows indicator and masks input */
    secret?: boolean;
}

/**
 * InputGroup - Container for labeled inputs
 *
 * Provides consistent styling for form inputs with labels,
 * type indicators, and helper text.
 *
 * @example
 * <InputGroup
 *   label="API Key"
 *   typeIndicator="string"
 *   handleData={{ id: 'api-key', type: 'target', dataType: 'credential' }}
 *   required
 *   secret
 * >
 *   <TextInput placeholder="sk-..." />
 * </InputGroup>
 */
export function InputGroup({
    label,
    typeIndicator,
    helper,
    children,
    handle,
    handleData,
    className,
    required,
    secret
}: InputGroupProps) {
    // Clone children and inject type="password" if secret is true
    const processedChildren = secret && isValidElement(children)
        ? cloneElement(children as ReactElement<any>, { type: 'password' })
        : children;

    return (
        <div className={cn(
            'relative p-3 border border-[#1f2738]/50 rounded-xl',
            'bg-[#0c1220]/60 backdrop-blur-md backdrop-saturate-150',
            'shadow-[inset_0_1px_0_0_rgba(255,255,255,0.03)]',
            'transition-colors duration-200 text-slate-200',
            'hover:border-[#334155]/60 hover:bg-[#0c1220]/80',
            className
        )}>
            {/* Data Handle - positioned at top of input group */}
            {handleData && (
                <DataHandle
                    handle={handleData}
                    position="left"
                    style={{ top: 14, left: -6 }}
                />
            )}
            {/* Fallback to old handle prop for backwards compatibility */}
            {!handleData && handle}

            {/* Label Row */}
            <div className="flex items-center justify-between text-[0.8rem] text-slate-200 font-bold mb-1.5">
                <span className="flex items-center gap-1.5">
                    {label}
                    {required && <span className="text-red-400 ml-0.5">*</span>}
                    {secret && (
                        <span className="inline-flex items-center gap-0.5 text-[0.65rem] text-amber-400 font-mono bg-amber-500/10 px-1 py-0.5 rounded border border-amber-500/30">
                            <Lock className="h-2.5 w-2.5" />
                            secret
                        </span>
                    )}
                </span>

                {/* Type Indicator */}
                {typeIndicator && (
                    typeof typeIndicator === 'string' ? (
                        <span className={cn(
                            'text-[0.65rem] text-slate-400 font-mono',
                            'bg-slate-800 px-1 py-0.5 rounded border border-slate-700'
                        )}>
                            {typeIndicator}
                        </span>
                    ) : (
                        typeIndicator
                    )
                )}
            </div>

            {/* Input */}
            {processedChildren}

            {/* Helper Text */}
            {helper && (
                <div className="mt-1.5 text-[0.78rem] text-gray-400">
                    {helper}
                </div>
            )}
        </div>
    );
}
