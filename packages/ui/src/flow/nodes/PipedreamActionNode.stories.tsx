import type { Meta, StoryObj } from '@storybook/react';
import { ReactFlowProvider } from '@xyflow/react';
import { PipedreamActionNode } from './PipedreamActionNode';
import '@xyflow/react/dist/style.css';

const meta = {
  title: 'Flow/Nodes/PipedreamActionNode',
  component: PipedreamActionNode,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <ReactFlowProvider>
        <div style={{ width: '500px', height: '650px' }}>
          <Story />
        </div>
      </ReactFlowProvider>
    ),
  ],
} satisfies Meta<typeof PipedreamActionNode>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    id: 'pipedream-1',
    type: 'pipedream-action',
    data: {
      label: 'Pipedream Action',
      description: 'Connect to 3000+ apps',
      componentId: '@pipedreams/slack',
      actionName: 'send_message',
      handles: [
        { id: 'flow-in', type: 'target', dataType: 'flow', label: 'In' },
        { id: 'flow-out', type: 'source', dataType: 'flow', label: 'Out' },
        { id: 'componentId', type: 'target', dataType: 'string', label: 'Component' },
        { id: 'payload', type: 'target', dataType: 'object', label: 'Data' },
        { id: 'response', type: 'source', dataType: 'object', label: 'Response' }
      ]
    },
    selected: false,
    isConnectable: true,
    zIndex: 1,
    dragging: false,
    positionAbsoluteX: 0,
    positionAbsoluteY: 0,
    width: 450,
    height: 600,
  },
};

export const SlackNotification: Story = {
  args: {
    id: 'pipedream-2',
    type: 'pipedream-action',
    data: {
      label: 'Send Slack Message',
      description: 'Post notification to Slack channel',
      componentId: '@pipedreams/slack',
      actionName: 'send_message',
      handles: [
        { id: 'flow-in', type: 'target', dataType: 'flow', label: 'In' },
        { id: 'flow-out', type: 'source', dataType: 'flow', label: 'Out' },
        { id: 'message', type: 'target', dataType: 'string', label: 'Message' },
        { id: 'channel', type: 'target', dataType: 'string', label: 'Channel' },
        { id: 'response', type: 'source', dataType: 'object', label: 'Slack Response' }
      ]
    },
    selected: true,
    isConnectable: true,
    zIndex: 1,
    dragging: false,
    positionAbsoluteX: 0,
    positionAbsoluteY: 0,
    width: 450,
    height: 600,
  },
};

export const GoogleSheets: Story = {
  args: {
    id: 'pipedream-3',
    type: 'pipedream-action',
    data: {
      label: 'Add Row to Sheet',
      description: 'Append data to Google Sheets',
      componentId: '@pipedreams/google-sheets',
      actionName: 'append_row',
      handles: [
        { id: 'flow-in', type: 'target', dataType: 'flow', label: 'In' },
        { id: 'flow-out', type: 'source', dataType: 'flow', label: 'Out' },
        { id: 'spreadsheetId', type: 'target', dataType: 'string', label: 'Spreadsheet ID' },
        { id: 'data', type: 'target', dataType: 'array', label: 'Row Data' },
        { id: 'response', type: 'source', dataType: 'object', label: 'Result' }
      ]
    },
    selected: false,
    isConnectable: true,
    zIndex: 1,
    dragging: false,
    positionAbsoluteX: 0,
    positionAbsoluteY: 0,
    width: 450,
    height: 600,
  },
};
