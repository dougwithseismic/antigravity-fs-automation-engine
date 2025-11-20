import type { Meta, StoryObj } from '@storybook/react';
import { ReactFlowProvider } from '@xyflow/react';
import { MergeNode } from './MergeNode';
import '@xyflow/react/dist/style.css';

const meta = {
  title: 'Flow/Nodes/MergeNode',
  component: MergeNode,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <ReactFlowProvider>
        <div style={{ width: '500px', height: '650px' }}>
          <Story />
        </div>
      </ReactFlowProvider>
    ),
  ],
} satisfies Meta<typeof MergeNode>;

export default meta;
type Story = StoryObj<typeof meta>;

export const AppendMode: Story = {
  args: {
    id: 'merge-1',
    type: 'merge',
    data: {
      label: 'Wait for All',
      description: 'Synchronize branches',
      mode: 'append',
      handles: [
        { id: 'flow-in', type: 'target', dataType: 'flow', label: 'In', acceptsMultiple: true },
        { id: 'flow-out', type: 'source', dataType: 'flow', label: 'Out' },
        { id: 'merged', type: 'source', dataType: 'json', label: 'Merged Data' }
      ]
    },
    selected: false,
    isConnectable: true,
    zIndex: 1,
    dragging: false,
    positionAbsoluteX: 0,
    positionAbsoluteY: 0,
    width: 450,
    height: 600,
  },
};

export const CombineByPosition: Story = {
  args: {
    id: 'merge-2',
    type: 'merge',
    data: {
      label: 'Wait for All',
      description: 'Zip items by position',
      mode: 'combine-by-position',
      handles: [
        { id: 'flow-in', type: 'target', dataType: 'flow', label: 'In', acceptsMultiple: true },
        { id: 'flow-out', type: 'source', dataType: 'flow', label: 'Out' },
        { id: 'merged', type: 'source', dataType: 'json', label: 'Merged Data' }
      ]
    },
    selected: true,
    isConnectable: true,
    zIndex: 1,
    dragging: false,
    positionAbsoluteX: 0,
    positionAbsoluteY: 0,
    width: 450,
    height: 600,
  },
};

export const CombineByFields: Story = {
  args: {
    id: 'merge-3',
    type: 'merge',
    data: {
      label: 'Wait for All',
      description: 'Join on key field',
      mode: 'combine-by-fields',
      mergeKey: 'userId',
      handles: [
        { id: 'flow-in', type: 'target', dataType: 'flow', label: 'In', acceptsMultiple: true },
        { id: 'flow-out', type: 'source', dataType: 'flow', label: 'Out' },
        { id: 'merged', type: 'source', dataType: 'json', label: 'Merged Data' }
      ]
    },
    selected: false,
    isConnectable: true,
    zIndex: 1,
    dragging: false,
    positionAbsoluteX: 0,
    positionAbsoluteY: 0,
    width: 450,
    height: 650,
  },
};

export const WithPartialFailure: Story = {
  args: {
    id: 'merge-4',
    type: 'merge',
    data: {
      label: 'Wait for All',
      description: 'Skip failed branches',
      mode: 'append',
      continueOnPartialFailure: true,
      handles: [
        { id: 'flow-in', type: 'target', dataType: 'flow', label: 'In', acceptsMultiple: true },
        { id: 'flow-out', type: 'source', dataType: 'flow', label: 'Out' },
        { id: 'merged', type: 'source', dataType: 'json', label: 'Merged Data' },
        { id: 'skipped', type: 'source', dataType: 'json', label: 'Skipped Nodes' }
      ]
    },
    selected: false,
    isConnectable: true,
    zIndex: 1,
    dragging: false,
    positionAbsoluteX: 0,
    positionAbsoluteY: 0,
    width: 450,
    height: 650,
  },
};
