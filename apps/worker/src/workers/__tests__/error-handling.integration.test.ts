import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NodeWorker } from '../node-worker';

// Mock dependencies
vi.mock('../../config/redis', () => ({
    redisConnection: {}
}));

vi.mock('@repo/database', () => ({
    db: {
        query: {
            workflows: {
                findFirst: vi.fn()
            }
        }
    }
}));

vi.mock('../../services/execution-state', () => ({
    executionStateService: {
        getState: vi.fn(),
        updateState: vi.fn(),
        persistState: vi.fn(),
        initState: vi.fn()
    }
}));

vi.mock('../../registry/node-registry', () => ({
    nodeRegistry: {
        get: vi.fn()
    }
}));

describe('Error Handling Integration', () => {
    let nodeWorker: NodeWorker;
    let mockDb: any;
    let mockExecutionState: any;
    let mockNodeRegistry: any;
    let mockQueue: any;

    beforeEach(async () => {
        vi.clearAllMocks();

        const { db } = await import('@repo/database');
        const { executionStateService } = await import('../../services/execution-state.js');
        const { nodeRegistry } = await import('../../registry/node-registry.js');

        mockDb = db;
        mockExecutionState = executionStateService;
        mockNodeRegistry = nodeRegistry;

        mockQueue = {
            add: vi.fn(),
            close: vi.fn()
        };
        vi.doMock('bullmq', () => ({
            Queue: vi.fn(() => mockQueue),
            Worker: vi.fn()
        }));
    });

    it('should fail immediately for unknown node type', async () => {
        const workflow = {
            id: 1,
            nodes: [{ id: '1', type: 'unknown-type' }],
            edges: []
        };

        mockDb.query.workflows.findFirst.mockResolvedValue(workflow);
        mockExecutionState.getState.mockResolvedValue({
            executionId: 1,
            status: 'running',
            completedNodes: [],
            activeNodes: ['1'],
            steps: [], stepsByNodeId: {},
            variables: {}
        });

        // Mock registry to return undefined for unknown type
        mockNodeRegistry.get.mockReturnValue(undefined);

        nodeWorker = new NodeWorker();

        // We expect the worker to NOT throw, but to handle the error internally
        // and update the state to failed.
        await nodeWorker.processJob({
            id: 'job-1',
            data: { executionId: 1, nodeId: '1', workflowId: 1, input: {}, attempt: 1 }
        } as any);

        // Verify state update: should be marked as failed immediately
        expect(mockExecutionState.updateState).toHaveBeenCalledWith(1,
            expect.objectContaining({
                status: 'failed',
                removeActiveNode: '1',
                updateStep: expect.objectContaining({
                    nodeId: '1',
                    updates: expect.objectContaining({
                        status: 'failed',
                        error: expect.objectContaining({
                            message: expect.stringContaining('Unknown node type')
                        })
                    })
                })
            })
        );
    });

    it('should handle node execution failure with retries', async () => {
        const workflow = {
            id: 1,
            nodes: [{ id: '1', type: 'flaky-node' }],
            edges: []
        };

        mockDb.query.workflows.findFirst.mockResolvedValue(workflow);
        mockExecutionState.getState.mockResolvedValue({
            executionId: 1,
            status: 'running',
            completedNodes: [],
            activeNodes: ['1'],
            steps: [], stepsByNodeId: {},
            variables: {}
        });

        mockNodeRegistry.get.mockReturnValue({
            execute: vi.fn().mockRejectedValue(new Error('Random failure'))
        });

        nodeWorker = new NodeWorker();

        // Attempt 1: Should throw to trigger BullMQ retry
        await expect(nodeWorker.processJob({
            id: 'job-1',
            data: { executionId: 1, nodeId: '1', workflowId: 1, input: {}, attempt: 1 }
        } as any)).rejects.toThrow('Random failure');

        // Verify state update: should record error but keep retrying (not failed status yet)
        expect(mockExecutionState.updateState).toHaveBeenCalledWith(1,
            expect.objectContaining({
                updateStep: expect.objectContaining({
                    nodeId: '1',
                    updates: expect.objectContaining({
                        error: expect.objectContaining({
                            message: expect.stringContaining('Random failure'),
                            retrying: true
                        })
                    })
                })
            })
        );
    });

    it('should mark as failed after max retries', async () => {
        const workflow = {
            id: 1,
            nodes: [{ id: '1', type: 'flaky-node' }],
            edges: []
        };

        mockDb.query.workflows.findFirst.mockResolvedValue(workflow);
        mockExecutionState.getState.mockResolvedValue({
            executionId: 1,
            status: 'running',
            completedNodes: [],
            activeNodes: ['1'],
            steps: [], stepsByNodeId: {},
            variables: {}
        });

        mockNodeRegistry.get.mockReturnValue({
            execute: vi.fn().mockRejectedValue(new Error('Persistent failure'))
        });

        nodeWorker = new NodeWorker();

        // Attempt 3 (Max): Should NOT throw, but mark as failed
        await nodeWorker.processJob({
            id: 'job-1',
            data: { executionId: 1, nodeId: '1', workflowId: 1, input: {}, attempt: 3 }
        } as any);

        // Verify state update: should be marked as failed
        expect(mockExecutionState.updateState).toHaveBeenCalledWith(1,
            expect.objectContaining({
                status: 'failed',
                removeActiveNode: '1',
                updateStep: expect.objectContaining({
                    nodeId: '1',
                    updates: expect.objectContaining({
                        status: 'failed',
                        error: expect.objectContaining({
                            message: expect.stringContaining('Persistent failure')
                        })
                    })
                })
            })
        );
    });
});
