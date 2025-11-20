export interface ClientNode<TInput = any, TOutput = any> {
    id?: string;
    type: string;
    data?: Record<string, any>;
    execute(args: { input: TInput }): Promise<TOutput>;
}

export class ClientEngine {
    private nodes: Map<string, ClientNode> = new Map();
    private apiUrl: string;
    private apiKey?: string;

    constructor(apiUrl: string, apiKey?: string) {
        this.apiUrl = apiUrl;
        this.apiKey = apiKey;
    }

    registerNode(node: ClientNode) {
        this.nodes.set(node.type, node);
    }

    async execute<TInput = any, TOutput = any>({ workflowId, input = {} as any, onProgress }: { workflowId: string; input?: TInput; onProgress?: (stage: string, data?: any) => void }): Promise<TOutput> {
        console.log('Starting client execution', workflowId, input);
        onProgress?.('start', { workflowId });

        // 1. Start Execution
        onProgress?.('server-processing', { step: 'init' });
        let result = await this.callApi('POST', `/${workflowId}/execute`, input);

        // 2. Loop while waiting
        while (result.status === 'waiting' && result.nextStep) {
            const { nodeId, type, input: nodeInput } = result.nextStep;
            console.log(`[Client] Received handoff for node ${nodeId} (${type})`);
            onProgress?.('client-handoff', { nodeId, type });

            const node = this.nodes.get(type); // Match by type (or id if we enforce id matching)
            // Note: In our verify script we used type='window-alert'.
            // The engine returns nextStep with type.

            if (!node) {
                throw new Error(`No client node registered for type: ${type}`);
            }

            // 3. Execute Local Node
            onProgress?.('client-processing', { nodeId, type });
            const output = await node.execute({ input: nodeInput });

            // 4. Resume Execution
            console.log(`[Client] Resuming execution ${result.executionId}`);
            onProgress?.('server-resume', { nodeId });
            result = await this.callApi('POST', `/executions/${result.executionId}/resume`, {
                nodeId,
                data: output
            });
        }

        console.log('Client execution finished', result.status);
        onProgress?.('complete', { result });
        return result;
    }

    /**
     * Enable automatic route change detection for workflows with RouteChangeNodes
     * This will monitor browser navigation and trigger matching workflows
     */
    enableRouteChangeDetection() {
        // Track current path
        let currentPath = window.location.pathname;

        // Listen for popstate (back/forward button)
        window.addEventListener('popstate', () => {
            this.handleRouteChange(window.location.pathname);
        });

        // Intercept pushState and replaceState
        const originalPushState = history.pushState;
        const originalReplaceState = history.replaceState;

        history.pushState = (...args) => {
            originalPushState.apply(history, args);
            this.handleRouteChange(window.location.pathname);
        };

        history.replaceState = (...args) => {
            originalReplaceState.apply(history, args);
            this.handleRouteChange(window.location.pathname);
        };

        console.log('[ClientSDK] Route change detection enabled');
    }

    private handleRouteChange(newPath: string) {
        const url = new URL(window.location.href);

        const navigationData = {
            path: newPath,
            query: Object.fromEntries(url.searchParams),
            hash: url.hash,
            params: {} // Would need a router to extract params
        };

        console.log('[ClientSDK] Route changed to:', newPath, navigationData);

        // TODO: Check if any active workflows have RouteChangeNodes that match this path
        // For now, this provides the infrastructure for manual triggering
    }

    private async callApi(method: string, path: string, body: any) {
        const headers: Record<string, string> = {
            'Content-Type': 'application/json'
        };
        if (this.apiKey) {
            headers['x-api-key'] = this.apiKey;
        }

        const response = await fetch(`${this.apiUrl}/workflows${path}`, {
            method,
            headers,
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            const text = await response.text();
            throw new Error(`API Call Failed: ${response.status} ${text}`);
        }

        return response.json();
    }
}
