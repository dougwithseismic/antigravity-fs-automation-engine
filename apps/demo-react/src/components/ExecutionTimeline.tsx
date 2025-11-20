import type { ExecutionStep } from '../api';
import { getExecutionTimeline, formatTime, getStatusIcon } from '../lib/utils';
import './ExecutionTimeline.css';

interface ExecutionTimelineProps {
    steps: ExecutionStep[];
    nodes: any[];
}

export function ExecutionTimeline({ steps, nodes }: ExecutionTimelineProps) {
    const timeline = getExecutionTimeline(steps);

    if (timeline.length === 0) {
        return null;
    }

    return (
        <div className="execution-timeline">
            <h3>📊 Execution Timeline</h3>
            {timeline.map((item, idx) => {
                const node = nodes.find(n => n.id === item.nodeId);
                return (
                    <div key={idx} className={`timeline-item status-${item.status}`}>
                        <div className="timeline-marker">
                            {getStatusIcon(item.status)}
                        </div>
                        <div className="timeline-content">
                            <div className="node-info">
                                <span className="node-type">{item.nodeType}</span>
                                <span className="node-name">{node?.data?.label || item.nodeId}</span>
                            </div>
                            <div className="timing-info">
                                {item.duration !== undefined && (
                                    <span className="duration">{item.duration}ms</span>
                                )}
                                <span className="timestamp">{formatTime(item.timestamp)}</span>
                            </div>
                            {item.error && (
                                <div className="error-info">
                                    ❌ {item.error.message}
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
