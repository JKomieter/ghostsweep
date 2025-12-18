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
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { Spinner } from "@/components/ui/spinner";
import type { Service, UserService, ServiceDeletionPlaybook } from "@/types";
import Input from "@/components/ui/input";

interface ModalProps {
    open: boolean;
    onOpenChangeAction: (open: boolean) => void;
    userService:
    | (UserService & {
        service: Service;
    })
    | null;
    gmailAddress: string;
    playbook: ServiceDeletionPlaybook | null | undefined;
}

type TemplateQueryResult = {
    subject: string;
    body: string;
};

export default function DeletionRequestEmailModal({
    open,
    onOpenChangeAction,
    userService,
    gmailAddress,
    playbook,
}: ModalProps) {
    const queryClient = useQueryClient();

    const serviceName = userService?.service?.name || "this service";
    const domain = userService?.service?.domain || "";
    const category = userService?.service?.category || "Other";

    // ✅ playbook is source of truth now
    const toAddress = playbook?.deletion_email ?? "";

    const { data: template, status } = useQuery<TemplateQueryResult>({
        queryKey: ["deletion_template", userService?.id],
        enabled: open && !!userService,
        queryFn: async () => {
            const res = await fetch(`/api/template/${userService?.id}`);
            if (!res.ok) throw new Error("Failed to fetch deletion email template");
            return res.json();
        },
        refetchOnWindowFocus: false,
    });

    const isLoadingTemplate = status === "pending";
    const isErrorTemplate = status === "error";

    // ✅ Editable fields
    const [subject, setSubject] = React.useState("");
    const [body, setBody] = React.useState("");

    // Prevent overwriting user edits if template refetches
    const didInitRef = React.useRef(false);

    React.useEffect(() => {
        if (!open) {
            // reset per-open (optional)
            didInitRef.current = false;
            setSubject("");
            setBody("");
            return;
        }

        if (!template) return;
        if (didInitRef.current) return;

        setSubject(template.subject ?? "");
        setBody(template.body ?? "");
        didInitRef.current = true;
    }, [open, template]);

    // Optional fallback: Gmail compose URL (use edited content)
    const gmailComposeUrl =
        subject && body && toAddress
            ? (() => {
                const params = new URLSearchParams({
                    to: toAddress,
                    su: subject,
                    body: body,
                });
                return `https://mail.google.com/mail/?view=cm&fs=1&${params.toString()}`;
            })()
            : "";

    // ✅ NEW: actually send email via your API (which also upserts deletion_requests)
    const sendMutation = useMutation({
        mutationFn: async () => {
            if (!userService?.id) throw new Error("Missing user service");
            if (!subject.trim() || !body.trim()) throw new Error("Subject/body required");
            if (!toAddress) throw new Error("No deletion email found in playbook");
            if (playbook?.deletion_method !== "email") {
                throw new Error("This service is not email-based");
            }

            const res = await fetch("/api/gmail/send_deletion_email", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    user_service_id: userService.id,
                    receiver_email: toAddress,
                    subject: subject,
                    template_used: body, // store exactly what was sent
                }),
            });

            const j = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(j?.error || "Failed to send email");
            return j;
        },
        onSuccess: async () => {
            toast.success("Sent! We’ll track replies for you.");
            onOpenChangeAction(false);

            await queryClient.invalidateQueries({
                queryKey: ["user_service_details", userService?.id],
            });
            await queryClient.invalidateQueries({ queryKey: ["user_services"] });
            await queryClient.invalidateQueries({ queryKey: ["deletion_requests"] });
        },
        onError: (e) => {
            toast.error("Couldn’t send email", {
                description: e?.message ?? "Try again.",
            });
        },
    });

    const canSend =
        !!userService &&
        !!playbook &&
        playbook.deletion_method === "email" &&
        !!toAddress &&
        !isLoadingTemplate &&
        !sendMutation.isPending &&
        !!subject.trim() &&
        !!body.trim();

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

                            {domain && <span className="text-xs text-muted-foreground">{domain}</span>}

                            <Badge
                                className={cn(
                                    "text-xs",
                                    userService?.service?.is_breached
                                        ? "bg-red-500/20 text-red-300 border-red-500/30"
                                        : "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                                )}
                            >
                                {userService?.service?.is_breached ? "Breached" : "No known breach"}
                            </Badge>
                        </div>

                        <p className="text-xs text-muted-foreground">
                            GhostSweep will send this email from your connected Gmail account and
                            create a deletion request so we can track replies.
                        </p>

                        {isErrorTemplate && (
                            <p className="text-[11px] text-red-400">
                                Couldn&apos;t load template. Try again, or use “Open in Gmail”.
                            </p>
                        )}

                        {playbook?.deletion_method !== "email" && (
                            <p className="text-[11px] text-amber-300">
                                This service isn’t email-based. Use the link/manual flow instead.
                            </p>
                        )}
                    </DialogDescription>
                </DialogHeader>

                {/* From + To */}
                <div className="mt-4 space-y-3 text-xs">
                    <div className="space-y-1">
                        <div className="text-[11px] uppercase tracking-wide text-muted-foreground">
                            From (connected Gmail)
                        </div>
                        <div className="rounded-md border border-white/10 bg-black/60 px-3 py-2 font-mono text-[11px] text-emerald-200">
                            {gmailAddress || "—"}
                        </div>
                    </div>

                    <div className="space-y-1">
                        <div className="text-[11px] uppercase tracking-wide text-muted-foreground">
                            To (from playbook)
                        </div>
                        <div className="rounded-md border border-white/10 bg-black/60 px-3 py-2 font-mono text-[11px] text-emerald-200">
                            {toAddress || "No deletion email in playbook yet"}
                        </div>
                    </div>

                    {/* ✅ Editable subject */}
                    <div className="space-y-1">
                        <div className="text-[11px] uppercase tracking-wide text-muted-foreground">
                            Subject (editable)
                        </div>
                        {isLoadingTemplate ? (
                            <div className="rounded-md border border-white/10 bg-black/60 px-3 py-2 font-mono text-[11px] text-slate-100">
                                <div className="flex flex-row gap-2 items-center">
                                    <Spinner fontSize={10} /> Generating subject…
                                </div>
                            </div>
                        ) : (
                            <Input
                                id="subject"
                                value={subject}
                                onChange={setSubject}
                                className="bg-black/60 border-white/10 text-[11px] font-mono"
                                placeholder="Subject will appear here"
                            />
                        )}
                    </div>
                </div>

                {/* ✅ Editable body */}
                <div className="mt-4 space-y-1">
                    <div className="text-[11px] uppercase tracking-wide text-muted-foreground">
                        Email body (editable)
                    </div>

                    {isLoadingTemplate ? (
                        <div className="rounded-md border border-white/10 bg-black/70 p-3 text-[11px] text-slate-100 font-mono">
                            <div className="flex flex-row items-center gap-2">
                                <Spinner /> <>Generating deletion request template…</>
                            </div>
                        </div>
                    ) : (
                        <Textarea
                            value={body}
                            onChange={(e) => setBody(e.target.value)}
                            className="min-h-[220px] max-h-64 bg-black/70 border-white/10 text-[11px] font-mono leading-relaxed text-slate-100"
                            placeholder="Email body will appear here."
                        />
                    )}
                </div>

                {/* Actions */}
                <div className="mt-5 flex items-center justify-between gap-3">
                    <p className="text-[11px] text-muted-foreground max-w-xs">
                        GhostSweep can send + track replies automatically. “Open in Gmail” is a
                        fallback.
                    </p>

                    <div className="flex gap-2">
                        <Button
                            size="sm"
                            className="shrink-0 bg-primary text-black hover:bg-primary/80"
                            onClick={() => sendMutation.mutate()}
                            disabled={!canSend}
                        >
                            {sendMutation.isPending ? (
                                <div className="flex flex-row gap-2 items-center">
                                    <Spinner /> <>Sending…</>
                                </div>
                            ) : (
                                "Send with GhostSweep"
                            )}
                        </Button>

                        <Link href={gmailComposeUrl || "#"} target="_blank" rel="noreferrer">
                            <Button size="sm" variant="outline" disabled={!gmailComposeUrl}>
                                Open in Gmail
                            </Button>
                        </Link>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}