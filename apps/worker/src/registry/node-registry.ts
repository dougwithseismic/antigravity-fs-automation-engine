import { AntigravityNode } from '@antigravity/nodes';
import { FetchNode } from '@antigravity/nodes';
import { CodeNode } from '@antigravity/nodes';
import { SwitchNode } from '@antigravity/nodes';
import { WaitNode } from '@antigravity/nodes';
import { ExtractQueryParamsNode } from '@antigravity/nodes';
import { FilterNode } from '@antigravity/nodes';
import { StartNode } from '@antigravity/nodes';
import { ConditionNode } from '@antigravity/nodes';
import { AnalyticsNode } from '@antigravity/nodes';
import { DiscountNode } from '@antigravity/nodes';
import { BannerFormNode } from '@antigravity/nodes';
import { WindowAlertNode } from '@antigravity/nodes';
import { EmailNode } from '@antigravity/nodes';
import { WebhookNode } from '@antigravity/nodes';

/**
 * Node Registry - Maps node types to their executors
 */
export class NodeRegistry {
    private nodes: Map<string, AntigravityNode> = new Map();

    constructor() {
        this.registerDefaultNodes();
    }

    private registerDefaultNodes() {
        // Register all built-in nodes (instantiate classes)
        this.register('fetch', new FetchNode());
        this.register('code', new CodeNode());
        this.register('switch', new SwitchNode());
        this.register('wait', new WaitNode());
        this.register('extract-query-params', new ExtractQueryParamsNode());
        this.register('filter', new FilterNode());
        this.register('start', new StartNode());
        this.register('condition', new ConditionNode());
        this.register('analytics', new AnalyticsNode());
        this.register('discount', new DiscountNode());
        this.register('banner-form', new BannerFormNode());
        this.register('window-alert', new WindowAlertNode());
        this.register('email', new EmailNode());
        this.register('webhook', new WebhookNode());
    }

    register(type: string, node: AntigravityNode) {
        this.nodes.set(type, node);
    }

    get(type: string): AntigravityNode | undefined {
        return this.nodes.get(type);
    }

    has(type: string): boolean {
        return this.nodes.has(type);
    }

    getAllTypes(): string[] {
        return Array.from(this.nodes.keys());
    }
}

// Singleton instance
export const nodeRegistry = new NodeRegistry();
