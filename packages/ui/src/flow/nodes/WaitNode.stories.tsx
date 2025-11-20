import type { Meta, StoryObj } from '@storybook/react';
import { ReactFlowProvider } from '@xyflow/react';
import { WaitNode } from './WaitNode';
import '@xyflow/react/dist/style.css';

const meta = {
  title: 'Flow/Nodes/WaitNode',
  component: WaitNode,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <ReactFlowProvider>
        <div style={{ width: '450px', height: '550px' }}>
          <Story />
        </div>
      </ReactFlowProvider>
    ),
  ],
} satisfies Meta<typeof WaitNode>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    id: 'wait-1',
    type: 'wait',
    data: {
      label: 'Wait',
      description: 'Pause execution',
      amount: 10,
      unit: 'seconds',
      handles: [
        { id: 'flow-in', type: 'target', dataType: 'flow', label: 'In' },
        { id: 'flow-out', type: 'source', dataType: 'flow', label: 'Out' },
        { id: 'amount', type: 'target', dataType: 'number', label: 'Duration' }
      ]
    },
    selected: false,
    isConnectable: true,
    zIndex: 1,
    dragging: false,
    positionAbsoluteX: 0,
    positionAbsoluteY: 0,
    width: 400,
    height: 500,
  },
};

export const DelayedNotification: Story = {
  args: {
    id: 'wait-2',
    type: 'wait',
    data: {
      label: 'Delay Notification',
      description: 'Wait 24 hours before sending reminder',
      amount: 24,
      unit: 'hours',
      handles: [
        { id: 'flow-in', type: 'target', dataType: 'flow', label: 'In' },
        { id: 'flow-out', type: 'source', dataType: 'flow', label: 'Out' },
        { id: 'amount', type: 'target', dataType: 'number', label: 'Duration' },
        { id: 'resumeAt', type: 'source', dataType: 'string', label: 'Resume Time' }
      ]
    },
    selected: true,
    isConnectable: true,
    zIndex: 1,
    dragging: false,
    positionAbsoluteX: 0,
    positionAbsoluteY: 0,
    width: 400,
    height: 500,
  },
};

export const LongDelay: Story = {
  args: {
    id: 'wait-3',
    type: 'wait',
    data: {
      label: 'Trial Period',
      description: 'Wait 7 days for trial expiration',
      amount: 7,
      unit: 'days',
      handles: [
        { id: 'flow-in', type: 'target', dataType: 'flow', label: 'In' },
        { id: 'flow-out', type: 'source', dataType: 'flow', label: 'Out' },
        { id: 'amount', type: 'target', dataType: 'number', label: 'Duration' }
      ]
    },
    selected: false,
    isConnectable: true,
    zIndex: 1,
    dragging: false,
    positionAbsoluteX: 0,
    positionAbsoluteY: 0,
    width: 400,
    height: 500,
  },
};
