import { describe, it, expect, vi, beforeEach } from 'vitest';
import { executeWorkflow, resumeExecution } from './engine';
import { nodeRegistry } from './nodes';

// Mock database
const { mockDb } = vi.hoisted(() => {
    return {
        mockDb: {
            insert: vi.fn().mockReturnThis(),
            values: vi.fn().mockReturnThis(),
            returning: vi.fn(),
            query: {
                workflows: {
                    findFirst: vi.fn(),
                },
                executions: {
                    findFirst: vi.fn(),
                },
                executionSteps: {
                    findFirst: vi.fn(),
                }
            },
            update: vi.fn().mockReturnThis(),
            set: vi.fn().mockReturnThis(),
            where: vi.fn().mockReturnThis(),
        }
    };
});

vi.mock('@repo/database', () => ({
    db: mockDb,
    executions: { id: 'executions.id' },
    executionSteps: { executionId: 'executionSteps.executionId', nodeId: 'executionSteps.nodeId' },
    eq: vi.fn(),
}));

describe('Execution Engine', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should execute a simple linear workflow', async () => {
        // Setup mock workflow
        const workflow = {
            id: 1,
            name: 'Test Workflow',
            nodes: [
                { id: '1', type: 'scifi', data: { label: 'Start' } },
                { id: '2', type: 'scifi', data: { label: 'Console Log' } }
            ],
            edges: [
                { source: '1', target: '2' }
            ]
        };

        // Mock DB responses
        mockDb.insert().values().returning.mockResolvedValueOnce([{ id: 100 }]); // Create execution
        mockDb.query.workflows.findFirst.mockResolvedValue(workflow);
        mockDb.query.executionSteps.findFirst.mockResolvedValue(null); // No existing steps

        // Execute
        const result = await executeWorkflow(1, {});

        // Verify
        expect(result.status).toBe('completed');
        expect(result.results?.['1']?.status).toBe('success');
        expect(result.results?.['2']?.status).toBe('success');

        // Verify persistence calls
        expect(mockDb.insert).toHaveBeenCalledWith(expect.objectContaining({ id: 'executions.id' })); // Create execution
        // Should have inserted steps for node 1 and 2
        // Note: We can't easily check exact call count for insert/update without more complex mocking of the chain
        // but we can check that it completed.
    });

    it('should suspend execution when a node returns suspended status', async () => {
        // Setup mock workflow with a node that suspends
        const workflow = {
            id: 1,
            name: 'Suspended Workflow',
            nodes: [
                { id: '1', type: 'scifi', data: { label: 'Start' } },
                { id: '2', type: 'human-approval', data: { label: 'Approval' } } // We will mock this executor
            ],
            edges: [
                { source: '1', target: '2' }
            ]
        };

        // Mock the human-approval node executor as a class
        const executeMock = vi.fn().mockResolvedValue({ status: 'suspended' });
        class MockHumanApprovalExecutor {
            execute = executeMock;
        }
        // @ts-ignore
        nodeRegistry['human-approval'] = MockHumanApprovalExecutor;

        mockDb.insert().values().returning.mockResolvedValueOnce([{ id: 101 }]);
        mockDb.query.workflows.findFirst.mockResolvedValue(workflow);
        mockDb.query.executionSteps.findFirst.mockResolvedValue(null);

        const result = await executeWorkflow(1, {});

        expect(result.status).toBe('waiting');
        expect(result.results?.['2']?.status).toBe('suspended');
    });

    it('should suspend execution and return nextStep when encountering a client node', async () => {
        const workflow = {
            id: 1,
            name: 'Hybrid Workflow',
            nodes: [
                { id: '1', type: 'scifi', data: { label: 'Start' } },
                { id: '2', type: 'scifi', data: { label: 'Client Action' }, environment: 'client' }
            ],
            edges: [
                { source: '1', target: '2' }
            ]
        };

        mockDb.insert().values().returning.mockResolvedValueOnce([{ id: 102 }]);
        mockDb.query.workflows.findFirst.mockResolvedValue(workflow);
        mockDb.query.executionSteps.findFirst.mockResolvedValue(null);

        const result = await executeWorkflow(1, {});

        expect(result.status).toBe('waiting');
        expect(result.results?.['1']?.status).toBe('success');
        expect(result.nextStep).toBeDefined();
        expect(result.nextStep?.nodeId).toBe('2');
        expect(result.nextStep?.type).toBe('scifi');
    });

    it('should skip execution if step is already completed (idempotency)', async () => {
        const workflow = {
            id: 1,
            name: 'Idempotent Workflow',
            nodes: [
                { id: '1', type: 'scifi', data: { label: 'Start' } },
                { id: '2', type: 'scifi', data: { label: 'Console Log' } }
            ],
            edges: [
                { source: '1', target: '2' }
            ]
        };

        mockDb.insert().values().returning.mockResolvedValueOnce([{ id: 103 }]);
        mockDb.query.workflows.findFirst.mockResolvedValue(workflow);

        // Mock that node 1 is already completed
        mockDb.query.executionSteps.findFirst
            .mockResolvedValueOnce({ status: 'completed', output: { skipped: true } }) // Node 1 found
            .mockResolvedValueOnce(null); // Node 2 not found

        const result = await executeWorkflow(1, {});

        expect(result.status).toBe('completed');
        expect(result.results?.['1']?.status).toBe('success');
        expect(result.results?.['1']?.output).toEqual({ skipped: true }); // Should use stored output
        expect(result.results?.['2']?.status).toBe('success');
    });

    it('should pass AbortSignal to node executor', async () => {
        const workflow = {
            id: 1,
            name: 'Abortable Workflow',
            nodes: [
                { id: '1', type: 'abortable', data: { label: 'Abortable' } }
            ],
            edges: []
        };

        mockDb.insert().values().returning.mockResolvedValueOnce([{ id: 104 }]);
        mockDb.query.workflows.findFirst.mockResolvedValue(workflow);
        mockDb.query.executionSteps.findFirst.mockResolvedValue(null);

        const executeMock = vi.fn().mockImplementation(({ node, input, context, signal }) => {
            return Promise.resolve({ status: 'success', output: { signalReceived: !!signal } });
        });

        class MockAbortableExecutor {
            execute = executeMock;
        }
        // @ts-ignore
        nodeRegistry['abortable'] = MockAbortableExecutor;

        const result = await executeWorkflow(1, {});

        expect(result.status).toBe('completed');
        expect(executeMock).toHaveBeenCalledWith(
            expect.objectContaining({
                signal: expect.any(AbortSignal)
            })
        );
    });
});
