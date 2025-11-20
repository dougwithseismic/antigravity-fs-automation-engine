import { memo } from 'react';
import { type NodeProps, type Node } from '@xyflow/react';
import { Globe } from 'lucide-react';
import { NodeContainer, nodeStyles } from '../shared/node-base';
import { InputGroup } from '../primitives/InputGroup';
import { TextInput } from '../primitives/TextInput';
import { SelectInput } from '../primitives/SelectInput';
import { TextareaInput } from '../primitives/TextareaInput';
import { OutputGroup } from '../primitives/OutputGroup';
import { OutputItem } from '../primitives/OutputItem';
import { cn } from '../../lib/utils';

export interface FetchNodeData {
    label?: string;
    description?: string;
    url?: string;
    method?: string;
    headers?: string;
    body?: string;
    handles?: any[];
}

/**
 * FetchNode - HTTP Request node
 * Displays method, URL, and request configuration
 */
export const FetchNode = memo(({ data, selected }: NodeProps<Node<FetchNodeData>>) => {
    const handles = (data.handles as any[]) || [];
    const dataInputs = handles.filter(h => h.type === 'target' && h.dataType !== 'flow');
    const dataOutputs = handles.filter(h => h.type === 'source' && h.dataType !== 'flow');

    const method = data.method || 'GET';
    const methodColors: Record<string, string> = {
        GET: 'text-green-400',
        POST: 'text-blue-400',
        PUT: 'text-yellow-400',
        DELETE: 'text-red-400'
    };

    return (
        <NodeContainer
            id="fetch"
            selected={selected}
            type="fetch"
            label={data.label || 'HTTP Request'}
            description={data.description}
            icon={<Globe className="h-4 w-4" />}
            handles={handles}
        >
            <div className={nodeStyles.body}>
                {/* Method Badge */}
                <div className="mb-2 flex items-center gap-2">
                    <span className={cn('text-xs font-bold', methodColors[method] || 'text-gray-400')}>
                        {method}
                    </span>
                    <span className="text-xs text-gray-500">HTTP Request</span>
                </div>

                {/* URL Input */}
                <InputGroup
                    label="URL"
                    required
                    handleData={dataInputs.find(h => h.id === 'url')}
                >
                    <TextInput
                        type="text"
                        placeholder="https://api.example.com"
                        defaultValue={data.url}
                    />
                </InputGroup>

                {/* Method Select */}
                <InputGroup
                    label="Method"
                    handleData={dataInputs.find(h => h.id === 'method')}
                >
                    <SelectInput defaultValue={method}>
                        <option value="GET">GET</option>
                        <option value="POST">POST</option>
                        <option value="PUT">PUT</option>
                        <option value="DELETE">DELETE</option>
                    </SelectInput>
                </InputGroup>

                {/* Headers */}
                <InputGroup
                    label="Headers"
                    typeIndicator="json"
                    handleData={dataInputs.find(h => h.id === 'headers')}
                >
                    <TextareaInput
                        placeholder='{"Content-Type": "application/json"}'
                        defaultValue={data.headers || '{}'}
                        rows={2}
                    />
                </InputGroup>

                {/* Body */}
                {(method === 'POST' || method === 'PUT') && (
                    <InputGroup
                        label="Body"
                        typeIndicator="json"
                        handleData={dataInputs.find(h => h.id === 'body')}
                    >
                        <TextareaInput
                            placeholder='{"key": "value"}'
                            defaultValue={data.body}
                            rows={2}
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

FetchNode.displayName = 'FetchNode';
