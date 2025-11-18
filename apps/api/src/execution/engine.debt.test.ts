import { describe, it, expect, vi, beforeEach } from 'vitest';
import { executeWorkflow, cancelExecution, resumeExecution } from './engine';
import { db, executions, executionSteps } from '@repo/database';
import { getNodeExecutor } from './nodes';

// Mock dependencies
vi.mock('@repo/database', () => ({
    db: {
        insert: vi.fn(() => ({
            values: vi.fn(() => ({
                returning: vi.fn().mockResolvedValue([{ id: 123, status: 'running' }])
            }))
        })),
        update: vi.fn(() => ({
            set: vi.fn(() => ({
                where: vi.fn().mockResolvedValue([])
            }))
        })),
        query: {
            executions: {
                findFirst: vi.fn()
            },
            executionSteps: {
                findFirst: vi.fn()
            },
            workflows: {
                findFirst: vi.fn()
            }
        }
    },
    executions: { id: 'executions_id' },
    executionSteps: { executionId: 'es_execution_id', nodeId: 'es_node_id', status: 'es_status' },
    eq: vi.fn()
}));

vi.mock('./nodes', () => ({
    getNodeExecutor: vi.fn()
}));

vi.mock('../validation/validator', () => ({
    validateWorkflow: vi.fn().mockReturnValue([])
}));

describe('Engine Technical Debt', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should cancel a running execution', async () => {
        // Setup a long running node
        const mockNode = { id: 'node1', type: 'long-running', data: {} };
        const mockWorkflow = {
            id: 1,
            name: 'Test Workflow',
            nodes: [mockNode],
            edges: []
        };

        vi.mocked(db.query.workflows.findFirst).mockResolvedValue(mockWorkflow as any);

        // Mock executor that waits
        vi.mocked(getNodeExecutor).mockReturnValue({
            execute: async ({ signal }) => {
                return new Promise((resolve, reject) => {
                    const interval = setInterval(() => {
                        if (signal?.aborted) {
                            clearInterval(interval);
                            reject(new Error('Aborted'));
                        }
                    }, 10);
                });
            }
        });

        // Start execution
        const executionPromise = executeWorkflow(1, {});

        // Wait a bit then cancel
        await new Promise(resolve => setTimeout(resolve, 50));
        const cancelled = cancelExecution(123);
        expect(cancelled).toBe(true);

        // Expect execution to fail with cancellation error
        const result = await executionPromise;
        expect(result.status).toBe('failed');
        expect(result.error).toBe('Execution cancelled');
    });

    it('should merge results on completion', async () => {
        const mockWorkflow = {
            id: 1,
            name: 'Test Workflow',
            nodes: [{ id: 'node1', type: 'start' }],
            edges: []
        };

        vi.mocked(db.query.workflows.findFirst).mockResolvedValue(mockWorkflow as any);

        // Mock existing data
        vi.mocked(db.query.executions.findFirst).mockResolvedValue({
            id: 123,
            data: { 'previous-node': { status: 'success', output: { foo: 'bar' } } }
        } as any);

        vi.mocked(getNodeExecutor).mockReturnValue({
            execute: async () => ({ status: 'success', output: { new: 'data' } })
        });

        const result = await executeWorkflow(1, {});

        expect(result.status).toBe('completed');
        expect(result.results).toHaveProperty('previous-node');
        expect(result.results).toHaveProperty('node1');
    });
});
