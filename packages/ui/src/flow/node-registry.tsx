import { ComponentType } from 'react';
import type { NodeProps } from '@xyflow/react';

// Import all node components
import { DefaultNode } from './DefaultNode';
import { VariableNode } from './nodes/VariableNode';
import { StartNode } from './nodes/StartNode';
import { FetchNode } from './nodes/FetchNode';
import { CodeNode } from './nodes/CodeNode';
import { ConditionNode } from './nodes/ConditionNode';
import { SwitchNode } from './nodes/SwitchNode';
import { MergeNode } from './nodes/MergeNode';
import { AgentNode } from './nodes/AgentNode';
import { WaitNode } from './nodes/WaitNode';
import { FilterNode } from './nodes/FilterNode';
import { ExtractQueryParamsNode } from './nodes/ExtractQueryParamsNode';
import { CredentialNode } from './nodes/CredentialNode';
import { LLMProviderNode } from './nodes/LLMProviderNode';
import { EmailNode } from './nodes/EmailNode';
import { AnalyticsNode } from './nodes/AnalyticsNode';
import { DiscountNode } from './nodes/DiscountNode';
import { BannerFormNode } from './nodes/BannerFormNode';
import { WindowAlertNode } from './nodes/WindowAlertNode';
import { GoogleSearchNode } from './nodes/GoogleSearchNode';
import { WebhookNode } from './nodes/WebhookNode';
import { RouteChangeNode } from './nodes/RouteChangeNode';
import { HumanApprovalNode } from './nodes/HumanApprovalNode';
import { PipedreamActionNode } from './nodes/PipedreamActionNode';
import { ShopifyNode } from './nodes/ShopifyNode';

/**
 * NodeTypeRegistry - Maps node types to their React components
 *
 * Usage:
 * ```tsx
 * const nodeTypes = getNodeTypes();
 * <ReactFlow nodeTypes={nodeTypes} ... />
 * ```
 */
export const NodeTypeRegistry: Record<string, ComponentType<NodeProps>> = {
    // Core Flow
    'start': StartNode,
    'switch': SwitchNode,
    'merge': MergeNode,
    'wait': WaitNode,
    'human-approval': HumanApprovalNode,

    // Logic
    'condition': ConditionNode,
    'filter': FilterNode,

    // Data
    'variable': VariableNode,
    'extract-query-params': ExtractQueryParamsNode,
    'code': CodeNode,

    // Network
    'fetch': FetchNode,
    'webhook': WebhookNode,

    // Auth & Credentials
    'credential': CredentialNode,
    'shopify-credential': CredentialNode, // Reuse CredentialNode

    // AI
    'agent': AgentNode,
    'llm-provider': LLMProviderNode,

    // Business
    'discount': DiscountNode,
    'email': EmailNode,
    'analytics': AnalyticsNode,

    // UI (Client-side)
    'banner-form': BannerFormNode,
    'window-alert': WindowAlertNode,
    'google-search': GoogleSearchNode,

    // Triggers
    'route-change': RouteChangeNode,

    // Integrations
    'pipedream-action': PipedreamActionNode,
    'shopify': ShopifyNode,

    // Fallback
    'default': DefaultNode,
};

/**
 * Get all node types for ReactFlow
 */
export function getNodeTypes() {
    return NodeTypeRegistry;
}

/**
 * Get a specific node component by type
 */
export function getNodeComponent(type: string): ComponentType<NodeProps> {
    return NodeTypeRegistry[type] || NodeTypeRegistry.default;
}
