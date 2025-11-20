import type { Meta, StoryObj } from '@storybook/react';
import { ReactFlowProvider } from '@xyflow/react';
import { CodeNode } from './CodeNode';
import '@xyflow/react/dist/style.css';

const meta = {
  title: 'Flow/Nodes/CodeNode',
  component: CodeNode,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <ReactFlowProvider>
        <div style={{ width: '500px', height: '600px' }}>
          <Story />
        </div>
      </ReactFlowProvider>
    ),
  ],
} satisfies Meta<typeof CodeNode>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    id: 'code-1',
    type: 'code',
    data: {
      label: 'Code',
      description: 'Execute JavaScript',
      code: '// Return something from here\nreturn { result: "Hello" };',
      mode: 'runOnce',
      handles: [
        { id: 'flow-in', type: 'target', dataType: 'flow', label: 'In' },
        { id: 'flow-out', type: 'source', dataType: 'flow', label: 'Out' },
        { id: 'code', type: 'target', dataType: 'string', label: 'Code' },
        { id: 'result', type: 'source', dataType: 'any', label: 'Result' }
      ]
    },
    selected: false,
    isConnectable: true,
    zIndex: 1,
    dragging: false,
    positionAbsoluteX: 0,
    positionAbsoluteY: 0,
    width: 450,
    height: 550,
  },
};

export const DataTransformation: Story = {
  args: {
    id: 'code-2',
    type: 'code',
    data: {
      label: 'Transform Data',
      description: 'Convert user data to display format',
      code: '// Transform input data\nconst { firstName, lastName, email } = input;\n\nreturn {\n  displayName: `${firstName} ${lastName}`,\n  contact: email.toLowerCase(),\n  timestamp: new Date().toISOString()\n};',
      mode: 'runOnce',
      handles: [
        { id: 'flow-in', type: 'target', dataType: 'flow', label: 'In' },
        { id: 'flow-out', type: 'source', dataType: 'flow', label: 'Out' },
        { id: 'input', type: 'target', dataType: 'object', label: 'Input Data' },
        { id: 'result', type: 'source', dataType: 'object', label: 'Transformed' }
      ]
    },
    selected: true,
    isConnectable: true,
    zIndex: 1,
    dragging: false,
    positionAbsoluteX: 0,
    positionAbsoluteY: 0,
    width: 450,
    height: 550,
  },
};
