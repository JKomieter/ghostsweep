

export function extractEmailAddress(from: string): string | null {
    // handles "Name" <email@domain.com> and plain email@domain.com
    const match = from.match(/<([^>]+)>/);
    if (match) return match[1];

    // fallback: basic email-in-string detection
    const simple = from.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    return simple ? simple[0] : null;
}

export function extractDomain(email: string | null): string | null {
    if (!email) return null;
    const [, domain] = email.split("@");
    if (!domain) return null;

    let d = domain.toLowerCase().trim();
    if (d.startsWith("www.")) d = d.slice(4);

    // special handling for known alias domains
    if (d === "facebookmail.com") d = "facebook.com";

    return d;
}

export function extractName(from: string): string | null {
    const match = from.match(/^(.*?)\s*<[^>]+>$/);
    if (match) return match[1].replace(/(^"|"$)/g, '').trim();

    // if no angle brackets, return the whole string if it doesn't look like an email
    if (!from.includes("@")) {
        return from.replace(/(^"|"$)/g, '').trim();
    }

    return null;
}