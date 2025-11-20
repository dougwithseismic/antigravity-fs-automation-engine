# Flow Node Components

This directory contains the custom node components for the Antigravity workflow builder.

## Architecture

### Shared Base Components (`shared/node-base.tsx`)
- **NodeContainer**: Wrapper component that provides consistent header, footer, and flow handles
- **DataHandle**: Utility component for rendering data input/output handles with proper styling

### Node Components (`nodes/`)
Each node type has its own custom component with unique UI and behavior:

- **VariableNode**: Simple value storage with draggable output
- **StartNode**: Workflow entry point with payload configuration
- **FetchNode**: HTTP request with method badge and dynamic inputs
- **CodeNode**: JavaScript execution with monospace editor
- **ConditionNode**: Visual condition preview and comparison
- **SwitchNode**: Branch visualization with option badges
- **AgentNode**: AI agent with model/tool status badges

### Node Registry (`node-registry.tsx`)
Maps node types to their React components. Used by ReactFlow for rendering.

## Usage

```tsx
import { getNodeTypes } from '@repo/ui/flow';
import { ReactFlow } from '@xyflow/react';

function WorkflowBuilder() {
  const nodeTypes = getNodeTypes();

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
    />
  );
}
```

## Creating a New Node Component

1. **Create the component** in `nodes/YourNode.tsx`:

```tsx
import { memo } from 'react';
import { type NodeProps, type Node } from '@xyflow/react';
import { Icon } from 'lucide-react';
import { NodeContainer, DataHandle } from '../shared/node-base';

export interface YourNodeData {
    label?: string;
    // ... your data fields
    handles?: any[];
}

export const YourNode = memo(({ data, selected }: NodeProps<Node<YourNodeData>>) => {
    const handles = (data.handles as any[]) || [];
    const dataInputs = handles.filter(h => h.type === 'target' && h.dataType !== 'flow');
    const dataOutputs = handles.filter(h => h.type === 'source' && h.dataType !== 'flow');

    return (
        <NodeContainer
            id="your-node"
            selected={selected}
            type="your-type"
            label={data.label || 'Your Node'}
            icon={<Icon className="h-4 w-4" />}
            handles={handles}
        >
            <div className="flow-node__body">
                {/* Your custom UI here */}
            </div>

            {/* Data outputs */}
            {dataOutputs.length > 0 && (
                <div className="flow-node__outputs">
                    {dataOutputs.map((handle) => (
                        <div key={handle.id} className="flow-node__output">
                            <span className="flow-node__output-label">{handle.label}</span>
                            <DataHandle
                                handle={handle}
                                position="right"
                                style={{ right: -14 }}
                            />
                        </div>
                    ))}
                </div>
            )}
        </NodeContainer>
    );
});

YourNode.displayName = 'YourNode';
```

2. **Register it** in `node-registry.tsx`:

```tsx
import { YourNode } from './nodes/YourNode';

export const NodeTypeRegistry: Record<string, ComponentType<NodeProps>> = {
    // ...
    'your-type': YourNode,
};
```

3. **Export it** from `index.ts`:

```tsx
export { YourNode } from './nodes/YourNode';
```

4. **Create a story** in `nodes/YourNode.stories.tsx` for Storybook

## Design Principles

1. **Consistency**: All nodes share the same header/footer structure via `NodeContainer`
2. **Customization**: Each node has unique body content tailored to its purpose
3. **Visual Clarity**: Use badges, colors, and icons to convey node state
4. **Type Safety**: TypeScript interfaces for all node data
5. **Accessibility**: Proper labeling and semantic HTML

## Styling

All nodes use the shared CSS classes from `DefaultNode.css`:
- `.flow-node` - Main container
- `.flow-node__header` - Header section
- `.flow-node__body` - Custom content area
- `.flow-node__footer` - Footer section
- `.flow-node__input-group` - Input field wrapper
- `.flow-node__outputs` - Output handles section
- `.flow-node__handle` - Handle styling

## TODO: Remaining Custom Nodes

Nodes still using DefaultNode that should have custom components:
- [ ] WaitNode - Show countdown/delay visualization
- [ ] FilterNode - Visual filter expression builder
- [ ] CredentialNode - Secure credential display
- [ ] EmailNode - Email preview with recipient
- [ ] AnalyticsNode - Event tracking visualization
- [ ] BannerFormNode - Form field preview
- [ ] WindowAlertNode - Alert message preview
- [ ] GoogleSearchNode - Search result mockup preview
