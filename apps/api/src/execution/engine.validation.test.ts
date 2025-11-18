import { describe, it, expect, vi } from 'vitest';
import { executeWorkflow } from './engine';

// Mock database
vi.mock('@repo/database', () => ({
    db: {
        insert: vi.fn(() => ({
            values: vi.fn(() => ({
                returning: vi.fn(() => Promise.resolve([{ id: 1 }]))
            }))
        })),
        update: vi.fn(() => ({
            set: vi.fn(() => ({
                where: vi.fn(() => Promise.resolve())
            }))
        })),
        query: {
            workflows: {
                findFirst: vi.fn((args) => {
                    // Mock workflow retrieval
                    // We can't easily inspect args here to return different workflows based on ID
                    // So we'll mock the return value in the test case if needed, or rely on a default
                    return Promise.resolve({
                        id: 1,
                        name: 'Test Workflow',
                        nodes: [
                            { id: '1', type: 'condition', position: { x: 0, y: 0 }, data: {} } // Invalid: missing condition
                        ],
                        edges: []
                    });
                })
            },
            executions: {
                findFirst: vi.fn()
            },
            executionSteps: {
                findFirst: vi.fn()
            }
        }
    },
    executions: {},
    executionSteps: {},
    eq: vi.fn(),
    and: vi.fn()
}));

describe('Engine Validation', () => {
    it('should fail execution if workflow is invalid', async () => {
        const result = await executeWorkflow(1, {});
        expect(result.status).toBe('failed');
        expect(result.error).toContain('Workflow validation failed');
    });
});
