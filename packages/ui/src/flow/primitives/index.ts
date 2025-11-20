/**
 * Flow Node Primitives
 *
 * Lego-block style components for building flow nodes.
 * All nodes should be composed from these primitives for consistency.
 *
 * @example Basic Node Structure
 * ```tsx
 * <NodeCard
 *   state={{ selected }}
 *   top={
 *     <NodeHeader
 *       icon={<Play />}
 *       title="Start"
 *       description="Entry point"
 *       badge="trigger"
 *     />
 *   }
 *   middle={
 *     <NodeBody>
 *       <InputGroup
 *         label="Payload"
 *         typeIndicator="json"
 *         handleData={{ id: 'payload', type: 'target', dataType: 'json' }}
 *       >
 *         <TextareaInput rows={3} />
 *       </InputGroup>
 *     </NodeBody>
 *   }
 *   bottom={
 *     <NodeFooter type="trigger" duration="Instant" />
 *   }
 *   handles={handles}
 * />
 * ```
 */

// Core card structure
export { NodeCard } from './NodeCard';
export type { NodeCardProps } from './NodeCard';

export { NodeHeader } from './NodeHeader';
export type { NodeHeaderProps } from './NodeHeader';

export { NodeBody } from './NodeBody';
export type { NodeBodyProps } from './NodeBody';

export { NodeFooter } from './NodeFooter';
export type { NodeFooterProps } from './NodeFooter';

// Input components
export { InputGroup } from './InputGroup';
export type { InputGroupProps } from './InputGroup';

export { TextInput } from './TextInput';
export type { TextInputProps } from './TextInput';

export { TextareaInput } from './TextareaInput';
export type { TextareaInputProps } from './TextareaInput';

export { SelectInput } from './SelectInput';
export type { SelectInputProps } from './SelectInput';

export { InputSelector } from './InputSelector';
export type { InputSelectorProps } from './InputSelector';

// Output components
export { OutputGroup } from './OutputGroup';
export type { OutputGroupProps } from './OutputGroup';

export { OutputItem } from './OutputItem';
export type { OutputItemProps } from './OutputItem';

// Handles
export { DataHandle } from './DataHandle';
export type { DataHandleProps } from './DataHandle';

// Types
export type { NodeHandle, NodeState, NodeVariant, PrimitiveComponentProps } from './types';
