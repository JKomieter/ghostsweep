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
import { formatDate } from "@/utils/format-date";
import { DeletionRequest } from "../../deletion-requests/page";
import { statusMap } from "@/constant/deletion-request-statuses";


const statuses = [
    {name: "Open (In Progress)", value: "open"},
    {name: "All statuses", value: "all"},
    {name: "Sent", value: "sent"},
    { name: "Reply received", value: "received"},
    { name: "Needs verification", value: "needs_verification"},
    { name: "in_progress", value: "In progress"},
    { name: "Completed", value: "completed"},
    {name: "Failed", value: "failed"},
    {name: "expired", value: "expired"},
    {name: "Drafted", value: "drafted"}
]

interface DeletionRequestsTableProps {
    requests: DeletionRequest[] | undefined;
    isLoading: boolean;
    statusFilter: string;
    setStatusFilter: React.Dispatch<React.SetStateAction<string>>
    setSelected: React.Dispatch<React.SetStateAction<DeletionRequest | null>>;
    setSheetOpen: React.Dispatch<React.SetStateAction<boolean>>
    page: number;
    setPage: React.Dispatch<React.SetStateAction<number>>
    canPrev: boolean;
    canNext: boolean
    total: number;
    totalPages: number
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
    totalPages
}: DeletionRequestsTableProps) {
    const handleView = (req: DeletionRequest) => {
        setSelected(req);
        setSheetOpen(true);
    };

    return (
        <div className="space-y-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-white/10 bg-[#050505] p-4">
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
                        {statuses.map((s) => (
                            <SelectItem key={s.value} value={s.value}>{s.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <div className="rounded-xl border border-white/10 bg-[#050505] p-4 md:p-5">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Service</TableHead>
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
                            ) : requests?.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={6}
                                        className="h-24 text-center text-sm text-muted-foreground"
                                    >
                                        No deletion requests yet.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                requests?.map((req) => {
                                    const svc = req?.user_service?.service;
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
        </div>
    )
}