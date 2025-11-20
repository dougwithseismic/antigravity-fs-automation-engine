import type { Meta, StoryObj } from '@storybook/react';
import { ReactFlowProvider } from '@xyflow/react';
import { StartNode } from './StartNode';
import '@xyflow/react/dist/style.css';

const meta = {
  title: 'Flow/Nodes/StartNode',
  component: StartNode,
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
} satisfies Meta<typeof StartNode>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    id: 'start-1',
    type: 'start',
    data: {
      label: 'Start',
      description: 'Entry point for workflow execution',
      payload: '{"userId": "123", "email": "demo@example.com"}',
      handles: [
        { id: 'flow-out', type: 'source', dataType: 'flow', label: 'Out' },
        { id: 'payload', type: 'source', dataType: 'object', label: 'Payload' }
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

export const WithComplexPayload: Story = {
  args: {
    id: 'start-2',
    type: 'start',
    data: {
      label: 'Workflow Start',
      description: 'Begin order processing workflow',
      payload: '{\n  "orderId": "ORD-12345",\n  "customer": {\n    "id": "CUST-789",\n    "email": "customer@example.com"\n  },\n  "items": [\n    {"sku": "ITEM-1", "qty": 2}\n  ]\n}',
      handles: [
        { id: 'flow-out', type: 'source', dataType: 'flow', label: 'Out' },
        { id: 'payload', type: 'source', dataType: 'object', label: 'Order Data' }
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
