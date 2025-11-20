import type { Meta, StoryObj } from '@storybook/react';
import { ReactFlowProvider } from '@xyflow/react';
import { ExtractQueryParamsNode } from './ExtractQueryParamsNode';
import '@xyflow/react/dist/style.css';

const meta = {
  title: 'Flow/Nodes/ExtractQueryParamsNode',
  component: ExtractQueryParamsNode,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <ReactFlowProvider>
        <div style={{ width: '500px', height: '500px' }}>
          <Story />
        </div>
      </ReactFlowProvider>
    ),
  ],
} satisfies Meta<typeof ExtractQueryParamsNode>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    id: 'extract-1',
    type: 'extract-query-params',
    data: {
      label: 'Extract Query Params',
      description: 'Parse URL parameters',
      url: 'https://example.com?utm_source=ppc&utm_campaign=spring2024',
      handles: [
        { id: 'flow-in', type: 'target', dataType: 'flow', label: 'In' },
        { id: 'flow-out', type: 'source', dataType: 'flow', label: 'Out' },
        { id: 'url', type: 'target', dataType: 'string', label: 'URL' },
        { id: 'params', type: 'source', dataType: 'object', label: 'Parameters' }
      ]
    },
    selected: false,
    isConnectable: true,
    zIndex: 1,
    dragging: false,
    positionAbsoluteX: 0,
    positionAbsoluteY: 0,
    width: 450,
    height: 450,
  },
};

export const MarketingTracker: Story = {
  args: {
    id: 'extract-2',
    type: 'extract-query-params',
    data: {
      label: 'UTM Extractor',
      description: 'Extract marketing campaign parameters',
      url: 'https://shop.example.com/products?utm_source=facebook&utm_medium=social&utm_campaign=summer_sale&utm_content=ad_variant_b',
      handles: [
        { id: 'flow-in', type: 'target', dataType: 'flow', label: 'In' },
        { id: 'flow-out', type: 'source', dataType: 'flow', label: 'Out' },
        { id: 'url', type: 'target', dataType: 'string', label: 'Landing URL' },
        { id: 'params', type: 'source', dataType: 'object', label: 'UTM Data' }
      ]
    },
    selected: true,
    isConnectable: true,
    zIndex: 1,
    dragging: false,
    positionAbsoluteX: 0,
    positionAbsoluteY: 0,
    width: 450,
    height: 450,
  },
};
