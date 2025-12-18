import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import type { ServiceDeletionPlaybook } from "@/types";

type DeletionMethod = "email" | "link" | "manual";

export async function POST(req: NextRequest) {
    const supabase = await createClient();

    const {
        data: { user },
        error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => null);

    const user_service_ids = Array.isArray(body?.user_service_ids)
        ? (body.user_service_ids as string[])
        : [];

    const subject_rendered = String(body?.subject_rendered ?? "").trim();
    const body_rendered = String(body?.body_rendered ?? "").trim();

    if (user_service_ids.length === 0) {
        return NextResponse.json({ error: "user_service_ids is required" }, { status: 400 });
    }
    // if (!subject_rendered || !body_rendered) {
    //     return NextResponse.json(
    //         { error: "subject_rendered and body_rendered are required" },
    //         { status: 400 }
    //     );
    // }

    // ✅ Pro gate
    const { data: sub, error: subErr } = await supabase
        .from("user_subscriptions")
        .select("current_plan")
        .eq("user_id", user.id)
        .maybeSingle();

    if (subErr) return NextResponse.json({ error: "Failed to fetch plan" }, { status: 500 });

    const currentPlan = (sub?.current_plan ?? "free") as "free" | "pro";
    if (currentPlan !== "pro") {
        return NextResponse.json(
            { error: "Bulk deletion is Pro-only", code: "PLAN_REQUIRED" },
            { status: 402 }
        );
    }

    // the the user's gmail
    const { data: gmailAcc, error: gmailAccErr } = await supabase
        .from("gmail_accounts")
        .select("gmail_address")
        .eq("user_id", user.id)
        .maybeSingle();

    if (gmailAccErr || !gmailAcc) return NextResponse.json({ error: "Your gmail is not connected" }, { status: 500 });

    // 1) Load selected user_services (must belong to user)
    const { data: userServices, error: usErr } = await supabase
        .from("user_services")
        .select("id, service_id")
        .eq("user_id", user.id)
        .in("id", user_service_ids);

    if (usErr) return NextResponse.json({ error: "Failed to load user services" }, { status: 500 });

    const allowed = userServices ?? [];
    const filteredIds = user_service_ids.filter((id) => allowed.some((r) => r.id === id));

    if (filteredIds.length === 0) {
        return NextResponse.json({ error: "No matching services found" }, { status: 404 });
    }

    const serviceIds = Array.from(new Set(allowed.map((r) => r.service_id).filter(Boolean)));

    // 2) Fetch playbooks by service_id
    const { data: playbooks, error: pbErr } = await supabase
        .from("service_deletion_playbooks")
        .select("service_id, deletion_method, deletion_email, deletion_url")
        .in("service_id", serviceIds);

    if (pbErr) return NextResponse.json({ error: "Failed to load playbooks" }, { status: 500 });

    const playbookByServiceId = new Map<string, Pick<ServiceDeletionPlaybook,
        "service_id" | "deletion_method" | "deletion_email" | "deletion_url"
    >>();

    for (const pb of playbooks ?? []) playbookByServiceId.set(pb.service_id, pb);

    // 3) classify
    const classified = allowed
        .filter((r) => filteredIds.includes(r.id))
        .map((r) => {
            const pb = playbookByServiceId.get(r.service_id);

            let method: DeletionMethod = "manual";
            if (pb?.deletion_method === "email" && pb?.deletion_email) method = "email";
            else if (pb?.deletion_method === "link" && pb?.deletion_url) method = "link";
            else method = "manual";

            return { user_service_id: r.id, service_id: r.service_id, method };
        });

    const emailItems = classified.filter((x) => x.method === "email");
    const linkItems = classified.filter((x) => x.method === "link");
    const manualItems = classified.filter((x) => x.method === "manual");

    // 4) Upsert deletion_requests for all selected services (unique)
    // IMPORTANT: for email sending you said "to address is in deletion_request"
    // so here we should populate receiver_email using the playbook's deletion_email.
    // (Otherwise the worker has nothing to send to.)
    const upsertPayload = classified.map((x) => {
        const pb = playbookByServiceId.get(x.service_id);
        return {
            user_id: user.id,
            user_service_id: x.user_service_id,
            deletion_method: x.method,
            status: "drafted",
            receiver_email: pb?.deletion_email ?? null, // <-- key
            sender_email: gmailAcc.gmail_address
        };
    });

    const { data: deletionRequests, error: drErr } = await supabase
        .from("deletion_requests")
        .upsert(upsertPayload, { onConflict: "user_id,user_service_id" })
        .select("id,user_service_id,deletion_method,receiver_email");

    if (drErr) return NextResponse.json({ error: "Failed to upsert deletion requests" }, { status: 500 });

    const drByUserServiceId = new Map<string, string>();
    for (const dr of deletionRequests ?? []) drByUserServiceId.set(dr.user_service_id, dr.id);

    // 5) Create run (store rendered subject/body here)
    const { data: run, error: runErr } = await supabase
        .from("bulk_deletion_runs")
        .insert({
            user_id: user.id,
            status: "ready",
            total_items: classified.length,
            email_count: emailItems.length,
            link_count: linkItems.length,
            manual_count: manualItems.length,
            subject_rendered,
            body_rendered,
        })
        .select("id")
        .single();

    if (runErr || !run) {
        return NextResponse.json({ error: "Failed to create run" }, { status: 500 });
    }

    // 6) Insert email queue items ONLY (no to address / no subject/body)
    const emailQueuePayload = emailItems.map((x) => ({
        user_id: user.id,
        run_id: run.id,
        deletion_request_id: drByUserServiceId.get(x.user_service_id)!,
        status: "queued",
        sent_at: null,
        error: null,
    }));

    if (emailQueuePayload.length > 0) {
        const { error: itemsErr } = await supabase.from("bulk_deletion_items").insert(emailQueuePayload);
        if (itemsErr) {
            return NextResponse.json({ error: "Failed to create bulk deletion items" }, { status: 500 });
        }
    }

    return NextResponse.json(
        {
            runId: run.id,
            breakdown: { email: emailItems.length, link: linkItems.length, manual: manualItems.length },
            nextUrl: `/dashboard/bulk-deletions/${run.id}`,
        },
        { status: 201 }
    );
}