# Edge Styling Guide

This guide covers all available edge styling options for WorkflowGraph components.

## Edge Types

Control the path shape of edges using the `edgeType` prop:

```tsx
<WorkflowGraph
  nodes={nodes}
  edges={edges}
  edgeType="straight"  // or 'default' | 'step' | 'smoothstep'
/>
```

- **`default`** - Bezier curves (smooth, curved paths)
- **`straight`** - Direct straight lines between nodes
- **`step`** - Right-angled orthogonal paths (like a staircase)
- **`smoothstep`** - Right-angled paths with rounded corners

## Edge Styles (Dash Patterns)

Control the stroke pattern using the `style` property on individual edges:

```tsx
const edges = [
  {
    source: '1',
    target: '2',
    style: 'dashed',  // or 'solid' | 'dotted' | 'long-dash' | 'dash-dot'
  }
];
```

### Available Dash Patterns:

- **`solid`** - Continuous line (default)
- **`dashed`** - Regular dashed line (8px dash, 8px gap)
- **`dotted`** - Dotted line (2px dot, 6px gap)
- **`long-dash`** - Long dashes (16px dash, 8px gap)
- **`dash-dot`** - Alternating dash-dot pattern (12px dash, 4px gap, 2px dot, 4px gap)

## Animation

Animate edges to show active execution:

```tsx
const edges = [
  {
    source: '1',
    target: '2',
    animated: true,  // Animated marching ants effect
  }
];
```

## Grid Snapping

Enable node snapping to a grid:

```tsx
<WorkflowGraph
  nodes={nodes}
  edges={edges}
  snapToGrid={true}
  snapGrid={[20, 20]}  // [x, y] grid size in pixels
/>
```

## Edge Labels

Add labels to edges with badge-style styling:

```tsx
const edges = [
  {
    source: '1',
    target: '2',
    label: 'Success',  // Badge-styled label on the edge
  },
  {
    source: '2',
    target: '3',
    label: 'Error',
  }
];
```

Edge labels are automatically styled as badges with:
- Dark background with subtle border
- Rounded corners
- Proper padding and spacing
- Drop shadow for depth
- Semi-bold text at 11px

## Execution State Visualization

The demo-react WorkflowGraph automatically styles edges based on execution state:

- **Completed edges**: Solid line with base color
- **Active edges**: Animated solid line with green color
- **Pending edges**: Dashed line with muted color and reduced opacity

You can override this by providing explicit `style` properties on your edges.

## Example: Complex Workflow Execution

```tsx
const edges = [
  // Completed step
  {
    source: '1',
    target: '2',
    style: 'solid',
    animated: false,
  },
  // Currently executing
  {
    source: '2',
    target: '3',
    style: 'solid',
    animated: true,  // Shows motion
  },
  // Pending steps
  {
    source: '3',
    target: '4',
    style: 'dashed',  // Shows it hasn't run yet
  },
  // Alternative path (conditional)
  {
    source: '3',
    target: '5',
    style: 'dotted',  // Different pattern for alternate path
  },
];

<WorkflowGraph
  nodes={nodes}
  edges={edges}
  edgeType="smoothstep"
  snapToGrid={true}
/>
```

## Best Practices

1. **Use `straight` or `step` edges** for more technical/engineering workflows
2. **Use `smoothstep` or `default`** for more polished, product-facing views
3. **Combine animated + solid** for currently executing paths
4. **Use dashed** for pending/future execution
5. **Use dotted or dash-dot** for conditional or alternative paths
6. **Enable grid snapping** for cleaner, more organized layouts
