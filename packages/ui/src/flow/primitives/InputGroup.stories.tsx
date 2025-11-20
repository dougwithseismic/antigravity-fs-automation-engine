import type { Meta, StoryObj } from '@storybook/react';
import { ReactFlowProvider } from '@xyflow/react';
import { Key } from 'lucide-react';
import { InputGroup } from './InputGroup';
import { TextInput } from './TextInput';
import { TextareaInput } from './TextareaInput';
import { SelectInput } from './SelectInput';
import { DataHandle } from './DataHandle';
import '@xyflow/react/dist/style.css';

const meta = {
  title: 'Flow/Primitives/InputGroup',
  component: InputGroup,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <ReactFlowProvider>
        <div style={{ width: '400px', padding: '20px', background: '#0f1626' }}>
          <Story />
        </div>
      </ReactFlowProvider>
    ),
  ],
} satisfies Meta<typeof InputGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const TextInputExample: Story = {
  args: {
    label: 'Username',
    typeIndicator: 'string',
    required: true,
    children: <TextInput placeholder="Enter username..." />,
  },
};

export const SecretInput: Story = {
  args: {
    label: 'API Key',
    typeIndicator: 'string',
    required: true,
    secret: true,
    children: <TextInput placeholder="sk-..." />,
  },
};

export const TextareaExample: Story = {
  args: {
    label: 'Description',
    typeIndicator: 'text',
    helper: 'Provide a detailed description of the workflow',
    children: <TextareaInput rows={4} placeholder="Enter description..." />,
  },
};

export const SelectExample: Story = {
  args: {
    label: 'Model',
    typeIndicator: 'string',
    children: (
      <SelectInput defaultValue="gpt-4">
        <option value="gpt-4">GPT-4</option>
        <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
        <option value="claude-3-opus">Claude 3 Opus</option>
        <option value="claude-3-sonnet">Claude 3 Sonnet</option>
      </SelectInput>
    ),
  },
};

export const WithCustomTypeIndicator: Story = {
  args: {
    label: 'Credentials',
    typeIndicator: (
      <span className="text-[0.65rem] text-green-400 font-mono bg-green-500/10 px-1 py-0.5 rounded border border-green-500/30 flex items-center gap-1">
        <Key className="h-3 w-3" />
        secret
      </span>
    ),
    required: true,
    children: <TextInput type="password" placeholder="••••••••" />,
  },
};

export const WithDataHandle: Story = {
  args: {
    label: 'Dynamic Input (Legacy)',
    typeIndicator: 'string',
    helper: 'Old way - manual handle positioning',
    handle: (
      <DataHandle
        handle={{ id: 'input', type: 'target', dataType: 'string', label: 'Input' }}
        position="left"
        style={{ top: 14, left: -6 }}
      />
    ),
    children: <TextInput placeholder="Enter value or connect..." />,
  },
};

export const WithHandleData: Story = {
  args: {
    label: 'Dynamic Input',
    typeIndicator: 'string',
    helper: 'New way - automatic handle positioning at top',
    handleData: { id: 'input', type: 'target', dataType: 'string', label: 'Input' },
    children: <TextInput placeholder="Enter value or connect..." />,
  },
};

export const CredentialInputWithHandle: Story = {
  args: {
    label: 'API Credentials',
    typeIndicator: (
      <span className="text-[0.65rem] text-yellow-400 font-mono bg-yellow-500/10 px-1 py-0.5 rounded border border-yellow-500/30 flex items-center gap-1">
        <Key className="h-3 w-3" />
        credential
      </span>
    ),
    handleData: { id: 'creds', type: 'target', dataType: 'credential', label: 'Credentials' },
    required: true,
    secret: true,
    helper: 'Connect from credential node or enter manually',
    children: <TextInput placeholder="Enter credentials..." />,
  },
};

export const JsonInput: Story = {
  args: {
    label: 'Configuration',
    typeIndicator: 'json',
    helper: 'Valid JSON object required',
    required: true,
    children: (
      <TextareaInput
        rows={5}
        placeholder='{\n  "key": "value"\n}'
        defaultValue='{\n  "timeout": 5000,\n  "retry": true\n}'
        style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}
      />
    ),
  },
};

export const NumberInput: Story = {
  args: {
    label: 'Timeout',
    typeIndicator: 'number',
    helper: 'Timeout in milliseconds',
    children: <TextInput type="number" placeholder="5000" defaultValue="5000" />,
  },
};
