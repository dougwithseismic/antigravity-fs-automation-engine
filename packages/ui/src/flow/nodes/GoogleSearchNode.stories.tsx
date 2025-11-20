import type { Meta, StoryObj } from '@storybook/react';
import { ReactFlowProvider } from '@xyflow/react';
import { GoogleSearchNode } from './GoogleSearchNode';
import '@xyflow/react/dist/style.css';

const meta = {
  title: 'Flow/Nodes/GoogleSearchNode',
  component: GoogleSearchNode,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <ReactFlowProvider>
        <div style={{ width: '500px', height: '600px' }}>
          <Story />
        </div>
      </ReactFlowProvider>
    ),
  ],
} satisfies Meta<typeof GoogleSearchNode>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    id: 'google-search-1',
    type: 'google-search',
    data: {
      label: 'Google Search',
      description: 'Interactive search mockup',
      searchQuery: 'best running shoes 2025',
      handles: [
        { id: 'flow-in', type: 'target', dataType: 'flow', label: 'In' },
        { id: 'flow-out-ppc', type: 'source', dataType: 'flow', label: 'PPC Result' },
        { id: 'flow-out-shopping', type: 'source', dataType: 'flow', label: 'Shopping' },
        { id: 'flow-out-organic', type: 'source', dataType: 'flow', label: 'Organic' },
        { id: 'selectedSource', type: 'source', dataType: 'string', label: 'Traffic Source' }
      ]
    },
    selected: false,
    isConnectable: true,
    zIndex: 1,
    dragging: false,
    positionAbsoluteX: 0,
    positionAbsoluteY: 0,
    width: 450,
    height: 550,
  },
};

export const ProductSearch: Story = {
  args: {
    id: 'google-search-2',
    type: 'google-search',
    data: {
      label: 'Product Search',
      description: 'E-commerce search simulation',
      searchQuery: 'wireless headphones under $100',
      handles: [
        { id: 'flow-in', type: 'target', dataType: 'flow', label: 'In' },
        { id: 'flow-out-ppc', type: 'source', dataType: 'flow', label: 'PPC' },
        { id: 'flow-out-shopping', type: 'source', dataType: 'flow', label: 'Shopping' },
        { id: 'flow-out-organic', type: 'source', dataType: 'flow', label: 'Organic' },
        { id: 'searchQuery', type: 'target', dataType: 'string', label: 'Query' },
        { id: 'selectedSource', type: 'source', dataType: 'string', label: 'Source' }
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
