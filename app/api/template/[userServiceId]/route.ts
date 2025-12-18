// app/api/deletion-template/[userServiceId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { GoogleGenAI } from "@google/genai";
import { z } from "zod";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not set");
}

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

interface DeletionTemplate {
    subject: string;
    body: string;
    metadata?: {
        tone: "formal" | "firm" | "urgent";
        estimatedResponseTime: string;
        tips?: string[];
    };
}

interface PersonalizationContext {
    userName: string | null;
    userEmail: string;
    serviceName: string;
    domain: string;
    category: string;
    country?: string | null;
    lastSeen: Date | null;
    firstSeen: Date | null;
    emailCount: number;
    isBreached: boolean;
    breachDetails?: {
        name: string;
        date: string;
        compromisedData: string[];
    };
}

const deletionTemplateSchema = z.object({
    subject: z.string().describe("Professional email subject line"),
    body: z.string().describe("Well-formatted plain text email body"),
    tone: z.enum(["formal", "firm", "urgent"]).optional(),
    estimatedResponseTime: z.string().optional(),
    tips: z.array(z.string()).optional(),
});

function getMonthsSince(date: Date | null): number {
    if (!date) return 0;
    const now = new Date();
    const years = now.getFullYear() - date.getFullYear();
    const months = now.getMonth() - date.getMonth();
    return years * 12 + months;
}

function getServiceSpecificDataTypes(category: string): string[] {
    const dataTypeMap: Record<string, string[]> = {
        "Social Media": [
            "Profile information and bio",
            "Posts, comments, and messages",
            "Photos and videos",
            "Friend/follower lists",
            "Activity history and analytics",
        ],
        "Streaming & Entertainment": [
            "Viewing/listening history",
            "Watchlist and favorites",
            "Playback preferences",
            "Device information",
            "Subscription and billing history",
        ],
        "Shopping & E-commerce": [
            "Purchase history and transaction records",
            "Saved payment methods",
            "Shipping addresses",
            "Product reviews and ratings",
            "Wishlist and cart data",
        ],
        "Financial & Payments": [
            "Transaction history",
            "Linked bank accounts",
            "Payment methods",
            "Tax documents",
            "Investment records (if applicable)",
        ],
        "Productivity & Work": [
            "Documents and files",
            "Project history",
            "Collaboration records",
            "Usage analytics",
            "Team membership data",
        ],
        "Gaming": [
            "Game progress and achievements",
            "In-game purchases",
            "Player statistics",
            "Friend lists and chat history",
            "Account credentials",
        ],
        "Travel & Transportation": [
            "Booking history",
            "Travel preferences",
            "Saved locations",
            "Payment information",
            "Loyalty program data",
        ],
        "Health & Fitness": [
            "Health metrics and activity data",
            "Workout history",
            "Biometric data",
            "Goal tracking",
            "Device sync data",
        ],
        "Email & Communication": [
            "Email contents and metadata",
            "Contacts and address book",
            "Calendar events",
            "Attachments",
            "Communication logs",
        ],
        "Food & Delivery": [
            "Order history",
            "Delivery addresses",
            "Payment methods",
            "Ratings and reviews",
            "Dietary preferences",
        ],
        "News & Media": [
            "Reading history",
            "Saved articles",
            "Subscription details",
            "Preferences and interests",
            "Comment history",
        ],
        Other: [
            "Profile information",
            "Activity history",
            "Stored preferences",
            "Usage analytics",
            "Associated personal data",
        ],
    };

    return dataTypeMap[category] || dataTypeMap["Other"];
}

