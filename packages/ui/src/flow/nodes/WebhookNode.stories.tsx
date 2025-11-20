import type { Meta, StoryObj } from '@storybook/react';
import { ReactFlowProvider } from '@xyflow/react';
import { WebhookNode } from './WebhookNode';
import '@xyflow/react/dist/style.css';

const meta = {
  title: 'Flow/Nodes/WebhookNode',
  component: WebhookNode,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <ReactFlowProvider>
        <div style={{ width: '400px', height: '400px' }}>
          <Story />
        </div>
      </ReactFlowProvider>
    ),
  ],
} satisfies Meta<typeof WebhookNode>;

export default meta;
type Story = StoryObj<typeof meta>;

export const PostWebhook: Story = {
  args: {
    id: 'webhook-1',
    type: 'webhook',
    data: {
      label: 'Stripe Webhook',
      method: 'POST',
      path: '/webhooks/stripe',
      handles: [
        { id: 'flow-out', type: 'source', dataType: 'flow', label: 'Out' },
        { id: 'body', type: 'source', dataType: 'json', label: 'Body' },
        { id: 'headers', type: 'source', dataType: 'json', label: 'Headers' },
      ]
    },
    selected: true,
    isConnectable: true,
    zIndex: 1,
    dragging: false,
    positionAbsoluteX: 0,
    positionAbsoluteY: 0,
    width: 400,
    height: 350,
  },
};
