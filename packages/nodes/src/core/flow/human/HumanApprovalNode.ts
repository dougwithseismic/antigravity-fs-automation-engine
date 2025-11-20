import { randomUUID } from 'crypto';
import { AntigravityNode } from '../../../types';
import { NodeExecutionArgs, NodeExecutionResult } from '@repo/types';

/**
 * HumanApprovalNode - pauses execution until a human approves/denies.
 * Returns a suspended status with metadata so the orchestrator can track and resume.
 */
export class HumanApprovalNode implements AntigravityNode {
    name = 'human-approval';
    displayName = 'Human Approval';
    description = 'Pause workflow and wait for a human approval/denial signal.';
    version = 1;
    inputs = ['prompt', 'channel', 'timeoutSeconds'];
    outputs = ['approved', 'approvalTaskId', 'resumeToken'];
    category = 'Flow' as const;
    tags = ['human', 'approval', 'pause', 'manual'];
    environment: 'server' = 'server';

    handles = [
        // Control Flow
        {
            id: 'flow-in',
            type: 'target' as const,
            dataType: 'flow' as const,
            label: 'In'
        },
        {
            id: 'flow-out',
            type: 'source' as const,
            dataType: 'flow' as const,
            label: 'Out'
        },
        // Data Inputs
        {
            id: 'prompt',
            type: 'target' as const,
            dataType: 'string' as const,
            label: 'Prompt'
        },
        {
            id: 'channel',
            type: 'target' as const,
            dataType: 'string' as const,
            label: 'Channel'
        },
        {
            id: 'timeoutSeconds',
            type: 'target' as const,
            dataType: 'number' as const,
            label: 'Timeout (seconds)'
        },
        // Data Outputs
        {
            id: 'approved',
            type: 'source' as const,
            dataType: 'boolean' as const,
            label: 'Approved'
        },
        {
            id: 'approvalTaskId',
            type: 'source' as const,
            dataType: 'string' as const,
            label: 'Approval Task ID'
        },
        {
            id: 'resumeToken',
            type: 'source' as const,
            dataType: 'string' as const,
            label: 'Resume Token'
        }
    ];

    ui = {
        icon: 'hand',
        inputs: [
            {
                id: 'prompt',
                label: 'Prompt',
                type: 'textarea' as const,
                placeholder: 'Explain what needs approval...',
                required: true,
            },
            {
                id: 'channel',
                label: 'Channel',
                type: 'select' as const,
                defaultValue: 'slack',
                options: ['slack', 'email', 'webhook'],
            },
            {
                id: 'timeoutSeconds',
                label: 'Timeout (seconds)',
                type: 'text' as const,
                placeholder: '600',
            },
        ],
        outputs: [
            {
                id: 'approved',
                label: 'Approved',
                type: 'boolean',
            },
            {
                id: 'approvalTaskId',
                label: 'Approval Task ID',
                type: 'string',
            },
            {
                id: 'resumeToken',
                label: 'Resume Token',
                type: 'string',
            },
        ],
    };

    async execute({ input, node, context }: NodeExecutionArgs): Promise<NodeExecutionResult> {
        const prompt = input.prompt || node.data?.prompt || 'Approval required';
        const channel = input.channel || node.data?.channel || 'slack';
        const timeoutSeconds = Number(input.timeoutSeconds || node.data?.timeoutSeconds || 0) || undefined;

        const approvalTaskId = randomUUID();
        const resumeToken = randomUUID();

        // Engine/worker should persist this suspended state and expose an endpoint
        // for an approver to call back with the resume token.
        return {
            status: 'suspended',
            output: {
                approved: false,
                approvalTaskId,
                resumeToken,
                channel,
                prompt,
                timeoutSeconds,
                requestedAt: new Date().toISOString(),
                workflowId: context.workflowId,
                executionId: context.executionId,
                nodeId: node.id,
            },
        };
    }
}
