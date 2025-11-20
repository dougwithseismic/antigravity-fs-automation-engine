import {
    AnalyticsNode,
    BannerFormNode,
    ConditionNode,
    CredentialNode,
    DiscountNode,
    EmailNode,
    FetchNode,
    GoogleSearchNode,
    StartNode,
    SwitchNode,
    WaitNode,
    WindowAlertNode,
    ExtractQueryParamsNode,
    FilterNode,
    HumanApprovalNode,
    AgentNode,
    ShopifyNode,
    LLMProviderNode,
    ShopifyCredentialNode
} from '@antigravity/nodes';
import type { AntigravityNode } from '@antigravity/nodes';

const nodeDefinitions: Record<string, AntigravityNode> = {
    analytics: new AnalyticsNode(),
    'banner-form': new BannerFormNode(),
    condition: new ConditionNode(),
    credential: new CredentialNode(),
    discount: new DiscountNode(),
    email: new EmailNode(),
    fetch: new FetchNode(),
    'google-search': new GoogleSearchNode(),
    start: new StartNode(),
    switch: new SwitchNode(),
    wait: new WaitNode(),
    'window-alert': new WindowAlertNode(),
    'extract-query-params': new ExtractQueryParamsNode(),
    filter: new FilterNode(),
    'human-approval': new HumanApprovalNode(),
    agent: new AgentNode(),
    shopify: new ShopifyNode(),
    'llm-provider': new LLMProviderNode(),
    'shopify-credential': new ShopifyCredentialNode()
};

type SeedNode = {
    id: string;
    type: string;
    position: { x: number; y: number };
    data?: Record<string, any>;
    environment?: 'server' | 'client';
};

export type SeedEdge = {
    id: string;
    source: string;
    target: string;
    sourceHandle?: string;
    targetHandle?: string;
    condition?: string;
};

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value));

export function withNodeMetadata(node: SeedNode): SeedNode {
    const definition = nodeDefinitions[node.type];
    if (!definition) return node;

    return {
        ...node,
        environment: node.environment ?? definition.environment,
        data: {
            ...(node.data || {}),
            label: node.data?.label ?? definition.displayName,
            description: node.data?.description ?? definition.description,
            ui: definition.ui ? clone(definition.ui) : undefined,
            defaults: definition.defaults ?? undefined
        }
    };
}

export function buildWorkflow(config: {
    name: string;
    description: string;
    nodes: SeedNode[];
    edges: SeedEdge[];
}) {
    return {
        name: config.name,
        description: config.description,
        nodes: config.nodes.map(withNodeMetadata),
        edges: config.edges
    };
}
