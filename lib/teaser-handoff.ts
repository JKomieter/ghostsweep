"use client";

// Carries the homepage teaser scan result through sign-up, so the first dashboard visit can
// pick up where the visitor left off instead of starting from nothing.
// Stored in the visitor's own browser only; storage can be blocked, so every access is guarded.

const KEY = "ghostsweep_teaser_handoff";
const MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

export type TeaserHandoff = {
    username: string;
    profilesFound: number;
    /** A few site names to show as proof, e.g. ["GitHub", "Reddit"] */
    sites: string[];
    savedAt: number;
};

export function saveTeaserHandoff(data: Omit<TeaserHandoff, "savedAt">) {
    try {
        localStorage.setItem(KEY, JSON.stringify({ ...data, savedAt: Date.now() }));
    } catch {
        // Storage blocked (private mode etc.) — the handoff is a nice-to-have
    }
}

export function readTeaserHandoff(): TeaserHandoff | null {
    try {
        const raw = localStorage.getItem(KEY);
        if (!raw) return null;
        const data = JSON.parse(raw) as TeaserHandoff;
        if (
            typeof data?.username !== "string" ||
            !data.username ||
            typeof data.profilesFound !== "number" ||
            Date.now() - (data.savedAt ?? 0) > MAX_AGE_MS
        ) {
            localStorage.removeItem(KEY);
            return null;
        }
        return { ...data, sites: Array.isArray(data.sites) ? data.sites.slice(0, 5) : [] };
    } catch {
        return null;
    }
}

export function clearTeaserHandoff() {
    try {
        localStorage.removeItem(KEY);
    } catch {
        // ignore
    }
}
