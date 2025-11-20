import type { Meta, StoryObj } from '@storybook/react';
import { ReactFlowProvider } from '@xyflow/react';
import { VariableNode } from './VariableNode';
import '@xyflow/react/dist/style.css';

const meta = {
  title: 'Flow/Nodes/VariableNode',
  component: VariableNode,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <ReactFlowProvider>
        <div style={{ width: '400px', height: '300px' }}>
          <Story />
        </div>
      </ReactFlowProvider>
    ),
  ],
} satisfies Meta<typeof VariableNode>;

export default meta;
type Story = StoryObj<typeof meta>;

export const StringVariable: Story = {
  args: {
    id: 'var-1',
    type: 'variable',
    data: {
      label: 'User Name',
      value: 'John Doe',
      dataType: 'string',
      handles: [
        { id: 'value', type: 'source', dataType: 'string', label: 'Value' }
      ]
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

export const NumberVariable: Story = {
  args: {
    id: 'var-2',
    type: 'variable',
    data: {
      label: 'Discount Percent',
      value: '10',
      dataType: 'number',
      handles: [
        { id: 'value', type: 'source', dataType: 'number', label: 'Value' }
      ]
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

export const JSONVariable: Story = {
  args: {
    id: 'var-3',
    type: 'variable',
    data: {
      label: 'Config',
      value: '{"theme": "dark", "locale": "en"}',
      dataType: 'json',
      handles: [
        { id: 'value', type: 'source', dataType: 'json', label: 'Value' }
      ]
    },
    selected: true,
    isConnectable: true,
    zIndex: 1,
    dragging: false,
    positionAbsoluteX: 0,
    positionAbsoluteY: 0,
    width: 350,
    height: 200,
  },
};
