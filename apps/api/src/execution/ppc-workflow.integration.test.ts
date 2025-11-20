import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
    StartNode,
    ConditionNode,
    AnalyticsNode,
    DiscountNode,
    BannerFormNode,
    WindowAlertNode,
    EmailNode
} from '@antigravity/nodes';

describe('PPC Workflow Integration Tests', () => {
    describe('Simple Node Execution (Chill)', () => {
        it('should execute StartNode and pass through input', async () => {
            const startNode = new StartNode();

            const result = await startNode.execute({
                node: {
                    id: '1',
                    type: 'start',
                    position: { x: 0, y: 0 },
                    data: {}
                },
                input: { query: { utm_source: 'ppc' } },
                context: { workflowId: 1, executionId: 1, input: {}, results: {} }
            });

            expect(result.status).toBe('success');
            expect(result.output).toEqual({ query: { utm_source: 'ppc' } });
        });

        it('should execute DiscountNode and generate code', async () => {
            const discountNode = new DiscountNode();

            const result = await discountNode.execute({
                node: {
                    id: '1',
                    type: 'discount',
                    position: { x: 0, y: 0 },
                    data: { prefix: 'SUMMER', percentage: 20 }
                },
                input: {},
                context: { workflowId: 1, executionId: 1, input: {}, results: {} }
            });

            expect(result.status).toBe('success');
            expect(result.output.code).toMatch(/^SUMMER20-[A-Z0-9]{6}$/);
            expect(result.output.percentage).toBe(20);
            expect(result.output.expiresAt).toBeDefined();
        });

        it('should execute AnalyticsNode and log event', async () => {
            const analyticsNode = new AnalyticsNode();

            const consoleSpy = vi.spyOn(console, 'log');

            const result = await analyticsNode.execute({
                node: {
                    id: '1',
                    type: 'analytics',
                    position: { x: 0, y: 0 },
                    data: { eventName: 'lead_captured' }
                },
                input: { email: 'test@example.com' },
                context: { workflowId: 1, executionId: 1, input: {}, results: {} }
            });

            expect(result.status).toBe('success');
            expect(result.output._analyticsEvent).toBeDefined();
            expect(result.output._analyticsEvent.name).toBe('lead_captured');
            expect(consoleSpy).toHaveBeenCalledWith(
                expect.stringContaining('[Analytics] Event: lead_captured'),
                expect.any(Object)
            );

            consoleSpy.mockRestore();
        });
    });

    describe('Two-Node Sequences (Medium)', () => {
        it('should route PPC traffic through condition node', async () => {
            // Step 1: Start node
            const startNode = new StartNode();
            const startResult = await startNode.execute({
                node: { id: '1', type: 'start', position: { x: 0, y: 0 }, data: {} },
                input: { query: { utm_source: 'ppc', campaign: 'summer' } },
                context: { workflowId: 1, executionId: 1, input: {}, results: {} }
            });

            // Step 2: Condition node
            const conditionNode = new ConditionNode();
            const conditionResult = await conditionNode.execute({
                node: {
                    id: '2',
                    type: 'condition',
                    position: { x: 0, y: 0 },
                    data: {
                        condition: {
                            key: 'query.utm_source',
                            value: 'ppc'
                        }
                    }
                },
                input: startResult.output,
                context: { workflowId: 1, executionId: 1, input: {}, results: {} }
            });

            expect(conditionResult.output._conditionResult).toBe(true);
            expect(conditionResult.output.query).toEqual({ utm_source: 'ppc', campaign: 'summer' });
        });

        it('should route organic traffic correctly', async () => {
            const startNode = new StartNode();
            const startResult = await startNode.execute({
                node: { id: '1', type: 'start', position: { x: 0, y: 0 }, data: {} },
                input: { query: { utm_source: 'organic' } },
                context: { workflowId: 1, executionId: 1, input: {}, results: {} }
            });

            const conditionNode = new ConditionNode();
            const conditionResult = await conditionNode.execute({
                node: {
                    id: '2',
                    type: 'condition',
                    position: { x: 0, y: 0 },
                    data: {
                        condition: {
                            key: 'query.utm_source',
                            value: 'ppc'
                        }
                    }
                },
                input: startResult.output,
                context: { workflowId: 1, executionId: 1, input: {}, results: {} }
            });

            expect(conditionResult.output._conditionResult).toBe(false);
        });

        it('should chain discount generation and analytics', async () => {
            // Generate discount
            const discountNode = new DiscountNode();
            const discountResult = await discountNode.execute({
                node: {
                    id: '1',
                    type: 'discount',
                    position: { x: 0, y: 0 },
                    data: { prefix: 'WELCOME', percentage: 10 }
                },
                input: { email: 'test@example.com' },
                context: { workflowId: 1, executionId: 1, input: {}, results: {} }
            });

            // Log event with discount code
            const analyticsNode = new AnalyticsNode();
            const analyticsResult = await analyticsNode.execute({
                node: {
                    id: '2',
                    type: 'analytics',
                    position: { x: 0, y: 0 },
                    data: { eventName: 'discount_generated' }
                },
                input: discountResult.output,
                context: { workflowId: 1, executionId: 1, input: {}, results: {} }
            });

            expect(analyticsResult.output.code).toBeDefined();
            expect(analyticsResult.output._analyticsEvent.name).toBe('discount_generated');
        });
    });

    describe('Full PPC Flow (Spicy 🌶️)', () => {
        it('should execute complete PPC path with all nodes', async () => {
            const context = {
                workflowId: 1,
                executionId: 1,
                input: {},
                results: {}
            };

            // Node 1: Start
            const startNode = new StartNode();
            const step1 = await startNode.execute({
                node: { id: '1', type: 'start', position: { x: 0, y: 0 }, data: {} },
                input: { query: { utm_source: 'ppc', campaign: 'summer' } },
                context
            });

            // Node 2: Condition (Is PPC?)
            const conditionNode = new ConditionNode();
            const step2 = await conditionNode.execute({
                node: {
                    id: '2',
                    type: 'condition',
                    position: { x: 0, y: 0 },
                    data: {
                        condition: {
                            key: 'query.utm_source',
                            value: 'ppc'
                        }
                    }
                },
                input: step1.output,
                context
            });

            // Verify PPC path is taken
            expect(step2.output._conditionResult).toBe(true);

            // Node 3: Banner Form (Client-side suspension point)
            const bannerNode = new BannerFormNode();
            const step3 = await bannerNode.execute({
                node: {
                    id: '3',
                    type: 'banner-form',
                    position: { x: 0, y: 0 },
                    data: { message: 'Get 10% off!' }
                },
                input: step2.output,
                context
            });

            expect(step3.status).toBe('suspended');
            expect(step3.output._clientAction).toBe('banner-form');

            // Simulate user entering email (resume point)
            const resumeInput = {
                ...step3.output,
                email: 'user@example.com',
                name: 'John Doe',
                formData: { email: 'user@example.com', name: 'John Doe' }
            };

            // Node 4: Analytics (Log Lead)
            const analyticsNode = new AnalyticsNode();
            const step4 = await analyticsNode.execute({
                node: {
                    id: '4',
                    type: 'analytics',
                    position: { x: 0, y: 0 },
                    data: { eventName: 'lead_captured' }
                },
                input: resumeInput,
                context
            });

            expect(step4.output.email).toBe('user@example.com');

            // Node 5: Generate Discount
            const discountNode = new DiscountNode();
            const step5 = await discountNode.execute({
                node: {
                    id: '5',
                    type: 'discount',
                    position: { x: 0, y: 0 },
                    data: { prefix: 'WELCOME', percentage: 10 }
                },
                input: step4.output,
                context
            });

            expect(step5.output.code).toMatch(/^WELCOME10-/);

            // Node 6: Show Code (Client-side)
            const alertNode = new WindowAlertNode();
            const step6 = await alertNode.execute({
                node: {
                    id: '6',
                    type: 'window-alert',
                    position: { x: 0, y: 0 },
                    data: { message: `Your code is: ${step5.output.code}` }
                },
                input: step5.output,
                context
            });

            expect(step6.status).toBe('success');
            expect(step6.output._clientMessage).toContain('Your code is: WELCOME10-');

            // Node 7: Send Email
            const emailNode = new EmailNode();
            const step7 = await emailNode.execute({
                node: {
                    id: '7',
                    type: 'email',
                    position: { x: 0, y: 0 },
                    data: {
                        provider: 'klaviyo',
                        templateId: 'welcome_offer'
                    }
                },
                input: {
                    ...step5.output,
                    to: resumeInput.email // From banner form
                },
                context
            });

            expect(step7.output.emailSent).toBe(true);
        });

        it('should execute organic path (condition=false)', async () => {
            const context = {
                workflowId: 1,
                executionId: 1,
                input: {},
                results: {}
            };

            // Node 1: Start
            const startNode = new StartNode();
            const step1 = await startNode.execute({
                node: { id: '1', type: 'start', position: { x: 0, y: 0 }, data: {} },
                input: { query: { utm_source: 'organic' } },
                context
            });

            // Node 2: Condition
            const conditionNode = new ConditionNode();
            const step2 = await conditionNode.execute({
                node: {
                    id: '2',
                    type: 'condition',
                    position: { x: 0, y: 0 },
                    data: {
                        condition: {
                            key: 'query.utm_source',
                            value: 'ppc'
                        }
                    }
                },
                input: step1.output,
                context
            });

            // Verify organic path is taken
            expect(step2.output._conditionResult).toBe(false);

            // Node 8: Log Organic Visit (alternative path)
            const analyticsNode = new AnalyticsNode();
            const step8 = await analyticsNode.execute({
                node: {
                    id: '8',
                    type: 'analytics',
                    position: { x: 0, y: 0 },
                    data: { eventName: 'organic_visit' }
                },
                input: step2.output,
                context
            });

            expect(step8.output._analyticsEvent.name).toBe('organic_visit');
        });
    });

    describe('Edge Case Scenarios', () => {
        it('should handle missing email in EmailNode gracefully', async () => {
            const emailNode = new EmailNode();

            const result = await emailNode.execute({
                node: {
                    id: '1',
                    type: 'email',
                    position: { x: 0, y: 0 },
                    data: { provider: 'klaviyo', templateId: 'welcome' }
                },
                input: { code: 'WELCOME10' }, // No email field
                context: { workflowId: 1, executionId: 1, input: {}, results: {} }
            });

            expect(result.status).toBe('success');
            expect(result.output.emailSent).toBe(false);
            expect(result.output.reason).toBe('no_email');
        });

        it('should process template variables in WindowAlertNode', async () => {
            const alertNode = new WindowAlertNode();

            const result = await alertNode.execute({
                node: {
                    id: '1',
                    type: 'window-alert',
                    position: { x: 0, y: 0 },
                    data: { message: 'Your code is: {{code}}' }
                },
                input: { code: 'SUMMER25-XYZ', name: 'John' },
                context: { workflowId: 1, executionId: 1, input: {}, results: {} }
            });

            expect(result.output._clientMessage).toBe('Your code is: SUMMER25-XYZ');
        });

        it('should handle nested template variables', async () => {
            const alertNode = new WindowAlertNode();

            const result = await alertNode.execute({
                node: {
                    id: '1',
                    type: 'window-alert',
                    position: { x: 0, y: 0 },
                    data: { message: 'Hello {{name}}, your code is {{code}}' }
                },
                input: { code: 'ABC123', name: 'Jane', extra: 'data' },
                context: { workflowId: 1, executionId: 1, input: {}, results: {} }
            });

            expect(result.output._clientMessage).toBe('Hello Jane, your code is ABC123');
        });
    });
});
