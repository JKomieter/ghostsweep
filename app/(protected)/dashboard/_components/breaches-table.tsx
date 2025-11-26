import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { TableBody, TableCell, TableHead, TableHeader, TableRow, Table } from "@/components/ui/table";
import { formatDate } from "@/utils/format-date";
import { useQuery } from "@tanstack/react-query"
import { useState } from "react";
import { BreachDetailsSheet } from "./breach-details";

type BreachRecord = {
    id: string;
    domain: string | null;
    breach_date: string | null;
    pwn_count: number | null;
    data_classes: string[] | null;
    is_sensitive: boolean | null;
    raw?: {
        name?: string | null;
        title?: string | null;
        description?: string | null;
        logo_path?: string | null;
    } | null;
};

function severityLabel(breach: BreachRecord) {
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
    const [breachid, setBreachId] = useState<string | null>(null)
    const [open, setOpen] = useState(false)

    const { data: breaches, status, } = useQuery({
        queryKey: ['breaches'],
        queryFn: async (): Promise<{ breaches: BreachRecord[], total: number }> => {
            const res = await fetch('/api/user-breaches')
            if (!res.ok) {
                throw new Error('Network response was not ok')
            }
            const { breaches, total } = await res.json()
            return { breaches, total }
        },
    })
    
    const { data: plan } = useQuery({
        queryKey: ['plan'],
        queryFn: async (): Promise<{ current_plan: "free" | "pro" }> => {
            const res = await fetch('/api/plan', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!res.ok) {
                throw new Error('Failed to fetch plan data');
            }

            return res.json();
        },
    })

    const isFree = plan?.current_plan === "free"
    const visibleCount = breaches?.breaches?.length ?? 0
    const totalCount = breaches?.total ?? visibleCount
    const hasHiddenBreaches = isFree && totalCount > visibleCount


    return (
        <div className="rounded-xl border border-white/10 bg-[#050505] p-5 min-h-[300px] sm:col-span-2 col-span-1 overflow-y-auto overflow-x-auto flex flex-col">
            <div className="mb-4">
                <h2 className="font-medium">
                    Recent Breaches
                </h2>
                {hasHiddenBreaches && (
                    <div className="mt-2 rounded-lg bg-blue-500/10 border border-blue-500/20 p-3">
                        <p className="text-sm text-blue-300">
                            We found <strong>{totalCount}</strong> breaches linked to your data.
                            You&apos;re seeing the first <strong>{visibleCount}</strong>.
                            <button
                                className="text-blue-400 underline underline-offset-2 ml-1"
                            >
                                Upgrade to Pro
                            </button>{" "}
                            to unlock all breach details.
                        </p>
                    </div>
                )}
            </div>
            <div className="flex flex-col gap-4 flex-1">
                <Table className="h-full flex-1">
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[30%] text-xs text-muted-foreground">
                                Service
                            </TableHead>
                            <TableHead className="w-[15%] text-xs text-muted-foreground">
                                Breach Date
                            </TableHead>
                            <TableHead className="w-[30%] text-xs text-muted-foreground">
                                Data Exposed
                            </TableHead>
                            <TableHead className="w-[15%] text-xs text-muted-foreground">
                                Severity
                            </TableHead>
                            <TableHead className="w-[10%] text-xs text-muted-foreground text-right">
                                Actions
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {status === "pending" ? (
                            <TableRow>
                                <TableCell
                                    colSpan={5}
                                    className="h-24 text-center text-sm text-muted-foreground relative"
                                >
                                    <Spinner className="text-primary absolute top-1/2 left-1/2" />
                                </TableCell>
                            </TableRow>
                        ):
                        breaches?.breaches && breaches?.breaches.length > 0 ?
                                breaches?.breaches.map((breach) => {
                                    const name =
                                        breach.raw?.title ||
                                        breach.raw?.name ||
                                        breach.domain ||
                                        "Unknown service";

                                    const exposed = breach.data_classes ?? [];
                                    const firstFew = exposed.slice(0, 3);
                                    const extraCount = exposed.length - firstFew.length;

                                    const severity = severityLabel(breach);

                                    return (
                                        <TableRow key={breach.id}>
                                            {/* Service */}
                                            <TableCell className="align-top">
                                                <div className="flex flex-col gap-0.5">
                                                    <span className="text-sm font-medium text-white">
                                                        {name}
                                                    </span>
                                                    {breach.domain && (
                                                        <span className="text-xs text-muted-foreground">
                                                            {breach.domain}
                                                        </span>
                                                    )}
                                                </div>
                                            </TableCell>

                                            {/* Breach Date */}
                                            <TableCell className="align-top text-sm text-muted-foreground">
                                                {breach.breach_date ? formatDate(breach.breach_date) : "Unknown"}
                                            </TableCell>

                                            {/* Data Exposed */}
                                            <TableCell className="align-top">
                                                {exposed.length === 0 ? (
                                                    <span className="text-xs text-muted-foreground">
                                                        Not specified
                                                    </span>
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
                                                            <span className="text-[11px] text-muted-foreground">
                                                                +{extraCount} more
                                                            </span>
                                                        )}
                                                    </div>
                                                )}
                                            </TableCell>

                                            {/* Severity */}
                                            <TableCell className="align-top">
                                                <Badge
                                                    className={`border ${severity.className} text-[11px]`}
                                                >
                                                    {severity.label}
                                                </Badge>
                                            </TableCell>

                                            {/* Actions */}
                                            <TableCell className="align-top text-right">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="h-7 px-2 text-[11px]"
                                                    onClick={() => {
                                                        setBreachId(breach.id)
                                                        setOpen(true)
                                                    }}
                                                >
                                                    View details
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    );
                                }) : (
                                    <TableRow>
                                        <TableCell
                                            colSpan={5}
                                            className="h-24 text-center text-sm text-muted-foreground"
                                        >
                                           No breaches found
                                        </TableCell>
                                    </TableRow>
                                )}
                    </TableBody>
                </Table>
            </div>
            <BreachDetailsSheet breachId={breachid} open={open} onOpenChangeAction={setOpen} />
        </div>
    )
}