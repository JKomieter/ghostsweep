/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/deletion_requests/post/route.ts
import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

const ALLOWED_METHODS = ["email", "link", "manual"] as const;
type AllowedMethod = (typeof ALLOWED_METHODS)[number];

function isAllowedMethod(v: unknown): v is AllowedMethod {
    return typeof v === "string" && (ALLOWED_METHODS as readonly string[]).includes(v);
}

export async function POST(req: NextRequest) {
    const supabase = await createClient();

    const {
        data: { user },
        error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let body: any;
    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    /**
     * MVP inputs:
     * - user_service_id (required)
     * - deletion_method (required): "email" | "link" | "manual"
     *
     * Optional:
     * - status: override default status (e.g., "completed" for already-deleted services)
     * - receiver_email (recommended for email; should come from playbook)
     * - sender_email (gmail address)
     * - template_used (email body you sent)
     * - gmail_message_id / thread_id (if you track replies later)
     * - user_notes
     *
     * NOTE: deletion_url is NOT stored on deletion_requests anymore.
     * NOTE: steps is NOT stored on deletion_requests anymore.
     */
    const {
        user_service_id,
        deletion_method,
        status: statusOverride,
        receiver_email,
        sender_email,
        template_used,
        gmail_message_id,
        thread_id,
        user_notes,
    } = body;

    if (!user_service_id || !deletion_method) {
        return NextResponse.json(
            { error: "Missing fields: user_service_id, deletion_method" },
            { status: 400 }
        );
    }

    if (!isAllowedMethod(deletion_method)) {
        return NextResponse.json(
            { error: "Invalid deletion_method (email | link | manual)" },
            { status: 400 }
        );
    }

    // If this is an email send event, receiver_email should exist
    if (deletion_method === "email" && !receiver_email) {
        return NextResponse.json(
            { error: "receiver_email is required when deletion_method is email" },
            { status: 400 }
        );
    }

    // Status logic:
    // - If statusOverride provided, use it (e.g., "completed" for already-deleted services)
    // - email: if this endpoint is called AFTER sending => sent
    // - link/manual: starting action => in_progress
    const now = new Date().toISOString();
    const status = statusOverride || (deletion_method === "email" ? "sent" : "in_progress");

    const payload: Record<string, any> = {
        user_id: user.id,
        user_service_id,

        deletion_method,
        status,

        receiver_email: receiver_email ?? null,
        sender_email: sender_email ?? null,
        template_used: template_used ?? null,
        gmail_message_id: gmail_message_id ?? null,
        thread_id: thread_id ?? null,
        user_notes: user_notes ?? null,

        updated_at: now,
    };

    if (status === "sent") {
        payload.sent_at = now;
    }

    // If status is completed, also set completed_at
    if (status === "completed") {
        payload.completed_at = now;
    }

    const { data, error } = await supabase
        .from("deletion_requests")
        .upsert(payload, { onConflict: "user_id,user_service_id" })
        .select("*")
        .single();

    if (error) {
        console.error("Failed to save deletion request:", error);
        return NextResponse.json({ error: "Failed to save" }, { status: 500 });
    }

    return NextResponse.json({ deletionRequest: data }, { status: 200 });
}