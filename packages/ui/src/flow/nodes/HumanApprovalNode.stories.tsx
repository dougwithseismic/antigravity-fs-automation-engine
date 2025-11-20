import type { Meta, StoryObj } from '@storybook/react';
import { ReactFlowProvider } from '@xyflow/react';
import { HumanApprovalNode } from './HumanApprovalNode';
import '@xyflow/react/dist/style.css';

const meta = {
  title: 'Flow/Nodes/HumanApprovalNode',
  component: HumanApprovalNode,
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
} satisfies Meta<typeof HumanApprovalNode>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    id: 'human-approval-1',
    type: 'human-approval',
    data: {
      label: 'Human Approval',
      description: 'Pause for approval',
      prompt: 'Approval required',
      channel: 'slack',
      handles: [
        { id: 'flow-in', type: 'target', dataType: 'flow', label: 'In' },
        { id: 'flow-out-approved', type: 'source', dataType: 'flow', label: 'Approved' },
        { id: 'flow-out-rejected', type: 'source', dataType: 'flow', label: 'Rejected' },
        { id: 'decision', type: 'source', dataType: 'string', label: 'Decision' }
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

export const DiscountApproval: Story = {
  args: {
    id: 'human-approval-2',
    type: 'human-approval',
    data: {
      label: 'Discount Approval',
      description: 'Requires manager approval for large discounts',
      prompt: 'Customer requesting 30% discount on $5,000 order.\n\nOrder #12345\nCustomer: Acme Corp\nReason: Bulk purchase\n\nApprove discount?',
      channel: 'slack',
      handles: [
        { id: 'flow-in', type: 'target', dataType: 'flow', label: 'In' },
        { id: 'flow-out-approved', type: 'source', dataType: 'flow', label: 'Approved' },
        { id: 'flow-out-rejected', type: 'source', dataType: 'flow', label: 'Rejected' },
        { id: 'orderId', type: 'target', dataType: 'string', label: 'Order ID' },
        { id: 'decision', type: 'source', dataType: 'string', label: 'Decision' },
        { id: 'approver', type: 'source', dataType: 'string', label: 'Approver' }
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

export const ContentReview: Story = {
  args: {
    id: 'human-approval-3',
    type: 'human-approval',
    data: {
      label: 'Content Review',
      description: 'Editorial approval for blog post',
      prompt: 'New blog post ready for review:\n\nTitle: "10 Tips for Better Workflow Automation"\nAuthor: Jane Smith\nWord count: 1,850\n\nReview and approve for publication?',
      channel: 'email',
      handles: [
        { id: 'flow-in', type: 'target', dataType: 'flow', label: 'In' },
        { id: 'flow-out-approved', type: 'source', dataType: 'flow', label: 'Publish' },
        { id: 'flow-out-rejected', type: 'source', dataType: 'flow', label: 'Needs Revision' },
        { id: 'postId', type: 'target', dataType: 'string', label: 'Post ID' },
        { id: 'decision', type: 'source', dataType: 'string', label: 'Decision' }
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
