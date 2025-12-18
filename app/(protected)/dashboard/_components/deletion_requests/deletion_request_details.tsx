import * as React from "react";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { statusMap } from "@/constant/deletion-request-statuses";
import { formatDate } from "@/utils/format_date";
import type { DeletionRequestListRow } from "@/queryTypes";

interface DeletionRequestDetailProps {
    sheetOpen: boolean;
    setSheetOpen: React.Dispatch<React.SetStateAction<boolean>>;
    selected: DeletionRequestListRow | null;
}

export default function DeletionRequestDetail({
    sheetOpen,
    setSheetOpen,
    selected,
}: DeletionRequestDetailProps) {
    if (!selected) {
        return (
            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                <SheetContent className="bg-[#050505] border-white/10 text-white" />
            </Sheet>
        );
    }

    const svc = selected.user_service?.service;
    const statusInfo =
        statusMap[selected.status] ?? {
            label: selected.status,
            className: "bg-zinc-500/15 text-zinc-200 border-zinc-500/30",
        };

    const methodLabel =
        selected.deletion_method === "email"
            ? "Email"
            : selected.deletion_method === "link"
                ? "Link"
                : "Manual";

    return (
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetContent className="bg-[#050505] border-white/10 text-white">
                <SheetHeader>
                    <SheetTitle className="flex flex-col gap-1">
                        <span className="text-xs uppercase tracking-wide text-muted-foreground">
                            Deletion request
                        </span>
                        <span className="text-lg font-semibold">
                            {svc?.name || "Unknown service"}
                        </span>
                    </SheetTitle>
                    <SheetDescription className="text-xs text-white/50">
                        {svc?.domain || "—"}
                    </SheetDescription>
                </SheetHeader>

                <div className="mt-4 space-y-4 text-sm px-4">
                    <div className="flex flex-wrap gap-2">
                        <Badge variant="outline" className="text-xs capitalize">
                            {svc?.category || "Uncategorized"}
                        </Badge>

                        <Badge className={`text-xs border-0 ${statusInfo.className}`}>
                            {statusInfo.label}
                        </Badge>

                        <Badge variant="outline" className="text-xs">
                            Method: {methodLabel}
                        </Badge>

                        {svc?.is_breached && (
                            <Badge className="text-xs bg-red-500/15 text-red-200 border-red-500/40">
                                Breached service
                            </Badge>
                        )}
                    </div>

                    <div className="space-y-2 text-xs">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">To</span>
                            <span className="truncate max-w-[180px] md:max-w-60 text-right">
                                {selected.receiver_email || "—"}
                            </span>
                        </div>

                        <div className="flex justify-between">
                            <span className="text-muted-foreground">From</span>
                            <span className="truncate max-w-[180px] md:max-w-60 text-right">
                                {selected.sender_email || "—"}
                            </span>
                        </div>

                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Started</span>
                            <span>{selected.created_at ? formatDate(selected.created_at) : "—"}</span>
                        </div>

                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Sent</span>
                            <span>{selected.sent_at ? formatDate(selected.sent_at) : "—"}</span>
                        </div>

                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Last reply</span>
                            <span>{selected.last_reply_at ? formatDate(selected.last_reply_at) : "—"}</span>
                        </div>

                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Updated</span>
                            <span>{selected.updated_at ? formatDate(selected.updated_at) : "—"}</span>
                        </div>

                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Follow-ups</span>
                            <span>{typeof selected.follow_up_count === "number" ? selected.follow_up_count : "—"}</span>
                        </div>

                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Next follow-up</span>
                            <span>
                                {selected.next_follow_up_at ? formatDate(selected.next_follow_up_at) : "—"}
                            </span>
                        </div>
                    </div>

                    {selected.last_reply_snippet && (
                        <div className="mt-4">
                            <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">
                                Latest reply preview
                            </p>
                            <div className="rounded-md border border-white/10 bg-black/60 p-3 max-h-40 overflow-auto">
                                <p className="text-xs text-white/80 whitespace-pre-wrap">
                                    {selected.last_reply_snippet}
                                </p>
                            </div>
                        </div>
                    )}

                    {selected.user_notes && (
                        <div className="mt-4">
                            <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">
                                Your notes
                            </p>
                            <div className="rounded-md border border-white/10 bg-black/60 p-3 max-h-40 overflow-auto">
                                <p className="text-xs text-white/80 whitespace-pre-wrap">
                                    {selected.user_notes}
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="mt-4 text-xs text-muted-foreground">
                        GhostSweep is not a law firm. Always review company replies and, if needed,
                        consult a legal professional for complex privacy disputes.
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}