import { memo } from 'react';
import { type NodeProps, type Node } from '@xyflow/react';
import { Navigation, Zap } from 'lucide-react';
import { NodeContainer, nodeStyles } from '../shared/node-base';
import { OutputGroup } from '../primitives/OutputGroup';
import { OutputItem } from '../primitives/OutputItem';

export interface RouteChangeNodeData {
    label?: string;
    description?: string;
    pathPattern?: string;
    handles?: any[];
}

/**
 * RouteChangeNode - Browser route change trigger
 * Shows path pattern matching
 */
export const RouteChangeNode = memo(({ data, selected }: NodeProps<Node<RouteChangeNodeData>>) => {
    const handles = (data.handles as any[]) || [];
    const dataOutputs = handles.filter(h => h.type === 'source' && h.dataType !== 'flow');

    const pathPattern = data.pathPattern || '/';

    return (
        <NodeContainer
            id="route-change"
            selected={selected}
            type="route-change"
            label={data.label || 'Route Change'}
            description={data.description || 'Browser navigation trigger'}
            icon={<Navigation className="h-4 w-4" />}
            handles={handles}
            className="border-2 border-dashed border-green-500/30"
        >
            <div className={nodeStyles.body}>
                {/* Trigger Indicator */}
                <div className="mb-3 flex items-center gap-2 rounded bg-green-500/10 px-2 py-1">
                    <Zap className="h-3 w-3 text-green-400" />
                    <span className="text-xs font-semibold text-green-400">CLIENT TRIGGER</span>
                </div>

                {/* Path Pattern Preview */}
                <div className="mb-3 rounded-lg bg-slate-800/50 p-3">
                    <div className="mb-1 text-xs font-semibold text-gray-400">Path Pattern</div>
                    <code className="text-sm text-green-300">{pathPattern}</code>
                </div>

                {/* Helper Text */}
                <div className={nodeStyles.helper}>
                    Triggers when browser URL matches pattern. Use * for wildcards.
                </div>

                {/* Examples */}
                <div className="mt-2 rounded bg-slate-800/30 p-2 text-xs text-gray-400">
                    <div className="font-semibold">Examples:</div>
                    <div className="mt-1 space-y-1 font-mono">
                        <div>/products/*</div>
                        <div>/checkout</div>
                        <div>/*</div>
                    </div>
                </div>
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

RouteChangeNode.displayName = 'RouteChangeNode';
