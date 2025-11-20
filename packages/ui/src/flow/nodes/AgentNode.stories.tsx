import type { Meta, StoryObj } from '@storybook/react';
import { ReactFlowProvider } from '@xyflow/react';
import { AgentNode } from './AgentNode';
import '@xyflow/react/dist/style.css';

const meta = {
  title: 'Flow/Nodes/AgentNode',
  component: AgentNode,
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
} satisfies Meta<typeof AgentNode>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    id: 'agent-1',
    type: 'agent',
    data: {
      label: 'AI Agent',
      description: 'Claude-powered intelligent agent',
      instructions: 'You are a helpful assistant that helps users with their tasks.',
      model: 'claude-3-5-sonnet',
      handles: [
        { id: 'flow-in', type: 'target', dataType: 'flow', label: 'In' },
        { id: 'flow-out', type: 'source', dataType: 'flow', label: 'Out' },
        { id: 'model', type: 'target', dataType: 'model', label: 'Language Model' },
        { id: 'tools', type: 'target', dataType: 'tool', label: 'Tools', acceptsMultiple: true },
        { id: 'chat-input', type: 'target', dataType: 'string', label: 'Chat Input' },
        { id: 'response', type: 'source', dataType: 'string', label: 'Response' }
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

export const WithTools: Story = {
  args: {
    id: 'agent-2',
    type: 'agent',
    data: {
      label: 'Research Agent',
      description: 'Agent with web search capabilities',
      instructions: 'You are a research assistant. Use web search to find accurate information.',
      model: 'claude-3-opus',
      tools: [
        { name: 'web_search' },
        { name: 'calculator' },
        { name: 'file_reader' }
      ],
      handles: [
        { id: 'flow-in', type: 'target', dataType: 'flow', label: 'In' },
        { id: 'flow-out', type: 'source', dataType: 'flow', label: 'Out' },
        { id: 'model', type: 'target', dataType: 'model', label: 'Language Model' },
        { id: 'tools', type: 'target', dataType: 'tool', label: 'Tools', acceptsMultiple: true },
        { id: 'chat-input', type: 'target', dataType: 'string', label: 'Chat Input' },
        { id: 'response', type: 'source', dataType: 'string', label: 'Response' }
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
