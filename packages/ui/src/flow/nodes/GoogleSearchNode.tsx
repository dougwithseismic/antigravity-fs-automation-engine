import { memo } from 'react';
import { type NodeProps, type Node } from '@xyflow/react';
import { Search } from 'lucide-react';
import { NodeContainer, nodeStyles } from '../shared/node-base';
import { InputGroup } from '../primitives/InputGroup';
import { TextInput } from '../primitives/TextInput';
import { OutputGroup } from '../primitives/OutputGroup';
import { OutputItem } from '../primitives/OutputItem';

export interface GoogleSearchNodeData {
    label?: string;
    description?: string;
    searchQuery?: string;
    handles?: any[];
}

/**
 * GoogleSearchNode - Interactive Google search mockup
 * Shows search results with traffic source selection
 */
export const GoogleSearchNode = memo(({ data, selected }: NodeProps<Node<GoogleSearchNodeData>>) => {
    const handles = (data.handles as any[]) || [];
    const dataInputs = handles.filter(h => h.type === 'target' && h.dataType !== 'flow');
    const dataOutputs = handles.filter(h => h.type === 'source' && h.dataType !== 'flow');

    const searchQuery = data.searchQuery || 'best running shoes 2025';

    return (
        <NodeContainer
            id="google-search"
            selected={selected}
            type="google-search"
            label={data.label || 'Google Search'}
            description={data.description || 'Interactive search mockup'}
            icon={<Search className="h-4 w-4" />}
            handles={handles}
            className="border-2 border-dashed border-yellow-500/30"
        >
            <div className={nodeStyles.body}>
                {/* Client Indicator */}
                <div className="mb-3 rounded bg-yellow-500/10 px-2 py-1 text-center text-xs font-semibold text-yellow-400">
                    CLIENT-SIDE
                </div>

                {/* Search Mockup Preview */}
                <div className="mb-3 rounded-lg border border-gray-700 bg-slate-800/50 p-3">
                    <div className="mb-2 flex items-center gap-2 rounded border border-gray-600 bg-white/5 px-2 py-1">
                        <Search className="h-3 w-3 text-gray-400" />
                        <span className="text-xs text-gray-400">{searchQuery}</span>
                    </div>

                    {/* Traffic Source Options */}
                    <div className="mt-2 space-y-1">
                        <div className="rounded bg-yellow-500/10 px-2 py-1">
                            <span className="text-xs font-medium text-yellow-400">Ad •</span>
                            <span className="ml-1 text-xs text-gray-400">PPC Result</span>
                        </div>
                        <div className="rounded bg-blue-500/10 px-2 py-1">
                            <span className="text-xs font-medium text-blue-400">Shopping •</span>
                            <span className="ml-1 text-xs text-gray-400">Product</span>
                        </div>
                        <div className="rounded bg-green-500/10 px-2 py-1">
                            <span className="text-xs font-medium text-green-400">Organic •</span>
                            <span className="ml-1 text-xs text-gray-400">Search Result</span>
                        </div>
                    </div>
                </div>

                {/* Search Query Input */}
                <InputGroup
                    label="Search Query"
                    handleData={dataInputs.find(h => h.id === 'searchQuery')}
                >
                    <TextInput
                        type="text"
                        placeholder="best running shoes 2025"
                        defaultValue={searchQuery}
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

GoogleSearchNode.displayName = 'GoogleSearchNode';
