import { memo } from 'react';
import { type NodeProps, type Node } from '@xyflow/react';
import { MessageSquare } from 'lucide-react';
import { NodeContainer, nodeStyles } from '../shared/node-base';
import { InputGroup } from '../primitives/InputGroup';
import { TextareaInput } from '../primitives/TextareaInput';
import { OutputGroup } from '../primitives/OutputGroup';
import { OutputItem } from '../primitives/OutputItem';

export interface WindowAlertNodeData {
    label?: string;
    description?: string;
    message?: string;
    handles?: any[];
}

/**
 * WindowAlertNode - Display client-side alert
 * Shows alert preview with template variables
 */
export const WindowAlertNode = memo(({ data, selected }: NodeProps<Node<WindowAlertNodeData>>) => {
    const handles = (data.handles as any[]) || [];
    const dataInputs = handles.filter(h => h.type === 'target' && h.dataType !== 'flow');
    const dataOutputs = handles.filter(h => h.type === 'source' && h.dataType !== 'flow');

    const message = data.message || 'Your code is: {{code}}';

    return (
        <NodeContainer
            id="window-alert"
            selected={selected}
            type="window-alert"
            label={data.label || 'Window Alert'}
            description={data.description || 'Client-side alert'}
            icon={<MessageSquare className="h-4 w-4" />}
            handles={handles}
            className="border-2 border-dashed border-yellow-500/30"
        >
            <div className={nodeStyles.body}>
                {/* Client Indicator */}
                <div className="mb-3 rounded bg-yellow-500/10 px-2 py-1 text-center text-xs font-semibold text-yellow-400">
                    CLIENT-SIDE
                </div>

                {/* Alert Preview */}
                <div className="mb-3 rounded-lg border-2 border-blue-500/30 bg-blue-500/5 p-3">
                    <div className="mb-1 flex items-center gap-2">
                        <MessageSquare className="h-4 w-4 text-blue-400" />
                        <span className="text-xs font-semibold text-blue-400">Alert</span>
                    </div>
                    <div className="font-mono text-xs text-gray-300">{message}</div>
                </div>

                {/* Message Input with Template Support */}
                <InputGroup
                    label="Message"
                    typeIndicator="template"
                    required
                    handleData={dataInputs.find(h => h.id === 'message')}
                    helper="Use {{variable}} for template variables"
                >
                    <TextareaInput
                        rows={3}
                        placeholder="Your code is: {{code}}"
                        defaultValue={message}
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

WindowAlertNode.displayName = 'WindowAlertNode';
