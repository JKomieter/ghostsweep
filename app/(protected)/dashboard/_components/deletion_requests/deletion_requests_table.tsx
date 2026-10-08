import * as React from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
    Select,
    SelectTrigger,
    SelectContent,
    SelectItem,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/utils/format_date";
import { statusMap } from "@/constant/deletion-request-statuses";
import type { DeletionRequestListRow } from "@/queryTypes";

const statuses = [
    { name: "Open (in progress)", value: "open" },
    { name: "All statuses", value: "all" },
    { name: "Drafted", value: "drafted" },
    { name: "Sent", value: "sent" },
    { name: "Reply received", value: "received" },
    { name: "Needs verification", value: "needs_verification" },
    { name: "In progress", value: "in_progress" },
    { name: "Completed", value: "completed" },
    { name: "Failed", value: "failed" },
    { name: "Expired", value: "expired" },
] as const;

interface DeletionRequestsTableProps {
    requests: DeletionRequestListRow[] | undefined;
    isLoading: boolean;

    statusFilter: string;
    setStatusFilter: React.Dispatch<React.SetStateAction<string>>;

    setSelected: React.Dispatch<React.SetStateAction<DeletionRequestListRow | null>>;
    setSheetOpen: React.Dispatch<React.SetStateAction<boolean>>;

    page: number;
    setPage: React.Dispatch<React.SetStateAction<number>>;
    canPrev: boolean;
    canNext: boolean;

    total: number;
    totalPages: number;
}

export default function DeletionRequestsTable({
    requests,
    isLoading,
    statusFilter,
    setStatusFilter,
    setSelected,
    setSheetOpen,
    page,
    setPage,
    canNext,
    canPrev,
    total,
    totalPages,
}: DeletionRequestsTableProps) {
    const handleView = (req: DeletionRequestListRow) => {
        setSelected(req);
        setSheetOpen(true);
    };

    return (
        <div className="space-y-6">
            {/* Filter */}
            <div className="flex items-center gap-3">
                <span className="text-[11px] font-medium uppercase tracking-widest text-foreground/40">
                    Filter
                </span>
                <Select
                    value={statusFilter}
                    onValueChange={(value) => {
                        setStatusFilter(value);
                        setPage(1);
                    }}
                >
                    <SelectTrigger className="w-[200px] h-9 text-xs border-foreground/5 bg-foreground/2">
                        <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                        {statuses.map((s) => (
                            <SelectItem key={s.value} value={s.value}>
                                {s.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Table */}
            <div className="rounded-lg border border-foreground/5 bg-foreground/2 overflow-hidden">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader className="bg-foreground/2">
                            <TableRow className="border-foreground/5 hover:bg-transparent">
                                <TableHead className="font-medium text-[11px] uppercase tracking-widest text-foreground/40">Service</TableHead>
                                <TableHead className="font-medium text-[11px] uppercase tracking-widest text-foreground/40">Status</TableHead>
                                <TableHead className="font-medium text-[11px] uppercase tracking-widest text-foreground/40">Method</TableHead>
                                <TableHead className="font-medium text-[11px] uppercase tracking-widest text-foreground/40">Sent</TableHead>
                                <TableHead className="font-medium text-[11px] uppercase tracking-widest text-foreground/40">Updated</TableHead>
                                <TableHead className="text-right font-medium text-[11px] uppercase tracking-widest text-foreground/40">Action</TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {isLoading ? (
                                <TableRow className="hover:bg-transparent border-foreground/5">
                                    <TableCell
                                        colSpan={6}
                                        className="h-20 text-center text-sm text-foreground/60 relative"
                                    >
                                        <Spinner className="text-foreground absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                                    </TableCell>
                                </TableRow>
                            ) : (requests?.length ?? 0) === 0 ? (
                                <TableRow className="hover:bg-transparent border-foreground/5">
                                    <TableCell
                                        colSpan={6}
                                        className="h-20 text-center text-sm text-foreground/60"
                                    >
                                        No deletion requests yet.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                requests!.map((req) => {
                                    const svc = req.user_service?.service;
                                    const statusInfo =
                                        statusMap[req.status] ?? {
                                            label: req.status,
                                            className: "bg-muted/40 text-muted-foreground border-muted",
                                        };

                                    const methodLabel =
                                        req.deletion_method === "email"
                                            ? "Email"
                                            : req.deletion_method === "link"
                                                ? "Link"
                                                : "Manual";

                                    const lastUpdateIso = req.last_reply_at ?? req.updated_at ?? null;

                                    return (
                                        <TableRow key={req.id} className="hover:bg-foreground/3 border-foreground/5">
                                            <TableCell className="text-sm">
                                                <div className="flex flex-col">
                                                    <span className="font-light text-foreground">
                                                        {svc?.name || "Unknown"}
                                                    </span>
                                                    {svc?.domain && (
                                                        <span className="text-xs text-foreground/40">
                                                            {svc.domain}
                                                        </span>
                                                    )}
                                                </div>
                                            </TableCell>

                                            <TableCell>
                                                <span className="text-xs text-foreground/60">
                                                    {statusInfo.label}
                                                </span>
                                            </TableCell>

                                            <TableCell className="text-xs text-foreground/60">
                                                {methodLabel}
                                            </TableCell>

                                            <TableCell className="text-xs text-foreground/60">
                                                {req.sent_at ? formatDate(req.sent_at) : "—"}
                                            </TableCell>

                                            <TableCell className="text-xs text-foreground/60">
                                                {lastUpdateIso ? formatDate(lastUpdateIso) : "—"}
                                            </TableCell>

                                            <TableCell className="text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-xs h-7 border border-foreground/5 bg-foreground/2 hover:border-foreground/10 hover:bg-foreground/3"
                                                    onClick={() => handleView(req)}
                                                >
                                                    View
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {/* Pagination */}
            {total > 0 && (
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between text-xs text-foreground/60">
                    <p>
                        Page {page} of {totalPages} • {total} request{total === 1 ? "" : "s"}
                    </p>
                    <div className="flex gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="border border-foreground/5 bg-foreground/2 hover:border-foreground/10 hover:bg-foreground/3"
                            disabled={!canPrev || isLoading}
                            onClick={() => canPrev && setPage((p) => p - 1)}
                        >
                            Previous
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="border border-foreground/5 bg-foreground/2 hover:border-foreground/10 hover:bg-foreground/3"
                            disabled={!canNext || isLoading}
                            onClick={() => canNext && setPage((p) => p + 1)}
                        >
                            Next
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
