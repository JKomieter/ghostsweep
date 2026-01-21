import { createClient } from "@/utils/supabase/server";
import { google } from "googleapis";
import { NextResponse } from "next/server";
import crypto from "crypto";

export async function GET() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const clientId = process.env.GOOGLE_CLIENT_ID!;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET!;
    const redirectUri = process.env.NODE_ENV === "production" ? process.env.GOOGLE_REDIRECT_URI! : process.env.GOOGLE_REDIRECT_URI_DEV!;

    try {
        const oauth2Client = new google.auth.OAuth2(
            clientId,
            clientSecret,
            redirectUri,
        );
    
        // Generate a secure random state value.
        const state = crypto.randomBytes(32).toString("hex");
    
        const url = oauth2Client.generateAuthUrl({
            access_type: "offline",
            prompt: "consent",
            scope: [
                "openid",
                "https://www.googleapis.com/auth/userinfo.email",

                // Gmail permissions
                "https://www.googleapis.com/auth/gmail.send",
                "https://www.googleapis.com/auth/gmail.readonly",

                // Optional (only if you use name/photo in UI)
                // "https://www.googleapis.com/auth/userinfo.profile",
            ],
            include_granted_scopes: true,
            state,
        });
    
        // Set the state in a secure, short-lived cookie
        const res = NextResponse.redirect(url);
        res.cookies.set("gmail_oauth_state", state, {
            httpOnly: true,
            secure: true,
            sameSite: "lax",
            maxAge: 10 * 60, // 10 minutes
            path: "/",
        });
    
        return res;
    } catch (error) {
        console.error("Error generating OAuth URL:", error);
        // redirect to dashboard with error
        const url = '/dashboard?google_oauth_error=1';
        return NextResponse.redirect(url);
    }
}