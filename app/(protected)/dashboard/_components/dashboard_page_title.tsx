// components/dashboard-title.tsx
"use client";

import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import Link from "next/link";
import { useState } from "react";
import * as pixel from "@/lib/meta-pixels";

type LatestSweepResponse = {
    sweepId: string | null;
    status: "pending" | "processing" | "completed" | "failed" | "cancelled" | null;
    progress?: number | null;

    // 🔥 new bits
    phase?: string | null;            // raw DB status (e.g. "listing_messages")
    phaseLabel?: string | null;       // nice label (e.g. "Listing account-related emails")
    phaseStep?: number | null;        // 1–5
    phaseCount?: number | null;       // always 5
    messagesProcessed?: number | null;

    servicesFound?: number | null;
    breachesFound?: number | null;
    startedAt?: string | null;
    completedAt?: string | null;
    message?: string;
    errorMessage?: string | null;
};

export default function DashboardTitle() {
    const [isConnecting, setIsConnecting] = useState(false);
    const [sweepDialogOpen, setSweepDialogOpen] = useState(false);
    const [lastNotifiedStatus, setLastNotifiedStatus] = useState<string | null>(null);
    const queryClient = useQueryClient();
    const [isCancelling, setIsCancelling] = useState(false);

    // ✅ Listen for OAuth errors in URL params
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const googleError = params.get('google_oauth_error');
        const microsoftError = params.get('microsoft_oauth_error');

        if (googleError) {
            toast.error('Gmail connection failed', {
                description: "There was an issue connecting your Gmail account. Please try again.",
            });
            // Clean up URL
            window.history.replaceState({}, document.title, window.location.pathname);
        }

        if (microsoftError) {
            toast.error('Outlook connection failed', {
                description: "There was an issue connecting your Outlook account. Please try again.",
            });
            // Clean up URL
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }, []);

    // Gmail account
    const { data: gmailData } = useQuery({
        queryKey: ["gmailAccount"],
        queryFn: async (): Promise<{ gmail_address: string | null }> => {
            const res = await fetch("/api/gmail_account");
            if (!res.ok) throw new Error("Failed to fetch Gmail account");
            return res.json();
        },
        refetchOnWindowFocus: false,
    });

    // Microsoft account
    const { data: microsoftData } = useQuery({
        queryKey: ["microsoftAccount"],
        queryFn: async (): Promise<{ outlook_address: string | null }> => {
            const res = await fetch("/api/microsoft_account");
            if (!res.ok) throw new Error("Failed to fetch Microsoft account");
            return res.json();
        },
        refetchOnWindowFocus: false,
    });

    // Plan
    const { data: plan } = useQuery({
        queryKey: ["plan"],
        queryFn: async (): Promise<{ current_plan: "free" | "pro" }> => {
            const res = await fetch("/api/plan");
            if (!res.ok) throw new Error("Failed to fetch plan data");
            return res.json();
        },
    });

    // ✅ Always fetch latest sweep status
    const { data: latestSweep, refetch: refetchLatestSweep } = useQuery({
        queryKey: ["latestSweep"],
        queryFn: async (): Promise<LatestSweepResponse> => {
            const res = await fetch("/api/sweep/status/latest");
            if (!res.ok) throw new Error("Failed to fetch latest sweep");
            return res.json();
        },
        // ✅ Poll every 5 seconds if sweep is in progress
        refetchInterval: (query) => {
            const data = query.state.data;
            if (!data) return false;
            return data.status === "pending" || data.status === "processing" || data.status === "cancelled"
                ? 5000
                : false;
        },
        refetchOnWindowFocus: true, // ✅ Refetch when user returns to tab
    });

    const gmailAddress = gmailData?.gmail_address ?? null;
    const outlookAddress = microsoftData?.outlook_address ?? null;
    const connectedEmail = gmailAddress || outlookAddress;
    const isInProgress =
        latestSweep?.status === "pending" || latestSweep?.status === "processing";

    // ✅ Show toasts for completed/failed sweeps (only once)
    useEffect(() => {
        if (!latestSweep?.sweepId) return;

        const sweepKey = `${latestSweep.sweepId}-${latestSweep.status}`;

        // Don't show notification if we've already shown it for this sweep+status
        if (lastNotifiedStatus === sweepKey) return;

        if (latestSweep.status === "completed") {
            setLastNotifiedStatus(sweepKey);

            // Invalidate data queries
            Promise.all([
                queryClient.invalidateQueries({ queryKey: ["user_services"] }),
                queryClient.invalidateQueries({ queryKey: ["user_breaches"] }),
                queryClient.invalidateQueries({ queryKey: ["metrics"] }),
                queryClient.invalidateQueries({ queryKey: ["deletion_requests"] }),
                queryClient.invalidateQueries({ queryKey: ["notifications", "latest"] }),
                queryClient.invalidateQueries({ queryKey: ["plan"] }),
            ]);

            toast.success("Sweep complete — here’s what has your data", {
                description: `Detected ${latestSweep.servicesFound || 0} accounts${latestSweep.breachesFound
                        ? `, including ${latestSweep.breachesFound} breached`
                        : ""
                    }. The riskiest ones are waiting in your dashboard.`,
            });
        }

        if (latestSweep.status === "cancelled") {
            setLastNotifiedStatus(sweepKey);

            // optional: invalidate anything that might have partially changed
            Promise.all([
                queryClient.invalidateQueries({ queryKey: ["latestSweep"] }),
                queryClient.invalidateQueries({ queryKey: ["metrics"] }),
                queryClient.invalidateQueries({ queryKey: ["notifications", "latest"] }),
            ]);

            pixel.event("Search", {
                content_category: "email_scan",
                accounts_found: latestSweep.servicesFound || 0,
                breaches_found: latestSweep.breachesFound || 0,
            });

            toast("Sweep cancelled", {
                description: "No more inbox processing will occur.",
            });
        }

        if (latestSweep.status === "failed") {
            setLastNotifiedStatus(sweepKey);

            toast.error("Sweep failed", {
                description: latestSweep.errorMessage || "Your inbox sweep encountered an error. Please try again later.",
            });
        }
    }, [latestSweep?.sweepId, latestSweep?.status, latestSweep?.servicesFound, latestSweep?.breachesFound, lastNotifiedStatus, queryClient, latestSweep?.errorMessage]);

    useEffect(() => {
        console.log("Sweep progress:", latestSweep?.progress);
    }, [latestSweep?.progress]);

    const onSweep = async () => {
        // If sweep already in progress, just show status
        if (isInProgress) {
            toast.info("Sweep already running", {
                description: `Your sweep is ${latestSweep?.status}. Check the banner above for progress.`,
            });
            setSweepDialogOpen(false);
            return;
        }

        toast.info("Starting your GhostSweep in the background…", {
            description: "You can keep using the dashboard while we process your inbox.",
        });

        try {
            const res = await fetch("/api/sweep/run", { method: "GET" });
            const json = await res.json();

            if (!res.ok) {
                if (json.code === "GMAIL_ACCOUNT_NOT_FOUND") {
                    toast.error("No Gmail account connected", {
                        description: "Please connect your Gmail first.",
                    });
                    return;
                } else if (json.code === "MONTHLY_LIMIT_REACHED") {
                    toast.error("Monthly sweep limit reached", {
                        description: "Go Professional for unlimited sweeps.",
                        action: {
                            label: "Upgrade",
                            onClick: () => {
                                window.location.href = "/dashboard/billing?plan=monthly";
                            },
                        },
                    });
                    return;
                } else if (json.code === "SWEEP_IN_PROGRESS") {
                    toast.warning("Sweep already in progress", {
                        description: json.message,
                    });
                    // Refetch to get the latest status
                    refetchLatestSweep();
                    return;
                } else {
                    throw new Error(json.error || "Sweep failed");
                }
            }

            // Immediately refetch latest sweep to show new status
            refetchLatestSweep();
            setSweepDialogOpen(false);
        } catch (error) {
            console.error("Error starting sweep:", error);
            toast.error("Failed to start sweep", {
                description: "Please try again later.",
            });
        }
    };

    // ✅ Dynamic button text based on latest sweep status
    const getButtonText = () => {
        if (!latestSweep?.status) return "Run Sweep";

        switch (latestSweep.status) {
            case "pending":
                return "Sweep Queued…";
            case "processing":
                return latestSweep.progress
                    ? `Processing ${latestSweep.progress}%`
                    : "Processing…";
            case "completed":
            case "failed":
            default:
                return "Run Sweep";
        }
    };

    // ✅ Calculate minutes elapsed for in-progress sweeps
    const getElapsedMinutes = () => {
        if (!latestSweep?.startedAt) return 0;
        const elapsed = Date.now() - new Date(latestSweep.startedAt).getTime();
        return Math.floor(elapsed / 60000);
    };

    const onCancelSweep = useMutation({
        mutationFn: async () => {
            const res = await fetch(`/api/sweep/cancel/${latestSweep?.sweepId}`, {
                method: "POST",
            });
            const json = await res.json();
            if (!res.ok) {
                throw new Error(json.error || "Failed to cancel sweep");
            }
            return json;
        },
        onMutate: () => {
            setIsCancelling(true);
        },
        onSuccess: () => {
            toast.success("Sweep cancellation requested", {
                description: "The sweep will stop shortly.",
            });
            // Refetch latest sweep status
            queryClient.invalidateQueries({ queryKey: ["latestSweep"] });
        },
        onError: (error) => {
            console.error("Error cancelling sweep:", error);
            toast.error("Failed to cancel sweep", {
                description: error.message || "Please try again later.",
            });
        },
        onSettled: () => {
            setIsCancelling(false);
        },
    })

    return (
        <>
            {/* HEADER */}
            <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="space-y-1">
                    <h1 className="text-lg font-semibold text-white md:text-xl">
                        GhostSweep Dashboard
                    </h1>
                    <p className="text-xs text-white/60 md:text-sm">
                        Map your accounts, breaches, and deletion requests in one place.
                    </p>
                </div>

                <div className="flex w-full flex-col items-stretch gap-2 sm:flex-row sm:items-center sm:justify-end">
                    {/* Email status pill */}
                    <span
                        className={[
                            "inline-flex items-center rounded-full border px-3 py-1 text-xs",
                            "justify-center sm:justify-start",
                            connectedEmail
                                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
                                : "border-yellow-500/30 bg-yellow-500/10 text-yellow-200",
                        ].join(" ")}
                    >
                        {connectedEmail ? (
                            <>
                                <span className="hidden sm:inline">Connected:&nbsp;</span>
                                <span className="max-w-[140px] truncate sm:max-w-[200px]">
                                    {connectedEmail}
                                </span>
                            </>
                        ) : (
                            "Email not connected"
                        )}
                    </span>

                    {/* Run Sweep button */}
                    <Button
                        size="sm"
                        className="w-full sm:w-auto"
                        onClick={() => setSweepDialogOpen(true)}
                        disabled={isInProgress}
                    >
                        {isInProgress ? (
                            <span className="flex items-center gap-2">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                {getButtonText()}
                            </span>
                        ) : (
                            getButtonText()
                        )}
                    </Button>
                </div>
            </div>

            {/* ✅ Background sweep banner */}
            {isInProgress && latestSweep && (
                <div className="mb-4 flex flex-col gap-1 rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-3 py-2 text-xs text-cyan-100 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                            <Loader2 className="h-3 w-3 animate-spin" />
                            <span className="font-medium">
                                {latestSweep.phaseLabel ?? "Scanning your inbox…"}
                            </span>
                        </div>
                        <div className="text-[11px] text-cyan-200/80">
                            {latestSweep.phaseStep && latestSweep.phaseCount ? (
                                <>
                                    Phase {latestSweep.phaseStep} of {latestSweep.phaseCount}
                                    {" • "}
                                </>
                            ) : null}
                            {typeof latestSweep.messagesProcessed === "number" && (
                                <>
                                    {latestSweep.messagesProcessed.toLocaleString()} messages processed
                                    {" • "}
                                </>
                            )}
                            {getElapsedMinutes() > 0 && (
                                <>Running {getElapsedMinutes()} min</>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {typeof latestSweep.progress === "number" && (
                            <>
                                <div className="hidden h-1.5 w-32 overflow-hidden rounded-full bg-cyan-900/50 sm:block">
                                    <div
                                        className="h-full bg-cyan-400 transition-all duration-300"
                                        style={{ width: `${latestSweep.progress}%` }}
                                    />
                                </div>
                                <span className="text-[11px] font-semibold text-cyan-200">
                                    {latestSweep.progress}%
                                </span>
                            </>
                        )}

                        <Button
                            size="sm"
                            variant="ghost"
                            disabled={isCancelling || latestSweep.status === "cancelled"}
                            onClick={() => onCancelSweep.mutate()}
                            className="h-8 text-[11px] text-cyan-100 hover:bg-white/10"
                        >
                            {latestSweep.status === "cancelled"
                                ? "Stopping…"
                                : isCancelling
                                    ? "Stopping…"
                                    : "Cancel sweep"}
                        </Button>
                    </div>
                </div>
            )}

            {/* SWEEP DIALOG */}
            <Dialog open={sweepDialogOpen} onOpenChange={setSweepDialogOpen}>
                <DialogContent className="bg-[#050505] border border-white/10 sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-base md:text-lg">
                            {isInProgress ? "Sweep In Progress" : "Run a GhostSweep"}
                        </DialogTitle>
                        <DialogDescription className="text-xs text-white/60 md:text-sm">
                            {isInProgress ? (
                                <span>
                                    Your sweep is currently{" "}
                                    <span className="font-medium text-cyan-300">
                                        {latestSweep?.status}
                                    </span>
                                    . Please wait for it to complete.
                                </span>
                            ) : (
                                <>
                                    We&#39;ll scan your inbox using{" "}
                                    <span className="font-medium">read-only metadata</span> (sender,
                                    subject, date) to detect services and known breaches.
                                </>
                            )}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="mt-3 space-y-3 text-xs md:text-sm">
                        {isInProgress ? (
                            <div className="rounded-lg border border-cyan-500/30 bg-cyan-500/10 p-3 space-y-2">
                                <div className="flex items-center gap-2">
                                    <Loader2 className="h-4 w-4 animate-spin text-cyan-300" />
                                    <span className="font-medium text-cyan-100">
                                        {latestSweep.phaseLabel ?? "Running GhostSweep…"}
                                    </span>
                                </div>

                                <p className="text-[11px] text-cyan-200/80">
                                    {latestSweep.phaseStep && latestSweep.phaseCount
                                        ? `Phase ${latestSweep.phaseStep} of ${latestSweep.phaseCount}.`
                                        : "Processing your inbox in multiple phases."}{" "}
                                    This usually takes a few minutes.
                                </p>

                                {typeof latestSweep.messagesProcessed === "number" && (
                                    <p className="text-[11px] text-cyan-200/80">
                                        Messages processed:{" "}
                                        <span className="font-semibold">
                                            {latestSweep.messagesProcessed.toLocaleString()}
                                        </span>
                                    </p>
                                )}

                                {typeof latestSweep.progress === "number" && (
                                    <div className="mt-1">
                                        <div className="h-1.5 bg-cyan-900/50 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-cyan-400 transition-all duration-300"
                                                style={{ width: `${latestSweep.progress}%` }}
                                            />
                                        </div>
                                        <p className="mt-1 text-[11px] text-cyan-200">
                                            {latestSweep.progress}% complete
                                        </p>
                                    </div>
                                )}

                                {getElapsedMinutes() > 0 && (
                                    <p className="text-[11px] text-cyan-200/70">
                                        Running for {getElapsedMinutes()} minute
                                        {getElapsedMinutes() !== 1 ? "s" : ""}
                                    </p>
                                )}
                            </div>
                        ) : connectedEmail ? (
                            <>
                                <p className="text-white/60">
                                    Connected as{" "}
                                    <span className="font-medium text-white">{connectedEmail}</span>.
                                </p>
                                <p className="text-white/50">
                                    The sweep runs in the background and typically takes 3-5 minutes.
                                    You&apos;ll be notified when it completes.
                                </p>
                                {plan?.current_plan === "free" && (
                                    <p className="text-xs text-yellow-200/80 border-l-2 border-yellow-500/30 pl-3">
                                        Free plan: Up to 10 accounts shown.
                                    </p>
                                )}
                            </>
                        ) : (
                            <>
                                <p className="text-yellow-200">
                                    You haven&apos;t connected an email account yet.
                                </p>
                                <p className="text-white/50">
                                    Connect Gmail or Outlook to let GhostSweep analyze your email metadata.
                                </p>
                                <div className="space-y-2 rounded-lg border border-cyan-500/20 bg-cyan-500/5 p-3">
                                    <p className="font-medium text-cyan-300">Permissions Required:</p>
                                    <div className="space-y-2 text-[11px] text-white/70">
                                        <div className="flex gap-2">
                                            <span className="text-emerald-400">✓</span>
                                            <div>
                                                <span className="font-medium text-white">Read Email</span>
                                                <p className="text-white/60">Required to scan your inbox for accounts and breaches</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <span className="text-amber-400">◆</span>
                                            <div>
                                                <span className="font-medium text-white">Send Email (Optional)</span>
                                                <p className="text-white/60">Allow this to send deletion requests directly from GhostSweep</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    <DialogFooter className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSweepDialogOpen(false)}
                            className="w-full sm:w-auto"
                        >
                            {isInProgress ? "Close" : "Cancel"}
                        </Button>

                        {!isInProgress && (
                            <>
                                {connectedEmail ? (
                                    <Button
                                        size="sm"
                                        onClick={onSweep}
                                        className="w-full sm:w-auto min-w-[140px]"
                                    >
                                        Start Sweep
                                    </Button>
                                ) : (
                                    <div className="flex w-full flex-col-reverse gap-2 sm:w-auto sm:flex-row">
                                        <Link
                                            href="/api/google/oauth/start"
                                            onClick={() => setIsConnecting(true)}
                                        >
                                            <Button
                                                size="sm"
                                                disabled={isConnecting}
                                                color="#DB4437"
                                                className="w-full sm:w-auto min-w-[130px] bg-red-600 hover:bg-red-700 text-white"
                                            >
                                                {isConnecting ? (
                                                    <span className="flex items-center justify-center gap-2">
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                        Connecting…
                                                    </span>
                                                ) : (
                                                    "Gmail"
                                                )}
                                            </Button>
                                        </Link>
                                        <Link
                                            href="/api/microsoft/oauth"
                                            onClick={() => setIsConnecting(true)}
                                        >
                                            <Button
                                                size="sm"
                                                disabled={isConnecting}
                                                color="blue"
                                                className="w-full sm:w-auto min-w-[130px] bg-blue-600 hover:bg-blue-700 text-white"
                                            >
                                                {isConnecting ? (
                                                    <span className="flex items-center justify-center gap-2">
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                        Connecting…
                                                    </span>
                                                ) : (
                                                    "Outlook"
                                                )}
                                            </Button>
                                        </Link>
                                    </div>
                                )}
                            </>
                        )}
                        {isInProgress && (
                            <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => onCancelSweep.mutate()}
                                disabled={isCancelling || latestSweep?.status === "cancelled"}
                                className="w-full sm:w-auto"
                            >
                                {latestSweep?.status === "cancelled" ? "Stopping…" : "Cancel sweep"}
                            </Button>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}