/* eslint-disable @typescript-eslint/no-explicit-any */
export const FB_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;

declare global {
    interface Window {
        fbq: (
            command: string,
            event: string,
            params?: Record<string, any>,
            options?: { eventID?: string }
        ) => void;
    }
}

export const pageview = () => {
    if (typeof window !== "undefined" && window.fbq) {
        window.fbq("track", "PageView");
    }
};

// The pixel script loads afterInteractive, so events fired on page load (e.g. Purchase on the
// checkout success page) retry briefly instead of being dropped.
export const event = (
    name: string,
    options: Record<string, any> = {},
    eventOptions?: { eventID?: string },
    attempt = 0
) => {
    if (typeof window === "undefined") return;
    if (window.fbq) {
        if (eventOptions) window.fbq("track", name, options, eventOptions);
        else window.fbq("track", name, options);
    } else if (attempt < 20) {
        setTimeout(() => event(name, options, eventOptions, attempt + 1), 250);
    } else {
        console.warn(`Meta Pixel not loaded — dropped ${name}`);
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

// Purchases are tracked via trackFunnel() in lib/analytics.ts with the real plan and amount