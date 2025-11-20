import { memo } from 'react';
import { type NodeProps, type Node } from '@xyflow/react';
import { Cpu, Key } from 'lucide-react';
import { NodeContainer, nodeStyles } from '../shared/node-base';
import { InputGroup } from '../primitives/InputGroup';
import { SelectInput } from '../primitives/SelectInput';
import { OutputGroup } from '../primitives/OutputGroup';
import { OutputItem } from '../primitives/OutputItem';

export interface LLMProviderNodeData {
    label?: string;
    description?: string;
    model?: string;
    handles?: any[];
}

/**
 * LLMProviderNode - Configure a Language Model Provider
 * Shows model selection and credential connection
 */
export const LLMProviderNode = memo(({ data, selected }: NodeProps<Node<LLMProviderNodeData>>) => {
    const handles = (data.handles as any[]) || [];
    const dataInputs = handles.filter(h => h.type === 'target' && h.dataType !== 'flow');
    const dataOutputs = handles.filter(h => h.type === 'source' && h.dataType !== 'flow');

    const model = data.model || 'gpt-4';
    const credentialHandle = dataInputs.find(h => h.id === 'credential');

    return (
        <NodeContainer
            id="llm-provider"
            selected={selected}
            type="llm-provider"
            label={data.label || 'LLM Provider'}
            description={data.description || 'Configure language model'}
            icon={<Cpu className="h-4 w-4" />}
            handles={handles}
        >
            <div className={nodeStyles.body}>
                {/* Model Badge */}
                <div className="mb-3 flex items-center gap-2 rounded-lg bg-purple-500/10 px-3 py-2">
                    <Cpu className="h-4 w-4 text-purple-400" />
                    <span className="text-sm font-medium text-purple-300">{model}</span>
                </div>

                {/* API Key Input */}
                <InputGroup
                    label="API Key"
                    required
                    typeIndicator={<Key className="h-3 w-3" />}
                    handleData={credentialHandle}
                >
                    <SelectInput>
                        <option value="">Connect credential...</option>
                        <option value="env.OPENAI_API_KEY">OPENAI_API_KEY</option>
                        <option value="env.ANTHROPIC_API_KEY">ANTHROPIC_API_KEY</option>
                    </SelectInput>
                </InputGroup>

                {/* Model Selection */}
                <InputGroup
                    label="Model"
                    required
                >
                    <SelectInput defaultValue={model}>
                        <option value="gpt-4">GPT-4</option>
                        <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                        <option value="claude-3-opus">Claude 3 Opus</option>
                        <option value="claude-3-sonnet">Claude 3 Sonnet</option>
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

LLMProviderNode.displayName = 'LLMProviderNode';