async function generatePersonalizedDeletionTemplate(
    context: PersonalizationContext,
): Promise<DeletionTemplate> {
    const {
        userName,
        userEmail,
        serviceName,
        domain,
        category,
        country,
        lastSeen,
        firstSeen,
        emailCount,
        isBreached,
        breachDetails,
    } = context;

    const monthsSinceLastSeen = getMonthsSince(lastSeen);
    const accountAgeMonths = getMonthsSince(firstSeen);

    let activityContext = "";
    let tone: "formal" | "firm" | "urgent" = "formal";

    if (isBreached) {
        activityContext =
            "This account was exposed in a data breach and requires immediate deletion for security reasons.";
        tone = "urgent";
    } else if (monthsSinceLastSeen >= 24) {
        activityContext = `This account has been inactive for over ${Math.floor(
            monthsSinceLastSeen / 12,
        )} years and is clearly abandoned.`;
        tone = "firm";
    } else if (monthsSinceLastSeen >= 12) {
        activityContext = "This account has been inactive for over a year.";
        tone = "firm";
    } else if (monthsSinceLastSeen >= 6) {
        activityContext = "This account has been inactive for several months.";
        tone = "formal";
    } else {
        activityContext = "This account is no longer needed.";
        tone = "formal";
    }

    let breachContext = "";
    if (isBreached && breachDetails) {
        breachContext = `
CRITICAL SECURITY CONTEXT:
This account was exposed in the "${breachDetails.name}" data breach on ${breachDetails.date}.
Compromised data includes: ${breachDetails.compromisedData.join(", ")}.

Instructions:
- Use URGENT tone throughout
- Emphasize immediate deletion due to security concerns
- Request confirmation of deletion within 48-72 hours
- Mention the specific breach by name
- Express concern about data security`;
    }

    const dataTypes = getServiceSpecificDataTypes(category);
    const dataTypesList = dataTypes.map((type) => `   - ${type}`).join("\n");

    const applicableLaws =
        country === "United States"
            ? ["CCPA", "GDPR"]
            : country?.includes("United Kingdom") || country?.includes("Europe")
                ? ["GDPR", "UK DPA"]
                : ["GDPR", "CCPA"];

    const userNameSafe = userName ?? "Unknown";
    const userEmailSafe = userEmail;
    const serviceNameSafe = serviceName || "this service";
    const domainSafe = domain || "Unknown";
    const categorySafe = category || "Other";
    const countrySafe = country ?? "Unknown";

    const prompt = `
You are generating a highly personalized, professional email for account deletion and data removal.

=== CONTEXT ===

User Information:
- Name: ${userNameSafe}
- Email: ${userEmailSafe}
- Country/Region: ${countrySafe}

Service Information:
- Service Name: ${serviceNameSafe}
- Domain: ${domainSafe}
- Category: ${categorySafe}
- First Seen: ${firstSeen?.toISOString() || "Unknown"}
- Last Seen: ${lastSeen?.toISOString() || "Unknown"}
- Account Age: ${accountAgeMonths} months
- Months Since Last Activity: ${monthsSinceLastSeen}
- Total Emails: ${emailCount}

Activity Context:
${activityContext}

${breachContext}

Regulatory Context:
- Applicable Laws: ${applicableLaws.join(", ")}
- User is exercising their right to deletion under these regulations

=== TASK ===

Create a deletion request email that is:
1. Highly personalized to ${serviceNameSafe} and the specific context
2. Tone-appropriate: ${tone === "urgent"
            ? "URGENT (due to breach)"
            : tone === "firm"
                ? "FIRM (long-abandoned account)"
                : "FORMAL (standard professional)"
        }
3. Service-specific: Reference data types relevant to ${categorySafe} category
4. Legally sound: Reference ${applicableLaws.join(" and ")}
5. Professional: Business letter format

=== REQUIREMENTS ===

Subject Line:
${isBreached
            ? '- Start with "URGENT:" or "IMMEDIATE ACTION REQUIRED:"'
            : tone === "firm"
                ? '- Use assertive language like "Formal Request"'
                : '- Use standard professional language'
        }
- Include "Deletion" and "Personal Data"
- Mention service name: ${serviceNameSafe}

Email Body Structure (PLAIN TEXT):

1. Greeting: "Dear [Service] Support Team,"
2. [blank line]
3. Opening paragraph stating intent with ${applicableLaws.join(" and ")} reference
4. [blank line]
5. Account Details section with list
6. [blank line]
7. Deletion request with service-specific data types:
${dataTypesList}
8. [blank line]
9. Confirmation request paragraph
10. [blank line]
11. Closing statement
12. [blank line]
13. Signature line with name

=== FORMATTING RULES (CRITICAL) ===

**Paragraph Spacing:**
- Use one blank line between major sections (greeting, body paragraphs, closing)
- Use one blank line between the deletion list and next paragraph
- NO blank lines within lists themselves

**List Formatting:**
- Section headers end with colon, then newline
- Example: "Account Details:" followed by newline
- List items start with "  - " (exactly 2 spaces, dash, space, then text)
- Each list item on its own line with single newline between items
- Example format:
  Account Details:
    - Full Name: John Doe
    - Email Address: john@example.com
    - Service: Netflix

**Text Requirements:**
- Plain text only - NO markdown syntax at all
- NO asterisks (**), NO underscores (_), NO backticks (\`)
- Use simple dash (-) for bullets only
- Keep sentences naturally readable (60-80 characters per line when possible)
- Use actual line breaks in your output, not escape sequences like \\n

**Example Output Structure:**
Dear [Service] Support Team,

I am writing to formally request the deletion of all personal data associated with my account, in accordance with applicable data protection regulations (e.g., GDPR, CCPA).

Account Details:
  - Full Name: John Doe
  - Email Address: john@example.com
  - Service: Example Service
  - Last Activity: December 2025

I kindly ask that you remove all personal data, including but not limited to:
  - Account details and profile information
  - Transaction history and billing records
  - Communication logs and preferences
  - Any other stored personal information

Please confirm via email once the data has been completely deleted, and provide information on any further actions, if necessary.

Thank you for your prompt attention to this matter.

Sincerely,
John Doe

**Critical Rules:**
- Use real values provided (${userNameSafe}, ${userEmailSafe}, ${serviceNameSafe})
- NO placeholders like [NAME] or [EMAIL] - use actual data
- Format naturally like a typed business letter
- Maximum one blank line between sections
- Consistent 2-space indentation for all list items

=== OUTPUT ===

Return ONLY valid JSON:

{
  "subject": "...",
  "body": "...",
  "tone": "${tone}",
  "estimatedResponseTime": "typical response time for ${categorySafe} services (e.g., '3-5 business days', '1-2 weeks')",
  "tips": ["3-5 actionable tips specific to ${serviceNameSafe} deletion request"]
}

The "body" field must be properly formatted plain text following all formatting rules above.
`;

    try {
        const result = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            config: {
                responseMimeType: "application/json",
                responseJsonSchema: {
                    type: "object",
                    properties: {
                        subject: {
                            type: "string",
                            description: "Professional email subject line"
                        },
                        body: {
                            type: "string",
                            description: "Well-formatted plain text email body with proper line breaks and spacing"
                        },
                        tone: {
                            type: "string",
                            enum: ["formal", "firm", "urgent"],
                            description: "Email tone"
                        },
                        estimatedResponseTime: {
                            type: "string",
                            description: "Expected response time"
                        },
                        tips: {
                            type: "array",
                            items: { type: "string" },
                            description: "Actionable tips for the user"
                        }
                    },
                    required: ["subject", "body"]
                }
            }
        });

        const rawText = result?.text?.trim();
        if (!rawText) {
            throw new Error("Empty response from AI");
        }

        const parsed = deletionTemplateSchema.parse(JSON.parse(rawText));

        if (!parsed.subject?.trim() || !parsed.body?.trim()) {
            throw new Error("Empty subject or body in AI response");
        }

        // Clean up formatting - handle any edge cases
        const cleanBody = parsed.body
            .replace(/\\n/g, '\n')           // Convert any \n escape sequences
            .replace(/\\t/g, '  ')           // Convert any \t to spaces
            .replace(/\n{3,}/g, '\n\n')      // Max 2 consecutive newlines
            .replace(/\*\*/g, '')            // Remove any ** bold markers
            .replace(/\*(?!\s*-)/g, '-')     // Convert standalone * to dashes
            .replace(/^  \* /gm, '  - ')     // Convert list asterisks to dashes
            .trim();

        return {
            subject: parsed.subject.trim(),
            body: cleanBody,
            metadata: {
                tone: parsed.tone || tone,
                estimatedResponseTime:
                    parsed.estimatedResponseTime || "5-7 business days",
                tips: parsed.tips || [],
            },
        };
    } catch (err) {
        console.error(
            "AI deletion template generation failed, using fallback:",
            err,
        );
        return generateFallbackTemplate(context);
    }
}

