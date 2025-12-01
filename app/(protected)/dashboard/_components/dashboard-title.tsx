// components/dashboard-title.tsx
"use client";

import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
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

type LatestSweepResponse = {
    sweepId: string | null;
    status: "pending" | "processing" | "completed" | "failed" | null;
    progress?: number | null;
    servicesFound?: number | null;
    breachesFound?: number | null;
    errorMessage?: string | null;
    startedAt?: string | null;
    completedAt?: string | null;
    message?: string;
};

export default function DashboardTitle() {
    const [isConnecting, setIsConnecting] = useState(false);
    const [sweepDialogOpen, setSweepDialogOpen] = useState(false);
    const [lastNotifiedStatus, setLastNotifiedStatus] = useState<string | null>(null);
    const queryClient = useQueryClient();

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
            return data.status === "pending" || data.status === "processing"
                ? 5000
                : false;
        },
        refetchOnWindowFocus: true, // ✅ Refetch when user returns to tab
    });

    const gmailAddress = gmailData?.gmail_address ?? null;
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
                queryClient.invalidateQueries({ queryKey: ["services"] }),
                queryClient.invalidateQueries({ queryKey: ["breaches"] }),
                queryClient.invalidateQueries({ queryKey: ["metrics"] }),
            ]);

            toast.success("Sweep complete — dashboard updated", {
                description: `Found ${latestSweep.servicesFound || 0} services${latestSweep.breachesFound
                        ? ` and ${latestSweep.breachesFound} breaches`
                        : ""
                    }.`,
            });
        }

        if (latestSweep.status === "failed") {
            setLastNotifiedStatus(sweepKey);

            toast.error("Sweep failed", {
                description: latestSweep.errorMessage || "Unknown error occurred.",
            });
        }
    }, [
        latestSweep?.sweepId,
        latestSweep?.status,
        latestSweep?.servicesFound,
        latestSweep?.breachesFound,
        latestSweep?.errorMessage,
        lastNotifiedStatus,
        queryClient,
    ]);

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

    return (
        <>
            {/* HEADER */}
            <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="space-y-1">
                    <h1 className="text-lg font-semibold text-white md:text-xl">
                        GhostSweep Dashboard
                    </h1>
                    <p className="text-xs text-white/60 md:text-sm">
                        Map your accounts, breaches, and privacy requests in one place.
                    </p>
                </div>

                <div className="flex w-full flex-col items-stretch gap-2 sm:flex-row sm:items-center sm:justify-end">
                    {/* Gmail status pill */}
                    <span
                        className={[
                            "inline-flex items-center rounded-full border px-3 py-1 text-xs",
                            "justify-center sm:justify-start",
                            gmailAddress
                                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
                                : "border-yellow-500/30 bg-yellow-500/10 text-yellow-200",
                        ].join(" ")}
                    >
                        {gmailAddress ? (
                            <>
                                <span className="hidden sm:inline">Connected:&nbsp;</span>
                                <span className="max-w-[140px] truncate sm:max-w-[200px]">
                                    {gmailAddress}
                                </span>
                            </>
                        ) : (
                            "Gmail not connected"
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
            {isInProgress && (
                <div className="mb-4 flex items-center justify-between gap-2 rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-3 py-2 text-xs text-cyan-100">
                    <div className="flex items-center gap-2">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        <span>
                            Your GhostSweep is{" "}
                            {latestSweep?.status === "pending"
                                ? "in the queue…"
                                : "processing your inbox…"}
                            {getElapsedMinutes() > 0 && (
                                <span className="text-cyan-200/80">
                                    {" "}
                                    ({getElapsedMinutes()}m elapsed)
                                </span>
                            )}
                        </span>
                    </div>
                    {typeof latestSweep?.progress === "number" && (
                        <span className="text-[11px] text-cyan-200 font-medium">
                            {latestSweep.progress}%
                        </span>
                    )}
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
                            <>
                                {/* ✅ Show in-progress status */}
                                <div className="rounded-lg border border-cyan-500/30 bg-cyan-500/10 p-3">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Loader2 className="h-4 w-4 animate-spin text-cyan-300" />
                                        <span className="font-medium text-cyan-100">
                                            {latestSweep?.status === "pending"
                                                ? "Queued"
                                                : "Processing"}
                                        </span>
                                    </div>
                                    <p className="text-cyan-200/80 text-xs">
                                        {latestSweep?.status === "pending"
                                            ? "Your sweep is in the queue and will start shortly."
                                            : `Processing your inbox… This usually takes 3-5 minutes.`}
                                    </p>
                                    {typeof latestSweep?.progress === "number" && (
                                        <div className="mt-2">
                                            <div className="h-1.5 bg-cyan-900/50 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-cyan-400 transition-all duration-300"
                                                    style={{ width: `${latestSweep.progress}%` }}
                                                />
                                            </div>
                                            <p className="text-cyan-300 text-xs mt-1">
                                                {latestSweep.progress}% complete
                                            </p>
                                        </div>
                                    )}
                                    {getElapsedMinutes() > 0 && (
                                        <p className="text-cyan-300/60 text-xs mt-2">
                                            Running for {getElapsedMinutes()} minute
                                            {getElapsedMinutes() !== 1 ? "s" : ""}
                                        </p>
                                    )}
                                </div>
                            </>
                        ) : gmailAddress ? (
                            <>
                                <p className="text-white/60">
                                    Connected as{" "}
                                    <span className="font-medium text-white">{gmailAddress}</span>.
                                </p>
                                <p className="text-white/50">
                                    The sweep runs in the background and typically takes 3-5 minutes.
                                    You&apos;ll be notified when it completes.
                                </p>
                                {plan?.current_plan === "free" && (
                                    <p className="text-xs text-yellow-200/80 border-l-2 border-yellow-500/30 pl-3">
                                        Free plan: 1 sweep per month, up to 50 accounts shown.
                                    </p>
                                )}
                            </>
                        ) : (
                            <>
                                <p className="text-yellow-200">
                                    You haven&apos;t connected Gmail yet.
                                </p>
                                <p className="text-white/50">
                                    Connect to let GhostSweep analyze your email metadata.
                                </p>
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
                                {gmailAddress ? (
                                    <Button
                                        size="sm"
                                        onClick={onSweep}
                                        className="w-full sm:w-auto min-w-[140px]"
                                    >
                                        Start Sweep
                                    </Button>
                                ) : (
                                    <Link
                                        href="/api/google/oauth/start"
                                        onClick={() => setIsConnecting(true)}
                                    >
                                        <Button
                                            size="sm"
                                            disabled={isConnecting}
                                            className="w-full sm:w-auto min-w-[150px]"
                                        >
                                            {isConnecting ? (
                                                <span className="flex items-center justify-center gap-2">
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                    Connecting…
                                                </span>
                                            ) : (
                                                "Connect Gmail"
                                            )}
                                        </Button>
                                    </Link>
                                )}
                            </>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}