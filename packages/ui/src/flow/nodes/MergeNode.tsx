import { memo } from 'react';
import { type NodeProps, type Node } from '@xyflow/react';
import { Merge, GitMerge } from 'lucide-react';
import { NodeContainer, nodeStyles } from '../shared/node-base';
import { InputGroup } from '../primitives/InputGroup';
import { SelectInput } from '../primitives/SelectInput';
import { TextInput } from '../primitives/TextInput';
import { OutputGroup } from '../primitives/OutputGroup';
import { OutputItem } from '../primitives/OutputItem';

export interface MergeNodeData extends Record<string, unknown> {
    label?: string;
    description?: string;
    mode?: 'append' | 'combine-by-position' | 'combine-by-fields';
    mergeKey?: string;
    continueOnPartialFailure?: boolean;
    handles?: any[];
}

/**
 * MergeNode - Waits for multiple inputs and combines data
 * Implements Promise.all pattern for workflow synchronization
 */
export const MergeNode = memo(({ data, selected }: NodeProps<Node<MergeNodeData>>) => {
    const handles = (data.handles as any[]) || [];
    const dataInputs = handles.filter(h => h.type === 'target' && h.dataType !== 'flow');
    const dataOutputs = handles.filter(h => h.type === 'source' && h.dataType !== 'flow');
    const flowInputs = handles.filter(h => h.type === 'target' && h.dataType === 'flow');

    const mode = data.mode || 'append';
    const showMergeKey = mode === 'combine-by-fields';

    // Visual representation of merge operation
    const getModeSymbol = () => {
        switch (mode) {
            case 'append': return '[...A, ...B]';
            case 'combine-by-position': return 'zip(A, B)';
            case 'combine-by-fields': return `join(${data.mergeKey || 'id'})`;
            default: return '[...]';
        }
    };

    return (
        <NodeContainer
            id="merge"
            selected={selected}
            type="merge"
            label={data.label || 'Wait for All'}
            description={data.description || 'Synchronize branches'}
            icon={<GitMerge className="h-4 w-4" />}
            handles={handles}
            duration="Instant"
        >
            <div className={nodeStyles.body}>
                {/* Visual Operation Preview */}
                <div className="mb-3 rounded-lg bg-slate-800/50 px-3 py-2 font-mono text-xs text-center">
                    <span className="text-blue-400">{getModeSymbol()}</span>
                </div>

                {/* Combine Mode */}
                <InputGroup
                    label="Combine Mode"
                    typeIndicator="enum"
                    required
                >
                    <SelectInput defaultValue={mode}>
                        <option value="append">Append (concat arrays)</option>
                        <option value="combine-by-position">Combine by Position (zip)</option>
                        <option value="combine-by-fields">Combine by Fields (join)</option>
                    </SelectInput>
                </InputGroup>

                {/* Merge Key (conditional) */}
                {showMergeKey && (
                    <InputGroup
                        label="Merge Key"
                        typeIndicator="string"
                        required
                        helper="Field name to join on (e.g., 'id')"
                    >
                        <TextInput
                            placeholder="id"
                            defaultValue={data.mergeKey || 'id'}
                        />
                    </InputGroup>
                )}

                {/* Continue on Partial Failure */}
                <InputGroup
                    label="Continue on Failure"
                    typeIndicator="boolean"
                >
                    <SelectInput defaultValue={data.continueOnPartialFailure ? 'true' : 'false'}>
                        <option value="false">Fail if any fails</option>
                        <option value="true">Skip failed inputs</option>
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

MergeNode.displayName = 'MergeNode';
