import type { Meta, StoryObj } from '@storybook/react';
import { ReactFlowProvider } from '@xyflow/react';
import { SwitchNode } from './SwitchNode';
import '@xyflow/react/dist/style.css';

const meta = {
  title: 'Flow/Nodes/SwitchNode',
  component: SwitchNode,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <ReactFlowProvider>
        <div style={{ width: '500px', height: '600px' }}>
          <Story />
        </div>
      </ReactFlowProvider>
    ),
  ],
} satisfies Meta<typeof SwitchNode>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    id: 'switch-1',
    type: 'switch',
    data: {
      label: 'Switch',
      description: 'Route based on value',
      switchKey: 'source',
      options: ['web', 'mobile', 'api'],
      randomize: false,
      handles: [
        { id: 'flow-in', type: 'target', dataType: 'flow', label: 'In' },
        { id: 'flow-out-web', type: 'source', dataType: 'flow', label: 'Web' },
        { id: 'flow-out-mobile', type: 'source', dataType: 'flow', label: 'Mobile' },
        { id: 'flow-out-api', type: 'source', dataType: 'flow', label: 'API' },
        { id: 'switchKey', type: 'target', dataType: 'string', label: 'Route Key' },
        { id: 'selectedRoute', type: 'source', dataType: 'string', label: 'Selected Route' }
      ]
    },
    selected: false,
    isConnectable: true,
    zIndex: 1,
    dragging: false,
    positionAbsoluteX: 0,
    positionAbsoluteY: 0,
    width: 450,
    height: 550,
  },
};

export const ABTest: Story = {
  args: {
    id: 'switch-2',
    type: 'switch',
    data: {
      label: 'A/B Test Router',
      description: 'Random experiment assignment',
      switchKey: 'variant',
      options: ['control', 'variant-a', 'variant-b'],
      randomize: true,
      handles: [
        { id: 'flow-in', type: 'target', dataType: 'flow', label: 'In' },
        { id: 'flow-out-control', type: 'source', dataType: 'flow', label: 'Control' },
        { id: 'flow-out-a', type: 'source', dataType: 'flow', label: 'Variant A' },
        { id: 'flow-out-b', type: 'source', dataType: 'flow', label: 'Variant B' },
        { id: 'selectedRoute', type: 'source', dataType: 'string', label: 'Assigned Variant' }
      ]
    },
    selected: true,
    isConnectable: true,
    zIndex: 1,
    dragging: false,
    positionAbsoluteX: 0,
    positionAbsoluteY: 0,
    width: 450,
    height: 550,
  },
};
