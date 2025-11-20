import { memo } from 'react';
import { type NodeProps, type Node } from '@xyflow/react';
import { BarChart3 } from 'lucide-react';
import { NodeContainer, nodeStyles } from '../shared/node-base';
import { InputGroup } from '../primitives/InputGroup';
import { TextInput } from '../primitives/TextInput';
import { TextareaInput } from '../primitives/TextareaInput';
import { OutputGroup } from '../primitives/OutputGroup';
import { OutputItem } from '../primitives/OutputItem';

export interface AnalyticsNodeData {
    label?: string;
    description?: string;
    eventName?: string;
    properties?: string;
    handles?: any[];
}

/**
 * AnalyticsNode - Log analytics events
 * Shows event name and property preview
 */
export const AnalyticsNode = memo(({ data, selected }: NodeProps<Node<AnalyticsNodeData>>) => {
    const handles = (data.handles as any[]) || [];
    const dataInputs = handles.filter(h => h.type === 'target' && h.dataType !== 'flow');
    const dataOutputs = handles.filter(h => h.type === 'source' && h.dataType !== 'flow');

    const eventName = data.eventName || 'event_name';

    return (
        <NodeContainer
            id="analytics"
            selected={selected}
            type="analytics"
            label={data.label || 'Analytics'}
            description={data.description || 'Log analytics event'}
            icon={<BarChart3 className="h-4 w-4" />}
            handles={handles}
        >
            <div className={nodeStyles.body}>
                {/* Event Preview */}
                <div className="mb-3 flex items-center gap-2 rounded-lg bg-indigo-500/10 px-3 py-2">
                    <BarChart3 className="h-4 w-4 text-indigo-400" />
                    <div className="flex-1">
                        <div className="font-mono text-sm font-medium text-indigo-300">{eventName || 'unnamed_event'}</div>
                        <div className="text-xs text-gray-400">Analytics Event</div>
                    </div>
                </div>

                {/* Event Name */}
                <InputGroup
                    label="Event Name"
                    typeIndicator="string"
                    required
                    handleData={dataInputs.find(h => h.id === 'eventName')}
                >
                    <TextInput
                        placeholder="lead_captured"
                        defaultValue={data.eventName}
                    />
                </InputGroup>

                {/* Properties */}
                <InputGroup
                    label="Properties"
                    typeIndicator="json"
                    handleData={dataInputs.find(h => h.id === 'properties')}
                >
                    <TextareaInput
                        rows={3}
                        placeholder='{"source": "ppc", "campaign": "summer"}'
                        defaultValue={data.properties}
                    />
                </InputGroup>
            </div>

            {/* Data Outputs */}
            {dataOutputs.length > 0 && (
                <OutputGroup>
                    {dataOutputs.map((handle) => (
                        <OutputItem
                            key={handle.id}
                            label={handle.label || handle.id}
                            handleData={handle}
                        />
                    ))}
                </OutputGroup>
            )}
        </NodeContainer>
    );
});

AnalyticsNode.displayName = 'AnalyticsNode';
