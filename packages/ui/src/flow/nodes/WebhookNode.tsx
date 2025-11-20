import { memo } from 'react';
import { type NodeProps, type Node } from '@xyflow/react';
import { Webhook, Zap } from 'lucide-react';
import { NodeContainer, nodeStyles } from '../shared/node-base';
import { InputGroup } from '../primitives/InputGroup';
import { TextInput } from '../primitives/TextInput';
import { SelectInput } from '../primitives/SelectInput';
import { OutputGroup } from '../primitives/OutputGroup';
import { OutputItem } from '../primitives/OutputItem';

export interface WebhookNodeData {
    label?: string;
    description?: string;
    method?: string;
    path?: string;
    handles?: any[];
}

/**
 * WebhookNode - HTTP webhook trigger
 * Shows webhook endpoint and method with inline editing
 */
export const WebhookNode = memo(({ data, selected }: NodeProps<Node<WebhookNodeData>>) => {
    const handles = (data.handles as any[]) || [];
    const dataInputs = handles.filter(h => h.type === 'target' && h.dataType !== 'flow');
    const dataOutputs = handles.filter(h => h.type === 'source' && h.dataType !== 'flow');

    const method = data.method || 'POST';
    const path = data.path || '/webhook';

    return (
        <NodeContainer
            id="webhook"
            selected={selected}
            type="webhook"
            label={data.label || 'Webhook Trigger'}
            description={data.description || 'HTTP webhook endpoint'}
            icon={<Webhook className="h-4 w-4" />}
            handles={handles}
            className="border-2 border-green-500/30"
        >
            <div className={nodeStyles.body}>
                {/* Trigger Indicator */}
                <div className="mb-3 flex items-center gap-2 rounded bg-green-500/10 px-2 py-1">
                    <Zap className="h-3 w-3 text-green-400" />
                    <span className="text-xs font-semibold text-green-400">TRIGGER</span>
                </div>

                {/* HTTP Method Selector */}
                <InputGroup
                    label="HTTP Method"
                    handleData={dataInputs.find(h => h.id === 'method')}
                >
                    <SelectInput defaultValue={method}>
                        <option value="GET">GET</option>
                        <option value="POST">POST</option>
                        <option value="PUT">PUT</option>
                        <option value="PATCH">PATCH</option>
                        <option value="DELETE">DELETE</option>
                        <option value="OPTIONS">OPTIONS</option>
                    </SelectInput>
                </InputGroup>

                {/* Webhook Path Input */}
                <InputGroup
                    label="Webhook Path"
                    handleData={dataInputs.find(h => h.id === 'path')}
                    helper="Triggers workflow when this endpoint receives a request"
                >
                    <TextInput
                        type="text"
                        placeholder="/webhook"
                        defaultValue={path}
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

WebhookNode.displayName = 'WebhookNode';
