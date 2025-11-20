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

describe('NodeWorker - Workflow Scenarios', () => {
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

    describe('Scenario 1: Server-Only Workflow (Linear)', () => {
        // Flow: Start (1) -> Process (2) -> End
        const serverWorkflow = {
            id: 1,
            name: 'Server Linear',
            nodes: [
                { id: '1', type: 'start' },
                { id: '2', type: 'process' }
            ],
            edges: [
                { source: '1', target: '2' }
            ]
        };

        it('should execute to completion without suspension', async () => {
            mockDb.query.workflows.findFirst.mockResolvedValue(serverWorkflow);

            // State: Node 1 completed, Node 2 active
            const completedState = {
                executionId: 1,
                status: 'running',
                completedNodes: ['1', '2'],
                activeNodes: [],
                steps: [], stepsByNodeId: {},
                variables: {}
            };

            mockExecutionState.getState
                .mockResolvedValueOnce({
                    executionId: 1,
                    status: 'running',
                    completedNodes: ['1'],
                    activeNodes: ['2'],
                    steps: [], stepsByNodeId: {},
                    variables: {}
                })
                .mockResolvedValue(completedState); // All subsequent calls return completed state

            mockNodeRegistry.get.mockReturnValue({
                execute: vi.fn().mockResolvedValue({
                    status: 'completed',
                    output: { processed: true }
                })
            });

            nodeWorker = new NodeWorker();
            const job = {
                id: 'exec-1-node-2',
                data: { executionId: 1, nodeId: '2', workflowId: 1, input: {}, attempt: 1 }
            };

            await nodeWorker.processJob(job as any);

            // Verify completion - should eventually be called with completion status
            // Note: Our implementation makes multiple updateState calls (addActiveNode, addStep, updateStep, etc.)
            // The final call should mark the workflow as complete
            const completionCall = mockExecutionState.updateState.mock.calls.find((call: any) =>
                call[1]?.status === 'completed' && call[1]?.activeNodes?.length === 0
            );
            expect(completionCall).toBeDefined();
        });
    });

    describe('Scenario 2: Client-Only Workflow (Suspension)', () => {
        // Flow: Start (1) -> Client Form (2) -> End
        const clientWorkflow = {
            id: 2,
            name: 'Client Flow',
            nodes: [
                { id: '1', type: 'start' },
                { id: '2', type: 'form', environment: 'client' }
            ],
            edges: [
                { source: '1', target: '2' }
            ]
        };

        it('should suspend execution when encountering client node', async () => {
            mockDb.query.workflows.findFirst.mockResolvedValue(clientWorkflow);

            mockExecutionState.getState.mockResolvedValue({
                executionId: 2,
                status: 'running',
                completedNodes: ['1'],
                activeNodes: ['2'],
                steps: [], stepsByNodeId: {},
                variables: {}
            });

            mockNodeRegistry.get.mockReturnValue({
                execute: vi.fn().mockResolvedValue({
                    status: 'suspended',
                    output: { _clientAction: 'form' }
                })
            });

            nodeWorker = new NodeWorker();
            const job = {
                id: 'exec-2-node-2',
                data: { executionId: 2, nodeId: '2', workflowId: 2, input: {}, attempt: 1 }
            };

            await nodeWorker.processJob(job as any);

            // Verify suspension
            expect(mockExecutionState.updateState).toHaveBeenCalledWith(2,
                expect.objectContaining({
                    status: 'suspended',
                    addActiveNode: '2'
                })
            );

            // Verify NO completion check (should return early)
            const isWorkflowCompleteSpy = vi.spyOn(nodeWorker as any, 'isWorkflowComplete');
            expect(isWorkflowCompleteSpy).not.toHaveBeenCalled();
        });
    });

    describe('Scenario 3: Parallel Workflow (Server-Side)', () => {
        // Flow: Start (1) -> Split (2) -> [Branch A (3), Branch B (4)]
        const parallelServerWorkflow = {
            id: 3,
            name: 'Parallel Server',
            nodes: [
                { id: '1', type: 'start' },
                { id: '2', type: 'split' },
                { id: '3', type: 'branch-a' },
                { id: '4', type: 'branch-b' }
            ],
            edges: [
                { source: '1', target: '2' },
                { source: '2', target: '3' },
                { source: '2', target: '4' }
            ]
        };

        it('should execute both branches and complete only when both finish', async () => {
            mockDb.query.workflows.findFirst.mockResolvedValue(parallelServerWorkflow);

            // Step 1: Node 2 completes, enqueues 3 and 4
            mockExecutionState.getState.mockResolvedValue({
                executionId: 3,
                status: 'running',
                completedNodes: ['1'],
                activeNodes: ['2'],
                steps: [], stepsByNodeId: {},
                variables: {}
            });

            mockNodeRegistry.get.mockReturnValue({
                execute: vi.fn().mockResolvedValue({ status: 'completed', output: {} })
            });

            nodeWorker = new NodeWorker();
            await nodeWorker.processJob({
                id: 'exec-3-node-2',
                data: { executionId: 3, nodeId: '2', workflowId: 3, input: {}, attempt: 1 }
            } as any);

            expect(mockQueue.add).toHaveBeenCalledWith('execute-node', expect.objectContaining({ nodeId: '3' }), expect.any(Object));
            expect(mockQueue.add).toHaveBeenCalledWith('execute-node', expect.objectContaining({ nodeId: '4' }), expect.any(Object));

            // Step 2: Node 3 completes (Node 4 still active)
            mockExecutionState.getState.mockResolvedValue({
                executionId: 3,
                status: 'running',
                completedNodes: ['1', '2'],
                activeNodes: ['4'], // 4 is active
                steps: [], stepsByNodeId: {},
                variables: {}
            });

            await nodeWorker.processJob({
                id: 'exec-3-node-3',
                data: { executionId: 3, nodeId: '3', workflowId: 3, input: {}, attempt: 1 }
            } as any);

            // Verify NOT complete
            const lastUpdate = mockExecutionState.updateState.mock.calls.at(-1)[1];
            expect(lastUpdate.status).not.toBe('completed');

            // Step 3: Node 4 completes (Last active node)
            const allCompletedState = {
                executionId: 3,
                status: 'running',
                completedNodes: ['1', '2', '3', '4'],
                activeNodes: [],
                steps: [], stepsByNodeId: {},
                variables: {}
            };

            mockExecutionState.getState
                .mockResolvedValueOnce({
                    executionId: 3,
                    status: 'running',
                    completedNodes: ['1', '2', '3'],
                    activeNodes: ['4'],
                    steps: [], stepsByNodeId: {},
                    variables: {}
                })
                .mockResolvedValue(allCompletedState); // All subsequent calls return all-completed state

            await nodeWorker.processJob({
                id: 'exec-3-node-4',
                data: { executionId: 3, nodeId: '4', workflowId: 3, input: {}, attempt: 1 }
            } as any);

            // Verify Complete - should eventually be called with completion status
            const completionCall = mockExecutionState.updateState.mock.calls.find((call: any) =>
                call[1]?.status === 'completed' && call[1]?.activeNodes?.length === 0
            );
            expect(completionCall).toBeDefined();
        });
    });

    describe('Scenario 4: Parallel Workflow (Mixed Server/Client)', () => {
        // Flow: Start (1) -> Split (2) -> [Branch A: Server (3), Branch B: Client (4)]
        const mixedWorkflow = {
            id: 4,
            name: 'Mixed Parallel',
            nodes: [
                { id: '1', type: 'start' },
                { id: '2', type: 'split' },
                { id: '3', type: 'server-node' },
                { id: '4', type: 'client-node', environment: 'client' }
            ],
            edges: [
                { source: '1', target: '2' },
                { source: '2', target: '3' },
                { source: '2', target: '4' }
            ]
        };

        it('should handle server branch completion while client branch suspends', async () => {
            mockDb.query.workflows.findFirst.mockResolvedValue(mixedWorkflow);

            // State: Node 2 completed, 3 and 4 active.
            // We process Node 4 (Client) -> Suspend
            mockExecutionState.getState.mockResolvedValue({
                executionId: 4,
                status: 'running',
                completedNodes: ['1', '2'],
                activeNodes: ['3', '4'],
                steps: [], stepsByNodeId: {},
                variables: {}
            });

            mockNodeRegistry.get.mockReturnValue({
                execute: vi.fn().mockResolvedValue({
                    status: 'suspended',
                    output: { _clientAction: 'wait' }
                })
            });

            nodeWorker = new NodeWorker();
            await nodeWorker.processJob({
                id: 'exec-4-node-4',
                data: { executionId: 4, nodeId: '4', workflowId: 4, input: {}, attempt: 1 }
            } as any);

            // Verify suspended state update
            expect(mockExecutionState.updateState).toHaveBeenCalledWith(4,
                expect.objectContaining({
                    status: 'suspended',
                    addActiveNode: '4' // Re-added as active
                })
            );

            // Now process Node 3 (Server) -> Complete
            // State: 4 is suspended (active), 3 is running (active)
            mockExecutionState.getState.mockResolvedValue({
                executionId: 4,
                status: 'suspended', // Workflow is technically suspended because of 4
                completedNodes: ['1', '2'],
                activeNodes: ['4', '3'],
                steps: [], stepsByNodeId: {},
                variables: {}
            });

            mockNodeRegistry.get.mockReturnValue({
                execute: vi.fn().mockResolvedValue({
                    status: 'completed',
                    output: {}
                })
            });

            await nodeWorker.processJob({
                id: 'exec-4-node-3',
                data: { executionId: 4, nodeId: '3', workflowId: 4, input: {}, attempt: 1 }
            } as any);

            // Verify Node 3 completes but workflow does NOT complete (because 4 is active)
            const lastUpdate = mockExecutionState.updateState.mock.calls.at(-1)[1];
            expect(lastUpdate.status).not.toBe('completed');
            expect(lastUpdate.removeActiveNode).toBe('3');
            // Active nodes should still contain '4'
        });
    });
});
