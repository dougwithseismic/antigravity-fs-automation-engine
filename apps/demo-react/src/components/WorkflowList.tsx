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
        <div className="workflow-list-shell">
            <div className="workflow-list-hero">
                <div>
                    <p className="eyebrow">Demo workflows</p>
                    <h1>Composable flows, ready to run</h1>
                    <p className="hero-subtitle">
                        Pick a workflow to step through the same client/server choreography shown in the Langflow mock.
                    </p>
                </div>
                <div className="hero-stats">
                    <div className="stat-chip">
                        <span className="stat-value">{workflows.length}</span>
                        <span className="stat-label">available</span>
                    </div>
                    <div className="stat-chip subtle">
                        <span className="stat-value">Live</span>
                        <span className="stat-label">local demo</span>
                    </div>
                </div>
            </div>

            <div className="workflow-grid">
                {workflows.map((workflow) => (
                    <div
                        key={workflow.id}
                        className="workflow-card"
                        onClick={() => onSelectWorkflow(String(workflow.id))}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onSelectWorkflow(String(workflow.id))}
                    >
                        <div className="card-header">
                            <div>
                                <span className="pill">Workflow</span>
                                <h3>{workflow.name}</h3>
                                <p className="card-description">
                                    {workflow.description || 'Minimal, production-ish defaults that mirror the screenshot aesthetic.'}
                                </p>
                            </div>
                            <span className="ghost-action">Run demo →</span>
                        </div>

                        <div className="card-meta">
                            <span className="meta-chip">{workflow.nodes.length} nodes</span>
                            <span className="meta-chip subtle">Updated {new Date(workflow.updatedAt || workflow.createdAt).toLocaleDateString()}</span>
                            <span className="meta-chip subtle">ID {workflow.id}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
