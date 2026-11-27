import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { optOutOfMarketing, verifyUnsubscribeToken } from "@/lib/marketing-email";
import { SITE_URL } from "@/lib/share";

// One-click unsubscribe from tips and offers. Works without signing in: the signed token in the
// link proves which user it is. Called two ways:
//  - by Gmail/Outlook's built-in "Unsubscribe" button (RFC 8058: POST, token in the query string)
//  - by the /home/unsubscribe page (POST, token in the JSON body)

async function readToken(req: NextRequest): Promise<string | null> {
    const fromQuery = req.nextUrl.searchParams.get("token");
    if (fromQuery) return fromQuery;
    if (req.headers.get("content-type")?.includes("application/json")) {
        const body = (await req.json().catch(() => null)) as { token?: unknown } | null;
        return typeof body?.token === "string" ? body.token : null;
    }
    return null;
}

export async function POST(req: NextRequest) {
    const userId = verifyUnsubscribeToken(await readToken(req));
    if (!userId) {
        return NextResponse.json({ error: "This unsubscribe link is invalid." }, { status: 400 });
    }

    const { error } = await optOutOfMarketing(createAdminClient(), userId);
    if (error) {
        console.error("One-click unsubscribe failed:", error.message);
        return NextResponse.json({ error: "Could not update your preferences. Please try again." }, { status: 500 });
    }
    return NextResponse.json({ unsubscribed: true });
}

// A plain visit to the link (some mail clients open it in a browser) goes to the confirmation page
export async function GET(req: NextRequest) {
    const token = req.nextUrl.searchParams.get("token") ?? "";
    return NextResponse.redirect(`${SITE_URL}/home/unsubscribe?token=${encodeURIComponent(token)}`);
}
