import type { Meta, StoryObj } from '@storybook/react';
import { ReactFlowProvider } from '@xyflow/react';
import { AnalyticsNode } from './AnalyticsNode';
import '@xyflow/react/dist/style.css';

const meta = {
  title: 'Flow/Nodes/AnalyticsNode',
  component: AnalyticsNode,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <ReactFlowProvider>
        <div style={{ width: '450px', height: '500px' }}>
          <Story />
        </div>
      </ReactFlowProvider>
    ),
  ],
} satisfies Meta<typeof AnalyticsNode>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    id: 'analytics-1',
    type: 'analytics',
    data: {
      label: 'Analytics',
      description: 'Log analytics event',
      eventName: 'lead_captured',
      properties: '{"source": "ppc", "campaign": "summer"}',
      handles: [
        { id: 'flow-in', type: 'target', dataType: 'flow', label: 'In' },
        { id: 'flow-out', type: 'source', dataType: 'flow', label: 'Out' },
        { id: 'eventName', type: 'target', dataType: 'string', label: 'Event Name' },
        { id: 'properties', type: 'target', dataType: 'object', label: 'Properties' }
      ]
    },
    selected: false,
    isConnectable: true,
    zIndex: 1,
    dragging: false,
    positionAbsoluteX: 0,
    positionAbsoluteY: 0,
    width: 400,
    height: 450,
  },
};

export const UserSignup: Story = {
  args: {
    id: 'analytics-2',
    type: 'analytics',
    data: {
      label: 'Track Signup',
      description: 'Log user registration event',
      eventName: 'user_signed_up',
      properties: '{\n  "plan": "pro",\n  "referral_source": "friend",\n  "trial_days": 14\n}',
      handles: [
        { id: 'flow-in', type: 'target', dataType: 'flow', label: 'In' },
        { id: 'flow-out', type: 'source', dataType: 'flow', label: 'Out' },
        { id: 'userId', type: 'target', dataType: 'string', label: 'User ID' },
        { id: 'properties', type: 'target', dataType: 'object', label: 'Event Data' }
      ]
    },
    selected: true,
    isConnectable: true,
    zIndex: 1,
    dragging: false,
    positionAbsoluteX: 0,
    positionAbsoluteY: 0,
    width: 400,
    height: 450,
  },
};

export const PurchaseTracking: Story = {
  args: {
    id: 'analytics-3',
    type: 'analytics',
    data: {
      label: 'Purchase Event',
      description: 'Track successful purchase',
      eventName: 'purchase_completed',
      properties: '{\n  "revenue": 99.99,\n  "currency": "USD",\n  "items": 3\n}',
      handles: [
        { id: 'flow-in', type: 'target', dataType: 'flow', label: 'In' },
        { id: 'flow-out', type: 'source', dataType: 'flow', label: 'Out' },
        { id: 'orderId', type: 'target', dataType: 'string', label: 'Order ID' },
        { id: 'properties', type: 'target', dataType: 'object', label: 'Purchase Data' }
      ]
    },
    selected: false,
    isConnectable: true,
    zIndex: 1,
    dragging: false,
    positionAbsoluteX: 0,
    positionAbsoluteY: 0,
    width: 400,
    height: 450,
  },
};
