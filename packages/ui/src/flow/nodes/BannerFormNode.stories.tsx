import type { Meta, StoryObj } from '@storybook/react';
import { ReactFlowProvider } from '@xyflow/react';
import { BannerFormNode } from './BannerFormNode';
import '@xyflow/react/dist/style.css';

const meta = {
  title: 'Flow/Nodes/BannerFormNode',
  component: BannerFormNode,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <ReactFlowProvider>
        <div style={{ width: '400px', height: '550px' }}>
          <Story />
        </div>
      </ReactFlowProvider>
    ),
  ],
} satisfies Meta<typeof BannerFormNode>;

export default meta;
type Story = StoryObj<typeof meta>;

export const LeadCaptureForm: Story = {
  args: {
    id: 'banner-1',
    type: 'banner-form',
    data: {
      label: 'Lead Capture',
      message: 'Get 10% off your first order!',
      handles: [
        { id: 'flow-in', type: 'target', dataType: 'flow', label: 'In' },
        { id: 'flow-out', type: 'source', dataType: 'flow', label: 'Out' },
        { id: 'message', type: 'target', dataType: 'string', label: 'Message' },
        { id: 'email', type: 'source', dataType: 'string', label: 'Email' },
        { id: 'name', type: 'source', dataType: 'string', label: 'Name' },
        { id: 'formData', type: 'source', dataType: 'json', label: 'Form Data' },
      ]
    },
    selected: false,
    isConnectable: true,
    zIndex: 1,
    dragging: false,
    positionAbsoluteX: 0,
    positionAbsoluteY: 0,
    width: 400,
    height: 500,
  },
};
