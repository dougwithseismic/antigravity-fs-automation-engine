import type { Meta, StoryObj } from '@storybook/react';
import { WorkflowGraph } from './WorkflowGraph';
import { createAutoLayoutedElements } from './utils/auto-layout';
import type { Node } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

const meta = {
  title: 'Flow/WorkflowGraph',
  component: WorkflowGraph,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  argTypes: {
    edgeType: {
      control: 'select',
      options: ['default', 'straight', 'step', 'smoothstep'],
      description: 'Type of edge connector to use',
    },
    snapToGrid: {
      control: 'boolean',
      description: 'Enable grid snapping for node positioning',
    },
    snapGrid: {
      control: 'object',
      description: 'Grid size for snapping [x, y]',
    },
  },
  decorators: [
    (Story) => (
      <div style={{ width: '100vw', height: '100vh' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof WorkflowGraph>;

export default meta;
type Story = StoryObj<typeof meta>;

// Helper to create default flow handles for a node
const createFlowHandles = (nodeId: string) => [
  { id: `${nodeId}-flow-in`, type: 'target', dataType: 'flow', label: 'In' },
  { id: `${nodeId}-flow-out`, type: 'source', dataType: 'flow', label: 'Out' },
];

// Simple linear workflow with data flow
const linearElements = createAutoLayoutedElements(
  [
    {
      id: '1',
      type: 'start',
      data: {
        label: 'Start',
        description: 'Workflow entry point',
        duration: 'Instant',
        handles: [
          { id: '1-flow-out', type: 'source', dataType: 'flow', label: 'Out' },
          { id: '1-context', type: 'source', dataType: 'json', label: 'Context' },
        ],
      },
    },
    {
      id: '2',
      type: 'fetch',
      data: {
        label: 'Fetch Data',
        description: 'Get user data from API',
        duration: '200ms',
        handles: [
          { id: '2-flow-in', type: 'target', dataType: 'flow', label: 'In' },
          { id: '2-flow-out', type: 'source', dataType: 'flow', label: 'Out' },
          { id: '2-url', type: 'target', dataType: 'string', label: 'URL' },
          { id: '2-response', type: 'source', dataType: 'json', label: 'Response' },
        ],
      },
    },
    {
      id: '3',
      type: 'code',
      data: {
        label: 'Process Data',
        description: 'Transform API response',
        duration: '50ms',
        handles: [
          { id: '3-flow-in', type: 'target', dataType: 'flow', label: 'In' },
          { id: '3-flow-out', type: 'source', dataType: 'flow', label: 'Out' },
          { id: '3-input', type: 'target', dataType: 'json', label: 'Input' },
          { id: '3-result', type: 'source', dataType: 'json', label: 'Result' },
        ],
      },
    },
    {
      id: '4',
      type: 'analytics',
      data: {
        label: 'Track Event',
        description: 'Send analytics event',
        duration: '100ms',
        handles: [
          { id: '4-flow-in', type: 'target', dataType: 'flow', label: 'In' },
          { id: '4-flow-out', type: 'source', dataType: 'flow', label: 'Out' },
          { id: '4-event-data', type: 'target', dataType: 'json', label: 'Event Data' },
          { id: '4-tracked', type: 'source', dataType: 'boolean', label: 'Tracked' },
        ],
      },
    },
  ] as Omit<Node, 'position'>[],
  [
    // Flow control
    { id: 'e1-2', source: '1', target: '2', sourceHandle: '1-flow-out', targetHandle: '2-flow-in' },
    { id: 'e2-3', source: '2', target: '3', sourceHandle: '2-flow-out', targetHandle: '3-flow-in' },
    { id: 'e3-4', source: '3', target: '4', sourceHandle: '3-flow-out', targetHandle: '4-flow-in' },

    // Data flow
    { id: 'e2-3-data', source: '2', target: '3', sourceHandle: '2-response', targetHandle: '3-input' },
    { id: 'e3-4-data', source: '3', target: '4', sourceHandle: '3-result', targetHandle: '4-event-data' },
  ],
  {
    direction: 'LR',
    rankSep: 100,
    nodeSep: 60,
  }
);

export const LinearWorkflow: Story = {
  args: {
    nodes: linearElements.nodes,
    edges: linearElements.edges,
  },
};

// Conditional branching workflow with user context
const conditionalElements = createAutoLayoutedElements(
  [
    {
      id: '1',
      type: 'start',
      data: {
        label: 'Start',
        description: 'User visits page',
        duration: 'Instant',
        handles: [
          { id: '1-flow-out', type: 'source', dataType: 'flow', label: 'Out' },
          { id: '1-user', type: 'source', dataType: 'json', label: 'User Context' },
          { id: '1-session', type: 'source', dataType: 'string', label: 'Session ID' },
        ],
      },
    },
    {
      id: '2',
      type: 'condition',
      data: {
        label: 'Check User',
        description: 'Is user authenticated?',
        duration: '10ms',
        handles: [
          { id: '2-flow-in', type: 'target', dataType: 'flow', label: 'In' },
          { id: '2-flow-out', type: 'source', dataType: 'flow', label: 'Out' },
          { id: '2-user', type: 'target', dataType: 'json', label: 'User' },
          { id: '2-result', type: 'source', dataType: 'boolean', label: 'Is Authenticated' },
        ],
      },
    },
    {
      id: '3',
      type: 'banner-form',
      data: {
        label: 'Show Login',
        description: 'Display login form',
        duration: 'Client',
        handles: [
          { id: '3-flow-in', type: 'target', dataType: 'flow', label: 'In' },
          { id: '3-flow-out', type: 'source', dataType: 'flow', label: 'Out' },
          { id: '3-session', type: 'target', dataType: 'string', label: 'Session' },
        ],
      },
    },
    {
      id: '4',
      type: 'fetch',
      data: {
        label: 'Load Dashboard',
        description: 'Fetch user dashboard data',
        duration: '300ms',
        handles: [
          { id: '4-flow-in', type: 'target', dataType: 'flow', label: 'In' },
          { id: '4-flow-out', type: 'source', dataType: 'flow', label: 'Out' },
          { id: '4-user', type: 'target', dataType: 'json', label: 'User' },
          { id: '4-dashboard', type: 'source', dataType: 'json', label: 'Dashboard Data' },
        ],
      },
    },
    {
      id: '5',
      type: 'analytics',
      data: {
        label: 'Track Visit',
        description: 'Log user activity',
        duration: '50ms',
        handles: [
          { id: '5-flow-in', type: 'target', dataType: 'flow', label: 'In' },
          { id: '5-flow-out', type: 'source', dataType: 'flow', label: 'Out' },
          { id: '5-user', type: 'target', dataType: 'json', label: 'User Data' },
          { id: '5-authenticated', type: 'target', dataType: 'boolean', label: 'Authenticated' },
        ],
      },
    },
  ] as Omit<Node, 'position'>[],
  [
    // Flow control
    { id: 'e1-2', source: '1', target: '2', sourceHandle: '1-flow-out', targetHandle: '2-flow-in' },
    { id: 'e2-3', source: '2', target: '3', sourceHandle: '2-flow-out', targetHandle: '3-flow-in', label: 'Not Authenticated' },
    { id: 'e2-4', source: '2', target: '4', sourceHandle: '2-flow-out', targetHandle: '4-flow-in', label: 'Authenticated' },
    { id: 'e3-5', source: '3', target: '5', sourceHandle: '3-flow-out', targetHandle: '5-flow-in' },
    { id: 'e4-5', source: '4', target: '5', sourceHandle: '4-flow-out', targetHandle: '5-flow-in' },

    // Data flow
    { id: 'e1-2-user', source: '1', target: '2', sourceHandle: '1-user', targetHandle: '2-user' },
    { id: 'e1-3-sess', source: '1', target: '3', sourceHandle: '1-session', targetHandle: '3-session' },
    { id: 'e1-4-user', source: '1', target: '4', sourceHandle: '1-user', targetHandle: '4-user' },
    { id: 'e1-5-user', source: '1', target: '5', sourceHandle: '1-user', targetHandle: '5-user' },
    { id: 'e2-5-auth', source: '2', target: '5', sourceHandle: '2-result', targetHandle: '5-authenticated' },
  ],
  {
    direction: 'LR',
    rankSep: 120,
    nodeSep: 100,
  }
);

export const ConditionalWorkflow: Story = {
  args: {
    nodes: conditionalElements.nodes,
    edges: conditionalElements.edges,
    edgeType: "smoothstep"
  },
};

// AI Agent workflow with data flow
const aiAgentElements = createAutoLayoutedElements(
  [
    {
      id: '1',
      type: 'webhook',
      data: {
        label: 'Webhook Trigger',
        description: 'Incoming customer message',
        duration: 'Trigger',
        handles: [
          { id: '1-flow-out', type: 'source', dataType: 'flow', label: 'Out' },
          { id: '1-payload', type: 'source', dataType: 'json', label: 'Payload' },
          { id: '1-message', type: 'source', dataType: 'string', label: 'Message' },
        ],
      },
    },
    {
      id: '2',
      type: 'variable',
      data: {
        label: 'System Prompt',
        description: 'Instructions for AI',
        duration: 'Instant',
        handles: [
          { id: '2-value', type: 'source', dataType: 'string', label: 'Value' },
        ],
      },
    },
    {
      id: '3',
      type: 'agent',
      data: {
        label: 'AI Assistant',
        description: 'Claude analyzes customer request',
        duration: '2.5s',
        handles: [
          { id: '3-flow-in', type: 'target', dataType: 'flow', label: 'In' },
          { id: '3-flow-out', type: 'source', dataType: 'flow', label: 'Out' },
          { id: '3-instructions', type: 'target', dataType: 'string', label: 'Instructions' },
          { id: '3-chat-input', type: 'target', dataType: 'string', label: 'Chat Input' },
          { id: '3-response', type: 'source', dataType: 'string', label: 'Response' },
          { id: '3-confidence', type: 'source', dataType: 'number', label: 'Confidence' },
        ],
      },
    },
    {
      id: '4',
      type: 'condition',
      data: {
        label: 'Needs Human?',
        description: 'Check if escalation needed',
        duration: '10ms',
        handles: [
          { id: '4-flow-in', type: 'target', dataType: 'flow', label: 'In' },
          { id: '4-flow-out', type: 'source', dataType: 'flow', label: 'Out' },
          { id: '4-value', type: 'target', dataType: 'number', label: 'Value' },
          { id: '4-result', type: 'source', dataType: 'boolean', label: 'Result' },
        ],
      },
    },
    {
      id: '5',
      type: 'human-approval',
      data: {
        label: 'Human Review',
        description: 'Agent reviews response',
        duration: 'Manual',
        handles: [
          { id: '5-flow-in', type: 'target', dataType: 'flow', label: 'In' },
          { id: '5-flow-out', type: 'source', dataType: 'flow', label: 'Out' },
          { id: '5-input', type: 'target', dataType: 'string', label: 'Message' },
          { id: '5-approved', type: 'source', dataType: 'string', label: 'Approved Message' },
        ],
      },
    },
    {
      id: '6',
      type: 'email',
      data: {
        label: 'Send Response',
        description: 'Email customer response',
        duration: '150ms',
        handles: [
          { id: '6-flow-in', type: 'target', dataType: 'flow', label: 'In' },
          { id: '6-flow-out', type: 'source', dataType: 'flow', label: 'Out' },
          { id: '6-message', type: 'target', dataType: 'string', label: 'Message' },
          { id: '6-sent', type: 'source', dataType: 'boolean', label: 'Email Sent' },
        ],
      },
    },
  ] as Omit<Node, 'position'>[],
  [
    // Flow control
    { id: 'e1-3', source: '1', target: '3', sourceHandle: '1-flow-out', targetHandle: '3-flow-in' },
    { id: 'e3-4', source: '3', target: '4', sourceHandle: '3-flow-out', targetHandle: '4-flow-in' },
    { id: 'e4-5', source: '4', target: '5', sourceHandle: '4-flow-out', targetHandle: '5-flow-in', label: 'Low Confidence' },
    { id: 'e4-6', source: '4', target: '6', sourceHandle: '4-flow-out', targetHandle: '6-flow-in', label: 'High Confidence' },
    { id: 'e5-6', source: '5', target: '6', sourceHandle: '5-flow-out', targetHandle: '6-flow-in' },

    // Data flow
    { id: 'e2-3', source: '2', target: '3', sourceHandle: '2-value', targetHandle: '3-instructions' },
    { id: 'e1-3-msg', source: '1', target: '3', sourceHandle: '1-message', targetHandle: '3-chat-input' },
    { id: 'e3-4-conf', source: '3', target: '4', sourceHandle: '3-confidence', targetHandle: '4-value' },
    { id: 'e3-5-resp', source: '3', target: '5', sourceHandle: '3-response', targetHandle: '5-input' },
    { id: 'e3-6-resp', source: '3', target: '6', sourceHandle: '3-response', targetHandle: '6-message' },
    { id: 'e5-6-resp', source: '5', target: '6', sourceHandle: '5-approved', targetHandle: '6-message' },
  ],
  {
    direction: 'LR',
    rankSep: 120,
    nodeSep: 100,
  }
);

export const AIAgentWorkflow: Story = {
  args: {
    nodes: aiAgentElements.nodes,
    edges: aiAgentElements.edges,
    edgeType: "smoothstep",
    snapToGrid: false
  },
};

// E-commerce workflow with realistic data flow
const ecommerceElements = createAutoLayoutedElements(
  [
    {
      id: '1',
      type: 'route-change',
      data: {
        label: 'Product Page',
        description: 'User views product',
        duration: 'Trigger',
        handles: [
          { id: '1-flow-out', type: 'source', dataType: 'flow', label: 'Out' },
          { id: '1-url', type: 'source', dataType: 'string', label: 'URL' },
        ],
      },
    },
    {
      id: '2',
      type: 'extract-query-params',
      data: {
        label: 'Get Product ID',
        description: 'Extract from URL',
        duration: 'Instant',
        handles: [
          { id: '2-flow-in', type: 'target', dataType: 'flow', label: 'In' },
          { id: '2-flow-out', type: 'source', dataType: 'flow', label: 'Out' },
          { id: '2-url', type: 'target', dataType: 'string', label: 'URL' },
          { id: '2-productId', type: 'source', dataType: 'string', label: 'Product ID' },
        ],
      },
    },
    {
      id: '3',
      type: 'shopify',
      data: {
        label: 'Get Product',
        description: 'Fetch from Shopify',
        duration: '300ms',
        handles: [
          { id: '3-flow-in', type: 'target', dataType: 'flow', label: 'In' },
          { id: '3-flow-out', type: 'source', dataType: 'flow', label: 'Out' },
          { id: '3-productId', type: 'target', dataType: 'string', label: 'Product ID' },
          { id: '3-product', type: 'source', dataType: 'json', label: 'Product' },
          { id: '3-inventory', type: 'source', dataType: 'number', label: 'Stock Count' },
        ],
      },
    },
    {
      id: '4',
      type: 'condition',
      data: {
        label: 'In Stock?',
        description: 'Check availability',
        duration: '5ms',
        handles: [
          { id: '4-flow-in', type: 'target', dataType: 'flow', label: 'In' },
          { id: '4-flow-out', type: 'source', dataType: 'flow', label: 'Out' },
          { id: '4-value', type: 'target', dataType: 'number', label: 'Stock Count' },
          { id: '4-result', type: 'source', dataType: 'boolean', label: 'In Stock' },
        ],
      },
    },
    {
      id: '5',
      type: 'discount',
      data: {
        label: 'Apply Discount',
        description: 'Calculate promotion',
        duration: '20ms',
        handles: [
          { id: '5-flow-in', type: 'target', dataType: 'flow', label: 'In' },
          { id: '5-flow-out', type: 'source', dataType: 'flow', label: 'Out' },
          { id: '5-product', type: 'target', dataType: 'json', label: 'Product' },
          { id: '5-discountedPrice', type: 'source', dataType: 'number', label: 'Final Price' },
        ],
      },
    },
    {
      id: '6',
      type: 'banner-form',
      data: {
        label: 'Notify Me',
        description: 'Show waitlist form',
        duration: 'Client',
        handles: [
          { id: '6-flow-in', type: 'target', dataType: 'flow', label: 'In' },
          { id: '6-product', type: 'target', dataType: 'json', label: 'Product' },
        ],
      },
    },
    {
      id: '7',
      type: 'analytics',
      data: {
        label: 'Track Event',
        description: 'Log product view',
        duration: '50ms',
        handles: [
          { id: '7-flow-in', type: 'target', dataType: 'flow', label: 'In' },
          { id: '7-flow-out', type: 'source', dataType: 'flow', label: 'Out' },
          { id: '7-product', type: 'target', dataType: 'json', label: 'Product Data' },
          { id: '7-price', type: 'target', dataType: 'number', label: 'Price' },
        ],
      },
    },
  ] as Omit<Node, 'position'>[],
  [
    // Flow control
    { id: 'e1-2', source: '1', target: '2', sourceHandle: '1-flow-out', targetHandle: '2-flow-in' },
    { id: 'e2-3', source: '2', target: '3', sourceHandle: '2-flow-out', targetHandle: '3-flow-in' },
    { id: 'e3-4', source: '3', target: '4', sourceHandle: '3-flow-out', targetHandle: '4-flow-in' },
    { id: 'e4-5', source: '4', target: '5', sourceHandle: '4-flow-out', targetHandle: '5-flow-in', label: 'Available' },
    { id: 'e4-6', source: '4', target: '6', sourceHandle: '4-flow-out', targetHandle: '6-flow-in', label: 'Out of Stock' },
    { id: 'e5-7', source: '5', target: '7', sourceHandle: '5-flow-out', targetHandle: '7-flow-in' },

    // Data flow
    { id: 'e1-2-url', source: '1', target: '2', sourceHandle: '1-url', targetHandle: '2-url' },
    { id: 'e2-3-id', source: '2', target: '3', sourceHandle: '2-productId', targetHandle: '3-productId' },
    { id: 'e3-4-stock', source: '3', target: '4', sourceHandle: '3-inventory', targetHandle: '4-value' },
    { id: 'e3-5-prod', source: '3', target: '5', sourceHandle: '3-product', targetHandle: '5-product' },
    { id: 'e3-6-prod', source: '3', target: '6', sourceHandle: '3-product', targetHandle: '6-product' },
    { id: 'e3-7-prod', source: '3', target: '7', sourceHandle: '3-product', targetHandle: '7-product' },
    { id: 'e5-7-price', source: '5', target: '7', sourceHandle: '5-discountedPrice', targetHandle: '7-price' },
  ],
  {
    direction: 'LR',
    rankSep: 120,
    nodeSep: 100,
  }
);

export const EcommerceWorkflow: Story = {
  args: {
    nodes: ecommerceElements.nodes,
    edges: ecommerceElements.edges,
  },
};

// Parallel processing workflow with data aggregation
const parallelElements = createAutoLayoutedElements(
  [
    {
      id: '1',
      type: 'start',
      data: {
        label: 'Start',
        description: 'Process order',
        duration: 'Instant',
        handles: [
          { id: '1-flow-out', type: 'source', dataType: 'flow', label: 'Out' },
          { id: '1-order', type: 'source', dataType: 'json', label: 'Order Data' },
        ],
      },
    },
    {
      id: '2',
      type: 'switch',
      data: {
        label: 'Distribute',
        description: 'Split into parallel tasks',
        duration: '5ms',
        handles: [
          { id: '2-flow-in', type: 'target', dataType: 'flow', label: 'In' },
          { id: '2-flow-out', type: 'source', dataType: 'flow', label: 'Out' },
          { id: '2-order', type: 'target', dataType: 'json', label: 'Order' },
          { id: '2-order-out', type: 'source', dataType: 'json', label: 'Order Data' },
        ],
      },
    },
    {
      id: '3',
      type: 'email',
      data: {
        label: 'Email Customer',
        description: 'Send confirmation',
        duration: '150ms',
        handles: [
          { id: '3-flow-in', type: 'target', dataType: 'flow', label: 'In' },
          { id: '3-flow-out', type: 'source', dataType: 'flow', label: 'Out' },
          { id: '3-order', type: 'target', dataType: 'json', label: 'Order' },
          { id: '3-sent', type: 'source', dataType: 'boolean', label: 'Email Sent' },
        ],
      },
    },
    {
      id: '4',
      type: 'shopify',
      data: {
        label: 'Update Inventory',
        description: 'Decrement stock',
        duration: '200ms',
        handles: [
          { id: '4-flow-in', type: 'target', dataType: 'flow', label: 'In' },
          { id: '4-flow-out', type: 'source', dataType: 'flow', label: 'Out' },
          { id: '4-order', type: 'target', dataType: 'json', label: 'Order' },
          { id: '4-updated', type: 'source', dataType: 'boolean', label: 'Inventory Updated' },
        ],
      },
    },
    {
      id: '5',
      type: 'analytics',
      data: {
        label: 'Track Sale',
        description: 'Record revenue',
        duration: '100ms',
        handles: [
          { id: '5-flow-in', type: 'target', dataType: 'flow', label: 'In' },
          { id: '5-flow-out', type: 'source', dataType: 'flow', label: 'Out' },
          { id: '5-order', type: 'target', dataType: 'json', label: 'Order' },
          { id: '5-tracked', type: 'source', dataType: 'boolean', label: 'Tracked' },
        ],
      },
    },
    {
      id: '6',
      type: 'wait',
      data: {
        label: 'Wait for All',
        description: 'Sync parallel branches',
        duration: 'Variable',
        handles: [
          { id: '6-flow-in', type: 'target', dataType: 'flow', label: 'In' },
          { id: '6-flow-out', type: 'source', dataType: 'flow', label: 'Out' },
          { id: '6-results', type: 'source', dataType: 'json', label: 'All Results' },
        ],
      },
    },
  ] as Omit<Node, 'position'>[],
  [
    // Flow control
    { id: 'e1-2', source: '1', target: '2', sourceHandle: '1-flow-out', targetHandle: '2-flow-in' },
    { id: 'e2-3', source: '2', target: '3', sourceHandle: '2-flow-out', targetHandle: '3-flow-in' },
    { id: 'e2-4', source: '2', target: '4', sourceHandle: '2-flow-out', targetHandle: '4-flow-in' },
    { id: 'e2-5', source: '2', target: '5', sourceHandle: '2-flow-out', targetHandle: '5-flow-in' },
    { id: 'e3-6', source: '3', target: '6', sourceHandle: '3-flow-out', targetHandle: '6-flow-in' },
    { id: 'e4-6', source: '4', target: '6', sourceHandle: '4-flow-out', targetHandle: '6-flow-in' },
    { id: 'e5-6', source: '5', target: '6', sourceHandle: '5-flow-out', targetHandle: '6-flow-in' },

    // Data flow
    { id: 'e1-2-data', source: '1', target: '2', sourceHandle: '1-order', targetHandle: '2-order' },
    { id: 'e2-3-data', source: '2', target: '3', sourceHandle: '2-order-out', targetHandle: '3-order' },
    { id: 'e2-4-data', source: '2', target: '4', sourceHandle: '2-order-out', targetHandle: '4-order' },
    { id: 'e2-5-data', source: '2', target: '5', sourceHandle: '2-order-out', targetHandle: '5-order' },
  ],
  {
    direction: 'LR',
    rankSep: 120,
    nodeSep: 100,
  }
);

export const ParallelWorkflow: Story = {
  args: {
    nodes: parallelElements.nodes,
    edges: parallelElements.edges,
  },
};

// Horizontal layout example
const horizontalElements = createAutoLayoutedElements(
  [
    {
      id: '1',
      type: 'start',
      data: {
        label: 'Start',
        description: 'Begin workflow',
        duration: 'Instant',
        handles: createFlowHandles('1'),
      },
    },
    {
      id: '2',
      type: 'fetch',
      data: {
        label: 'API Call',
        description: 'Fetch data',
        duration: '200ms',
        handles: createFlowHandles('2'),
      },
    },
    {
      id: '3',
      type: 'agent',
      data: {
        label: 'AI Process',
        description: 'Claude analyzes',
        duration: '1.5s',
        handles: createFlowHandles('3'),
      },
    },
    {
      id: '4',
      type: 'email',
      data: {
        label: 'Send Result',
        description: 'Email output',
        duration: '150ms',
        handles: createFlowHandles('4'),
      },
    },
  ] as Omit<Node, 'position'>[],
  [
    { id: 'e1-2', source: '1', target: '2', sourceHandle: '1-flow-out', targetHandle: '2-flow-in' },
    { id: 'e2-3', source: '2', target: '3', sourceHandle: '2-flow-out', targetHandle: '3-flow-in' },
    { id: 'e3-4', source: '3', target: '4', sourceHandle: '3-flow-out', targetHandle: '4-flow-in' },
  ],
  {
    direction: 'LR',
    rankSep: 100,
    nodeSep: 60,
  }
);

export const HorizontalLayout: Story = {
  args: {
    nodes: horizontalElements.nodes,
    edges: horizontalElements.edges,
  },
};

// Complex workflow with many nodes
const complexElements = createAutoLayoutedElements(
  [
    {
      id: '1',
      type: 'start',
      data: {
        label: 'User Sign Up',
        description: 'New user registration',
        duration: 'Trigger',
        handles: createFlowHandles('1'),
      },
    },
    {
      id: '2',
      type: 'credential',
      data: {
        label: 'Verify Email',
        description: 'Send verification link',
        duration: '100ms',
        handles: createFlowHandles('2'),
      },
    },
    {
      id: '3',
      type: 'condition',
      data: {
        label: 'Email Verified?',
        description: 'Check verification status',
        duration: '10ms',
        handles: createFlowHandles('3'),
      },
    },
    {
      id: '4',
      type: 'fetch',
      data: {
        label: 'Create Account',
        description: 'Save to database',
        duration: '250ms',
        handles: createFlowHandles('4'),
      },
    },
    {
      id: '5',
      type: 'wait',
      data: {
        label: 'Wait 24h',
        description: 'Delayed follow-up',
        duration: '24h',
        handles: createFlowHandles('5'),
      },
    },
    {
      id: '6',
      type: 'email',
      data: {
        label: 'Welcome Email',
        description: 'Send onboarding',
        duration: '150ms',
        handles: createFlowHandles('6'),
      },
    },
    {
      id: '7',
      type: 'analytics',
      data: {
        label: 'Track Signup',
        description: 'Log conversion',
        duration: '50ms',
        handles: createFlowHandles('7'),
      },
    },
    {
      id: '8',
      type: 'discount',
      data: {
        label: 'First Purchase',
        description: 'Generate discount code',
        duration: '30ms',
        handles: createFlowHandles('8'),
      },
    },
    {
      id: '9',
      type: 'email',
      data: {
        label: 'Discount Code',
        description: 'Send promotional email',
        duration: '150ms',
        handles: createFlowHandles('9'),
      },
    },
    {
      id: '10',
      type: 'window-alert',
      data: {
        label: 'Retry Signup',
        description: 'Show error message',
        duration: 'Client',
        handles: createFlowHandles('10'),
      },
    },
  ] as Omit<Node, 'position'>[],
  [
    { id: 'e1-2', source: '1', target: '2', sourceHandle: '1-flow-out', targetHandle: '2-flow-in' },
    { id: 'e2-3', source: '2', target: '3', sourceHandle: '2-flow-out', targetHandle: '3-flow-in' },
    { id: 'e3-4', source: '3', target: '4', sourceHandle: '3-flow-out', targetHandle: '4-flow-in', label: 'Verified' },
    { id: 'e3-10', source: '3', target: '10', sourceHandle: '3-flow-out', targetHandle: '10-flow-in', label: 'Not Verified' },
    { id: 'e4-5', source: '4', target: '5', sourceHandle: '4-flow-out', targetHandle: '5-flow-in' },
    { id: 'e4-7', source: '4', target: '7', sourceHandle: '4-flow-out', targetHandle: '7-flow-in' },
    { id: 'e5-6', source: '5', target: '6', sourceHandle: '5-flow-out', targetHandle: '6-flow-in' },
    { id: 'e6-8', source: '6', target: '8', sourceHandle: '6-flow-out', targetHandle: '8-flow-in' },
    { id: 'e8-9', source: '8', target: '9', sourceHandle: '8-flow-out', targetHandle: '9-flow-in' },
  ],
  {
    direction: 'LR',
    rankSep: 100,
    nodeSep: 100,
  }
);

export const ComplexWorkflow: Story = {
  args: {
    nodes: complexElements.nodes,
    edges: complexElements.edges,
  },
};

// Straight edges example
export const StraightEdges: Story = {
  args: {
    nodes: linearElements.nodes,
    edges: linearElements.edges,
    edgeType: 'straight',
  },
};

// Step edges example
export const StepEdges: Story = {
  args: {
    nodes: linearElements.nodes,
    edges: linearElements.edges,
    edgeType: 'step',
  },
};

// Smooth step edges example
export const SmoothStepEdges: Story = {
  args: {
    nodes: linearElements.nodes,
    edges: linearElements.edges,
    edgeType: 'smoothstep',
  },
};

// With snapping enabled
export const WithSnapping: Story = {
  args: {
    nodes: conditionalElements.nodes,
    edges: conditionalElements.edges,
    edgeType: 'straight',
    snapToGrid: true,
    snapGrid: [20, 20],
  },
};

// Dashed edges example
const dashedEdgesExample = (() => {
  const nodes = linearElements.nodes;
  const edges = linearElements.edges.map((edge, idx) => {
    const styles = ['solid', 'dashed', 'dotted', 'long-dash', 'dash-dot'];
    return {
      ...edge,
      style: styles[idx % styles.length] as any,
    };
  });
  return { nodes, edges };
})();

export const DashedEdgeStyles: Story = {
  args: {
    nodes: dashedEdgesExample.nodes,
    edges: dashedEdgesExample.edges,
    edgeType: 'straight',
  },
};

// Execution flow animation example (simulating workflow execution)
const executionFlowExample = (() => {
  const nodes = [
    {
      id: '1',
      type: 'start',
      data: {
        label: 'Start',
        description: 'Completed',
        duration: 'Instant',
        handles: [
          { id: '1-flow-out', type: 'source', dataType: 'flow', label: 'Out' },
        ],
      },
    },
    {
      id: '2',
      type: 'fetch',
      data: {
        label: 'Fetch Data',
        description: 'Completed',
        duration: '200ms',
        handles: [
          { id: '2-flow-in', type: 'target', dataType: 'flow', label: 'In' },
          { id: '2-flow-out', type: 'source', dataType: 'flow', label: 'Out' },
        ],
      },
    },
    {
      id: '3',
      type: 'code',
      data: {
        label: 'Process',
        description: 'Running...',
        duration: '50ms',
        handles: [
          { id: '3-flow-in', type: 'target', dataType: 'flow', label: 'In' },
          { id: '3-flow-out', type: 'source', dataType: 'flow', label: 'Out' },
        ],
      },
    },
    {
      id: '4',
      type: 'analytics',
      data: {
        label: 'Track Event',
        description: 'Pending',
        duration: '100ms',
        handles: [
          { id: '4-flow-in', type: 'target', dataType: 'flow', label: 'In' },
          { id: '4-flow-out', type: 'source', dataType: 'flow', label: 'Out' },
        ],
      },
    },
    {
      id: '5',
      type: 'email',
      data: {
        label: 'Send Email',
        description: 'Pending',
        duration: '150ms',
        handles: [
          { id: '5-flow-in', type: 'target', dataType: 'flow', label: 'In' },
        ],
      },
    },
  ] as Omit<Node, 'position'>[];

  const edges = [
    // Completed edge - solid green
    {
      id: 'e1-2',
      source: '1',
      target: '2',
      sourceHandle: '1-flow-out',
      targetHandle: '2-flow-in',
      style: 'solid',
    },
    // Currently executing - animated solid
    {
      id: 'e2-3',
      source: '2',
      target: '3',
      sourceHandle: '2-flow-out',
      targetHandle: '3-flow-in',
      animated: true,
      style: 'solid',
    },
    // Pending - dashed
    {
      id: 'e3-4',
      source: '3',
      target: '4',
      sourceHandle: '3-flow-out',
      targetHandle: '4-flow-in',
      style: 'dashed',
    },
    {
      id: 'e4-5',
      source: '4',
      target: '5',
      sourceHandle: '4-flow-out',
      targetHandle: '5-flow-in',
      style: 'dashed',
    },
  ];

  const layouted = createAutoLayoutedElements(nodes, edges, {
    direction: 'LR',
    rankSep: 100,
    nodeSep: 60,
  });

  return layouted;
})();

export const ExecutionFlow: Story = {
  args: {
    nodes: executionFlowExample.nodes,
    edges: executionFlowExample.edges,
    edgeType: 'smoothstep',
  },
};
