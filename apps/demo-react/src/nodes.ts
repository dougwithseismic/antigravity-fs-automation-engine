import type { ClientNode } from '@antigravity/client-sdk';

export const WindowAlertNode: ClientNode = {
    id: 'window-alert',
    type: 'window-alert',
    data: {},
    execute: async ({ input }: { input: { message: string } }) => {
        await new Promise(resolve => setTimeout(resolve, 500));
        const msg = input && input.message ? input.message : JSON.stringify(input);

        // Dispatch event to show discount code component
        const event = new CustomEvent('show-discount-code', {
            detail: { code: msg }
        });
        window.dispatchEvent(event);

        // Keep visible - don't auto-close

        return { status: 'success', output: { confirmed: true } };
    }
};

// Generic notification node - dispatches events with output data
export const NotifyNode: ClientNode = {
    id: 'notify',
    type: 'window-alert', // Keep same type for backwards compatibility
    data: {},
    execute: async ({ input }: { input: any }) => {
        await new Promise(resolve => setTimeout(resolve, 500));

        // Dispatch generic notification event with the full output
        const event = new CustomEvent('client-notification', {
            detail: {
                type: 'notification',
                data: input
            }
        });
        window.dispatchEvent(event);

        return { status: 'success', output: { confirmed: true } };
    }
};

export const BannerNode: ClientNode = {
    id: 'banner-form',
    type: 'banner-form',
    data: {},
    execute: async ({ input }: { input: { message: string } }) => {
        return new Promise((resolve) => {
            const event = new CustomEvent('show-banner', {
                detail: {
                    message: input?.message || 'Special Offer!',
                    resolve: (email: string) => resolve({ status: 'success', output: { email } })
                }
            });
            window.dispatchEvent(event);
        });
    }
};
