import { NextResponse } from "next/server";
import { Resend } from "resend";
import { createClient } from "@/utils/supabase/server";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
    try {
        const supabase = await createClient()
        const { email } = await req.json();

        if (!email || typeof email !== "string") {
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