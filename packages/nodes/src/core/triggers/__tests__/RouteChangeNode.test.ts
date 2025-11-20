import { describe, it, expect } from 'vitest';
import { RouteChangeNode } from '../RouteChangeNode';

describe('RouteChangeNode', () => {
    it('should execute with navigation data and return correct output', async () => {
        const node = new RouteChangeNode();

        const input = {
            path: '/products/123',
            params: { id: '123' },
            query: { ref: 'homepage' },
            hash: '#reviews'
        };

        const result = await node.execute({
            nodeId: 'route-1',
            config: {},
            input,
            abortSignal: null as any
        });

        expect(result.status).toBe('success');
        expect(result.output).toEqual({
            path: '/products/123',
            params: { id: '123' },
            query: { ref: 'homepage' },
            hash: '#reviews'
        });
    });

    it('should handle empty navigation data gracefully', async () => {
        const node = new RouteChangeNode();

        const result = await node.execute({
            nodeId: 'route-1',
            config: {},
            input: {},
            abortSignal: null as any
        });

        expect(result.status).toBe('success');
        expect(result.output).toEqual({
            path: '',
            params: {},
            query: {},
            hash: ''
        });
    });

    it('should match exact paths', () => {
        const node = new RouteChangeNode();

        expect(node.matchesPattern('/products', '/products')).toBe(true);
        expect(node.matchesPattern('/products', '/about')).toBe(false);
    });

    it('should match wildcard patterns', () => {
        const node = new RouteChangeNode();

        expect(node.matchesPattern('/products/123', '/products/*')).toBe(true);
        expect(node.matchesPattern('/products/456/edit', '/products/*')).toBe(true);
        expect(node.matchesPattern('/about', '/products/*')).toBe(false);
    });

    it('should match root wildcard pattern', () => {
        const node = new RouteChangeNode();

        expect(node.matchesPattern('/any/path', '/*')).toBe(true);
        expect(node.matchesPattern('/products', '/*')).toBe(true);
    });

    it('should handle complex nested paths with wildcards', () => {
        const node = new RouteChangeNode();

        expect(node.matchesPattern('/api/v1/users/123', '/api/v1/users/*')).toBe(true);
        expect(node.matchesPattern('/api/v1/users/123/posts', '/api/v1/users/*')).toBe(true);
        expect(node.matchesPattern('/api/v2/users/123', '/api/v1/users/*')).toBe(false);
    });

    it('should handle paths with query strings and hashes correctly', () => {
        const node = new RouteChangeNode();

        // Pattern matching should only match path, not query or hash
        expect(node.matchesPattern('/products', '/products')).toBe(true);
        expect(node.matchesPattern('/products', '/products?id=123')).toBe(false); // Query in pattern not supported
    });

    it('should handle trailing slashes consistently', () => {
        const node = new RouteChangeNode();

        expect(node.matchesPattern('/products/', '/products/')).toBe(true);
        expect(node.matchesPattern('/products', '/products/')).toBe(false);
        expect(node.matchesPattern('/products/', '/products')).toBe(false);
    });

    it('should handle empty or root paths', () => {
        const node = new RouteChangeNode();

        expect(node.matchesPattern('/', '/')).toBe(true);
        expect(node.matchesPattern('', '')).toBe(true);
        expect(node.matchesPattern('/home', '/')).toBe(false);
    });

    it('should handle URL-encoded characters in paths', () => {
        const node = new RouteChangeNode();

        expect(node.matchesPattern('/search/hello%20world', '/search/*')).toBe(true);
    });

    it('should extract query parameters from URL string', async () => {
        const node = new RouteChangeNode();

        const input = {
            path: '/products/123',
            params: {},
            query: { category: 'electronics', sort: 'price' },
            hash: ''
        };

        const result = await node.execute({
            nodeId: 'route-1',
            config: {},
            input,
            abortSignal: null as any
        });

        expect(result.output.query).toEqual({ category: 'electronics', sort: 'price' });
    });

    it('should preserve hash fragments', async () => {
        const node = new RouteChangeNode();

        const input = {
            path: '/docs/api',
            params: {},
            query: {},
            hash: '#installation'
        };

        const result = await node.execute({
            nodeId: 'route-1',
            config: {},
            input,
            abortSignal: null as any
        });

        expect(result.output.hash).toBe('#installation');
    });
});
