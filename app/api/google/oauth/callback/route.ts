import { createClient } from "@/utils/supabase/server";
import { encryptToken } from "@/utils/token-crypto";
import { google } from "googleapis";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code") || "";
    const returnedState = searchParams.get("state") || "";

    // 1. Read the state we stored earlier
    const cookieState = request.cookies.get("gmail_oauth_state")?.value;

    // 2. Verify state
    if (!cookieState || !returnedState || cookieState !== returnedState) {
        return NextResponse.json({ error: "Invalid OAuth state" }, { status: 400 });
    }

    try {
        const clientId = process.env.GOOGLE_CLIENT_ID!;
        const clientSecret = process.env.GOOGLE_CLIENT_SECRET!;
        const redirectUri = process.env.NODE_ENV === "production" ? process.env.GOOGLE_REDIRECT_URI! : process.env.GOOGLE_REDIRECT_URI_DEV!;

        const oauth2Client = new google.auth.OAuth2(
            clientId,
            clientSecret,
            redirectUri,
        );

        // 3. Exchange code for tokens
        const { tokens } = await oauth2Client.getToken(code);
        oauth2Client.setCredentials(tokens);

        // 4. Get the email of the authenticated user
        const oauth2 = google.oauth2("v2");
        const { data: userInfo } = await oauth2.userinfo.get({
            auth: oauth2Client,
        });

        const gmailEmail = userInfo.email;
        const accessTokenEnc = encryptToken(tokens.access_token || "");
        const refreshTokenEnc = encryptToken(tokens.refresh_token || "");

        // 5. Store the tokens (you’ll probably want to encrypt these)
        const {  error } = await supabase.functions.invoke('save-gmail-account', {
            body: {
                userId: user.id,
                gmailEmail,
                accessTokenEnc,
                refreshTokenEnc,
                tokenExpiresAt: tokens.expiry_date
                    ? new Date(tokens.expiry_date).toISOString()
                    : new Date().toISOString(),
            }
        });

        if (error) {
            console.error("Supabase upsert error:", error);
            return new NextResponse("Failed to save Gmail account", { status: 500 });
        }

        // 6. Optionally clear the state cookie now that we’re done
        const res = NextResponse.redirect(new URL("/dashboard", request.url));
        res.cookies.set("gmail_oauth_state", "", {
            maxAge: 0,
            path: "/",
        });

        return res;
    } catch (error) {
        console.error("Error during OAuth callback:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}