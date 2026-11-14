// Safe summary of an error for logging. HTTP client errors (e.g. googleapis/gaxios) carry the full
// request config: Authorization headers, OAuth codes, refresh tokens and client secrets. Logging
// the raw error object would write those credentials to the logs, so only these fields are kept.
export function safeError(e: unknown): Record<string, unknown> {
    if (!(e instanceof Error)) return { message: String(e).slice(0, 300) };

    const err = e as Error & {
        code?: unknown;
        status?: unknown;
        response?: { status?: unknown; data?: { error?: unknown; error_description?: unknown } };
    };

    return {
        name: err.name,
        message: err.message.slice(0, 300),
        code: err.code,
        status: err.status ?? err.response?.status,
        // Provider error codes only (e.g. "invalid_grant"), never request data
        providerError: err.response?.data?.error,
        providerErrorDescription: err.response?.data?.error_description,
    };
}
