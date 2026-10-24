// Shared rules for "money found" so the dashboard, value page and paywall all quote the same number.

/** found_values types that are money the user can get back (subscriptions are money going out). */
export const RECOVERABLE_VALUE_TYPES = ["gift_card", "coupon", "rewards", "refund"] as const;

type ValueRow = { amount: unknown; status?: string | null; risk_level?: string | null };

/**
 * Cents the user can still claim: active items only, leaving out ones flagged as likely
 * scams (those are blocked for safety, so they can't be claimed).
 */
export function claimableCents(rows: ValueRow[]): number {
    return rows
        .filter((r) => r.status === "active" && r.risk_level !== "high_risk")
        .reduce((sum, r) => sum + (Number(r.amount) || 0), 0);
}