function generateFallbackTemplate(
    context: PersonalizationContext,
): DeletionTemplate {
    const {
        userName,
        userEmail,
        serviceName,
        domain,
        category,
        lastSeen,
        isBreached,
        breachDetails,
    } = context;

    const serviceDisplay = serviceName || domain || "your service";
    const displayName = userName || "Not provided";
    const closingName = userName || userEmail.split("@")[0];
    const monthsSinceLastSeen = getMonthsSince(lastSeen);

    const dataTypes = getServiceSpecificDataTypes(category);
    const tone: "formal" | "firm" | "urgent" = isBreached
        ? "urgent"
        : monthsSinceLastSeen >= 12
            ? "firm"
            : "formal";

    const lines: string[] = [`Dear ${serviceDisplay} Support Team,`, ""];

    if (isBreached && breachDetails) {
        lines.push(
            `I am writing to request the immediate deletion of all personal data associated with my account due to a security breach. My account was exposed in the ${breachDetails.name} on ${breachDetails.date}.`,
            "",
            "I request immediate deletion under applicable data protection regulations (e.g., GDPR, CCPA).",
        );
    } else if (monthsSinceLastSeen >= 12) {
        lines.push(
            `I am writing to formally request the deletion of all personal data associated with my account. This account has been inactive for over ${Math.floor(
                monthsSinceLastSeen / 12,
            )} year(s) and I no longer use this service.`,
            "",
            "I make this request under applicable data protection regulations (e.g., GDPR, CCPA).",
        );
    } else {
        lines.push(
            "I am writing to formally request the deletion of all personal data associated with my account, in accordance with applicable data protection regulations (e.g., GDPR, CCPA). Please find the relevant details below:",
        );
    }

    lines.push("", "Account Details:");
    lines.push(`  - Full Name: ${displayName}`);
    lines.push(`  - Email Address: ${userEmail}`);
    lines.push(`  - Service: ${serviceDisplay}`);

    if (lastSeen) {
        const lastSeenDate = new Date(lastSeen).toLocaleDateString("en-US", {
            month: "long",
            year: "numeric",
        });
        lines.push(`  - Last Activity: ${lastSeenDate}`);
    }

    if (isBreached) {
        lines.push("  - Security Status: Exposed in data breach");
    }

    if (domain && domain !== serviceDisplay) {
        lines.push(`  - Domain: ${domain}`);
    }

    lines.push(
        "",
        "I kindly ask that you remove all personal data, including but not limited to:",
    );

    for (const type of dataTypes) {
        lines.push(`  - ${type}`);
    }

    lines.push("");

    if (isBreached) {
        lines.push(
            "Due to the security breach, please confirm deletion within 48-72 hours and provide:",
            "  - Confirmation that all data has been permanently deleted",
            "  - Details on what data was compromised in the breach",
            "  - Steps taken to prevent future breaches",
        );
    } else {
        lines.push(
            "Additionally, please confirm via email once the data has been completely deleted, and provide information on any further actions, if necessary.",
        );
    }

    lines.push(
        "",
        isBreached
            ? "This is an urgent matter due to the security breach. I expect prompt action."
            : "Thank you for your prompt attention to this matter.",
        "",
        "Sincerely,",
        closingName,
    );

    return {
        subject: isBreached
            ? `URGENT: Request for Immediate Deletion Due to Data Breach – ${serviceDisplay}`
            : monthsSinceLastSeen >= 12
                ? `Formal Request for Deletion of Abandoned Account – ${serviceDisplay}`
                : `Request for Deletion of Personal Data – ${serviceDisplay}`,
        body: lines.join("\n"),
        metadata: {
            tone,
            estimatedResponseTime:
                category === "Financial & Payments"
                    ? "7-14 business days"
                    : category === "Social Media"
                        ? "3-7 business days"
                        : "5-10 business days",
            tips: [
                `Check ${serviceDisplay}'s privacy policy for specific deletion procedures`,
                "Keep a copy of this email for your records",
                "Follow up if you don't receive a response within 30 days",
                isBreached
                    ? "Consider changing passwords on other accounts using the same credentials"
                    : "You can also request deletion through their website or app settings",
            ].filter(Boolean),
        },
    };
}

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ userServiceId: string }> },
) {
    try {
        const supabase = await createClient();
        const { userServiceId } = await params;

        const {
            data: { user },
            error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Load user deletion profile
        const { data: profile } = await supabase
            .from("deletion_profiles")
            .select("full_name, country")
            .eq("user_id", user.id)
            .maybeSingle();

        // Get Gmail account
        const { data: gmailAccount, error: gmailAccountError } = await supabase
            .from("gmail_accounts")
            .select("gmail_address")
            .eq("user_id", user.id)
            .maybeSingle();

        if (
            (gmailAccountError && gmailAccountError.code !== "PGRST116") ||
            !gmailAccount
        ) {
            console.error("Gmail account cannot be found:", gmailAccountError);
            return NextResponse.json(
                { error: "Gmail account not found" },
                { status: 404 },
            );
        }

        // Get service info with user_service details
        const { data: userService, error: userServiceError } = await supabase
            .from("user_services")
            .select(
                `
                first_seen_at,
                last_seen_at,
                email_count,
                service:services!inner (
                    id,
                    name,
                    category,
                    domain
                )
            `,
            )
            .eq("id", userServiceId)
            .eq("user_id", user.id)
            .single();

        if (userServiceError && userServiceError.code !== "PGRST116" || !userService) {
            console.error("Service not found:", userServiceError);
            return NextResponse.json({ error: "Service not found" }, { status: 404 });
        }

        const service = Array.isArray(userService?.service)
            ? userService?.service[0]
            : userService?.service;

        // Check for breaches on that domain
        const { data: userBreaches } = await supabase
            .from("user_breaches")
            .select(
                `
                breach:breaches!inner (
                    name,
                    breach_date,
                    data_classes
                )
                `,
            )
            .eq("user_id", user.id)
            .eq("domain", service.domain)
            .order("breach_date", { ascending: false })
            .limit(1);

        const userBreachRow = Array.isArray(userBreaches) ? userBreaches[0] : undefined;
        const breach = Array.isArray(userBreachRow?.breach)
            ? userBreachRow?.breach[0]
            : userBreachRow?.breach;

        const isBreached = !!breach;

        const breachDetails = breach
            ? {
                name: breach.name || "Unknown Breach",
                date: breach.breach_date
                    ? new Date(breach.breach_date).toLocaleDateString("en-US", {
                        month: "long",
                        year: "numeric",
                    })
                    : "Unknown Date",
                compromisedData: breach.data_classes || [],
            }
            : undefined;

        const context: PersonalizationContext = {
            userName: profile?.full_name ?? null,
            userEmail: gmailAccount.gmail_address || user.email!,
            serviceName: service.name,
            domain: service.domain,
            category: service.category || "Other",
            country: profile?.country ?? null,
            lastSeen: userService.last_seen_at
                ? new Date(userService.last_seen_at)
                : null,
            firstSeen: userService.first_seen_at
                ? new Date(userService.first_seen_at)
                : null,
            emailCount: userService.email_count || 0,
            isBreached,
            breachDetails,
        };

        const template = await generatePersonalizedDeletionTemplate(context);

        return NextResponse.json(
            {
                from: context.userEmail,
                subject: template.subject,
                body: template.body,
                metadata: template.metadata,
                context: {
                    serviceName: context.serviceName,
                    category: context.category,
                    isBreached: context.isBreached,
                    monthsInactive: getMonthsSince(context.lastSeen),
                },
            },
            { status: 200 },
        );
    } catch (error) {
        console.error("Error generating deletion template:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 },
        );
    }
}