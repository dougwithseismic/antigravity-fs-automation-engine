import React from 'react';

interface SidebarProps {
    selectedNode: any;
    onUpdateNode: (nodeId: string, data: any) => void;
}

export function Sidebar({ selectedNode, onUpdateNode }: SidebarProps) {
    if (!selectedNode) {
        return (
            <div className="w-64 border-l border-blue-900/30 p-4 bg-slate-950/90 backdrop-blur-sm text-blue-200">
                <p className="text-blue-400/60 text-sm uppercase tracking-wider">System Status: Idle</p>
                <p className="mt-2 text-xs text-blue-500">Select a node to configure parameters.</p>
            </div>
        );
    }

    return (
        <div className="w-64 border-l border-blue-900/30 p-4 bg-slate-950/90 backdrop-blur-sm text-blue-100 shadow-[-10px_0_30px_rgba(0,0,0,0.5)]">
            <h3 className="font-bold mb-4 text-blue-400 uppercase tracking-widest text-sm border-b border-blue-900/50 pb-2">Configuration</h3>
            <div className="mb-4">
                <label className="block text-xs font-medium mb-1 text-blue-300 uppercase">Label</label>
                <input
                    type="text"
                    className="w-full bg-slate-900 border border-blue-500/30 rounded p-2 text-sm text-blue-100 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all"
                    value={selectedNode.data.label}
                    onChange={(e) => onUpdateNode(selectedNode.id, { ...selectedNode.data, label: e.target.value })}
                />
            </div>
            <div className="mb-4">
                <label className="block text-xs font-medium mb-1 text-blue-300 uppercase">Type</label>
                <div className="p-2 bg-blue-900/20 border border-blue-500/20 rounded text-sm text-blue-200 font-mono">{selectedNode.type || 'default'}</div>
            </div>
        </div>
    );
}
