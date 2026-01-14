// app/api/opt-out-requests/[requestId]/route.ts
import { NextRequest } from "next/server";
import { createClient } from "@/utils/supabase/server";

const VALID_STATUSES = ["completed", "failed"] as const;

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ requestId: string }> }
) {
    const requestId = (await params).requestId;
    const supabase = await createClient();

    // 1) Auth
    const {
        data: { user },
        error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = user.id;

    const { status, notes } = await req.json();

    // Build update object with only provided fields
    const updateData: { status?: string; notes?: string | null } = {};

    if (status !== undefined) {
        // if status is not a type of OptOutRequestStatus
        if (!VALID_STATUSES.includes(status)) {
            return Response.json({ error: "Invalid status" }, { status: 400 });
        }
        updateData.status = status;
    }

    if (notes !== undefined) {
        updateData.notes = notes || null;
    }

    // Return early if no fields to update
    if (Object.keys(updateData).length === 0) {
        return Response.json({ error: "No fields to update" }, { status: 400 });
    }

    const { data, error } = await supabase
        .from("opt_out_requests")
        .update(updateData)
        .eq("id", requestId)
        .eq("user_id", userId) // Ensure user owns this request
        .select()
        .single();

    if (error) {
        return Response.json({ error: "Failed to update request" }, { status: 500 });
    }

    return Response.json({ success: true, request: data });
}