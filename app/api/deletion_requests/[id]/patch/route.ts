/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/deletion_requests/patch/[id]/route.ts
import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

/**
 * MVP: user can manually update their deletion request row:
 * - status (completed/failed/in_progress/etc.)
 * - user_notes
 * - completed_at (auto-set when status = completed)
 * - updated_at (always)
 *
 * NOTE (new change):
 * - There is NO `steps` column on deletion_requests anymore.
 * - Steps live ONLY on ServiceDeletionPlaybook and are read-only here.
 *
 * Security:
 * - user must own the row (user_id === auth user.id)
 */

const ALLOWED_STATUSES = [
    "drafted",
    "sent",
    "received",
    "needs_verification",
    "in_progress",
    "completed",
    "failed",
    "expired",
] as const;

type AllowedStatus = (typeof ALLOWED_STATUSES)[number];

function isAllowedStatus(v: unknown): v is AllowedStatus {
    return typeof v === "string" && (ALLOWED_STATUSES as readonly string[]).includes(v);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const supabase = await createClient();

    const {
        data: { user },
        error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    if (!id) {
        return NextResponse.json({ error: "Missing request id" }, { status: 400 });
    }

    // Parse body
    let body: any;
    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const status = body?.status as unknown;
    const user_notes = body?.user_notes as unknown;

    // At least one valid field must be present
    const hasSomeField = typeof status !== "undefined" || typeof user_notes !== "undefined";
    if (!hasSomeField) {
        return NextResponse.json(
            { error: "Provide at least one of: status, user_notes" },
            { status: 400 }
        );
    }

    // Validate fields
    if (typeof status !== "undefined" && !isAllowedStatus(status)) {
        return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    if (typeof user_notes !== "undefined" && user_notes !== null && typeof user_notes !== "string") {
        return NextResponse.json({ error: "user_notes must be a string or null" }, { status: 400 });
    }

    // Fetch existing row (ownership check)
    const { error: existingError } = await supabase
        .from("deletion_requests")
        .select("id, user_id, status, completed_at, deletion_method")
        .eq("id", id)
        .eq("user_id", user.id)
        .single();

    // PGRST116 = no rows
    if (existingError) {
        if ((existingError as any).code === "PGRST116") {
            return NextResponse.json({ error: "Not found" }, { status: 404 });
        }
        console.error("Failed to fetch deletion request:", existingError);
        return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
    }

    // Build update payload
    const now = new Date().toISOString();
    const updatePayload: Record<string, any> = { updated_at: now };

    if (typeof status !== "undefined") {
        updatePayload.status = status;

        // Only auto-set completed_at when user marks completed
        if (status === "completed") {
            updatePayload.completed_at = now;
        }

        // MVP: if they move out of completed, keep completed_at (don’t destroy history)
        // If you ever want “undo completion” support, add an explicit flag like `clear_completed_at: true`.
    }

    if (typeof user_notes !== "undefined") {
        updatePayload.user_notes = user_notes;
    }

    const { data: updated, error: updateError } = await supabase
        .from("deletion_requests")
        .update(updatePayload)
        .eq("id", id)
        .eq("user_id", user.id)
        .select("*")
        .single();

    if (updateError) {
        console.error("Failed to update deletion request:", updateError);
        return NextResponse.json({ error: "Failed to update" }, { status: 500 });
    }

    return NextResponse.json({ deletionRequest: updated }, { status: 200 });
}