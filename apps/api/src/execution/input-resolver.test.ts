import { describe, it, expect, beforeEach } from 'vitest';
import { resolveNodeInputs } from './input-resolver';
import type { WorkflowNode, WorkflowEdge, ExecutionContext } from './types';

describe('Input Resolution Tests', () => {
    let context: ExecutionContext;

    beforeEach(() => {
        context = {
            workflowId: 1,
            executionId: 1,
            input: {},
            results: {}
        };
    });

    describe('Simple Scenarios (Chill)', () => {
        it('should return empty object when node has no UI definition', () => {
            const node: WorkflowNode = {
                id: '1',
                type: 'unknown-node',
                position: { x: 0, y: 0 },
                data: { someValue: 'test' }
            };

            const resolved = resolveNodeInputs(node, [], context);

            expect(resolved).toEqual({ someValue: 'test' });
        });

        it('should use default values when no data provided', () => {
            const node: WorkflowNode = {
                id: '1',
                type: 'discount',
                position: { x: 0, y: 0 },
                data: {}
            };

            const resolved = resolveNodeInputs(node, [], context);

            expect(resolved.prefix).toBe('WELCOME');
            expect(resolved.percentage).toBe('10');
        });

        it('should use configured values over defaults', () => {
            const node: WorkflowNode = {
                id: '1',
                type: 'discount',
                position: { x: 0, y: 0 },
                data: {
                    prefix: 'SUMMER',
                    percentage: '25'
                }
            };

            const resolved = resolveNodeInputs(node, [], context);

            expect(resolved.prefix).toBe('SUMMER');
            expect(resolved.percentage).toBe('25');
        });
    });

    describe('Connection Scenarios (Medium)', () => {
        it('should resolve simple connected input', () => {
            const node: WorkflowNode = {
                id: '2',
                type: 'email',
                position: { x: 0, y: 0 },
                data: {
                    provider: 'klaviyo',
                    templateId: 'welcome_offer'
                }
            };

            const edges: WorkflowEdge[] = [
                {
                    id: 'e1',
                    source: '1',
                    target: '2',
                    targetHandle: 'to'
                }
            ];

            context.results = {
                '1': {
                    status: 'success',
                    output: {
                        email: 'user@example.com',
                        name: 'John Doe'
                    }
                }
            };

            const resolved = resolveNodeInputs(node, edges, context);

            expect(resolved.to).toEqual({ email: 'user@example.com', name: 'John Doe' });
            expect(resolved.provider).toBe('klaviyo');
        });

        it('should resolve specific output via sourceHandle', () => {
            const node: WorkflowNode = {
                id: '3',
                type: 'window-alert',
                position: { x: 0, y: 0 },
                data: {}
            };

            const edges: WorkflowEdge[] = [
                {
                    id: 'e2',
                    source: '2',
                    target: '3',
                    sourceHandle: 'code',
                    targetHandle: 'message'
                }
            ];

            context.results = {
                '2': {
                    status: 'success',
                    output: {
                        code: 'WELCOME10-ABC123',
                        percentage: 10,
                        expiresAt: '2025-12-31'
                    }
                }
            };

            const resolved = resolveNodeInputs(node, edges, context);

            expect(resolved.message).toBe('WELCOME10-ABC123');
        });

        it('should fallback to configured value when connection fails', () => {
            const node: WorkflowNode = {
                id: '2',
                type: 'email',
                position: { x: 0, y: 0 },
                data: {
                    to: 'fallback@example.com'
                }
            };

            const edges: WorkflowEdge[] = [
                {
                    id: 'e1',
                    source: '1',
                    target: '2',
                    targetHandle: 'to'
                }
            ];

            // No result for node '1'
            context.results = {};

            const resolved = resolveNodeInputs(node, edges, context);

            expect(resolved.to).toBe('fallback@example.com');
        });
    });

    describe('Complex Scenarios (Spicy)', () => {
        it('should handle multiple connections to same node', () => {
            const node: WorkflowNode = {
                id: '4',
                type: 'email',
                position: { x: 0, y: 0 },
                data: {
                    provider: 'klaviyo',
                    templateId: 'welcome'
                }
            };

            const edges: WorkflowEdge[] = [
                {
                    id: 'e1',
                    source: '1',
                    target: '4',
                    sourceHandle: 'email',
                    targetHandle: 'to'
                },
                {
                    id: 'e2',
                    source: '2',
                    target: '4',
                    sourceHandle: 'code',
                    targetHandle: 'variables'
                }
            ];

            context.results = {
                '1': {
                    status: 'success',
                    output: { email: 'user@example.com', name: 'Jane' }
                },
                '2': {
                    status: 'success',
                    output: { code: 'WELCOME10', percentage: 10 }
                }
            };

            const resolved = resolveNodeInputs(node, edges, context);

            expect(resolved.to).toBe('user@example.com');
            expect(resolved.variables).toBe('WELCOME10');
            expect(resolved.provider).toBe('klaviyo');
        });

        it('should merge connected inputs with extra data', () => {
            const node: WorkflowNode = {
                id: '2',
                type: 'agent', // Changed to agent which has connectable inputs
                position: { x: 0, y: 0 },
                data: {
                    model: 'gpt-4',
                    customField: 'custom-value',
                    metadata: { source: 'ppc' }
                }
            };

            const edges: WorkflowEdge[] = [
                {
                    id: 'e1',
                    source: '1',
                    target: '2',
                    targetHandle: 'input'
                }
            ];

            context.results = {
                '1': {
                    status: 'success',
                    output: { userId: '123', email: 'test@example.com' }
                }
            };

            const resolved = resolveNodeInputs(node, edges, context);

            expect(resolved.model).toBe('gpt-4');
            expect(resolved.customField).toBe('custom-value');
            expect(resolved.metadata).toEqual({ source: 'ppc' });
            expect(resolved.input).toEqual({ userId: '123', email: 'test@example.com' });
        });

        it('should handle chain of connected nodes', () => {
            // Node 1 -> Node 2 -> Node 3
            const node3: WorkflowNode = {
                id: '3',
                type: 'email',
                position: { x: 0, y: 0 },
                data: {}
            };

            const edges: WorkflowEdge[] = [
                {
                    id: 'e2',
                    source: '2',
                    target: '3',
                    sourceHandle: 'email',
                    targetHandle: 'to'
                }
            ];

            context.results = {
                '1': {
                    status: 'success',
                    output: { name: 'John' }
                },
                '2': {
                    status: 'success',
                    output: {
                        email: 'user@example.com',
                        name: 'John' // Passed through from node 1
                    }
                }
            };

            const resolved = resolveNodeInputs(node3, edges, context);

            expect(resolved.to).toBe('user@example.com');
        });
    });

    describe('Edge Cases', () => {
        it('should handle node with failed connection status', () => {
            const node: WorkflowNode = {
                id: '2',
                type: 'email',
                position: { x: 0, y: 0 },
                data: { to: 'fallback@example.com' }
            };

            const edges: WorkflowEdge[] = [
                {
                    id: 'e1',
                    source: '1',
                    target: '2',
                    targetHandle: 'to'
                }
            ];

            context.results = {
                '1': {
                    status: 'failed',
                    error: 'Something went wrong'
                }
            };

            const resolved = resolveNodeInputs(node, edges, context);

            expect(resolved.to).toBe('fallback@example.com');
        });

        it('should handle missing sourceHandle (uses entire output)', () => {
            const node: WorkflowNode = {
                id: '2',
                type: 'agent', // Changed to agent which has connectable inputs
                position: { x: 0, y: 0 },
                data: {}
            };

            const edges: WorkflowEdge[] = [
                {
                    id: 'e1',
                    source: '1',
                    target: '2',
                    targetHandle: 'input'
                    // No sourceHandle - should use entire output
                }
            ];

            context.results = {
                '1': {
                    status: 'success',
                    output: {
                        userId: '123',
                        email: 'test@example.com',
                        source: 'ppc'
                    }
                }
            };

            const resolved = resolveNodeInputs(node, edges, context);

            expect(resolved.input).toEqual({
                userId: '123',
                email: 'test@example.com',
                source: 'ppc'
            });
        });
    });
});
