import { memo } from 'react';
import { type NodeProps, type Node } from '@xyflow/react';
import { Link2 } from 'lucide-react';
import { NodeContainer, nodeStyles } from '../shared/node-base';
import { InputGroup } from '../primitives/InputGroup';
import { TextInput } from '../primitives/TextInput';
import { OutputGroup } from '../primitives/OutputGroup';
import { OutputItem } from '../primitives/OutputItem';

export interface ExtractQueryParamsNodeData {
    label?: string;
    description?: string;
    url?: string;
    handles?: any[];
}

/**
 * ExtractQueryParamsNode - Parse URL query parameters
 * Shows URL input with extraction preview
 */
export const ExtractQueryParamsNode = memo(({ data, selected }: NodeProps<Node<ExtractQueryParamsNodeData>>) => {
    const handles = (data.handles as any[]) || [];
    const dataInputs = handles.filter(h => h.type === 'target' && h.dataType !== 'flow');
    const dataOutputs = handles.filter(h => h.type === 'source' && h.dataType !== 'flow');

    // Try to parse the URL to show preview
    let paramPreview: Record<string, string> = {};
    if (data.url) {
        try {
            const url = new URL(data.url);
            paramPreview = Object.fromEntries(url.searchParams.entries());
        } catch {
            // Invalid URL, ignore
        }
    }

    return (
        <NodeContainer
            id="extract-query-params"
            selected={selected}
            type="extract-query-params"
            label={data.label || 'Extract Query Params'}
            description={data.description || 'Parse URL parameters'}
            icon={<Link2 className="h-4 w-4" />}
            handles={handles}
        >
            <div className={nodeStyles.body}>
                {/* URL Input */}
                <InputGroup
                    label="URL"
                    required
                    handleData={dataInputs.find(h => h.id === 'url')}
                >
                    <TextInput
                        type="text"
                        placeholder="https://example.com?utm_source=ppc"
                        defaultValue={data.url}
                    />
                </InputGroup>

                {/* Parameter Preview */}
                {Object.keys(paramPreview).length > 0 && (
                    <div className="mt-3 rounded-lg bg-slate-800/50 p-3">
                        <div className="mb-1 text-xs font-semibold text-gray-400">Extracted Parameters:</div>
                        <div className="space-y-1">
                            {Object.entries(paramPreview).map(([key, value]) => (
                                <div key={key} className="font-mono text-xs">
                                    <span className="text-blue-400">{key}</span>
                                    <span className="text-gray-500"> = </span>
                                    <span className="text-green-400">"{value}"</span>
                                </div>
                            ))}
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

ExtractQueryParamsNode.displayName = 'ExtractQueryParamsNode';
