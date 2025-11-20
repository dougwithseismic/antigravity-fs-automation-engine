import { memo } from 'react';
import { type NodeProps, type Node } from '@xyflow/react';
import { Split } from 'lucide-react';
import { NodeContainer, nodeStyles } from '../shared/node-base';
import { InputGroup } from '../primitives/InputGroup';
import { TextInput } from '../primitives/TextInput';
import { TextareaInput } from '../primitives/TextareaInput';
import { SelectInput } from '../primitives/SelectInput';
import { OutputGroup } from '../primitives/OutputGroup';
import { OutputItem } from '../primitives/OutputItem';

export interface SwitchNodeData {
    label?: string;
    description?: string;
    switchKey?: string;
    options?: string | string[];
    randomize?: boolean;
    handles?: any[];
}

/**
 * SwitchNode - Route workflow based on value or random selection
 * Shows branching paths visually
 */
export const SwitchNode = memo(({ data, selected }: NodeProps<Node<SwitchNodeData>>) => {
    const handles = (data.handles as any[]) || [];
    const dataInputs = handles.filter(h => h.type === 'target' && h.dataType !== 'flow');
    const dataOutputs = handles.filter(h => h.type === 'source' && h.dataType !== 'flow');

    const options = Array.isArray(data.options)
        ? data.options
        : typeof data.options === 'string'
            ? data.options.split(',').map(o => o.trim())
            : [];

    return (
        <NodeContainer
            id="switch"
            selected={selected}
            type="switch"
            label={data.label || 'Switch'}
            description={data.description || 'Route based on value'}
            icon={<Split className="h-4 w-4" />}
            handles={handles}
        >
            <div className={nodeStyles.body}>
                {/* Branch Visualization */}
                {options.length > 0 && (
                    <div className="mb-3 flex flex-wrap gap-1">
                        {options.map((opt, idx) => (
                            <div
                                key={idx}
                                className="rounded bg-blue-500/20 px-2 py-1 text-xs font-medium text-blue-300"
                            >
                                {opt}
                            </div>
                        ))}
                    </div>
                )}

                {/* Switch Key */}
                <InputGroup
                    label="Route Key"
                    required
                    handleData={dataInputs.find(h => h.id === 'switchKey')}
                >
                    <TextInput
                        type="text"
                        placeholder="source"
                        defaultValue={data.switchKey}
                    />
                </InputGroup>

                {/* Options */}
                <InputGroup
                    label="Options"
                    typeIndicator="array"
                    handleData={dataInputs.find(h => h.id === 'options')}
                >
                    <TextareaInput
                        placeholder='["A", "B"]'
                        defaultValue={JSON.stringify(options)}
                        rows={2}
                    />
                </InputGroup>

                {/* Randomize */}
                <InputGroup
                    label="Randomize"
                >
                    <SelectInput defaultValue={data.randomize ? 'true' : 'false'}>
                        <option value="false">No - Use value</option>
                        <option value="true">Yes - Random selection</option>
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

SwitchNode.displayName = 'SwitchNode';
