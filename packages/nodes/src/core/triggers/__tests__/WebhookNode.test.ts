import { describe, it, expect } from 'vitest';
import { WebhookNode } from '../WebhookNode';

describe('WebhookNode', () => {
    it('should execute with webhook data and return correct output', async () => {
        const node = new WebhookNode();

        const input = {
            body: { message: 'Hello from webhook' },
            query: { source: 'external' },
            headers: { 'content-type': 'application/json' },
            method: 'POST',
            path: '/webhooks/test'
        };

        const result = await node.execute({
            nodeId: 'webhook-1',
            config: {},
            input,
            abortSignal: null as any
        });

        expect(result.status).toBe('success');
        expect(result.output).toEqual({
            body: { message: 'Hello from webhook' },
            query: { source: 'external' },
            headers: { 'content-type': 'application/json' },
            method: 'POST',
            path: '/webhooks/test'
        });
    });

    it('should handle empty input gracefully', async () => {
        const node = new WebhookNode();

        const result = await node.execute({
            nodeId: 'webhook-1',
            config: {},
            input: {},
            abortSignal: null as any
        });

        expect(result.status).toBe('success');
        expect(result.output).toEqual({
            body: {},
            query: {},
            headers: {},
            method: 'UNKNOWN',
            path: ''
        });
    });

    it('should handle GET requests with query params', async () => {
        const node = new WebhookNode();

        const input = {
            body: {},
            query: { id: '123', action: 'verify' },
            headers: { 'user-agent': 'test-client' },
            method: 'GET',
            path: '/webhooks/verify'
        };

        const result = await node.execute({
            nodeId: 'webhook-1',
            config: {},
            input,
            abortSignal: null as any
        });

        expect(result.status).toBe('success');
        expect(result.output.method).toBe('GET');
        expect(result.output.query).toEqual({ id: '123', action: 'verify' });
    });

    it('should handle nested JSON body', async () => {
        const node = new WebhookNode();

        const input = {
            body: {
                user: {
                    id: 123,
                    name: 'John Doe',
                    metadata: {
                        source: 'stripe',
                        event: 'payment.succeeded'
                    }
                }
            },
            query: {},
            headers: {},
            method: 'POST',
            path: '/webhooks/stripe'
        };

        const result = await node.execute({
            nodeId: 'webhook-1',
            config: {},
            input,
            abortSignal: null as any
        });

        expect(result.status).toBe('success');
        expect(result.output.body.user.metadata.event).toBe('payment.succeeded');
    });

    it('should handle array body data', async () => {
        const node = new WebhookNode();

        const input = {
            body: [
                { id: 1, name: 'Item 1' },
                { id: 2, name: 'Item 2' }
            ],
            query: {},
            headers: { 'content-type': 'application/json' },
            method: 'POST',
            path: '/webhooks/batch'
        };

        const result = await node.execute({
            nodeId: 'webhook-1',
            config: {},
            input,
            abortSignal: null as any
        });

        expect(result.status).toBe('success');
        expect(Array.isArray(result.output.body)).toBe(true);
        expect(result.output.body).toHaveLength(2);
    });

    it('should handle special characters in headers', async () => {
        const node = new WebhookNode();

        const input = {
            body: {},
            query: {},
            headers: {
                'x-custom-header': 'value with spaces',
                'authorization': 'Bearer token123'
            },
            method: 'POST',
            path: '/webhooks/test'
        };

        const result = await node.execute({
            nodeId: 'webhook-1',
            config: {},
            input,
            abortSignal: null as any
        });

        expect(result.status).toBe('success');
        expect(result.output.headers['authorization']).toBe('Bearer token123');
    });

    it('should preserve exact input structure without modification', async () => {
        const node = new WebhookNode();

        const input = {
            body: { test: 'value' },
            query: { param: 'test' },
            headers: { header: 'value' },
            method: 'PUT',
            path: '/test'
        };

        const result = await node.execute({
            nodeId: 'webhook-1',
            config: {},
            input,
            abortSignal: null as any
        });

        // Verify exact match
        expect(result.output).toEqual(input);
    });
});
