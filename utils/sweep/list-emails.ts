import { gmail_v1 } from "googleapis";


export async function listEmails(
    accessToken: string,
    current_plan: "free" | "pro" = "free",
    gmail: gmail_v1.Gmail
): Promise<gmail_v1.Schema$Message[]> {
    try {
        const q =
            current_plan === "pro"
                ? `newer_than:3y (
                "welcome" OR "verify" OR "confirm" OR 
                "reset" OR "security" OR "alert" OR 
                "sign in" OR "login" OR "sign up" OR 
                "activation" OR "subscription" OR 
                "payment" OR "invoice" OR "receipt" OR 
                "order" OR "billing" OR "unusual" OR 
                "suspicious" OR "preferences" OR 
                "unsubscribe"
                )`
                : `newer_than:1y (
                "welcome" OR "verify" OR "confirm" OR 
                "reset" OR "security" OR "account" OR 
                "activation" OR "sign up"
                )`;
    
        const maxMessages = current_plan === "pro" ? 2000 : 300;
        const pageSize = 100;
    
        // 4. Pagination loop
        let nextPageToken: string | undefined;
        const messages: gmail_v1.Schema$Message[] = [];
    
        while (messages.length < maxMessages) {
            const res = await gmail.users.messages.list({
                userId: "me",
                q,
                maxResults: Math.min(pageSize, maxMessages - messages.length),
                pageToken: nextPageToken,
                includeSpamTrash: false,
            });
    
            const batch = res.data.messages ?? [];
    
            if (batch.length === 0) {
                break; // nothing more to fetch
            }
    
            messages.push(...batch);
    
            if (!res.data.nextPageToken) {
                break; // no more pages
            }
    
            nextPageToken = res.data.nextPageToken;
        }
    
        return messages.slice(0, maxMessages);
    } catch (error) {
        console.error("Error listing emails:", JSON.stringify(error));
        throw error
    }
}