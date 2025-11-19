export interface Workflow {
    id: number;
    name: string;
    nodes: any[];
    edges: any[];
    createdAt: string;
    updatedAt: string;
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
