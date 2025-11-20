import { memo } from 'react';
import { type NodeProps, type Node } from '@xyflow/react';
import { GitBranch } from 'lucide-react';
import { NodeContainer, nodeStyles } from '../shared/node-base';
import { InputGroup } from '../primitives/InputGroup';
import { TextInput } from '../primitives/TextInput';
import { SelectInput } from '../primitives/SelectInput';
import { OutputGroup } from '../primitives/OutputGroup';
import { OutputItem } from '../primitives/OutputItem';

export interface ConditionNodeData {
    label?: string;
    description?: string;
    key?: string;
    operator?: string;
    value?: string;
    handles?: any[];
}

/**
 * ConditionNode - Evaluates a condition and routes workflow
 * Shows the comparison being made visually
 */
export const ConditionNode = memo(({ data, selected }: NodeProps<Node<ConditionNodeData>>) => {
    const handles = (data.handles as any[]) || [];
    const dataInputs = handles.filter(h => h.type === 'target' && h.dataType !== 'flow');
    const dataOutputs = handles.filter(h => h.type === 'source' && h.dataType !== 'flow');

    const operator = data.operator || '==';
    const key = data.key || 'value';
    const value = data.value || '';

    return (
        <NodeContainer
            id="condition"
            selected={selected}
            type="condition"
            label={data.label || 'Condition'}
            description={data.description || 'Evaluate and route'}
            icon={<GitBranch className="h-4 w-4" />}
            handles={handles}
        >
            <div className={nodeStyles.body}>
                {/* Visual Condition Preview */}
                <div className="mb-3 rounded-lg bg-slate-800/50 px-3 py-2 font-mono text-xs">
                    <span className="text-blue-400">{key || '...'}</span>
                    {' '}
                    <span className="text-purple-400">{operator}</span>
                    {' '}
                    <span className="text-green-400">"{value || '...'}"</span>
                </div>

                {/* Key Path */}
                <InputGroup
                    label="Key Path"
                    typeIndicator="string"
                    required
                    handleData={dataInputs.find(h => h.id === 'key')}
                >
                    <TextInput
                        placeholder="query.utm_source"
                        defaultValue={data.key}
                    />
                </InputGroup>

                {/* Operator */}
                <InputGroup
                    label="Operator"
                    typeIndicator="string"
                    handleData={dataInputs.find(h => h.id === 'operator')}
                >
                    <SelectInput defaultValue={operator}>
                        <option value="==">Equals (==)</option>
                        <option value="===">Strict Equals (===)</option>
                        <option value="!=">Not Equals (!=)</option>
                        <option value=">">Greater Than (&gt;)</option>
                        <option value="<">Less Than (&lt;)</option>
                        <option value=">=">Greater or Equal (&gt;=)</option>
                        <option value="<=">Less or Equal (&lt;=)</option>
                        <option value="contains">Contains</option>
                    </SelectInput>
                </InputGroup>

                {/* Value */}
                <InputGroup
                    label="Value"
                    typeIndicator="string"
                    required
                    handleData={dataInputs.find(h => h.id === 'value')}
                >
                    <TextInput
                        placeholder="ppc"
                        defaultValue={data.value}
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

ConditionNode.displayName = 'ConditionNode';
