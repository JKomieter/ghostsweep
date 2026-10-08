// Remembers the paid plan a visitor picked on the marketing site so we can send them
// to checkout once they're signed in. Stored client-side because the user may come back
// through Google OAuth or an email confirmation link, neither of which keeps our query params.

const STORAGE_KEY = "pending_plan";
const MAX_AGE_MS = 24 * 60 * 60 * 1000;

// Marketing-site plan names → billing page tabs (?plan=buster|pro|sentinel)
const PLAN_TO_BILLING_TAB: Record<string, string> = {
    monthly: "pro",
    pro: "pro",
    annual: "sentinel",
    sentinel: "sentinel",
    buster: "buster",
};

export function billingPathForPlan(plan: string | null | undefined): string | null {
    const tab = plan ? PLAN_TO_BILLING_TAB[plan.toLowerCase()] : undefined;
    return tab ? `/dashboard/billing?plan=${tab}` : null;
}

/** Store the plan from the URL, or clear any stale one if the visitor arrived without a plan. */
export function rememberPendingPlan(plan: string | null) {
    try {
        if (billingPathForPlan(plan)) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify({ plan, at: Date.now() }));
        } else {
            localStorage.removeItem(STORAGE_KEY);
        }
    } catch {
        // Storage unavailable (private mode etc.) — the plan just won't carry over
    }
}

/** Returns the billing path for a remembered plan (if still fresh) and clears it. */
export function consumePendingPlanPath(): string | null {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return null;
        localStorage.removeItem(STORAGE_KEY);
        const { plan, at } = JSON.parse(raw) as { plan?: string; at?: number };
        if (!at || Date.now() - at > MAX_AGE_MS) return null;
        return billingPathForPlan(plan);
    } catch {
        return null;
    }
}
