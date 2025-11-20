import Redis from 'ioredis';
import { redisConnection } from '../config/redis';
import { ExecutionStep } from '@repo/types';

/**
 * Redis state schema for active executions:
 * Key: exec:{executionId}:state
 * Value: {
 *   executionId: number,
 *   workflowId: number,
 *   status: 'running' | 'paused' | 'completed' | 'failed' | 'suspended',
 *   completedNodes: string[],
 *   activeNodes: string[],
 *   steps: ExecutionStep[],
 *   stepsByNodeId: Record<string, ExecutionStep>,
 *   variables: Record<string, any>,
 *   startedAt: string,
 *   updatedAt: string
 * }
 */

export interface ExecutionState {
    executionId: number;
    workflowId: number;
    status: 'running' | 'paused' | 'completed' | 'failed' | 'suspended';
    completedNodes: string[];
    activeNodes: string[]; // Nodes currently executing or waiting for user interaction

    // Clean execution steps (chronological order)
    steps: ExecutionStep[];

    // Quick lookup by node ID
    stepsByNodeId: Record<string, ExecutionStep>;

    variables: Record<string, any>;   // workflow-level variables
    startedAt: string;
    updatedAt: string;
}

export interface StateUpdate {
    status?: ExecutionState['status'];
    activeNodes?: string[]; // Replace entire list
    addActiveNode?: string; // Add single node
    removeActiveNode?: string; // Remove single node
    completedNode?: string;

    // Add or update a step
    addStep?: ExecutionStep;
    updateStep?: { nodeId: string; updates: Partial<ExecutionStep> };

    variables?: Record<string, any>;
}

export class ExecutionStateService {
    private redis: Redis;
    private readonly KEY_PREFIX = 'exec';
    private readonly KEY_TTL = 60 * 60 * 24 * 30; // 30 days

    constructor(redis: Redis = redisConnection) {
        this.redis = redis;
    }

    /**
     * Initialize state for a new execution
     */
    async initState(executionId: number, workflowId: number): Promise<ExecutionState> {
        const state: ExecutionState = {
            executionId,
            workflowId,
            status: 'running',
            completedNodes: [],
            activeNodes: [],
            steps: [],
            stepsByNodeId: {},
            variables: {},
            startedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        await this.redis.setex(
            this.getKey(executionId),
            this.KEY_TTL,
            JSON.stringify(state)
        );

        return state;
    }

    /**
     * Get current state from Redis
     */
    async getState(executionId: number): Promise<ExecutionState | null> {
        const data = await this.redis.get(this.getKey(executionId));
        if (!data) return null;
        return JSON.parse(data);
    }

    /**
     * Update state in Redis
     */
    async updateState(executionId: number, update: StateUpdate): Promise<ExecutionState> {
        const state = await this.getState(executionId);
        if (!state) {
            throw new Error(`Execution state not found: ${executionId}`);
        }

        // Apply updates
        if (update.status !== undefined) {
            state.status = update.status;
        }

        // Handle active nodes updates
        if (update.activeNodes !== undefined) {
            state.activeNodes = update.activeNodes;
        }

        if (update.addActiveNode) {
            if (!state.activeNodes.includes(update.addActiveNode)) {
                state.activeNodes.push(update.addActiveNode);
            }
        }

        if (update.removeActiveNode) {
            state.activeNodes = state.activeNodes.filter(id => id !== update.removeActiveNode);
        }

        if (update.completedNode) {
            if (!state.completedNodes.includes(update.completedNode)) {
                state.completedNodes.push(update.completedNode);
            }
        }

        // Handle step additions/updates
        if (update.addStep) {
            const step = update.addStep;

            // Add to steps array if not already present
            const existingIndex = state.steps.findIndex((s) => s.nodeId === step.nodeId);
            if (existingIndex >= 0) {
                // Update existing step
                state.steps[existingIndex] = step;
            } else {
                // Add new step
                state.steps.push(step);
            }

            // Update lookup map
            state.stepsByNodeId[step.nodeId] = step;
        }

        if (update.updateStep) {
            const { nodeId, updates } = update.updateStep;
            const step = state.stepsByNodeId[nodeId];

            if (step) {
                // Update the step
                const updatedStep = { ...step, ...updates };

                // Update in array
                const index = state.steps.findIndex((s) => s.nodeId === nodeId);
                if (index >= 0) {
                    state.steps[index] = updatedStep;
                }

                // Update in map
                state.stepsByNodeId[nodeId] = updatedStep;
            }
        }

        if (update.variables) {
            state.variables = { ...state.variables, ...update.variables };
        }

        state.updatedAt = new Date().toISOString();

        // Save to Redis
        await this.redis.setex(
            this.getKey(executionId),
            this.KEY_TTL,
            JSON.stringify(state)
        );

        return state;
    }

    /**
     * Flush state to PostgreSQL (for persistence)
     */
    async persistState(executionId: number, db: any): Promise<void> {
        const state = await this.getState(executionId);
        if (!state) {
            throw new Error(`Execution state not found: ${executionId}`);
        }

        // Update execution record
        await db
            .update(executions)
            .set({
                status: state.status,
                currentState: state, // Store entire state as JSONB
                completedSteps: state.completedNodes.length,
                ...(state.status === 'completed' || state.status === 'failed'
                    ? { finishedAt: new Date() }
                    : {}),
            })
            .where(eq(executions.id, executionId));

        // Insert/update step records from steps array
        for (const step of state.steps) {
            const existing = await db.query.executionSteps.findFirst({
                where: and(
                    eq(executionSteps.executionId, executionId),
                    eq(executionSteps.nodeId, step.nodeId)
                ),
            });

            if (existing) {
                // Update existing
                await db
                    .update(executionSteps)
                    .set({
                        output: step.output,
                        status: step.status,
                        startedAt: new Date(step.startedAt),
                        finishedAt: step.completedAt ? new Date(step.completedAt) : null,
                    })
                    .where(eq(executionSteps.id, existing.id));
            } else {
                // Insert new
                await db.insert(executionSteps).values({
                    executionId,
                    nodeId: step.nodeId,
                    status: step.status,
                    output: step.output,
                    startedAt: new Date(step.startedAt),
                    finishedAt: step.completedAt ? new Date(step.completedAt) : null,
                });
            }
        }
    }

    /**
     * Delete state from Redis (after persistence)
     */
    async deleteState(executionId: number): Promise<void> {
        await this.redis.del(this.getKey(executionId));
    }

    private getKey(executionId: number): string {
        return `${this.KEY_PREFIX}:${executionId}:state`;
    }
}

// Singleton instance
export const executionStateService = new ExecutionStateService();

// Import for types
import { executions, executionSteps } from '@repo/database/schema';
import { eq, and } from 'drizzle-orm';
