import type { ExecutionStep, WorkflowNode, WorkflowEdge } from '@repo/types';

// Re-export shared types
export type { ExecutionStep };

export interface Workflow {
    id: number;
    name: string;
    description?: string;
    nodes: WorkflowNode[];
    edges: WorkflowEdge[];
    createdAt: string;
    updatedAt: string;
}

export interface ExecutionStatus {
    id: number;
    workflowId: number;
    status: 'pending' | 'running' | 'completed' | 'failed' | 'suspended' | 'waiting';
    data: any;
    startedAt: string;
    finishedAt?: string;
    steps: ExecutionStep[];
    variables: Record<string, any>;
    completedNodes?: string[];
    stepResults?: Record<string, any>;
    currentState?: {
        executionId: number;
        workflowId: number;
        status: string;
        completedNodes: string[];
        activeNodes: string[];
        steps: ExecutionStep[];
        variables: Record<string, any>;
        startedAt: string;
        updatedAt: string;
        stepResults?: Record<string, any>;
    };
}

const API_BASE_URL = 'http://localhost:3002';

export async function fetchWorkflows(): Promise<Workflow[]> {
    const response = await fetch(`${API_BASE_URL}/workflows`);
    if (!response.ok) {
        throw new Error('Failed to fetch workflows');
    }
    return response.json();
}

export async function fetchWorkflow(id: string): Promise<Workflow> {
    const response = await fetch(`${API_BASE_URL}/workflows/${id}`);
    if (!response.ok) {
        throw new Error('Failed to fetch workflow');
    }
    return response.json();
}

export async function executeWorkflow(workflowId: string, input: any): Promise<{ executionId: number; status: string }> {
    const response = await fetch(`${API_BASE_URL}/workflows/${workflowId}/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input })
    });
    if (!response.ok) {
        throw new Error('Failed to start workflow execution');
    }
    return response.json();
}

export async function getExecutionStatus(executionId: number): Promise<ExecutionStatus> {
    const response = await fetch(`${API_BASE_URL}/executions/${executionId}`);
    if (!response.ok) {
        throw new Error('Failed to fetch execution status');
    }
    return response.json();
}

export async function resumeExecution(executionId: number, data: any): Promise<{ status: string; message: string }> {
    const response = await fetch(`${API_BASE_URL}/executions/${executionId}/resume`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data })
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to resume execution');
    }
    return response.json();
}
export async function fetchNodes(): Promise<any[]> {
    const response = await fetch(`${API_BASE_URL}/nodes`);
    if (!response.ok) {
        throw new Error('Failed to fetch nodes');
    }
    return response.json();
}
