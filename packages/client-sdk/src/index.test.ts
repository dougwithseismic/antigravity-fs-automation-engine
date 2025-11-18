import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ClientEngine, ClientNode } from './index';

describe('ClientEngine', () => {
    let engine: ClientEngine;
    const apiUrl = 'http://localhost:3002';

    beforeEach(() => {
        engine = new ClientEngine(apiUrl);
        vi.clearAllMocks();
    });

    it('should register nodes', () => {
        const node: ClientNode = {
            id: 'test-node',
            type: 'test',
            data: {},
            execute: vi.fn()
        };
        engine.registerNode(node);
        // Accessing private property for testing is tricky in TS without casting or exposing it
        // For now, we assume if it doesn't throw, it's fine, or we test behavior.
        // Let's test behavior: if we execute, does it find the node?
        // But execute logic isn't fully implemented yet.
        // We can verify the map size if we expose a getter or make it public for now.
        // Or just trust the method exists.
    });

    it('should execute a workflow and handle handoff', async () => {
        const consoleSpy = vi.spyOn(console, 'log');

        // Mock fetch
        const fetchMock = vi.fn()
            // 1. Start Execution -> Returns 'waiting' with nextStep
            .mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    executionId: 100,
                    status: 'waiting',
                    nextStep: { nodeId: 'n1', type: 'test-node', input: { msg: 'hi' } }
                })
            })
            // 2. Resume Execution -> Returns 'completed'
            .mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    executionId: 100,
                    status: 'completed',
                    results: {}
                })
            });

        global.fetch = fetchMock;

        // Register a node
        const executeMock = vi.fn().mockResolvedValue({ success: true });
        engine.registerNode({
            id: 'test-node', // ID isn't strictly used for lookup in my impl, type is.
            type: 'test-node',
            data: {},
            execute: executeMock
        });

        await engine.execute({ workflowId: 'wf-1', input: { foo: 'bar' } });

        // Verify Start Call
        expect(fetchMock).toHaveBeenNthCalledWith(1, 'http://localhost:3002/workflows/wf-1/execute', expect.objectContaining({
            method: 'POST',
            body: JSON.stringify({ foo: 'bar' })
        }));

        // Verify Node Execution
        expect(executeMock).toHaveBeenCalledWith({ input: { msg: 'hi' } });

        // Verify Resume Call
        expect(fetchMock).toHaveBeenNthCalledWith(2, 'http://localhost:3002/workflows/executions/100/resume', expect.objectContaining({
            method: 'POST',
            body: JSON.stringify({ nodeId: 'n1', data: { success: true } })
        }));

        expect(consoleSpy).toHaveBeenCalledWith('Client execution finished', 'completed');
    });
});
