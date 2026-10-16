"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { Check, FileText, Ghost, Gift, Loader2, Lock, Shield, Sparkles } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useCheckout } from "@/hooks/use-checkout";
import { PAID_PLANS, type PaidPlanId } from "@/lib/plans";

export type PaywallReason = "report" | "accounts" | "generic";

const COPY: Record<PaywallReason, { title: string; subtitle: string }> = {
    report: {
        title: "Unlock your Privacy Report",
        subtitle: "Get a downloadable PDF of every account, breach and shadow profile tied to your email — plus the tools to clean them up.",
    },
    accounts: {
        title: "See every account holding your data",
        subtitle: "Your free scan only shows a preview. Unlock the full list and delete the accounts you don't use.",
    },
    generic: {
        title: "Finish cleaning up your digital footprint",
        subtitle: "Unlock everything your scan found and the one-click tools to remove it.",
    },
};

type OverviewData = { totalValue: number; oldAccounts: number };
type LatestSweep = { breachesFound?: number | null };

type PaywallContextValue = { openPaywall: (reason?: PaywallReason) => void };

const PaywallContext = createContext<PaywallContextValue | null>(null);

export function usePaywall() {
    const ctx = useContext(PaywallContext);
    if (!ctx) throw new Error("usePaywall must be used inside <PaywallProvider>");
    return ctx;
}

export function PaywallProvider({ children }: { children: ReactNode }) {
    const [reason, setReason] = useState<PaywallReason | null>(null);
    const openPaywall = useCallback((r: PaywallReason = "generic") => setReason(r), []);
    const value = useMemo(() => ({ openPaywall }), [openPaywall]);

    return (
        <PaywallContext.Provider value={value}>
            {children}
            <UpgradePaywall reason={reason} onClose={() => setReason(null)} />
        </PaywallContext.Provider>
    );
}

function UpgradePaywall({ reason, onClose }: { reason: PaywallReason | null; onClose: () => void }) {
    const open = reason !== null;
    const copy = COPY[reason ?? "generic"];
    const { startCheckout, pendingPlan } = useCheckout();

    // Personalise the pitch with what this user's own scan found
    const { data: overview } = useQuery<OverviewData>({
        queryKey: ["dashboard-overview"],
        queryFn: async () => {
            const res = await fetch("/api/dashboard/overview");
            if (!res.ok) throw new Error("Failed to fetch overview");
            return res.json();
        },
        enabled: open,
    });
    const { data: sweep } = useQuery<LatestSweep>({
        queryKey: ["latestSweep", "includeRead"],
        queryFn: async () => {
            const res = await fetch("/api/sweep/status/latest?includeRead=true");
            if (!res.ok) throw new Error("Failed to fetch sweep");
            return res.json();
        },
        enabled: open,
    });

    const stats = [
        { icon: Ghost, value: overview?.oldAccounts ?? 0, label: "accounts found", tone: "text-purple-600 dark:text-purple-400" },
        { icon: Shield, value: sweep?.breachesFound ?? 0, label: "breaches", tone: "text-red-600 dark:text-red-400" },
        {
            icon: Gift,
            value: overview?.totalValue ? `$${Math.round(overview.totalValue).toLocaleString()}` : 0,
            label: "unclaimed value",
            tone: "text-emerald-600 dark:text-emerald-400",
        },
    ].filter((s) => s.value);

    const busy = pendingPlan !== null;

    return (
        <Dialog open={open} onOpenChange={(o) => !o && !busy && onClose()}>
            <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader className="text-left">
                    <div className="mb-1 flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/15">
                        {reason === "report" ? (
                            <FileText className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                        ) : (
                            <Lock className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                        )}
                    </div>
                    <DialogTitle className="text-xl">{copy.title}</DialogTitle>
                    <DialogDescription>{copy.subtitle}</DialogDescription>
                </DialogHeader>

                {stats.length > 0 && (
                    <div className="rounded-lg border border-foreground/10 bg-foreground/[0.03] p-4">
                        <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-foreground/50">
                            Your scan found
                        </p>
                        <div className="grid grid-cols-3 gap-3">
                            {stats.map(({ icon: Icon, value, label, tone }) => (
                                <div key={label}>
                                    <div className={cn("flex items-center gap-1.5 text-2xl font-semibold", tone)}>
                                        <Icon className="h-4 w-4 shrink-0" />
                                        {typeof value === "number" ? value.toLocaleString() : value}
                                    </div>
                                    <div className="text-xs text-foreground/55">{label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <PlanCard
                        planId="buster"
                        cta={`Get Buster — ${PAID_PLANS.buster.price}`}
                        onSelect={startCheckout}
                        pendingPlan={pendingPlan}
                    />
                    <PlanCard
                        planId="pro"
                        featured
                        cta={`Start Pro — ${PAID_PLANS.pro.price}${PAID_PLANS.pro.period}`}
                        onSelect={startCheckout}
                        pendingPlan={pendingPlan}
                    />
                </div>

                <button
                    type="button"
                    onClick={() => startCheckout("sentinel")}
                    disabled={busy}
                    className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-emerald-500/40 px-4 py-2.5 text-sm text-emerald-700 transition hover:bg-emerald-500/5 disabled:opacity-60 dark:text-emerald-400"
                >
                    {pendingPlan === "sentinel" && <Loader2 className="h-4 w-4 animate-spin" />}
                    Prefer annual? {PAID_PLANS.sentinel.name} — {PAID_PLANS.sentinel.price}{PAID_PLANS.sentinel.period} ({PAID_PLANS.sentinel.note.split(" · ")[0].toLowerCase()})
                </button>

                <p className="text-center text-xs text-foreground/50">
                    Secure checkout by Stripe · 30-day money-back guarantee · Subscriptions cancel anytime
                </p>
            </DialogContent>
        </Dialog>
    );
}

function PlanCard({
    planId,
    featured = false,
    cta,
    onSelect,
    pendingPlan,
}: {
    planId: PaidPlanId;
    featured?: boolean;
    cta: string;
    onSelect: (plan: PaidPlanId) => void;
    pendingPlan: PaidPlanId | null;
}) {
    const plan = PAID_PLANS[planId];
    const isPending = pendingPlan === planId;

    return (
        <div
            className={cn(
                "relative flex flex-col rounded-xl border p-5",
                featured ? "border-emerald-500 ring-1 ring-emerald-500 bg-emerald-500/[0.04]" : "border-foreground/10"
            )}
        >
            {featured && (
                <span className="absolute -top-2.5 left-5 inline-flex items-center gap-1 rounded-full bg-emerald-500 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-black">
                    <Sparkles className="h-3 w-3" /> Most popular
                </span>
            )}
            <div className="text-sm font-semibold text-foreground">{plan.name}</div>
            <div className="mt-1 flex items-baseline gap-1">
                <span className="text-3xl font-semibold tracking-tight text-foreground">{plan.price}</span>
                <span className="text-sm text-foreground/55">{plan.period}</span>
            </div>
            <p className="mt-0.5 text-xs text-foreground/55">{plan.note}</p>
            <ul className="mt-4 mb-5 flex-1 space-y-2">
                {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-foreground/80">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                        {f}
                    </li>
                ))}
            </ul>
            <Button
                onClick={() => onSelect(planId)}
                disabled={pendingPlan !== null}
                variant={featured ? "default" : "outline"}
                className={cn(featured && "bg-emerald-500 text-black hover:bg-emerald-400")}
            >
                {isPending ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Redirecting…
                    </>
                ) : (
                    cta
                )}
            </Button>
        </div>
    );
}
