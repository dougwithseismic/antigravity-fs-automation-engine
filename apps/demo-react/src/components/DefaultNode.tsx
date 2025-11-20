import { memo } from 'react'
import { Handle, Position, type NodeProps, type Node, useHandleConnections } from '@xyflow/react'
import { cn } from '../lib/utils'
import {
    Settings2,
    Globe,
    Bot,
    Database,
    FileText,
    Search,
    MoreHorizontal,
    Play,
    Key,
    Lock
} from 'lucide-react'
import { Badge } from './ui/Badge'

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
    // Legacy support while migrating
    inputs?: NodeInputDefinition[];
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
}

const NodeInput = ({ input, nodeId }: { input: NodeInputDefinition, nodeId: string }) => {
    const connections = useHandleConnections({
        type: 'target',
        id: input.id,
        nodeId
    });

    const isConnected = connections.length > 0;

    return (
        <div className="space-y-1.5">
            <div className="flex items-center justify-between">
                <label htmlFor={input.id} className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                    {input.label}
                    {input.required && <span className="text-red-500">*</span>}
                </label>
                {isConnected ? (
                    <Lock className="h-3 w-3 text-primary" />
                ) : (
                    <Globe className="h-3 w-3 text-muted-foreground/50" />
                )}
            </div>

            <div className="relative group">
                {input.type === 'text' && (
                    <input
                        id={input.id}
                        type="text"
                        className={cn(
                            "flex h-8 w-full rounded-md border border-input bg-background/50 px-3 py-1 text-xs shadow-sm transition-colors",
                            "file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground",
                            "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                            isConnected && "opacity-50 cursor-not-allowed bg-muted/50 text-muted-foreground"
                        )}
                        placeholder={isConnected ? "Connected" : input.placeholder}
                        defaultValue={input.defaultValue}
                        readOnly={isConnected}
                        disabled={isConnected}
                    />
                )}

                {input.type === 'textarea' && (
                    <textarea
                        id={input.id}
                        className={cn(
                            "flex min-h-[60px] w-full rounded-md border border-input bg-background/50 px-3 py-2 text-xs shadow-sm transition-colors",
                            "placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                            "resize-none",
                            isConnected && "opacity-50 cursor-not-allowed bg-muted/50 text-muted-foreground"
                        )}
                        placeholder={isConnected ? "Connected" : input.placeholder}
                        defaultValue={input.defaultValue}
                        readOnly={isConnected}
                        disabled={isConnected}
                    />
                )}

                {input.type === 'password' && (
                    <input
                        id={input.id}
                        type="password"
                        className={cn(
                            "flex h-8 w-full rounded-md border border-input bg-background/50 px-3 py-1 text-xs shadow-sm transition-colors",
                            "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                            isConnected && "opacity-50 cursor-not-allowed bg-muted/50 text-muted-foreground"
                        )}
                        value={isConnected ? "" : "........"}
                        readOnly={isConnected}
                        disabled={isConnected}
                    />
                )}

                {input.type === 'select' && (
                    <div className={cn(
                        "flex h-8 w-full items-center justify-between rounded-md border border-input bg-background/50 px-3 py-1 text-xs shadow-sm",
                        isConnected && "opacity-50 cursor-not-allowed bg-muted/50"
                    )}>
                        <span className="text-muted-foreground">
                            {isConnected ? "Connected" : (input.defaultValue || 'Select...')}
                        </span>
                        <Settings2 className="h-3 w-3 opacity-50" />
                    </div>
                )}
            </div>

            {/* Input Handle */}
            {input.connection?.enabled && (
                <Handle
                    type="target"
                    position={Position.Left}
                    id={input.id}
                    className={cn(
                        "!w-3 !h-3 !bg-muted-foreground/50 !border-2 !border-background",
                        "hover:!bg-primary hover:!border-primary transition-colors",
                        "-ml-[22px]", // Position slightly outside the node body padding
                        isConnected && "!bg-primary !border-primary"
                    )}
                    style={{ top: 'auto', bottom: 'auto', transform: 'translateY(-50%)', marginTop: input.type === 'textarea' ? '30px' : '16px' }}
                />
            )}
        </div>
    );
};

export const DefaultNode = memo(({ id, data, selected, type }: NodeProps<Node<DefaultNodeData>>) => {
    const Icon = IconMap[type || 'tool'] || Settings2

    return (
        <div className={cn(
            "w-[300px] rounded-xl border bg-card shadow-xl transition-all duration-200",
            selected ? "border-primary ring-1 ring-primary shadow-primary/20" : "border-border/50 hover:border-border"
        )}>
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border/50 bg-muted/30 rounded-t-xl">
                <div className="flex items-center gap-3">
                    <div className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-lg border border-border/50 bg-background",
                        selected ? "text-primary" : "text-muted-foreground"
                    )}>
                        <Icon className="h-4 w-4" />
                    </div>
                    <div>
                        <div className="text-sm font-semibold leading-none tracking-tight">
                            {data.label || 'Node'}
                        </div>
                        {data.description && (
                            <div className="text-[10px] text-muted-foreground mt-1 line-clamp-1">
                                {data.description}
                            </div>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-1">
                    {data.duration && (
                        <span className="text-[10px] font-mono text-green-500">
                            {data.duration}
                        </span>
                    )}
                    <button className="text-muted-foreground hover:text-foreground transition-colors">
                        <MoreHorizontal className="h-4 w-4" />
                    </button>
                </div>
            </div>

            {/* Body */}
            <div className="p-4 space-y-4">
                {/* Inputs */}
                {(data.ui?.inputs || data.inputs)?.map((input: NodeInputDefinition) => (
                    <NodeInput key={input.id} input={input} nodeId={id} />
                ))}

                {(!data.ui?.inputs && !data.inputs) && (
                    <div className="flex items-center justify-center py-4 text-xs text-muted-foreground border border-dashed border-border/50 rounded-lg bg-muted/10">
                        No inputs configured
                    </div>
                )}
            </div>

            {/* Footer / Status */}
            <div className="px-4 py-2 border-t border-border/50 bg-muted/10 rounded-b-xl flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px] h-5 px-1.5 bg-background/50 font-normal text-muted-foreground">
                        {type}
                    </Badge>
                </div>
                <Settings2 className="h-3 w-3 text-muted-foreground" />
            </div>

            {/* Dynamic Output Handles */}
            {data.ui?.outputs?.map((output, i) => (
                <div key={output.id} className="absolute right-0" style={{ top: `${(i + 1) * 40 + 60}px` }}>
                    <Handle
                        type="source"
                        position={Position.Right}
                        id={output.id}
                        className={cn(
                            "!w-3 !h-3 !bg-primary !border-2 !border-background transition-transform hover:scale-125",
                            "-mr-[6px]"
                        )}
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-medium text-muted-foreground pointer-events-none">
                        {output.label}
                    </span>
                </div>
            ))}

            {/* Default Handles (only if no specific outputs defined) */}
            {!data.ui?.outputs && (
                <>
                    <Handle
                        type="target"
                        position={Position.Left}
                        className="!w-3 !h-3 !bg-primary !border-2 !border-background transition-transform hover:scale-125"
                    />
                    <Handle
                        type="source"
                        position={Position.Right}
                        className="!w-3 !h-3 !bg-primary !border-2 !border-background transition-transform hover:scale-125"
                    />
                </>
            )}
        </div>
    )
})

DefaultNode.displayName = 'DefaultNode'
