import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';

export const ScifiNode = memo(({ data, selected }: any) => {
    return (
        <div className={`scifi-node min-w-[150px] ${selected ? 'ring-2 ring-blue-400 shadow-[0_0_25px_rgba(59,130,246,0.6)]' : ''}`}>
            <div className="scifi-node-header flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.8)]"></div>
                {data.label}
            </div>
            <div className="scifi-node-body text-xs text-blue-200/80">
                {data.description || 'Node configuration'}
            </div>
            <Handle type="target" position={Position.Top} className="!bg-blue-500 !w-3 !h-3 !border-0 shadow-[0_0_10px_rgba(59,130,246,1)]" />
            <Handle type="source" position={Position.Bottom} className="!bg-blue-500 !w-3 !h-3 !border-0 shadow-[0_0_10px_rgba(59,130,246,1)]" />
        </div>
    );
});
