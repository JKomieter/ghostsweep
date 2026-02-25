/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import * as React from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
    AlertTriangle,
    Clock,
    Lock,
    ShieldAlert,
    Sparkles,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";

type UrgencyTeaser = {
    id: string;
    name: string;
    domain: string | null;
    breached: boolean;
    emailCount: number;
    lastSeenAt: string | null;
};

type UrgencyResponse = {
    currentPlan: string; // "free" | "pro" | ...
    gated: boolean;
    freeLimit: number;

    totals: {
        totalServices: number;
        breached: number;
        stillEmailing: number;
        inactive1y: number;
        inactive4y: number;
        unknownOrLowSignal: number;
        oldestYear: number | null;
    };

    topRiskTeasers: UrgencyTeaser[];

    // optional (free users)
    monitoringEndsAt: string | null;
};

function formatShortDate(iso: string | null) {
    if (!iso) return "—";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "—";
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function formatCountdown(iso: string | null) {
    if (!iso) return null;
    const end = new Date(iso).getTime();
    if (Number.isNaN(end)) return null;
    const ms = end - Date.now();
    if (ms <= 0) return "now";
    const hrs = Math.floor(ms / (1000 * 60 * 60));
    const mins = Math.floor((ms - hrs * 3600_000) / 60_000);
    if (hrs <= 0) return `${mins}m`;
    return `${hrs}h ${mins}m`;
}

function riskCopy(totals: UrgencyResponse["totals"]) {
    // pick the scariest line
    if (totals.breached > 0) {
        return {
            title: `${totals.breached} breached account${totals.breached === 1 ? "" : "s"} detected`,
            desc: "Breached accounts are the highest takeover risk. Prioritize these first.",
            tone: "danger" as const,
            icon: ShieldAlert,
        };
    }
    if (totals.inactive4y > 0) {
        return {
            title: `${totals.inactive4y} account${totals.inactive4y === 1 ? "" : "s"} inactive for 4+ years`,
            desc: "Old accounts are easy to forget and hard to recover if compromised.",
            tone: "warn" as const,
            icon: AlertTriangle,
        };
    }
    if (totals.stillEmailing > 0) {
        return {
            title: `${totals.stillEmailing} service${totals.stillEmailing === 1 ? "" : "s"} still emailing you`,
            desc: "These are active data relationships. Review what stays and what gets removed.",
            tone: "info" as const,
            icon: Sparkles,
        };
    }
    return {
        title: `Footprint discovered: ${totals.totalServices}`,
        desc: "Next step: run a sweep and start cleaning up accounts you don’t need.",
        tone: "info" as const,
        icon: Sparkles,
    };
}

export default function DashboardUrgencyPanel() {
    const { data, status, error, refetch } = useQuery<UrgencyResponse>({
        queryKey: ["urgency", "dashboard"],
        queryFn: async () => {
            const res = await fetch("/api/urgency", { cache: "no-store" });
            const j = (await res.json().catch(() => ({}))) as UrgencyResponse;

            if (!res.ok) {
                const msg =
                    typeof (j as any)?.error === "string"
                        ? (j as any).error
                        : "Failed to load urgency data";
                throw new Error(msg);
            }
            return j;
        },
        staleTime: 60_000,
        refetchOnWindowFocus: false,
    });

    const { data: planData } = useQuery<{ current_plan: string }>({
        queryKey: ["plan"],
        queryFn: async () => {
            const res = await fetch("/api/plan");
            if (!res.ok) throw new Error("Failed to fetch plan");
            return res.json();
        },
    });

    const isLoading = status === "pending";
    const isError = status === "error";

    const totals = data?.totals;
    const gated = Boolean(data?.gated);
    const freeLimit = data?.freeLimit ?? 10;
    const totalServices = totals?.totalServices ?? 0;

    const hiddenCount =
        gated && typeof totals?.totalServices === "number"
            ? Math.max(0, totals.totalServices - freeLimit)
            : 0;

    const countdown = formatCountdown(data?.monitoringEndsAt ?? null);
    const banner = totals ? riskCopy(totals) : null;
    const BannerIcon = banner?.icon ?? Sparkles;

    return (
        <div className="rounded-lg border border-white/5 bg-white/2 p-6 space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                    <div className="text-sm font-medium text-white">Risk Snapshot</div>
                    <div className="text-xs text-white/40">
                        {isLoading ? "—" : "Critical accounts requiring attention"}
                    </div>
                </div>

                {!isLoading && !isError ? (
                    gated ? (
                        <Link href="/dashboard/billing?plan=monthly">
                            <Button size="sm" className="h-8 rounded-md border-0 bg-white text-black hover:bg-white/90 transition-colors">
                                <Lock className="h-3.5 w-3.5 mr-1.5" />
                                Upgrade to Pro →
                            </Button>
                        </Link>
                    ) : (
                        <Link href="/dashboard/user_services">
                            <Button size="sm" variant="ghost" className="h-8 text-white/60 hover:text-white hover:bg-white/5">
                                View all →
                            </Button>
                        </Link>
                    )
                ) : null}
            </div>

            {/* Loading / Error */}
            {isLoading ? (
                <div className="rounded-lg border border-white/5 bg-white/2 p-12 flex items-center justify-center">
                    <Spinner className="text-white/40" />
                </div>
            ) : isError ? (
                <div className="rounded-lg border border-white/5 bg-white/2 p-6">
                    <div className="text-sm text-white/80">Failed to load</div>
                    <div className="mt-1 text-xs text-white/40">
                        {(error as any)?.message ?? "Unknown error"}
                    </div>
                    <div className="mt-4">
                        <Button size="sm" variant="ghost" className="text-white/60 hover:text-white" onClick={() => refetch()}>
                            Retry
                        </Button>
                    </div>
                </div>
            ) : !totals ? (
                <div className="rounded-lg border border-white/5 bg-white/2 p-6 text-sm text-white/40">
                    No data. Connect email to begin.
                </div>
            ) : (
                <>
                    {/* Main urgency banner */}
                    <div
                        className={[
                            "rounded-lg border p-5",
                            banner?.tone === "danger"
                                ? "border-red-500/10 bg-red-500/5"
                                : banner?.tone === "warn"
                                    ? "border-amber-500/10 bg-amber-500/5"
                                    : "border-emerald-500/10 bg-emerald-500/5",
                        ].join(" ")}
                    >
                        <div className="flex items-start justify-between gap-4">
                            <div className="space-y-2">
                                <div className="text-sm font-medium text-white">{banner?.title}</div>
                                <div className="text-xs text-white/50 leading-relaxed">{banner?.desc}</div>

                                {/* Free urgency hook */}
                                {gated && countdown ? (
                                    <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-white/5 bg-white/5 px-3 py-1.5 text-[11px] text-white/60">
                                        <Clock className="h-3 w-3" />
                                        Ends in <span className="font-medium text-white/80">{countdown}</span>
                                    </div>
                                ) : null}
                            </div>

                            {gated ? (
                                <Link href="/dashboard/billing?plan=monthly" className="shrink-0">
                                    <Button size="sm" className="h-8 rounded-md border-0 bg-white text-black hover:bg-white/90">
                                        Unlock
                                    </Button>
                                </Link>
                            ) : null}
                        </div>
                    </div>

                    {/* Key numbers grid */}
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                        <StatCard label="Accounts found" value={totalServices.toLocaleString()} />
                        <StatCard
                            label="Breached"
                            value={totals.breached.toLocaleString()}
                            tone={totals.breached > 0 ? "danger" : "muted"}
                        />
                        <StatCard
                            label="Inactive 4+ yrs"
                            value={totals.inactive4y.toLocaleString()}
                            tone={totals.inactive4y > 0 ? "warn" : "muted"}
                        />
                        <StatCard
                            label="Still emailing"
                            value={totals.stillEmailing.toLocaleString()}
                        />
                    </div>

                    {/* Teasers */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between gap-3">
                            <div className="text-xs text-white/40">
                                High-risk accounts
                            </div>

                            {gated ? (
                                <Badge variant="outline" className="border-white/10 bg-white/5 text-white/50 text-[10px] font-normal">
                                    {hiddenCount.toLocaleString()} hidden
                                </Badge>
                            ) : (
                                totals.oldestYear ? (
                                    <Badge variant="outline" className="border-white/10 bg-white/5 text-white/50 text-[10px] font-normal">
                                        oldest: {totals.oldestYear}
                                    </Badge>
                                ) : null
                            )}
                        </div>

                        <div className="space-y-2">
                            {(data?.topRiskTeasers ?? []).length === 0 ? (
                                <div className="rounded-lg border border-white/5 bg-white/2 p-4 text-xs text-white/40">No accounts yet</div>
                            ) : (
                                (data?.topRiskTeasers ?? []).map((t) => (
                                    <div
                                        key={t.id}
                                        className="flex items-center justify-between gap-3 rounded-lg border border-white/5 bg-white/2 px-4 py-3 transition-all hover:border-white/10 hover:bg-white/3"
                                    >
                                        <div className="min-w-0 flex-1">
                                            <div className="text-sm font-medium text-white truncate">{t.name}</div>
                                            <div className="text-[11px] text-white/40 truncate mt-0.5">
                                                {t.domain ?? "—"} · {formatShortDate(t.lastSeenAt)} · {t.emailCount} emails
                                            </div>
                                        </div>

                                        <div className={`h-1.5 w-1.5 rounded-full shrink-0 ${t.breached ? 'bg-red-500' : 'bg-white/20'}`} />
                                    </div>
                                ))
                            )}

                            {/* Locked hint rows */}
                            {gated ? (
                                <div className="mt-3 rounded-lg border border-white/5 bg-white/2 px-4 py-3">
                                    <div className="flex items-center justify-between gap-3">
                                        <div className="flex items-center gap-2 text-xs text-white/40">
                                            <Lock className="h-3 w-3" />
                                            {hiddenCount.toLocaleString()} more hidden
                                        </div>
                                        <Link href="/dashboard/billing?plan=monthly">
                                            <Button size="sm" className="h-7 text-xs rounded-md border-0 bg-white text-black hover:bg-white/90">
                                        Upgrade
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            ) : null}
                        </div>
                    </div>

                    {/* Bottom action */}
                    <div className="flex items-center justify-between gap-3">
                        <div className="text-xs text-white/40">
                            {gated ? (
                                <>
                                    You’re only seeing a preview. Unlock the full list to start deletions and tracking.
                                </>
                            ) : (
                                <>
                                    You have visibility — now prioritize the risky accounts and start cleanup.
                                </>
                            )}
                        </div>

                        {gated ? (
                            <Link href="/dashboard/billing?plan=monthly">
                                <Button className="bg-white text-black hover:bg-white/90">
                                    Upgrade Now
                                </Button>
                            </Link>
                        ) : (
                            <Link href="/dashboard/user_services">
                                <Button variant="ghost" className="border border-white/5 bg-white/2 hover:border-white/10 hover:bg-white/3">
                                    Go to accounts
                                </Button>
                            </Link>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}

function StatCard({
    label,
    value,
    tone = "muted",
}: {
    label: string;
    value: string;
    tone?: "muted" | "warn" | "danger";
}) {
    const indicatorClass =
        tone === "danger"
            ? "bg-red-500"
            : tone === "warn"
                ? "bg-amber-500"
                : "bg-white/20";

    return (
        <div className="rounded-lg border border-white/5 bg-white/2 p-4">
            <div className="flex items-start justify-between">
                <div className="text-[11px] font-medium uppercase tracking-widest text-white/40">{label}</div>
                <div className={`h-1 w-1 rounded-full ${indicatorClass}`} />
            </div>
            <div className="mt-2 text-2xl font-light text-white">{value}</div>
        </div>
    );
}