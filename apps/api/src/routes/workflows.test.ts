import { describe, it, expect, vi } from 'vitest';
import { Hono } from 'hono';
import workflowsApp from './workflows';

// Mock the database
vi.mock('@repo/database', () => ({
    db: {
        insert: vi.fn(() => ({
            values: vi.fn(() => ({
                returning: vi.fn(() => Promise.resolve([{ id: 1, name: 'Test' }]))
            }))
        })),
        update: vi.fn(() => ({
            set: vi.fn(() => ({
                where: vi.fn(() => ({
                    returning: vi.fn(() => Promise.resolve([{ id: 1, name: 'Updated' }]))
                }))
            }))
        })),
        query: {
            workflows: {
                findMany: vi.fn(() => Promise.resolve([])),
                findFirst: vi.fn(() => Promise.resolve({ id: 1 }))
            }
        }
    },
    workflows: {},
    eq: vi.fn()
}));

describe('Workflow API', () => {
    const app = new Hono();
    app.route('/', workflowsApp);

    it('should create a valid workflow', async () => {
        const res = await app.request('/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: 'Valid Workflow',
                nodes: [
                    { id: '1', type: 'start', position: { x: 0, y: 0 }, data: {} }
                ],
                edges: []
            })
        });
        expect(res.status).toBe(200);
    });

    it('should reject invalid condition node', async () => {
        const res = await app.request('/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: 'Invalid Workflow',
                nodes: [
                    { id: '1', type: 'condition', position: { x: 0, y: 0 }, data: {} } // Missing condition data
                ],
                edges: []
            })
        });
        expect(res.status).toBe(400);
        const body = await res.json();
        expect(body.error).toContain('Validation failed');
    });

    it('should reject invalid analytics node', async () => {
        const res = await app.request('/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: 'Invalid Workflow',
                nodes: [
                    { id: '1', type: 'analytics', position: { x: 0, y: 0 }, data: {} } // Missing eventName
                ],
                edges: []
            })
        });
        expect(res.status).toBe(400);
        const body = await res.json();
        expect(body.error).toContain('Validation failed');
    });
});
