import { memo } from 'react';
import { type NodeProps, type Node } from '@xyflow/react';
import { FormInput, User, Mail } from 'lucide-react';
import { NodeContainer, nodeStyles } from '../shared/node-base';
import { InputGroup } from '../primitives/InputGroup';
import { TextInput } from '../primitives/TextInput';
import { OutputGroup } from '../primitives/OutputGroup';
import { OutputItem } from '../primitives/OutputItem';

export interface BannerFormNodeData {
    label?: string;
    description?: string;
    message?: string;
    handles?: any[];
}

/**
 * BannerFormNode - Display client-side banner form
 * Shows form preview with fields
 */
export const BannerFormNode = memo(({ data, selected }: NodeProps<Node<BannerFormNodeData>>) => {
    const handles = (data.handles as any[]) || [];
    const dataInputs = handles.filter(h => h.type === 'target' && h.dataType !== 'flow');
    const dataOutputs = handles.filter(h => h.type === 'source' && h.dataType !== 'flow');

    const message = data.message || 'Submit your information';

    return (
        <NodeContainer
            id="banner-form"
            selected={selected}
            type="banner-form"
            label={data.label || 'Banner Form'}
            description={data.description || 'Client-side form'}
            icon={<FormInput className="h-4 w-4" />}
            handles={handles}
            className="border-2 border-dashed border-yellow-500/30"
        >
            <div className={nodeStyles.body}>
                {/* Client Indicator */}
                <div className="mb-3 rounded bg-yellow-500/10 px-2 py-1 text-center text-xs font-semibold text-yellow-400">
                    CLIENT-SIDE
                </div>

                {/* Form Preview */}
                <div className="mb-3 rounded-lg border border-gray-700 bg-slate-800/50 p-3">
                    <div className="mb-2 text-sm font-medium text-gray-300">{message}</div>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 rounded border border-gray-600 bg-gray-800/50 px-2 py-1">
                            <User className="h-3 w-3 text-gray-400" />
                            <span className="text-xs text-gray-500">Name</span>
                        </div>
                        <div className="flex items-center gap-2 rounded border border-gray-600 bg-gray-800/50 px-2 py-1">
                            <Mail className="h-3 w-3 text-gray-400" />
                            <span className="text-xs text-gray-500">Email</span>
                        </div>
                    </div>
                </div>

                {/* Message Input */}
                <InputGroup
                    label="Banner Message"
                    typeIndicator="string"
                    handleData={dataInputs.find(h => h.id === 'message')}
                >
                    <TextInput
                        placeholder="Get 10% off!"
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

BannerFormNode.displayName = 'BannerFormNode';
