import { memo } from 'react';
import { type NodeProps, type Node } from '@xyflow/react';
import { FileText } from 'lucide-react';
import { NodeContainer, nodeStyles } from '../shared/node-base';
import { InputGroup } from '../primitives/InputGroup';
import { TextInput } from '../primitives/TextInput';
import { OutputGroup } from '../primitives/OutputGroup';
import { OutputItem } from '../primitives/OutputItem';

export interface VariableNodeData {
    label?: string;
    description?: string;
    value?: string;
    dataType?: 'string' | 'number' | 'boolean' | 'json';
    handles?: any[];
}

/**
 * VariableNode - A simple node for storing and passing data
 * Minimal UI with just a value input and output handle
 */
export const VariableNode = memo(({ data, selected }: NodeProps<Node<VariableNodeData>>) => {
    const handles = (data.handles as any[]) || [];
    const dataOutputs = handles.filter(h => h.type === 'source' && h.dataType !== 'flow');
    const dataType = data.dataType || 'string';

    return (
        <NodeContainer
            id="variable"
            selected={selected}
            type="variable"
            label={data.label || 'Variable'}
            description={data.description}
            icon={<FileText className="h-4 w-4" />}
            handles={handles}
            className="flow-node--compact"
        >
            <div className={nodeStyles.body}>
                <InputGroup
                    label="Value"
                    typeIndicator={dataType}
                >
                    <TextInput
                        type="text"
                        placeholder={`Enter ${dataType}...`}
                        defaultValue={data.value}
                        onChange={(e) => {
                            console.log('Variable changed:', e.target.value);
                        }}
                    />
                </InputGroup>
            </div>

            {/* Data Output Handle */}
            {dataOutputs.length > 0 && (
                <OutputGroup>
                    {dataOutputs.map((handle) => (
                        <OutputItem
                            key={handle.id}
                            label={handle.label || 'Value'}
                            handleData={handle}
                        />
                    ))}
                </OutputGroup>
            )}
        </NodeContainer>
    );
});

VariableNode.displayName = 'VariableNode';
