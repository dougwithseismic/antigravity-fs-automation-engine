import type { Meta, StoryObj } from '@storybook/react';
import { InputSelector } from './InputSelector';

const meta = {
  title: 'Flow/Primitives/InputSelector',
  component: InputSelector,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'blue', 'green', 'purple', 'amber', 'pink'],
    },
  },
  decorators: [
    (Story) => (
      <div style={{ width: '300px', padding: '20px' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof InputSelector>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    value: 'user.email',
    variant: 'blue',
  },
};

export const WithPlaceholder: Story = {
  args: {
    placeholder: 'Select an input...',
    variant: 'blue',
  },
};

export const WithPrefix: Story = {
  args: {
    prefix: 'from',
    value: 'fetchNode.response',
    variant: 'green',
  },
};

export const WithSuffix: Story = {
  args: {
    value: 'userData',
    suffix: 'as input',
    variant: 'purple',
  },
};

export const WithPrefixAndSuffix: Story = {
  args: {
    prefix: 'use',
    value: 'apiResponse.data',
    suffix: 'here',
    variant: 'blue',
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="space-y-3">
      <div>
        <div className="text-xs text-slate-400 mb-2 font-semibold">Default</div>
        <InputSelector value="output.value" variant="default" />
      </div>
      <div>
        <div className="text-xs text-slate-400 mb-2 font-semibold">Blue (Keys/Properties)</div>
        <InputSelector value="user.email" variant="blue" />
      </div>
      <div>
        <div className="text-xs text-slate-400 mb-2 font-semibold">Green (Values/Data)</div>
        <InputSelector value="response.data" variant="green" />
      </div>
      <div>
        <div className="text-xs text-slate-400 mb-2 font-semibold">Purple (Operators/Actions)</div>
        <InputSelector value="transform.result" variant="purple" />
      </div>
      <div>
        <div className="text-xs text-slate-400 mb-2 font-semibold">Amber (Warnings/Important)</div>
        <InputSelector value="auth.token" variant="amber" />
      </div>
      <div>
        <div className="text-xs text-slate-400 mb-2 font-semibold">Pink (Errors/Special)</div>
        <InputSelector value="error.message" variant="pink" />
      </div>
    </div>
  ),
};

export const InUseCase: Story = {
  render: () => (
    <div className="space-y-4 p-4 bg-[#0c1220] rounded-lg border border-[#1f2738]">
      <div>
        <div className="text-sm text-slate-300 mb-2 font-semibold">Email Template Configuration</div>
        <div className="space-y-2">
          <div>
            <div className="text-xs text-slate-500 mb-1">Recipient</div>
            <InputSelector
              value="customer.email"
              variant="blue"
            />
          </div>
          <div>
            <div className="text-xs text-slate-500 mb-1">Template Data</div>
            <InputSelector
              value="orderConfirmation.details"
              variant="green"
            />
          </div>
          <div>
            <div className="text-xs text-slate-500 mb-1">Subject Line</div>
            <InputSelector
              placeholder="Select template variable..."
              variant="purple"
            />
          </div>
        </div>
      </div>
    </div>
  ),
};

export const Clickable: Story = {
  args: {
    value: 'Click to change input',
    variant: 'blue',
    onClick: () => alert('Input selector clicked!'),
  },
};
