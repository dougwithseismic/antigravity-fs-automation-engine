import { describe, it, expect } from 'vitest';
import { FetchNode } from './FetchNode';
import { NodeExecutionArgs } from '@repo/types';

describe('FetchNode', () => {
    it('should be defined', () => {
        const node = new FetchNode();
        expect(node).toBeDefined();
        expect(node.name).toBe('fetch');
    });
});
