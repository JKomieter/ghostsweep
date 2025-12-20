/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { TableBody, TableCell, TableHead, TableHeader, TableRow, Table } from "@/components/ui/table";
import { formatDate } from "@/utils/format_date";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { BreachDetailsSheet } from "./breach_details";
import Link from "next/link";
import { UserBreachesQueryResult } from "@/queryTypes";
import { Breach } from "@/types";

function severityLabel(breach: Breach) {
    const pwn = breach.pwn_count ?? 0;
    const sensitive = breach.is_sensitive === true;

    if (sensitive && pwn >= 10_000_000) {
        return { label: "Critical", className: "bg-red-500/15 text-red-300 border-red-500/40" };
    }
    if (sensitive || pwn >= 1_000_000) {
        return { label: "High", className: "bg-orange-500/15 text-orange-300 border-orange-500/40" };
    }
    if (pwn > 0) {
        return { label: "Medium", className: "bg-yellow-500/15 text-yellow-200 border-yellow-500/40" };
    }
    return { label: "Low", className: "bg-emerald-500/15 text-emerald-300 border-emerald-500/40" };
}

export default function Breaches() {
    const [userBreachId, setUserBreachId] = useState<string | null>(null);
    const [open, setOpen] = useState(false);

    const { data: userBreachesQueryResult, status } = useQuery<UserBreachesQueryResult>({
        queryKey: ["user_breaches"],
        queryFn: async () => {
            const res = await fetch("/api/user_breaches");
            if (!res.ok) throw new Error("Network response was not ok");
            return res.json();
        },
        refetchOnWindowFocus: false,
    });

    const isLoading = status === "pending";
    const totalCount = userBreachesQueryResult?.total ?? 0;
    const gated = userBreachesQueryResult?.gated ?? false;
    const currentPlan = userBreachesQueryResult?.currentPlan ?? "free";

    // Pro-only list data (API returns [] for free)
    const breaches = userBreachesQueryResult?.userBreaches ?? [];

    const isFree = currentPlan === "free";
    const showUpgradeBanner = isFree && totalCount > 0;

    return (
        <div className="rounded-xl border border-white/10 bg-[#050505] p-5 min-h-[300px] sm:col-span-2 col-span-1 overflow-y-auto overflow-x-auto flex flex-col">
            <div className="mb-4">
                <h2 className="font-medium">Recent Breaches</h2>

                {showUpgradeBanner && (
                    <div className="mt-2 rounded-lg bg-blue-500/10 border border-blue-500/20 p-3">
                        <p className="text-sm text-blue-300">
                            We found <strong>{totalCount}</strong> breaches linked to your data.
                            <Link href="/dashboard/billing?plan=monthly">
                                <button className="text-blue-400 underline underline-offset-2 ml-1">
                                    Upgrade to Professional
                                </button>
                            </Link>{" "}
                            to unlock the breach list and details.
                        </p>
                    </div>
                )}
            </div>

            <div className="flex flex-col gap-4 flex-1">
                <Table className="h-full flex-1">
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[30%] text-xs text-muted-foreground">Service</TableHead>
                            <TableHead className="w-[15%] text-xs text-muted-foreground">Breach Date</TableHead>
                            <TableHead className="w-[30%] text-xs text-muted-foreground">Data Exposed</TableHead>
                            <TableHead className="w-[15%] text-xs text-muted-foreground">Severity</TableHead>
                            <TableHead className="w-[10%] text-xs text-muted-foreground text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center text-sm text-muted-foreground relative">
                                    <Spinner className="text-primary absolute top-1/2 left-1/2" />
                                </TableCell>
                            </TableRow>
                        ) : gated ? (
                            // ✅ Free tier: do NOT show list at all
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center text-sm text-muted-foreground">
                                    {totalCount > 0
                                        ? `Breach list is Pro-only. You have ${totalCount} breach${totalCount === 1 ? "" : "es"} detected.`
                                        : "No breaches found."}
                                </TableCell>
                            </TableRow>
                        ) : breaches.length > 0 ? (
                            breaches.map((ub) => {
                                const breach = ub.breach;
                                if (!breach) return null;

                                const name =
                                    (breach.raw as any)?.title ||
                                    (breach.raw as any)?.name ||
                                    breach.domain ||
                                    "Unknown service";

                                const exposed = breach.data_classes ?? [];
                                const firstFew = exposed.slice(0, 3);
                                const extraCount = exposed.length - firstFew.length;

                                const severity = severityLabel(breach);

                                return (
                                    <TableRow key={ub.id}>
                                        <TableCell className="align-top">
                                            <div className="flex flex-col gap-0.5">
                                                <span className="text-sm font-medium text-white">{name}</span>
                                                {breach.domain && (
                                                    <span className="text-xs text-muted-foreground">{breach.domain}</span>
                                                )}
                                            </div>
                                        </TableCell>

                                        <TableCell className="align-top text-sm text-muted-foreground">
                                            {breach.breach_date ? formatDate(breach.breach_date) : "Unknown"}
                                        </TableCell>

                                        <TableCell className="align-top">
                                            {exposed.length === 0 ? (
                                                <span className="text-xs text-muted-foreground">Not specified</span>
                                            ) : (
                                                <div className="flex flex-wrap gap-1">
                                                    {firstFew.map((dc) => (
                                                        <Badge
                                                            key={dc}
                                                            variant="outline"
                                                            className="border-white/10 bg-white/5 text-[11px] text-slate-100"
                                                        >
                                                            {dc}
                                                        </Badge>
                                                    ))}
                                                    {extraCount > 0 && (
                                                        <span className="text-[11px] text-muted-foreground">+{extraCount} more</span>
                                                    )}
                                                </div>
                                            )}
                                        </TableCell>

                                        <TableCell className="align-top">
                                            <Badge className={`border ${severity.className} text-[11px]`}>
                                                {severity.label}
                                            </Badge>
                                        </TableCell>

                                        <TableCell className="align-top text-right">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="h-7 px-2 text-[11px]"
                                                onClick={() => {
                                                    setUserBreachId(ub.id);
                                                    setOpen(true);
                                                }}
                                            >
                                                View details
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        ) : (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center text-sm text-muted-foreground">
                                    No breaches found
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <BreachDetailsSheet userBreachId={userBreachId} open={open} onOpenChangeAction={setOpen} />
        </div>
    );
}