
// utils/priority-score.ts
export function calcPriorityScore({
    email_count,
    last_seen_at,
    first_seen_at,
    is_breached
}: {
    email_count: number | null | undefined ,
    last_seen_at: string | null | undefined,
    first_seen_at: string | null | undefined,
    is_breached: boolean | null | undefined
}) {
    const now = Date.now();

    // --- Activity score (0–40)
    const count = email_count ?? 0;
    // log scale so 5k emails doesn't nuke the score
    const activityScore = Math.min(40, Math.log10(count + 1) * 12);
    // examples:
    // 10 emails -> log10(11)=1.04 => ~12
    // 100 emails -> log10(101)=2.0 => ~24
    // 1000 emails -> log10(1001)=3.0 => ~36
    // 5000 emails -> log10(5001)=3.7 => capped at 40

    // --- Recency score (0–30)
    let recencyScore = 0;
    if (last_seen_at) {
        const last = new Date(last_seen_at).getTime();
        const daysSince = (now - last) / (1000 * 60 * 60 * 24);

        if (daysSince <= 7) recencyScore = 30;
        else if (daysSince <= 30) recencyScore = 22;
        else if (daysSince <= 90) recencyScore = 14;
        else if (daysSince <= 365) recencyScore = 6;
        else recencyScore = 2;
    }

    // --- Longevity score (0–10)
    let longevityScore = 0;
    if (first_seen_at) {
        const first = new Date(first_seen_at).getTime();
        const yearsSince = (now - first) / (1000 * 60 * 60 * 24 * 365);

        if (yearsSince >= 3) longevityScore = 10;
        else if (yearsSince >= 1) longevityScore = 6;
        else longevityScore = 3;
    }

    // --- Breach score (0 or 20)
    const breachScore = is_breached ? 20 : 0;

    // Total (0–100)
    const raw = activityScore + recencyScore + longevityScore + breachScore;

    // Round + clamp
    return Math.max(0, Math.min(100, Math.round(raw)));
}

export function priorityLabel(score: number) {
    if (score >= 80) return { label: "High", className: "bg-red-500/10 text-red-400" };
    if (score >= 40) return { label: "Medium", className: "bg-yellow-500/10 text-yellow-400" };
    if (score >= 1) return { label: "Low", className: "bg-emerald-500/10 text-emerald-400" };
    return { label: "None", className: "bg-zinc-500/10 text-zinc-400" };
}