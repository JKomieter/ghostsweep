/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import * as React from "react";
import Link from "next/link";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

import type { DeletionRequest, DeletionStatus, ServiceDeletionPlaybook } from "@/types";

// TODO: Finish follow up and also add the data deletion info

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

// -------------------------------
// New info helpers
// -------------------------------
type DataDeletionInfo = "deletes_data" | "archives_data" | "unclear" | null | undefined;

function deletionInfoLabel(v: DataDeletionInfo) {
    if (v === "deletes_data")
        return { label: "Deletes data", cls: "bg-emerald-500/15 text-emerald-200 border-emerald-500/30" };
    if (v === "archives_data")
        return { label: "Archives data", cls: "bg-amber-500/15 text-amber-200 border-amber-500/30" };
    return { label: "Unclear", cls: "bg-zinc-500/10 text-zinc-200 border-zinc-500/30" };
}

function difficultyBadge(d: string | null | undefined) {
    const v = (d ?? "").toLowerCase();
    if (v.includes("easy"))
        return { label: "Easy", cls: "bg-emerald-500/15 text-emerald-200 border-emerald-500/30" };
    if (v.includes("medium") || v.includes("moderate"))
        return { label: "Medium", cls: "bg-amber-500/15 text-amber-200 border-amber-500/30" };
    if (v.includes("hard") || v.includes("difficult"))
        return { label: "Hard", cls: "bg-red-500/15 text-red-200 border-red-500/30" };
    return { label: d ? d : "—", cls: "bg-zinc-500/10 text-zinc-200 border-zinc-500/30" };
}

