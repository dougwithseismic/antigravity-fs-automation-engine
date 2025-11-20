import { memo } from 'react';
import { type NodeProps, type Node } from '@xyflow/react';
import { Hand } from 'lucide-react';
import { NodeContainer, nodeStyles } from '../shared/node-base';
import { InputGroup } from '../primitives/InputGroup';
import { TextareaInput } from '../primitives/TextareaInput';
import { SelectInput } from '../primitives/SelectInput';
import { OutputGroup } from '../primitives/OutputGroup';
import { OutputItem } from '../primitives/OutputItem';

export interface HumanApprovalNodeData {
    label?: string;
    description?: string;
    prompt?: string;
    channel?: string;
    handles?: any[];
}

/**
 * HumanApprovalNode - Pause for human approval
 * Shows approval prompt and channel
 */
export const HumanApprovalNode = memo(({ data, selected }: NodeProps<Node<HumanApprovalNodeData>>) => {
    const handles = (data.handles as any[]) || [];
    const dataInputs = handles.filter(h => h.type === 'target' && h.dataType !== 'flow');
    const dataOutputs = handles.filter(h => h.type === 'source' && h.dataType !== 'flow');

    const channel = data.channel || 'slack';
    const prompt = data.prompt || 'Approval required';

    return (
        <NodeContainer
            id="human-approval"
            selected={selected}
            type="human-approval"
            label={data.label || 'Human Approval'}
            description={data.description || 'Pause for approval'}
            icon={<Hand className="h-4 w-4" />}
            handles={handles}
        >
            <div className={nodeStyles.body}>
                {/* Approval Preview */}
                <div className="mb-3 rounded-lg bg-orange-500/10 p-3">
                    <div className="flex items-center gap-2">
                        <Hand className="h-4 w-4 text-orange-400" />
                        <div className="flex-1">
                            <div className="text-xs font-semibold text-orange-400">Approval Required</div>
                            <div className="text-xs text-gray-400">via {channel}</div>
                        </div>
                    </div>
                    <div className="mt-2 text-xs text-gray-300">{prompt}</div>
                </div>

                {/* Prompt */}
                <InputGroup
                    label="Prompt"
                    required
                    handleData={dataInputs.find(h => h.id === 'prompt')}
                >
                    <TextareaInput
                        placeholder="Explain what needs approval..."
                        defaultValue={prompt}
                        rows={3}
                    />
                </InputGroup>

                {/* Channel */}
                <InputGroup
                    label="Channel"
                    handleData={dataInputs.find(h => h.id === 'channel')}
                >
                    <SelectInput defaultValue={channel}>
                        <option value="slack">Slack</option>
                        <option value="email">Email</option>
                        <option value="webhook">Webhook</option>
                    </SelectInput>
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

HumanApprovalNode.displayName = 'HumanApprovalNode';
