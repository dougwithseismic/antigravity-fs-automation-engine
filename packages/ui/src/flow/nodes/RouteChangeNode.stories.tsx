import type { Meta, StoryObj } from '@storybook/react';
import { ReactFlowProvider } from '@xyflow/react';
import { RouteChangeNode } from './RouteChangeNode';
import '@xyflow/react/dist/style.css';

const meta = {
  title: 'Flow/Nodes/RouteChangeNode',
  component: RouteChangeNode,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <ReactFlowProvider>
        <div style={{ width: '500px', height: '550px' }}>
          <Story />
        </div>
      </ReactFlowProvider>
    ),
  ],
} satisfies Meta<typeof RouteChangeNode>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    id: 'route-change-1',
    type: 'route-change',
    data: {
      label: 'Route Change',
      description: 'Browser navigation trigger',
      pathPattern: '/',
      handles: [
        { id: 'flow-out', type: 'source', dataType: 'flow', label: 'Out' },
        { id: 'path', type: 'source', dataType: 'string', label: 'Current Path' },
        { id: 'params', type: 'source', dataType: 'object', label: 'URL Params' }
      ]
    },
    selected: false,
    isConnectable: true,
    zIndex: 1,
    dragging: false,
    positionAbsoluteX: 0,
    positionAbsoluteY: 0,
    width: 450,
    height: 500,
  },
};

export const ProductPageTrigger: Story = {
  args: {
    id: 'route-change-2',
    type: 'route-change',
    data: {
      label: 'Product Page Visit',
      description: 'Trigger on product page navigation',
      pathPattern: '/products/*',
      handles: [
        { id: 'flow-out', type: 'source', dataType: 'flow', label: 'Out' },
        { id: 'path', type: 'source', dataType: 'string', label: 'Product Path' },
        { id: 'productId', type: 'source', dataType: 'string', label: 'Product ID' }
      ]
    },
    selected: true,
    isConnectable: true,
    zIndex: 1,
    dragging: false,
    positionAbsoluteX: 0,
    positionAbsoluteY: 0,
    width: 450,
    height: 500,
  },
};

export const CheckoutTrigger: Story = {
  args: {
    id: 'route-change-3',
    type: 'route-change',
    data: {
      label: 'Checkout Started',
      description: 'Trigger when user reaches checkout',
      pathPattern: '/checkout',
      handles: [
        { id: 'flow-out', type: 'source', dataType: 'flow', label: 'Out' },
        { id: 'path', type: 'source', dataType: 'string', label: 'Checkout Path' },
        { id: 'timestamp', type: 'source', dataType: 'string', label: 'Visit Time' }
      ]
    },
    selected: false,
    isConnectable: true,
    zIndex: 1,
    dragging: false,
    positionAbsoluteX: 0,
    positionAbsoluteY: 0,
    width: 450,
    height: 500,
  },
};
