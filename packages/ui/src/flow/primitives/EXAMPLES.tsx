/**
 * Comprehensive Examples of Flow Node Primitive Usage
 *
 * This file demonstrates various patterns and use cases
 * for building nodes with the primitive component system.
 */

import { memo } from 'react';
import { type NodeProps, type Node } from '@xyflow/react';
import { Play, Code, Database, Mail, Clock, Zap } from 'lucide-react';
import {
    NodeCard,
    NodeHeader,
    NodeBody,
    NodeFooter,
    InputGroup,
    TextInput,
    TextareaInput,
    SelectInput,
    InputSelector,
    OutputGroup,
    OutputItem,
    DataHandle,
    type NodeHandle
} from './index';

// ============================================================================
// EXAMPLE 1: Simple Node with Single Input
// ============================================================================

interface SimpleNodeData {
    label?: string;
    value?: string;
    handles?: NodeHandle[];
}

export const SimpleNode = memo(({ data, selected }: NodeProps<Node<SimpleNodeData>>) => {
    const handles = (data.handles as NodeHandle[]) || [];

    return (
        <NodeCard
            state={{ selected }}
            top={
                <NodeHeader
                    icon={<Play className="h-4 w-4" />}
                    title={data.label || 'Simple Node'}
                    badge="basic"
                />
            }
            middle={
                <NodeBody>
                    <InputGroup label="Value" typeIndicator="string">
                        <TextInput placeholder="Enter value" defaultValue={data.value} />
                    </InputGroup>
                </NodeBody>
            }
            bottom={<NodeFooter type="basic" />}
            handles={handles}
        />
    );
});

// ============================================================================
// EXAMPLE 2: Node with Multiple Input Types
// ============================================================================

interface MultiInputNodeData {
    label?: string;
    name?: string;
    mode?: string;
    config?: string;
    handles?: NodeHandle[];
}

export const MultiInputNode = memo(({ data, selected }: NodeProps<Node<MultiInputNodeData>>) => {
    const handles = (data.handles as NodeHandle[]) || [];

    return (
        <NodeCard
            state={{ selected }}
            top={
                <NodeHeader
                    icon={<Code className="h-4 w-4" />}
                    title={data.label || 'Multi-Input Node'}
                    description="Demonstrates various input types"
                    badge="example"
                />
            }
            middle={
                <NodeBody>
                    <InputGroup label="Name" typeIndicator="string" required>
                        <TextInput placeholder="Node name" defaultValue={data.name} />
                    </InputGroup>

                    <InputGroup label="Mode" typeIndicator="enum">
                        <SelectInput defaultValue={data.mode || 'auto'}>
                            <option value="auto">Automatic</option>
                            <option value="manual">Manual</option>
                            <option value="scheduled">Scheduled</option>
                        </SelectInput>
                    </InputGroup>

                    <InputGroup
                        label="Configuration"
                        typeIndicator="json"
                        helper="Valid JSON configuration object"
                    >
                        <TextareaInput
                            rows={4}
                            placeholder='{"key": "value"}'
                            defaultValue={data.config}
                            style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}
                        />
                    </InputGroup>
                </NodeBody>
            }
            bottom={<NodeFooter type="config" duration="Instant" />}
            handles={handles}
        />
    );
});

// ============================================================================
// EXAMPLE 3: Node with Data Handles and Outputs
// ============================================================================

interface DataNodeData {
    label?: string;
    query?: string;
    limit?: number;
    handles?: NodeHandle[];
}

