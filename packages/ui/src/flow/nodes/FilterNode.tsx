import { memo } from 'react';
import { type NodeProps, type Node } from '@xyflow/react';
import { Filter } from 'lucide-react';
import { NodeContainer, nodeStyles } from '../shared/node-base';
import { InputGroup } from '../primitives/InputGroup';
import { TextInput } from '../primitives/TextInput';
import { SelectInput } from '../primitives/SelectInput';
import { OutputGroup } from '../primitives/OutputGroup';
import { OutputItem } from '../primitives/OutputItem';

export interface FilterNodeData {
    label?: string;
    description?: string;
    field?: string;
    operator?: 'equals' | 'contains' | 'exists';
    value?: string;
    handles?: any[];
}

/**
 * FilterNode - Filter data based on conditions
 * Shows filter expression preview
 */
export const FilterNode = memo(({ data, selected }: NodeProps<Node<FilterNodeData>>) => {
    const handles = (data.handles as any[]) || [];
    const dataInputs = handles.filter(h => h.type === 'target' && h.dataType !== 'flow');
    const dataOutputs = handles.filter(h => h.type === 'source' && h.dataType !== 'flow');

    const field = data.field || 'field';
    const operator = data.operator || 'equals';
    const value = data.value || '';

    return (
        <NodeContainer
            id="filter"
            selected={selected}
            type="filter"
            label={data.label || 'Filter'}
            description={data.description || 'Filter data by condition'}
            icon={<Filter className="h-4 w-4" />}
            handles={handles}
        >
            <div className={nodeStyles.body}>
                {/* Filter Expression Preview */}
                <div className="mb-3 rounded-lg bg-slate-800/50 px-3 py-2 font-mono text-xs">
                    <span className="text-blue-400">{field || '...'}</span>
                    {' '}
                    <span className="text-purple-400">{operator}</span>
                    {operator !== 'exists' && (
                        <>
                            {' '}
                            <span className="text-green-400">"{value || '...'}"</span>
                        </>
                    )}
                </div>

                {/* Field Path */}
                <InputGroup
                    label="Field"
                    required
                    handleData={dataInputs.find(h => h.id === 'field')}
                >
                    <TextInput
                        type="text"
                        placeholder="user.id"
                        defaultValue={data.field}
                    />
                </InputGroup>

                {/* Operator */}
                <InputGroup
                    label="Operator"
                    handleData={dataInputs.find(h => h.id === 'operator')}
                >
                    <SelectInput defaultValue={operator}>
                        <option value="equals">Equals</option>
                        <option value="contains">Contains</option>
                        <option value="exists">Exists</option>
                    </SelectInput>
                </InputGroup>

                {/* Value (hidden for 'exists' operator) */}
                {operator !== 'exists' && (
                    <InputGroup
                        label="Value"
                        handleData={dataInputs.find(h => h.id === 'value')}
                    >
                        <TextInput
                            type="text"
                            placeholder="12345"
                            defaultValue={data.value}
                        />
                    </InputGroup>
                )}
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

FilterNode.displayName = 'FilterNode';
