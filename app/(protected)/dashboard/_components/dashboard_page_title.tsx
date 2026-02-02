// components/dashboard-title.tsx
"use client";

import { useEffect, useCallback } from "react";
import { useMutation, useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import SweepDialog from "./sweep_dialog";
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
                action: plan?.current_plan === "free" ? {
                    label: "Upgrade",
                    onClick: () => {
                        window.location.href = "/dashboard/billing?plan=monthly";
                    },
                } : undefined,
            });

            pixel.event("Search", {
                content_category: "email_scan",
                accounts_found: latestSweep.servicesFound || 0,
                breaches_found: latestSweep.breachesFound || 0,
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

            // Check if it's an OAuth/token error
            const isOAuthError = latestSweep.errorMessage?.toLowerCase().includes('token') ||
                                 latestSweep.errorMessage?.toLowerCase().includes('expired') ||
                                 latestSweep.errorMessage?.toLowerCase().includes('revoked') ||
                                 latestSweep.errorMessage?.toLowerCase().includes('oauth') ||
                                 latestSweep.errorMessage?.toLowerCase().includes('reconnect');
            
            if (isOAuthError) {
                toast.error("Account reconnection required", {
                    description: "Your email access has expired. Please reconnect your account to continue.",
                    duration: 10000,
                    action: {
                        label: "Reconnect",
                        onClick: () => {
                            // Redirect to appropriate OAuth based on error message
                            if (latestSweep.errorMessage?.toLowerCase().includes('outlook') || 
                                latestSweep.errorMessage?.toLowerCase().includes('microsoft')) {
                                window.location.href = "/api/microsoft/oauth";
                            } else {
                                window.location.href = "/api/google/oauth/start";
                            }
                        },
                    },
                });
            } else {
                toast.error("Sweep failed", {
                    description: latestSweep.errorMessage || "Your inbox sweep encountered an error. Please try again later.",
                });
            }
        }
    }, [
        latestSweep?.sweepId,
        latestSweep?.status,
        latestSweep?.servicesFound,
        latestSweep?.breachesFound,
        lastNotifiedStatus,
        queryClient,
        latestSweep?.errorMessage,
        plan?.current_plan
    ]);

    const getElapsedMinutes = useCallback(() => {
        if (!latestSweep?.startedAt) return 0;
        const elapsed = Date.now() - new Date(latestSweep.startedAt).getTime();
        return Math.floor(elapsed / 60000);
    }, [latestSweep?.startedAt]);

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
    }, [latestSweep?.startedAt, latestSweep?.status, isInProgress, sweepLongNotified, getElapsedMinutes]);

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
    // const getSelectedEmailDisplay = (): { email: string; provider: "gmail" | "outlook" } | null => {
    //     if (!selectedEmail) return null;

    //     const isGmail = gmailData?.accounts?.some(acc => acc.gmail_address === selectedEmail);
    //     return {
    //         email: selectedEmail,
    //         provider: isGmail ? "gmail" : "outlook"
    //     };
    // };

    // const selectedDisplay = getSelectedEmailDisplay();

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
                    <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors">
                        {connectedEmail ? (
                            <>
                                <div className="flex items-center gap-1.5 border-emerald-500/30 bg-emerald-500/10 text-emerald-100">
                                    <EmailIcon type={gmailAddress ? "gmail" : "outlook"} />
                                    <span className="hidden sm:inline text-emerald-200">
                                        {connectedEmail}
                                    </span>
                                    {gmailAddress && outlookAddress && (
                                        <span className="ml-0.5 rounded-full bg-emerald-400/20 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-100">
                                            +1 more
                                        </span>
                                    )}
                                </div>
                            </>
                        ) : (
                            <span className="border-yellow-500/30 bg-yellow-500/10 text-yellow-200">
                                Connect email
                            </span>
                        )}
                    </div>

                    {/* Run Sweep button */}
                    <Button
                        size="sm"
                        className="w-full sm:w-auto bg-cyan-500 hover:bg-cyan-600 text-white font-medium transition-colors"
                        onClick={() => setSweepDialogOpen(true)}
                        disabled={isInProgress}
                    >
                        {isInProgress ? (
                            <span className="flex items-center gap-2">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                {getButtonText()}
                            </span>
                        ) : !connectedEmail ? (
                            "Connect Account"
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

            {/* OAuth Error Banner - shows when last sweep failed due to token issue */}
            {latestSweep?.status === "failed" && latestSweep?.errorMessage && 
             (latestSweep.errorMessage.toLowerCase().includes('token') ||
              latestSweep.errorMessage.toLowerCase().includes('expired') ||
              latestSweep.errorMessage.toLowerCase().includes('revoked') ||
              latestSweep.errorMessage.toLowerCase().includes('reconnect')) && (
                <div className="mb-4 flex flex-col gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start gap-3">
                        <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
                        <div>
                            <p className="font-medium text-amber-100">Account Reconnection Required</p>
                            <p className="text-xs text-amber-200/80 mt-0.5">
                                Your email access token has expired. Please reconnect your account to continue scanning.
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-2 ml-8 sm:ml-0">
                        {gmailData?.accounts && gmailData.accounts.length > 0 && (
                            <a href="/api/google/oauth/start">
                                <Button size="sm" variant="outline" className="gap-1.5 border-amber-500/30 text-amber-100 hover:bg-amber-500/20 text-xs">
                                    <RefreshCw className="h-3.5 w-3.5" />
                                    Reconnect Gmail
                                </Button>
                            </a>
                        )}
                        {microsoftData?.accounts && microsoftData.accounts.length > 0 && (
                            <a href="/api/microsoft/oauth">
                                <Button size="sm" variant="outline" className="gap-1.5 border-amber-500/30 text-amber-100 hover:bg-amber-500/20 text-xs">
                                    <RefreshCw className="h-3.5 w-3.5" />
                                    Reconnect Outlook
                                </Button>
                            </a>
                        )}
                    </div>
                </div>
            )}

            {/* SWEEP DIALOG */}
            <SweepDialog
                open={sweepDialogOpen}
                onOpenChangeAction={setSweepDialogOpen}
                isInProgress={isInProgress}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                latestSweep={latestSweep as any}
                getElapsedMinutesAction={getElapsedMinutes}
                connectedEmail={connectedEmail}
                gmailAccounts={gmailData?.accounts || []}
                microsoftAccounts={microsoftData?.accounts || []}
                selectedEmail={selectedEmail}
                selectedProvider={selectedProvider}
                onChangeSelectedAction={(email, provider) => {
                    setSelectedEmail(email);
                    setSelectedProvider(provider);
                }}
                planIsFree={plan?.current_plan === "free"}
                isConnecting={isConnecting}
                onStartConnectAction={() => setIsConnecting(true)}
                onSweepAction={onSweep}
                onCancelAction={() => onCancelSweep.mutate()}
                isCancelling={isCancelling}
            />
        </>
    );
}
