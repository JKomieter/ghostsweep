// app/api/unsubscribe/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

type UnsubscribeBody = {
    email?: string;
    list?: string; // kept for future use, but not required
};

export async function POST(req: Request) {
    try {
        const body = (await req.json()) as UnsubscribeBody;
        const email = body.email?.trim().toLowerCase();

        if (!email) {
            return NextResponse.json(
                { error: "Email is required." },
                { status: 400 },
            );
        }

        // super light validation
        if (!email.includes("@") || !email.includes(".")) {
            return NextResponse.json(
                { error: "Please provide a valid email address." },
                { status: 400 },
            );
        }

        const supabase = await createClient();

        // 🔧 Change this table name to match your actual waitlist table
        // e.g. "waitlist_signups" or "waitlist"
        const { data, error } = await supabase
            .from("waitlist")
            .update({
                is_subscribed: false,
                unsubscribed_at: new Date().toISOString(),
            })
            .eq("email", email)
            .select("id")
            .maybeSingle();

        if (error) {
            console.error("Error updating subscription flags:", error);
            return NextResponse.json(
                { error: "Failed to update preferences." },
                { status: 500 },
            );
        }

        // If no row existed, we still return success so the user experience is smooth
        if (!data) {
            console.log("No existing waitlist row for email, but treating as unsubscribed:", email);
        }

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error("Unsubscribe handler error:", err);
        return NextResponse.json(
            { error: "Invalid request." },
            { status: 400 },
        );
    }
}