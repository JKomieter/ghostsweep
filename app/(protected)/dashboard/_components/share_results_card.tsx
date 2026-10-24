"use client";

import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Check, Download, Link2, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { shareHeadline, shareText, shareUrl } from "@/lib/share";

// "Share your ghost-account count": a results card people can post, carrying their referral link.
export default function ShareResultsCard() {
    const ref = useRef<HTMLElement>(null);
    const [copied, setCopied] = useState(false);

    const { data: overview } = useQuery<{ oldAccounts: number }>({
        queryKey: ["dashboard-overview"],
        queryFn: async () => {
            const res = await fetch("/api/dashboard/overview");
            if (!res.ok) throw new Error("Failed to fetch overview");
            return res.json();
        },
        staleTime: 5 * 60 * 1000,
    });
    const { data: referral } = useQuery<{ referral_code: string | null }>({
        queryKey: ["referralCode"],
        queryFn: async () => {
            const res = await fetch("/api/referral-code");
            if (!res.ok) throw new Error("Failed to fetch referral code");
            return res.json();
        },
        staleTime: 5 * 60 * 1000,
    });

    const count = overview?.oldAccounts ?? 0;

    // Post-scan emails link to /dashboard?share=1
    useEffect(() => {
        if (count > 0 && new URLSearchParams(window.location.search).get("share") === "1") {
            ref.current?.scrollIntoView({ behavior: "smooth", block: "center" });
            if (ref.current) ref.current.dataset.highlight = "true";
        }
    }, [count]);

    if (count === 0) return null;

    const url = shareUrl(count, referral?.referral_code);
    const text = shareText(count);
    const image = `/api/og/share?n=${count}`;

    const copy = async () => {
        try {
            await navigator.clipboard.writeText(`${text} ${url}`);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // Clipboard can be blocked; the share buttons still work
        }
    };

    const nativeShare = async () => {
        try {
            await navigator.share({ title: shareHeadline(count), text, url });
        } catch {
            // Cancelled or unsupported
        }
    };

    const download = async () => {
        const blob = await fetch(image).then((r) => r.blob());
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = "my-ghost-accounts.png";
        a.click();
        URL.revokeObjectURL(a.href);
    };

    const canNativeShare = typeof navigator !== "undefined" && typeof navigator.share === "function";

    return (
        <section
            ref={ref}
            className="rounded-lg border border-foreground/5 bg-foreground/2 p-6 transition-colors data-[highlight=true]:border-emerald-500/50 data-[highlight=true]:bg-emerald-500/5"
        >
            <div className="grid gap-6 md:grid-cols-[1fr_1.1fr] md:items-center">
                <div className="space-y-3">
                    <div className="text-sm font-medium text-foreground">Share your ghost-account count</div>
                    <p className="text-sm text-foreground/60">
                        Friends who sign up with your link get <span className="font-medium text-foreground">50% off</span>, and you get{" "}
                        <span className="font-medium text-foreground">a free month</span> for each one who upgrades.
                    </p>
                    <div className="flex flex-wrap gap-2 pt-1">
                        {canNativeShare && (
                            <Button size="sm" onClick={nativeShare} className="bg-emerald-500 text-black hover:bg-emerald-400">
                                <Share2 className="mr-1.5 h-3.5 w-3.5" /> Share
                            </Button>
                        )}
                        <Button size="sm" variant="outline" asChild>
                            <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`} target="_blank" rel="noopener noreferrer">
                                Post on X
                            </a>
                        </Button>
                        <Button size="sm" variant="outline" asChild>
                            <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`} target="_blank" rel="noopener noreferrer">
                                LinkedIn
                            </a>
                        </Button>
                        <Button size="sm" variant="outline" onClick={copy}>
                            {copied ? <Check className="mr-1.5 h-3.5 w-3.5" /> : <Link2 className="mr-1.5 h-3.5 w-3.5" />}
                            {copied ? "Copied" : "Copy link"}
                        </Button>
                        <Button size="sm" variant="ghost" onClick={download} className="text-foreground/60">
                            <Download className="mr-1.5 h-3.5 w-3.5" /> Image
                        </Button>
                    </div>
                </div>
                {/* eslint-disable-next-line @next/next/no-img-element -- generated on demand, nothing to optimise */}
                <img src={image} alt={shareHeadline(count)} className="w-full rounded-xl border border-foreground/10" />
            </div>
        </section>
    );
}
