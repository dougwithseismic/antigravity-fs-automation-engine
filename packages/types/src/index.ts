export type Workflow = {
    id: number;
    name: string;
    nodes: any[]; // TODO: Define Node type
    edges: any[]; // TODO: Define Edge type
    createdAt: Date;
    updatedAt: Date;
};

export type Execution = {
    id: number;
    workflowId: number;
    status: 'pending' | 'running' | 'completed' | 'failed';
    data: any;
    startedAt: Date;
    finishedAt?: Date;
};
