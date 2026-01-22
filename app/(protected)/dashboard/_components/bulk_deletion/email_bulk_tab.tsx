"use client";

import * as React from "react";
import Image from "next/image";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { Loader2, Mail, RotateCcw, X, XCircle, CheckCircle, AlertCircle } from "lucide-react";
import { Grouped } from "@/queryTypes";
import Input from "@/components/ui/input";
import { masterBody, masterSubject } from "@/constant/master_template";
import { useQuery } from "@tanstack/react-query";

// type DeletionProfileQueryResult = {
//     full_name: string | null;
//     country: string | null;
// };

// SSE event types
type SSEEvent =
    | { type: "start"; total: number }
    | { type: "progress"; current: number; total: number; serviceName: string; status: "sending" }
    | { type: "success"; serviceName: string; current: number; total: number; gmailMessageId: string }
    | { type: "error"; serviceName: string; current: number; total: number; error: string }
    | { type: "complete"; completed: number; failed: number; total: number }
    | { type: "cancelled"; completed: number; failed: number; total: number };

interface BulkEmailTabProps {
    emailCount: number;
    email: Grouped;
}

export default function EmailBulkTab({ emailCount, email }: BulkEmailTabProps) {
    const [excludedIds, setExcludedIds] = React.useState<Set<string>>(new Set());

    // Master template
    const [subject, setSubject] = React.useState(masterSubject);
    const [body, setBody] = React.useState(masterBody);

    // SSE state
    const [isRunning, setIsRunning] = React.useState(false);
    const [progress, setProgress] = React.useState({ current: 0, total: 0 });
    const [completed, setCompleted] = React.useState(0);
    const [failed, setFailed] = React.useState(0);
    const [serviceStatuses, setServiceStatuses] = React.useState<Record<string, "pending" | "sending" | "sent" | "failed">>({});
    const [errors, setErrors] = React.useState<Record<string, string>>({});

    // Abort controller for cancellation
    const abortControllerRef = React.useRef<AbortController | null>(null);

    // Deletion profile
    // const { data: deletionProfileQueryResult } = useQuery({
    //     queryKey: ["deletion_profile"],
    //     queryFn: async (): Promise<DeletionProfileQueryResult> => {
    //         const res = await fetch("/api/deletion_profile");
    //         if (!res.ok) throw new Error("Failed to fetch deletion profile");
    //         return res.json();
    //     },
    // });

    // Gmail account
    const { data: gmailAccountQueryResult } = useQuery({
        queryKey: ["gmail_account"],
        queryFn: async (): Promise<{ gmail_address: string | null }> => {
            const res = await fetch("/api/gmail_account");
            if (!res.ok) throw new Error("Failed to fetch Gmail account");
            return res.json();
        },
        refetchOnWindowFocus: false,
    });

    const getService = React.useCallback((row: Grouped[number]): Grouped[number]["service"] => {
        const s = row.service;
        return Array.isArray(s) ? (s[0] as Grouped[number]["service"]) : (s as Grouped[number]["service"]);
    }, []);

    const included = React.useMemo(() => {
        return email.filter((x) => !excludedIds.has(x.id));
    }, [email, excludedIds]);

    const includedIds = React.useMemo(() => included.map((x) => x.id), [included]);

    // const excluded = React.useMemo(() => {
    //     if (excludedIds.size === 0) return [];
    //     const map = new Set(excludedIds);
    //     return email.filter((x) => map.has(x.id));
    // }, [email, excludedIds]);

    const toggleInclude = (id: string, include: boolean) => {
        setExcludedIds((prev) => {
            const next = new Set(prev);
            if (include) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const resetSelection = () => setExcludedIds(new Set());

    // Cancel sending
    const handleCancel = () => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            toast.info("Cancelling bulk send...");
        }
    };

    // Start SSE bulk send
    const handleSend = async () => {
        if (!gmailAccountQueryResult?.gmail_address) {
            toast.error("Gmail account not connected", {
                description: "You need to connect a Gmail account to send bulk emails.",
            });
            return;
        }

        if (includedIds.length === 0) {
            toast.error("Select at least 1 service to send emails.");
            return;
        }
        if (!subject.trim()) {
            toast.error("Subject is required.");
            return;
        }
        if (!body.trim()) {
            toast.error("Body is required.");
            return;
        }

        // Reset state
        setIsRunning(true);
        setProgress({ current: 0, total: includedIds.length });
        setCompleted(0);
        setFailed(0);
        setServiceStatuses({});
        setErrors({});

        // Create abort controller
        const abortController = new AbortController();
        abortControllerRef.current = abortController;

        try {
            const response = await fetch("/api/bulk_email/send", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    user_service_ids: includedIds,
                    master_subject: subject,
                    master_body: body,
                }),
                signal: abortController.signal,
            });

            if (!response.ok) {
                console.error(`[EmailBulkTab] API returned ${response.status}`);
                const error = await response.json().catch(() => ({ error: "Failed to start" }));
                const errorMsg = error.error || error.message || `HTTP ${response.status}`;
                console.error("[EmailBulkTab] API error:", errorMsg);
                throw new Error(errorMsg);
            }
            console.log("[EmailBulkTab] Bulk send request successful, streaming SSE");

            // Read SSE stream
            const reader = response.body?.getReader();
            if (!reader) {
                console.error("[EmailBulkTab] No response body from server");
                throw new Error("No response body");
            }

            const decoder = new TextDecoder();
            let buffer = "";

            while (true) {
                const { done, value } = await reader.read();

                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split("\n");
                buffer = lines.pop() || "";

                for (const line of lines) {
                    if (!line.trim() || !line.startsWith("data: ")) continue;

                    try {
                        const data: SSEEvent = JSON.parse(line.slice(6));

                        switch (data.type) {
                            case "start":
                                console.log(`[EmailBulkTab] Starting bulk send: ${data.total} emails`);
                                setProgress({ current: 0, total: data.total });
                                toast.success(`Starting to send ${data.total} emails...`);
                                break;

                            case "progress":
                                console.log(`[EmailBulkTab] Progress: ${data.current}/${data.total} - ${data.serviceName}`);
                                setProgress({ current: data.current, total: data.total });
                                setServiceStatuses((prev) => ({
                                    ...prev,
                                    [data.serviceName]: "sending",
                                }));
                                break;

                            case "success":
                                console.log(`[EmailBulkTab] Success: ${data.serviceName} (${data.current}/${data.total})`);
                                setProgress({ current: data.current, total: data.total });
                                setCompleted((prev) => prev + 1);
                                setServiceStatuses((prev) => ({
                                    ...prev,
                                    [data.serviceName]: "sent",
                                }));
                                break;

                            case "error":
                                console.error(`[EmailBulkTab] Error for ${data.serviceName}:`, data.error);
                                setProgress({ current: data.current, total: data.total });
                                setFailed((prev) => prev + 1);
                                setServiceStatuses((prev) => ({
                                    ...prev,
                                    [data.serviceName]: "failed",
                                }));
                                setErrors((prev) => ({
                                    ...prev,
                                    [data.serviceName]: data.error,
                                }));
                                break;

                            case "complete":
                                console.log(`[EmailBulkTab] Complete - Sent: ${data.completed}, Failed: ${data.failed}`);
                                setIsRunning(false);
                                toast.success(
                                    `Bulk send complete: ${data.completed} sent, ${data.failed} failed`
                                );
                                break;

                            case "cancelled":
                                console.log(`[EmailBulkTab] Cancelled - Sent: ${data.completed}, Failed: ${data.failed}`);
                                setIsRunning(false);
                                toast.info(
                                    `Bulk send cancelled: ${data.completed} sent, ${data.failed} failed`
                                );
                                break;
                        }
                    } catch (e) {
                        console.error("[EmailBulkTab] Failed to parse SSE event:", line, e);
                    }
                }
            }
        } catch (error) {
            if (error instanceof Error) {
                if (error.name === "AbortError") {
                    console.log("[EmailBulkTab] Bulk send aborted by user");
                    toast.info("Bulk send cancelled");
                } else {
                    console.error("[EmailBulkTab] Bulk send error:", error);
                    toast.error("Bulk send failed", { description: error.message });
                }
            } else {
                console.error("[EmailBulkTab] Unknown error:", error);
                toast.error("Bulk send failed", { description: "An unknown error occurred" });
            }
            setIsRunning(false);
        } finally {
            abortControllerRef.current = null;
        }
    };

    const pct =
        progress.total > 0 ? Math.min(100, Math.round((progress.current / progress.total) * 100)) : 0;

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-white/70" />
                        <h2 className="text-base font-semibold">Email deletions</h2>
                        <Badge variant="outline" className="text-[11px] border-white/10 bg-white/5 text-white/80">
                            {emailCount.toLocaleString()} eligible
                        </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Choose which services to email. Edit the master template below — it will be used for each
                        service.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        className="border-white/15 bg-white/5"
                        onClick={resetSelection}
                        disabled={isRunning || excludedIds.size === 0}
                    >
                        <RotateCcw className="mr-2 h-4 w-4" />
                        Reset
                    </Button>

                    {isRunning ? (
                        <Button
                            size="sm"
                            variant="destructive"
                            onClick={handleCancel}
                        >
                            <XCircle className="mr-2 h-4 w-4" />
                            Cancel
                        </Button>
                    ) : (
                        <Button
                            size="sm"
                            className="bg-primary text-black hover:bg-primary/80"
                            onClick={handleSend}
                            disabled={includedIds.length === 0}
                        >
                            Send {includedIds.length.toLocaleString()} emails
                        </Button>
                    )}
                </div>
            </div>

            {/* Progress */}
            {isRunning && (
                <div className="rounded-lg border border-white/10 bg-[#050505] p-4 space-y-3">
                    <div className="flex items-center justify-between">
                        <div className="text-sm font-medium text-white/90">Sending in progress...</div>
                        <div className="text-xs text-white/60">
                            {progress.current}/{progress.total}
                        </div>
                    </div>

                    <Progress value={pct} />

                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                        <div className="rounded border border-green-500/20 bg-green-500/5 p-2">
                            <div className="text-green-400 font-semibold">{completed}</div>
                            <div className="text-white/50">Sent</div>
                        </div>
                        <div className="rounded border border-blue-500/20 bg-blue-500/5 p-2">
                            <div className="text-blue-400 font-semibold">
                                {progress.total - progress.current}
                            </div>
                            <div className="text-white/50">Remaining</div>
                        </div>
                        <div className="rounded border border-red-500/20 bg-red-500/5 p-2">
                            <div className="text-red-400 font-semibold">{failed}</div>
                            <div className="text-white/50">Failed</div>
                        </div>
                    </div>
                </div>
            )}

            {/* Show completion summary */}
            {!isRunning && progress.total > 0 && (
                <div className="rounded-lg border border-white/10 bg-[#050505] p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="h-5 w-5 text-green-400" />
                        <div className="text-sm font-medium text-white/90">Bulk send complete</div>
                    </div>
                    <div className="text-xs text-white/60">
                        {completed} emails sent successfully
                        {failed > 0 && `, ${failed} failed`}
                    </div>
                </div>
            )}

            {/* Master template */}
            <Accordion type="single" collapsible defaultValue="master">
                <AccordionItem value="master" className="border-white/10">
                    <AccordionTrigger className="rounded-lg border border-white/10 bg-[#050505] px-4 py-3 hover:no-underline">
                        <div className="flex w-full items-center justify-between">
                            <div className="text-sm font-medium text-white/90">Master email template</div>
                            <div className="text-[11px] text-white/60">Subject + body used for each service</div>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="pt-3">
                        <div className="rounded-lg border border-white/10 bg-[#050505] p-4 space-y-3">
                            <div className="space-y-1">
                                <div className="text-[11px] uppercase tracking-wide text-muted-foreground">Subject</div>
                                <Input
                                    id="subject"
                                    value={subject}
                                    onChange={setSubject}
                                    className="bg-black/50 border-white/10"
                                    placeholder="Email subject"
                                    disabled={isRunning}
                                />
                            </div>

                            <div className="space-y-1">
                                <div className="text-[11px] uppercase tracking-wide text-muted-foreground">Body</div>
                                <Textarea
                                    value={body}
                                    onChange={(e) => setBody(e.target.value)}
                                    className="min-h-40 bg-black/50 border-white/10 font-mono text-[12px]"
                                    placeholder="Email body"
                                    disabled={isRunning}
                                />
                                <p className="text-[11px] text-white/50">
                                    Use variables: {"{SERVICE_NAME}"}, {"{USER_EMAIL}"}, {"{SERVICE_DOMAIN}"}
                                </p>
                            </div>
                        </div>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>

            {/* Services list with live status */}
            <div className="rounded-xl border border-white/10 bg-[#050505] overflow-hidden">
                <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
                    <div className="text-sm font-medium text-white/90">Services to email</div>
                    <div className="text-[11px] text-white/60">
                        {included.length}/{email.length} selected
                    </div>
                </div>

                <div className="max-h-[520px] overflow-y-auto">
                    {email.length === 0 ? (
                        <div className="p-6 text-sm text-muted-foreground">No email-based deletions available.</div>
                    ) : (
                        <ul className="divide-y divide-white/10">
                            {email.map((row) => {
                                const svc = getService(row);
                                const isExcluded = excludedIds.has(row.id);
                                const toEmail = row.playbook?.deletion_email ?? null;
                                const status = serviceStatuses[svc?.name || ""];
                                const error = errors[svc?.name || ""];

                                return (
                                    <li
                                        key={row.id}
                                        className={cn(
                                            "px-4 py-3 flex items-start justify-between gap-3",
                                            isExcluded && "opacity-60"
                                        )}
                                    >
                                        <div className="flex items-start gap-3 min-w-0 flex-1">
                                            <Checkbox
                                                checked={!isExcluded}
                                                onCheckedChange={(v) => toggleInclude(row.id, Boolean(v))}
                                                disabled={isRunning}
                                                className="mt-1"
                                            />

                                            <div className="relative h-9 w-9 overflow-hidden rounded-full border border-white/10 bg-white/5 shrink-0">
                                                {svc?.logo_url ? (
                                                    <Image
                                                        src={svc.logo_url}
                                                        alt=""
                                                        width={64}
                                                        height={64}
                                                        className="h-full w-full object-cover"
                                                    />
                                                ) : null}
                                            </div>

                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center gap-2">
                                                    <div className="text-sm font-medium text-white truncate">
                                                        {svc?.name || "Unknown service"}
                                                    </div>

                                                    {/* Live status indicator */}
                                                    {status === "sending" && (
                                                        <Loader2 className="h-3 w-3 animate-spin text-blue-400" />
                                                    )}
                                                    {status === "sent" && (
                                                        <CheckCircle className="h-3 w-3 text-green-400" />
                                                    )}
                                                    {status === "failed" && (
                                                        <XCircle className="h-3 w-3 text-red-400" />
                                                    )}
                                                </div>

                                                <div className="mt-1 text-[11px] text-white/55">
                                                    To: <span className="font-mono text-white/70">{toEmail || "N/A"}</span>
                                                </div>

                                                {/* Show error if failed */}
                                                {error && (
                                                    <div className="mt-1 text-[10px] text-red-300 flex items-start gap-1">
                                                        <AlertCircle className="h-3 w-3 shrink-0 mt-0.5" />
                                                        <span>{error}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="shrink-0">
                                            {!isExcluded && !isRunning && (
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    className="h-8 text-white/70 hover:text-white"
                                                    onClick={() => toggleInclude(row.id, false)}
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
}