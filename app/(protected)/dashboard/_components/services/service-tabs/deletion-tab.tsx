"use client";
import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { DeletionStatus } from "@/types";
import Link from "next/link";

export interface DeletionRequest {
    id: string;
    status: DeletionStatus;
    to_address: string | null;
    subject: string | null;
    sent_at: string | null;
    last_reply_at: string | null;
    reply_snippet: string | null;
}

interface DeletionRequestsTabProps {
    serviceName: string | null;
    request?: DeletionRequest | null;
    openModal: () => void;
    setIsDeletionProfileModalOpen: React.Dispatch<React.SetStateAction<boolean>>
}

function statusConfig(status: DeletionStatus) {
    switch (status) {
        case "drafted":
            return {
                label: "Draft (not sent)",
                className: "bg-zinc-500/10 text-zinc-200 border-zinc-500/30",
                description:
                    "You copied a template but haven’t marked this as sent yet.",
            };
        case "sent":
            return {
                label: "Sent – awaiting reply",
                className: "bg-blue-500/15 text-blue-200 border-blue-500/30",
                description:
                    "Your email appears sent. GhostSweep is watching for replies.",
            };
        case "received":
            return {
                label: "Reply received",
                className: "bg-indigo-500/15 text-indigo-200 border-indigo-500/30",
                description:
                    "We found a reply from this company. Review it below.",
            };
        case "needs_verification":
            return {
                label: "Needs identity verification",
                className: "bg-amber-500/15 text-amber-200 border-amber-500/30",
                description:
                    "They likely need more info or ID before proceeding. Check their message.",
            };
        case "in_progress":
            return {
                label: "In progress",
                className: "bg-cyan-500/15 text-cyan-200 border-cyan-500/30",
                description:
                    "The company acknowledged your request and says it’s being processed.",
            };
        case "completed":
            return {
                label: "Completed – data removed",
                className: "bg-emerald-500/15 text-emerald-200 border-emerald-500/30",
                description:
                    "They claim your data/account has been deleted or fulfilled.",
            };
        case "failed":
            return {
                label: "Failed / refused",
                className: "bg-red-500/15 text-red-200 border-red-500/30",
                description:
                    "The company appears to have refused or failed your request.",
            };
        case "expired":
            return {
                label: "Expired (no response)",
                className: "bg-zinc-700/40 text-zinc-200 border-zinc-500/40",
                description:
                    "No clear reply within the typical 30-day window. You may want to follow up.",
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
    return d.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
}

export function DeletionTab({
    serviceName,
    request,
    openModal,
    setIsDeletionProfileModalOpen,
}: DeletionRequestsTabProps) {
    const hasRequest = !!request;

    // 🔗 Constant for Google’s connected-apps page
    const googlePermissionsUrl =
        "https://myaccount.google.com/permissions";

    if (!hasRequest) {
        return (
            <div className="space-y-4 text-sm">
                <div className="rounded-lg border border-white/10 bg-black/40 p-4">
                    <h3 className="text-sm font-semibold text-white">
                        No deletion requests yet
                    </h3>
                    <p className="mt-1 text-xs text-muted-foreground">
                        GhostSweep can help you exercise your{" "}
                        <span className="font-medium">Right to be Forgotten</span> and
                        reduce how much of your data{" "}
                        {serviceName || "this service"} keeps. Start by generating a
                        ready-to-send email.
                    </p>

                    <div className="mt-4 flex flex-wrap gap-2">
                        <Button
                            size="sm"
                            onClick={openModal}
                            className="bg-red-500/80 text-black hover:bg-red-500"
                        >
                            Request deletion of my data
                        </Button>
                    </div>

                    <p className="mt-3 text-[11px] text-muted-foreground">
                        GhostSweep will track replies to your request and update the
                        status automatically so you don’t have to dig through your inbox.
                    </p>

                    {/* Extra controls: Google access + deletion profile */}
                    <Separator className="my-4 bg-white/10" />

                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-[11px] text-muted-foreground max-w-xs">
                            If you think this might be a third-party app connected to your
                            Google account, you can review your Google connections. You can
                            also set up a deletion profile so future templates auto-fill
                            your preferences.
                        </p>

                        <div className="flex flex-wrap gap-2">
                            <Button
                                size="sm"
                                variant="outline"
                                className="text-[11px]"
                                asChild
                            >
                                <Link
                                    href={googlePermissionsUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                >
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
        );
    }

    // There is an existing privacy request
    const cfg = statusConfig(request.status);

    return (
        <div className="space-y-4 text-sm">
            <div className="rounded-lg border border-white/10 bg-black/40 p-4">
                <div className="flex items-start justify-between gap-3">
                    <div>
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">
                            Current deletion request
                        </p>
                        <h3 className="mt-1 text-sm font-semibold text-white">
                            Delete my account & personal data
                        </h3>
                    </div>

                    <Badge
                        className={cn(
                            "text-[11px] border px-2 py-1 rounded-full",
                            cfg.className,
                        )}
                    >
                        {cfg.label}
                    </Badge>
                </div>

                <p className="mt-2 text-xs text-muted-foreground">
                    {cfg.description}
                </p>

                <Separator className="my-3 bg-white/10" />

                <div className="grid grid-cols-1 gap-3 text-xs sm:grid-cols-2">
                    <div className="space-y-1">
                        <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                            To
                        </p>
                        <p className="font-mono text-[11px] text-emerald-200 break-all">
                            {request.to_address || "—"}
                        </p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                            Subject
                        </p>
                        <p className="font-mono text-[11px] text-slate-100">
                            {request.subject || "—"}
                        </p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                            Sent at
                        </p>
                        <p className="text-[11px] text-slate-100">
                            {formatDateSafe(request.sent_at)}
                        </p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                            Last company reply
                        </p>
                        <p className="text-[11px] text-slate-100">
                            {formatDateSafe(request.last_reply_at)}
                        </p>
                    </div>
                </div>

                {request.reply_snippet && (
                    <div className="mt-4 space-y-1">
                        <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                            Latest reply snippet
                        </p>
                        <div className="rounded-md border border-white/10 bg-black/60 p-3">
                            <p className="text-[11px] leading-relaxed text-slate-100">
                                {request.reply_snippet}
                            </p>
                        </div>
                    </div>
                )}

                <div className="mt-4 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <p className="text-[11px] text-muted-foreground max-w-xs">
                            GhostSweep checks your inbox regularly for updates and will move
                            this request through the lifecycle as companies reply.
                        </p>

                        <div className="flex flex-wrap gap-2">
                            {request.status === "drafted" && (
                                <Button
                                    size="sm"
                                    className="bg-blue-500/80 text-black hover:bg-blue-500"
                                >
                                    I’ve sent this email
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Extra controls: Google access + deletion profile */}
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-[11px] text-muted-foreground max-w-xs">
                            If you suspect this service might be connected via “Sign in with
                            Google”, you can review which apps currently have access to your
                            Google account. You can also set up a deletion profile so future
                            requests use the same preferences automatically.
                        </p>

                        <div className="flex flex-wrap gap-2">
                            <Button
                                size="sm"
                                variant="outline"
                                className="text-[11px]"
                                asChild
                            >
                                <Link
                                    href={googlePermissionsUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                >
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
        </div>
    );
}