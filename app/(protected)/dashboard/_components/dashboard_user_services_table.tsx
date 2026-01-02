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

type Props = {
    isFreeUser: boolean;
    freeLimit?: number; // default 10
    proLimit?: number;  // default 50
};

export default function DashboardUserServicesTable({
    isFreeUser,
    freeLimit = 10,
    proLimit = 50,
}: Props) {
    const LIMIT = isFreeUser ? freeLimit : proLimit;

    const { data, status } = useQuery<UserServicesQueryResult>({
        queryKey: ["user_services", LIMIT, isFreeUser],
        queryFn: async () => {
            const params = new URLSearchParams();
            params.set("page", "1");
            params.set("pageSize", String(LIMIT));

            const res = await fetch(`/api/user_services?${params.toString()}`);
            if (!res.ok) throw new Error("Failed to fetch services");
            return res.json();
        },
        refetchOnWindowFocus: false,
    });

    const isLoading = status === "pending";
    const total = data?.total ?? 0;
    const rows = data?.userServices ?? [];

    const showing = Math.min(LIMIT, rows.length);
    const isGated = isFreeUser && total > freeLimit;

    return (
        <div className="rounded-xl border border-white/10 bg-[#050505] p-4 space-y-3 overflow-hidden">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <div className="text-sm font-medium text-white">Accounts found</div>
                    <div className="text-xs text-muted-foreground">
                        {isLoading ? "Loading…" : `${total.toLocaleString()} total`}
                        {isFreeUser ? (
                            <span className="ml-2 text-white/60">· Free shows {freeLimit}</span>
                        ) : null}
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

            <div className="overflow-auto rounded-lg border border-white/10 max-h-[300px]">
                {/* Sticky gate bar */}
                {isGated ? (
                    <div className="sticky top-0 z-10 border-b border-white/10 bg-[#050505]/95 backdrop-blur px-3 py-2 text-xs text-white/80 flex items-center justify-between">
                        <span>Showing the first {freeLimit}. Upgrade to see the full list.</span>
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
                        ) : rows.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center text-sm text-muted-foreground">
                                    No services found yet.
                                </TableCell>
                            </TableRow>
                        ) : (
                            rows.slice(0, LIMIT).map((r) => {
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
                                            {formatShortDate(r.last_seen_at!)}
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
                        {isGated
                            ? Array.from({ length: 4 }).map((_, i) => (
                                <TableRow key={`locked-${i}`} className="opacity-80">
                                    <TableCell className="align-top">
                                        <div className="flex items-center gap-2 text-sm text-white/50">
                                            <Lock className="h-3.5 w-3.5" />
                                            Locked account
                                        </div>
                                        <div className="text-xs text-muted-foreground blur-[2px] select-none">
                                            example.com
                                        </div>
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

            <div className="flex items-center justify-between gap-3">
                <p className="text-xs text-muted-foreground">
                    Showing {showing.toLocaleString()} of {total.toLocaleString()} services
                </p>

                {isGated ? (
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
                )}
            </div>

            {isGated ? (
                <div className="rounded-lg border border-white/10 bg-black/40 p-3 text-xs text-muted-foreground">
                    {Math.max(0, total - freeLimit).toLocaleString()} more accounts hidden.
                    Upgrade to unlock breach monitoring, deletion tracking, and automatic follow-ups.
                </div>
            ) : null}
        </div>
    );
}