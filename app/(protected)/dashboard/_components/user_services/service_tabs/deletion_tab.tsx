/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import * as React from "react";
import Link from "next/link";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

import type { DeletionRequest, DeletionStatus, ServiceDeletionPlaybook } from "@/types";

interface DeletionRequestsTabProps {
    userServiceId: string | undefined; // ✅ REQUIRED so we can create a request row on link/manual actions

    serviceName: string | null | undefined;
    request?: DeletionRequest | null;

    /** Opens your deletion request modal (preview email template then send) */
    openModal: () => void;

    /** Opens deletion profile modal */
    setIsDeletionProfileModalOpen: React.Dispatch<React.SetStateAction<boolean>>;

    /** CTA label from parent (optional) */
    primaryActionLabel?: string;

    currentPlan?: "free" | "pro";
    gmailConnected?: boolean;

    /** Optional: status-only update callback (legacy). */
    onSetStatus?: (status: DeletionStatus) => Promise<void>;

    /** The service deletion playbook containing deletion_url + steps + deletion_email + method */
    serviceDeletionPlaybook: ServiceDeletionPlaybook | null | undefined;

    /** MVP: follow-up cadence not stored in DB. Default 7 days. */
    followUpDays?: number;

    /**
     * Optional: generic patcher for the deletion request row (if you want parent to handle react-query invalidation).
     * If not provided, this component will call the API directly.
     */
    onUpdateRequest?: (patch: Partial<DeletionRequest>) => Promise<void>;

    /** Optional: follow-up sender (placeholder). Only relevant for email requests. */
    onSendFollowUp?: () => Promise<void>;
}

function statusConfig(status: DeletionStatus) {
    switch (status) {
        case "drafted":
            return {
                label: "Draft",
                className: "bg-zinc-500/10 text-zinc-200 border-zinc-500/30",
                description: "Drafted but not sent yet.",
            };
        case "sent":
            return {
                label: "Sent",
                className: "bg-blue-500/15 text-blue-200 border-blue-500/30",
                description: "Request recorded. GhostSweep will watch for replies.",
            };
        case "received":
            return {
                label: "Reply received",
                className: "bg-indigo-500/15 text-indigo-200 border-indigo-500/30",
                description: "We detected a reply. Review it and update status if needed.",
            };
        case "needs_verification":
            return {
                label: "Needs verification",
                className: "bg-amber-500/15 text-amber-200 border-amber-500/30",
                description: "They likely need more info or identity verification.",
            };
        case "in_progress":
            return {
                label: "In progress",
                className: "bg-cyan-500/15 text-cyan-200 border-cyan-500/30",
                description: "Deletion is underway. Mark completed when finished.",
            };
        case "completed":
            return {
                label: "Completed",
                className: "bg-emerald-500/15 text-emerald-200 border-emerald-500/30",
                description: "Marked as deleted/fulfilled.",
            };
        case "failed":
            return {
                label: "Failed / refused",
                className: "bg-red-500/15 text-red-200 border-red-500/30",
                description: "Company refused or the request failed.",
            };
        case "expired":
            return {
                label: "Expired",
                className: "bg-zinc-700/40 text-zinc-200 border-zinc-500/40",
                description: "No response in the typical window. Consider following up.",
            };
        default:
            return {
                label: status,
                className: "bg-zinc-500/10 text-zinc-200 border-zinc-500/30",
                description: "",
            };
    }
}

