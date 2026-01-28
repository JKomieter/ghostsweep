"use client";

import { useQuery } from "@tanstack/react-query";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/utils/format_date";
import { cn } from "@/lib/utils";
import type { Breach } from "@/types";
import type { UserBreachDetailsQueryResult } from "@/queryTypes";

interface BreachDetailsSheetProps {
    open: boolean;
    onOpenChangeAction: (open: boolean) => void;
    userBreachId: string | null;
}

function severityBadge(breach: Breach) {
    const pwn = breach.pwn_count ?? 0;
    const sensitive = breach.is_sensitive ?? false;

    if (sensitive || pwn > 10_000_000) {
        return {
            label: "High",
            className: "bg-red-500/20 text-red-200 border-red-500/40",
        };
    }

    if (pwn > 100_000) {
        return {
            label: "Medium",
            className: "bg-amber-500/20 text-amber-200 border-amber-500/40",
        };
    }

    return {
        label: "Low",
        className: "bg-emerald-500/15 text-emerald-200 border-emerald-500/30",
    };
}

export function BreachDetailsSheet({
    open,
    onOpenChangeAction,
    userBreachId,
}: BreachDetailsSheetProps) {
    const { data, isLoading, error } = useQuery<UserBreachDetailsQueryResult>({
        queryKey: ["user_breach_details", userBreachId],
        enabled: open && !!userBreachId,
        queryFn: async () => {
            if (!userBreachId) throw new Error("No breachId provided");
            const res = await fetch(`/api/user_breaches/${userBreachId}`);
            if (!res.ok) throw new Error("Failed to load breach details");
            return res.json();
        },
        staleTime: 60_000,
    });

    const breach = data?.userBreach?.breach ?? null;
    const service = data?.userBreach?.service ?? null;

    const severity = breach ? severityBadge(breach) : null;

    return (
        <Sheet open={open} onOpenChange={onOpenChangeAction}>
            <SheetContent className="w-full sm:max-w-xl bg-[#050505] border-l border-white/5 text-sm px-6">
                <SheetHeader className="space-y-3">
                    <SheetTitle className="flex flex-col gap-2">
                        <span className="text-[11px] font-medium uppercase tracking-widest text-white/40">
                            Breach details
                        </span>
                        <span className="text-xl font-light text-white">
                            {service?.name || breach?.raw?.title || "Service breach"}
                        </span>
                    </SheetTitle>
                    <SheetDescription className="text-xs text-white/60">
                        What was exposed and when, based on the public breach record.
                    </SheetDescription>
                </SheetHeader>

                {/* Loading / error states */}
                {isLoading && (
                    <div className="mt-6 text-xs text-white/40">
                        Loading breach details…
                    </div>
                )}

                {error && !isLoading && (
                    <div className="mt-6 text-xs text-red-400">
                        Could not load breach details. Please try again.
                    </div>
                )}

                {/* Empty state */}
                {!isLoading && !error && (!breach || !service) && (
                    <div className="mt-6 text-xs text-white/40">
                        No breach details found for this record.
                    </div>
                )}

                {/* Content */}
                {!isLoading && !error && breach && service && (
                    <div className="mt-6 space-y-6">
                        {/* Top summary */}
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <span className="text-base font-light text-white">
                                    {service.name || breach?.name || "Unknown service"}
                                </span>
                                {service.domain && (
                                    <span className="text-xs text-white/40">
                                        {service.domain}
                                    </span>
                                )}
                            </div>

                            <div className="flex flex-wrap items-center gap-3">
                                {severity && (
                                    <div className="flex items-center gap-2">
                                        <div className={`h-1.5 w-1.5 rounded-full ${
                                            severity.label === 'High' ? 'bg-red-500' :
                                            severity.label === 'Medium' ? 'bg-amber-500' :
                                            'bg-emerald-500'
                                        }`} />
                                        <span className="text-[11px] text-white/60">Severity: {severity.label}</span>
                                    </div>
                                )}

                                {breach.breach_date && (
                                    <span className="text-[11px] text-white/60">
                                        Breach date: {formatDate(breach.breach_date)}
                                    </span>
                                )}

                                {breach.pwn_count && breach.pwn_count > 0 && (
                                    <span className="text-[11px] text-white/40">
                                        ~{breach.pwn_count.toLocaleString()} accounts affected
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Data exposed */}
                        <div className="space-y-3">
                            <h3 className="text-[11px] font-medium uppercase tracking-widest text-white/40">Data exposed</h3>
                            {breach.data_classes && breach.data_classes.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                    {breach.data_classes.map((dc) => (
                                        <span
                                            key={dc}
                                            className="text-[11px] text-white/60"
                                        >
                                            {dc}
                                        </span>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-xs text-white/40">
                                    The breach record did not specify exact data types.
                                </p>
                            )}
                        </div>

                        {/* Description */}
                        <div className="space-y-3">
                            <h3 className="text-[11px] font-medium uppercase tracking-widest text-white/40">What happened</h3>
                            <div className="rounded-lg border border-white/5 bg-white/2 p-4 max-h-48 overflow-auto">
                                <p className="text-xs leading-relaxed text-white/60 whitespace-pre-wrap">
                                    {breach.description
                                        ? String(breach.description)
                                        : "No public incident description was provided for this breach."}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </SheetContent>
        </Sheet>
    );
}