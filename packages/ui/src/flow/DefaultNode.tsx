import { memo } from 'react';
import { Handle, Position, type NodeProps, type Node } from '@xyflow/react';
import { cn } from '../lib/utils';
import {
    Settings2,
    Globe,
    Bot,
    Database,
    FileText,
    Search,
    Play,
    Key,
    Clock4
} from 'lucide-react';
import { Badge } from '../badge';

export interface NodeInputDefinition {
    id: string
    label: string
    type: 'text' | 'select' | 'toggle' | 'textarea' | 'password'
    defaultValue?: any
    placeholder?: string
    options?: string[]
    required?: boolean;
    connection?: {
        enabled: boolean;
        type?: string;
    };
}

export interface NodeOutputDefinition {
    id: string;
    label: string;
    type: string;
}

export interface DefaultNodeData extends Record<string, unknown> {
    label?: string;
    description?: string;
    duration?: string;
    ui?: {
        inputs?: NodeInputDefinition[];
        outputs?: NodeOutputDefinition[];
    };
}

const IconMap: Record<string, any> = {
    'tool': Settings2,
    'web': Globe,
    'agent': Bot,
    'data': Database,
    'text': FileText,
    'search': Search,
    'start': Play,
    'credential': Key,
    'fetch': Globe,
    'google-search': Search,
    'wait': Clock4,
    'switch': Settings2,
    'shopify': Settings2,
    'shopify-credential': Key,
    'llm-provider': Bot
};

