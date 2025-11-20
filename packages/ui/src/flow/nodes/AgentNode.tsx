import { memo } from 'react';
import { type NodeProps, type Node } from '@xyflow/react';
import { Bot, Wrench } from 'lucide-react';
import { NodeContainer, nodeStyles } from '../shared/node-base';
import { InputGroup } from '../primitives/InputGroup';
import { SelectInput } from '../primitives/SelectInput';
import { TextareaInput } from '../primitives/TextareaInput';
import { OutputGroup } from '../primitives/OutputGroup';
import { OutputItem } from '../primitives/OutputItem';

export interface AgentNodeData extends Record<string, unknown> {
    label?: string;
    description?: string;
    instructions?: string;
    model?: string;
    tools?: any[];
    handles?: any[];
}

/**
 * AgentNode - AI Agent with tools
 * Shows model selection and connected tools
 */
export const AgentNode = memo(({ data, selected }: NodeProps<Node<AgentNodeData>>) => {
    const handles = (data.handles as any[]) || [];
    const dataInputs = handles.filter(h => h.type === 'target' && h.dataType !== 'flow');
    const dataOutputs = handles.filter(h => h.type === 'source' && h.dataType !== 'flow');

    const toolsHandle = dataInputs.find(h => h.id === 'tools');
    const modelHandle = dataInputs.find(h => h.id === 'model');
    const toolCount = Array.isArray(data.tools) ? data.tools.length : 0;

    return (
        <NodeContainer
            id="agent"
            selected={selected}
            type="agent"
            label={data.label || 'AI Agent'}
            description={data.description || 'Claude-powered agent'}
            icon={<Bot className="h-4 w-4" />}
            handles={handles}
            duration="Variable"
        >
            <div className={nodeStyles.body}>
                {/* Status Badges */}
                <div className="mb-3 flex items-center gap-2">
                    {modelHandle && (
                        <div className="flex items-center gap-1 rounded bg-purple-500/20 px-2 py-1 text-xs font-medium text-purple-300">
                            <Bot className="h-3 w-3" />
                            {data.model || 'claude-3-5-sonnet'}
                        </div>
                    )}
                    {toolsHandle && toolCount > 0 && (
                        <div className="flex items-center gap-1 rounded bg-green-500/20 px-2 py-1 text-xs font-medium text-green-300">
                            <Wrench className="h-3 w-3" />
                            {toolCount} tool{toolCount !== 1 ? 's' : ''}
                        </div>
                    )}
                </div>

                {/* Model Selection */}
                <InputGroup
                    label="Model Provider"
                    typeIndicator="LLM"
                    required
                    handleData={modelHandle}
                >
                    <SelectInput defaultValue={data.model}>
                        <option value="">Connect LLM Provider...</option>
                        <option value="claude-3-5-sonnet">Claude 3.5 Sonnet</option>
                        <option value="claude-3-opus">Claude 3 Opus</option>
                        <option value="claude-3-haiku">Claude 3 Haiku</option>
                    </SelectInput>
                </InputGroup>

                {/* System Instructions */}
                <InputGroup
                    label="System Instructions"
                    typeIndicator="text"
                    required
                >
                    <TextareaInput
                        rows={3}
                        placeholder="You are a helpful assistant..."
                        defaultValue={data.instructions || 'You are a helpful assistant.'}
                    />
                </InputGroup>

                {/* Tools */}
                <InputGroup
                    label="Tools"
                    typeIndicator="[]"
                    handleData={toolsHandle}
                    helper={toolCount > 0 ? `${toolCount} tool(s) connected` : 'No tools connected'}
                >
                    <div />
                </InputGroup>

                {/* Chat Input */}
                <InputGroup
                    label="Chat Input"
                    typeIndicator="string"
                    handleData={dataInputs.find(h => h.id === 'chat-input')}
                >
                    <TextareaInput
                        rows={2}
                        placeholder="Enter message..."
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

AgentNode.displayName = 'AgentNode';
