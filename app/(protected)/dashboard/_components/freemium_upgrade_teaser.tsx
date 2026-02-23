"use client";

import { useQuery } from "@tanstack/react-query";
import { X, DollarSign, Mail, Ghost, Shield, Zap, ArrowRight } from "lucide-react";
import { useState, useMemo } from "react";
import Link from "next/link";

type PlanData = {
    current_plan: "free" | "buster" | "pro";
    renews_at: string | null;
    has_used_trial: boolean;
    scan_credits_remaining?: number;
};

type OverviewData = {
    totalValue: number;
    totalSubs: number;
    newsletters: number;
    oldAccounts: number;
};

type LatestSweepData = {
    sweepId: string | null;
    status: "pending" | "processing" | "completed" | "failed" | "cancelled" | null;
    servicesFound?: number;
    breachesFound?: number;
    completedAt?: string | null;
};

export default function FreemiumUpgradeTeaser() {
    const [dismissed, setDismissed] = useState(false);

    // Fetch plan
    const { data: planData } = useQuery<PlanData>({
        queryKey: ["plan"],
        queryFn: async () => {
            const res = await fetch("/api/plan");
            if (!res.ok) throw new Error("Failed to fetch plan");
            return res.json();
        },
    });

    // Fetch overview stats
    const { data: overviewData } = useQuery<OverviewData>({
        queryKey: ["dashboard-overview"],
        queryFn: async () => {
            const res = await fetch("/api/dashboard/overview");
            if (!res.ok) throw new Error("Failed to fetch overview");
            return res.json();
        },
    });

    // Fetch latest sweep
    const { data: sweepData } = useQuery<LatestSweepData>({
        queryKey: ["latestSweep"],
        queryFn: async () => {
            const res = await fetch("/api/sweep/latest");
            if (!res.ok) throw new Error("Failed to fetch sweep");
            return res.json();
        },
    });

    // Check if dismissed from sessionStorage (derived, not effect-based)
    const isDismissedFromStorage = useMemo(() => {
        if (typeof window === "undefined" || !sweepData?.sweepId) return false;
        const dismissedKey = `freemium_teaser_dismissed_${sweepData.sweepId}`;
        return sessionStorage.getItem(dismissedKey) === "true";
    }, [sweepData?.sweepId]);

    const handleDismiss = () => {
        setDismissed(true);
        if (sweepData?.sweepId) {
            sessionStorage.setItem(`freemium_teaser_dismissed_${sweepData.sweepId}`, "true");
        }
    };

    // Only show for free users after sweep is completed
    const isBusterAudited = planData?.current_plan === "buster" && (planData?.scan_credits_remaining ?? 0) === 0;
    const isFree = planData?.current_plan === "free";
    const sweepCompleted = sweepData?.status === "completed";
    const hasData = (overviewData?.totalValue || 0) > 0 || 
                   (overviewData?.newsletters || 0) > 0 || 
                   (overviewData?.oldAccounts || 0) > 0;

    if (!isFree || !sweepCompleted || !hasData || dismissed || isDismissedFromStorage) {
        return null;
    }

    const totalValue = overviewData?.totalValue || 0;
    const newsletters = overviewData?.newsletters || 0;
    const accounts = overviewData?.oldAccounts || 0;
    const breaches = sweepData?.breachesFound || 0;

    return (
        <div className="relative overflow-hidden rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 via-black/40 to-purple-500/10 p-6 md:p-8 mb-8">
            {/* Background decoration */}
            <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-emerald-500/10 blur-3xl" />
            <div className="absolute -bottom-24 -left-24 h-48 w-48 rounded-full bg-purple-500/10 blur-3xl" />
            
            {/* Dismiss button */}
            <button 
                onClick={handleDismiss}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 text-white/40 hover:text-white/70 transition"
                aria-label="Dismiss"
            >
                <X className="h-4 w-4" />
            </button>

            <div className="relative z-10">
                {/* Header */}
                <div className="flex items-center gap-2 mb-4">
                    <div className="flex items-center justify-center h-8 w-8 rounded-full bg-emerald-500/20">
                        <Zap className="h-4 w-4 text-emerald-400" />
                    </div>
                    <span className="text-xs font-semibold uppercase tracking-widest text-emerald-400">
                        Sweep Complete
                    </span>
                </div>

                <h2 className="text-2xl md:text-3xl font-light text-white mb-3">
                    Quick Scan Complete — Go Deeper?
                </h2>
                <p className="text-white/60 mb-6 max-w-xl">
                    Your free scan checked the last <span className="text-white font-medium">2 years</span> of email headers. 
                    Upgrade to our <span className="text-emerald-400 font-medium">Deep Audit</span> for <span className="text-emerald-400 font-medium">5 years</span> of full analysis.
                </p>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    {totalValue > 0 && (
                        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <DollarSign className="h-4 w-4 text-emerald-400" />
                                <span className="text-[10px] uppercase tracking-wider text-emerald-400/70 font-semibold">Hidden Value</span>
                            </div>
                            <div className="text-2xl font-light text-white">
                                <span className="blur-sm select-none">${totalValue.toLocaleString()}</span>
                            </div>
                            <div className="text-xs text-white/40 mt-1">in coupons & rewards</div>
                        </div>
                    )}

                    {newsletters > 0 && (
                        <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <Mail className="h-4 w-4 text-blue-400" />
                                <span className="text-[10px] uppercase tracking-wider text-blue-400/70 font-semibold">Newsletters</span>
                            </div>
                            <div className="text-2xl font-light text-white">{newsletters}</div>
                            <div className="text-xs text-white/40 mt-1">cluttering your inbox</div>
                        </div>
                    )}

                    {accounts > 0 && (
                        <div className="rounded-xl border border-purple-500/20 bg-purple-500/5 p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <Ghost className="h-4 w-4 text-purple-400" />
                                <span className="text-[10px] uppercase tracking-wider text-purple-400/70 font-semibold">Accounts</span>
                            </div>
                            <div className="text-2xl font-light text-white">{accounts}</div>
                            <div className="text-xs text-white/40 mt-1">holding your data</div>
                        </div>
                    )}

                    {breaches > 0 && (
                        <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <Shield className="h-4 w-4 text-red-400" />
                                <span className="text-[10px] uppercase tracking-wider text-red-400/70 font-semibold">Breaches</span>
                            </div>
                            <div className="text-2xl font-light text-white">{breaches}</div>
                            <div className="text-xs text-white/40 mt-1">exposing your data</div>
                        </div>
                    )}
                </div>

                {/* What you get with Pro */}
                <div className="border-t border-white/5 pt-6 mb-6">
                    <div className="text-xs uppercase tracking-widest text-white/40 mb-4 font-semibold">
                        Deep Audit vs Quick Scan
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        {/* Quick Scan (current) */}
                        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                            <div className="text-xs font-semibold uppercase tracking-wider text-white/40 mb-3">Quick Scan (Free)</div>
                            <ul className="space-y-2 text-sm text-white/50">
                                <li className="flex items-center gap-2">
                                    <span className="text-white/30">•</span> Last 2 years
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="text-white/30">•</span> Headers only
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="text-white/30">•</span> Preview mode
                                </li>
                            </ul>
                        </div>
                        {/* Deep Audit (Pro) */}
                        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4">
                            <div className="text-xs font-semibold uppercase tracking-wider text-emerald-400 mb-3">Deep Audit (Pro)</div>
                            <ul className="space-y-2 text-sm text-white/80">
                                <li className="flex items-center gap-2">
                                    <span className="text-emerald-400">✓</span> Full 5 years
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="text-emerald-400">✓</span> Content analysis
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="text-emerald-400">✓</span> Full access
                                </li>
                            </ul>
                        </div>
                    </div>
                    <div className="text-xs uppercase tracking-widest text-white/40 mb-4 font-semibold">
                        With GhostSweep Pro, you can:
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex items-start gap-3">
                            <div className="mt-0.5 h-5 w-5 rounded-full bg-emerald-500/20 flex items-center justify-center">
                                <DollarSign className="h-3 w-3 text-emerald-400" />
                            </div>
                            <div>
                                <div className="text-sm text-white font-medium">Reveal Hidden Value</div>
                                <div className="text-xs text-white/40">Unlock gift cards, coupons & rewards</div>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="mt-0.5 h-5 w-5 rounded-full bg-blue-500/20 flex items-center justify-center">
                                <Mail className="h-3 w-3 text-blue-400" />
                            </div>
                            <div>
                                <div className="text-sm text-white font-medium">Bulk Unsubscribe</div>
                                <div className="text-xs text-white/40">Clean your inbox in one click</div>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="mt-0.5 h-5 w-5 rounded-full bg-purple-500/20 flex items-center justify-center">
                                <Ghost className="h-3 w-3 text-purple-400" />
                            </div>
                            <div>
                                <div className="text-sm text-white font-medium">Delete Accounts</div>
                                <div className="text-xs text-white/40">Remove your data from the web</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* CTA */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <Link
                        href="/dashboard/billing?plan=monthly"
                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 px-6 py-3 text-sm font-semibold text-black transition group"
                    >
                        {planData?.has_used_trial ? "Upgrade to Pro" : "Start Free Trial"}
                        <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                    <div className="flex items-center gap-3 text-sm text-white/50">
                        {planData?.has_used_trial ? (
                            <span>Starting at $19.99/month</span>
                        ) : (
                            <span>3-day free trial, then $19.99/mo</span>
                        )}
                        <span className="text-white/20">•</span>
                        <span>Cancel anytime</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
