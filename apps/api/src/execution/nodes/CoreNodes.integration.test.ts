import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { executeWorkflow } from '../engine';

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

describe('Core Nodes Integration', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('should execute a CodeNode', async () => {
        const workflow = {
            id: 1,
            name: 'Code Workflow',
            nodes: [
                {
                    id: '1',
                    type: 'code',
                    data: {
                        code: 'return { result: 10 * 10 };'
                    }
                }
            ],
            edges: []
        };

        mockDb.insert().values().returning.mockResolvedValueOnce([{ id: 200 }]);
        mockDb.query.workflows.findFirst.mockResolvedValue(workflow);
        mockDb.query.executionSteps.findFirst.mockResolvedValue(null);

        const result = await executeWorkflow(1, {});

        expect(result.status).toBe('completed');
        expect(result.results?.['1']?.status).toBe('success');
        expect(result.results?.['1']?.output).toEqual({ result: 100 });
    });

    it('should execute a SwitchNode', async () => {
        const workflow = {
            id: 1,
            name: 'Switch Workflow',
            nodes: [
                {
                    id: '1',
                    type: 'switch',
                    data: {
                        rules: [{ condition: 'true' }],
                        testVal: 'hello'
                    }
                }
            ],
            edges: []
        };

        mockDb.insert().values().returning.mockResolvedValueOnce([{ id: 201 }]);
        mockDb.query.workflows.findFirst.mockResolvedValue(workflow);
        mockDb.query.executionSteps.findFirst.mockResolvedValue(null);

        const result = await executeWorkflow(1, {});

        expect(result.status).toBe('completed');
        expect(result.results?.['1']?.status).toBe('success');
        // Based on current implementation, it returns input + _routeIndex
        expect(result.results?.['1']?.output).toEqual(expect.objectContaining({
            testVal: 'hello',
            _routeIndex: 0
        }));
    });

    it('should execute a WaitNode', async () => {
        const workflow = {
            id: 1,
            name: 'Wait Workflow',
            nodes: [
                {
                    id: '1',
                    type: 'wait',
                    data: {
                        amount: 10,
                        unit: 'minutes'
                    }
                }
            ],
            edges: []
        };

        mockDb.insert().values().returning.mockResolvedValueOnce([{ id: 202 }]);
        mockDb.query.workflows.findFirst.mockResolvedValue(workflow);
        mockDb.query.executionSteps.findFirst.mockResolvedValue(null);

        const result = await executeWorkflow(1, {});

        // WaitNode should suspend the workflow
        expect(result.status).toBe('waiting'); // The *execution loop* completes, but the node status is what matters for now unless engine handles suspension status bubbling
        // Actually, if a node returns 'suspended', the engine might return 'suspended' or 'waiting'. 
        // Let's check the node result specifically.

        expect(result.results?.['1']?.status).toBe('suspended');
        expect(result.results?.['1']?.output).toEqual({
            resumeAfter: { amount: 10, unit: 'minutes' }
        });
    });
});
