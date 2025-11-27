import { gmail_v1 } from "googleapis";

type Plan = "free" | "pro";

/**
 * Lists emails from the user's inbox based on keywords highly indicative
 * of having created an account with a service.
 *
 * This version uses a two-pass sweep (targeted + broad fallback) and the
 * 'metadata' format to retrieve headers directly in the list call, avoiding
 * subsequent costly messages.get calls.
 *
 * @param current_plan The user's plan ("free" or "pro") to determine search depth.
 * @param gmail The initialized Gmail API client.
 * @returns A Promise that resolves to an array of Gmail message objects with header metadata.
 */
export async function listEmails(
    current_plan: Plan = "free",
    gmail: gmail_v1.Gmail
): Promise<gmail_v1.Schema$Message[]> {
    const isPro = current_plan === "pro";

    // --- Configuration (Tuned for Vercel Execution Limits) ---
    const YEARS = isPro ? 10 : 3;

    // Hard caps on API calls and messages. MAX_MESSAGES is aligned with MAX_PAGES * PAGE_SIZE.
    const PAGE_SIZE = 100;
    const MAX_PAGES = isPro ? 12 : 4;         // Max 8 / 4 API calls
    const MAX_MESSAGES = MAX_PAGES * PAGE_SIZE; // Max 800 / 400 results

    // High-confidence, low-noise keywords for the targeted sweep.
    const KEYWORDS = [
        // Account Lifecycle & Onboarding
        `"account created"`, `"welcome to"`, `"confirm your email"`,
        `"get started"`, `"onboarding"`, `"thanks for signing up"`,
        `"we’ve reserved your spot"`, // Added from previous version

        // Security / Authentication
        `"password reset"`, `"new device login"`, `"security alert"`,
        `"two-factor"`, `"2fa"`, `"suspicious activity"`,

        // Billing / Financial
        `"receipt for your"`, `"invoice"`, `"purchase confirmation"`,
        `"subscription renewal"`, `"billing update"`,

        // Privacy / Data
        `"privacy policy update"`, `"terms of service update"`,
        `"your data is important"`, `"data access request"`,
        `"GDPR"`, `"CCPA"`,

        // Closure / Dormancy
        `"account closed"`, `"account deletion"`,
        `"we're sorry to see you go"`, `"reactivate your account"`,
    ].join(" OR ");

    // Pass 1: Targeted Keyword Sweep (High-confidence, high-precision)
    const KEYWORD_SWEEP = `newer_than:${YEARS}y (${KEYWORDS})`;

    // Pass 2: Broad Sweep Fallback (Avoids promotions to minimize noise)
    const BROAD_SWEEP = `newer_than:${YEARS}y -category:promotions`;

    // Threshold to decide if the targeted sweep was sufficient
    const FALLBACK_THRESHOLD = 80;


    /**
     * Fetches all messages matching the given query string, respecting maxPages and maxMessages.
     * Includes necessary headers in the list call.
     * @param q The Gmail search query string.
     */
    async function fetchAll(q: string) {
        let nextPageToken: string | undefined;
        const messages: gmail_v1.Schema$Message[] = [];
        let pageCount = 0;

        while (messages.length < MAX_MESSAGES && pageCount < MAX_PAGES) {
            pageCount++;

            const remaining = MAX_MESSAGES - messages.length;
            const batchSize = Math.min(PAGE_SIZE, remaining);
            if (batchSize <= 0) break;

            const res = await gmail.users.messages.list({
                userId: "me",
                q,
                maxResults: batchSize,
                pageToken: nextPageToken,
                includeSpamTrash: false,
                format: "metadata", // <-- Optimized: retrieve headers here
                metadataHeaders: ["From", "Subject", "Date"],
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } as any); // <-- FIX: Cast to 'any' to resolve TypeScript error

            const batch = res.data.messages ?? [];
            if (batch.length === 0) break;

            messages.push(...batch);

            nextPageToken = res.data.nextPageToken || undefined;

            if (!nextPageToken) break;
        }

        // Return up to the hard message cap
        return messages.slice(0, MAX_MESSAGES);
    }

    try {
        // 1) Run targeted keyword sweep first
        let messages = await fetchAll(KEYWORD_SWEEP);

        // 2) If the targeted search yields too few results, widen the sweep.
        if (messages.length < FALLBACK_THRESHOLD) {
            console.log(`Targeted sweep only found ${messages.length} results. Initiating broad sweep.`);
            const broadMessages = await fetchAll(BROAD_SWEEP);

            // Only replace the results if the broad sweep found more data
            if (broadMessages.length > messages.length) {
                messages = broadMessages;
            }
        }

        return messages;
    } catch (error) {
        console.error("Error listing emails:", error);
        throw error;
    }
}