"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";
import type { PaidPlanId } from "@/lib/plans";
import { trackFunnel } from "@/lib/analytics";

/**
 * Starts a Stripe Checkout session for a plan and redirects to it.
 * @param source where the upgrade was started (e.g. "paywall:report", "billing_page") — reported with checkout_started
 */
export function useCheckout(source: string) {
    const [pendingPlan, setPendingPlan] = useState<PaidPlanId | null>(null);
    const [error, setError] = useState<string | null>(null);

    const startCheckout = useCallback(async (plan: PaidPlanId) => {
        setPendingPlan(plan);
        setError(null);
        trackFunnel({ name: "checkout_started", props: { plan, source } });

        let referralCode: string | null = null;
        try {
            referralCode = localStorage.getItem("referral_code");
        } catch {
            // Storage unavailable — checkout continues without the referral
        }

        try {
            const response = await fetch("/api/stripe/checkout_sessions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    plan,
                    ...(referralCode ? { referral_code: referralCode } : {}),
                }),
            });

            const data = await response.json().catch(() => ({}));

            if (response.status === 429) {
                toast.error("Premium Service Demand", {
                    description: data.message || "We're currently handling a high volume of requests.",
                    duration: 6000,
                });
                setPendingPlan(null);
                return;
            }

            if (!response.ok) throw new Error(data.error || "Failed to create checkout session");
            if (!data.url) throw new Error("No checkout URL returned");

            window.location.href = data.url;
        } catch (err) {
            console.error("Checkout error:", err);
            const message = err instanceof Error ? err.message : "Something went wrong. Please try again.";
            setError(message);
            toast.error(message);
            setPendingPlan(null);
        }
    }, [source]);

    return { startCheckout, pendingPlan, error };
}
