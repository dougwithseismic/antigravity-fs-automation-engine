import { memo } from 'react';
import { type NodeProps, type Node } from '@xyflow/react';
import { Play } from 'lucide-react';
import {
    NodeCard,
    NodeHeader,
    NodeBody,
    NodeFooter,
    InputGroup,
    TextareaInput,
    OutputGroup,
    OutputItem,
    type NodeHandle
} from '../primitives';

export interface StartNodeData {
    label?: string;
    description?: string;
    payload?: string;
    handles?: any[];
}

/**
 * StartNode - Entry point for workflows
 * Built using the new primitive component system
 */
export const StartNode = memo(({ data, selected }: NodeProps<Node<StartNodeData>>) => {
    const handles = (data.handles as NodeHandle[]) || [];
    const dataOutputs = handles.filter(h => h.type === 'source' && h.dataType !== 'flow');

    return (
        <NodeCard
            state={{ selected }}
            top={
                <NodeHeader
                    icon={<Play className="h-4 w-4" />}
                    title={data.label || 'Start'}
                    description={data.description || 'Entry point for workflow execution'}
                    badge="trigger"
                />
            }
            middle={
                <NodeBody>
                    <InputGroup
                        label="Initial Payload"
                        typeIndicator="json"
                        helper="JSON object passed to the first node"
                    >
                        <TextareaInput
                            rows={3}
                            placeholder='{"userId": "123", "email": "demo@example.com"}'
                            defaultValue={data.payload}
                            onChange={(e) => {
                                console.log('Payload changed:', e.target.value);
                            }}
                        />
                    </InputGroup>
                </NodeBody>
            }
            bottom={
                <>
                    <NodeFooter type="trigger" duration="Instant" />

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
                </>
            }
            handles={handles}
        />
    );
});

StartNode.displayName = 'StartNode';
