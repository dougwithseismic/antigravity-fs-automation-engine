import { useState } from 'react';
import { WorkflowList } from './components/WorkflowList';
import { GenericWorkflowExecution } from './components/GenericWorkflowExecution';
import './App.css';

function App() {
    const [selectedWorkflowId, setSelectedWorkflowId] = useState<string | null>(null);

    return (
        <div className="app-container">
            {selectedWorkflowId ? (
                <GenericWorkflowExecution
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
