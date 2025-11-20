import type { Meta, StoryObj } from '@storybook/react';
import { ReactFlowProvider } from '@xyflow/react';
import { Play, Code, Zap, Database } from 'lucide-react';
import { NodeCard } from './NodeCard';
import { NodeHeader } from './NodeHeader';
import { NodeBody } from './NodeBody';
import { NodeFooter } from './NodeFooter';
import { InputGroup } from './InputGroup';
import { TextInput } from './TextInput';
import { TextareaInput } from './TextareaInput';
import { SelectInput } from './SelectInput';
import { OutputGroup } from './OutputGroup';
import { OutputItem } from './OutputItem';
import { DataHandle } from './DataHandle';
import '@xyflow/react/dist/style.css';

const meta = {
  title: 'Flow/Primitives/NodeCard',
  component: NodeCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <ReactFlowProvider>
        <div style={{ width: '450px', height: '600px' }}>
          <Story />
        </div>
      </ReactFlowProvider>
    ),
  ],
} satisfies Meta<typeof NodeCard>;

export default meta;
type Story = StoryObj<typeof meta>;

const sampleHandles = [
  { id: 'flow-in', type: 'target' as const, dataType: 'flow' as const, label: 'In' },
  { id: 'flow-out', type: 'source' as const, dataType: 'flow' as const, label: 'Out' },
  { id: 'result', type: 'source' as const, dataType: 'string' as const, label: 'Result' },
];

export const Default: Story = {
  args: {
    state: { selected: false },
    top: (
      <NodeHeader
        icon={<Play className="h-4 w-4" />}
        title="Example Node"
        description="This is a basic node"
        badge="action"
      />
    ),
    middle: (
      <NodeBody>
        <InputGroup label="Input Field" typeIndicator="string">
          <TextInput placeholder="Enter value" />
        </InputGroup>
      </NodeBody>
    ),
    bottom: <NodeFooter type="action" duration="2s" />,
    handles: sampleHandles,
  },
};

export const Selected: Story = {
  args: {
    state: { selected: true },
    top: (
      <NodeHeader
        icon={<Zap className="h-4 w-4" />}
        title="Selected Node"
        description="This node is currently selected"
        badge="logic"
      />
    ),
    middle: (
      <NodeBody>
        <InputGroup label="Condition" typeIndicator="boolean">
          <SelectInput>
            <option value="true">True</option>
            <option value="false">False</option>
          </SelectInput>
        </InputGroup>
      </NodeBody>
    ),
    bottom: <NodeFooter type="logic" duration="Instant" />,
    handles: sampleHandles,
  },
};

export const Executing: Story = {
  args: {
    state: { executing: true },
    top: (
      <NodeHeader
        icon={<Code className="h-4 w-4" />}
        title="Executing Node"
        description="Currently running"
        badge="code"
      />
    ),
    middle: (
      <NodeBody>
        <InputGroup label="Script" typeIndicator="js" helper="JavaScript code to execute">
          <TextareaInput
            rows={4}
            placeholder="return { result: 'Hello' };"
            defaultValue="const x = 5;\nreturn x * 2;"
          />
        </InputGroup>
      </NodeBody>
    ),
    bottom: <NodeFooter type="code" duration="Variable" />,
    handles: sampleHandles,
  },
};

export const WithOutputs: Story = {
  args: {
    state: { selected: false },
    top: (
      <NodeHeader
        icon={<Database className="h-4 w-4" />}
        title="Data Node"
        description="Node with multiple outputs"
        badge="data"
      />
    ),
    middle: (
      <NodeBody>
        <InputGroup label="Query" typeIndicator="sql" required>
          <TextareaInput
            rows={3}
            placeholder="SELECT * FROM users"
            defaultValue="SELECT id, name FROM users LIMIT 10"
          />
        </InputGroup>
      </NodeBody>
    ),
    bottom: (
      <>
        <NodeFooter type="data" duration="~100ms" />
        <OutputGroup>
          <OutputItem
            label="Results"
            handle={
              <DataHandle
                handle={{ id: 'results', type: 'source', dataType: 'array', label: 'Results' }}
                position="right"
                style={{ right: -6 }}
              />
            }
          />
          <OutputItem
            label="Row Count"
            handle={
              <DataHandle
                handle={{ id: 'count', type: 'source', dataType: 'number', label: 'Count' }}
                position="right"
                style={{ right: -6 }}
              />
            }
          />
        </OutputGroup>
      </>
    ),
    handles: [
      ...sampleHandles,
      { id: 'results', type: 'source' as const, dataType: 'array' as const, label: 'Results' },
      { id: 'count', type: 'source' as const, dataType: 'number' as const, label: 'Count' },
    ],
  },
};

export const ErrorState: Story = {
  args: {
    state: { error: true },
    top: (
      <NodeHeader
        icon={<Code className="h-4 w-4" />}
        title="Failed Node"
        description="Execution failed"
        badge="error"
      />
    ),
    middle: (
      <NodeBody>
        <div className="rounded-lg bg-red-500/10 border border-red-500/30 p-3">
          <div className="text-red-400 text-sm font-semibold mb-1">Execution Error</div>
          <div className="text-red-300/70 text-xs font-mono">
            TypeError: Cannot read property 'id' of undefined
          </div>
        </div>
      </NodeBody>
    ),
    bottom: <NodeFooter type="code" duration="Failed" />,
    handles: sampleHandles,
  },
};

export const ClientSideVariant: Story = {
  args: {
    state: { selected: false },
    variant: 'client',
    top: (
      <NodeHeader
        icon={<Zap className="h-4 w-4" />}
        title="Client Action"
        description="Runs in the browser"
        badge="client"
      />
    ),
    middle: (
      <NodeBody>
        <div className="mb-3 rounded bg-yellow-500/10 px-2 py-1 text-center text-xs font-semibold text-yellow-400">
          CLIENT-SIDE
        </div>
        <InputGroup label="Message" typeIndicator="string">
          <TextInput placeholder="Alert message" defaultValue="Hello!" />
        </InputGroup>
      </NodeBody>
    ),
    bottom: <NodeFooter type="ui" duration="Instant" />,
    handles: sampleHandles,
  },
};
