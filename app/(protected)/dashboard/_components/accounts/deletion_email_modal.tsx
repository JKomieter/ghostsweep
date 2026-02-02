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
import Input from "@/components/ui/input";

type DeletionPlaybook = {
    id: string;
    deletion_url: string | null;
    deletion_email: string | null;
    deletion_method: "self_service" | "email" | "form" | "support" | "not_possible" | "manual" | null;
    deletion_difficulty: "easy" | "medium" | "hard" | "very_hard" | null;
    steps: Array<string | { step: number; title: string; description: string }> | null;
    data_retention_notes: string | null;
    data_deletion_info: string | null;
    identity_verification_notes: string | null;
    subject_suggestion: string | null;
    confidence: number | null;
};

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    accountId: string;
    serviceName: string;
    domain: string;
    category: string;
    isBreached: boolean;
    userEmail: string | null;
    playbook: DeletionPlaybook | null;
}

type TemplateQueryResult = {
    subject: string;
    body: string;
};

export default function DeletionEmailModal({
    open,
    onOpenChange,
    accountId,
    serviceName,
    domain,
    category,
    isBreached,
    userEmail,
    playbook,
}: Props) {
    const queryClient = useQueryClient();

    const toAddress = playbook?.deletion_email ?? "";

    // Fetch email template
    const { data: template, status } = useQuery<TemplateQueryResult>({
        queryKey: ["deletion_template", accountId],
        enabled: open && !!accountId,
        queryFn: async () => {
            const res = await fetch(`/api/template/${accountId}`);
            if (!res.ok) throw new Error("Failed to fetch deletion email template");
            return res.json();
        },
        refetchOnWindowFocus: false,
    });

    const isLoadingTemplate = status === "pending";
    const isErrorTemplate = status === "error";

    // Editable fields
    const [subject, setSubject] = React.useState("");
    const [body, setBody] = React.useState("");

    // Prevent overwriting user edits if template refetches
    const didInitRef = React.useRef(false);

    React.useEffect(() => {
        if (!open) {
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

    // Gmail compose URL fallback
    const composeUrl =
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

    // Send email via API
    const sendMutation = useMutation({
        mutationFn: async () => {
            if (!accountId) throw new Error("Missing account ID");
            if (!subject.trim() || !body.trim()) throw new Error("Subject/body required");
            if (!toAddress) throw new Error("No deletion email found in playbook");

            const res = await fetch("/api/gmail/send_deletion_email", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    user_service_id: accountId,
                    receiver_email: toAddress,
                    subject: subject,
                    template_used: body,
                }),
            });

            const j = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(j?.error || "Failed to send email");
            return j;
        },
        onSuccess: async () => {
            toast.success("Sent! We'll track replies for you.");
            onOpenChange(false);

            await queryClient.invalidateQueries({ queryKey: ["account_details", accountId] });
            await queryClient.invalidateQueries({ queryKey: ["accounts"] });
            await queryClient.invalidateQueries({ queryKey: ["deletion_requests"] });
        },
        onError: (e) => {
            toast.error("Couldn't send email", {
                description: e?.message ?? "Try again.",
            });
        },
    });

    const canSend =
        !!accountId &&
        !!toAddress &&
        !isLoadingTemplate &&
        !sendMutation.isPending &&
        !!subject.trim() &&
        !!body.trim();

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
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
                                    isBreached
                                        ? "bg-red-500/20 text-red-300 border-red-500/30"
                                        : "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                                )}
                            >
                                {isBreached ? "Breached" : "No known breach"}
                            </Badge>
                        </div>

                        <p className="text-xs text-muted-foreground">
                            GhostSweep will send this email from your connected Gmail account and create a deletion request so we can track replies.
                        </p>

                        {isErrorTemplate && (
                            <p className="text-[11px] text-red-400">
                                Couldn&apos;t load template. Try again, or use &quot;Open in email client&quot;.
                            </p>
                        )}
                    </DialogDescription>
                </DialogHeader>

                {/* From + To */}
                <div className="mt-4 space-y-3 text-xs">
                    <div className="space-y-1">
                        <div className="text-[11px] uppercase tracking-wide text-muted-foreground">
                            From (your email)
                        </div>
                        <div className="rounded-md border border-white/10 bg-black/60 px-3 py-2 font-mono text-[11px] text-emerald-200">
                            {userEmail || "—"}
                        </div>
                    </div>

                    <div className="space-y-1">
                        <div className="text-[11px] uppercase tracking-wide text-muted-foreground">
                            To (service deletion email)
                        </div>
                        <div className="rounded-md border border-white/10 bg-black/60 px-3 py-2 font-mono text-[11px] text-emerald-200">
                            {toAddress || "No deletion email in playbook yet"}
                        </div>
                    </div>

                    {/* Editable subject */}
                    <div className="space-y-1">
                        <div className="text-[11px] uppercase tracking-wide text-muted-foreground">
                            Subject (editable)
                        </div>
                        {isLoadingTemplate ? (
                            <div className="rounded-md border border-white/10 bg-black/60 px-3 py-2 font-mono text-[11px] text-slate-100">
                                <div className="flex flex-row gap-2 items-center">
                                    <Spinner className="h-3 w-3" /> Generating subject…
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

                {/* Editable body */}
                <div className="mt-4 space-y-1">
                    <div className="text-[11px] uppercase tracking-wide text-muted-foreground">
                        Email body (editable)
                    </div>

                    {isLoadingTemplate ? (
                        <div className="rounded-md border border-white/10 bg-black/70 p-3 text-[11px] text-slate-100 font-mono">
                            <div className="flex flex-row items-center gap-2">
                                <Spinner className="h-4 w-4" /> Generating deletion request template…
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
                        GhostSweep can send + track replies automatically. &quot;Open in email client&quot; is a fallback.
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
                                    <Spinner className="h-4 w-4" /> Sending…
                                </div>
                            ) : (
                                "Send with GhostSweep"
                            )}
                        </Button>

                        <Link href={composeUrl || "#"} target="_blank" rel="noreferrer">
                            <Button size="sm" variant="outline" disabled={!composeUrl}>
                                Open in Gmail
                            </Button>
                        </Link>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
