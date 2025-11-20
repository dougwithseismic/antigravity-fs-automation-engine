# Flow Node Primitives

Lego-block style components for building consistent, composable flow nodes.

## Architecture

All flow nodes should be built using these primitives to ensure visual consistency and maintainability.

### Component Hierarchy

```
NodeCard (container with state & handles)
├── top (header slot)
│   └── NodeHeader (icon + title + description + badge)
├── middle (content slot)
│   └── NodeBody
│       ├── InputGroup (label + type + input)
│       │   ├── TextInput
│       │   ├── TextareaInput
│       │   └── SelectInput
│       └── ... more inputs
└── bottom (footer slot)
    ├── NodeFooter (type badge + duration)
    └── OutputGroup
        └── OutputItem (label + DataHandle)
```

## Example Usage

### Basic Node

```tsx
import { memo } from 'react';
import { type NodeProps, type Node } from '@xyflow/react';
import { Play } from 'lucide-react';
import {
  NodeCard,
  NodeHeader,
  NodeBody,
  NodeFooter,
  InputGroup,
  TextareaInput,
  OutputGroup,
  OutputItem,
  DataHandle,
  type NodeHandle
} from '../primitives';

export const StartNode = memo(({ data, selected }: NodeProps<Node<StartNodeData>>) => {
  const handles = (data.handles as NodeHandle[]) || [];
  const dataOutputs = handles.filter(h => h.type === 'source' && h.dataType !== 'flow');

  return (
    <NodeCard
      state={{ selected }}
      top={
        <NodeHeader
          icon={<Play className="h-4 w-4" />}
          title={data.label || 'Start'}
          description={data.description || 'Entry point for workflow'}
          badge="trigger"
        />
      }
      middle={
        <NodeBody>
          <InputGroup label="Initial Payload" typeIndicator="json">
            <TextareaInput
              rows={3}
              placeholder='{"userId": "123"}'
              defaultValue={data.payload}
            />
          </InputGroup>
        </NodeBody>
      }
      bottom={
        <>
          <NodeFooter type="trigger" duration="Instant" />
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
                      style={{ right: -14 }}
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
```

## Components

### NodeCard

Base container with top/middle/bottom slots. Manages state styling and flow handles.

**Props:**
- `state?: NodeState` - Visual state (selected, executing, error, pending)
- `top?: ReactNode` - Header slot
- `middle?: ReactNode` - Content slot
- `bottom?: ReactNode` - Footer slot
- `handles?: NodeHandle[]` - Flow connection points
- `variant?: 'default' | 'client' | 'server'` - Style variant

### NodeHeader

Top section with icon, title, description, and badge.

**Props:**
- `icon: ReactNode` - Icon element (typically from lucide-react)
- `title: string` - Node title
- `description?: string` - Optional description text
- `badge?: string` - Type badge text

### NodeBody

Middle section container with consistent padding.

**Props:**
- `children: ReactNode` - Content (typically InputGroup components)

### NodeFooter

Bottom section with type badge and duration.

**Props:**
- `type: string` - Node type label
- `duration?: string` - Timing info (default: "Instant")

### InputGroup

Container for form inputs with label, type indicator, and helper text.

**Props:**
- `label: string` - Input label
- `typeIndicator?: string | ReactNode` - Type badge (e.g., "json", "string")
- `helper?: string` - Helper text below input
- `children: ReactNode` - Input element
- `handle?: ReactNode` - Optional DataHandle for connections
- `required?: boolean` - Show required asterisk

### TextInput, TextareaInput, SelectInput

Form input primitives with consistent styling.

### OutputGroup / OutputItem

Container and item components for node outputs.

### DataHandle

Data connection handle (non-flow handles).

**Props:**
- `handle: NodeHandle` - Handle configuration
- `position: 'left' | 'right'` - Position on node
- `style?: React.CSSProperties` - Custom positioning

## Design Principles

1. **Composability** - All nodes built from same building blocks
2. **Consistency** - Visual uniformity across all nodes
3. **Type Safety** - Full TypeScript support
4. **Flexibility** - Slots allow custom content while maintaining structure
5. **State Management** - Centralized state styling in NodeCard
6. **Accessibility** - Semantic HTML and proper labeling

## Migration Guide

### Old Pattern (CSS classes)
```tsx
<div className="flow-node__body">
  <div className="flow-node__input-group">
    <div className="flow-node__input-label">
      <span>Label</span>
    </div>
    <input className="flow-node__control" />
  </div>
</div>
```

### New Pattern (Primitives)
```tsx
<NodeBody>
  <InputGroup label="Label">
    <TextInput />
  </InputGroup>
</NodeBody>
```
