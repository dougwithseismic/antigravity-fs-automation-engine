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

vi.mock('../../services/execution-state.js', () => ({
    executionStateService: {
        getState: vi.fn(),
        updateState: vi.fn(),
        persistState: vi.fn(),
        initState: vi.fn()
    }
}));

vi.mock('../../registry/node-registry.js', () => ({
    nodeRegistry: {
        get: vi.fn()
    }
}));

describe('Workflow Reproduction - Parallel Completion', () => {
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

    it('should complete workflow when parallel branches finish after resume', async () => {
        // Workflow: Start(1) -> Suspend(2) -> Split(3) -> [Branch A(4), Branch B(5)]
        const workflow = {
            id: 10,
            nodes: [
                { id: '1', type: 'start' },
                { id: '2', type: 'suspend' },
                { id: '3', type: 'split' },
                { id: '4', type: 'branch-a' },
                { id: '5', type: 'branch-b' }
            ],
            edges: [
                { source: '1', target: '2' },
                { source: '2', target: '3' },
                { source: '3', target: '4' },
                { source: '3', target: '5' }
            ]
        };

        mockDb.query.workflows.findFirst.mockResolvedValue(workflow);

        // Simulate state after resume: Node 2 completed, Node 3 enqueued
        // Node 3 executes and enqueues 4 and 5

        // We test the final step: Node 5 completing while Node 4 is already done.
        // And ensuring Node 2 (suspended) is NOT in activeNodes.

        mockExecutionState.getState
            .mockResolvedValueOnce({
                executionId: 10,
                status: 'running',
                completedNodes: ['1', '2', '3', '4'], // 4 is done
                activeNodes: ['5'], // 5 is active
                stepResults: {
                    '2': { _resumedAt: 'timestamp' }
                },
                variables: {}
            })
            .mockResolvedValueOnce({
                // State check for _resumedAt
                executionId: 10,
                status: 'running',
                completedNodes: ['1', '2', '3', '4'],
                activeNodes: ['5'],
                stepResults: {
                    '2': { _resumedAt: 'timestamp' }
                },
                variables: {}
            })
            .mockResolvedValueOnce({
                // State check inside isWorkflowComplete
                executionId: 10,
                status: 'running',
                completedNodes: ['1', '2', '3', '4', '5'],
                activeNodes: [],
                stepResults: {
                    '2': { _resumedAt: 'timestamp' }
                },
                variables: {}
            });

        mockNodeRegistry.get.mockReturnValue({
            execute: vi.fn().mockResolvedValue({
                status: 'completed',
                output: {}
            })
        });

        nodeWorker = new NodeWorker();
        await nodeWorker.processJob({
            id: 'exec-10-node-5',
            data: { executionId: 10, nodeId: '5', workflowId: 10, input: {}, attempt: 1 }
        } as any);

        // Verify completion - should eventually be called with completion status
        const completionCall = mockExecutionState.updateState.mock.calls.find((call: any) =>
            call[1]?.status === 'completed' && call[1]?.activeNodes?.length === 0
        );
        expect(completionCall).toBeDefined();
    });
});
