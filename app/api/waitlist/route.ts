import { NextResponse } from "next/server";
import { Resend } from "resend";
import { createClient } from "@/utils/supabase/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { type NextRequest } from "next/server";

const resend = new Resend(process.env.RESEND_API_KEY);

const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// 5 signups per IP per hour
const waitlistLimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, "1 h"),
    prefix: "ratelimit:waitlist",
});

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
    try {
        const ip =
            req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
            req.headers.get("x-real-ip") ??
            "unknown";

        const { success } = await waitlistLimit.limit(ip);
        if (!success) {
            return NextResponse.json(
                { error: "Too many requests. Please try again later." },
                { status: 429 }
            );
        }

        const supabase = await createClient()
        const { email } = await req.json();

        if (!email || typeof email !== "string" || !EMAIL_REGEX.test(email) || email.length > 254) {
            return NextResponse.json(
                { error: "Invalid email" },
                { status: 400 }
            );
        }

        // ---------------------------
        // 1. Save email to Waitlist
        // ---------------------------
        const { error: insertError } = await supabase
            .from("waitlist")
            .insert({ email });

        if (insertError) {
            console.error("Supabase insert error:", insertError);
            return NextResponse.json(
                { error: "Failed to join waitlist" },
                { status: 500 }
            );
        }

        // ---------------------------
        // 2. Send Confirmation Email
        // ---------------------------
        // Using a template ID → no HTML needed
        await resend.emails.send({
            to: email,
            template: {
                id: "d34fe3d4-5a2b-43fd-9b2f-01362a31f80e",
                variables: {
                    email
                }
            }
        });

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error("Waitlist error:", err);
        return NextResponse.json(
            { error: "Something went wrong" },
            { status: 500 }
        );
    }
}