export const DataNode = memo(({ data, selected }: NodeProps<Node<DataNodeData>>) => {
    const handles = (data.handles as NodeHandle[]) || [];
    const dataInputs = handles.filter(h => h.type === 'target' && h.dataType !== 'flow');
    const dataOutputs = handles.filter(h => h.type === 'source' && h.dataType !== 'flow');

    return (
        <NodeCard
            state={{ selected }}
            top={
                <NodeHeader
                    icon={<Database className="h-4 w-4" />}
                    title={data.label || 'Data Query'}
                    description="Query with dynamic inputs"
                    badge="data"
                />
            }
            middle={
                <NodeBody>
                    {/* Input with data handle */}
                    <InputGroup
                        label="SQL Query"
                        typeIndicator="sql"
                        required
                        handle={
                            dataInputs.find(h => h.id === 'query') && (
                                <DataHandle
                                    handle={dataInputs.find(h => h.id === 'query')!}
                                    position="left"
                                    style={{ top: '50%', transform: 'translateY(-50%)', left: -6 }}
                                />
                            )
                        }
                    >
                        <TextareaInput
                            rows={3}
                            placeholder="SELECT * FROM users"
                            defaultValue={data.query}
                        />
                    </InputGroup>

                    <InputGroup label="Limit" typeIndicator="number">
                        <TextInput type="number" defaultValue={String(data.limit || 100)} />
                    </InputGroup>
                </NodeBody>
            }
            bottom={
                <>
                    <NodeFooter type="data" duration="~100ms" />
                    {dataOutputs.length > 0 && (
                        <OutputGroup>
                            {dataOutputs.map((handle) => (
                                <OutputItem
                                    key={handle.id}
                                    label={handle.label || handle.id}
                                    handle={
                                        <DataHandle
                                            handle={handle}
                                            position="right"
                                            style={{ right: -6 }}
                                        />
                                    }
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

// ============================================================================
// EXAMPLE 4: Client-Side UI Node
// ============================================================================

interface UINodeData {
    label?: string;
    message?: string;
    style?: string;
    handles?: NodeHandle[];
}

export const UINode = memo(({ data, selected }: NodeProps<Node<UINodeData>>) => {
    const handles = (data.handles as NodeHandle[]) || [];

    return (
        <NodeCard
            state={{ selected }}
            variant="client"
            top={
                <NodeHeader
                    icon={<Zap className="h-4 w-4" />}
                    title={data.label || 'Alert'}
                    description="Client-side browser alert"
                    badge="ui"
                />
            }
            middle={
                <NodeBody>
                    {/* Client-side indicator */}
                    <div className="mb-3 rounded bg-yellow-500/10 px-2 py-1 text-center text-xs font-semibold text-yellow-400">
                        CLIENT-SIDE
                    </div>

                    <InputGroup label="Message" typeIndicator="string" required>
                        <TextareaInput
                            rows={2}
                            placeholder="Alert message"
                            defaultValue={data.message}
                        />
                    </InputGroup>

                    <InputGroup label="Style" typeIndicator="string">
                        <SelectInput defaultValue={data.style || 'info'}>
                            <option value="info">Info</option>
                            <option value="success">Success</option>
                            <option value="warning">Warning</option>
                            <option value="error">Error</option>
                        </SelectInput>
                    </InputGroup>
                </NodeBody>
            }
            bottom={<NodeFooter type="ui" duration="Instant" />}
            handles={handles}
        />
    );
});

// ============================================================================
// EXAMPLE 5: Node with Custom Content in Middle Slot
// ============================================================================

interface CustomContentNodeData {
    label?: string;
    status?: 'pending' | 'processing' | 'completed';
    handles?: NodeHandle[];
}

export const CustomContentNode = memo(({ data, selected }: NodeProps<Node<CustomContentNodeData>>) => {
    const handles = (data.handles as NodeHandle[]) || [];

    return (
        <NodeCard
            state={{ selected }}
            top={
                <NodeHeader
                    icon={<Clock className="h-4 w-4" />}
                    title={data.label || 'Status Tracker'}
                    description="Custom UI in middle slot"
                    badge="custom"
                />
            }
            middle={
                /* Custom content instead of NodeBody */
                <div className="p-4">
                    <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-400">Status</span>
                            <span className={`font-semibold ${
                                data.status === 'completed' ? 'text-green-400' :
                                data.status === 'processing' ? 'text-blue-400' :
                                'text-gray-400'
                            }`}>
                                {data.status || 'pending'}
                            </span>
                        </div>

                        {/* Custom progress bar */}
                        <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                            <div
                                className={`h-full transition-all duration-500 ${
                                    data.status === 'completed' ? 'bg-green-500 w-full' :
                                    data.status === 'processing' ? 'bg-blue-500 w-1/2' :
                                    'bg-gray-500 w-0'
                                }`}
                            />
                        </div>
                    </div>
                </div>
            }
            bottom={<NodeFooter type="status" duration="Variable" />}
            handles={handles}
        />
    );
});

// ============================================================================
// EXAMPLE 6: Node with InputSelector (Dynamic Input Selection)
// ============================================================================

interface InputSelectorNodeData {
    label?: string;
    selectedInput?: string;
    operation?: string;
    handles?: NodeHandle[];
}

export const InputSelectorNode = memo(({ data, selected }: NodeProps<Node<InputSelectorNodeData>>) => {
    const handles = (data.handles as NodeHandle[]) || [];

    return (
        <NodeCard
            state={{ selected }}
            top={
                <NodeHeader
                    icon={<Code className="h-4 w-4" />}
                    title={data.label || 'Transform'}
                    description="Process data from previous step"
                    badge="transform"
                />
            }
            middle={
                <NodeBody>
                    {/* Show selected input visually */}
                    <div className="mb-3">
                        <div className="text-xs text-slate-400 mb-2 font-semibold">Data Source</div>
                        <InputSelector
                            value={data.selectedInput || 'fetchNode.response'}
                            variant="blue"
                            prefix="from"
                        />
                    </div>

                    {/* Preview of operation */}
                    <div className="mb-3 rounded-lg bg-slate-800/50 px-3 py-2 font-mono text-xs">
                        <span className="text-purple-400">transform</span>
                        {' ('}
                        <span className="text-blue-400">{data.selectedInput || 'input'}</span>
                        {')'}
                    </div>

                    <InputGroup label="Operation" typeIndicator="string">
                        <SelectInput defaultValue={data.operation || 'map'}>
                            <option value="map">Map</option>
                            <option value="filter">Filter</option>
                            <option value="reduce">Reduce</option>
                            <option value="flatMap">Flat Map</option>
                        </SelectInput>
                    </InputGroup>
                </NodeBody>
            }
            bottom={<NodeFooter type="transform" duration="~50ms" />}
            handles={handles}
        />
    );
});

// ============================================================================
// EXAMPLE 7: Minimal Node (No Middle Slot)
// ============================================================================

interface MinimalNodeData {
    label?: string;
    handles?: NodeHandle[];
}

export const MinimalNode = memo(({ data, selected }: NodeProps<Node<MinimalNodeData>>) => {
    const handles = (data.handles as NodeHandle[]) || [];

    return (
        <NodeCard
            state={{ selected }}
            top={
                <NodeHeader
                    icon={<Mail className="h-4 w-4" />}
                    title={data.label || 'Minimal'}
                    description="No configuration needed"
                    badge="simple"
                />
            }
            // No middle slot
            bottom={<NodeFooter type="simple" duration="Instant" />}
            handles={handles}
        />
    );
});
