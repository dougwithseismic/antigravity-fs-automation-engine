import { memo } from 'react';
import { type NodeProps, type Node } from '@xyflow/react';
import { Mail, Send } from 'lucide-react';
import { NodeContainer, nodeStyles } from '../shared/node-base';
import { InputGroup } from '../primitives/InputGroup';
import { TextInput } from '../primitives/TextInput';
import { TextareaInput } from '../primitives/TextareaInput';
import { SelectInput } from '../primitives/SelectInput';
import { OutputGroup } from '../primitives/OutputGroup';
import { OutputItem } from '../primitives/OutputItem';

export interface EmailNodeData {
    label?: string;
    description?: string;
    provider?: string;
    templateId?: string;
    to?: string;
    handles?: any[];
}

/**
 * EmailNode - Send transactional emails
 * Shows provider, template, and recipient preview
 */
export const EmailNode = memo(({ data, selected }: NodeProps<Node<EmailNodeData>>) => {
    const handles = (data.handles as any[]) || [];
    const dataInputs = handles.filter(h => h.type === 'target' && h.dataType !== 'flow');
    const dataOutputs = handles.filter(h => h.type === 'source' && h.dataType !== 'flow');

    const provider = data.provider || 'klaviyo';
    const to = data.to || '';

    return (
        <NodeContainer
            id="email"
            selected={selected}
            type="email"
            label={data.label || 'Send Email'}
            description={data.description || 'Transactional email'}
            icon={<Mail className="h-4 w-4" />}
            handles={handles}
        >
            <div className={nodeStyles.body}>
                {/* Email Preview */}
                {to && (
                    <div className="mb-3 flex items-center gap-2 rounded-lg bg-blue-500/10 px-3 py-2">
                        <Send className="h-4 w-4 text-blue-400" />
                        <div className="flex-1 overflow-hidden">
                            <div className="truncate text-xs font-medium text-blue-300">{to}</div>
                            <div className="text-xs text-gray-400">via {provider}</div>
                        </div>
                    </div>
                )}

                {/* Provider Selection */}
                <InputGroup
                    label="Provider"
                    typeIndicator="string"
                    required
                    handleData={dataInputs.find(h => h.id === 'provider')}
                >
                    <SelectInput defaultValue={provider}>
                        <option value="klaviyo">Klaviyo</option>
                        <option value="sendgrid">SendGrid</option>
                        <option value="mailgun">Mailgun</option>
                    </SelectInput>
                </InputGroup>

                {/* Template ID */}
                <InputGroup
                    label="Template ID"
                    typeIndicator="string"
                    required
                    handleData={dataInputs.find(h => h.id === 'templateId')}
                >
                    <TextInput
                        placeholder="welcome_offer"
                        defaultValue={data.templateId}
                    />
                </InputGroup>

                {/* To Email */}
                <InputGroup
                    label="To Email"
                    typeIndicator="string"
                    required
                    handleData={dataInputs.find(h => h.id === 'to')}
                >
                    <TextInput
                        type="email"
                        placeholder="user@example.com"
                        defaultValue={data.to}
                    />
                </InputGroup>

                {/* Variables */}
                <InputGroup
                    label="Variables"
                    typeIndicator="json"
                    handleData={dataInputs.find(h => h.id === 'variables')}
                >
                    <TextareaInput
                        rows={2}
                        placeholder='{"code": "...", "name": "..."}'
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

EmailNode.displayName = 'EmailNode';
