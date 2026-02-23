import { createClient } from "@/utils/supabase/server";
import { type NextRequest, NextResponse } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// 10 reset requests per email per hour
const resetRateLimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, "1 h"),
    prefix: "ratelimit:reset_password",
});

export async function POST(request: NextRequest) {
    const supabase = await createClient();
    const { email } = await request.json();
    if (!email || typeof email !== 'string') {
        return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Rate-limit per email to prevent spam/email bombing
    const { success } = await resetRateLimit.limit(email.toLowerCase());
    if (!success) {
        return NextResponse.json(
            { error: "Too many reset requests. Please wait before trying again." },
            { status: 429 }
        );
    }

    // Generate a password reset link using Supabase and email it to the user
    const { error } = await supabase.auth.resetPasswordForEmail(email)
    if (error) {
        console.error("Error sending reset email:", error)
        return NextResponse.json(
            { error: "Could not send reset email" },
            { status: 500 })
    }

    return NextResponse.json({message: "Verify your email"});
}