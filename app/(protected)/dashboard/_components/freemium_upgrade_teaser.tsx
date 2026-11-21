"use client";

import { useQuery } from "@tanstack/react-query";
import { X, ArrowRight, Loader2 } from "lucide-react";
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
    return (
        <section className="relative rounded-lg border border-foreground/10 bg-card">
            <button
                onClick={handleDismiss}
                className="absolute top-3 right-3 p-1.5 rounded-md text-foreground/55 hover:bg-foreground/[0.05] hover:text-foreground/70 transition-colors"
                aria-label="Dismiss"
            >
                <X className="h-4 w-4" />
            </button>

            <div className="grid gap-8 p-6 md:p-7 lg:grid-cols-[1.2fr_1fr]">
                <div>
                    <p className="font-mono text-xs text-foreground/55">Free scan complete</p>
                    {/* Money first: recovering cash converts better than privacy */}
                    {totalValue > 0 ? (
                        <>
                            <h2 className="mt-2 text-xl md:text-2xl font-medium text-foreground">
                                <span className="font-mono tabular-nums">${totalValue.toLocaleString()}</span> in gift cards and rewards found. Unlock to claim it.
                            </h2>
                            <p className="mt-2 text-sm text-foreground/65 max-w-xl">
                                Upgrade to see where each one is and get every code. The Deep Audit also searches 10+ years of email for more.
                            </p>
                        </>
                    ) : (
                        <>
                            <h2 className="mt-2 text-xl md:text-2xl font-medium text-foreground">Want the full picture?</h2>
                            <p className="mt-2 text-sm text-foreground/65 max-w-xl">
                                Your free scan checked the last 2 years of email headers. The Deep Audit covers 10+ years.
                            </p>
                        </>
                    )}
                </div>

                <table className="w-full self-start text-sm">
                    <thead>
                        <tr className="text-left text-xs text-foreground/55">
                            <th className="pb-2 font-normal" />
                            <th className="pb-2 font-normal">Quick Scan</th>
                            <th className="pb-2 font-medium text-foreground">Deep Audit</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-foreground/10 border-t border-foreground/10">
                        {[
                            ["History", "2 years", "10+ years"],
                            ["Analysis", "Headers only", "Full content"],
                            ["Results", "Preview", "Everything unlocked"],
                        ].map(([label, free, pro]) => (
                            <tr key={label}>
                                <td className="py-2 pr-3 text-foreground/55">{label}</td>
                                <td className="py-2 pr-3 text-foreground/60">{free}</td>
                                <td className="py-2 text-foreground">{pro}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* CTA — straight to Stripe checkout */}
            <div className="grid grid-cols-1 gap-px border-t border-foreground/10 bg-foreground/10 sm:grid-cols-3 rounded-b-lg overflow-hidden">
                {TEASER_PLANS.map(({ id, blurb, featured }) => {
                    const plan = PAID_PLANS[id];
                    return (
                        <button
                            key={id}
                            type="button"
                            onClick={() => startCheckout(id)}
                            disabled={pendingPlan !== null}
                            className={`group flex flex-col gap-1 p-5 text-left transition-colors disabled:opacity-60 ${
                                featured ? "bg-emerald-500/[0.05] hover:bg-emerald-500/10" : "bg-card hover:bg-background"
                            }`}
                        >
                            <div className="flex items-center justify-between">
                                <span className={`text-xs font-medium ${featured ? "text-primary" : "text-foreground/60"}`}>
                                    {plan.name}
                                </span>
                                {pendingPlan === id ? (
                                    <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                                ) : (
                                    <ArrowRight className="h-3.5 w-3.5 text-foreground/30 group-hover:text-primary transition-colors" />
                                )}
                            </div>
                            <div className="font-mono text-lg font-medium tabular-nums text-foreground">
                                {plan.price}
                                {plan.period !== "one-time" && <span className="font-sans text-sm font-normal text-foreground/50">{plan.period}</span>}
                            </div>
                            <div className="text-xs text-foreground/55">{plan.note}</div>
                            <div className="mt-1 text-xs text-foreground/65">{blurb}</div>
                        </button>
                    );
                })}
            </div>
        </section>
    );
}
