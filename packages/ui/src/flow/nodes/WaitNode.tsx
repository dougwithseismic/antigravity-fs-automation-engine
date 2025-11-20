import { memo } from 'react';
import { type NodeProps, type Node } from '@xyflow/react';
import { Clock4 } from 'lucide-react';
import { NodeContainer, nodeStyles } from '../shared/node-base';
import { InputGroup } from '../primitives/InputGroup';
import { TextInput } from '../primitives/TextInput';
import { SelectInput } from '../primitives/SelectInput';
import { TextareaInput } from '../primitives/TextareaInput';
import { OutputGroup } from '../primitives/OutputGroup';
import { OutputItem } from '../primitives/OutputItem';

export interface WaitNodeData {
    label?: string;
    description?: string;
    amount?: string | number;
    unit?: 'seconds' | 'minutes' | 'hours' | 'days';
    handles?: any[];
}

/**
 * WaitNode - Pause workflow execution
 * Shows countdown visualization and delay configuration
 */
export const WaitNode = memo(({ data, selected }: NodeProps<Node<WaitNodeData>>) => {
    const handles = (data.handles as any[]) || [];
    const dataInputs = handles.filter(h => h.type === 'target' && h.dataType !== 'flow');
    const dataOutputs = handles.filter(h => h.type === 'source' && h.dataType !== 'flow');

    const amount = data.amount || 10;
    const unit = data.unit || 'seconds';

    // Calculate total seconds for visualization
    const multipliers = { seconds: 1, minutes: 60, hours: 3600, days: 86400 };
    const totalSeconds = Number(amount) * multipliers[unit];

    const getDurationDisplay = () => {
        if (totalSeconds < 60) return `${totalSeconds}s`;
        if (totalSeconds < 3600) return `${Math.floor(totalSeconds / 60)}m`;
        if (totalSeconds < 86400) return `${Math.floor(totalSeconds / 3600)}h`;
        return `${Math.floor(totalSeconds / 86400)}d`;
    };

    return (
        <NodeContainer
            id="wait"
            selected={selected}
            type="wait"
            label={data.label || 'Wait'}
            description={data.description || 'Pause execution'}
            icon={<Clock4 className="h-4 w-4" />}
            handles={handles}
            duration={getDurationDisplay()}
        >
            <div className={nodeStyles.body}>
                {/* Duration Preview */}
                <div className="mb-3 flex items-center justify-center gap-2 rounded-lg bg-orange-500/10 px-4 py-3">
                    <Clock4 className="h-5 w-5 text-orange-400" />
                    <span className="text-lg font-bold text-orange-300">{amount} {unit}</span>
                </div>

                {/* Amount Input */}
                <InputGroup
                    label="Amount"
                    typeIndicator="number"
                    required
                    handleData={dataInputs.find(h => h.id === 'amount')}
                >
                    <TextInput
                        type="number"
                        min="1"
                        placeholder="10"
                        defaultValue={amount}
                    />
                </InputGroup>

                {/* Unit Select */}
                <InputGroup
                    label="Unit"
                    handleData={dataInputs.find(h => h.id === 'unit')}
                >
                    <SelectInput defaultValue={unit}>
                        <option value="seconds">Seconds</option>
                        <option value="minutes">Minutes</option>
                        <option value="hours">Hours</option>
                        <option value="days">Days</option>
                    </SelectInput>
                </InputGroup>

                {/* Resume Payload */}
                <InputGroup
                    label="Resume Payload"
                    typeIndicator="json"
                    handleData={dataInputs.find(h => h.id === 'resumePayload')}
                >
                    <TextareaInput
                        placeholder='{"reason": "delayed_retry"}'
                        rows={2}
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

WaitNode.displayName = 'WaitNode';
