import { describe, it, expect } from 'vitest';
import { validateWorkflow } from './validator';
import { WorkflowNode } from '../execution/types';

describe('Workflow Validator', () => {
    it('should pass for valid condition node', () => {
        const nodes: WorkflowNode[] = [{
            id: '1',
            type: 'condition',
            position: { x: 0, y: 0 },
            data: {
                condition: { key: 'foo', value: 'bar' }
            }
        }];
        const errors = validateWorkflow(nodes);
        expect(errors).toHaveLength(0);
    });

    it('should fail for condition node missing key', () => {
        const nodes: WorkflowNode[] = [{
            id: '1',
            type: 'condition',
            position: { x: 0, y: 0 },
            data: {
                condition: { value: 'bar' }
            }
        }];
        const errors = validateWorkflow(nodes);
        expect(errors).toHaveLength(1);
        expect(errors[0]!.message).toContain('received undefined');
    });

    it('should fail for analytics node missing eventName', () => {
        const nodes: WorkflowNode[] = [{
            id: '1',
            type: 'analytics',
            position: { x: 0, y: 0 },
            data: {}
        }];
        const errors = validateWorkflow(nodes);
        expect(errors).toHaveLength(1);
        expect(errors[0]!.message).toContain('received undefined');
    });

    it('should ignore unknown node types', () => {
        const nodes: WorkflowNode[] = [{
            id: '1',
            type: 'unknown-node',
            position: { x: 0, y: 0 },
            data: {}
        }];
        const errors = validateWorkflow(nodes);
        expect(errors).toHaveLength(0);
    });
});