function InfoColumns({
    dataDeletionInfo,
    deletionDifficulty,
    notes,
}: {
    dataDeletionInfo: DataDeletionInfo;
    deletionDifficulty: string | null | undefined;
    notes: string | null | undefined;
}) {
    const info = deletionInfoLabel(dataDeletionInfo);
    const diff = difficultyBadge(deletionDifficulty);

    return (
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-md border border-white/10 bg-black/60 p-3">
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Data deletion info</p>
                <div className="mt-2">
                    <Badge className={cn("text-[11px] border px-2 py-1 rounded-full", info.cls)}>{info.label}</Badge>
                </div>
            </div>

            <div className="rounded-md border border-white/10 bg-black/60 p-3">
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Deletion difficulty</p>
                <div className="mt-2">
                    <Badge className={cn("text-[11px] border px-2 py-1 rounded-full", diff.cls)}>{diff.label}</Badge>
                </div>
            </div>

            <div className="rounded-md border border-white/10 bg-black/60 p-3">
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Retention notes</p>
                <p className="mt-2 text-[11px] text-white/70 leading-relaxed">{notes?.trim() ? notes : "—"}</p>
            </div>
        </div>
    );
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

    // new: info columns pulled from playbook
    const notes = (playbook)?.data_retention_notes as string | null | undefined;
    const deletionDifficulty = (playbook)?.deletion_difficulty as string | null | undefined;
    const dataDeletionInfo = (playbook)?.data_deletion_info as DataDeletionInfo;

    const hasRequest = Boolean(request);
    const canAutomateEmail = currentPlan === "pro" && gmailConnected;

    const isEmailRequest = request?.deletion_method === "email";
    const isLinkRequest = request?.deletion_method === "link";

    const followUpText = `We recommend following up in ${followUpDays} days if there’s no reply.`;
    const nextFollowAt = request?.next_follow_up_at ?? (request?.sent_at ? addDaysISO(request.sent_at, followUpDays) : null);

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
        if (!userServiceId) throw new Error("Missing userServiceId");

        const res = await fetch(`/api/deletion_requests/post`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                user_service_id: userServiceId,
                deletion_method: method,
                // optional snapshots
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

        toast(() => (
            <div className="space-y-1">
                <p className="text-sm font-medium text-white">
                    Want GhostSweep to handle the follow-ups?
                </p>
                <p className="text-xs text-zinc-400">
                    Upgrade to track deletion status, get automatic follow-ups, breach alert, and priority email support.
                </p>
            </div>
        ))
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
            await ensureRequestExists("link");
            window.open(playbook.deletion_url, "_blank", "noopener,noreferrer");
        } catch (e: any) {
            toast.error("Could not start deletion", { description: e?.message ?? "Try again." });
        }
    };

    const viewManualGuide = async () => {
        try {
            await ensureRequestExists("manual");
            const el = document.getElementById("gs-quick-steps");
            el?.scrollIntoView({ behavior: "smooth", block: "start" });
        } catch (e: any) {
            toast.error("Could not start deletion", { description: e?.message ?? "Try again." });
        }
    };

    const handlePrimaryAction = () => {
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
                await patchRequest({ status });
                toast.success("Status updated");
                return;
            }

            await ensureRequestExists("manual");
            toast.message("Started tracking", { description: "Now update the status again." });

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
    // Follow-up (Dialog + gating)
    // ---------------------------
    const [followUpOpen, setFollowUpOpen] = React.useState(false);
    const [followUpDraft, setFollowUpDraft] = React.useState("");
    const [sendingFollowUp, setSendingFollowUp] = React.useState(false);

    const followUpAllowedStatuses: DeletionStatus[] = ["sent", "received", "needs_verification", "in_progress"];

    const canSendFollowUpNow =
        Boolean(request?.id) &&
        request?.deletion_method === "email" &&
        canAutomateEmail &&
        followUpAllowedStatuses.includes(request!.status) &&
        (request!.follow_up_count ?? 0) < 3;

    const buildFollowUpMessage = () => {
        const svc = serviceName || "this service";
        return `
Hello,

I'm following up on my previous data deletion request for ${svc} sent earlier.

Please confirm receipt and let me know the current status of my request.

Thank you,
${request?.sender_email ?? ""}
`.trim();
    };

    const openFollowUpDialog = () => {
        if (!request?.id) return;

        if (!canAutomateEmail) {
            toast.message("Follow-ups are Pro + Gmail", {
                description: "Upgrade to Pro and connect Gmail to send follow-ups.",
            });
            return;
        }

        const count = request.follow_up_count ?? 0;

        if (request.deletion_method !== "email") {
            toast.error("Follow-ups only apply to email deletion requests.");
            return;
        }

        if (!followUpAllowedStatuses.includes(request.status)) {
            toast.error("Follow-up not allowed for this status.");
            return;
        }

        if (count >= 3) {
            toast.error("Maximum number of follow-ups reached (3).");
            return;
        }

        setFollowUpDraft(buildFollowUpMessage());
        setFollowUpOpen(true);
    };

    const sendFollowUpNow = async () => {
        if (!request?.id) return;

        try {
            setSendingFollowUp(true);

            const message = followUpDraft.trim();
            if (!message) {
                toast.error("Message is empty.");
                return;
            }

            if (onSendFollowUp) {
                await onSendFollowUp();
            } else {
                const res = await fetch(`/api/deletion_requests/follow_up`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ body: message, deletion_request_id: request.id }),
                });

                if (!res.ok) {
                    const j = await res.json().catch(() => ({}));
                    throw new Error(j?.error || "Failed to send follow-up");
                }
            }

            toast.success("Follow-up sent");
            setFollowUpOpen(false);
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
            <>
                <div className="space-y-4 text-sm">
                    <div className="rounded-lg border border-white/10 bg-black/40 p-4">
                        <h3 className="text-sm font-semibold text-white">Deletion</h3>

                        <p className="mt-1 text-xs text-muted-foreground">
                            {playbookMethod === "link" && "This service supports deletion via a link."}
                            {playbookMethod === "email" && "This service supports deletion via an email request."}
                            {playbookMethod === "manual" && "This service requires manual deletion steps."}
                            {!playbookMethod && "Start deletion with our guide, link, or email template (if available)."}
                        </p>

                        <InfoColumns
                            dataDeletionInfo={dataDeletionInfo}
                            deletionDifficulty={deletionDifficulty}
                            notes={notes}
                        />

                        <div className="mt-4 flex flex-wrap gap-2">
                            <Button
                                size="sm"
                                onClick={handlePrimaryAction}
                                className="bg-red-500/80 text-black hover:bg-red-500"
                            >
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
                            MVP: you’ll manually set statuses (completed/failed/etc). If you send an email through GhostSweep, we’ll
                            record it and (optionally) notify you when a reply is detected.
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

                                <Button
                                    size="sm"
                                    variant="ghost"
                                    className="text-[11px]"
                                    onClick={() => setIsDeletionProfileModalOpen(true)}
                                >
                                    Set up deletion profile
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Follow-up dialog (won't open without request) */}
                <Dialog open={followUpOpen} onOpenChange={setFollowUpOpen}>
                    <DialogContent className="sm:max-w-[640px]">
                        <DialogHeader>
                            <DialogTitle>Preview follow-up email</DialogTitle>
                            <DialogDescription>Review the message GhostSweep will send. You can edit it before sending.</DialogDescription>
                        </DialogHeader>

                        <div className="space-y-2">
                            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Message</p>
                            <Textarea
                                value={followUpDraft}
                                onChange={(e) => setFollowUpDraft(e.target.value)}
                                className="min-h-[220px] bg-black/60 border-white/10 text-sm"
                                placeholder="Type your follow-up message…"
                            />
                            <p className="text-[11px] text-white/50">Tip: Keep it short. Don’t attach ID unless they asked for it.</p>
                        </div>

                        <DialogFooter>
                            <Button variant="outline" onClick={() => setFollowUpOpen(false)} disabled={sendingFollowUp}>
                                Cancel
                            </Button>
                            <Button onClick={sendFollowUpNow} disabled={sendingFollowUp}>
                                {sendingFollowUp ? "Sending…" : "Send follow-up"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </>
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
        <>
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
                                <Button size="sm" variant="outline" onClick={openFollowUpDialog} disabled={!canSendFollowUpNow}>
                                    Send follow-up
                                </Button>
                            )}

                            {hasLink && !isLinkRequest && (
                                <Button size="sm" variant="outline" onClick={() => void openDeletionPage()}>
                                    Open deletion page
                                </Button>
                            )}
                        </div>
                    </div>

                    <InfoColumns
                        dataDeletionInfo={dataDeletionInfo}
                        deletionDifficulty={deletionDifficulty}
                        notes={notes}
                    />

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
                                    <span className="ml-2 text-white/80">{request!.gmail_message_id ? "✓ email linked" : "— no gmail message id yet"}</span>
                                </p>

                                {!canAutomateEmail && (
                                    <p className="mt-2 text-[11px] text-muted-foreground">
                                        For auto-follow-ups and reply tracking, connect Gmail and upgrade to Pro.
                                    </p>
                                )}

                                <p className="mt-2 text-[11px] text-white/40">
                                    Follow-ups: {Math.min(request!.follow_up_count ?? 0, 3)}/3
                                </p>
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
                            You can revoke Google access anytime. If this service uses “Sign in with Google”, removing access there can also help cut off data
                            sharing.
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

            {/* FOLLOW-UP DIALOG */}
            <Dialog open={followUpOpen} onOpenChange={setFollowUpOpen}>
                <DialogContent className="sm:max-w-[640px]">
                    <DialogHeader>
                        <DialogTitle>Preview follow-up email</DialogTitle>
                        <DialogDescription>Review the message GhostSweep will send. You can edit it before sending.</DialogDescription>
                    </DialogHeader>

                    <div className="space-y-2">
                        <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Message</p>
                        <Textarea
                            value={followUpDraft}
                            onChange={(e) => setFollowUpDraft(e.target.value)}
                            className="min-h-[220px] bg-black/60 border-white/10 text-sm"
                            placeholder="Type your follow-up message…"
                        />
                        <p className="text-[11px] text-white/50">Tip: Keep it short. Don’t attach ID unless they asked for it.</p>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setFollowUpOpen(false)} disabled={sendingFollowUp}>
                            Cancel
                        </Button>
                        <Button onClick={sendFollowUpNow} disabled={sendingFollowUp}>
                            {sendingFollowUp ? "Sending…" : "Send follow-up"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}