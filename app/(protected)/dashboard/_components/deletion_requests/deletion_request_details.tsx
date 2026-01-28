import * as React from "react";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
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
                <SheetContent />
            </Sheet>
        );
    }

    const svc = selected.user_service?.service;
    const statusInfo =
        statusMap[selected.status] ?? {
            label: selected.status,
            className: "bg-muted/40 text-muted-foreground border-muted",
        };

    const methodLabel =
        selected.deletion_method === "email"
            ? "Email"
            : selected.deletion_method === "link"
                ? "Link"
                : "Manual";

    return (
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetContent className="overflow-y-auto bg-[#050505] border-l border-white/5">
                <SheetHeader>
                    <div className="space-y-2">
                        <SheetTitle className="text-2xl font-light text-white">
                            {svc?.name || "Unknown"}
                        </SheetTitle>
                        {svc?.domain && (
                            <p className="text-xs text-white/40">
                                {svc.domain}
                            </p>
                        )}
                    </div>
                </SheetHeader>

                <div className="mt-6 space-y-6 px-4">
                    {/* Status & Method */}
                    <div className="flex flex-wrap gap-2">
                        {svc?.category && (
                            <span className="text-xs text-white/60">
                                {svc.category}
                            </span>
                        )}
                        <span className="text-xs text-white/60">
                            {statusInfo.label}
                        </span>
                        <span className="text-xs text-white/60">
                            {methodLabel}
                        </span>
                        {svc?.is_breached && (
                            <div className="flex items-center gap-1.5">
                                <div className="h-1 w-1 rounded-full bg-red-500" />
                                <span className="text-xs text-red-400">Breached</span>
                            </div>
                        )}
                    </div>

                    {/* Details */}
                    <div className="space-y-4 text-sm">
                        <div className="grid gap-3">
                            {selected.receiver_email && (
                                <div>
                                    <p className="text-[11px] uppercase tracking-widest text-white/40 mb-1">
                                        To
                                    </p>
                                    <p className="text-sm text-white/80 break-all">
                                        {selected.receiver_email}
                                    </p>
                                </div>
                            )}

                            {selected.sender_email && (
                                <div>
                                    <p className="text-[11px] uppercase tracking-widest text-white/40 mb-1">
                                        From
                                    </p>
                                    <p className="text-sm text-white/80 break-all">
                                        {selected.sender_email}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Dates */}
                        <div className="grid grid-cols-2 gap-3 text-xs">
                            {selected.created_at && (
                                <div>
                                    <p className="text-white/40 font-medium uppercase tracking-widest text-[11px] mb-1">Started</p>
                                    <p className="text-white/80">{formatDate(selected.created_at)}</p>
                                </div>
                            )}
                            {selected.sent_at && (
                                <div>
                                    <p className="text-white/40 font-medium uppercase tracking-widest text-[11px] mb-1">Sent</p>
                                    <p className="text-white/80">{formatDate(selected.sent_at)}</p>
                                </div>
                            )}
                            {selected.last_reply_at && (
                                <div>
                                    <p className="text-white/40 font-medium uppercase tracking-widest text-[11px] mb-1">Last reply</p>
                                    <p className="text-white/80">{formatDate(selected.last_reply_at)}</p>
                                </div>
                            )}
                            {selected.updated_at && (
                                <div>
                                    <p className="text-white/40 font-medium uppercase tracking-widest text-[11px] mb-1">Updated</p>
                                    <p className="text-white/80">{formatDate(selected.updated_at)}</p>
                                </div>
                            )}
                            {typeof selected.follow_up_count === "number" && (
                                <div>
                                    <p className="text-white/40 font-medium uppercase tracking-widest text-[11px] mb-1">Follow-ups</p>
                                    <p className="text-white/80">{selected.follow_up_count}</p>
                                </div>
                            )}
                            {selected.next_follow_up_at && (
                                <div>
                                    <p className="text-white/40 font-medium uppercase tracking-widest text-[11px] mb-1">Next follow-up</p>
                                    <p className="text-white/80">{formatDate(selected.next_follow_up_at)}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Latest reply */}
                    {selected.last_reply_snippet && (
                        <div>
                            <p className="text-[11px] uppercase tracking-widest text-white/40 mb-2">
                                Latest reply
                            </p>
                            <div className="rounded-lg border border-white/5 bg-white/2 p-4 max-h-40 overflow-auto">
                                <p className="text-xs text-white/60 whitespace-pre-wrap">
                                    {selected.last_reply_snippet}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Your notes */}
                    {selected.user_notes && (
                        <div>
                            <p className="text-[11px] uppercase tracking-widest text-white/40 mb-2">
                                Your notes
                            </p>
                            <div className="rounded-lg border border-white/5 bg-white/2 p-4 max-h-40 overflow-auto">
                                <p className="text-xs text-white/60 whitespace-pre-wrap">
                                    {selected.user_notes}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Disclaimer */}
                    <div className="text-xs text-white/40 border-t border-white/5 pt-4 mt-4">
                        Not legal advice. Always review replies and consult professionals for complex disputes.
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}