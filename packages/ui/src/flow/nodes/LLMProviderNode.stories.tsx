import type { Meta, StoryObj } from '@storybook/react';
import { ReactFlowProvider } from '@xyflow/react';
import { LLMProviderNode } from './LLMProviderNode';
import '@xyflow/react/dist/style.css';

const meta = {
  title: 'Flow/Nodes/LLMProviderNode',
  component: LLMProviderNode,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <ReactFlowProvider>
        <div style={{ width: '450px', height: '450px' }}>
          <Story />
        </div>
      </ReactFlowProvider>
    ),
  ],
} satisfies Meta<typeof LLMProviderNode>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    id: 'llm-provider-1',
    type: 'llm-provider',
    data: {
      label: 'LLM Provider',
      description: 'Configure language model',
      model: 'gpt-4',
      handles: [
        { id: 'credential', type: 'target', dataType: 'string', label: 'API Key' },
        { id: 'provider', type: 'source', dataType: 'model', label: 'Model' }
      ]
    },
    selected: false,
    isConnectable: true,
    zIndex: 1,
    dragging: false,
    positionAbsoluteX: 0,
    positionAbsoluteY: 0,
    width: 400,
    height: 400,
  },
};

export const ClaudeProvider: Story = {
  args: {
    id: 'llm-provider-2',
    type: 'llm-provider',
    data: {
      label: 'Claude Model',
      description: 'Anthropic Claude 3 Opus',
      model: 'claude-3-opus',
      handles: [
        { id: 'credential', type: 'target', dataType: 'string', label: 'API Key' },
        { id: 'provider', type: 'source', dataType: 'model', label: 'Model' }
      ]
    },
    selected: true,
    isConnectable: true,
    zIndex: 1,
    dragging: false,
    positionAbsoluteX: 0,
    positionAbsoluteY: 0,
    width: 400,
    height: 400,
  },
};

export const GPT35Provider: Story = {
  args: {
    id: 'llm-provider-3',
    type: 'llm-provider',
    data: {
      label: 'GPT-3.5',
      description: 'Fast and cost-effective model',
      model: 'gpt-3.5-turbo',
      handles: [
        { id: 'credential', type: 'target', dataType: 'string', label: 'API Key' },
        { id: 'provider', type: 'source', dataType: 'model', label: 'Model' }
      ]
    },
    selected: false,
    isConnectable: true,
    zIndex: 1,
    dragging: false,
    positionAbsoluteX: 0,
    positionAbsoluteY: 0,
    width: 400,
    height: 400,
  },
};
