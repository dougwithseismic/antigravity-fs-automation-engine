import { memo } from 'react';
import { type NodeProps, type Node } from '@xyflow/react';
import { Key, Shield } from 'lucide-react';
import { NodeContainer, nodeStyles } from '../shared/node-base';
import { InputGroup } from '../primitives/InputGroup';
import { TextInput } from '../primitives/TextInput';
import { OutputGroup } from '../primitives/OutputGroup';
import { OutputItem } from '../primitives/OutputItem';

export interface CredentialNodeData {
    label?: string;
    description?: string;
    key?: string;
    handles?: any[];
}

/**
 * CredentialNode - Load credentials from environment
 * Shows secure credential access with masked value
 */
export const CredentialNode = memo(({ data, selected }: NodeProps<Node<CredentialNodeData>>) => {
    const handles = (data.handles as any[]) || [];
    const dataOutputs = handles.filter(h => h.type === 'source' && h.dataType !== 'flow');

    return (
        <NodeContainer
            id="credential"
            selected={selected}
            type="credential"
            label={data.label || 'Credentials'}
            description={data.description || 'Load from environment'}
            icon={<Key className="h-4 w-4" />}
            handles={handles}
            className="flow-node--compact"
        >
            <div className={nodeStyles.body}>
                {/* Security Badge */}
                <div className="mb-3 flex items-center gap-2 rounded-lg bg-green-500/10 px-3 py-2">
                    <Shield className="h-4 w-4 text-green-400" />
                    <span className="text-xs font-medium text-green-300">Secure Environment Variable</span>
                </div>

                {/* Environment Variable Key */}
                <InputGroup
                    label="Environment Variable"
                    required
                >
                    <TextInput
                        type="text"
                        placeholder="OPENAI_API_KEY"
                        defaultValue={data.key}
                    />
                </InputGroup>

                {/* Value Preview (masked) */}
                {data.key && (
                    <div className="mt-2 rounded bg-slate-800/50 px-3 py-2">
                        <div className="font-mono text-xs text-gray-400">
                            {data.key} = <span className="text-gray-500">••••••••••••</span>
                        </div>
                    </div>
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

CredentialNode.displayName = 'CredentialNode';