function formatDateSafe(value: string | null) {
    if (!value) return "—";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "—";
    return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

function addDaysISO(iso: string, days: number) {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return null;
    d.setDate(d.getDate() + days);
    return d.toISOString();
}

export default function DeletionTab({
    userServiceId,
    serviceName,
    request,
    openModal,
    setIsDeletionProfileModalOpen,
    primaryActionLabel,
    currentPlan = "free",
    gmailConnected = false,
    onSetStatus,
    serviceDeletionPlaybook,
    followUpDays = 7,
    onUpdateRequest,
    onSendFollowUp,
}: DeletionRequestsTabProps) {
    const googlePermissionsUrl = "https://myaccount.google.com/permissions";

    const playbook = serviceDeletionPlaybook ?? null;
    const playbookMethod = playbook?.deletion_method ?? null; // email | link | manual
    const hasLink = Boolean(playbook?.deletion_url);
    const steps = playbook?.steps ?? null;

    const hasRequest = Boolean(request);
    const canAutomateEmail = currentPlan === "pro" && gmailConnected;

    const isEmailRequest = request?.deletion_method === "email";
    const isLinkRequest = request?.deletion_method === "link";
    
    const followUpText = `We recommend following up in ${followUpDays} days if there’s no reply.`;
    const nextFollowAt =
        request?.next_follow_up_at ?? (request?.sent_at ? addDaysISO(request.sent_at, followUpDays) : null);

    // ---------------------------
    // API helpers
    // ---------------------------
    const patchRequest = async (patch: Partial<DeletionRequest>) => {
        if (!request?.id) throw new Error("No request id to patch");

        if (onUpdateRequest) {
            await onUpdateRequest(patch);
            return;
        }

        const res = await fetch(`/api/deletion_requests/patch/${request.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(patch),
        });

        if (!res.ok) {
            const j = await res.json().catch(() => ({}));
            throw new Error(j?.error || "Failed to update request");
        }
    };

    /**
     * Ensures a deletion_request row exists for link/manual actions.
     * Uses POST /api/deletion_requests/post (your upsert endpoint).
     */
    const ensureRequestExists = async (method: "link" | "manual") => {
        if (request?.id) return; // already exists

        const res = await fetch(`/api/deletion_requests/post`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                user_service_id: userServiceId,
                deletion_method: method,
                // optional snapshots (nice for debugging)
                deletion_url: playbook?.deletion_url ?? null,
                receiver_email: playbook?.deletion_email ?? null,
                sender_email: null,
                template_used: null,
                gmail_message_id: null,
                user_notes: null,
            }),
        });

        if (!res.ok) {
            const j = await res.json().catch(() => ({}));
            throw new Error(j?.error || "Failed to create deletion request");
        }
    };

    // ---------------------------
    // Actions
    // ---------------------------
    const openDeletionPage = async () => {
        if (!playbook?.deletion_url) {
            toast.error("No deletion link available yet.");
            return;
        }

        try {
            // ✅ create request row if none (link-based attempt)
            await ensureRequestExists("link");
            window.open(playbook.deletion_url, "_blank", "noopener,noreferrer");
        } catch (e: any) {
            toast.error("Could not start deletion", { description: e?.message ?? "Try again." });
        }
    };

    const viewManualGuide = async () => {
        try {
            // ✅ create request row if none (manual-based attempt)
            await ensureRequestExists("manual");
            const el = document.getElementById("gs-quick-steps");
            el?.scrollIntoView({ behavior: "smooth", block: "start" });
        } catch (e: any) {
            toast.error("Could not start deletion", { description: e?.message ?? "Try again." });
        }
    };

    const handlePrimaryAction = () => {
        // If no request yet, use playbook method as truth.
        const method = request?.deletion_method ?? playbookMethod;

        if (method === "link") {
            void openDeletionPage();
            return;
        }

        if (method === "manual") {
            void viewManualGuide();
            return;
        }

        // email => open modal (preview + send)
        openModal();
    };

    const runSetStatus = async (status: DeletionStatus) => {
        try {
            if (request?.id) {
                // ✅ backend PATCH route should set timestamps for completed/failed etc.
                await patchRequest({ status });
                toast.success("Status updated");
                return;
            }

            // No request row yet: for MVP, create manual attempt then update status.
            await ensureRequestExists("manual");
            toast.message("Started tracking", { description: "Now update the status again." });

            // fallback legacy
            if (onSetStatus) await onSetStatus(status);
        } catch (e: any) {
            toast.error("Could not update status", { description: e?.message ?? "Try again." });
        }
    };

    // ---------------------------
    // Notes (stored in deletion_requests.user_notes)
    // ---------------------------
    const [userNotes, setUserNotes] = React.useState<string>(request?.user_notes ?? "");
    const [savingNotes, setSavingNotes] = React.useState(false);
    const lastSavedRef = React.useRef<string>(request?.user_notes ?? "");

    React.useEffect(() => {
        const next = request?.user_notes ?? "";
        setUserNotes(next);
        lastSavedRef.current = next;
    }, [request?.id, request?.user_notes]);

    const saveNotes = async () => {
        if (!request?.id) {
            toast.message("Start deletion first", {
                description: "Open the link, view the guide, or send the email to create a tracked request.",
            });
            return;
        }

        const trimmed = userNotes.trim();
        if (trimmed === (lastSavedRef.current ?? "")) return;

        try {
            setSavingNotes(true);
            await patchRequest({ user_notes: trimmed });
            lastSavedRef.current = trimmed;
            toast.success("Notes saved");
        } catch (e: any) {
            toast.error("Could not save notes", { description: e?.message ?? "Try again." });
        } finally {
            setSavingNotes(false);
        }
    };

    // ---------------------------
    // Follow-up (email-only placeholder)
    // ---------------------------
    const [sendingFollowUp, setSendingFollowUp] = React.useState(false);

    const sendFollowUp = async () => {
        if (!request?.id) return;

        if (!canAutomateEmail) {
            toast.message("Follow-ups are Pro + Gmail", { description: "Keep this as a Pro feature for MVP." });
            return;
        }

        try {
            setSendingFollowUp(true);

            if (onSendFollowUp) {
                await onSendFollowUp();
            } else {
                // Placeholder endpoint you can implement later
                const res = await fetch(`/api/deletion_requests/${request.id}/follow_up`, { method: "POST" });
                if (!res.ok) {
                    const j = await res.json().catch(() => ({}));
                    throw new Error(j?.error || "Failed to send follow-up");
                }
            }

            toast.success("Follow-up sent");
        } catch (e: any) {
            toast.error("Could not send follow-up", { description: e?.message ?? "Try again." });
        } finally {
            setSendingFollowUp(false);
        }
    };

    const resolvedPrimaryLabel =
        primaryActionLabel ??
        (playbookMethod === "link"
            ? "Open deletion page"
            : playbookMethod === "manual"
                ? "View deletion guide"
                : "Preview & send email");

    // ---------------------------
    // NO REQUEST YET
    // ---------------------------
    if (!hasRequest) {
        return (
            <div className="space-y-4 text-sm">
                <div className="rounded-lg border border-white/10 bg-black/40 p-4">
                    <h3 className="text-sm font-semibold text-white">Deletion</h3>

                    <p className="mt-1 text-xs text-muted-foreground">
                        {playbookMethod === "link" && "This service supports deletion via a link."}
                        {playbookMethod === "email" && "This service supports deletion via an email request."}
                        {playbookMethod === "manual" && "This service requires manual deletion steps."}
                        {!playbookMethod && "Start deletion with our guide, link, or email template (if available)."}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-2">
                        <Button size="sm" onClick={handlePrimaryAction} className="bg-red-500/80 text-black hover:bg-red-500">
                            {resolvedPrimaryLabel}
                        </Button>

                        {hasLink && (
                            <Button size="sm" variant="outline" onClick={() => void openDeletionPage()}>
                                Open deletion page
                            </Button>
                        )}
                    </div>

                    {!!steps?.length && (
                        <div id="gs-quick-steps" className="mt-4 rounded-md border border-white/10 bg-black/60 p-3">
                            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Quick steps</p>
                            <ol className="mt-2 list-decimal space-y-1 pl-4 text-[11px] text-white/80">
                                {steps.slice(0, 10).map((s, i) => (
                                    <li key={`${s}-${i}`}>{s}</li>
                                ))}
                            </ol>
                        </div>
                    )}

                    <p className="mt-3 text-[11px] text-muted-foreground">
                        MVP: you’ll manually set statuses (completed/failed/etc). If you send an email through GhostSweep, we’ll record it and
                        (optionally) notify you when a reply is detected.
                    </p>

                    <Separator className="my-4 bg-white/10" />

                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-[11px] text-muted-foreground max-w-xs">
                            You can revoke Google access anytime, and set up a deletion profile to auto-fill future requests.
                        </p>

                        <div className="flex flex-wrap gap-2">
                            <Button size="sm" variant="outline" className="text-[11px]" asChild>
                                <Link href={googlePermissionsUrl} target="_blank" rel="noreferrer">
                                    Review Google connections
                                </Link>
                            </Button>

                            <Button size="sm" variant="ghost" className="text-[11px]" onClick={() => setIsDeletionProfileModalOpen(true)}>
                                Set up deletion profile
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // ---------------------------
    // REQUEST EXISTS
    // ---------------------------
    const cfg = statusConfig(request!.status);

    const methodLabel =
        request!.deletion_method === "link"
            ? "Link"
            : request!.deletion_method === "email"
                ? "Email"
                : request!.deletion_method === "manual"
                    ? "Manual"
                    : "—";

    return (
        <div className="space-y-4 text-sm">
            <div className="rounded-lg border border-white/10 bg-black/40 p-4">
                <div className="flex items-start justify-between gap-3">
                    <div>
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">Deletion request</p>
                        <h3 className="mt-1 text-sm font-semibold text-white">
                            {serviceName || "This service"} — delete my account & personal data
                        </h3>
                    </div>

                    <Badge className={cn("text-[11px] border px-2 py-1 rounded-full", cfg.className)}>{cfg.label}</Badge>
                </div>

                <p className="mt-2 text-xs text-muted-foreground">{cfg.description}</p>

                <Separator className="my-3 bg-white/10" />

                {/* Action row */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="text-[11px] text-muted-foreground">
                        Method: <span className="text-white/80">{methodLabel}</span>
                        {isEmailRequest && <span className="ml-2 text-white/60">• {followUpText}</span>}
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <Button
                            size="sm"
                            onClick={handlePrimaryAction}
                            className="bg-red-500/80 text-black hover:bg-red-500"
                            disabled={isLinkRequest && !hasLink}
                        >
                            {resolvedPrimaryLabel}
                        </Button>

                        {isEmailRequest && (
                            <Button size="sm" variant="outline" onClick={sendFollowUp} disabled={!canAutomateEmail || sendingFollowUp}>
                                {sendingFollowUp ? "Sending…" : "Send follow-up"}
                            </Button>
                        )}

                        {hasLink && !isLinkRequest && (
                            <Button size="sm" variant="outline" onClick={() => void openDeletionPage()}>
                                Open deletion page
                            </Button>
                        )}
                    </div>
                </div>

                {!!steps?.length && (
                    <div id="gs-quick-steps" className="mt-4 rounded-md border border-white/10 bg-black/60 p-3">
                        <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Quick steps</p>
                        <ol className="mt-2 list-decimal space-y-1 pl-4 text-[11px] text-white/80">
                            {steps.slice(0, 10).map((s, i) => (
                                <li key={`${s}-${i}`}>{s}</li>
                            ))}
                        </ol>
                    </div>
                )}

                {/* Email details (ONLY for email requests) */}
                {isEmailRequest && (
                    <>
                        <div className="mt-4 grid grid-cols-1 gap-3 text-xs sm:grid-cols-2">
                            <div className="space-y-1">
                                <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Receiver</p>
                                <p className="font-mono text-[11px] text-emerald-200 break-all">{request!.receiver_email || "—"}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Sender</p>
                                <p className="font-mono text-[11px] text-slate-100 break-all">{request!.sender_email || "—"}</p>
                            </div>

                            <div className="space-y-1">
                                <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Sent at</p>
                                <p className="text-[11px] text-slate-100">{formatDateSafe(request!.sent_at)}</p>
                            </div>

                            <div className="space-y-1">
                                <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Next follow-up (recommended)</p>
                                <p className="text-[11px] text-slate-100">{formatDateSafe(nextFollowAt)}</p>
                            </div>
                        </div>

                        <div className="mt-4 rounded-md border border-white/10 bg-black/60 p-3">
                            <p className="text-[11px] text-muted-foreground">
                                Tracking:
                                <span className="ml-2 text-white/80">
                                    {request!.gmail_message_id ? "✓ email linked" : "— no gmail message id yet"}
                                </span>
                            </p>

                            {!canAutomateEmail && (
                                <p className="mt-2 text-[11px] text-muted-foreground">
                                    For auto-follow-ups and reply tracking, connect Gmail and upgrade to Pro.
                                </p>
                            )}
                        </div>
                    </>
                )}

                {/* Manual status controls */}
                <Separator className="my-4 bg-white/10" />
                <div className="space-y-2">
                    <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Manual status</p>
                    <p className="text-[11px] text-muted-foreground">
                        MVP: you confirm the final status. If we detect a reply, we notify you — you update status here.
                    </p>

                    <div className="flex flex-wrap gap-2">
                        <Button size="sm" variant="outline" onClick={() => void runSetStatus("completed")}>
                            Mark completed
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => void runSetStatus("failed")}>
                            Mark failed
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => void runSetStatus("in_progress")}>
                            Mark in progress
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => void runSetStatus("needs_verification")}>
                            Needs verification
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => void runSetStatus("received")}>
                            Reply received
                        </Button>
                    </div>
                </div>

                {/* User notes */}
                <Separator className="my-4 bg-white/10" />
                <div className="space-y-2">
                    <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Your notes</p>
                    <p className="text-[11px] text-muted-foreground">
                        Optional. Track what happened (support response, verification requested, confirmation received, etc).
                    </p>

                    <textarea
                        className="w-full min-h-[90px] rounded-md border border-white/10 bg-black/60 p-2 text-xs text-white placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-primary"
                        placeholder="Example: Got a response asking for ID verification."
                        value={userNotes}
                        onChange={(e) => setUserNotes(e.target.value)}
                        onBlur={() => void saveNotes()}
                        disabled={savingNotes}
                    />

                    <div className="flex items-center justify-between">
                        <p className="text-[11px] text-white/40">{savingNotes ? "Saving…" : "Auto-saves when you click away."}</p>

                        <Button size="sm" variant="outline" className="text-[11px]" onClick={() => void saveNotes()} disabled={savingNotes}>
                            Save notes
                        </Button>
                    </div>
                </div>

                {/* Gmail revoke + profile */}
                <Separator className="my-4 bg-white/10" />
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-[11px] text-muted-foreground max-w-xs">
                        You can revoke Google access anytime. If this service uses “Sign in with Google”, removing access there can also help cut off
                        data sharing.
                    </p>

                    <div className="flex flex-wrap gap-2">
                        <Button size="sm" variant="outline" className="text-[11px]" asChild>
                            <Link href={googlePermissionsUrl} target="_blank" rel="noreferrer">
                                Revoke Google connection
                            </Link>
                        </Button>

                        <Button size="sm" variant="ghost" className="text-[11px]" onClick={() => setIsDeletionProfileModalOpen(true)}>
                            Update deletion profile
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}