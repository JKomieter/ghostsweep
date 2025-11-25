import { gmail_v1 } from "googleapis";

type Plan = "free" | "pro";

/**
 * Lists emails from the user's inbox based on keywords highly indicative
 * of having created an account with a service. Uses a two-pass sweep for
 * efficiency and comprehensive results.
 *
 * @param current_plan The user's plan ("free" or "pro") to determine search depth.
 * @param gmail The initialized Gmail API client.
 * @returns A Promise that resolves to an array of Gmail message objects.
 */
export async function listEmails(
    current_plan: Plan = "free",
    gmail: gmail_v1.Gmail
): Promise<gmail_v1.Schema$Message[]> {
    // --- Configuration ---
    const YEARS_PRO = 10;
    const YEARS_FREE = 3;
    const YEARS = current_plan === "pro" ? YEARS_PRO : YEARS_FREE;
    // Max messages to retrieve in total
    const maxMessages = current_plan === "pro" ? 2000 : 300;
    const pageSize = 100;

    // High-confidence, low-noise keywords to detect accounts/services.
    // Quotes are used to match the exact phrase/word for precision.
    const KEYWORDS = [
        // Account Lifecycle & Onboarding (Highest Confidence)
        `"account created"`, `"welcome to"`, `"confirm your email"`,
        `"get started"`, `"onboarding"`, `"we’ve reserved your spot"`,

        // Security / Authentication (Irrefutable Proof of an Account)
        `"password reset"`, `"new device login"`, `"security alert"`,
        `"two-factor"`, `"2fa"`, `"suspicious activity"`,

        // Billing / Financial (Proof of Commercial Relationship)
        `"receipt for your"`, `"invoice"`, `"purchase confirmation"`,
        `"subscription renewal"`, `"billing update"`,

        // Privacy / Data (Direct Confirmation of Data Storage)
        `"privacy policy update"`, `"terms of service update"`,
        `"your data is important"`, `"data access request"`,
        `"GDPR"`, `"CCPA"`,

        // Closure / Dormancy (Proof of Past Account)
        `"account closed"`, `"account deletion"`, `"we're sorry to see you go"`,
        `"reactivate your account"`
    ].join(" OR ");

    // Pass 1: Targeted Keyword Sweep (No Category Filters for Maximum Coverage)
    // We remove all category filters (promotions, social, forums, etc.) 
    // to ensure critical security/signup emails are not missed due to Gmail categorization.
    const KEYWORD_SWEEP = `newer_than:${YEARS}y (${KEYWORDS})`;

    // Pass 2: Broad Sweep Fallback (Good for inboxes with few high-confidence keywords)
    // We keep the -category:promotions filter here to avoid flooding the results 
    // with low-intent marketing emails if the targeted search fails.
    const BROAD_SWEEP = `newer_than:${YEARS}y -category:promotions`;

    /**
     * Fetches all messages matching the given query string, respecting maxMessages limit.
     * @param q The Gmail search query string.
     */
    async function fetchAll(q: string) {
        let nextPageToken: string | undefined;
        const messages: gmail_v1.Schema$Message[] = [];

        while (messages.length < maxMessages) {
            // Use Math.min to ensure the batch size doesn't exceed the remaining limit
            const batchSize = Math.min(pageSize, maxMessages - messages.length);
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
        // 1) Run targeted keyword sweep first for high-confidence detection.
        let messages = await fetchAll(KEYWORD_SWEEP);

        // 2) If the targeted search yields too few results (e.g., quiet inbox), 
        // widen the sweep to include all non-promotional mail.
        if (messages.length < 80) {
            const broadMessages = await fetchAll(BROAD_SWEEP);
            // Combine and de-duplicate if necessary, but since KEYWORD_SWEEP is a subset
            // of the broad search space, simply replacing with the broader results is fine
            // as the initial sweep was likely too narrow/unlucky.
            if (broadMessages.length > messages.length) {
                messages = broadMessages;
            }
        }

        // We only need the ID and threadId for later fetching, as list() does not return full content.
        return messages.map(msg => ({ id: msg.id, threadId: msg.threadId }));
    } catch (error) {
        console.error(
            "Error listing emails:",
            error
        );
        throw error;
    }
}