export const DefaultNode = memo(({ data, selected, type }: NodeProps<Node<DefaultNodeData>>) => {
    const Icon = IconMap[type || 'tool'] || Settings2;

    const inputs = data.ui?.inputs || [];
    const outputs = data.ui?.outputs;

    // New Architecture: Handles
    const handles = (data.handles as any[]) || [];

    const flowInputs = handles.filter(h => h.type === 'target' && h.dataType === 'flow');
    const flowOutputs = handles.filter(h => h.type === 'source' && h.dataType === 'flow');
    const dataInputs = handles.filter(h => h.type === 'target' && h.dataType !== 'flow');
    const dataOutputs = handles.filter(h => h.type === 'source' && h.dataType !== 'flow');

    const itemHeight = 42;

    return (
        <div className={cn('flow-node', selected && 'flow-node--selected')}>
            {/* Main Flow Input (Left-Top or Top) */}
            {flowInputs.map((handle) => (
                 <Handle
                    key={handle.id}
                    type="target"
                    position={Position.Left}
                    id={handle.id}
                    className="flow-node__handle flow-node__handle--target flow-node__handle--flow"
                    style={{ top: 20 }} // Align with header
                />
            ))}

            <div className="flow-node__header">
                <div className="flow-node__icon">
                    <Icon className="h-4 w-4" />
                </div>
                <div className="flow-node__titles">
                    <p className="flow-node__label">{data.label || 'Node'}</p>
                    {data.description && <p className="flow-node__description">{data.description}</p>}
                </div>
                <span className="flow-node__tag">{type || 'step'}</span>
            </div>

            <div className="flow-node__body">
                {/* Render UI Inputs with aligned handles */}
                {inputs.map((input: NodeInputDefinition, idx: number) => {
                    const handle = dataInputs.find(h => h.id === input.id);

                    return (
                        <div key={`${input.id}-${idx}`} className="flow-node__input-group">
                            {handle && (
                                <Handle
                                    type="target"
                                    position={Position.Left}
                                    id={handle.id}
                                    className={cn(
                                        "flow-node__handle flow-node__handle--target",
                                        `flow-node__handle--${handle.dataType}`
                                    )}
                                    style={{ top: 14, left: -6 }}
                                />
                            )}

                            <div className="flow-node__input-label">
                                <span>
                                    {input.label}
                                    {input.required && ' *'}
                                </span>
                                {handle && (
                                    <span className="flow-node__type-indicator">
                                        {handle.dataType === 'tool' && '[]'}
                                        {handle.dataType === 'model' && 'LLM'}
                                        {handle.dataType === 'string' && 'Abc'}
                                        {handle.dataType === 'credential' && <Key className="h-3 w-3" />}
                                    </span>
                                )}
                            </div>

                            {input.type === 'textarea' ? (
                                <textarea
                                    className="flow-node__control"
                                    placeholder={input.placeholder || 'Enter value...'}
                                    defaultValue={input.defaultValue}
                                    rows={2}
                                    onChange={(e) => {
                                        // TODO: Update node data
                                        console.log('Input changed:', input.id, e.target.value);
                                    }}
                                />
                            ) : input.type === 'select' ? (
                                <select
                                    className="flow-node__control flow-node__control--select"
                                    defaultValue={input.defaultValue}
                                    onChange={(e) => {
                                        console.log('Select changed:', input.id, e.target.value);
                                    }}
                                >
                                    <option value="" disabled>{input.placeholder || 'Select...'}</option>
                                    {input.options?.map(opt => (
                                        <option key={opt} value={opt}>{opt}</option>
                                    ))}
                                </select>
                            ) : (
                                <input
                                    className="flow-node__control"
                                    type={input.type}
                                    placeholder={input.placeholder}
                                    defaultValue={input.defaultValue}
                                    onChange={(e) => {
                                        console.log('Input changed:', input.id, e.target.value);
                                    }}
                                />
                            )}
                        </div>
                    );
                })}

                {/* Render Orphaned Data Inputs (handles without UI inputs) */}
                {dataInputs.filter(h => !inputs.find(i => i.id === h.id)).map((handle) => (
                    <div key={handle.id} className="flow-node__input-row" style={{ height: itemHeight }}>
                         <Handle
                            type="target"
                            position={Position.Left}
                            id={handle.id}
                            className={cn(
                                "flow-node__handle flow-node__handle--target",
                                `flow-node__handle--${handle.dataType}`
                            )}
                            style={{ top: '50%', transform: 'translateY(-50%)', left: -6 }}
                        />
                        <div className="flow-node__input-label">
                            <span>{handle.label || handle.id}</span>
                            <span className="flow-node__chip text-xs">{handle.dataType}</span>
                        </div>
                    </div>
                ))}

                {inputs.length === 0 && dataInputs.length === 0 && (
                     <div className="flow-node__helper">No inputs configured</div>
                )}
            </div>

            {/* Render Data Outputs */}
            {dataOutputs.length > 0 && (
                 <div className="flow-node__outputs">
                    {dataOutputs.map((handle) => (
                        <div key={handle.id} className="flow-node__output" style={{ height: itemHeight }}>
                            <span className="flow-node__output-label">{handle.label || handle.id}</span>
                            <Handle
                                type="source"
                                position={Position.Right}
                                id={handle.id}
                                className={cn(
                                    "flow-node__handle flow-node__handle--source",
                                    `flow-node__handle--${handle.dataType}`
                                )}
                                style={{ right: -6 }}
                            />
                        </div>
                    ))}
                </div>
            )}

            <div className="flow-node__footer">
                <Badge variant="outline" className="flow-node__foot-chip">
                    {type}
                </Badge>
                <span className="flow-node__foot-meta">
                    <Clock4 className="h-3 w-3" />
                    {data.duration || 'Instant'}
                </span>
            </div>

            {/* Main Flow Output (Right-Top or Bottom) */}
             {flowOutputs.map((handle) => (
                 <Handle
                    key={handle.id}
                    type="source"
                    position={Position.Right}
                    id={handle.id}
                    className="flow-node__handle flow-node__handle--source flow-node__handle--flow"
                    style={{ top: 20 }} // Align with header
                />
            ))}
        </div>
    );
});

DefaultNode.displayName = 'DefaultNode';
