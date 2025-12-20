import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/utils/supabase/server";

const BodySchema = z.object({
    user_service_ids: z.array(z.string().min(1)).min(1),
});

export async function POST(req: NextRequest) {
    const supabase = await createClient();

    const {
        data: { user },
        error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const json = await req.json().catch(() => null);
    const parsed = BodySchema.safeParse(json);
    if (!parsed.success) {
        return NextResponse.json(
            { error: "Invalid payload", details: parsed.error.flatten() },
            { status: 400 }
        );
    }

    // Ensure user owns these services
    const { data: owned, error: ownedErr } = await supabase
        .from("user_services")
        .select("id")
        .eq("user_id", user.id)
        .in("id", parsed.data.user_service_ids);

    if (ownedErr) {
        return NextResponse.json({ error: "Failed to verify services" }, { status: 500 });
    }

    const ownedIds = new Set((owned ?? []).map((r) => r.id));
    const safeIds = parsed.data.user_service_ids.filter((id) => ownedIds.has(id));

    if (safeIds.length === 0) {
        return NextResponse.json({ error: "No matching services found" }, { status: 404 });
    }

    // Create/update deletion_requests for link method.
    // Only mark "in_progress" since user must complete form manually.
    const now = new Date().toISOString();
    const payload = safeIds.map((id) => ({
        user_id: user.id,
        user_service_id: id,
        deletion_method: "link",
        status: "in_progress",
        updated_at: now,
    }));

    const { error: upsertErr } = await supabase
        .from("deletion_requests")
        .upsert(payload, { onConflict: "user_id,user_service_id" });

    if (upsertErr) {
        return NextResponse.json({ error: "Failed to create deletion requests" }, { status: 500 });
    }

    return NextResponse.json({ ok: true, createdFor: safeIds.length }, { status: 200 });
}