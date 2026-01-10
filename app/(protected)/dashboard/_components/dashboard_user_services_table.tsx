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
        <div className="rounded-xl border border-white/10 bg-[#050505] p-4 space-y-4 overflow-hidden">
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
                <div className="space-y-0.5">
                    <div className="text-sm font-semibold text-white">Your Risk Snapshot</div>
                    <div className="text-xs text-white/55">
                        {isLoading ? "Loading…" : "A quick view of what could expose you right now."}
                    </div>
                </div>

                {!isLoading && !isError ? (
                    gated ? (
                        <Link href="/dashboard/billing">
                            <Button size="sm" className="bg-primary text-black hover:bg-primary/80">
                                <Lock className="h-4 w-4 mr-2" />
                                Upgrade
                            </Button>
                        </Link>
                    ) : (
                        <Link href="/dashboard/user_services">
                            <Button size="sm" variant="outline" className="border-white/15 bg-[#050505]">
                                View all
                            </Button>
                        </Link>
                    )
                ) : null}
            </div>

            {/* Loading / Error */}
            {isLoading ? (
                <div className="rounded-lg border border-white/10 bg-black/40 p-6 flex items-center justify-center">
                    <Spinner className="text-primary" />
                </div>
            ) : isError ? (
                <div className="rounded-lg border border-white/10 bg-black/40 p-4">
                    <div className="text-sm text-white">Couldn&apos;t load risk snapshot</div>
                    <div className="mt-1 text-xs text-white/60">
                        {(error as any)?.message ?? "Unknown error"}
                    </div>
                    <div className="mt-3">
                        <Button size="sm" variant="outline" className="border-white/15" onClick={() => refetch()}>
                            Retry
                        </Button>
                    </div>
                </div>
            ) : !totals ? (
                <div className="rounded-lg border border-white/10 bg-black/40 p-4 text-sm text-white/70">
                    No data yet. Connect Gmail and run your first scan.
                </div>
            ) : (
                <>
                    {/* Main urgency banner */}
                    <div
                        className={[
                            "rounded-lg border p-4",
                            banner?.tone === "danger"
                                ? "border-red-500/25 bg-red-500/10"
                                : banner?.tone === "warn"
                                    ? "border-amber-500/25 bg-amber-500/10"
                                    : "border-emerald-500/20 bg-emerald-500/10",
                        ].join(" ")}
                    >
                        <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start gap-3">
                                <div
                                    className={[
                                        "mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl border",
                                        banner?.tone === "danger"
                                            ? "border-red-500/25 bg-red-500/10"
                                            : banner?.tone === "warn"
                                                ? "border-amber-500/25 bg-amber-500/10"
                                                : "border-emerald-500/20 bg-emerald-500/10",
                                    ].join(" ")}
                                >
                                    <BannerIcon
                                        className={[
                                            "h-4 w-4",
                                            banner?.tone === "danger"
                                                ? "text-red-300"
                                                : banner?.tone === "warn"
                                                    ? "text-amber-300"
                                                    : "text-emerald-300",
                                        ].join(" ")}
                                    />
                                </div>

                                <div className="space-y-1">
                                    <div className="text-sm font-semibold text-white">{banner?.title}</div>
                                    <div className="text-xs text-white/70">{banner?.desc}</div>

                                    {/* Free urgency hook */}
                                    {gated && countdown ? (
                                        <div className="mt-2 inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/30 px-3 py-1 text-[11px] text-white/75">
                                            <Clock className="h-3.5 w-3.5 text-white/60" />
                                            Monitoring window ends in <span className="font-semibold text-white">{countdown}</span>
                                        </div>
                                    ) : null}
                                </div>
                            </div>

                            {gated ? (
                                <Link href="/dashboard/billing" className="shrink-0">
                                    <Button size="sm" className="bg-white text-black hover:bg-zinc-100">
                                        Unlock full list
                                    </Button>
                                </Link>
                            ) : null}
                        </div>
                    </div>

                    {/* Key numbers grid */}
                    <div className="grid gap-3 sm:grid-cols-2">
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
                            label="Still emailing you"
                            value={totals.stillEmailing.toLocaleString()}
                        />
                    </div>

                    {/* Teasers */}
                    <div className="rounded-lg border border-white/10 bg-black/25 p-3">
                        <div className="flex items-center justify-between gap-3">
                            <div className="text-xs text-white/70">
                                Highest-risk accounts (preview)
                                {gated ? (
                                    <span className="ml-2 text-white/45">· Free shows {freeLimit}</span>
                                ) : null}
                            </div>

                            {gated ? (
                                <Badge variant="outline" className="border-white/10 bg-white/5 text-white/70">
                                    {hiddenCount.toLocaleString()} locked
                                </Badge>
                            ) : (
                                totals.oldestYear ? (
                                    <Badge variant="outline" className="border-white/10 bg-white/5 text-white/70">
                                        oldest: {totals.oldestYear}
                                    </Badge>
                                ) : null
                            )}
                        </div>

                        <div className="mt-3 space-y-2">
                            {(data?.topRiskTeasers ?? []).length === 0 ? (
                                <div className="text-xs text-white/55">No accounts to preview yet.</div>
                            ) : (
                                (data?.topRiskTeasers ?? []).map((t) => (
                                    <div
                                        key={t.id}
                                        className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2"
                                    >
                                        <div className="min-w-0">
                                            <div className="text-sm font-medium text-white truncate">{t.name}</div>
                                            <div className="text-[11px] text-white/55 truncate">
                                                {t.domain ?? "—"} · last seen {formatShortDate(t.lastSeenAt)} · {t.emailCount} emails
                                            </div>
                                        </div>

                                        <Badge
                                            variant="outline"
                                            className={
                                                t.breached
                                                    ? "border-red-500/30 bg-red-500/10 text-red-200"
                                                    : "border-white/10 bg-white/5 text-white/70"
                                            }
                                        >
                                            {t.breached ? "Breached" : "Review"}
                                        </Badge>
                                    </div>
                                ))
                            )}

                            {/* Locked hint rows */}
                            {gated ? (
                                <div className="mt-2 rounded-xl border border-white/10 bg-black/20 px-3 py-2">
                                    <div className="flex items-center justify-between gap-3">
                                        <div className="flex items-center gap-2 text-xs text-white/60">
                                            <Lock className="h-3.5 w-3.5" />
                                            {hiddenCount.toLocaleString()} more accounts hidden
                                        </div>
                                        <Link href="/dashboard/billing">
                                            <Button size="sm" className="bg-primary text-black hover:bg-primary/80">
                                                Upgrade to see all
                                            </Button>
                                        </Link>
                                    </div>
                                    <div className="mt-1 text-[11px] text-white/45">
                                        Free shows your total count, but hides details beyond the first {freeLimit}.
                                    </div>
                                </div>
                            ) : null}
                        </div>
                    </div>

                    {/* Bottom action */}
                    <div className="flex items-center justify-between gap-3">
                        <div className="text-xs text-white/55">
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
                            <Link href="/dashboard/billing">
                                <Button className="bg-white text-black hover:bg-zinc-100">
                                    Upgrade now
                                </Button>
                            </Link>
                        ) : (
                            <Link href="/dashboard/user_services">
                                <Button variant="outline" className="border-white/15 bg-[#050505]">
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
    const toneClass =
        tone === "danger"
            ? "border-red-500/20 bg-red-500/10"
            : tone === "warn"
                ? "border-amber-500/20 bg-amber-500/10"
                : "border-white/10 bg-white/5";

    const valueClass =
        tone === "danger"
            ? "text-red-200"
            : tone === "warn"
                ? "text-amber-200"
                : "text-white";

    return (
        <div className={`rounded-xl border ${toneClass} p-3`}>
            <div className="text-[11px] text-white/55">{label}</div>
            <div className={`mt-1 text-lg font-semibold ${valueClass}`}>{value}</div>
        </div>
    );
}