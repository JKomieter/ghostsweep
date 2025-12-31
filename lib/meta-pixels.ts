/* eslint-disable @typescript-eslint/no-explicit-any */
export const FB_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;

declare global {
    interface Window {
        fbq: (
            command: string,
            event: string,
            params?: Record<string, any>
        ) => void;
    }
}

export const pageview = () => {
    if (typeof window !== "undefined" && window.fbq) {
        window.fbq("track", "PageView");
    }
};

export const event = (name: string, options: Record<string, any> = {}) => {
    if (typeof window !== "undefined" && window.fbq) {
        window.fbq("track", name, options);
    } else {
        console.warn("Meta Pixel not loaded yet");
    }
};

// Convenience functions for specific events
export const trackSignup = () => {
    event("CompleteRegistration", {
        content_name: "GhostSweep Signup",
    });
};

export const trackGmailConnection = () => {
    event("Lead", {
        content_name: "Gmail Connected",
    });
};

export const trackScanComplete = (accountsFound: number, breachesFound: number) => {
    event("Search", {
        content_category: "email_scan",
        accounts_found: accountsFound,
        breaches_found: breachesFound,
    });
};

export const trackViewPricing = () => {
    event("ViewContent", {
        content_name: "Pricing Page",
        content_type: "product",
    });
};

export const trackUpgrade = () => {
    event("Purchase", {
        value: 9.99,
        currency: "USD",
        content_name: "GhostSweep Pro",
        content_type: "subscription",
    });
};