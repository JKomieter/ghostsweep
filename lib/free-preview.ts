// Free-tier previews must be a FIXED set of rows. If the preview were "the first N rows of the current
// view", a free user could delete/unsubscribe/recover/cancel items to pull hidden ones into view and
// eventually page through their whole list for free.
//
// So the preview is picked from the user's entire universe of rows — every status, tab and filter — using
// an order that status changes don't affect. Actions then only move rows between tabs; nothing new appears.
// Hard deletes would shrink the universe, so those require a paid plan (see upgradeRequired()).
import { NextResponse } from "next/server";

export function pickPreviewIds<T>(
    rows: T[],
    limit: number,
    opts: {
        id: (row: T) => string;
        /** Stable ordering that doesn't depend on status/whitelist fields. Ties are broken by id. */
        compare: (a: T, b: T) => number;
        /** Group key so duplicate rows (e.g. the same subscription found in several emails) count once. */
        group?: (row: T) => string;
    }
): Set<string> {
    const sorted = [...rows].sort((a, b) => opts.compare(a, b) || opts.id(a).localeCompare(opts.id(b)));
    const groups = new Set<string>();
    const ids = new Set<string>();
    for (const row of sorted) {
        const group = opts.group ? opts.group(row) : opts.id(row);
        if (!groups.has(group)) {
            if (groups.size >= limit) continue;
            groups.add(group);
        }
        ids.add(opts.id(row));
    }
    return ids;
}

/** 402 response the client turns into the upgrade paywall. */
export function upgradeRequired(message: string) {
    return NextResponse.json({ error: message, code: "UPGRADE_REQUIRED" }, { status: 402 });
}

/** Compare helper: newest first by an ISO timestamp field (nulls last). */
export function newestFirst(a: string | null | undefined, b: string | null | undefined) {
    const ta = a ? new Date(a).getTime() : 0;
    const tb = b ? new Date(b).getTime() : 0;
    return tb - ta;
}
