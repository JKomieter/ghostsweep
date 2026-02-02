/* eslint-disable react/no-unescaped-entities */
"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { CheckCircle, Shield, Mail, ArrowRight } from "lucide-react";

type ShouldShowResponse = {
    shouldShowPopup: boolean;
    isNewUser: boolean;
    hasSweepEvent: boolean;
};

async function fetchShouldShow(): Promise<ShouldShowResponse> {
    const res = await fetch("/api/onboarding/should_show_scan_popup", { cache: "no-store" });
    const j = (await res.json().catch(() => ({}))) as ShouldShowResponse & { error?: string };

    if (!res.ok) throw new Error(j?.error || "Failed to check onboarding status");
    return j;
}

export default function StartScanOnboardingDialog() {
    const [open, setOpen] = React.useState(false);
    const [dismissed, setDismissed] = React.useState(false);
    const [isConnecting, setIsConnecting] = React.useState(false);

    // 1) Fetch eligibility via React Query
    const { data, isPending, isError, error } = useQuery({
        queryKey: ["onboarding", "should-show-scan-popup"],
        queryFn: fetchShouldShow,
        staleTime: 30_000,
        refetchOnWindowFocus: false,
    });

    const shouldShow = Boolean(data?.shouldShowPopup) && !dismissed;

    // 2) Open 2s after we know we should show
    React.useEffect(() => {
        if (!shouldShow) return;
        const t = setTimeout(() => setOpen(true), 2000);
        return () => clearTimeout(t);
    }, [shouldShow]);


    // 4) Close handler (don't show again in this session)
    const onClose = () => {
        setOpen(false);
        setDismissed(true);
    };

    if (isPending) return null; // keep it silent
    if (isError) {
        // Silent fail; don't block dashboard UX
        console.warn("onboarding popup error:", (error)?.message);
        return null;
    }

    return (
        <Dialog open={open} onOpenChange={(v) => (v ? setOpen(true) : onClose())}>
            <DialogContent className="sm:max-w-md bg-[#050505] border-white/10 text-white">
                <DialogHeader>
                    <DialogTitle className="text-xl">Start your first sweep</DialogTitle>
                    <DialogDescription className="text-white/60">
                        Connect Gmail so GhostSweep can discover accounts linked to your email.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {/* What will happen */}
                    <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-2">
                        <div className="flex items-start gap-3">
                            <Shield size={30} className="mt-0.5 text-emerald-300" />
                            <div className="text-sm">
                                <p className="font-medium text-white">You stay in control</p>
                                <p className="text-xs text-white/60 leading-relaxed">
                                    During Google OAuth, please allow the requested access so we can scan safely.
                                    <span className="text-white/70"> We don’t run the scan automatically.</span>
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <Mail size={24} className="mt-0.5 text-emerald-300" />
                            <div className="text-sm">
                                <p className="font-medium text-white">Next step after connecting</p>
                                <p className="text-xs text-white/60 leading-relaxed">
                                    Once you're back in GhostSweep, you’ll click <span className="text-white/80 font-medium">Run Sweep</span> to start scanning.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Bullet checklist */}
                    <div className="space-y-2 text-xs text-white/70">
                        <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-emerald-300" />
                            <span>OAuth → grant access → return to dashboard</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-emerald-300" />
                            <span>Click “Run Sweep” to start the scan</span>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-2 sm:justify-end">
                        <Button
                            variant="outline"
                            className="border-white/15 bg-[#050505]"
                            onClick={onClose}
                        >
                            Not now
                        </Button>
                        <a href="/api/google/oauth/start" className="w-auto">
                            <Button
                                className="bg-white text-black hover:bg-zinc-100 w-full"
                                onClick={() => setIsConnecting(true)}
                            >
                                {isConnecting ? (
                                    <span className="flex items-center gap-2">
                                        <Spinner />
                                        Opening Google…
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-2">
                                        Connect Gmail
                                        <ArrowRight className="h-4 w-4" />
                                    </span>
                                )}
                            </Button>
                        </a>
                    </div>

                    {/* Small footer help */}
                    {/* <div className="pt-2 border-t border-white/10 text-[11px] text-white/45 leading-relaxed">
                        Prefer to do this later? You can connect Gmail anytime from{" "}
                        <Link href="/dashboard/settings" className="text-white/70 underline underline-offset-2 hover:text-white">
                            Settings
                        </Link>
                        .
                    </div> */}
                </div>
            </DialogContent>
        </Dialog>
    );
}