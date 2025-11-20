import type { Meta, StoryObj } from '@storybook/react';
import { ReactFlowProvider } from '@xyflow/react';
import { WindowAlertNode } from './WindowAlertNode';
import '@xyflow/react/dist/style.css';

const meta = {
  title: 'Flow/Nodes/WindowAlertNode',
  component: WindowAlertNode,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <ReactFlowProvider>
        <div style={{ width: '500px', height: '550px' }}>
          <Story />
        </div>
      </ReactFlowProvider>
    ),
  ],
} satisfies Meta<typeof WindowAlertNode>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    id: 'window-alert-1',
    type: 'window-alert',
    data: {
      label: 'Window Alert',
      description: 'Client-side alert',
      message: 'Your code is: {{code}}',
      handles: [
        { id: 'flow-in', type: 'target', dataType: 'flow', label: 'In' },
        { id: 'flow-out', type: 'source', dataType: 'flow', label: 'Out' },
        { id: 'message', type: 'target', dataType: 'string', label: 'Message' }
      ]
    },
    selected: false,
    isConnectable: true,
    zIndex: 1,
    dragging: false,
    positionAbsoluteX: 0,
    positionAbsoluteY: 0,
    width: 450,
    height: 500,
  },
};

export const SuccessMessage: Story = {
  args: {
    id: 'window-alert-2',
    type: 'window-alert',
    data: {
      label: 'Success Alert',
      description: 'Show success confirmation',
      message: 'Order {{orderId}} has been confirmed! Check your email at {{email}} for details.',
      handles: [
        { id: 'flow-in', type: 'target', dataType: 'flow', label: 'In' },
        { id: 'flow-out', type: 'source', dataType: 'flow', label: 'Out' },
        { id: 'message', type: 'target', dataType: 'string', label: 'Message' },
        { id: 'orderId', type: 'target', dataType: 'string', label: 'Order ID' },
        { id: 'email', type: 'target', dataType: 'string', label: 'Email' }
      ]
    },
    selected: true,
    isConnectable: true,
    zIndex: 1,
    dragging: false,
    positionAbsoluteX: 0,
    positionAbsoluteY: 0,
    width: 450,
    height: 500,
  },
};

export const ErrorMessage: Story = {
  args: {
    id: 'window-alert-3',
    type: 'window-alert',
    data: {
      label: 'Error Alert',
      description: 'Show error notification',
      message: 'Error: {{error.message}}\nPlease try again or contact support.',
      handles: [
        { id: 'flow-in', type: 'target', dataType: 'flow', label: 'In' },
        { id: 'flow-out', type: 'source', dataType: 'flow', label: 'Out' },
        { id: 'error', type: 'target', dataType: 'object', label: 'Error Data' }
      ]
    },
    selected: false,
    isConnectable: true,
    zIndex: 1,
    dragging: false,
    positionAbsoluteX: 0,
    positionAbsoluteY: 0,
    width: 450,
    height: 500,
  },
};
