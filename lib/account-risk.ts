// Shared rules for what counts as an account and which accounts are risky, so the dashboard
// cards, the Risk Snapshot and the Accounts page all report the same numbers.

/** No email from a service for this long and we call the account unused. */
export const UNUSED_AFTER_DAYS = 365;

type ServiceJoin = { category?: string | null } | { category?: string | null }[] | null | undefined;

export type AccountRow = {
    id: string;
    service_id: string | null;
    is_spam: boolean | null;
    last_seen_at: string | null;
};

function category(service: ServiceJoin) {
    return (Array.isArray(service) ? service[0] : service)?.category ?? null;
}

/** A real account, not a newsletter or spam sender. */
export function isAccountRow(row: { is_spam: boolean | null }, service: ServiceJoin): boolean {
    return row.is_spam !== true && category(service) !== "Newsletter";
}

export function unusedCutoff(now = new Date()): string {
    return new Date(now.getTime() - UNUSED_AFTER_DAYS * 24 * 60 * 60 * 1000).toISOString();
}

export function isUnused(row: { last_seen_at: string | null }, cutoffIso: string): boolean {
    return Boolean(row.last_seen_at && row.last_seen_at < cutoffIso);
}

export function isBreached(row: { service_id: string | null }, breachedServiceIds: Set<string>): boolean {
    return Boolean(row.service_id && breachedServiceIds.has(row.service_id));
}

/** Risk order: breached first, then the longest unused. Accounts that are neither aren't risky. */
export function compareRisk<T extends AccountRow>(breachedServiceIds: Set<string>) {
    return (a: T, b: T) => {
        const breachDiff = Number(isBreached(b, breachedServiceIds)) - Number(isBreached(a, breachedServiceIds));
        if (breachDiff !== 0) return breachDiff;
        const seen = (r: T) => (r.last_seen_at ? new Date(r.last_seen_at).getTime() : 0);
        return seen(a) - seen(b);
    };
}
