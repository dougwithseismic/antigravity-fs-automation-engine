import {
    FetchNode,
    CredentialNode,
    AgentNode,
    ConditionNode,
    AnalyticsNode,
    DiscountNode,
    EmailNode,
    BannerFormNode,
    WindowAlertNode,
    StartNode,
    type AntigravityNode
} from '@antigravity/nodes';

export const nodeRegistry: Record<string, AntigravityNode> = {
    'fetch': new FetchNode(),
    'credential': new CredentialNode(),
    'agent': new AgentNode(),
    'condition': new ConditionNode(),
    'analytics': new AnalyticsNode(),
    'discount': new DiscountNode(),
    'email': new EmailNode(),
    'banner-form': new BannerFormNode(),
    'window-alert': new WindowAlertNode(),
    'start': new StartNode(),
    // Add other nodes here
};

export function getNodeDefinition(type: string): AntigravityNode | undefined {
    return nodeRegistry[type];
}

export function getAllNodeDefinitions(): AntigravityNode[] {
    return Object.values(nodeRegistry);
}
