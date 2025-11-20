import type { Meta, StoryObj } from '@storybook/react';
import { ReactFlowProvider } from '@xyflow/react';
import { DiscountNode } from './DiscountNode';
import '@xyflow/react/dist/style.css';

const meta = {
  title: 'Flow/Nodes/DiscountNode',
  component: DiscountNode,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <ReactFlowProvider>
        <div style={{ width: '400px', height: '450px' }}>
          <Story />
        </div>
      </ReactFlowProvider>
    ),
  ],
} satisfies Meta<typeof DiscountNode>;

export default meta;
type Story = StoryObj<typeof meta>;

export const TenPercentOff: Story = {
  args: {
    id: 'discount-1',
    type: 'discount',
    data: {
      label: 'Welcome Discount',
      percentage: 10,
      prefix: 'WELCOME',
      handles: [
        { id: 'flow-in', type: 'target', dataType: 'flow', label: 'In' },
        { id: 'flow-out', type: 'source', dataType: 'flow', label: 'Out' },
        { id: 'percentage', type: 'target', dataType: 'number', label: 'Discount %' },
        { id: 'prefix', type: 'target', dataType: 'string', label: 'Code Prefix' },
        { id: 'code', type: 'source', dataType: 'string', label: 'Discount Code' },
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

export const TwentyFivePercentOff: Story = {
  args: {
    id: 'discount-2',
    type: 'discount',
    data: {
      label: 'Flash Sale',
      percentage: 25,
      prefix: 'FLASH',
      handles: [
        { id: 'flow-in', type: 'target', dataType: 'flow', label: 'In' },
        { id: 'flow-out', type: 'source', dataType: 'flow', label: 'Out' },
        { id: 'percentage', type: 'target', dataType: 'number', label: 'Discount %' },
        { id: 'prefix', type: 'target', dataType: 'string', label: 'Code Prefix' },
        { id: 'code', type: 'source', dataType: 'string', label: 'Discount Code' },
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
