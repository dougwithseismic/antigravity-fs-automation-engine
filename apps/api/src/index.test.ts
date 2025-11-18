import { describe, it, expect, beforeAll } from 'vitest';
import { app } from './app';
import { execSync } from 'child_process';

describe('Integration: API & Database', () => {
    beforeAll(() => {
        // Ensure DB is reset and seeded before running tests
        // We use the root pnpm command to ensure correct environment
        try {
            console.log('Running db:reset and db:seed...');
            execSync('cd ../.. && pnpm db:reset && pnpm db:seed', { stdio: 'inherit' });
        } catch (error) {
            console.error('Failed to seed database for tests', error);
            throw error;
        }
    });

    it('should retrieve the seeded PPC workflow', async () => {
        const res = await app.request('/workflows');
        expect(res.status).toBe(200);

        const workflows = await res.json() as any[];
        expect(Array.isArray(workflows)).toBe(true);

        const ppcWorkflow = workflows.find((w: any) => w.name === 'PPC Landing Page Flow');
        expect(ppcWorkflow).toBeDefined();
        expect(ppcWorkflow.nodes.length).toBeGreaterThan(0);
    });
});
