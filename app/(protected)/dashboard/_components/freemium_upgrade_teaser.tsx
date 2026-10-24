"use client";

import { useQuery } from "@tanstack/react-query";
import { X, DollarSign, Mail, Ghost, Shield, Zap, ArrowRight, Loader2 } from "lucide-react";
import { useState, useMemo } from "react";
import { useCheckout } from "@/hooks/use-checkout";
import { ANNUAL_MONTHLY_EQUIVALENT, PAID_PLANS, type PaidPlanId, type PlanResponse } from "@/lib/plans";

type PlanData = PlanResponse;

const TEASER_PLANS: { id: PaidPlanId; blurb: string; featured?: boolean }[] = [
    { id: "buster", blurb: "One payment, full cleanup." },
    { id: "pro", blurb: "Unlimited scans & monitoring." },
    { id: "sentinel", blurb: `Best value: just ${ANNUAL_MONTHLY_EQUIVALENT}.`, featured: true },
];

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
    const { startCheckout, pendingPlan } = useCheckout("dashboard_teaser");

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

    // Fetch latest sweep (includeRead so the teaser survives the sweep being marked as seen)
    const { data: sweepData } = useQuery<LatestSweepData>({
        queryKey: ["latestSweep", "includeRead"],
        queryFn: async () => {
            const res = await fetch("/api/sweep/status/latest?includeRead=true");
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
    // const isBusterAudited = planData?.current_plan === "buster" && (planData?.scan_credits_remaining ?? 0) === 0;
    const isFree = planData?.current_plan === "free";
    const sweepCompleted = sweepData?.status === "completed";
    const hasData = (overviewData?.totalValue || 0) > 0 || 
                   (overviewData?.newsletters || 0) > 0 || 
                   (overviewData?.oldAccounts || 0) > 0;

    if (!isFree || !sweepCompleted || !hasData || dismissed || isDismissedFromStorage) {
        return null;
    }

    const totalValue = Math.round(overviewData?.totalValue || 0);
    const newsletters = overviewData?.newsletters || 0;
    const accounts = overviewData?.oldAccounts || 0;
    const breaches = sweepData?.breachesFound || 0;

    return (
        <div className="relative overflow-hidden rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 via-background/40 to-purple-500/10 p-6 md:p-8 mb-8">
            {/* Background decoration */}
            <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-emerald-500/10 blur-3xl" />
            <div className="absolute -bottom-24 -left-24 h-48 w-48 rounded-full bg-purple-500/10 blur-3xl" />
            
            {/* Dismiss button */}
            <button 
                onClick={handleDismiss}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-foreground/10 text-foreground/40 hover:text-foreground/70 transition"
                aria-label="Dismiss"
            >
                <X className="h-4 w-4" />
            </button>

            <div className="relative z-10">
                {/* Header */}
                <div className="flex items-center gap-2 mb-4">
                    <div className="flex items-center justify-center h-8 w-8 rounded-full bg-emerald-500/20">
                        <Zap className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <span className="text-xs font-semibold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                        Sweep Complete
                    </span>
                </div>

                {/* Money first: recovering cash converts better than privacy */}
                {totalValue > 0 ? (
                    <>
                        <h2 className="text-2xl md:text-3xl font-light text-foreground mb-3">
                            <span className="font-medium text-emerald-600 dark:text-emerald-400">${totalValue.toLocaleString()}</span> found in your inbox — unlock to claim it
                        </h2>
                        <p className="text-foreground/60 mb-6 max-w-xl">
                            Your free scan found gift cards, coupons and rewards you haven&apos;t used. Upgrade to see
                            where they are and get every code — and our <span className="text-emerald-600 dark:text-emerald-400 font-medium">Deep Audit</span> goes back <span className="text-emerald-600 dark:text-emerald-400 font-medium">10+ years</span> for more.
                        </p>
                    </>
                ) : (
                    <>
                        <h2 className="text-2xl md:text-3xl font-light text-foreground mb-3">
                            Quick Scan Complete — Go Deeper?
                        </h2>
                        <p className="text-foreground/60 mb-6 max-w-xl">
                            Your free scan checked the last <span className="text-foreground font-medium">2 years</span> of email headers. 
                            Upgrade to our <span className="text-emerald-600 dark:text-emerald-400 font-medium">Deep Audit</span> for <span className="text-emerald-600 dark:text-emerald-400 font-medium">10+ years</span> of full analysis.
                        </p>
                    </>
                )}

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    {totalValue > 0 && (
                        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <DollarSign className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                <span className="text-[10px] uppercase tracking-wider text-emerald-600/70 dark:text-emerald-400/70 font-semibold">Hidden Value</span>
                            </div>
                            <div className="text-2xl font-light text-foreground">${totalValue.toLocaleString()}</div>
                            <div className="text-xs text-foreground/40 mt-1">unlock to claim</div>
                        </div>
                    )}

                    {newsletters > 0 && (
                        <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <Mail className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                <span className="text-[10px] uppercase tracking-wider text-blue-600/70 dark:text-blue-400/70 font-semibold">Newsletters</span>
                            </div>
                            <div className="text-2xl font-light text-foreground">{newsletters}</div>
                            <div className="text-xs text-foreground/40 mt-1">cluttering your inbox</div>
                        </div>
                    )}

                    {accounts > 0 && (
                        <div className="rounded-xl border border-purple-500/20 bg-purple-500/5 p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <Ghost className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                                <span className="text-[10px] uppercase tracking-wider text-purple-600/70 dark:text-purple-400/70 font-semibold">Accounts</span>
                            </div>
                            <div className="text-2xl font-light text-foreground">{accounts}</div>
                            <div className="text-xs text-foreground/40 mt-1">holding your data</div>
                        </div>
                    )}

                    {breaches > 0 && (
                        <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <Shield className="h-4 w-4 text-red-600 dark:text-red-400" />
                                <span className="text-[10px] uppercase tracking-wider text-red-600/70 dark:text-red-400/70 font-semibold">Breaches</span>
                            </div>
                            <div className="text-2xl font-light text-foreground">{breaches}</div>
                            <div className="text-xs text-foreground/40 mt-1">exposing your data</div>
                        </div>
                    )}
                </div>

                {/* What you get with Pro */}
                <div className="border-t border-foreground/5 pt-6 mb-6">
                    <div className="text-xs uppercase tracking-widest text-foreground/40 mb-4 font-semibold">
                        Deep Audit vs Quick Scan
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        {/* Quick Scan (current) */}
                        <div className="rounded-xl border border-foreground/10 bg-foreground/5 p-4">
                            <div className="text-xs font-semibold uppercase tracking-wider text-foreground/40 mb-3">Quick Scan (Free)</div>
                            <ul className="space-y-2 text-sm text-foreground/50">
                                <li className="flex items-center gap-2">
                                    <span className="text-foreground/30">•</span> Last 2 years
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="text-foreground/30">•</span> Headers only
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="text-foreground/30">•</span> Preview mode
                                </li>
                            </ul>
                        </div>
                        {/* Deep Audit (Pro) */}
                        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4">
                            <div className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-3">Deep Audit (Pro)</div>
                            <ul className="space-y-2 text-sm text-foreground/80">
                                <li className="flex items-center gap-2">
                                    <span className="text-emerald-600 dark:text-emerald-400">✓</span> Full 10+ years
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="text-emerald-600 dark:text-emerald-400">✓</span> Content analysis
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="text-emerald-600 dark:text-emerald-400">✓</span> Full access
                                </li>
                            </ul>
                        </div>
                    </div>
                    <div className="text-xs uppercase tracking-widest text-foreground/40 mb-4 font-semibold">
                        When you upgrade, you can:
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex items-start gap-3">
                            <div className="mt-0.5 h-5 w-5 rounded-full bg-emerald-500/20 flex items-center justify-center">
                                <DollarSign className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <div>
                                <div className="text-sm text-foreground font-medium">Reveal Hidden Value</div>
                                <div className="text-xs text-foreground/40">Unlock gift cards, coupons & rewards</div>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="mt-0.5 h-5 w-5 rounded-full bg-blue-500/20 flex items-center justify-center">
                                <Mail className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <div className="text-sm text-foreground font-medium">Bulk Unsubscribe</div>
                                <div className="text-xs text-foreground/40">Clean your inbox in one click</div>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="mt-0.5 h-5 w-5 rounded-full bg-purple-500/20 flex items-center justify-center">
                                <Ghost className="h-3 w-3 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div>
                                <div className="text-sm text-foreground font-medium">Delete Accounts</div>
                                <div className="text-xs text-foreground/40">Remove your data from the web</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* CTA — straight to Stripe checkout */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {TEASER_PLANS.map(({ id, blurb, featured }) => {
                        const plan = PAID_PLANS[id];
                        return (
                            <button
                                key={id}
                                type="button"
                                onClick={() => startCheckout(id)}
                                disabled={pendingPlan !== null}
                                className={`group flex flex-col gap-1 rounded-xl border p-4 text-left transition disabled:opacity-60 ${
                                    featured
                                        ? "border-emerald-500/30 bg-emerald-500/5 hover:border-emerald-500/60 hover:bg-emerald-500/10"
                                        : "border-foreground/10 bg-foreground/5 hover:border-emerald-500/40 hover:bg-emerald-500/5"
                                }`}
                            >
                                <div className="flex items-center justify-between">
                                    <span className={`text-xs font-semibold uppercase tracking-wider ${featured ? "text-emerald-600 dark:text-emerald-400" : "text-foreground/50"}`}>
                                        {plan.name}
                                    </span>
                                    {pendingPlan === id ? (
                                        <Loader2 className="h-3.5 w-3.5 animate-spin text-emerald-600 dark:text-emerald-400" />
                                    ) : (
                                        <ArrowRight className="h-3.5 w-3.5 text-foreground/30 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all" />
                                    )}
                                </div>
                                <div className="text-xl font-semibold text-foreground">
                                    {plan.price}
                                    {plan.period !== "one-time" && <span className="text-sm font-normal text-foreground/50">{plan.period}</span>}
                                </div>
                                <div className="text-[11px] text-foreground/50">{plan.note}</div>
                                <div className="mt-1 text-xs text-foreground/60">{blurb}</div>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
