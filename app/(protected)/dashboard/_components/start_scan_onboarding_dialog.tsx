/* eslint-disable react/no-unescaped-entities */
"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Shield } from "lucide-react";
import { GmailLogo, OutLookLogo } from "@/svgs";

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
    const queryClient = useQueryClient();

    // 1) Fetch eligibility via React Query
    const { data, isPending, isError, error } = useQuery({
        queryKey: ["onboarding", "should-show-scan-popup"],
        queryFn: fetchShouldShow,
        staleTime: 30_000,
        refetchOnWindowFocus: false,
    });

    // Don't interrupt checkout (new users who picked a paid plan land straight on billing)
    const onBilling = usePathname().startsWith("/dashboard/billing");
    const shouldShow = Boolean(data?.shouldShowPopup) && !dismissed && !onBilling;

    // 2) Open 2s after we know we should show
    React.useEffect(() => {
        if (!shouldShow) return;
        const t = setTimeout(() => {
            // Skip it when an inbox is already connected (e.g. they used the dashboard card first);
            // the dashboard header has loaded the account lists by now
            const hasInbox = Boolean(
                queryClient.getQueryData<{ accounts?: unknown[] }>(["gmailAccount"])?.accounts?.length ||
                queryClient.getQueryData<{ accounts?: unknown[] }>(["microsoftAccount"])?.accounts?.length
            );
            if (!hasInbox) setOpen(true);
        }, 2000);
        return () => clearTimeout(t);
    }, [shouldShow, queryClient]);


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
            <DialogContent className="sm:max-w-md bg-background border-foreground/10 text-foreground">
                <DialogHeader>
                    <DialogTitle className="text-xl">Find your forgotten accounts</DialogTitle>
                    <DialogDescription className="text-foreground/60">
                        Your inbox is the map: every sign-up left a welcome email. Here&apos;s how it works.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    <ol className="rounded-xl border border-foreground/10 bg-foreground/5 p-4 space-y-3 text-sm">
                        {[
                            { title: "Connect Gmail or Outlook", text: "Sign in on Google's or Microsoft's own permission screen and allow access." },
                            { title: "Start your scan", text: "You'll come straight back here with your inbox selected. One click starts it." },
                            { title: "See what has your data", text: "Forgotten accounts, breaches and hidden value, ranked by risk." },
                        ].map((step, i) => (
                            <li key={step.title} className="flex items-start gap-3">
                                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-[11px] font-semibold text-black">
                                    {i + 1}
                                </span>
                                <div>
                                    <p className="font-medium text-foreground">{step.title}</p>
                                    <p className="text-xs text-foreground/60 leading-relaxed">{step.text}</p>
                                </div>
                            </li>
                        ))}
                    </ol>

                    <p className="flex items-start gap-2 text-xs text-foreground/60">
                        <Shield className="h-4 w-4 shrink-0 text-emerald-700 dark:text-emerald-300" />
                        Read-only metadata (sender, subject, date). Nothing is stored or sold, and you can disconnect anytime.
                    </p>

                    {/* Actions */}
                    <div className="flex flex-col gap-2">
                        <a href="/api/google/oauth/start" onClick={() => setIsConnecting(true)}>
                            <Button disabled={isConnecting} className="bg-foreground text-background hover:bg-foreground/90 w-full gap-2">
                                {isConnecting ? <Spinner /> : <GmailLogo className="h-4 w-4" />}
                                Connect Gmail
                            </Button>
                        </a>
                        <a href="/api/microsoft/oauth" onClick={() => setIsConnecting(true)}>
                            <Button disabled={isConnecting} variant="outline" className="w-full gap-2 border-foreground/15">
                                <OutLookLogo className="h-4 w-4" />
                                Connect Outlook
                            </Button>
                        </a>
                        <Button variant="ghost" className="text-foreground/60" onClick={onClose}>
                            I&apos;ll do this later
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}