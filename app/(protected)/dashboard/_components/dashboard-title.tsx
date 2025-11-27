"use client";

import { useState } from "react";
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

export default function DashboardTitle() {
    const [isSweeping, setIsSweeping] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);
    const [sweepDialogOpen, setSweepDialogOpen] = useState(false);
    const queryClient = useQueryClient();

    const { data } = useQuery({
        queryKey: ["gmailAccount"],
        queryFn: async (): Promise<{ gmail_address: string | null }> => {
            const res = await fetch("/api/gmail_account");
            if (!res.ok) {
                throw new Error("Failed to fetch Gmail account");
            }
            return res.json();
        },
        refetchOnWindowFocus: false,
    });

    const { data: plan } = useQuery({
        queryKey: ['plan'],
        queryFn: async (): Promise<{ current_plan: "free" | "pro" }> => {
            const res = await fetch('/api/plan', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!res.ok) {
                throw new Error('Failed to fetch plan data');
            }

            return res.json();
        },
    })

    const gmailAddress = data?.gmail_address ?? null;

    const onSweep = async () => {
        toast(() => (
            <div className="flex flex-col gap-1">
                <span> Sweeping your inbox… this may take up to 30–60 seconds. </span>
                <span className="text-xs text-muted-foreground">
                    Please keep this page open and don’t refresh.
                </span>
            </div>
        ));

        try {
            setIsSweeping(true);

            const res = await fetch("/api/sweep/run");
            const json = await res.json();

            if (!res.ok) {
                if (json.code === "GMAIL_ACCOUNT_NOT_FOUND") {
                    toast.error("No Gmail account connected. Please connect your Gmail first.");
                    return;
                } else if (json.code === "MONTHLY_LIMIT_REACHED") {
                    toast.error(() => (
                        <div>
                            <span className="font-medium">You’ve hit your monthly sweep limit</span>
                            <p className="text-sm text-muted-foreground">
                                Stay protected. Go Professional for unlimited sweeps and detailed insights.
                            </p>
                            <Link href="/dashboard/billing?plan=monthly">
                                <Button variant="outline" size="sm" className="mt-2">
                                    Upgrade to Professional
                                </Button>
                            </Link>
                        </div>
                    ));
                    return;
                } else {
                    throw new Error(json.error || "Sweep failed");
                }
            }
            if (plan?.current_plan !== "pro") {
                toast.success(() => (
                    <div>
                        <p className="text-sm">
                            Sweep complete. Upgrade to unlock full results, deeper scans, account
                            deletion tracking, and new account detection.
                        </p>
                        <Link href="/dashboard/billing?plan=monthly">
                            <Button size="sm" className="mt-2">
                                Upgrade to Pro
                            </Button>
                        </Link>
                    </div>
                ));
            } else {
                toast.success(() => (
                    <div>
                        <p>
                            Sweep Complete — Your Dashboard Is Updated
                        </p>
                        <p className="text-sm">
                            We’ve analyzed your inbox and refreshed your services, breaches, and insights.
                        </p>
                    </div>
                ))
            }


            await Promise.all([
                queryClient.invalidateQueries({ queryKey: ["gmailAccount"] }),
                queryClient.invalidateQueries({ queryKey: ["services"] }),
                queryClient.invalidateQueries({ queryKey: ["breaches"] }),
                queryClient.invalidateQueries({ queryKey: ["metrics"] }),
            ]);

            setSweepDialogOpen(false);
        } catch (error) {
            console.error("Error running sweep:", error);
            toast.error("Failed to run sweep. Please try again later.");
        } finally {
            setIsSweeping(false);
        }
    };

    return (
        <>
            {/* HEADER */}
            <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
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
                    >
                        Run Sweep
                    </Button>
                </div>
            </div>

            {/* SWEEP DIALOG */}
            <Dialog open={sweepDialogOpen} onOpenChange={setSweepDialogOpen}>
                <DialogContent className="sm:max-w-md bg-[#050505] border border-white/10">
                    <DialogHeader>
                        <DialogTitle className="text-base md:text-lg">
                            Run a GhostSweep
                        </DialogTitle>
                        <DialogDescription className="text-xs text-white/60 md:text-sm">
                            We’ll scan your inbox using{" "}
                            <span className="font-medium">read-only metadata</span> (sender,
                            subject, date) to detect services and known breaches. We never store
                            your email content.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="mt-3 space-y-3 text-xs md:text-sm">
                        {gmailAddress ? (
                            <>
                                <p className="text-white/60">
                                    Connected as{" "}
                                    <span className="font-medium text-white">{gmailAddress}</span>.
                                </p>
                                <p className="text-white/50">
                                    When you start a sweep, GhostSweep will analyze your inbox for
                                    account sign-ups, security alerts, and breach notices.
                                </p>
                            </>
                        ) : (
                            <>
                                <p className="text-yellow-200">
                                    You haven’t connected Gmail yet.
                                </p>
                                <p className="text-white/50">
                                    Connect once to let GhostSweep read metadata and detect where your
                                    data lives. You can disconnect at any time.
                                </p>
                            </>
                        )}
                    </div>

                    {isSweeping && (
                        <div className="mt-3 rounded-md border border-white/10 bg-black/40 px-3 py-2 text-xs text-white/60">
                            <div className="flex items-center gap-2">
                                <Loader2 className="h-3 w-3 animate-spin" />
                                <span>Sweeping your inbox… keep this page open.</span>
                            </div>
                        </div>
                    )}

                    <DialogFooter className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSweepDialogOpen(false)}
                            disabled={isSweeping || isConnecting}
                            className="w-full sm:w-auto"
                        >
                            Cancel
                        </Button>

                        {gmailAddress ? (
                            <Button
                                size="sm"
                                onClick={onSweep}
                                disabled={isSweeping}
                                className="w-full sm:w-auto min-w-[140px]"
                            >
                                {isSweeping ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Sweeping…
                                    </span>
                                ) : (
                                    "Start Sweep"
                                )}
                            </Button>
                        ) : (
                            <Link href="/api/google/oauth/start" onClick={() => setIsConnecting(true)}>
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
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}