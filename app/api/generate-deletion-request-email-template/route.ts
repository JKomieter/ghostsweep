// app/api/deletion-template/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { GoogleGenAI } from "@google/genai";
import { z } from "zod";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

interface DeletionTemplate {
    subject: string;
    body: string;
}

// Zod schema for validation
const deletionTemplateSchema = z.object({
    subject: z.string().describe("Professional email subject line"),
    body: z.string().describe("Well-formatted plain text email body with clear deletion request")
});

async function generateDeletionTemplate(opts: {
    userName: string | null;
    userEmail: string;
    serviceName: string;
    domain: string;
    country?: string | null;
}): Promise<DeletionTemplate> {
    const {
        userName,
        userEmail,
        serviceName,
        domain,
        country,
    } = opts;

    // Safely escape inputs
    const userNameSafe = JSON.stringify(userName);
    const userEmailSafe = JSON.stringify(userEmail);
    const serviceNameSafe = JSON.stringify(serviceName);
    const domainSafe = JSON.stringify(domain);
    const countrySafe = JSON.stringify(country);

    const prompt = `
You are a privacy assistant generating a formal, professional email for account deletion and data removal.

Task:
Create a formal deletion request email following GDPR/CCPA best practices.

Requirements:

Subject line:
- Professional and formal
- Include the word "Deletion" or "Delete"
- Reference "Personal Data"
- Example: "Request for Deletion of Personal Data"

Email body (PLAIN TEXT format - NO MARKDOWN):
- Use formal business tone
- Use proper spacing and line breaks for readability
- Structure:
  1. Formal greeting: "Dear [Service] Support Team,"
  2. Opening paragraph: State intent clearly with reference to data protection laws (GDPR, CCPA)
  3. Account details section with clear labels (use indentation with dashes or bullets)
  4. Specific deletion requests in a bulleted list
  5. Request for email confirmation
  6. Professional closing with "Sincerely," and name

Formatting rules:
- Use blank lines between paragraphs for readability
- Use simple bullet points (-, •, or *) for lists
- Use clear section labels followed by colons
- Indent list items with 2-4 spaces
- NO bold, italics, or any markdown syntax
- Keep line length reasonable (60-80 characters per line)

Reference template structure (adapt to the specific service):
"""
Dear [Service Name] Support Team,

I am writing to formally request the deletion of all personal data associated with my account, in accordance with applicable data protection regulations (e.g., GDPR, CCPA). Please find the relevant details below:

Account Details:
  - Full Name: [Name or "Not provided"]
  - Email Address: [Email]
  - Service: [Service Name]
  - Domain: [Domain if different]

I kindly ask that you remove all personal data, including but not limited to:
  - Account details and profile information
  - Transaction history and billing records
  - Communication logs and preferences
  - Any other stored personal information

Additionally, please confirm via email once the data has been completely deleted, and provide information on any further actions, if necessary.

Thank you for your prompt attention to this matter.

Sincerely,
[Name]
"""

Context:
- User name: ${userNameSafe}
- User email: ${userEmailSafe}
- Service name: ${serviceNameSafe}
- Service domain: ${domainSafe}
- User country: ${countrySafe}

Important:
- Use the actual provided values (don't use placeholders like [NAME])
- If name is null, use "Not provided" in the details section
- Adapt the template to this specific service
- Keep it professional, formal, and easy to read
- Use ONLY plain text formatting (spaces, dashes, line breaks)
`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
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
                            description: "Well-formatted plain text email body"
                        }
                    },
                    required: ["subject", "body"]
                }
            }
        });

        const rawText = response?.text?.trim();

        // Parse and validate with Zod
        const parsed = deletionTemplateSchema.parse(JSON.parse(rawText!));

        // Basic validation
        if (!parsed.subject?.trim() || !parsed.body?.trim()) {
            throw new Error("Empty subject or body in AI response");
        }

        return {
            subject: parsed.subject.trim(),
            body: parsed.body.trim(),
        };
    } catch (err) {
        console.error("AI deletion template generation failed, using fallback:", err);

        // Comprehensive fallback template
        return generateFallbackTemplate(opts);
    }
}

/**
 * Generate a fallback deletion template when AI fails
 */
function generateFallbackTemplate(opts: {
    userName: string | null;
    userEmail: string;
    serviceName: string;
    domain: string;
    country?: string | null;
}): DeletionTemplate {
    const { userName, userEmail, serviceName, domain } = opts;

    const serviceDisplay = serviceName || domain || "your service";
    const displayName = userName || "Not provided";
    const closingName = userName || userEmail.split('@')[0];

    const lines = [
        `Dear ${serviceDisplay} Support Team,`,
        "",
        "I am writing to formally request the deletion of all personal data associated with my account, in accordance with applicable data protection regulations (e.g., GDPR, CCPA). Please find the relevant details below:",
        "",
        "Account Details:",
        `  - Full Name: ${displayName}`,
        `  - Email Address: ${userEmail}`,
        `  - Service: ${serviceDisplay}`,
    ];

    if (domain && domain !== serviceDisplay) {
        lines.push(`  - Domain: ${domain}`);
    }

    lines.push(
        "",
        "I kindly ask that you remove all personal data, including but not limited to:",
        "  - Account details and profile information",
        "  - Transaction history and billing records",
        "  - Communication logs and preferences",
        "  - Any other stored personal information",
        "",
        "Additionally, please confirm via email once the data has been completely deleted, and provide information on any further actions, if necessary.",
        "",
        "Thank you for your prompt attention to this matter.",
        "",
        "Sincerely,",
        closingName
    );

    return {
        subject: `Request for Deletion of Personal Data – ${serviceDisplay}`,
        body: lines.join("\n"),
    };
}

export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient();

        const {
            data: { user },
            error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Optional: load a profile row with more info (name, country, etc.)
        const { data: profile } = await supabase
            .from("deletion_profiles")
            .select("full_name, country")
            .eq("user_id", user.id)
            .maybeSingle();
        
        // Get the user's Gmail account (filter by user)
        const { data: gmailAccount, error: gmailAccountError } = await supabase
            .from("gmail_accounts")
            .select("gmail_address")
            .eq("user_id", user.id)
            .maybeSingle();

        if ((gmailAccountError && gmailAccountError.code !== "PGRST116") || !gmailAccount) {
            console.error("Gmail account cannot be found: ", gmailAccountError);
            return NextResponse.json(
                { error: "Gmail account cannot be found" },
                { status: 404 }
            );
        }

        const url = new URL(request.url);
        const serviceName = url.searchParams.get("serviceName")?.trim() ?? "";
        const domain = url.searchParams.get("domain")?.trim() ?? "";

        if (!serviceName && !domain) {
            return NextResponse.json(
                { error: "Missing serviceName or domain" },
                { status: 400 }
            );
        }

        // Use the Gmail address as the "from" identity for the template
        const userEmail = gmailAccount.gmail_address || user.email!;

        const template = await generateDeletionTemplate({
            userName: profile?.full_name ?? null,
            userEmail,
            serviceName: serviceName || domain,
            domain,
            country: profile?.country ?? null,
        });

        return NextResponse.json(
            {
                from: userEmail,
                subject: template.subject,
                body: template.body,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error generating deletion template:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
