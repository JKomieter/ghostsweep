// components/dashboard-title.tsx
"use client";

import { useEffect } from "react";
import { useMutation, useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import Link from "next/link";
import { useState } from "react";
import * as pixel from "@/lib/meta-pixels";
import { OutLookLogo, GmailLogo } from "@/svgs";

const EmailIcon = ({ type }: { type: "gmail" | "outlook" | null }) => {
    if (type === "gmail") return <GmailLogo className="h-3.5 w-3.5" />;
    if (type === "outlook") return <OutLookLogo className="h-3.5 w-3.5" />;
    return null;
};

type LatestSweepResponse = {
    sweepId: string | null;
    status: "pending" | "processing" | "completed" | "failed" | "cancelled" | null;
    progress?: number | null;
    phase?: string | null;
    phaseLabel?: string | null;
    phaseStep?: number | null;
    phaseCount?: number | null;
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
    const [sweepLongNotified, setSweepLongNotified] = useState(false);
    const queryClient = useQueryClient();
    const [isCancelling, setIsCancelling] = useState(false);
    const [selectedEmail, setSelectedEmail] = useState<string>("");
    const [selectedProvider, setSelectedProvider] = useState<"gmail" | "outlook" | null>(null);

    // ✅ Listen for OAuth errors in URL params
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const googleError = params.get('google_oauth_error');
        const microsoftError = params.get('microsoft_oauth_error');

        if (googleError) {
            toast.error('Gmail connection failed', {
                description: "There was an issue connecting your Gmail account. Please try again.",
            });
            window.history.replaceState({}, document.title, window.location.pathname);
        }

        if (microsoftError) {
            toast.error('Outlook connection failed', {
                description: "There was an issue connecting your Outlook account. Please try again.",
            });
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }, []);

    // Fetch accounts
    const [gmailQuery, microsoftQuery] = useQueries({
        queries: [
            {
                queryKey: ["gmailAccount"],
                queryFn: async (): Promise<{ accounts: Array<{ id: string; gmail_address: string; created_at: string }> }> => {
                    const res = await fetch("/api/gmail_account");
                    if (!res.ok) throw new Error("Failed to fetch Gmail account");
                    return res.json();
                },
                refetchOnWindowFocus: false,
            },
            {
                queryKey: ["microsoftAccount"],
                queryFn: async (): Promise<{ accounts: Array<{ id: string; outlook_address: string; created_at: string }> }> => {
                    const res = await fetch("/api/microsoft_account");
                    if (!res.ok) throw new Error("Failed to fetch Microsoft account");
                    return res.json();
                },
                refetchOnWindowFocus: false,
            },
        ],
    });

    const gmailData = gmailQuery.data;
    const microsoftData = microsoftQuery.data;

    // Plan
    const { data: plan } = useQuery({
        queryKey: ["plan"],
        queryFn: async (): Promise<{ current_plan: "free" | "pro" }> => {
            const res = await fetch("/api/plan");
            if (!res.ok) throw new Error("Failed to fetch plan data");
            return res.json();
        },
    });

    // Latest sweep
    const { data: latestSweep, refetch: refetchLatestSweep } = useQuery({
        queryKey: ["latestSweep"],
        queryFn: async (): Promise<LatestSweepResponse> => {
            const res = await fetch("/api/sweep/status/latest");
            if (!res.ok) throw new Error("Failed to fetch latest sweep");
            return res.json();
        },
        refetchInterval: (query) => {
            const data = query.state.data;
            if (!data) return false;
            return data.status === "pending" || data.status === "processing" || data.status === "cancelled"
                ? 5000
                : false;
        },
        refetchOnWindowFocus: true,
    });

    const gmailAddress = gmailData?.accounts?.[0]?.gmail_address ?? null;
    const outlookAddress = microsoftData?.accounts?.[0]?.outlook_address ?? null;
    const connectedEmail = gmailAddress || outlookAddress;
    const isInProgress =
        latestSweep?.status === "pending" || latestSweep?.status === "processing";

    // Set default selected email when accounts load
    useEffect(() => {
        if (!selectedEmail) {
            if (gmailData?.accounts && gmailData.accounts.length > 0) {
                setSelectedEmail(gmailData.accounts[0].gmail_address);
                setSelectedProvider("gmail");
            } else if (microsoftData?.accounts && microsoftData.accounts.length > 0) {
                setSelectedEmail(microsoftData.accounts[0].outlook_address);
                setSelectedProvider("outlook");
            }
        }
    }, [gmailData?.accounts, microsoftData?.accounts, selectedEmail]);

    // Toast notifications for completed/failed sweeps
    useEffect(() => {
        if (!latestSweep?.sweepId) return;

        const sweepKey = `${latestSweep.sweepId}-${latestSweep.status}`;

        if (lastNotifiedStatus === sweepKey) return;

        if (latestSweep.status === "completed") {
            setLastNotifiedStatus(sweepKey);

            Promise.all([
                queryClient.invalidateQueries({ queryKey: ["user_services"] }),
                queryClient.invalidateQueries({ queryKey: ["user_breaches"] }),
                queryClient.invalidateQueries({ queryKey: ["metrics"] }),
                queryClient.invalidateQueries({ queryKey: ["deletion_requests"] }),
                queryClient.invalidateQueries({ queryKey: ["notifications", "latest"] }),
                queryClient.invalidateQueries({ queryKey: ["plan"] }),
            ]);

            toast.success("Sweep complete — here's what has your data", {
                description: `Detected ${latestSweep.servicesFound || 0} accounts${latestSweep.breachesFound
                    ? `, including ${latestSweep.breachesFound} breached`
                    : ""
                    }. The riskiest ones are waiting in your dashboard.`,
            });
        }

        if (latestSweep.status === "cancelled") {
            setLastNotifiedStatus(sweepKey);

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

    const getElapsedMinutes = () => {
        if (!latestSweep?.startedAt) return 0;
        const elapsed = Date.now() - new Date(latestSweep.startedAt).getTime();
        return Math.floor(elapsed / 60000);
    };

    useEffect(() => {
        if (!isInProgress || !latestSweep?.startedAt) return;

        const elapsedMinutes = getElapsedMinutes();

        if (elapsedMinutes >= 3 && !sweepLongNotified) {
            setSweepLongNotified(true);
            toast.info("Sweep in progress", {
                description: "Processing your inbox. This can take up to 5 minutes depending on your email volume. You can leave this window open and we'll keep working.",
            });
        }

        if (latestSweep?.status === "completed" || latestSweep?.status === "failed") {
            setSweepLongNotified(false);
        }
    }, [latestSweep?.startedAt, latestSweep?.status, isInProgress, sweepLongNotified]);

    const onSweep = async () => {
        if (isInProgress) {
            toast.info("Sweep already running", {
                description: `Your sweep is ${latestSweep?.status}. Check the banner above for progress.`,
            });
            setSweepDialogOpen(false);
            return;
        }

        if (!selectedEmail || !selectedProvider) {
            toast.error("No account selected", {
                description: "Please select an email account to scan.",
            });
            return;
        }

        toast.info("Starting your GhostSweep in the background…", {
            description: "Processing your inbox. This typically takes 2-5 minutes depending on your email volume. You can close this window and we'll keep working.",
        });

        try {
            const params = new URLSearchParams({
                email: selectedEmail,
                email_provider: selectedProvider,
            });
            const url = `/api/sweep/run?${params.toString()}`;
            const res = await fetch(url, { method: "GET" });
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
                    refetchLatestSweep();
                    return;
                } else {
                    throw new Error(json.error || "Sweep failed");
                }
            }

            refetchLatestSweep();
            setSweepDialogOpen(false);
        } catch (error) {
            console.error("Error starting sweep:", error);
            toast.error("Failed to start sweep", {
                description: "Please try again later.",
            });
        }
    };

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
    });

    // Helper to get display info for selected email
    const getSelectedEmailDisplay = (): { email: string; provider: "gmail" | "outlook" } | null => {
        if (!selectedEmail) return null;

        const isGmail = gmailData?.accounts?.some(acc => acc.gmail_address === selectedEmail);
        return {
            email: selectedEmail,
            provider: isGmail ? "gmail" : "outlook"
        };
    };

    const selectedDisplay = getSelectedEmailDisplay();

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
                                <EmailIcon type={gmailAddress ? "gmail" : "outlook"} />
                                <span className="hidden sm:inline">Connected:&nbsp;</span>
                                <span className="max-w-[140px] truncate sm:max-w-[200px]">
                                    {connectedEmail}
                                </span>
                                {gmailAddress && outlookAddress && (
                                    <span className="ml-1 rounded-full bg-emerald-500/20 px-1.5 py-0.5 text-[10px] font-medium">
                                        +1
                                    </span>
                                )}
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

            {/* Background sweep banner */}
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
                        {/* Account selector */}
                        {!isInProgress && connectedEmail && (
                            <div className="space-y-2">
                                <label className="text-xs font-medium text-white/80">
                                    Select account to scan:
                                </label>
                                <Select
                                    value={selectedEmail}
                                    onValueChange={(value) => {
                                        setSelectedEmail(value);
                                        console.log(value);
                                        const isGmail = gmailData?.accounts?.some(acc => acc.gmail_address === value);
                                        setSelectedProvider(isGmail ? "gmail" : "outlook");
                                    }}
                                >
                                    <SelectTrigger className="w-full bg-black/40 border-white/20 text-white">
                                        <SelectValue>
                                            {selectedDisplay && (
                                                <div className="flex items-center gap-2">
                                                    <EmailIcon type={selectedDisplay.provider} />
                                                    <span className="truncate">{selectedDisplay.email}</span>
                                                </div>
                                            )}
                                        </SelectValue>
                                    </SelectTrigger>
                                    <SelectContent className="bg-[#0a0a0a] border-white/20">
                                        {gmailData?.accounts?.map((account) => (
                                            <SelectItem
                                                key={account.id}
                                                value={account.gmail_address}
                                                className="text-white hover:bg-white/10"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <GmailLogo className="h-3.5 w-3.5" />
                                                    <span>{account.gmail_address}</span>
                                                </div>
                                            </SelectItem>
                                        ))}
                                        {microsoftData?.accounts?.map((account) => (
                                            <SelectItem
                                                key={account.id}
                                                value={account.outlook_address}
                                                className="text-white hover:bg-white/10"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <OutLookLogo className="h-3.5 w-3.5" />
                                                    <span>{account.outlook_address}</span>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

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
                                {/* Show info about selected account */}
                                {selectedDisplay && (
                                    <p className="text-white/60 flex items-center gap-2">
                                        <EmailIcon type={selectedDisplay.provider} />
                                        <span>Will scan</span>
                                        <span className="font-medium text-white truncate max-w-[200px] sm:max-w-[260px]">
                                            {selectedDisplay.email}
                                        </span>
                                    </p>
                                )}
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
                            </>
                        )}

                        {/* Connection options */}
                        {!isInProgress && (
                            <div className="space-y-2 rounded-lg border border-cyan-500/20 bg-cyan-500/5 p-3">
                                {!connectedEmail ? (
                                    <>
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
                                    </>
                                ) : (
                                    <div>
                                        <p className="text-xs font-medium text-cyan-300 mb-2">Connect more accounts:</p>
                                        <div className="flex flex-wrap gap-2">
                                            <Link
                                                href="/api/google/oauth/start"
                                                onClick={() => setIsConnecting(true)}
                                            >
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    disabled={isConnecting}
                                                    className="inline-flex items-center gap-1.5 border-white/20 text-xs"
                                                >
                                                    <GmailLogo className="h-3.5 w-3.5" />
                                                    {isConnecting ? "Connecting..." : "Add Gmail"}
                                                </Button>
                                            </Link>
                                            <Link
                                                href="/api/microsoft/oauth"
                                                onClick={() => setIsConnecting(true)}
                                            >
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    disabled={isConnecting}
                                                    className="inline-flex items-center gap-1.5 border-white/20 text-xs"
                                                >
                                                    <OutLookLogo className="h-3.5 w-3.5" />
                                                    {isConnecting ? "Connecting..." : "Add Outlook"}
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                )}
                            </div>
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
                                        disabled={!selectedEmail}
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
                                                className="w-full sm:w-auto min-w-[130px] bg-red-600 hover:bg-red-700 text-white inline-flex items-center gap-1.5"
                                            >
                                                {isConnecting ? (
                                                    <>
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                        Connecting…
                                                    </>
                                                ) : (
                                                    <>
                                                        <GmailLogo className="h-3.5 w-3.5" />
                                                        Connect Gmail
                                                    </>
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
                                                className="w-full sm:w-auto min-w-[130px] bg-blue-600 hover:bg-blue-700 text-white inline-flex items-center gap-1.5"
                                            >
                                                {isConnecting ? (
                                                    <>
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                        Connecting…
                                                    </>
                                                ) : (
                                                    <>
                                                        <OutLookLogo className="h-3.5 w-3.5" />
                                                        Connect Outlook
                                                    </>
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
