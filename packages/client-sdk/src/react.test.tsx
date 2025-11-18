import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useWorkflow, AntigravityProvider } from './react';
import { ClientEngine } from './index';
import React from 'react';

// Mock ClientEngine
const mockExecute = vi.fn();
const mockRegisterNode = vi.fn();

vi.mock('./index', () => {
    return {
        ClientEngine: vi.fn().mockImplementation(() => ({
            execute: mockExecute,
            registerNode: mockRegisterNode
        }))
    };
});

describe('useWorkflow', () => {
    let engine: ClientEngine;

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should start in idle state', () => {
        const wrapper = ({ children }: { children: React.ReactNode }) => (
            <AntigravityProvider apiUrl="http://localhost:3002">{children}</AntigravityProvider>
        );

        const { result } = renderHook(() => useWorkflow('wf-1'), { wrapper });

        expect(result.current.status).toBe('idle');
        expect(result.current.data).toBeNull();
        expect(result.current.error).toBeNull();
    });

    it('should handle execution start', async () => {
        mockExecute.mockImplementation(async ({ onProgress }: { onProgress: any }) => {
            // Simulate server resume
            onProgress('server-resume', {});
            await new Promise(resolve => setTimeout(resolve, 10));
            const result = { success: true };
            onProgress('complete', { result });
            return result;
        });

        const wrapper = ({ children }: { children: React.ReactNode }) => (
            <AntigravityProvider apiUrl="http://localhost:3002">{children}</AntigravityProvider>
        );

        const { result } = renderHook(() => useWorkflow('wf-1'), { wrapper });

        await act(async () => {
            await result.current.start({ foo: 'bar' });
        });

        expect(result.current.status).toBe('completed');
        expect(result.current.data).toEqual({ success: true });
        expect(result.current.isLoading).toBe(false);
    });
});
