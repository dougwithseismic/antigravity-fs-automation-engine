import { useEffect, useState } from 'react';
import { fetchWorkflows, type Workflow } from '../api';
import './WorkflowList.css';

interface WorkflowListProps {
    onSelectWorkflow: (id: string) => void;
}

export function WorkflowList({ onSelectWorkflow }: WorkflowListProps) {
    const [workflows, setWorkflows] = useState<Workflow[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchWorkflows()
            .then(setWorkflows)
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="loading">Loading workflows...</div>;
    if (error) return <div className="error">Error: {error}</div>;

    return (
        <div className="workflow-list-container">
            <h2>Available Workflows</h2>
            <div className="workflow-grid">
                {workflows.map((workflow) => (
                    <div key={workflow.id} className="workflow-card" onClick={() => onSelectWorkflow(String(workflow.id))}>
                        <h3>{workflow.name}</h3>
                        <p>ID: {workflow.id}</p>
                        <p>Nodes: {workflow.nodes.length}</p>
                        <div className="workflow-card-footer">
                            <span>{new Date(workflow.createdAt).toLocaleDateString()}</span>
                            <button>Run Demo →</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
