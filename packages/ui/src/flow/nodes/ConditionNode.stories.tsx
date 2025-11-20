import type { Meta, StoryObj } from '@storybook/react';
import { ReactFlowProvider } from '@xyflow/react';
import { ConditionNode } from './ConditionNode';
import '@xyflow/react/dist/style.css';

const meta = {
  title: 'Flow/Nodes/ConditionNode',
  component: ConditionNode,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <ReactFlowProvider>
        <div style={{ width: '400px', height: '500px' }}>
          <Story />
        </div>
      </ReactFlowProvider>
    ),
  ],
} satisfies Meta<typeof ConditionNode>;

export default meta;
type Story = StoryObj<typeof meta>;

export const UtmSourceCheck: Story = {
  args: {
    id: 'cond-1',
    type: 'condition',
    data: {
      label: 'Check Traffic Source',
      key: 'query.utm_source',
      operator: '==',
      value: 'ppc',
      handles: [
        { id: 'flow-in', type: 'target', dataType: 'flow', label: 'In' },
        { id: 'flow-out', type: 'source', dataType: 'flow', label: 'Out' },
        { id: 'key', type: 'target', dataType: 'string', label: 'Key Path' },
        { id: 'operator', type: 'target', dataType: 'string', label: 'Operator' },
        { id: 'value', type: 'target', dataType: 'string', label: 'Value' },
        { id: 'result', type: 'source', dataType: 'boolean', label: 'Result' },
      ]
    },
    selected: false,
    isConnectable: true,
    zIndex: 1,
    dragging: false,
    positionAbsoluteX: 0,
    positionAbsoluteY: 0,
    width: 400,
    height: 450,
  },
};

export const ContainsCheck: Story = {
  args: {
    id: 'cond-2',
    type: 'condition',
    data: {
      label: 'Email Domain Check',
      key: 'user.email',
      operator: 'contains',
      value: '@company.com',
      handles: [
        { id: 'flow-in', type: 'target', dataType: 'flow', label: 'In' },
        { id: 'flow-out', type: 'source', dataType: 'flow', label: 'Out' },
        { id: 'key', type: 'target', dataType: 'string', label: 'Key Path' },
        { id: 'operator', type: 'target', dataType: 'string', label: 'Operator' },
        { id: 'value', type: 'target', dataType: 'string', label: 'Value' },
        { id: 'result', type: 'source', dataType: 'boolean', label: 'Result' },
      ]
    },
    selected: true,
    isConnectable: true,
    zIndex: 1,
    dragging: false,
    positionAbsoluteX: 0,
    positionAbsoluteY: 0,
    width: 400,
    height: 450,
  },
};
