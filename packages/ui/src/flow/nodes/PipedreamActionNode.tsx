import { memo } from 'react';
import { type NodeProps, type Node } from '@xyflow/react';
import { Plug, Zap } from 'lucide-react';
import { NodeContainer, nodeStyles } from '../shared/node-base';
import { InputGroup } from '../primitives/InputGroup';
import { TextInput } from '../primitives/TextInput';
import { TextareaInput } from '../primitives/TextareaInput';
import { OutputGroup } from '../primitives/OutputGroup';
import { OutputItem } from '../primitives/OutputItem';

export interface PipedreamActionNodeData {
    label?: string;
    description?: string;
    componentId?: string;
    actionName?: string;
    handles?: any[];
}

/**
 * PipedreamActionNode - Execute Pipedream Connect action
 * Shows component and action selection
 */
export const PipedreamActionNode = memo(({ data, selected }: NodeProps<Node<PipedreamActionNodeData>>) => {
    const handles = (data.handles as any[]) || [];
    const dataInputs = handles.filter(h => h.type === 'target' && h.dataType !== 'flow');
    const dataOutputs = handles.filter(h => h.type === 'source' && h.dataType !== 'flow');

    const componentId = data.componentId || '@pipedreams/slack';
    const actionName = data.actionName || 'send_message';

    return (
        <NodeContainer
            id="pipedream-action"
            selected={selected}
            type="pipedream-action"
            label={data.label || 'Pipedream Action'}
            description={data.description || 'Connect to 3000+ apps'}
            icon={<Plug className="h-4 w-4" />}
            handles={handles}
        >
            <div className={nodeStyles.body}>
                {/* Pipedream Badge */}
                <div className="mb-3 flex items-center gap-2 rounded-lg bg-purple-500/10 px-3 py-2">
                    <Zap className="h-4 w-4 text-purple-400" />
                    <div className="flex-1">
                        <div className="font-mono text-xs font-medium text-purple-300">{componentId}</div>
                        <div className="text-xs text-gray-400">{actionName}</div>
                    </div>
                </div>

                {/* Component ID */}
                <InputGroup
                    label="Component ID"
                    required
                    handleData={dataInputs.find(h => h.id === 'componentId')}
                >
                    <TextInput
                        type="text"
                        placeholder="@pipedreams/slack"
                        defaultValue={componentId}
                    />
                </InputGroup>

                {/* Action Name */}
                <InputGroup
                    label="Action Name"
                    required
                    handleData={dataInputs.find(h => h.id === 'actionName')}
                >
                    <TextInput
                        type="text"
                        placeholder="send_message"
                        defaultValue={actionName}
                    />
                </InputGroup>

                {/* Connection ID */}
                <InputGroup
                    label="Connection"
                    handleData={dataInputs.find(h => h.id === 'connectionId')}
                >
                    <TextInput
                        type="text"
                        placeholder="conn_xxx"
                    />
                </InputGroup>

                {/* Payload */}
                <InputGroup
                    label="Payload"
                    typeIndicator="json"
                    handleData={dataInputs.find(h => h.id === 'payload')}
                >
                    <TextareaInput
                        placeholder='{"channel": "#general", "text": "Hello"}'
                        rows={3}
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

PipedreamActionNode.displayName = 'PipedreamActionNode';
