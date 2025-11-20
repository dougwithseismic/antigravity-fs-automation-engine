import { cn } from '../../lib/utils';

interface BadgeProps {
    variant?: 'default' | 'outline' | 'secondary';
    className?: string;
    children: React.ReactNode;
}

export function Badge({ variant = 'default', className, children }: BadgeProps) {
    const baseStyles = 'inline-flex items-center rounded-md px-2 py-1 text-xs font-medium';

    const variantStyles = {
        default: 'bg-blue-500/10 text-blue-500 border border-blue-500/20',
        outline: 'border border-gray-300 text-gray-700',
        secondary: 'bg-gray-500/10 text-gray-500 border border-gray-500/20'
    };

    return (
        <span className={cn(baseStyles, variantStyles[variant], className)}>
            {children}
        </span>
    );
}
