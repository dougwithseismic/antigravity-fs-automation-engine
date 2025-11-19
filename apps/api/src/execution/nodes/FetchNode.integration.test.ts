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

describe('FetchNode Integration', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('should execute a workflow with a FetchNode', async () => {
        // Mock global fetch
        const mockResponse = {
            ok: true,
            status: 200,
            statusText: 'OK',
            headers: new Headers({ 'content-type': 'application/json' }),
            json: async () => ({ message: 'success' }),
        };
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue(mockResponse));

        // Setup mock workflow
        const workflow = {
            id: 1,
            name: 'Fetch Workflow',
            nodes: [
                {
                    id: '1',
                    type: 'fetch',
                    data: {
                        url: 'https://api.example.com/data',
                        method: 'GET'
                    }
                }
            ],
            edges: []
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
        expect(result.results?.['1']?.output).toEqual({
            status: 200,
            statusText: 'OK',
            headers: { 'content-type': 'application/json' },
            data: { message: 'success' }
        });

        // Verify fetch was called correctly
        expect(fetch).toHaveBeenCalledWith('https://api.example.com/data', expect.objectContaining({
            method: 'GET',
            headers: {}
        }));
    });

    it('should handle fetch errors gracefully', async () => {
        // Mock global fetch to throw error
        vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network Error')));

        // Setup mock workflow
        const workflow = {
            id: 1,
            name: 'Fetch Error Workflow',
            nodes: [
                {
                    id: '1',
                    type: 'fetch',
                    data: {
                        url: 'https://api.example.com/error',
                        method: 'GET'
                    }
                }
            ],
            edges: []
        };

        // Mock DB responses
        mockDb.insert().values().returning.mockResolvedValueOnce([{ id: 101 }]);
        mockDb.query.workflows.findFirst.mockResolvedValue(workflow);
        mockDb.query.executionSteps.findFirst.mockResolvedValue(null);

        // Execute
        const result = await executeWorkflow(1, {});

        // Verify
        expect(result.status).toBe('completed'); // Workflow completes even if node fails (unless configured otherwise)
        expect(result.results?.['1']?.status).toBe('failed');
        expect(result.results?.['1']?.error).toBe('Network Error');
    });
});
