import type { Meta, StoryObj } from '@storybook/react';
import { ReactFlowProvider } from '@xyflow/react';
import { DefaultNode, type DefaultNodeData } from './DefaultNode';
import '@xyflow/react/dist/style.css';

const meta = {
  title: 'Flow/DefaultNode',
  component: DefaultNode,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <ReactFlowProvider>
        <div style={{ width: '400px', height: '600px' }}>
          <Story />
        </div>
      </ReactFlowProvider>
    ),
  ],
} satisfies Meta<typeof DefaultNode>;

export default meta;
type Story = StoryObj<typeof meta>;

// Basic node with no inputs
export const Basic: Story = {
  args: {
    id: 'node-1',
    type: 'start',
    data: {
      label: 'Start Node',
      description: 'Entry point for the workflow',
      duration: 'Instant',
    },
    selected: false,
    isConnectable: true,
    zIndex: 1,
    dragging: false,
    positionAbsoluteX: 0,
    positionAbsoluteY: 0,
    width: 350,
    height: 200,
  },
};

// Node with legacy inputs
export const WithLegacyInputs: Story = {
  args: {
    id: 'node-2',
    type: 'fetch',
    data: {
      label: 'Fetch Data',
      description: 'Make an HTTP request',
      duration: '200ms',
      inputs: [
        {
          id: 'url',
          label: 'URL',
          type: 'text',
          placeholder: 'https://api.example.com',
          required: true,
          connection: { enabled: false },
        },
        {
          id: 'method',
          label: 'Method',
          type: 'select',
          options: ['GET', 'POST', 'PUT', 'DELETE'],
          defaultValue: 'GET',
          required: true,
          connection: { enabled: false },
        },
        {
          id: 'headers',
          label: 'Headers',
          type: 'textarea',
          placeholder: '{"Content-Type": "application/json"}',
          connection: { enabled: false },
        },
      ],
    } as DefaultNodeData,
    selected: false,
    isConnectable: true,
    zIndex: 1,
    dragging: false,
    positionAbsoluteX: 0,
    positionAbsoluteY: 0,
    width: 350,
    height: 400,
  },
};

// Node with new architecture (handles)
export const WithHandles: Story = {
  args: {
    id: 'node-3',
    type: 'agent',
    data: {
      label: 'AI Agent',
      description: 'Claude-powered intelligent agent',
      duration: '2.5s',
      handles: [
        { id: 'flow-in', type: 'target', dataType: 'flow', label: 'In' },
        { id: 'flow-out', type: 'source', dataType: 'flow', label: 'Out' },
        { id: 'prompt', type: 'target', dataType: 'string', label: 'Prompt' },
        { id: 'model', type: 'target', dataType: 'model', label: 'Model' },
        { id: 'tools', type: 'target', dataType: 'tool', label: 'Tools' },
        { id: 'response', type: 'source', dataType: 'string', label: 'Response' },
      ],
      ui: {
        inputs: [
          {
            id: 'prompt',
            label: 'Prompt',
            type: 'textarea',
            placeholder: 'Enter your prompt...',
            required: true,
          },
          {
            id: 'model',
            label: 'Model',
            type: 'select',
            options: ['claude-3-5-sonnet', 'claude-3-opus', 'claude-3-haiku'],
            defaultValue: 'claude-3-5-sonnet',
            required: true,
          },
        ],
      },
    } as DefaultNodeData,
    selected: false,
    isConnectable: true,
    zIndex: 1,
    dragging: false,
    positionAbsoluteX: 0,
    positionAbsoluteY: 0,
    width: 350,
    height: 400,
  },
};

// Credential node with password input
export const CredentialNode: Story = {
  args: {
    id: 'node-4',
    type: 'credential',
    data: {
      label: 'API Credentials',
      description: 'Store API authentication',
      duration: 'Instant',
      inputs: [
        {
          id: 'api-key',
          label: 'API Key',
          type: 'password',
          placeholder: 'Enter API key',
          required: true,
          defaultValue: 'sk-1234567890',
          connection: { enabled: false },
        },
        {
          id: 'api-secret',
          label: 'API Secret',
          type: 'password',
          placeholder: 'Enter API secret',
          required: true,
          connection: { enabled: false },
        },
      ],
    } as DefaultNodeData,
    selected: false,
    isConnectable: true,
    zIndex: 1,
    dragging: false,
    positionAbsoluteX: 0,
    positionAbsoluteY: 0,
    width: 350,
    height: 300,
  },
};

// Selected node state
export const Selected: Story = {
  args: {
    id: 'node-5',
    type: 'search',
    data: {
      label: 'Google Search',
      description: 'Search the web',
      duration: '500ms',
      inputs: [
        {
          id: 'query',
          label: 'Search Query',
          type: 'text',
          placeholder: 'What to search for?',
          required: true,
          connection: { enabled: true },
        },
      ],
    } as DefaultNodeData,
    selected: true,
    isConnectable: true,
    zIndex: 1,
    dragging: false,
    positionAbsoluteX: 0,
    positionAbsoluteY: 0,
    width: 350,
    height: 250,
  },
};

// Database node
export const DatabaseNode: Story = {
  args: {
    id: 'node-6',
    type: 'data',
    data: {
      label: 'Query Database',
      description: 'Execute SQL query',
      duration: '150ms',
      inputs: [
        {
          id: 'query',
          label: 'SQL Query',
          type: 'textarea',
          placeholder: 'SELECT * FROM users WHERE...',
          required: true,
          connection: { enabled: false },
        },
        {
          id: 'database',
          label: 'Database',
          type: 'select',
          options: ['PostgreSQL', 'MySQL', 'SQLite'],
          defaultValue: 'PostgreSQL',
          connection: { enabled: false },
        },
      ],
    } as DefaultNodeData,
    selected: false,
    isConnectable: true,
    zIndex: 1,
    dragging: false,
    positionAbsoluteX: 0,
    positionAbsoluteY: 0,
    width: 350,
    height: 350,
  },
};
