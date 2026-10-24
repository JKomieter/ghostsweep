// Shareable results: "I had 134 ghost accounts 👻", linking to a public page that carries the
// sharer's referral code (friend gets 50% off, sharer gets a free month).

export const SITE_URL = "https://ghostsweep.com";

/** Keep shared counts sane: whole numbers, no negatives, no absurd values from edited URLs. */
export function clampCount(raw: unknown): number {
    const n = Math.floor(Number(raw));
    return Number.isFinite(n) ? Math.min(Math.max(n, 0), 99_999) : 0;
}

export function shareUrl(count: number, referralCode?: string | null): string {
    const params = new URLSearchParams({ n: String(clampCount(count)) });
    if (referralCode) params.set("ref", referralCode);
    return `${SITE_URL}/share?${params}`;
}

export function shareHeadline(count: number): string {
    const n = clampCount(count);
    return `I had ${n.toLocaleString("en-US")} ghost account${n === 1 ? "" : "s"} 👻`;
}

export function shareText(count: number): string {
    return `${shareHeadline(count)} Old sign-ups still holding my data. GhostSweep found them all. Find yours:`;
}
