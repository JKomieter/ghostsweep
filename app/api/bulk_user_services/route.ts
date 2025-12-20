// app/api/bulk_deletions/resolve/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { ServiceDeletionPlaybook } from "@/types";

type DeletionMethod = "email" | "link" | "manual";

function isUuid(s: string) {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(s);
}

function parseIdsFromRequest(req: NextRequest): string[] {
    const { searchParams } = new URL(req.url);

    // supports:
    // 1) ?ids=a,b,c
    // 2) ?ids=a&ids=b&ids=c
    const raw = searchParams.getAll("ids").filter(Boolean);

    // If someone passed ?ids=a,b,c then raw === ["a,b,c"]
    // If someone passed repeated ids, raw === ["a","b","c"]
    const flattened = raw
        .flatMap((val) => val.split(",")) // ✅ split even "repeated" values if they contain commas
        .map((s) => s.trim())
        .filter(Boolean);

    // ✅ only keep valid UUIDs to avoid 22P02
    const ids = Array.from(new Set(flattened.filter(isUuid)));

    return ids;
}

export async function GET(req: NextRequest) {
    try {
        const supabase = await createClient();

        // 1) Auth
        const {
            data: { user },
            error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // 2) IDs
        const userServiceIds = parseIdsFromRequest(req);

        if (userServiceIds.length === 0) {
            return NextResponse.json(
                { error: "ids is required and must contain valid UUIDs", code: "MISSING_OR_INVALID_IDS" },
                { status: 400 }
            );
        }

        // (optional) cap for safety
        if (userServiceIds.length > 200) {
            return NextResponse.json(
                { error: "Too many ids. Max 200 per request.", code: "TOO_MANY_IDS" },
                { status: 400 }
            );
        }

        // 3) Load user_services (must belong to user)
        // ✅ keep this minimal (add fields if your UI needs them)
        const { data: userServices, error: usErr } = await supabase
            .from("user_services")
            .select(
                `
        id,
        user_id,
        service_id,
        first_seen_at,
        last_seen_at,
        email_count,
        service:services!inner (
          id,
          name,
          domain,
          category,
          logo_url
        )
      `
            )
            .eq("user_id", user.id)
            .in("id", userServiceIds);

        if (usErr) {
            console.error("Error loading user_services:", usErr);
            return NextResponse.json(
                { error: "Failed to load user services", code: "USER_SERVICES_FETCH_ERROR" },
                { status: 500 }
            );
        }

        const rows = userServices ?? [];

        // Preserve user's requested order (optional)
        const order = new Map<string, number>();
        userServiceIds.forEach((id, idx) => order.set(id, idx));
        rows.sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0));

        // 4) Fetch playbooks for those services (GLOBAL playbook keyed by service_id)
        const serviceIds = Array.from(new Set(rows.map((r) => r.service_id).filter(Boolean)));

        const { data: playbooks, error: pbErr } = await supabase
            .from("service_deletion_playbooks")
            .select(
                `
                service_id,
                deletion_method,
                deletion_email,
                deletion_url,
                steps
            `
            )
            .in("service_id", serviceIds);

        if (pbErr && pbErr.code !== "PGRST116") {
            console.error("Error loading service_deletion_playbooks:", pbErr);
            return NextResponse.json(
                { error: "Failed to load deletion playbooks", code: "PLAYBOOK_FETCH_ERROR" },
                { status: 500 }
            );
        }

        const playbookByServiceId = new Map<string, Pick<ServiceDeletionPlaybook, "service_id" | "deletion_url" | "deletion_email" | "steps" | "deletion_method">>();
        for (const pb of playbooks ?? []) playbookByServiceId.set(pb.service_id, pb);

        // 5) Group into email/link/manual
        const email = [];
        const link = [];
        const manual = [];

        for (const us of rows) {
            const pb = playbookByServiceId.get((us).service_id);

            // Default = manual
            let method: DeletionMethod = "manual";

            if (pb?.deletion_method === "email" && pb?.deletion_email) method = "email";
            else if (pb?.deletion_method === "link" && pb?.deletion_url) method = "link";
            else method = "manual";

            const enriched = {
                ...us,
                playbook: pb
                    ? {
                        deletion_method: pb.deletion_method as DeletionMethod,
                        deletion_email: pb.deletion_email as string | null,
                        deletion_url: pb.deletion_url as string | null,
                        steps: (pb.steps ?? []) as string[],
                    }
                    : null,
                resolved_method: method,
            };

            if (method === "email") email.push(enriched);
            else if (method === "link") link.push(enriched);
            else manual.push(enriched);
        }

        return NextResponse.json(
            {
                inputCount: userServiceIds.length,
                foundCount: rows.length,
                grouped: {
                    email,
                    link,
                    manual,
                },
                counts: {
                    email: email.length,
                    link: link.length,
                    manual: manual.length,
                    total: email.length + link.length + manual.length,
                },
                missingIds: userServiceIds.filter((id) => !rows.some((r) => r.id === id)),
            },
            { status: 200 }
        );
    } catch (err) {
        console.error("Error in /api/bulk_deletions/resolve:", err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}