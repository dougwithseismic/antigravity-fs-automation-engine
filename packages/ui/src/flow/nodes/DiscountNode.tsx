import { memo } from 'react';
import { type NodeProps, type Node } from '@xyflow/react';
import { Tag } from 'lucide-react';
import { NodeContainer, nodeStyles } from '../shared/node-base';
import { InputGroup } from '../primitives/InputGroup';
import { TextInput } from '../primitives/TextInput';
import { OutputGroup } from '../primitives/OutputGroup';
import { OutputItem } from '../primitives/OutputItem';

export interface DiscountNodeData {
    label?: string;
    description?: string;
    percentage?: string | number;
    prefix?: string;
    handles?: any[];
}

/**
 * DiscountNode - Generate discount codes
 * Shows discount percentage and code preview
 */
export const DiscountNode = memo(({ data, selected }: NodeProps<Node<DiscountNodeData>>) => {
    const handles = (data.handles as any[]) || [];
    const dataInputs = handles.filter(h => h.type === 'target' && h.dataType !== 'flow');
    const dataOutputs = handles.filter(h => h.type === 'source' && h.dataType !== 'flow');

    const percentage = data.percentage || 10;
    const prefix = data.prefix || 'WELCOME';
    const previewCode = `${prefix}${percentage}-XXXXX`;

    return (
        <NodeContainer
            id="discount"
            selected={selected}
            type="discount"
            label={data.label || 'Discount Code'}
            description={data.description || 'Generate discount codes'}
            icon={<Tag className="h-4 w-4" />}
            handles={handles}
        >
            <div className={nodeStyles.body}>
                {/* Discount Preview */}
                <div className="mb-3 rounded-lg bg-gradient-to-r from-pink-500/20 to-purple-500/20 p-4 text-center">
                    <div className="text-3xl font-bold text-pink-300">{percentage}% OFF</div>
                    <div className="mt-1 font-mono text-xs text-gray-400">{previewCode}</div>
                </div>

                {/* Discount Percentage */}
                <InputGroup
                    label="Discount %"
                    typeIndicator="number"
                    required
                    handleData={dataInputs.find(h => h.id === 'percentage')}
                >
                    <TextInput
                        type="number"
                        min="1"
                        max="100"
                        placeholder="10"
                        defaultValue={percentage}
                    />
                </InputGroup>

                {/* Code Prefix */}
                <InputGroup
                    label="Code Prefix"
                    handleData={dataInputs.find(h => h.id === 'prefix')}
                >
                    <TextInput
                        type="text"
                        placeholder="WELCOME"
                        defaultValue={prefix}
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

DiscountNode.displayName = 'DiscountNode';
