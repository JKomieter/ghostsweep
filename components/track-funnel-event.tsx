"use client";

import { useEffect } from "react";
import { trackFunnel, type FunnelEvent } from "@/lib/analytics";

/**
 * Fires a funnel event once when rendered — lets server pages (billing, checkout success) report events.
 * `onceKey` dedupes across refreshes and revisits, so a reloaded success page doesn't count a second purchase.
 */
export default function TrackFunnelEvent({ event, onceKey }: { event: FunnelEvent; onceKey?: string }) {
    const serialized = JSON.stringify(event);

    useEffect(() => {
        const storageKey = onceKey ? `funnel_tracked:${onceKey}` : null;
        try {
            if (storageKey && localStorage.getItem(storageKey)) return;
            if (storageKey) localStorage.setItem(storageKey, "1");
        } catch {
            // Storage unavailable — track anyway; a rare duplicate beats a missed purchase
        }
        trackFunnel(JSON.parse(serialized) as FunnelEvent);
    }, [serialized, onceKey]);

    return null;
}
