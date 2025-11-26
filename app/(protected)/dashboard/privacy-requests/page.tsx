"use client";

import { useState } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectTrigger,
    SelectContent,
    SelectItem,
    SelectValue,
} from "@/components/ui/select";
import { formatDate } from "@/utils/format-date";
import { PrivacyAction, PrivacyStatus, Category } from "@/types";
import { Spinner } from "@/components/ui/spinner";

type PrivacyRequest = {
    id: string;
    user_id: string;
    service_id: string;
    action: PrivacyAction;
    status: PrivacyStatus;
    to_address: string | null;
    subject: string | null;
    sent_at: string | null;
    last_checked_at: string | null;
    last_reply_at: string | null;
    reply_message_id: string | null;
    reply_snippet: string | null;
    last_notified_status: PrivacyStatus | null;
    last_notified_at: string | null;
    service: {
        id: string;
        name: string | null;
        domain: string | null;
        category: Category | null;
        default_privacy_email: string | null;
        is_breached: boolean | null;
    } | null;
};

type ApiResponse = {
    requests: PrivacyRequest[];
    total: number;
    page: number;
    pageSize: number;
};

const PAGE_SIZE = 20;

const statusMap: Record<
    PrivacyStatus,
    { label: string; className: string }
> = {
    drafted: {
        label: "Drafted",
        className: "bg-zinc-500/10 text-zinc-300",
    },
    sent: {
        label: "Sent",
        className: "bg-blue-500/10 text-blue-300",
    },
    received: {
        label: "Reply Received",
        className: "bg-indigo-500/10 text-indigo-300",
    },
    needs_verification: {
        label: "Needs Verification",
        className: "bg-yellow-500/10 text-yellow-300",
    },
    in_progress: {
        label: "In Progress",
        className: "bg-purple-500/10 text-purple-300",
    },
    completed: {
        label: "Completed",
        className: "bg-emerald-500/10 text-emerald-300",
    },
    failed: {
        label: "Failed",
        className: "bg-red-500/10 text-red-300",
    },
    expired: {
        label: "Expired",
        className: "bg-orange-500/10 text-orange-300",
    },
};

function actionLabel(action: PrivacyAction) {
    return action === "delete" ? "Delete account & data" : "Reduce data usage";
}

