import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/utils/supabase/server";

const BodySchema = z.object({
    run_id: z.string().uuid().optional(), // optional, you can ignore it in MVP
    user_service_ids: z.array(z.string().uuid()).min(1),
    status: z.enum(["ready", "in_progress", "done", "skipped"]),
});

function mapToDeletionStatus(s: "ready" | "in_progress" | "done" | "skipped") {
    switch (s) {
        case "done":
            return "completed" as const;
        case "in_progress":
            return "in_progress" as const;
        case "ready":
        case "skipped":
        default:
            return "drafted" as const;
    }
}

export async function POST(req: NextRequest) {
    const supabase = await createClient();

    // 1) Auth
    const {
        data: { user },
        error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2) Validate input
    const parsed = BodySchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) {
        return NextResponse.json(
            { error: "Invalid payload", issues: parsed.error.flatten() },
            { status: 400 }
        );
    }

    const { user_service_ids, status } = parsed.data;

    // 3) Pro gate
    const { data: sub, error: subErr } = await supabase
        .from("user_subscriptions")
        .select("current_plan")
        .eq("user_id", user.id)
        .maybeSingle();

    if (subErr) {
        return NextResponse.json({ error: "Failed to check plan" }, { status: 500 });
    }

    const currentPlan = (sub?.current_plan ?? "free") as "free" | "pro";
    if (currentPlan !== "pro") {
        return NextResponse.json(
            { error: "Professional plan required", code: "PLAN_REQUIRED" },
            { status: 402 }
        );
    }

    // 4) Ensure the selected user_services belong to the user
    const { data: owned, error: ownedErr } = await supabase
        .from("user_services")
        .select("id")
        .eq("user_id", user.id)
        .in("id", user_service_ids);

    if (ownedErr) {
        return NextResponse.json({ error: "Failed to load user services" }, { status: 500 });
    }

    const ownedIds = new Set((owned ?? []).map((r) => r.id));
    const safeIds = user_service_ids.filter((id) => ownedIds.has(id));

    if (safeIds.length === 0) {
        return NextResponse.json({ error: "No matching user services found" }, { status: 404 });
    }

    // 5) Upsert deletion_requests for manual flow
    const now = new Date().toISOString();
    const deletionStatus = mapToDeletionStatus(status);

    const upsertPayload = safeIds.map((user_service_id) => ({
        user_id: user.id,
        user_service_id,
        deletion_method: "manual" as const,
        status: deletionStatus,
        updated_at: now,
        completed_at: deletionStatus === "completed" ? now : null,
    }));

    const { error: upsertErr } = await supabase
        .from("deletion_requests")
        .upsert(upsertPayload, { onConflict: "user_id,user_service_id" });

    if (upsertErr) {
        return NextResponse.json(
            { error: "Failed to update deletion requests" },
            { status: 500 }
        );
    }

    return NextResponse.json(
        {
            ok: true,
            updated: safeIds.length,
            applied_status: deletionStatus,
            ignored: user_service_ids.length - safeIds.length,
        },
        { status: 200 }
    );
}