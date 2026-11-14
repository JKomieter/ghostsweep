// Opens third-party URLs taken from untrusted content (e.g. newsletter unsubscribe links from email
// headers). Only http(s) and mailto: URLs are allowed, so javascript:, data: and other schemes can't run, and the
// new tab gets no handle back to GhostSweep (noopener) and no Referer (noreferrer).

export function safeExternalUrl(raw: string | null | undefined): string | null {
    if (!raw) return null;
    try {
        const url = new URL(raw.trim());
        return ["https:", "http:", "mailto:"].includes(url.protocol) ? url.toString() : null;
    } catch {
        return null;
    }
}

/** Returns false (and opens nothing) if the URL isn't a valid http(s) or mailto: link. */
export function openExternalUrl(raw: string | null | undefined): boolean {
    const url = safeExternalUrl(raw);
    if (!url) return false;
    window.open(url, "_blank", "noopener,noreferrer");
    return true;
}