export default function PrivacyRequestsPage() {
    const [page, setPage] = useState(1);
    const [statusFilter, setStatusFilter] = useState<string>("open");
    const [selected, setSelected] = useState<PrivacyRequest | null>(null);
    const [sheetOpen, setSheetOpen] = useState(false);

    const { data, status } = useQuery<ApiResponse>({
        queryKey: ["privacy-requests", page, statusFilter],
        queryFn: async () => {
            const params = new URLSearchParams();
            params.set("page", String(page));
            params.set("pageSize", String(PAGE_SIZE));
            if (statusFilter && statusFilter !== "all") {
                params.set("status", statusFilter);
            }

            const res = await fetch(`/api/privacy-requests?${params.toString()}`);
            if (!res.ok) {
                throw new Error("Failed to fetch privacy requests");
            }
            return res.json();
        },
        placeholderData: keepPreviousData,
        refetchOnWindowFocus: false,
    });

    const isLoading = status === "pending";
    const requests = data?.requests ?? [];
    const total = data?.total ?? 0;
    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

    const canPrev = page > 1;
    const canNext = page < totalPages;

    const handleView = (req: PrivacyRequest) => {
        setSelected(req);
        setSheetOpen(true);
    };

    return (
        <div className="p-4 md:p-8 min-h-[calc(100vh-3.5rem)]">
            {/* Header */}
            <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-xl md:text-2xl font-semibold text-white">
                        Privacy Requests
                    </h1>
                    <p className="text-sm text-white/50 mt-1">
                        Track your deletion and data reduction requests across services.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <Select
                        value={statusFilter}
                        onValueChange={(value) => {
                            setStatusFilter(value);
                            setPage(1);
                        }}
                    >
                        <SelectTrigger className="w-[180px] bg-[#050505] border-white/15">
                            <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="open">Open (In Progress)</SelectItem>
                            <SelectItem value="all">All statuses</SelectItem>
                            <SelectItem value="sent">Sent</SelectItem>
                            <SelectItem value="received">Reply received</SelectItem>
                            <SelectItem value="needs_verification">Needs verification</SelectItem>
                            <SelectItem value="in_progress">In progress</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="failed">Failed</SelectItem>
                            <SelectItem value="expired">Expired</SelectItem>
                            <SelectItem value="drafted">Drafted</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Table container */}
            <div className="rounded-xl border border-white/10 bg-[#050505] p-4 md:p-5">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Service</TableHead>
                                <TableHead>Action</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Sent</TableHead>
                                <TableHead>Last update</TableHead>
                                <TableHead></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={6}
                                        className="h-24 text-center text-sm text-muted-foreground relative"
                                    >
                                        <Spinner className="text-primary absolute top-1/2 left-1/2" />
                                    </TableCell>
                                </TableRow>
                            ) : requests.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={6}
                                        className="h-24 text-center text-sm text-muted-foreground"
                                    >
                                        No privacy requests yet.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                requests.map((req) => {
                                    const svc = req.service;
                                    const statusInfo = statusMap[req.status];

                                    return (
                                        <TableRow key={req.id}>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-medium">
                                                        {svc?.name || "Unknown service"}
                                                    </span>
                                                    {svc?.domain && (
                                                        <span className="text-xs text-muted-foreground">
                                                            {svc.domain}
                                                        </span>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <span className="text-xs text-muted-foreground">
                                                    {actionLabel(req.action)}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    className={`text-xs border-0 ${statusInfo.className}`}
                                                >
                                                    {statusInfo.label}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-xs text-muted-foreground">
                                                {req.sent_at ? formatDate(req.sent_at) : "—"}
                                            </TableCell>
                                            <TableCell className="text-xs text-muted-foreground">
                                                {req.last_reply_at
                                                    ? formatDate(req.last_reply_at)
                                                    : req.last_checked_at
                                                        ? formatDate(req.last_checked_at)
                                                        : "—"}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="link"
                                                    size="sm"
                                                    className="px-0 text-xs"
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

                {/* Pagination */}
                {total > 0 && (
                    <div className="mt-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                        <p className="text-xs text-muted-foreground">
                            Showing page {page} of {totalPages} • {total} request
                            {total === 1 ? "" : "s"}
                        </p>
                        <div className="flex gap-2 justify-end">
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={!canPrev || isLoading}
                                onClick={() => {
                                    if (!canPrev) return;
                                    setPage((p) => p - 1);
                                }}
                            >
                                Previous
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={!canNext || isLoading}
                                onClick={() => {
                                    if (!canNext) return;
                                    setPage((p) => p + 1);
                                }}
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {/* Detail Sheet */}
            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                <SheetContent className="bg-[#050505] border-white/10 text-white">
                    {selected && (
                        <>
                            <SheetHeader>
                                <SheetTitle className="flex flex-col gap-1">
                                    <span className="text-xs uppercase tracking-wide text-muted-foreground">
                                        Privacy Request
                                    </span>
                                    <span className="text-lg font-semibold">
                                        {selected.service?.name || "Unknown service"}
                                    </span>
                                </SheetTitle>
                                <SheetDescription className="text-xs text-white/50">
                                    {selected.service?.domain}
                                </SheetDescription>
                            </SheetHeader>

                            <div className="mt-4 space-y-4 text-sm px-4">
                                <div className="flex flex-wrap gap-2">
                                    <Badge variant="outline" className="text-xs capitalize">
                                        {selected.service?.category || "Uncategorized"}
                                    </Badge>
                                    <Badge
                                        className={`text-xs border-0 ${statusMap[selected.status].className
                                            }`}
                                    >
                                        {statusMap[selected.status].label}
                                    </Badge>
                                    {selected.service?.is_breached && (
                                        <Badge className="text-xs bg-red-500/15 text-red-200 border-red-500/40">
                                            Breached service
                                        </Badge>
                                    )}
                                </div>

                                <div className="space-y-2 text-xs">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Action</span>
                                        <span>{actionLabel(selected.action)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">To</span>
                                        <span>{selected.to_address || "—"}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Subject</span>
                                        <span className="truncate max-w-[180px] md:max-w-60 text-right">
                                            {selected.subject || "—"}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Sent</span>
                                        <span>
                                            {selected.sent_at ? formatDate(selected.sent_at) : "—"}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Last reply</span>
                                        <span>
                                            {selected.last_reply_at
                                                ? formatDate(selected.last_reply_at)
                                                : "—"}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Last checked</span>
                                        <span>
                                            {selected.last_checked_at
                                                ? formatDate(selected.last_checked_at)
                                                : "—"}
                                        </span>
                                    </div>
                                </div>

                                {selected.reply_snippet && (
                                    <div className="mt-4">
                                        <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">
                                            Latest reply preview
                                        </p>
                                        <div className="rounded-md border border-white/10 bg-black/60 p-3 max-h-40 overflow-auto">
                                            <p className="text-xs text-white/80 whitespace-pre-wrap">
                                                {selected.reply_snippet}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                <div className="mt-4 text-xs text-muted-foreground">
                                    GhostSweep is not a law firm. Always review company replies
                                    and, if needed, consult a legal professional for complex
                                    privacy disputes.
                                </div>
                            </div>
                        </>
                    )}
                </SheetContent>
            </Sheet>
        </div>
    );
}