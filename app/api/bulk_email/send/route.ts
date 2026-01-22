/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest } from "next/server";
import { createClient } from "@/utils/supabase/server";
import sendEmail from "@/utils/send_email";
import { decryptToken } from "@/utils/token_crypto";
import { tokenStillValid, refreshAccessToken } from "@/utils/refresh_access_token";

function sendSSE(controller: ReadableStreamDefaultController, data: any) {
    const encoder = new TextEncoder();
    controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
}

function renderTemplate(template: string, vars: Record<string, string>) {
    // {VAR_NAME} replacement (e.g. {SERVICE_NAME})
    return template.replace(/\{([A-Z0-9_]+)\}/g, (_, key) => {
        const v = vars[key];
        return typeof v === "string" ? v : "";
    });
}

type DeletionMethod = "email" | "link" | "manual";

const REQUIRED_KEYS = ["SERVICE_NAME", "USER_EMAIL"] as const;

function assertTemplateHasRequiredPlaceholders(subject: string, body: string) {
    // Since you lock the core block on the frontend, this should always pass.
    // But keep minimal safety.
    const missing: string[] = [];
    for (const k of REQUIRED_KEYS) {
        const token = `{${k}}`;
        if (!subject.includes(token) && !body.includes(token)) missing.push(token);
    }
    return missing;
}

