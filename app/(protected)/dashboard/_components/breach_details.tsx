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
            <SheetContent className="w-full sm:max-w-xl bg-[#050505] border-l border-white/10 text-sm px-4">
                <SheetHeader className="space-y-2">
                    <SheetTitle className="flex flex-col gap-1">
                        <span className="text-xs uppercase tracking-wide text-muted-foreground">
                            Breach details
                        </span>
                        <span className="text-lg font-semibold">
                            {service?.name || breach?.raw?.title || "Service breach"}
                        </span>
                    </SheetTitle>
                    <SheetDescription>
                        What was exposed and when, based on the public breach record.
                    </SheetDescription>
                </SheetHeader>

                {/* Loading / error states */}
                {isLoading && (
                    <div className="mt-6 text-xs text-muted-foreground">
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
                    <div className="mt-6 text-xs text-muted-foreground">
                        No breach details found for this record.
                    </div>
                )}

                {/* Content */}
                {!isLoading && !error && breach && service && (
                    <div className="mt-5 space-y-6">
                        {/* Top summary */}
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <span className="text-base font-medium">
                                    {service.name || breach.raw?.name || "Unknown service"}
                                </span>
                                {service.domain && (
                                    <span className="text-xs text-muted-foreground">
                                        {service.domain}
                                    </span>
                                )}
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                                {severity && (
                                    <Badge
                                        variant="outline"
                                        className={cn("text-[11px] px-2 py-0.5 border", severity.className)}
                                    >
                                        Severity: {severity.label}
                                    </Badge>
                                )}

                                {breach.breach_date && (
                                    <Badge
                                        variant="outline"
                                        className="text-[11px] border-white/15 bg-white/5 text-white/80"
                                    >
                                        Breach date: {formatDate(breach.breach_date)}
                                    </Badge>
                                )}

                                {breach.pwn_count && breach.pwn_count > 0 && (
                                    <span className="text-[11px] text-muted-foreground">
                                        ~{breach.pwn_count.toLocaleString()} accounts affected
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Data exposed */}
                        <div className="space-y-2">
                            <h3 className="text-xs font-semibold text-white/80">Data exposed</h3>
                            {breach.data_classes && breach.data_classes.length > 0 ? (
                                <div className="flex flex-wrap gap-1.5">
                                    {breach.data_classes.map((dc) => (
                                        <Badge
                                            key={dc}
                                            variant="outline"
                                            className="text-[11px] border-white/10 bg-white/5 text-white/80"
                                        >
                                            {dc}
                                        </Badge>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-xs text-muted-foreground">
                                    The breach record did not specify exact data types.
                                </p>
                            )}
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                            <h3 className="text-xs font-semibold text-white/80">What happened</h3>
                            <div className="rounded-md border border-white/10 bg-black/50 p-3 max-h-48 overflow-auto">
                                <p className="text-xs leading-relaxed text-white/80 whitespace-pre-wrap">
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