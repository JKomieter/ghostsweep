"use client";

import * as React from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { toast } from "sonner";
import { UserServiceQueryResult } from "./service-details";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { Spinner } from "@/components/ui/spinner";

interface ModalProps {
    open: boolean;
    onOpenChangeAction: (open: boolean) => void;
    userService: UserServiceQueryResult | undefined;
    gmailAddress: string;
}

type TemplateQueryResult = {
    subject: string;
    body: string;
};

export default function DeletionEmailModal({
    open,
    onOpenChangeAction,
    userService,
    gmailAddress,
}: ModalProps) {
    const queryClient = useQueryClient()
    const [markingSent, setMarkingSent] = useState(false);

    const serviceName = userService?.service.name || "this service";
    const domain = userService?.service.domain || "";
    const category = userService?.service.category || "Other";

    // Best-guess contact address
    const toAddress = userService?.service.contact ?? "";

    const {
        data: template,
        status,
    } = useQuery<TemplateQueryResult>({
        queryKey: ["deletion-template", serviceName, domain],
        enabled: open && !!userService, // only fetch when modal is open and service exists
        queryFn: async () => {
            const params = new URLSearchParams({
                serviceName,
                domain,
            });

            const res = await fetch(
                `/api/generate-deletion-request-email-template?${params.toString()}`
            );

            if (!res.ok) {
                throw new Error("Failed to fetch deletion email template");
            }

            return res.json();
        },
    });

    const isLoadingTemplate = status === "pending";
    const isErrorTemplate = status === "error";

    const handleMarkSent = useMutation({
        mutationFn: async () => {
            if (!userService) return;
            setMarkingSent(true);
            const res = await fetch("/api/send-deletion-request", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    user_service_id: userService.id,
                    to_address: toAddress || null,
                    subject: template?.subject,
                }),
            });

            return res
        },
        onSuccess: () => {
            toast.success("Request marked as sent. We’ll track replies for you.");
            onOpenChangeAction(false);
            queryClient.invalidateQueries({ queryKey: ["serviceDetails", userService?.service_id] })
        },
        onError: (error) => {
            console.error(error);
            toast.error("Couldn’t save request. Try again.");
        },
        onSettled: () => {
            setMarkingSent(false);
        }
    })

    // Build Gmail compose URL only when we have a template + contact email
    const gmailComposeUrl =
        template && toAddress
            ? (() => {
                const params = new URLSearchParams({
                    to: toAddress,
                    su: template.subject,
                    body: template.body,
                });
                // Standard Gmail web compose URL
                return `https://mail.google.com/mail/?view=cm&fs=1&${params.toString()}`;
            })()
            : "";

    return (
        <Dialog open={open} onOpenChange={onOpenChangeAction}>
            <DialogContent className="sm:max-w-lg bg-[#050505] border border-white/10">
                <DialogHeader className="space-y-2">
                    <DialogTitle className="flex flex-col gap-1">
                        <span className="text-xs uppercase tracking-wide text-muted-foreground">
                            Privacy request email
                        </span>
                        <span className="text-lg font-semibold">{serviceName}</span>
                    </DialogTitle>
                    <DialogDescription className="space-y-2">
                        <div className="flex flex-wrap gap-2 items-center">
                            <Badge
                                variant="outline"
                                className="capitalize text-xs text-muted-foreground"
                            >
                                {category}
                            </Badge>
                            {domain && (
                                <span className="text-xs text-muted-foreground">{domain}</span>
                            )}
                            <Badge
                                className={cn(
                                    "text-xs",
                                    userService?.service.is_breached
                                        ? "bg-red-500/20 text-red-300 border-red-500/30"
                                        : "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                                )}
                            >
                                {userService?.service.is_breached
                                    ? "Breached"
                                    : "No known breach"}
                            </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            This is a ready-to-send email you can use to contact {serviceName}{" "}
                            about your data. Send it from the Gmail account shown below so we
                            can track replies correctly.
                        </p>
                        {isErrorTemplate && (
                            <p className="text-[11px] text-red-400">
                                Couldn&apos;t load template. You can still send your own email
                                and mark the request as sent.
                            </p>
                        )}
                    </DialogDescription>
                </DialogHeader>

                {/* From + To + Subject */}
                <div className="mt-4 space-y-3 text-xs">
                    <div className="space-y-1">
                        <div className="text-[11px] uppercase tracking-wide text-muted-foreground">
                            From (in Gmail)
                        </div>
                        <div className="rounded-md border border-white/10 bg-black/60 px-3 py-2 font-mono text-[11px] text-emerald-200">
                            {gmailAddress}
                        </div>
                    </div>

                    <div className="space-y-1">
                        <div className="text-[11px] uppercase tracking-wide text-muted-foreground">
                            To
                        </div>
                        <div className="rounded-md border border-white/10 bg-black/60 px-3 py-2 font-mono text-[11px] text-emerald-200">
                            {toAddress || "No contact address found"}
                        </div>
                    </div>

                    <div className="space-y-1">
                        <div className="text-[11px] uppercase tracking-wide text-muted-foreground">
                            Subject
                        </div>
                        <div className="rounded-md border border-white/10 bg-black/60 px-3 py-2 font-mono text-[11px] text-slate-100">
                            {isLoadingTemplate
                                ? (
                                    <div className="flex flex-row gap-2 items-center">
                                        <Spinner fontSize={10} /> Generating subject…
                                    </div>
                                )
                                : template?.subject || "Subject will appear here"}
                        </div>
                    </div>
                </div>

                {/* Body */}
                <div className="mt-4 space-y-1">
                    <div className="text-[11px] uppercase tracking-wide text-muted-foreground">
                        Email body
                    </div>
                    <div className="max-h-64 overflow-auto rounded-md border border-white/10 bg-black/70 p-3">
                        <pre className="whitespace-pre-wrap wrap-break-word font-mono text-[11px] leading-relaxed text-slate-100">
                            {isLoadingTemplate
                                ? (
                                    <div className="flex flex-row items-center gap-2">
                                        <Spinner /> <>Generating deletion request template…</>
                                    </div>
                                )
                                : template?.body || "Email body will appear here."}
                        </pre>
                    </div>
                </div>

                {/* Actions */}
                <div className="mt-5 flex items-center justify-between gap-3">
                    <p className="text-[11px] text-muted-foreground max-w-xs">
                        GhostSweep does not send this email for you. When Gmail opens, make
                        sure it shows{" "}
                        <span className="font-mono">{gmailAddress}</span> in the From field
                        before sending.
                    </p>
                    <div className="flex gap-2">
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleMarkSent.mutateAsync()}
                            disabled={markingSent || !userService}
                        >
                            {markingSent ? (
                                <div className="flex flex-row gap-2 items-center">
                                    <Spinner /> <>Saving...</>
                                </div>
                            ) : "I sent it"}
                        </Button>

                        <Link
                            href={gmailComposeUrl || "#"}
                            target="_blank"
                            rel="noreferrer"
                        >
                            <Button
                                size="sm"
                                className="shrink-0 bg-primary text-black hover:bg-primary/80"
                                disabled={
                                    isLoadingTemplate || !template || !toAddress || !gmailComposeUrl
                                }
                            >
                                Send via Gmail
                            </Button>
                        </Link>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}