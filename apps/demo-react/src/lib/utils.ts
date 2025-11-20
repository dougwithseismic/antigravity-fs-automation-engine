import type { ExecutionStep } from '../api';

// Utility function for classnames (replaces cn from web app)
export function cn(...classes: (string | undefined | false)[]) {
    return classes.filter(Boolean).join(' ');
}

/**
 * Convert steps array to node results object for backward compatibility
 */
export function stepsToNodeResults(steps: ExecutionStep[]): Record<string, any> {
    return steps.reduce((acc, step) => ({
        ...acc,
        [step.nodeId]: step.output
    }), {});
}

/**
 * Filter steps by status
 */
export function getStepsByStatus(steps: ExecutionStep[], status: string): ExecutionStep[] {
    return steps.filter(s => s.status === status);
}

/**
 * Get execution timeline sorted by start time
 */
export function getExecutionTimeline(steps: ExecutionStep[]) {
    return steps
        .sort((a, b) => new Date(a.startedAt).getTime() - new Date(b.startedAt).getTime())
        .map(step => ({
            nodeId: step.nodeId,
            nodeType: step.nodeType,
            status: step.status,
            duration: step.duration,
            timestamp: step.startedAt,
            error: step.error
        }));
}

/**
 * Format timestamp to readable time
 */
export function formatTime(timestamp: string): string {
    const date = new Date(timestamp);
    return date.toLocaleTimeString();
}

/**
 * Get status icon for timeline display
 */
export function getStatusIcon(status: string): string {
    const icons: Record<string, string> = {
        completed: '✅',
        running: '⏳',
        suspended: '⏸️',
        failed: '❌',
        pending: '⏺️'
    };
    return icons[status] || '○';
}
