"use client";

import { useState, useSyncExternalStore } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Check, Copy, Loader2, Tag, X } from "lucide-react";
import { useCheckout } from "@/hooks/use-checkout";
import { PAID_PLANS, type PlanResponse } from "@/lib/plans";

const PROMO_CODE = "GHOSTFRIDAY";
const PROMO_PERCENT_OFF = 23;
// Promo runs through Dec 1; hide from Dec 2 onwards
const PROMO_ENDS_AT = new Date("2026-12-02T00:00:00").getTime();
const DISMISS_KEY = `promo_dismissed_${PROMO_CODE}`;

// Client-only snapshots; the server snapshot hides the banner so hydration matches
const subscribeNoop = () => () => {};
function readVisible() {
    if (Date.now() >= PROMO_ENDS_AT) return false;
    try {
        return localStorage.getItem(DISMISS_KEY) !== "true";
    } catch {
        return true;
    }
}

export default function BusterPromoBanner() {
    const storageVisible = useSyncExternalStore(subscribeNoop, readVisible, () => false);
    const [dismissed, setDismissed] = useState(false);
    const [copied, setCopied] = useState(false);
    const { startCheckout, pendingPlan } = useCheckout("dashboard_promo_banner");

    const { data: planData } = useQuery<PlanResponse>({
        queryKey: ["plan"],
        queryFn: async () => {
            const res = await fetch("/api/plan");
            if (!res.ok) throw new Error("Failed to fetch plan");
            return res.json();
        },
    });

    // Subscribers already have everything the Buster Pass offers
    const isSubscriber = planData?.current_plan === "pro" || planData?.current_plan === "sentinel";

    if (!storageVisible || dismissed || !planData || isSubscriber) return null;

    const handleDismiss = () => {
        setDismissed(true);
        try {
            localStorage.setItem(DISMISS_KEY, "true");
        } catch {
            // Storage unavailable — dismissal lasts for this view only
        }
    };

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(PROMO_CODE);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            setCopied(false);
        }
    };

    return (
        <div className="relative overflow-hidden rounded-lg border border-foreground/10 bg-card p-4 sm:p-6 shadow-[inset_3px_0_0_0_var(--primary)]">
            <button
                type="button"
                onClick={handleDismiss}
                className="absolute top-3 right-3 p-1.5 rounded-md hover:bg-foreground/[0.05] text-foreground/55 hover:text-foreground/70 transition"
                aria-label="Dismiss announcement"
            >
                <X className="h-4 w-4" />
            </button>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pr-8">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 font-mono text-xs text-foreground/60">
                        <Tag className="h-3.5 w-3.5" />
                        Limited-time offer · Ends Dec 1
                    </div>
                    <p className="text-base sm:text-lg font-medium text-foreground">
                        {PROMO_PERCENT_OFF}% off the {PAID_PLANS.buster.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                        Use code{" "}
                        <button
                            type="button"
                            onClick={handleCopy}
                            className="inline-flex items-center gap-1 rounded-sm border border-dashed border-foreground/30 px-2 py-0.5 font-mono font-medium text-foreground hover:bg-foreground/[0.05] transition-colors"
                            aria-label={`Copy code ${PROMO_CODE}`}
                        >
                            {PROMO_CODE}
                            {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                        </button>{" "}
                        at checkout for a one-time full cleanup.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() => startCheckout("buster")}
                    disabled={pendingPlan !== null}
                    className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition disabled:opacity-60"
                >
                    {pendingPlan === "buster" ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <>
                            Get {PAID_PLANS.buster.shortName}
                            <ArrowRight className="h-4 w-4" />
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
