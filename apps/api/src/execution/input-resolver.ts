import { WorkflowNode, WorkflowEdge, ExecutionContext } from './types';
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

// Create a registry of node definitions (not executors)
const nodeDefinitions: Record<string, AntigravityNode> = {
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
};

function getNodeDefinition(nodeType: string): AntigravityNode | undefined {
    return nodeDefinitions[nodeType];
}

/**
 * Resolves node inputs by merging (in priority order):
 * 1. Connected inputs (from previous node outputs via edges)
 * 2. Configured values (from node.data)
 * 3. Default values (from node definition)
 * 4. Queue input (data passed from previous node in execution queue)
 */
export function resolveNodeInputs(
    node: WorkflowNode,
    edges: WorkflowEdge[],
    context: ExecutionContext,
    queueInput?: any // Data passed from previous node
): Record<string, any> {
    const resolvedInputs: Record<string, any> = {};

    // First, merge queue input as the base (lowest priority)
    if (queueInput) {
        Object.assign(resolvedInputs, queueInput);
    }

    // Get node definition to access UI inputs
    const definition = getNodeDefinition(node.type);
    if (!definition?.ui?.inputs) {
        // No UI definition, just use node.data merged with queue input
        return { ...queueInput, ...(node.data || {}) };
    }

    // Process each defined input
    for (const inputDef of definition.ui.inputs) {
        const inputId = inputDef.id;

        // Check if this input has a connection
        if (inputDef.connection?.enabled) {
            // Find incoming edge for this specific input
            const incomingEdge = edges.find(
                edge => edge.target === node.id && edge.targetHandle === inputId
            );

            if (incomingEdge) {
                // Get source node's result
                const sourceResult = context.results[incomingEdge.source];

                if (sourceResult && sourceResult.status === 'success') {
                    // If edge has sourceHandle, use that specific output key
                    if (incomingEdge.sourceHandle) {
                        resolvedInputs[inputId] = sourceResult.output[incomingEdge.sourceHandle];
                    } else {
                        // Otherwise, use the entire output
                        resolvedInputs[inputId] = sourceResult.output;
                    }
                    continue; // Skip to next input, we got our value from connection
                }
            }
        }

        // No connection or connection failed, use configured or default value
        if (node.data && inputId in node.data) {
            resolvedInputs[inputId] = node.data[inputId];
        } else if ('defaultValue' in inputDef) {
            resolvedInputs[inputId] = inputDef.defaultValue;
        }
    }

    // Also merge any data that's not in the UI definition (backwards compatibility)
    const extraData = node.data || {};
    for (const key in extraData) {
        if (!(key in resolvedInputs)) {
            resolvedInputs[key] = extraData[key];
        }
    }

    return resolvedInputs;
}
