import type { Meta, StoryObj } from '@storybook/react';
import { ReactFlowProvider } from '@xyflow/react';
import { FetchNode } from './FetchNode';
import '@xyflow/react/dist/style.css';

const meta = {
  title: 'Flow/Nodes/FetchNode',
  component: FetchNode,
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
} satisfies Meta<typeof FetchNode>;

export default meta;
type Story = StoryObj<typeof meta>;

export const GetRequest: Story = {
  args: {
    id: 'fetch-1',
    type: 'fetch',
    data: {
      label: 'Fetch User Data',
      url: 'https://api.example.com/users/123',
      method: 'GET',
      handles: [
        { id: 'flow-in', type: 'target', dataType: 'flow', label: 'In' },
        { id: 'flow-out', type: 'source', dataType: 'flow', label: 'Out' },
        { id: 'url', type: 'target', dataType: 'string', label: 'URL' },
        { id: 'method', type: 'target', dataType: 'string', label: 'Method' },
        { id: 'headers', type: 'target', dataType: 'json', label: 'Headers' },
        { id: 'data', type: 'source', dataType: 'json', label: 'Response Data' },
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

export const PostRequest: Story = {
  args: {
    id: 'fetch-2',
    type: 'fetch',
    data: {
      label: 'Create User',
      url: 'https://api.example.com/users',
      method: 'POST',
      headers: '{"Content-Type": "application/json"}',
      body: '{"name": "John Doe", "email": "john@example.com"}',
      handles: [
        { id: 'flow-in', type: 'target', dataType: 'flow', label: 'In' },
        { id: 'flow-out', type: 'source', dataType: 'flow', label: 'Out' },
        { id: 'url', type: 'target', dataType: 'string', label: 'URL' },
        { id: 'method', type: 'target', dataType: 'string', label: 'Method' },
        { id: 'headers', type: 'target', dataType: 'json', label: 'Headers' },
        { id: 'body', type: 'target', dataType: 'json', label: 'Body' },
        { id: 'data', type: 'source', dataType: 'json', label: 'Response Data' },
      ]
    },
    selected: false,
    isConnectable: true,
    zIndex: 1,
    dragging: false,
    positionAbsoluteX: 0,
    positionAbsoluteY: 0,
    width: 400,
    height: 550,
  },
};
