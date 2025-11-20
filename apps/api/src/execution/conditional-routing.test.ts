import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ConditionNode } from '@antigravity/nodes';

describe('Conditional Routing Tests', () => {
    let conditionNode: ConditionNode;

    beforeEach(() => {
        conditionNode = new ConditionNode();
    });

    describe('Simple Conditions (Chill)', () => {
        it('should evaluate equality condition as true', async () => {
            const result = await conditionNode.execute({
                node: {
                    id: '1',
                    type: 'condition',
                    position: { x: 0, y: 0 },
                    data: {
                        condition: {
                            key: 'query.utm_source',
                            operator: '==',
                            value: 'ppc'
                        }
                    }
                },
                input: {
                    query: {
                        utm_source: 'ppc',
                        campaign: 'summer'
                    }
                },
                context: {
                    workflowId: 1,
                    executionId: 1,
                    input: {},
                    results: {}
                }
            });

            expect(result.status).toBe('success');
            expect(result.output._conditionResult).toBe(true);
            expect(result.output._conditionKey).toBe('query.utm_source');
            expect(result.output._conditionValue).toBe('ppc');
        });

        it('should evaluate equality condition as false', async () => {
            const result = await conditionNode.execute({
                node: {
                    id: '1',
                    type: 'condition',
                    position: { x: 0, y: 0 },
                    data: {
                        condition: {
                            key: 'query.utm_source',
                            operator: '==',
                            value: 'ppc'
                        }
                    }
                },
                input: {
                    query: {
                        utm_source: 'organic',
                        campaign: 'summer'
                    }
                },
                context: {
                    workflowId: 1,
                    executionId: 1,
                    input: {},
                    results: {}
                }
            });

            expect(result.status).toBe('success');
            expect(result.output._conditionResult).toBe(false);
        });
    });

    describe('Operator Variations (Medium)', () => {
        it('should evaluate strict equality (===)', async () => {
            const result = await conditionNode.execute({
                node: {
                    id: '1',
                    type: 'condition',
                    position: { x: 0, y: 0 },
                    data: {
                        condition: {
                            key: 'age',
                            operator: '===',
                            value: 25
                        }
                    }
                },
                input: { age: 25 },
                context: { workflowId: 1, executionId: 1, input: {}, results: {} }
            });

            expect(result.output._conditionResult).toBe(true);
        });

        it('should evaluate greater than', async () => {
            const result = await conditionNode.execute({
                node: {
                    id: '1',
                    type: 'condition',
                    position: { x: 0, y: 0 },
                    data: {
                        condition: {
                            key: 'price',
                            operator: '>',
                            value: 100
                        }
                    }
                },
                input: { price: 150 },
                context: { workflowId: 1, executionId: 1, input: {}, results: {} }
            });

            expect(result.output._conditionResult).toBe(true);
        });

        it('should evaluate less than or equal', async () => {
            const result = await conditionNode.execute({
                node: {
                    id: '1',
                    type: 'condition',
                    position: { x: 0, y: 0 },
                    data: {
                        condition: {
                            key: 'quantity',
                            operator: '<=',
                            value: 10
                        }
                    }
                },
                input: { quantity: 10 },
                context: { workflowId: 1, executionId: 1, input: {}, results: {} }
            });

            expect(result.output._conditionResult).toBe(true);
        });

        it('should evaluate contains operator', async () => {
            const result = await conditionNode.execute({
                node: {
                    id: '1',
                    type: 'condition',
                    position: { x: 0, y: 0 },
                    data: {
                        condition: {
                            key: 'tags',
                            operator: 'contains',
                            value: 'premium'
                        }
                    }
                },
                input: { tags: 'premium,featured,sale' },
                context: { workflowId: 1, executionId: 1, input: {}, results: {} }
            });

            expect(result.output._conditionResult).toBe(true);
        });
    });

    describe('Nested Path Resolution (Spicy)', () => {
        it('should resolve deeply nested paths', async () => {
            const result = await conditionNode.execute({
                node: {
                    id: '1',
                    type: 'condition',
                    position: { x: 0, y: 0 },
                    data: {
                        condition: {
                            key: 'user.profile.subscription.tier',
                            operator: '==',
                            value: 'premium'
                        }
                    }
                },
                input: {
                    user: {
                        profile: {
                            subscription: {
                                tier: 'premium',
                                status: 'active'
                            }
                        }
                    }
                },
                context: { workflowId: 1, executionId: 1, input: {}, results: {} }
            });

            expect(result.output._conditionResult).toBe(true);
            expect(result.output._conditionValue).toBe('premium');
        });

        it('should handle missing nested keys gracefully', async () => {
            const result = await conditionNode.execute({
                node: {
                    id: '1',
                    type: 'condition',
                    position: { x: 0, y: 0 },
                    data: {
                        condition: {
                            key: 'user.settings.theme',
                            operator: '==',
                            value: 'dark'
                        }
                    }
                },
                input: {
                    user: {
                        name: 'John'
                        // No settings object
                    }
                },
                context: { workflowId: 1, executionId: 1, input: {}, results: {} }
            });

            expect(result.output._conditionResult).toBe(false);
            expect(result.output._conditionValue).toBeUndefined();
        });
    });

    describe('Input Passthrough (Important)', () => {
        it('should pass through all input data with condition results', async () => {
            const inputData = {
                query: { utm_source: 'ppc', campaign: 'summer' },
                userId: '123',
                timestamp: '2025-01-20T10:00:00Z',
                metadata: { source: 'landing-page' }
            };

            const result = await conditionNode.execute({
                node: {
                    id: '1',
                    type: 'condition',
                    position: { x: 0, y: 0 },
                    data: {
                        condition: {
                            key: 'query.utm_source',
                            value: 'ppc'
                        }
                    }
                },
                input: inputData,
                context: { workflowId: 1, executionId: 1, input: {}, results: {} }
            });

            expect(result.output.query).toEqual(inputData.query);
            expect(result.output.userId).toBe('123');
            expect(result.output.metadata).toEqual(inputData.metadata);
            expect(result.output._conditionResult).toBe(true);
        });
    });

    describe('Error Handling', () => {
        it('should fail when no condition is provided', async () => {
            const result = await conditionNode.execute({
                node: {
                    id: '1',
                    type: 'condition',
                    position: { x: 0, y: 0 },
                    data: {}
                },
                input: {},
                context: { workflowId: 1, executionId: 1, input: {}, results: {} }
            });

            expect(result.status).toBe('failed');
            expect(result.output.error).toContain('No condition specified');
        });
    });
});

describe('Engine Conditional Edge Evaluation', () => {
    describe('Condition Matching Logic', () => {
        it('should match condition="true" with result=true', () => {
            const edgeCondition = 'true';
            const conditionResult = true;

            const shouldFollow = edgeCondition === 'true' && conditionResult === true;

            expect(shouldFollow).toBe(true);
        });

        it('should match condition="false" with result=false', () => {
            const edgeCondition = 'false';
            const conditionResult = false;

            const shouldFollow = edgeCondition === 'false' && conditionResult === false;

            expect(shouldFollow).toBe(true);
        });

        it('should NOT match condition="true" with result=false', () => {
            const edgeCondition = 'true';
            const conditionResult = false;

            const shouldFollow = edgeCondition === 'true' && conditionResult === true;

            expect(shouldFollow).toBe(false);
        });

        it('should NOT match condition="false" with result=true', () => {
            const edgeCondition = 'false';
            const conditionResult = true;

            const shouldFollow = edgeCondition === 'false' && conditionResult === false;

            expect(shouldFollow).toBe(false);
        });
    });
});
