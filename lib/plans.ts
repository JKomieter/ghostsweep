// Single source of truth for plan names, prices and features.
// Used by the marketing site, billing page, paywall and dashboard teasers so they never drift apart.
// Safe to import from client components (no Stripe price IDs or secrets here).

export type PlanId = "free" | "buster" | "pro" | "sentinel";
export type PaidPlanId = Exclude<PlanId, "free">;

/**
 * Scan credits granted by a one-time Buster Pass purchase. Kept at 1 so the pass is a
 * one-off cleanup and ongoing scanning stays a Pro feature. Must match the credit grant in
 * supabase/functions/update-subscription/index.ts.
 */
export const BUSTER_SCAN_CREDITS = 1;

/** "1 scan credit" / "3 scan credits" */
export function scanCreditsLabel(count: number): string {
    return `${count} scan credit${count === 1 ? "" : "s"}`;
}

/** Number of discovered accounts a free user can see before hitting the paywall. */
export const FREE_ACCOUNT_PREVIEW = 10;

// Raw prices; the display strings below are built from these so nothing can drift
const BUSTER_PRICE = 12.99;
const PRO_MONTHLY_PRICE = 7.99;
const PRO_ANNUAL_PRICE = 59.99;

const usd = (n: number) => `$${n.toFixed(2)}`;

/** Pro Annual vs 12 × Pro Monthly, e.g. 37 */
export const ANNUAL_SAVINGS_PERCENT = Math.round((1 - PRO_ANNUAL_PRICE / (PRO_MONTHLY_PRICE * 12)) * 100);

/** Pro Annual expressed per month, e.g. "$5/mo" */
export const ANNUAL_MONTHLY_EQUIVALENT = `$${Math.round(PRO_ANNUAL_PRICE / 12)}/mo`;

/** Shown under every checkout button (homepage pricing and the in-app paywall). */
export const CHECKOUT_REASSURANCE = "Secure checkout by Stripe · 30-day money-back guarantee · Subscriptions cancel anytime";

export type PaidPlan = {
    id: PaidPlanId;
    name: string;
    shortName: string;
    price: string;
    period: string;
    note: string;
    description: string;
    mode: "payment" | "subscription";
    /** Button label wherever this plan is bought */
    cta: string;
    features: string[];
};

export const PAID_PLANS: Record<PaidPlanId, PaidPlan> = {
    buster: {
        id: "buster",
        name: "Buster Pass",
        shortName: "Buster",
        price: usd(BUSTER_PRICE),
        period: "one-time",
        note: "Pay once. No subscription.",
        description: "A complete one-off privacy audit and cleanup.",
        mode: "payment",
        cta: "Get Buster Pass",
        features: [
            scanCreditsLabel(BUSTER_SCAN_CREDITS),
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
        price: usd(PRO_MONTHLY_PRICE),
        period: "/mo",
        note: "Cancel anytime",
        description: "Unlimited scans and always-on monitoring.",
        mode: "subscription",
        cta: "Start Pro Monthly",
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
        price: usd(PRO_ANNUAL_PRICE),
        period: "/yr",
        note: `Just ${ANNUAL_MONTHLY_EQUIVALENT}, billed yearly · save ${ANNUAL_SAVINGS_PERCENT}%`,
        description: "Everything in Pro at the best price per month.",
        mode: "subscription",
        cta: "Get Pro Annual",
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

/** Price in cents, e.g. 799 for Pro Monthly */
export function planPriceCents(plan: PaidPlanId): number {
    return Math.round(Number(PAID_PLANS[plan].price.replace(/[^0-9.]/g, "")) * 100);
}

export function isPaidPlan(plan: string | null | undefined): boolean {
    return plan === "buster" || plan === "pro" || plan === "sentinel";
}

/** Human label for the header/settings badge. */
export function planDisplayName(plan: string | null | undefined, creditsRemaining?: number): string {
    if (plan === "sentinel") return PAID_PLANS.sentinel.name;
    if (plan === "pro") return PAID_PLANS.pro.name;
    if (plan === "buster") return `Buster (${scanCreditsLabel(creditsRemaining ?? 0)} left)`;
    return "Free";
}

/** Shape returned by GET /api/plan. */
export type PlanResponse = {
    current_plan: PlanId;
    scan_credits_remaining?: number;
    renews_at?: string | null;
};
