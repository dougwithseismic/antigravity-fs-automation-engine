import { useState } from 'react';
import { WorkflowList } from './components/WorkflowList';
import { WorkflowExecution } from './components/WorkflowExecution';
import './App.css';

function App() {
    const [selectedWorkflowId, setSelectedWorkflowId] = useState<string | null>(null);

    return (
        <div className="app-container">
            {selectedWorkflowId ? (
                <WorkflowExecution
                    workflowId={selectedWorkflowId}
                    onBack={() => setSelectedWorkflowId(null)}
                />
            ) : (
                <WorkflowList
                    onSelectWorkflow={setSelectedWorkflowId}
                />
            )}
        </div>
    );
}

export default App;
