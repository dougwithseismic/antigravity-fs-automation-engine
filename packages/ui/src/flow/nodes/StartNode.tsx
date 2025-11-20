import { memo } from 'react';
import { type NodeProps, type Node } from '@xyflow/react';
import { Play } from 'lucide-react';
import { NodeContainer, nodeStyles } from '../shared/node-base';
import { InputGroup } from '../primitives/InputGroup';
import { TextareaInput } from '../primitives/TextareaInput';
import { OutputGroup } from '../primitives/OutputGroup';
import { OutputItem } from '../primitives/OutputItem';

export interface StartNodeData {
    label?: string;
    description?: string;
    payload?: string;
    handles?: any[];
}

/**
 * StartNode - Entry point for workflows
 * Displays initial payload configuration
 */
export const StartNode = memo(({ data, selected }: NodeProps<Node<StartNodeData>>) => {
    const handles = (data.handles as any[]) || [];
    const dataOutputs = handles.filter(h => h.type === 'source' && h.dataType !== 'flow');

    return (
        <NodeContainer
            id="start"
            selected={selected}
            type="start"
            label={data.label || 'Start'}
            description={data.description || 'Entry point for workflow execution'}
            icon={<Play className="h-4 w-4" />}
            handles={handles}
        >
            <div className={nodeStyles.body}>
                <InputGroup
                    label="Initial Payload"
                    typeIndicator="json"
                >
                    <TextareaInput
                        placeholder='{"userId": "123", "email": "demo@example.com"}'
                        defaultValue={data.payload}
                        rows={3}
                        onChange={(e) => {
                            console.log('Payload changed:', e.target.value);
                        }}
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

StartNode.displayName = 'StartNode';
