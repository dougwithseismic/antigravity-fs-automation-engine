import type { Meta, StoryObj } from '@storybook/react';
import { ReactFlowProvider } from '@xyflow/react';
import { EmailNode } from './EmailNode';
import '@xyflow/react/dist/style.css';

const meta = {
  title: 'Flow/Nodes/EmailNode',
  component: EmailNode,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <ReactFlowProvider>
        <div style={{ width: '450px', height: '600px' }}>
          <Story />
        </div>
      </ReactFlowProvider>
    ),
  ],
} satisfies Meta<typeof EmailNode>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WelcomeEmail: Story = {
  args: {
    id: 'email-1',
    type: 'email',
    data: {
      label: 'Welcome Email',
      provider: 'klaviyo',
      templateId: 'welcome_offer',
      to: 'user@example.com',
      handles: [
        { id: 'flow-in', type: 'target', dataType: 'flow', label: 'In' },
        { id: 'flow-out', type: 'source', dataType: 'flow', label: 'Out' },
        { id: 'provider', type: 'target', dataType: 'string', label: 'Provider' },
        { id: 'templateId', type: 'target', dataType: 'string', label: 'Template ID' },
        { id: 'to', type: 'target', dataType: 'string', label: 'To Email' },
        { id: 'variables', type: 'target', dataType: 'json', label: 'Variables' },
        { id: 'emailSent', type: 'source', dataType: 'boolean', label: 'Email Sent' },
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