export async function POST(req: NextRequest) {
    const supabase = await createClient();

    // 1) Auth
    const {
        data: { user },
        error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
            status: 401,
            headers: { "Content-Type": "application/json" },
        });
    }

    // 2) Input
    const json = await req.json().catch(() => null);
    const userServiceIds = Array.isArray(json?.user_service_ids) ? (json.user_service_ids as string[]) : [];
    const masterSubject = String(json?.master_subject ?? "").trim();
    const masterBody = String(json?.master_body ?? "").trim();

    if (!userServiceIds.length) {
        return new Response(JSON.stringify({ error: "user_service_ids is required" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
        });
    }
    if (!masterSubject || !masterBody) {
        return new Response(JSON.stringify({ error: "master_subject and master_body are required" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
        });
    }

    // Optional sanity: ensure placeholders exist somewhere
    const missing = assertTemplateHasRequiredPlaceholders(masterSubject, masterBody);
    if (missing.length) {
        return new Response(
            JSON.stringify({
                error: "Template missing required placeholders",
                missing,
            }),
            { status: 400, headers: { "Content-Type": "application/json" } }
        );
    }

    // 3) Pro gate
    const { data: sub, error: subErr } = await supabase
        .from("user_subscriptions")
        .select("current_plan")
        .eq("user_id", user.id)
        .maybeSingle();

    if (subErr) {
        return new Response(JSON.stringify({ error: "Failed to check plan" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }

    const currentPlan = (sub?.current_plan ?? "free") as "free" | "pro";
    if (currentPlan !== "pro") {
        return new Response(JSON.stringify({ error: "Professional plan required", code: "PLAN_REQUIRED" }), {
            status: 402,
            headers: { "Content-Type": "application/json" },
        });
    }

    // 4) Gmail account
    const { data: gmailAccount, error: gmailErr } = await supabase
        .from("gmail_accounts")
        .select("gmail_address, refresh_token_encrypted, access_token_encrypted, token_expires_at")
        .eq("user_id", user.id)
        .maybeSingle();

    if (gmailErr) {
        console.error("[bulk_email] Failed to load Gmail account:", gmailErr);
        return new Response(JSON.stringify({ error: "Failed to load Gmail connection" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }

    if (!gmailAccount?.gmail_address || !gmailAccount.refresh_token_encrypted) {
        console.warn("[bulk_email] Gmail account not connected for user:", user.id);
        return new Response(JSON.stringify({ error: "Gmail not connected" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
        });
    }

    // Decrypt and refresh tokens if needed
    let accessToken: string;
    try {
        accessToken = decryptToken(gmailAccount.access_token_encrypted as string);
        const refreshToken = decryptToken(gmailAccount.refresh_token_encrypted as string);

        if (!tokenStillValid(gmailAccount.token_expires_at as string | null)) {
            console.log("[bulk_email] Token expired, refreshing...");
            const refreshed = await refreshAccessToken(refreshToken);
            accessToken = refreshed.access_token;

            const newExpiresAt = new Date(Date.now() + Number(refreshed.expires_in) * 1000).toISOString();
            const { error: updateErr } = await supabase
                .from("gmail_accounts")
                .update({ token_expires_at: newExpiresAt })
                .eq("user_id", user.id);

            if (updateErr) {
                console.error("[bulk_email] Failed to update token expiry:", updateErr);
            }
        }
    } catch (err: any) {
        console.error("[bulk_email] Token decryption/refresh failed:", err);
        return new Response(JSON.stringify({ error: "Token error. Please reconnect Gmail." }), {
            status: 401,
            headers: { "Content-Type": "application/json" },
        });
    }

    // 5) Load user_services + service info (must belong to user)
    const { data: userServices, error: usErr } = await supabase
        .from("user_services")
        .select(
            `
        id,
        service_id,
        service:services!inner (
          id,
          name,
          domain
        )
      `
        )
        .eq("user_id", user.id)
        .in("id", userServiceIds);

    if (usErr) {
        return new Response(JSON.stringify({ error: "Failed to load user services" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }

    if (!userServices?.length) {
        console.warn("[bulk_email] No services found for user:", user.id, "IDs:", userServiceIds);
        return new Response(JSON.stringify({ error: "No services found" }), {
            status: 404,
            headers: { "Content-Type": "application/json" },
        });
    }

    // 6) Fetch playbooks for these services (email only)
    const serviceIds = Array.from(new Set((userServices as any[]).map((r) => r.service_id).filter(Boolean)));

    const { data: playbooks, error: pbErr } = await supabase
        .from("service_deletion_playbooks")
        .select("service_id, deletion_method, deletion_email")
        .in("service_id", serviceIds);

    if (pbErr) {
        return new Response(JSON.stringify({ error: "Failed to load deletion playbooks" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }

    const pbByServiceId = new Map<string, { deletion_method: DeletionMethod; deletion_email: string | null }>();
    for (const pb of playbooks ?? []) {
        pbByServiceId.set(pb.service_id, {
            deletion_method: pb.deletion_method as DeletionMethod,
            deletion_email: pb.deletion_email,
        });
    }

    // 7) Filter to email-capable
    const emailCapable = (userServices as any[])
        .map((row) => {
            const svc = row.service;
            const pb = pbByServiceId.get(row.service_id);
            const ok = pb?.deletion_method === "email" && !!pb?.deletion_email;

            return {
                user_service_id: row.id as string,
                service_id: row.service_id as string,
                service_name: String(svc?.name ?? "Unknown service"),
                service_domain: String(svc?.domain ?? ""),
                deletion_email: ok ? (pb!.deletion_email as string) : null,
            };
        })
        .filter((x) => !!x.deletion_email);

    if (!emailCapable.length) {
        console.warn("[bulk_email] No email-capable services found for user:", user.id);
        return new Response(JSON.stringify({ error: "No email-based services found for these selections" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
        });
    }

    console.log("[bulk_email] Starting bulk email send for user:", user.id, "Services:", emailCapable.length);

    // 8) SSE stream: send emails, then upsert deletion_requests AFTER success
    const stream = new ReadableStream({
        async start(controller) {
            let completed = 0;
            let failed = 0;
            let cancelled = false;

            const total = emailCapable.length;

            const onAbort = () => {
                cancelled = true;
                sendSSE(controller, { type: "cancelled", completed, failed, total });
                controller.close();
            };

            req.signal.addEventListener("abort", onAbort);

            try {
                sendSSE(controller, { type: "start", total });

                for (let i = 0; i < emailCapable.length; i++) {
                    if (cancelled) break;

                    const item = emailCapable[i];

                    sendSSE(controller, {
                        type: "progress",
                        current: i + 1,
                        total,
                        user_service_id: item.user_service_id,
                        serviceName: item.service_name,
                        status: "sending",
                    });

                    try {
                        // Variables for deterministic rendering
                        const vars = {
                            SERVICE_NAME: item.service_name,
                            SERVICE_DOMAIN: item.service_domain,
                            USER_EMAIL: gmailAccount.gmail_address,
                        };

                        const renderedSubject = renderTemplate(masterSubject, vars).trim();
                        const renderedBody = renderTemplate(masterBody, vars).trim();

                        if (!renderedSubject || !renderedBody) {
                            throw new Error("Rendered subject/body is empty (template/vars issue)");
                        }

                        // Send email
                        console.log(`[bulk_email] Sending email to ${item.deletion_email} for service: ${item.service_name}`);
                        const { id: gmailMessageId, threadId } = await sendEmail({
                            accessToken,
                            to: item.deletion_email!,
                            from: gmailAccount.gmail_address,
                            subject: renderedSubject,
                            body: renderedBody,
                        });

                        // Create deletion_request AFTER email is sent
                        const now = new Date().toISOString();
                        const nextFollowUpAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

                        const { error: drErr } = await supabase
                            .from("deletion_requests")
                            .upsert(
                                {
                                    user_id: user.id,
                                    user_service_id: item.user_service_id,
                                    sender_email: gmailAccount.gmail_address,
                                    receiver_email: item.deletion_email,
                                    gmail_message_id: gmailMessageId,
                                    thread_id: threadId ?? null,
                                    template_used: renderedBody,
                                    status: "sent",
                                    deletion_method: "email",
                                    sent_at: now,
                                    follow_up_count: 0,
                                    next_follow_up_at: nextFollowUpAt,
                                    updated_at: now,
                                },
                                { onConflict: "user_id,user_service_id" }
                            );

                        if (drErr) {
                            console.error(`[bulk_email] Failed to upsert deletion_request for service ${item.service_name}:`, drErr);
                        } else {
                            console.log(`[bulk_email] Deletion request created for ${item.service_name}`);
                        }

                        completed++;
                        sendSSE(controller, {
                            type: "success",
                            current: i + 1,
                            total,
                            user_service_id: item.user_service_id,
                            serviceName: item.service_name,
                            gmailMessageId,
                        });

                        // tiny delay to be polite
                        if (i < emailCapable.length - 1 && !cancelled) {
                            await new Promise((r) => setTimeout(r, 150));
                        }
                    } catch (err: any) {
                        failed++;
                        const errorMsg = err?.message ?? "Failed";
                        console.error(`[bulk_email] Error sending email for ${item.service_name}:`, err);
                        sendSSE(controller, {
                            type: "error",
                            current: i + 1,
                            total,
                            user_service_id: item.user_service_id,
                            serviceName: item.service_name,
                            error: errorMsg,
                        });
                    }
                }

                if (!cancelled) {
                    console.log(`[bulk_email] Bulk send complete - Completed: ${completed}, Failed: ${failed}`);
                    sendSSE(controller, { type: "complete", completed, failed, total });
                }
            } catch (err: any) {
                console.error("[bulk_email] Fatal error:", err);
                sendSSE(controller, { type: "fatal", error: err?.message ?? "System error" });
            } finally {
                req.signal.removeEventListener("abort", onAbort);
                if (!cancelled) controller.close();
            }
        },
    });

    return new Response(stream, {
        headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache, no-transform",
            Connection: "keep-alive",
        },
    });
}