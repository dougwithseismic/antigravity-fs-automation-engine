import { AntigravityNode } from './types';

// Core Flow
import { StartNode } from './core/flow/start';
import { WaitNode } from './core/flow/wait/WaitNode';
import { MergeNode } from './core/flow/merge';
import { SwitchNode } from './core/flow/switch/SwitchNode';
import { HumanApprovalNode } from './core/flow/human';

// Logic
import { ConditionNode } from './core/logic/condition';
import { FilterNode } from './core/logic/filter';

// Data
import { CodeNode } from './core/code/code/CodeNode';
import { ExtractQueryParamsNode } from './core/data/extract-query-params';

// Network
import { FetchNode } from './core/fetch/FetchNode';
import { WebhookNode, RouteChangeNode } from './core/triggers';

// Auth & Credentials
import { CredentialNode } from './core/auth/CredentialNode';
import { ShopifyCredentialNode } from './core/auth/ShopifyCredentialNode';

// AI
import { AgentNode } from './core/agent/AgentNode';
import { LLMProviderNode } from './core/ai/LLMProviderNode';

// Business
import { DiscountNode } from './core/business/discount';
import { EmailNode } from './core/business/email';
import { AnalyticsNode } from './core/analytics';

// UI (Client-side)
import { BannerFormNode } from './core/ui/banner-form';
import { WindowAlertNode } from './core/ui/window-alert';
import { GoogleSearchNode } from './core/ui/google-search';

// Integrations
import { PipedreamActionNode } from './core/integration/pipedream';
import { ShopifyNode } from './core/integration/shopify/ShopifyNode';

export class NodeRegistry {
    private static instance: NodeRegistry;
    private nodes: Map<string, AntigravityNode> = new Map();

    private constructor() {
        // Core Flow
        this.register(new StartNode());
        this.register(new WaitNode());
        this.register(new MergeNode());
        this.register(new SwitchNode());
        this.register(new HumanApprovalNode());

        // Logic
        this.register(new ConditionNode());
        this.register(new FilterNode());

        // Data
        this.register(new CodeNode());
        this.register(new ExtractQueryParamsNode());

        // Network
        this.register(new FetchNode());
        this.register(new WebhookNode());
        this.register(new RouteChangeNode());

        // Auth & Credentials
        this.register(new CredentialNode());
        this.register(new ShopifyCredentialNode());

        // AI
        this.register(new AgentNode());
        this.register(new LLMProviderNode());

        // Business
        this.register(new DiscountNode());
        this.register(new EmailNode());
        this.register(new AnalyticsNode());

        // UI (Client-side)
        this.register(new BannerFormNode());
        this.register(new WindowAlertNode());
        this.register(new GoogleSearchNode());

        // Integrations
        this.register(new PipedreamActionNode());
        this.register(new ShopifyNode());
    }

    public static getInstance(): NodeRegistry {
        if (!NodeRegistry.instance) {
            NodeRegistry.instance = new NodeRegistry();
        }
        return NodeRegistry.instance;
    }

    public register(node: AntigravityNode) {
        this.nodes.set(node.name, node);
    }

    public getNode(name: string): AntigravityNode | undefined {
        return this.nodes.get(name);
    }

    public getAllNodes(): AntigravityNode[] {
        return Array.from(this.nodes.values());
    }
}
