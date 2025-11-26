import { gmail_v1 } from "googleapis";

type Plan = "free" | "pro";

/**
 * Lists emails from the user's inbox based on keywords highly indicative
 * of having created an account with a service.
 *
 * - Uses a targeted keyword sweep first
 * - Falls back to a broader sweep if too few messages are found
 * - Caps total messages + pages to avoid long runtimes / timeouts
 */
export async function listEmails(
    current_plan: Plan = "free",
    gmail: gmail_v1.Gmail
): Promise<gmail_v1.Schema$Message[]> {
    // --- Configuration (tuned to avoid timeouts) ---

    // Time window: keep Pro deep, but not insane
    const YEARS_PRO = 5;   // was 10
    const YEARS_FREE = 2;  // was 3
    const YEARS = current_plan === "pro" ? YEARS_PRO : YEARS_FREE;

    // Hard cap on total messages we’ll process
    const MAX_MESSAGES_PRO = 600;  // was 2000
    const MAX_MESSAGES_FREE = 200; // was 300
    const maxMessages =
        current_plan === "pro" ? MAX_MESSAGES_PRO : MAX_MESSAGES_FREE;

    const pageSize = 100;

    // Extra safety: limit how many pages we fetch per query
    const MAX_PAGES_PRO = 8; // 8 * 100 = 800 max theoretical
    const MAX_PAGES_FREE = 4;
    const maxPages =
        current_plan === "pro" ? MAX_PAGES_PRO : MAX_PAGES_FREE;

    // High-confidence, low-noise keywords to detect accounts/services.
    const KEYWORDS = [
        // Account Lifecycle & Onboarding
        `"account created"`,
        `"welcome to"`,
        `"confirm your email"`,
        `"get started"`,
        `"onboarding"`,
        `"we’ve reserved your spot"`,

        // Security / Authentication
        `"password reset"`,
        `"new device login"`,
        `"security alert"`,
        `"two-factor"`,
        `"2fa"`,
        `"suspicious activity"`,

        // Billing / Financial
        `"receipt for your"`,
        `"invoice"`,
        `"purchase confirmation"`,
        `"subscription renewal"`,
        `"billing update"`,

        // Privacy / Data
        `"privacy policy update"`,
        `"terms of service update"`,
        `"your data is important"`,
        `"data access request"`,
        `"GDPR"`,
        `"CCPA"`,

        // Closure / Dormancy
        `"account closed"`,
        `"account deletion"`,
        `"we're sorry to see you go"`,
        `"reactivate your account"`,
    ].join(" OR ");

    // Pass 1: targeted keyword sweep (no category filter for maximum coverage)
    const KEYWORD_SWEEP = `newer_than:${YEARS}y (${KEYWORDS})`;

    // Pass 2: broad sweep (non-promotional) if inbox is too “quiet”
    const BROAD_SWEEP = `newer_than:${YEARS}y -category:promotions`;

    /**
     * Fetch messages for a given query, respecting maxMessages + maxPages.
     */
    async function fetchAll(q: string) {
        let nextPageToken: string | undefined;
        const messages: gmail_v1.Schema$Message[] = [];
        let pageCount = 0;

        while (messages.length < maxMessages && pageCount < maxPages) {
            pageCount++;

            const remaining = maxMessages - messages.length;
            const batchSize = Math.min(pageSize, remaining);
            if (batchSize <= 0) break;

            const res = await gmail.users.messages.list({
                userId: "me",
                q,
                maxResults: batchSize,
                pageToken: nextPageToken,
                includeSpamTrash: false,
            });

            const batch = res.data.messages ?? [];
            if (batch.length === 0) break;

            messages.push(...batch);

            const token = res.data.nextPageToken;
            if (!token) break;

            nextPageToken = token;
        }

        return messages.slice(0, maxMessages);
    }

    try {
        // 1) Targeted keyword sweep first
        let messages = await fetchAll(KEYWORD_SWEEP);

        // 2) If too few, fall back to broader sweep
        if (messages.length < 40) {
            const broadMessages = await fetchAll(BROAD_SWEEP);
            if (broadMessages.length > messages.length) {
                messages = broadMessages;
            }
        }

        // Only keep id + threadId for downstream processing
        return messages.map((msg) => ({
            id: msg.id,
            threadId: msg.threadId,
        }));
    } catch (error) {
        console.error("Error listing emails:", error);
        throw error;
    }
}