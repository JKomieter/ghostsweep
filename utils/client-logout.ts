// Client-side logout: ends the session on the server (revoking refresh tokens and clearing the
// HttpOnly session cookies), clears everything the app stored in the browser, then does a full
// page load so no in-memory data (e.g. the React Query cache) survives.
// The /api/signout response also sends "Clear-Site-Data", which makes the browser itself wipe
// storage and caches for the site; clearing here as well covers browsers that ignore that header.

export function clearBrowserStorage() {
    try {
        localStorage.clear();
    } catch {
        // storage unavailable (private mode etc.)
    }
    try {
        sessionStorage.clear();
    } catch {
        // storage unavailable
    }
}

export async function logout(options: { scope?: "global" | "local"; redirectTo?: string } = {}) {
    const { scope = "global", redirectTo = "/login" } = options;
    // Throws on network failure so the caller can tell the user logout didn't happen
    await fetch(scope === "local" ? "/api/signout?scope=local" : "/api/signout", { method: "POST" });
    clearBrowserStorage();
    window.location.href = redirectTo;
}
