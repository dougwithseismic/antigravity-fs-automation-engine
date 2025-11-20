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

describe('NodeWorker - Parallel Execution', () => {
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

        // Mock BullMQ Queue
        mockQueue = {
            add: vi.fn(),
            close: vi.fn()
        };
        vi.doMock('bullmq', () => ({
            Queue: vi.fn(() => mockQueue),
            Worker: vi.fn()
        }));
    });

    const parallelWorkflow = {
        id: 1,
        name: 'Parallel Flow',
        nodes: [
            { id: '1', type: 'start' },
            { id: '2', type: 'process' },
            { id: '3', type: 'branch-a' },
            { id: '4', type: 'branch-b' },
            { id: '5', type: 'merge' }
        ],
        edges: [
            { source: '1', target: '2' },
            { source: '2', target: '3' }, // Branch A
            { source: '2', target: '4' }, // Branch B (Parallel)
            { source: '3', target: '5' },
            { source: '4', target: '5' }
        ]
    };

    it('should enqueue multiple child nodes for parallel execution', async () => {
        // Setup: Node 2 completes, should trigger 3 and 4
        mockDb.query.workflows.findFirst.mockResolvedValue(parallelWorkflow);

        // Current state: Node 2 is running
        mockExecutionState.getState.mockResolvedValue({
            executionId: 1,
            status: 'running',
            completedNodes: ['1'],
            activeNodes: ['2'],
            steps: [], stepsByNodeId: {},
            variables: {}
        });

        // Mock Node 2 execution success
        mockNodeRegistry.get.mockReturnValue({
            execute: vi.fn().mockResolvedValue({
                status: 'completed',
                output: { processed: true }
            })
        });

        nodeWorker = new NodeWorker();

        const job = {
            id: 'exec-1-node-2',
            data: {
                executionId: 1,
                nodeId: '2',
                workflowId: 1,
                input: {},
                attempt: 1
            }
        };

        await nodeWorker.processJob(job as any);

        // Verify: Both Node 3 and Node 4 are enqueued
        expect(mockQueue.add).toHaveBeenCalledTimes(2);
        expect(mockQueue.add).toHaveBeenCalledWith(
            'execute-node',
            expect.objectContaining({ nodeId: '3' }),
            expect.any(Object)
        );
        expect(mockQueue.add).toHaveBeenCalledWith(
            'execute-node',
            expect.objectContaining({ nodeId: '4' }),
            expect.any(Object)
        );
    });

    it('should track multiple active nodes in state', async () => {
        // Setup: Node 3 starts while Node 4 is already running
        mockDb.query.workflows.findFirst.mockResolvedValue(parallelWorkflow);

        // State: Node 2 completed, Node 4 started (active), Node 3 starting
        mockExecutionState.getState.mockResolvedValue({
            executionId: 1,
            status: 'running',
            completedNodes: ['1', '2'],
            activeNodes: ['4'], // Node 4 is already active
            steps: [], stepsByNodeId: {},
            variables: {}
        });

        // Mock Node 3 execution (suspends to keep it active for test)
        mockNodeRegistry.get.mockReturnValue({
            execute: vi.fn().mockResolvedValue({
                status: 'suspended', // Suspend to keep it "active"
                output: {}
            })
        });

        nodeWorker = new NodeWorker();

        const job = {
            id: 'exec-1-node-3',
            data: { executionId: 1, nodeId: '3', workflowId: 1, input: {}, attempt: 1 }
        };

        await nodeWorker.processJob(job as any);

        // Verify: Update state called with BOTH nodes active
        // Note: processJob calls updateState multiple times. 
        // 1. Start: adds '3' -> activeNodes: ['4', '3']
        // 2. Suspend: keeps '3' -> activeNodes: ['4', '3']

        // Check the first update (starting)
        expect(mockExecutionState.updateState).toHaveBeenCalledWith(1,
            expect.objectContaining({
                addActiveNode: '3'
            })
        );
    });

    it('should NOT mark workflow as complete if parallel branches are still running', async () => {
        // Setup: Node 3 completes, but Node 4 is still active
        mockDb.query.workflows.findFirst.mockResolvedValue(parallelWorkflow);

        // Initial state: 1, 2 completed. 4 is active. 3 is about to run.
        mockExecutionState.getState
            .mockResolvedValueOnce({
                executionId: 1,
                status: 'running',
                completedNodes: ['1', '2'], // 3 is NOT completed yet
                activeNodes: ['4'], // 4 is active
                steps: [], stepsByNodeId: {},
                variables: {}
            })
            .mockResolvedValueOnce({
                // State when checking for completion (after 3 finishes)
                executionId: 1,
                status: 'running',
                completedNodes: ['1', '2', '3'],
                activeNodes: ['4'], // 4 is STILL active
                steps: [], stepsByNodeId: {},
                variables: {}
            });

        // Mock Node 3 execution completion
        mockNodeRegistry.get.mockReturnValue({
            execute: vi.fn().mockResolvedValue({
                status: 'completed',
                output: {}
            })
        });

        nodeWorker = new NodeWorker();

        const job = {
            id: 'exec-1-node-3',
            data: { executionId: 1, nodeId: '3', workflowId: 1, input: {}, attempt: 1 }
        };

        await nodeWorker.processJob(job as any);

        // Verify: Workflow is NOT complete because Node 4 is active
        // The last update should be the node completion update, NOT a workflow completion update
        const lastUpdateCall = mockExecutionState.updateState.mock.calls.at(-1);
        const updatePayload = lastUpdateCall[1];

        expect(updatePayload.status).not.toBe('completed');
        expect(updatePayload.removeActiveNode).toBe('3');
    });

    it('should mark workflow as complete when ALL parallel branches finish', async () => {
        // Setup: Node 4 completes, and it was the last active node
        const terminalWorkflow = {
            ...parallelWorkflow,
            edges: [
                { source: '1', target: '2' },
                { source: '2', target: '3' },
                { source: '2', target: '4' }
                // No merge node 5
            ]
        };
        mockDb.query.workflows.findFirst.mockResolvedValue(terminalWorkflow);

        const allCompleted = {
            executionId: 1,
            status: 'running',
            completedNodes: ['1', '2', '3', '4'],
            activeNodes: [],
            steps: [], stepsByNodeId: {},
            variables: {}
        };

        mockExecutionState.getState
            .mockResolvedValueOnce({
                executionId: 1,
                status: 'running',
                completedNodes: ['1', '2', '3'],
                activeNodes: ['4'], // Only 4 is left
                steps: [], stepsByNodeId: {},
                variables: {}
            })
            .mockResolvedValue(allCompleted);

        mockNodeRegistry.get.mockReturnValue({
            execute: vi.fn().mockResolvedValue({
                status: 'completed',
                output: {}
            })
        });

        nodeWorker = new NodeWorker();

        const job = {
            id: 'exec-1-node-4',
            data: { executionId: 1, nodeId: '4', workflowId: 1, input: {}, attempt: 1 }
        };

        await nodeWorker.processJob(job as any);

        // Verify: Workflow IS marked as complete
        const completionCall = mockExecutionState.updateState.mock.calls.find((call: any) =>
            call[1]?.status === 'completed' && call[1]?.activeNodes?.length === 0
        );
        expect(completionCall).toBeDefined();
    });
});
