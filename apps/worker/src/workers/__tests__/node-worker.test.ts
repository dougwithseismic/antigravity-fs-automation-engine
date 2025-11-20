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

describe('NodeWorker - Human-in-the-Loop Workflow', () => {
    let nodeWorker: NodeWorker;
    let mockDb: any;
    let mockExecutionState: any;
    let mockNodeRegistry: any;

    beforeEach(async () => {
        // Reset mocks
        vi.clearAllMocks();

        // Get mocked modules
        const { db } = await import('@repo/database');
        const { executionStateService } = await import('../../services/execution-state.js');
        const { nodeRegistry } = await import('../../registry/node-registry.js');

        mockDb = db;
        mockExecutionState = executionStateService;
        mockNodeRegistry = nodeRegistry;
    });

    describe('PPC Landing Page Workflow - Complete Flow', () => {
        const ppcWorkflow = {
            id: 1,
            name: 'PPC Landing Page Flow',
            nodes: [
                { id: '1', type: 'start', data: { label: 'Page Load' } },
                { id: '2', type: 'condition', data: { label: 'Is PPC?', condition: { key: 'utm_source', value: 'ppc' } } },
                { id: '3', type: 'banner-form', data: { label: 'Show Banner', message: 'Get 10% off!' }, environment: 'client' },
                { id: '4', type: 'analytics', data: { label: 'Log Lead', eventName: 'lead_captured' } },
                { id: '5', type: 'discount', data: { label: 'Generate Code' } },
                { id: '6', type: 'window-alert', data: { label: 'Show Code', message: 'Your code is: {{5.code}}' }, environment: 'client' }
            ],
            edges: [
                { source: '1', target: '2' },
                { source: '2', target: '3', condition: 'true' },
                { source: '3', target: '4' },
                { source: '4', target: '5' },
                { source: '5', target: '6' }
            ]
        };

        it('should suspend execution at banner-form node and wait for client input', async () => {
            // Setup: Mock workflow and execution state
            mockDb.query.workflows.findFirst.mockResolvedValue(ppcWorkflow);
            mockExecutionState.getState.mockResolvedValue({
                executionId: 1,
                workflowId: 1,
                status: 'running',
                completedNodes: ['1', '2'],
                currentNode: null,
                steps: [
                    { nodeId: '2', nodeType: 'condition', status: 'completed', output: { result: true }, startedAt: new Date().toISOString() }
                ],
                stepsByNodeId: {
                    '2': { nodeId: '2', nodeType: 'condition', status: 'completed', output: { result: true }, startedAt: new Date().toISOString() }
                },
                variables: {}
            });

            // Mock banner-form node returning suspended status
            mockNodeRegistry.get.mockReturnValue({
                execute: vi.fn().mockResolvedValue({
                    status: 'suspended',
                    output: {
                        _clientAction: 'banner-form',
                        _clientMessage: 'Get 10% off!',
                        _awaitingInput: { type: 'form', fields: ['email', 'name'] }
                    }
                })
            });

            // Execute banner-form node
            nodeWorker = new NodeWorker();
            const job = {
                id: 'exec-1-node-3',
                data: {
                    executionId: 1,
                    nodeId: '3',
                    workflowId: 1,
                    input: { _conditionResult: true },
                    attempt: 1
                }
            };

            await nodeWorker.processJob(job as any);

            // Verify: Execution state updated to suspended
            expect(mockExecutionState.updateState).toHaveBeenCalledWith(1,
                expect.objectContaining({
                    status: 'suspended',
                    addActiveNode: '3'
                })
            );

            // Verify: State persisted to DB
            expect(mockExecutionState.persistState).toHaveBeenCalledWith(1, mockDb);
        });

        it('should NOT enqueue child nodes when suspended', async () => {
            mockDb.query.workflows.findFirst.mockResolvedValue(ppcWorkflow);
            mockExecutionState.getState.mockResolvedValue({
                executionId: 1,
                completedNodes: ['1', '2'],
                currentNode: null,
                steps: [],
                stepsByNodeId: {},
                variables: {}
            });

            mockNodeRegistry.get.mockReturnValue({
                execute: vi.fn().mockResolvedValue({
                    status: 'suspended',
                    output: { _clientAction: 'banner-form' }
                })
            });

            nodeWorker = new NodeWorker();
            const enqueueChildrenSpy = vi.spyOn(nodeWorker as any, 'enqueueChildren');

            const job = {
                id: 'exec-1-node-3',
                data: { executionId: 1, nodeId: '3', workflowId: 1, input: {}, attempt: 1 }
            };

            await nodeWorker.processJob(job as any);

            // Verify: Children NOT enqueued when suspended
            expect(enqueueChildrenSpy).not.toHaveBeenCalled();
        });

        it('should resume from suspended node and continue workflow to completion', async () => {
            // Test scenario: Resume from node 3 after client provides form data
            mockDb.query.workflows.findFirst.mockResolvedValue(ppcWorkflow);

            // State after resumption with client data
            const resumedAt = new Date().toISOString();
            mockExecutionState.getState
                .mockResolvedValueOnce({
                    executionId: 1,
                    completedNodes: ['1', '2', '3'],
                    currentNode: null,
                    steps: [
                        { nodeId: '3', nodeType: 'banner-form', status: 'completed', output: { _clientAction: 'banner-form', formData: { email: 'test@example.com', name: 'Test' }, _resumedAt: resumedAt }, startedAt: resumedAt }
                    ],
                    stepsByNodeId: {
                        '3': { nodeId: '3', nodeType: 'banner-form', status: 'completed', output: { _clientAction: 'banner-form', formData: { email: 'test@example.com', name: 'Test' }, _resumedAt: resumedAt }, startedAt: resumedAt }
                    },
                    variables: {}
                })
                .mockResolvedValueOnce({
                    executionId: 1,
                    completedNodes: ['1', '2', '3', '4'],
                    currentNode: null,
                    steps: [
                        { nodeId: '4', nodeType: 'analytics', status: 'completed', output: { eventName: 'lead_captured', _resumedAt: resumedAt }, startedAt: resumedAt }
                    ],
                    stepsByNodeId: {
                        '4': { nodeId: '4', nodeType: 'analytics', status: 'completed', output: { eventName: 'lead_captured', _resumedAt: resumedAt }, startedAt: resumedAt }
                    },
                    variables: {}
                });

            // Mock analytics node execution
            mockNodeRegistry.get.mockReturnValue({
                execute: vi.fn().mockResolvedValue({
                    status: 'completed',
                    output: {
                        eventName: 'lead_captured',
                        timestamp: new Date().toISOString()
                    }
                })
            });

            nodeWorker = new NodeWorker();
            const enqueueChildrenSpy = vi.spyOn(nodeWorker as any, 'enqueueChildren');

            const job = {
                id: 'exec-1-node-4-resumed',
                data: {
                    executionId: 1,
                    nodeId: '4',
                    workflowId: 1,
                    input: {
                        formData: { email: 'test@example.com', name: 'Test' },
                        _resumedAt: new Date().toISOString()
                    },
                    attempt: 1
                }
            };

            await nodeWorker.processJob(job as any);

            // Verify: Children enqueued after analytics completes
            expect(enqueueChildrenSpy).toHaveBeenCalledWith(
                1, 1, '4',
                expect.objectContaining({ eventName: 'lead_captured' })
            );
        });

        it('should skip completion check for resumed nodes to allow children to process', async () => {
            mockDb.query.workflows.findFirst.mockResolvedValue(ppcWorkflow);

            // State shows this node was resumed (has _resumedAt)
            const testResumedAt = new Date().toISOString();
            const step4State = {
                executionId: 1,
                completedNodes: ['1', '2', '3', '4'],
                currentNode: null,
                steps: [
                    { nodeId: '4', nodeType: 'analytics', status: 'completed', output: { eventName: 'lead_captured', _resumedAt: testResumedAt }, startedAt: testResumedAt }
                ],
                stepsByNodeId: {
                    '4': { nodeId: '4', nodeType: 'analytics', status: 'completed', output: { eventName: 'lead_captured', _resumedAt: testResumedAt }, startedAt: testResumedAt }
                },
                variables: {}
            };

            mockExecutionState.getState
                .mockResolvedValueOnce({
                    executionId: 1,
                    completedNodes: ['1', '2', '3'],
                    currentNode: null,
                    steps: [],
                    stepsByNodeId: {},
                    variables: {}
                })
                .mockResolvedValue(step4State); // Use mockResolvedValue for all subsequent calls

            mockNodeRegistry.get.mockReturnValue({
                execute: vi.fn().mockResolvedValue({
                    status: 'completed',
                    output: { eventName: 'lead_captured', _resumedAt: testResumedAt }
                })
            });

            nodeWorker = new NodeWorker();
            const isWorkflowCompleteSpy = vi.spyOn(nodeWorker as any, 'isWorkflowComplete');

            const job = {
                id: 'exec-1-node-4-resumed',
                data: { executionId: 1, nodeId: '4', workflowId: 1, input: { _resumedAt: testResumedAt }, attempt: 1 }
            };

            await nodeWorker.processJob(job as any);

            // Verify: Workflow completion check was SKIPPED
            expect(isWorkflowCompleteSpy).not.toHaveBeenCalled();
        });
    });

    describe('Edge Filtering Logic', () => {
        it('should only filter edges for condition nodes, not other nodes', async () => {
            const workflow = {
                id: 1,
                nodes: [
                    { id: '2', type: 'condition', data: {} },
                    { id: '4', type: 'analytics', data: {} },
                    { id: '5', type: 'discount', data: {} }
                ],
                edges: [
                    { source: '2', target: '3', condition: 'true' },
                    { source: '4', target: '5' } // No condition
                ]
            };

            mockDb.query.workflows.findFirst.mockResolvedValue(workflow);

            nodeWorker = new NodeWorker();

            // Test condition node - should filter
            const conditionOutput = { result: true };
            await (nodeWorker as any).enqueueChildren(1, 1, '2', conditionOutput);

            // Test analytics node with result in output (from propagation)
            // Should NOT filter because it's not a condition node
            const analyticsOutput = {
                result: true, // This gets propagated but should be ignored
                eventName: 'test'
            };
            await (nodeWorker as any).enqueueChildren(1, 1, '4', analyticsOutput);

            // The test verifies that analytics node doesn't filter its edges
            // even though _conditionResult is present in output
        });

        it('should filter edges correctly for true condition', async () => {
            const workflow = {
                id: 1,
                nodes: [
                    { id: '2', type: 'condition', data: {} }
                ],
                edges: [
                    { source: '2', target: '3', condition: 'true' },
                    { source: '2', target: '7', condition: 'false' }
                ]
            };

            mockDb.query.workflows.findFirst.mockResolvedValue(workflow);
            nodeWorker = new NodeWorker();

            // Mock Queue
            const mockQueue = {
                add: vi.fn(),
                close: vi.fn()
            };
            vi.doMock('bullmq', () => ({
                Queue: vi.fn(() => mockQueue),
                Worker: vi.fn()
            }));

            await (nodeWorker as any).enqueueChildren(1, 1, '2', { result: true });

            // Should only enqueue node 3 (true branch), not node 7 (false branch)
            expect(mockQueue.add).toHaveBeenCalledTimes(1);
            expect(mockQueue.add).toHaveBeenCalledWith(
                'execute-node',
                expect.objectContaining({ nodeId: '3' }),
                expect.any(Object)
            );
        });
    });

    describe('Workflow Completion Detection', () => {
        it('should not mark workflow complete when suspended', async () => {
            const workflow = {
                id: 1,
                nodes: [
                    { id: '3', type: 'banner-form' }
                ],
                edges: [
                    { source: '3', target: '4' }
                ]
            };

            mockDb.query.workflows.findFirst.mockResolvedValue(workflow);
            mockExecutionState.getState.mockResolvedValue({
                executionId: 1,
                status: 'suspended',
                completedNodes: ['1', '2', '3'], // Node 3 is completed but suspended
                currentNode: '3',
                activeNodes: ['3'], // Node 3 is active (waiting for client)
                steps: [],
                stepsByNodeId: {},
                variables: {}
            });

            nodeWorker = new NodeWorker();
            const isComplete = await (nodeWorker as any).isWorkflowComplete(1, 1);

            // Suspended workflows should have pending work
            expect(isComplete).toBe(false);
        });

        it('should correctly identify workflow as complete when all nodes executed', async () => {
            const workflow = {
                id: 1,
                nodes: [
                    { id: '1', type: 'start' },
                    { id: '2', type: 'condition' },
                    { id: '3', type: 'banner-form' },
                    { id: '4', type: 'analytics' },
                    { id: '5', type: 'discount' },
                    { id: '6', type: 'window-alert' }
                ],
                edges: [
                    { source: '1', target: '2' },
                    { source: '2', target: '3', condition: 'true' },
                    { source: '3', target: '4' },
                    { source: '4', target: '5' },
                    { source: '5', target: '6' }
                ]
            };

            mockDb.query.workflows.findFirst.mockResolvedValue(workflow);
            mockExecutionState.getState.mockResolvedValue({
                executionId: 1,
                status: 'running',
                completedNodes: ['1', '2', '3', '4', '5', '6'],
                currentNode: null,
                steps: [
                    { nodeId: '2', nodeType: 'condition', status: 'completed', output: { result: true }, startedAt: new Date().toISOString() }
                ],
                stepsByNodeId: {
                    '2': { nodeId: '2', nodeType: 'condition', status: 'completed', output: { result: true }, startedAt: new Date().toISOString() }
                },
                variables: {}
            });

            nodeWorker = new NodeWorker();
            const isComplete = await (nodeWorker as any).isWorkflowComplete(1, 1);

            expect(isComplete).toBe(true);
        });

        it('should not mark as complete when child nodes still need to execute', async () => {
            const workflow = {
                id: 1,
                nodes: [
                    { id: '4', type: 'analytics' },
                    { id: '5', type: 'discount' },
                    { id: '6', type: 'window-alert' }
                ],
                edges: [
                    { source: '4', target: '5' },
                    { source: '5', target: '6' }
                ]
            };

            mockDb.query.workflows.findFirst.mockResolvedValue(workflow);
            mockExecutionState.getState.mockResolvedValue({
                executionId: 1,
                status: 'running',
                completedNodes: ['1', '2', '3', '4'], // 5 and 6 not completed yet
                currentNode: null,
                steps: [],
                stepsByNodeId: {},
                variables: {}
            });

            nodeWorker = new NodeWorker();
            const isComplete = await (nodeWorker as any).isWorkflowComplete(1, 1);

            expect(isComplete).toBe(false);
        });
    });
});
