import { ExecutionStep } from '@repo/types';

/**
 * ExecutionContext provides helper methods to access outputs from previous steps
 * Used by nodes that need to reference data from earlier in the workflow
 */
export class ExecutionContextHelper {
    constructor(private steps: ExecutionStep[]) {}

    /**
     * Get output from a specific node by ID
     * @param nodeId - The node ID to get output from
     * @param field - Optional specific field to extract
     * @returns The output value or undefined if not found
     */
    getNodeOutput(nodeId: string, field?: string): any {
        const step = this.steps.find((s) => s.nodeId === nodeId);
        if (!step) return undefined;

        if (field) {
            return step.output[field];
        }
        return step.output;
    }

    /**
     * Get all outputs as a flat object for easy lookup
     * Returns: { nodeId: output }
     * @returns Record of all step outputs
     */
    getAllOutputs(): Record<string, any> {
        return this.steps.reduce(
            (acc, step) => ({
                ...acc,
                [step.nodeId]: step.output,
            }),
            {}
        );
    }

    /**
     * Get all outputs flattened into a single object
     * Useful for template resolution and backward compatibility
     * Later steps override earlier steps if field names collide
     * @returns Merged outputs from all steps
     */
    getAllOutputsFlattened(): Record<string, any> {
        return this.steps.reduce(
            (acc, step) => ({
                ...acc,
                ...step.output,
            }),
            {}
        );
    }

    /**
     * Resolve template variables in a string
     * Supports formats:
     * - {{3.email}} - Get email from node 3
     * - {{code}} - Search all steps for 'code' field
     * @param template - Template string with {{variables}}
     * @returns Resolved string
     */
    resolveTemplate(template: string): string {
        return template.replace(/\{\{([^}]+)\}\}/g, (match, key) => {
            const trimmedKey = key.trim();

            // Check if key contains dot notation (e.g., "3.email")
            if (trimmedKey.includes('.')) {
                const [nodeId, field] = trimmedKey.split('.');
                const value = this.getNodeOutput(nodeId, field);
                return value !== undefined ? String(value) : match;
            }

            // Otherwise, search all steps for the field
            for (const step of this.steps) {
                if (step.output[trimmedKey] !== undefined) {
                    return String(step.output[trimmedKey]);
                }
            }

            return match; // Keep original if not found
        });
    }

    /**
     * Get the most recent completed step
     * @returns The last completed step or undefined
     */
    getLastCompletedStep(): ExecutionStep | undefined {
        return [...this.steps]
            .reverse()
            .find((s) => s.status === 'completed');
    }

    /**
     * Check if a node has been executed
     * @param nodeId - The node ID to check
     * @returns true if the node has been executed
     */
    hasExecuted(nodeId: string): boolean {
        return this.steps.some((s) => s.nodeId === nodeId);
    }

    /**
     * Get the status of a specific node
     * @param nodeId - The node ID to check
     * @returns The status or undefined if not found
     */
    getNodeStatus(
        nodeId: string
    ): ExecutionStep['status'] | undefined {
        const step = this.steps.find((s) => s.nodeId === nodeId);
        return step?.status;
    }

    /**
     * Get all steps (read-only)
     * @returns Array of execution steps
     */
    getSteps(): ReadonlyArray<ExecutionStep> {
        return this.steps;
    }
}
