import type { Meta, StoryObj } from '@storybook/react';
import { ReactFlowProvider } from '@xyflow/react';
import { CredentialNode } from './CredentialNode';
import '@xyflow/react/dist/style.css';

const meta = {
  title: 'Flow/Nodes/CredentialNode',
  component: CredentialNode,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <ReactFlowProvider>
        <div style={{ width: '450px', height: '400px' }}>
          <Story />
        </div>
      </ReactFlowProvider>
    ),
  ],
} satisfies Meta<typeof CredentialNode>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    id: 'credential-1',
    type: 'credential',
    data: {
      label: 'Credentials',
      description: 'Load from environment',
      key: 'OPENAI_API_KEY',
      handles: [
        { id: 'value', type: 'source', dataType: 'string', label: 'API Key' }
      ]
    },
    selected: false,
    isConnectable: true,
    zIndex: 1,
    dragging: false,
    positionAbsoluteX: 0,
    positionAbsoluteY: 0,
    width: 400,
    height: 350,
  },
};

export const DatabaseCredential: Story = {
  args: {
    id: 'credential-2',
    type: 'credential',
    data: {
      label: 'Database URL',
      description: 'PostgreSQL connection string',
      key: 'DATABASE_URL',
      handles: [
        { id: 'value', type: 'source', dataType: 'string', label: 'Connection String' }
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

export const WebhookSecret: Story = {
  args: {
    id: 'credential-3',
    type: 'credential',
    data: {
      label: 'Webhook Secret',
      description: 'Secure webhook signing key',
      key: 'WEBHOOK_SIGNING_SECRET',
      handles: [
        { id: 'value', type: 'source', dataType: 'string', label: 'Secret Key' }
      ]
    },
    selected: false,
    isConnectable: true,
    zIndex: 1,
    dragging: false,
    positionAbsoluteX: 0,
    positionAbsoluteY: 0,
    width: 400,
    height: 350,
  },
};
