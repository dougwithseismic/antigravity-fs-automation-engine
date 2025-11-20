import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ExecutionStateService } from './execution-state';
import Redis from 'ioredis';
import { db } from '@repo/database';
describe('ExecutionStateService', () => {
    let redis: Redis;
    let service: ExecutionStateService;
    const testExecutionId = 999;
    const testWorkflowId = 888;

    beforeEach(async () => {
        redis = new Redis({
            host: process.env.REDIS_HOST || 'localhost',
            port: parseInt(process.env.REDIS_PORT || '6379'),
        });
        service = new ExecutionStateService(redis);

        // Clean up any existing test data
        await redis.del(`exec:${testExecutionId}:state`);
    });

    afterEach(async () => {
        await redis.del(`exec:${testExecutionId}:state`);
        await redis.quit();
    });

    describe('initState', () => {
        it('should create initial state in Redis', async () => {
            const state = await service.initState(testExecutionId, testWorkflowId);

            expect(state).toMatchObject({
                executionId: testExecutionId,
                workflowId: testWorkflowId,
                status: 'running',
                completedNodes: [],
                steps: [],
                stepsByNodeId: {},
                variables: {},
            });

            expect(state.startedAt).toBeDefined();
            expect(state.updatedAt).toBeDefined();
        });

        it('should set TTL on state key', async () => {
            await service.initState(testExecutionId, testWorkflowId);

            const ttl = await redis.ttl(`exec:${testExecutionId}:state`);
            expect(ttl).toBeGreaterThan(0);
            expect(ttl).toBeLessThanOrEqual(60 * 60 * 24 * 30); // 30 days
        });
    });

    describe('getState', () => {
        it('should return null for non-existent state', async () => {
            const state = await service.getState(testExecutionId);
            expect(state).toBeNull();
        });

        it('should retrieve existing state', async () => {
            await service.initState(testExecutionId, testWorkflowId);
            const state = await service.getState(testExecutionId);

            expect(state).not.toBeNull();
            expect(state?.executionId).toBe(testExecutionId);
        });
    });

    describe('updateState', () => {
        beforeEach(async () => {
            await service.initState(testExecutionId, testWorkflowId);
        });

        it('should update status', async () => {
            const updated = await service.updateState(testExecutionId, {
                status: 'completed',
            });

            expect(updated.status).toBe('completed');
        });

        it('should add completed node', async () => {
            const updated = await service.updateState(testExecutionId, {
                completedNode: 'node-1',
            });

            expect(updated.completedNodes).toContain('node-1');
        });

        it('should not duplicate completed nodes', async () => {
            await service.updateState(testExecutionId, { completedNode: 'node-1' });
            const updated = await service.updateState(testExecutionId, { completedNode: 'node-1' });

            expect(updated.completedNodes.filter(n => n === 'node-1')).toHaveLength(1);
        });

        it('should store step results', async () => {
            const updated = await service.updateState(testExecutionId, {
                addStep: {
                    nodeId: 'node-1',
                    nodeType: 'test',
                    status: 'completed',
                    output: { foo: 'bar' },
                    startedAt: new Date().toISOString(),
                },
            });

            expect(updated.stepsByNodeId['node-1']).toBeDefined();
            expect(updated.stepsByNodeId['node-1'].output).toEqual({ foo: 'bar' });
        });

        it('should merge variables', async () => {
            await service.updateState(testExecutionId, { variables: { a: 1 } });
            const updated = await service.updateState(testExecutionId, { variables: { b: 2 } });

            expect(updated.variables).toEqual({ a: 1, b: 2 });
        });

        it('should update updatedAt timestamp', async () => {
            const initial = await service.getState(testExecutionId);
            await new Promise(resolve => setTimeout(resolve, 10)); // Small delay
            const updated = await service.updateState(testExecutionId, { status: 'completed' });

            expect(new Date(updated.updatedAt).getTime()).toBeGreaterThan(
                new Date(initial!.updatedAt).getTime()
            );
        });

        it('should throw if state does not exist', async () => {
            await expect(
                service.updateState(777, { status: 'completed' })
            ).rejects.toThrow('Execution state not found: 777');
        });
    });

    describe('complex workflow simulation', () => {
        it('should handle multi-node execution', async () => {
            // Initialize
            await service.initState(testExecutionId, testWorkflowId);

            // Execute node 1
            await service.updateState(testExecutionId, {
                addActiveNode: 'node-1',
            });

            await service.updateState(testExecutionId, {
                removeActiveNode: 'node-1',
                completedNode: 'node-1',
                addStep: {
                    nodeId: 'node-1',
                    nodeType: 'test',
                    status: 'completed',
                    output: { result: 'data1' },
                    startedAt: new Date().toISOString(),
                    completedAt: new Date().toISOString(),
                },
            });

            // Execute node 2
            await service.updateState(testExecutionId, {
                addActiveNode: 'node-2',
            });

            await service.updateState(testExecutionId, {
                removeActiveNode: 'node-2',
                completedNode: 'node-2',
                addStep: {
                    nodeId: 'node-2',
                    nodeType: 'test',
                    status: 'completed',
                    output: { result: 'data2' },
                    startedAt: new Date().toISOString(),
                    completedAt: new Date().toISOString(),
                },
            });

            // Complete
            await service.updateState(testExecutionId, {
                status: 'completed',
            });

            const finalState = await service.getState(testExecutionId);
            expect(finalState?.completedNodes).toEqual(['node-1', 'node-2']);
            expect(finalState?.status).toBe('completed');
            expect(finalState?.steps).toHaveLength(2);
            expect(finalState?.stepsByNodeId['node-1']).toBeDefined();
            expect(finalState?.stepsByNodeId['node-1'].output).toEqual({ result: 'data1' });
            expect(finalState?.stepsByNodeId['node-2']).toBeDefined();
            expect(finalState?.stepsByNodeId['node-2'].output).toEqual({ result: 'data2' });
        });
    });

    describe('deleteState', () => {
        it('should remove state from Redis', async () => {
            await service.initState(testExecutionId, testWorkflowId);
            await service.deleteState(testExecutionId);

            const state = await service.getState(testExecutionId);
            expect(state).toBeNull();
        });
    });
});
