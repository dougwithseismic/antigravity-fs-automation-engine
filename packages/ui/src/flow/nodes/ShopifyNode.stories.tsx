import type { Meta, StoryObj } from '@storybook/react';
import { ReactFlowProvider } from '@xyflow/react';
import { ShopifyNode } from './ShopifyNode';
import '@xyflow/react/dist/style.css';

const meta = {
  title: 'Flow/Nodes/ShopifyNode',
  component: ShopifyNode,
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
} satisfies Meta<typeof ShopifyNode>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    id: 'shopify-1',
    type: 'shopify',
    data: {
      label: 'Shopify Action',
      description: 'Shopify integration',
      action: 'create_order',
      handles: [
        { id: 'flow-in', type: 'target', dataType: 'flow', label: 'In' },
        { id: 'flow-out', type: 'source', dataType: 'flow', label: 'Out' },
        { id: 'data', type: 'target', dataType: 'object', label: 'Order Data' },
        { id: 'result', type: 'source', dataType: 'object', label: 'Created Order' }
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

export const CreateCustomer: Story = {
  args: {
    id: 'shopify-2',
    type: 'shopify',
    data: {
      label: 'Create Shopify Customer',
      description: 'Add new customer to Shopify',
      action: 'create_customer',
      handles: [
        { id: 'flow-in', type: 'target', dataType: 'flow', label: 'In' },
        { id: 'flow-out', type: 'source', dataType: 'flow', label: 'Out' },
        { id: 'email', type: 'target', dataType: 'string', label: 'Email' },
        { id: 'firstName', type: 'target', dataType: 'string', label: 'First Name' },
        { id: 'lastName', type: 'target', dataType: 'string', label: 'Last Name' },
        { id: 'customer', type: 'source', dataType: 'object', label: 'Customer' }
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

export const UpdateOrder: Story = {
  args: {
    id: 'shopify-3',
    type: 'shopify',
    data: {
      label: 'Update Order Status',
      description: 'Mark order as fulfilled',
      action: 'update_order',
      handles: [
        { id: 'flow-in', type: 'target', dataType: 'flow', label: 'In' },
        { id: 'flow-out', type: 'source', dataType: 'flow', label: 'Out' },
        { id: 'orderId', type: 'target', dataType: 'string', label: 'Order ID' },
        { id: 'status', type: 'target', dataType: 'string', label: 'Status' },
        { id: 'order', type: 'source', dataType: 'object', label: 'Updated Order' }
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

export const CreateProduct: Story = {
  args: {
    id: 'shopify-4',
    type: 'shopify',
    data: {
      label: 'Create Product',
      description: 'Add new product to catalog',
      action: 'create_product',
      handles: [
        { id: 'flow-in', type: 'target', dataType: 'flow', label: 'In' },
        { id: 'flow-out', type: 'source', dataType: 'flow', label: 'Out' },
        { id: 'title', type: 'target', dataType: 'string', label: 'Title' },
        { id: 'price', type: 'target', dataType: 'number', label: 'Price' },
        { id: 'inventory', type: 'target', dataType: 'number', label: 'Stock' },
        { id: 'product', type: 'source', dataType: 'object', label: 'Created Product' }
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
