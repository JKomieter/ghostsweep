/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import * as React from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Lock } from "lucide-react";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { UserServicesQueryResult } from "@/queryTypes";

function formatShortDate(iso: string | null) {
    if (!iso) return "—";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "—";
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

/**
 * Minimal services table (no props)
 * - Backend gates free users to the first N services and returns:
 *   { total, shownCount, hiddenCount, gated, freeLimit, currentPlan, ... }
 */
export default function DashboardUserServicesTable() {
    const { data, status, error, refetch } = useQuery<UserServicesQueryResult>({
        queryKey: ["user_services", "dashboard_preview"],
        queryFn: async () => {
            const params = new URLSearchParams();
            params.set("page", "1");
            // pageSize is optional; your API can ignore it for free gating
            params.set("pageSize", "50");

            const res = await fetch(`/api/user_services?${params.toString()}`, {
                cache: "no-store",
            });

            const j = (await res.json().catch(() => ({}))) as UserServicesQueryResult;
            if (!res.ok) {
                const msg =
                    typeof (j as any)?.error === "string"
                        ? (j as any).error
                        : "Failed to fetch services";
                throw new Error(msg);
            }
            return j;
        },
        refetchOnWindowFocus: false,
        staleTime: 60_000,
    });

    const isLoading = status === "pending";
    const isError = status === "error";

    const rows = data?.userServices ?? [];
    const total = data?.total ?? rows.length;

    const isGated = Boolean(data?.gated);
    const freeLimit = data?.freeLimit ?? 10;
    const shownCount = data?.shownCount ?? rows.length;
    const hiddenCount =
        typeof data?.hiddenCount === "number"
            ? data.hiddenCount
            : isGated
                ? Math.max(0, total - shownCount)
                : 0;

    return (
        <div className="rounded-xl border border-white/10 bg-[#050505] p-4 space-y-3 overflow-hidden">
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
                <div>
                    <div className="text-sm font-medium text-white">Accounts found</div>
                    <div className="text-xs text-muted-foreground">
                        {isLoading ? (
                            "Loading…"
                        ) : (
                            <>
                                {total.toLocaleString()} total
                                {isGated ? (
                                    <span className="ml-2 text-white/60">· Showing {freeLimit}</span>
                                ) : null}
                            </>
                        )}
                    </div>
                </div>

                {isGated ? (
                    <Link href="/dashboard/billing">
                        <Button size="sm" className="bg-primary text-black hover:bg-primary/80">
                            <Lock className="h-4 w-4 mr-2" />
                            Upgrade
                        </Button>
                    </Link>
                ) : null}
            </div>

            {/* Body */}
            <div className="overflow-auto rounded-lg border border-white/10 max-h-[300px]">
                {/* Sticky gate bar */}
                {!isLoading && !isError && isGated ? (
                    <div className="sticky top-0 z-10 border-b border-white/10 bg-[#050505]/95 backdrop-blur px-3 py-2 text-xs text-white/80 flex items-center justify-between gap-3">
                        <span>
                            Showing the first {freeLimit}. Upgrade to see all {total.toLocaleString()}.
                        </span>
                        <Link href="/dashboard/billing" className="shrink-0">
                            <Button size="sm" variant="outline" className="border-white/15 bg-[#050505]">
                                Upgrade
                            </Button>
                        </Link>
                    </div>
                ) : null}

                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="text-xs text-muted-foreground">Service</TableHead>
                            <TableHead className="text-xs text-muted-foreground">Last seen</TableHead>
                            <TableHead className="text-xs text-muted-foreground">Emails</TableHead>
                            <TableHead className="text-xs text-muted-foreground text-right">Risk</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center text-sm text-muted-foreground relative">
                                    <Spinner className="text-primary absolute left-1/2 top-1/2" />
                                </TableCell>
                            </TableRow>
                        ) : isError ? (
                            <TableRow>
                                <TableCell colSpan={4} className="py-6">
                                    <div className="text-sm text-white">Couldn&apos;t load accounts</div>
                                    <div className="mt-1 text-xs text-white/60">
                                        {(error as any)?.message ?? "Unknown error"}
                                    </div>
                                    <div className="mt-3">
                                        <Button size="sm" variant="outline" className="border-white/15" onClick={() => refetch()}>
                                            Retry
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : rows.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center text-sm text-muted-foreground">
                                    No services found yet.
                                </TableCell>
                            </TableRow>
                        ) : (
                            rows.map((r) => {
                                const name = r.service?.name ?? "Unknown";
                                const domain = r.service?.domain ?? "";
                                const breached = r.service?.is_breached === true;

                                return (
                                    <TableRow key={r.id}>
                                        <TableCell className="align-top">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium text-white">{name}</span>
                                                {domain ? <span className="text-xs text-muted-foreground">{domain}</span> : null}
                                            </div>
                                        </TableCell>

                                        <TableCell className="text-xs text-muted-foreground align-top">
                                            {formatShortDate(r.last_seen_at ?? null)}
                                        </TableCell>

                                        <TableCell className="text-xs text-muted-foreground align-top">
                                            {(r.email_count ?? 0).toLocaleString()}
                                        </TableCell>

                                        <TableCell className="text-right align-top">
                                            <Badge
                                                variant="outline"
                                                className={
                                                    breached
                                                        ? "border-red-500/30 bg-red-500/10 text-red-200"
                                                        : "border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
                                                }
                                            >
                                                {breached ? "Breached" : "Normal"}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        )}

                        {/* Optional locked teaser rows */}
                        {!isLoading && !isError && isGated
                            ? Array.from({ length: 4 }).map((_, i) => (
                                <TableRow key={`locked-${i}`} className="opacity-80">
                                    <TableCell className="align-top">
                                        <div className="flex items-center gap-2 text-sm text-white/50">
                                            <Lock className="h-3.5 w-3.5" />
                                            Locked account
                                        </div>
                                        <div className="text-xs text-muted-foreground blur-[2px] select-none">example.com</div>
                                    </TableCell>
                                    <TableCell className="text-xs text-muted-foreground blur-[2px] select-none">—</TableCell>
                                    <TableCell className="text-xs text-muted-foreground blur-[2px] select-none">—</TableCell>
                                    <TableCell className="text-right">
                                        <Badge variant="outline" className="border-white/10 bg-white/5 text-white/50">
                                            Pro
                                        </Badge>
                                    </TableCell>
                                </TableRow>
                            ))
                            : null}
                    </TableBody>
                </Table>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between gap-3">
                <p className="text-xs text-muted-foreground">
                    {isLoading ? (
                        "—"
                    ) : (
                        <>
                            Showing {shownCount.toLocaleString()} of {total.toLocaleString()} services
                        </>
                    )}
                </p>

                {!isLoading && !isError ? (
                    isGated ? (
                        <Link href="/dashboard/billing">
                            <Button size="sm" className="bg-primary text-black hover:bg-primary/80">
                                <Lock className="h-4 w-4 mr-2" />
                                Upgrade to see all
                            </Button>
                        </Link>
                    ) : (
                        <Link href="/dashboard/user_services">
                            <Button size="sm" variant="outline" className="border-white/15">
                                Go to accounts page
                            </Button>
                        </Link>
                    )
                ) : null}
            </div>

            {/* Extra gating copy */}
            {!isLoading && !isError && isGated ? (
                <div className="rounded-lg border border-white/10 bg-black/40 p-3 text-xs text-muted-foreground">
                    {hiddenCount.toLocaleString()} more accounts hidden. Upgrade to unlock the full list, breach monitoring,
                    deletion tracking, and automatic follow-ups.
                </div>
            ) : null}
        </div>
    );
}