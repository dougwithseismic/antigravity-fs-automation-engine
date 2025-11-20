# InputSelector Component

A styled primitive for displaying selected inputs with badge-style formatting. Matches the aesthetic of the condition node preview with colored, monospace text in a dark container.

## Usage

```tsx
import { InputSelector } from '@repo/ui/flow/primitives';

// Basic usage
<InputSelector
  value="user.email"
  variant="blue"
/>

// With prefix
<InputSelector
  prefix="from"
  value="fetchNode.response"
  variant="green"
/>

// With placeholder
<InputSelector
  placeholder="Select an input..."
  variant="blue"
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string` | - | The selected input value to display |
| `placeholder` | `string` | `"Select input..."` | Placeholder when no value is selected |
| `variant` | `'default' \| 'blue' \| 'green' \| 'purple' \| 'amber' \| 'pink'` | `'blue'` | Color variant for the value display |
| `prefix` | `ReactNode` | - | Optional prefix label |
| `suffix` | `ReactNode` | - | Optional suffix label |
| `className` | `string` | - | Additional CSS classes |
| `onClick` | `() => void` | - | Click handler (makes component interactive) |

## Color Variants

Each variant matches the semantic colors used in the condition node preview:

- **`blue`** - For keys, properties, and input references (like condition node's key)
- **`green`** - For values, data, and output references (like condition node's value)
- **`purple`** - For operators, actions, and transformations (like condition node's operator)
- **`amber`** - For warnings, important values, or special indicators
- **`pink`** - For errors, special cases, or highlighted values
- **`default`** - Neutral slate color

## Examples

### Basic Input Display
```tsx
<InputSelector
  value="apiResponse.data"
  variant="blue"
/>
```

### Email Configuration
```tsx
<div className="space-y-2">
  <div className="text-xs text-slate-500 mb-1">Recipient</div>
  <InputSelector
    value="customer.email"
    variant="blue"
  />

  <div className="text-xs text-slate-500 mb-1">Template Data</div>
  <InputSelector
    value="orderDetails"
    variant="green"
  />
</div>
```

### Transform Node Pattern
```tsx
// Matches condition node styling
<div className="mb-3">
  <div className="text-xs text-slate-400 mb-2 font-semibold">Data Source</div>
  <InputSelector
    value="fetchNode.response"
    variant="blue"
    prefix="from"
  />
</div>

<div className="mb-3 rounded-lg bg-slate-800/50 px-3 py-2 font-mono text-xs">
  <span className="text-purple-400">transform</span>
  {' ('}
  <span className="text-blue-400">fetchNode.response</span>
  {')'}
</div>
```

### Interactive Selector
```tsx
<InputSelector
  value={selectedInput || undefined}
  placeholder="Click to select input..."
  variant="blue"
  onClick={() => openInputPicker()}
/>
```

## Styling Philosophy

The `InputSelector` component shares the same visual language as the condition node's preview display:

**Condition Node Preview:**
```tsx
<div className="mb-3 rounded-lg bg-slate-800/50 px-3 py-2 font-mono text-xs">
  <span className="text-blue-400">{key}</span>
  {' '}
  <span className="text-purple-400">{operator}</span>
  {' '}
  <span className="text-green-400">"{value}"</span>
</div>
```

**InputSelector Usage:**
```tsx
<InputSelector
  value="user.name"
  variant="blue"  // Same blue-400 as condition key
/>
```

This creates a consistent visual experience across all nodes that display dynamic data references.

## Best Practices

1. **Use `blue` variant** for input references (node outputs being used as inputs)
2. **Use `green` variant** for data values and payloads
3. **Use `purple` variant** for operation/transformation indicators
4. **Add `prefix`** to provide context (e.g., "from", "using", "with")
5. **Add `onClick`** handler when the selector should be interactive
6. **Use placeholder** to indicate expected input when nothing is selected

## Related Components

- `InputGroup` - Container for labeled inputs
- `OutputItem` - Display for node outputs
- `ConditionNode` - Reference implementation with similar preview styling
