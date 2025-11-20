import type { Meta, StoryObj } from '@storybook/react';
import { ReactFlowProvider } from '@xyflow/react';
import { FilterNode } from './FilterNode';
import '@xyflow/react/dist/style.css';

const meta = {
  title: 'Flow/Nodes/FilterNode',
  component: FilterNode,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <ReactFlowProvider>
        <div style={{ width: '450px', height: '500px' }}>
          <Story />
        </div>
      </ReactFlowProvider>
    ),
  ],
} satisfies Meta<typeof FilterNode>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    id: 'filter-1',
    type: 'filter',
    data: {
      label: 'Filter',
      description: 'Filter data by condition',
      field: 'user.id',
      operator: 'equals',
      value: '12345',
      handles: [
        { id: 'flow-in', type: 'target', dataType: 'flow', label: 'In' },
        { id: 'flow-out-match', type: 'source', dataType: 'flow', label: 'Match' },
        { id: 'flow-out-no-match', type: 'source', dataType: 'flow', label: 'No Match' },
        { id: 'input', type: 'target', dataType: 'any', label: 'Data' },
        { id: 'matched', type: 'source', dataType: 'array', label: 'Matched Items' }
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

export const EmailFilter: Story = {
  args: {
    id: 'filter-2',
    type: 'filter',
    data: {
      label: 'Email Domain Filter',
      description: 'Filter users by email domain',
      field: 'email',
      operator: 'contains',
      value: '@company.com',
      handles: [
        { id: 'flow-in', type: 'target', dataType: 'flow', label: 'In' },
        { id: 'flow-out-match', type: 'source', dataType: 'flow', label: 'Company Email' },
        { id: 'flow-out-no-match', type: 'source', dataType: 'flow', label: 'Other' },
        { id: 'users', type: 'target', dataType: 'array', label: 'Users' },
        { id: 'matched', type: 'source', dataType: 'array', label: 'Company Users' }
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

export const ExistsCheck: Story = {
  args: {
    id: 'filter-3',
    type: 'filter',
    data: {
      label: 'Has Profile',
      description: 'Check if profile photo exists',
      field: 'profile.photo',
      operator: 'exists',
      handles: [
        { id: 'flow-in', type: 'target', dataType: 'flow', label: 'In' },
        { id: 'flow-out-match', type: 'source', dataType: 'flow', label: 'Has Photo' },
        { id: 'flow-out-no-match', type: 'source', dataType: 'flow', label: 'No Photo' },
        { id: 'users', type: 'target', dataType: 'array', label: 'Users' }
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
