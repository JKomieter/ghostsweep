// Single source of truth for plan names, prices and features.
// Used by the marketing site, billing page, paywall and dashboard teasers so they never drift apart.
// Safe to import from client components (no Stripe price IDs or secrets here).

export type PlanId = "free" | "buster" | "pro" | "sentinel";
export type PaidPlanId = Exclude<PlanId, "free">;

/** Scan credits granted by a one-time Buster Pass purchase. */
export const BUSTER_SCAN_CREDITS = 3;

/** Number of discovered accounts a free user can see before hitting the paywall. */
export const FREE_ACCOUNT_PREVIEW = 10;

export type PaidPlan = {
    id: PaidPlanId;
    name: string;
    shortName: string;
    price: string;
    period: string;
    note: string;
    description: string;
    mode: "payment" | "subscription";
    features: string[];
};

export const PAID_PLANS: Record<PaidPlanId, PaidPlan> = {
    buster: {
        id: "buster",
        name: "Buster Pass",
        shortName: "Buster",
        price: "$12.99",
        period: "one-time",
        note: "Pay once. No subscription.",
        description: "A complete one-off privacy audit and cleanup.",
        mode: "payment",
        features: [
            `${BUSTER_SCAN_CREDITS} scan credits`,
            "Every ghost account & gift card unlocked",
            "Deep-web shadow profile search",
            "Downloadable PDF privacy report",
            "One-click account deletion requests",
        ],
    },
    pro: {
        id: "pro",
        name: "Pro Monthly",
        shortName: "Pro",
        price: "$7.99",
        period: "/mo",
        note: "Cancel anytime",
        description: "Unlimited scans and always-on monitoring.",
        mode: "subscription",
        features: [
            "Everything in Buster, with unlimited scans",
            "Unlimited inbox connections",
            "Real-time breach alerts",
            "Weekly shadow web re-scan",
            "One-click newsletter unsubscribe",
        ],
    },
    sentinel: {
        id: "sentinel",
        name: "Pro Annual",
        shortName: "Annual",
        price: "$59.99",
        period: "/yr",
        // $59.99 / 12 = $5.00; vs $7.99 × 12 = $95.88 → 37% saving
        note: "Just $5/mo, billed yearly · save 37%",
        description: "Everything in Pro at the best price per month.",
        mode: "subscription",
        features: [
            "Everything in Pro Monthly",
            "Priority scan queue",
            "Gift card expiry alerts",
            "Monthly privacy report (PDF)",
            "Priority deletion support",
        ],
    },
};

export const FREE_PLAN = {
    name: "Free",
    price: "$0",
    note: "Free forever",
    description: "See what's hiding in your inbox and across the web.",
    features: [
        { text: "1 inbox scan per month", locked: false },
        { text: "Breach summary for your email", locked: false },
        { text: `Preview of ${FREE_ACCOUNT_PREVIEW} ghost accounts`, locked: false },
        { text: "Full ghost account list", locked: true },
        { text: "PDF report, gift cards & deletion tools", locked: true },
    ],
};

export function isPaidPlan(plan: string | null | undefined): boolean {
    return plan === "buster" || plan === "pro" || plan === "sentinel";
}

/** Human label for the header/settings badge. */
export function planDisplayName(plan: string | null | undefined, creditsRemaining?: number): string {
    if (plan === "sentinel") return PAID_PLANS.sentinel.name;
    if (plan === "pro") return PAID_PLANS.pro.name;
    if (plan === "buster") return `Buster (${creditsRemaining ?? 0}/${BUSTER_SCAN_CREDITS} credits)`;
    return "Free";
}

/** Shape returned by GET /api/plan. */
export type PlanResponse = {
    current_plan: PlanId;
    scan_credits_remaining?: number;
    renews_at?: string | null;
};
