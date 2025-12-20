"use client";

import * as React from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";

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

export default function DashboardUserServicesTable() {
    const LIMIT = 50;

    const { data, status } = useQuery<UserServicesQueryResult>({
        queryKey: ["user_services", LIMIT],
        queryFn: async () => {
            // If your /api/user_services endpoint already gates free users, we can reuse it.
            // We just request page=1 and rely on backend default pageSize=50.
            const params = new URLSearchParams();
            params.set("page", "1");
            // If your endpoint supports pageSize, keep this line; otherwise remove it.
            params.set("pageSize", String(LIMIT));

            const res = await fetch(`/api/user_services?${params.toString()}`);
            if (!res.ok) throw new Error("Failed to fetch services");
            return res.json();
        },
        refetchOnWindowFocus: false,
    });

    const isLoading = status === "pending";
    const gated = data?.gated ?? false;
    const currentPlan = data?.currentPlan ?? "free";
    const total = data?.total ?? 0;
    const rows = data?.userServices ?? [];

    // We intentionally show up to 50 rows (or fewer)
    const showing = Math.min(LIMIT, rows.length);
    const hasMore = total > LIMIT;

    return (
        <div className="rounded-xl border border-white/10 bg-[#050505] p-4 space-y-3  overflow-hidden">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <div className="text-sm font-medium text-white">Accounts found</div>
                    <div className="text-xs text-muted-foreground">
                        {isLoading ? "Loading…" : `${total.toLocaleString()} total`}
                    </div>
                </div>

                {currentPlan === "free" && (
                    <Link href="/dashboard/billing?plan=monthly">
                        <Button size="sm" className="bg-primary text-black hover:bg-primary/80">
                            Upgrade
                        </Button>
                    </Link>
                )}
            </div>

            {/* Gatekeep: free users see count only, no list */}
            {gated ? (
                <div className="rounded-lg border border-white/10 bg-black/40 p-4 text-sm">
                    <p className="text-white/80">
                        We found <span className="font-semibold">{total.toLocaleString()}</span>{" "}
                        accounts linked to your email.
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                        Upgrade to Professional to view the account list and details.
                    </p>

                    <div className="mt-3 flex flex-wrap gap-2">
                        <Link href="/dashboard/billing?plan=monthly">
                            <Button size="sm" className="bg-primary text-black hover:bg-primary/80">
                                Upgrade to Professional
                            </Button>
                        </Link>
                        <Link href="/dashboard/user_services">
                            <Button size="sm" variant="outline" className="border-white/15">
                                Go to accounts page
                            </Button>
                        </Link>
                    </div>
                </div>
            ) : (
                <>
                        <div className="overflow-auto rounded-lg border border-white/10 max-h-[300px]">
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
                                        <TableCell
                                            colSpan={4}
                                            className="h-24 text-center text-sm text-muted-foreground relative"
                                        >
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
                                                        {domain ? (
                                                            <span className="text-xs text-muted-foreground">{domain}</span>
                                                        ) : null}
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
                            </TableBody>
                        </Table>
                    </div>

                    <div className="flex items-center justify-between gap-3">
                        <p className="text-xs text-muted-foreground">
                            Showing {showing.toLocaleString()} of {total.toLocaleString()} services
                        </p>

                        <Link href="/dashboard/user_services">
                            <Button size="sm" variant="outline" className="border-white/15">
                                Go to accounts page
                            </Button>
                        </Link>
                    </div>

                    {hasMore && (
                        <div className="rounded-lg border border-white/10 bg-black/40 p-3 text-xs text-muted-foreground">
                            There are more than {LIMIT} accounts. Visit the accounts page to view the full list and details.
                        </div>
                    )}
                </>
            )}
        </div>
    );
}