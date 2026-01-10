export class RateLimitError extends Error {
    status = 429 as const;
    retryAfterSeconds: number;
    resetIso?: string;

    constructor(message: string, retryAfterSeconds: number, resetIso?: string) {
        super(message);
        this.name = "RateLimitError";
        this.retryAfterSeconds = retryAfterSeconds;
        this.resetIso = resetIso;
    }
}

export async function apiFetch<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
    const res = await fetch(input, init);

    // Try to parse JSON (but don't crash if it's not JSON)
    const payload = await res.json().catch(() => null);

    if (!res.ok) {
        if (res.status === 429) {
            const retryAfterHeader = res.headers.get("Retry-After");
            const retryAfterSeconds =
                Number(payload?.retryAfterSeconds) ||
                (retryAfterHeader ? Number(retryAfterHeader) : 10) ||
                10;

            throw new RateLimitError(
                payload?.message || "Too many requests. Try again shortly.",
                retryAfterSeconds,
                payload?.rateLimitState?.reset
            );
        }

        throw new Error(payload?.message || payload?.error || "Request failed");
    }

    return payload as T;
}