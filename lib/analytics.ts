"use client";

// Upgrade funnel tracking: paywall_opened → checkout_started → purchase_completed (or checkout_canceled).
// Events go to Vercel Analytics (funnel/drop-off) and the matching Meta Pixel standard event (ad optimisation).
import { track } from "@vercel/analytics";
import { event as metaEvent } from "@/lib/meta-pixels";
import { PAID_PLANS, type PaidPlanId } from "@/lib/plans";

type Props = Record<string, string | number | boolean | null>;

export type FunnelEvent =
    | { name: "paywall_opened"; props: { reason: string } }
    | { name: "checkout_started"; props: { plan: PaidPlanId; source: string } }
    | { name: "checkout_canceled"; props: { plan: string } }
    | { name: "purchase_completed"; props: { plan: PaidPlanId; value: number; currency: string; session_id: string } };

/** Numeric price of a plan, e.g. 12.99 — used for Meta's InitiateCheckout value. */
function planValue(plan: PaidPlanId) {
    return Number(PAID_PLANS[plan].price.replace(/[^0-9.]/g, ""));
}

export function trackFunnel(e: FunnelEvent) {
    try {
        track(e.name, e.props as Props);
    } catch {
        // Analytics must never break the product
    }

    if (e.name === "checkout_started") {
        metaEvent("InitiateCheckout", {
            value: planValue(e.props.plan),
            currency: "USD",
            content_name: PAID_PLANS[e.props.plan].name,
        });
    } else if (e.name === "purchase_completed") {
        metaEvent(
            "Purchase",
            {
                value: e.props.value,
                currency: e.props.currency,
                content_name: PAID_PLANS[e.props.plan].name,
                content_type: PAID_PLANS[e.props.plan].mode === "payment" ? "product" : "subscription",
            },
            // Stripe session ID as the event ID lets Meta dedupe it against a future server-side (CAPI) event
            { eventID: e.props.session_id }
        );
    }
}
