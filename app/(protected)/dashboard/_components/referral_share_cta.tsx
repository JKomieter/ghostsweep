"use client"

import { useState } from "react";
import { Check, Copy, Link, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { useQuery } from "@tanstack/react-query";

export default function ReferralShareCta() {
    const [isCopied, setIsCopied] = useState(false);

    const { data, status, refetch } = useQuery({
        queryKey: ['referralCode'],
        queryFn: async () => {
            const response = await fetch('/api/referral-code');
            if (!response.ok) {
                throw new Error('Failed to fetch referral code');
            }
            return response.json();
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
    })

    const referralCode = data?.referral_code ?? "";
    const isReady = status === "success" && Boolean(referralCode);
    const isPending = status === "pending";
    const isError = status === "error" || (status === "success" && !referralCode);

    const displayLink = isReady
        ? `ghostsweep.com/login?ref=${referralCode}`
        : "ghostsweep.com/login";
    const shareLink = isReady
        ? `https://ghostsweep.com/login?ref=${referralCode}`
        : "https://ghostsweep.com/login";
    const shareMessage = isReady
        ? `Yo! I've been using GhostSweep to find my forgotten accounts and hidden subscriptions. It found $140 in gift cards I missed. Use my link to get 50% off your first month: ghostsweep.com/login?ref=${referralCode}`
        : "Yo! I've been using GhostSweep to find my forgotten accounts and hidden subscriptions. Use this link to get 50% off your first month: ghostsweep.com/login";

    const handleCopy = async () => {
        if (!isReady) {
            return;
        }

        try {
            await navigator.clipboard.writeText(shareMessage);
            setIsCopied(true);
        } catch {
            setIsCopied(false);
        }
    };

    const handleShare = async () => {
        if (!isReady) {
            return;
        }

        if (navigator.share) {
            try {
                await navigator.share({
                    title: "GhostSweep",
                    text: shareMessage,
                    url: shareLink,
                });
            } catch {
                // Ignore share dismissal errors
            }
            return;
        }

        await handleCopy();
    };

    return (
        <div className="rounded-xl border border-border bg-card p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-1">
                <p className="text-sm font-semibold text-foreground">Share GhostSweep. Get a free month.</p>
                <p className="text-sm text-muted-foreground">
                    Send your invite link with a pre-written message in seconds.
                </p>
            </div>
            <Dialog
                onOpenChange={(open) => {
                    if (!open) {
                        setIsCopied(false);
                    }
                }}
            >
                <DialogTrigger asChild>
                    <Button size="lg" className="w-full sm:w-auto">
                        Get a Free Month
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Copy & Share Your Invite</DialogTitle>
                        <DialogDescription>
                            Send this link with a ready-to-go message to earn a free month.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        {isPending && (
                            <p className="text-xs text-muted-foreground">
                                Fetching your personal invite link…
                            </p>
                        )}
                        {isError && (
                            <div className="rounded-lg border border-amber-200 bg-amber-50/80 p-3 text-xs text-amber-800">
                                We couldn’t load your referral link yet. Try again in a moment.
                                <div className="mt-2">
                                    <Button variant="outline" size="sm" onClick={() => refetch()}>
                                        Try again
                                    </Button>
                                </div>
                            </div>
                        )}
                        <div className="rounded-lg border border-border bg-muted/40 p-3 text-sm text-foreground flex items-center gap-2">
                            <Link className="size-4 text-muted-foreground" />
                            <span className="break-all">{displayLink}</span>
                        </div>
                        <div className="rounded-lg border border-border bg-muted/30 p-3 text-xs text-muted-foreground leading-relaxed">
                            {shareMessage}
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2">
                            <Button
                                onClick={handleCopy}
                                disabled={!isReady}
                                className={
                                    isCopied
                                        ? "bg-emerald-600 text-white hover:bg-emerald-600"
                                        : ""
                                }
                            >
                                {isCopied ? (
                                    <>
                                        <Check />
                                        Copied!
                                    </>
                                ) : (
                                    <>
                                        <Copy />
                                        Copy Link
                                    </>
                                )}
                            </Button>
                            <Button variant="outline" onClick={handleShare} disabled={!isReady}>
                                <Share2 />
                                Share Now
                            </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Tip: The share button opens your phone’s native share sheet.
                        </p>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
