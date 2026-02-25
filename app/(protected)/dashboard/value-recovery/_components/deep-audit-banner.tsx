"use client";

import { useQuery } from "@tanstack/react-query";
import { Sparkles, ArrowRight, Clock, Search, TrendingUp, Lock } from "lucide-react";
import { useState, useMemo } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

type PlanData = {
    current_plan: "free" | "buster" | "pro";
    scan_credits_remaining?: number;
};

type ValueRecoveryData = {
    totalCount: number;
    totalValue: number;
    previewOnly?: boolean;
};

export default function DeepAuditBanner() {
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

    // Fetch value recovery summary
    const { data: valueData } = useQuery<ValueRecoveryData>({
        queryKey: ["value-recovery-summary"],
        queryFn: async () => {
            const res = await fetch("/api/dashboard/value-recovery?summary=true");
            if (!res.ok) throw new Error("Failed to fetch value data");
            return res.json();
        },
    });

    // Check session storage for dismissal
    const isDismissedFromStorage = useMemo(() => {
        if (typeof window === "undefined") return false;
        return sessionStorage.getItem("deep_audit_banner_dismissed") === "true";
    }, []);

    const handleDismiss = () => {
        setDismissed(true);
        sessionStorage.setItem("deep_audit_banner_dismissed", "true");
    };

    const isFree = planData?.current_plan === "free";
    const itemCount = valueData?.totalCount || 0;

    // Only show for free users who have found some items
    if (!isFree || dismissed || isDismissedFromStorage) {
        return null;
    }

    // Estimate what they might find with deep audit (3x multiplier for 5 years vs 2 years)
    const estimatedDeepItems = Math.max(itemCount * 3, 25);
    const estimatedDeepValue = Math.max((valueData?.totalValue || 0) * 2.5, 500);

    return (
        <div className="relative overflow-hidden rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-black/60 to-orange-500/10 p-6 md:p-8 mb-8">
            {/* Background glow */}
            <div className="absolute -top-20 -right-20 h-40 w-40 rounded-full bg-amber-500/20 blur-3xl" />
            <div className="absolute -bottom-20 -left-20 h-40 w-40 rounded-full bg-orange-500/10 blur-3xl" />
            
            {/* Dismiss button */}
            <button 
                onClick={handleDismiss}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 text-white/40 hover:text-white/70 transition"
                aria-label="Dismiss"
            >
                <span className="text-lg">×</span>
            </button>

            <div className="relative z-10">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 mb-4 px-3 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/30">
                    <Search className="h-3.5 w-3.5 text-amber-400" />
                    <span className="text-xs font-semibold uppercase tracking-widest text-amber-400">
                        Quick Scan Complete
                    </span>
                </div>

                {/* Main message */}
                <h2 className="text-2xl md:text-3xl font-light text-white mb-2">
                    We found <span className="text-amber-400 font-medium">{itemCount} items</span> from the last 2 years
                </h2>
                <p className="text-lg text-white/70 mb-6">
                    Want us to go deeper? Our <span className="text-amber-300 font-medium">Deep Audit</span> scans back 5 years.
                </p>

                {/* Comparison grid */}
                <div className="grid md:grid-cols-2 gap-4 mb-8">
                    {/* Current scan (Free) */}
                    <div className="rounded-xl border border-white/10 bg-white/5 p-5">
                        <div className="flex items-center gap-2 mb-3">
                            <Clock className="h-4 w-4 text-white/40" />
                            <span className="text-xs font-semibold uppercase tracking-wider text-white/40">
                                Quick Scan (Free)
                            </span>
                        </div>
                        <div className="space-y-2 text-sm text-white/60">
                            <div className="flex items-center gap-2">
                                <span className="text-white/30">•</span>
                                Last 2 years of emails
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-white/30">•</span>
                                Headers only (faster)
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-white/30">•</span>
                                Found: <span className="text-white font-medium">{itemCount} items</span>
                            </div>
                        </div>
                    </div>

                    {/* Deep Audit (Pro) */}
                    <div className="rounded-xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 to-orange-500/5 p-5 relative overflow-hidden">
                        <div className="absolute top-3 right-3">
                            <Lock className="h-4 w-4 text-amber-400/50" />
                        </div>
                        <div className="flex items-center gap-2 mb-3">
                            <Sparkles className="h-4 w-4 text-amber-400" />
                            <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">
                                Deep Audit (Pro)
                            </span>
                        </div>
                        <div className="space-y-2 text-sm text-white/80">
                            <div className="flex items-center gap-2">
                                <span className="text-amber-400">✓</span>
                                Full <span className="text-amber-300 font-medium">5 years</span> of email history
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-amber-400">✓</span>
                                Deep content analysis
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-amber-400">✓</span>
                                Estimated: <span className="text-amber-300 font-medium blur-[3px] select-none">{estimatedDeepItems}+ items</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
                                <span className="text-emerald-400 font-medium blur-[3px] select-none">${estimatedDeepValue.toLocaleString()}</span>
                                <span className="text-white/50">potential value</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* CTA */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <Link href="/dashboard/billing?plan=monthly">
                        <Button className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-semibold px-6 py-5 text-base gap-2 shadow-lg shadow-amber-500/20">
                            <Sparkles className="h-4 w-4" />
                            Upgrade to Pro
                            <ArrowRight className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div className="text-sm text-white/40">
                        $7.99/mo • 5 years of history
                    </div>
                </div>
            </div>
        </div>
    );
}
