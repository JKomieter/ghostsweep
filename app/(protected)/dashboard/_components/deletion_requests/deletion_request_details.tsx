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
            <SheetContent className="overflow-y-auto">
                <SheetHeader>
                    <div className="space-y-2">
                        <SheetTitle className="text-2xl">
                            {svc?.name || "Unknown"}
                        </SheetTitle>
                        {svc?.domain && (
                            <p className="text-xs text-muted-foreground">
                                {svc.domain}
                            </p>
                        )}
                    </div>
                </SheetHeader>

                <div className="mt-6 space-y-6 px-4">
                    {/* Status & Method */}
                    <div className="flex flex-wrap gap-2">
                        {svc?.category && (
                            <Badge variant="outline" className="text-xs">
                                {svc.category}
                            </Badge>
                        )}
                        <Badge
                            variant="outline"
                            className={`text-xs font-medium ${statusInfo.className}`}
                        >
                            {statusInfo.label}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                            {methodLabel}
                        </Badge>
                        {svc?.is_breached && (
                            <Badge className="text-xs bg-destructive/15 text-destructive border-destructive/30">
                                Breached
                            </Badge>
                        )}
                    </div>

                    {/* Details */}
                    <div className="space-y-4 text-sm">
                        <div className="grid gap-3">
                            {selected.receiver_email && (
                                <div>
                                    <p className="text-xs font-medium text-muted-foreground mb-1">
                                        To
                                    </p>
                                    <p className="text-sm break-all">
                                        {selected.receiver_email}
                                    </p>
                                </div>
                            )}

                            {selected.sender_email && (
                                <div>
                                    <p className="text-xs font-medium text-muted-foreground mb-1">
                                        From
                                    </p>
                                    <p className="text-sm break-all">
                                        {selected.sender_email}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Dates */}
                        <div className="grid grid-cols-2 gap-3 text-xs">
                            {selected.created_at && (
                                <div>
                                    <p className="text-muted-foreground font-medium mb-1">Started</p>
                                    <p>{formatDate(selected.created_at)}</p>
                                </div>
                            )}
                            {selected.sent_at && (
                                <div>
                                    <p className="text-muted-foreground font-medium mb-1">Sent</p>
                                    <p>{formatDate(selected.sent_at)}</p>
                                </div>
                            )}
                            {selected.last_reply_at && (
                                <div>
                                    <p className="text-muted-foreground font-medium mb-1">Last reply</p>
                                    <p>{formatDate(selected.last_reply_at)}</p>
                                </div>
                            )}
                            {selected.updated_at && (
                                <div>
                                    <p className="text-muted-foreground font-medium mb-1">Updated</p>
                                    <p>{formatDate(selected.updated_at)}</p>
                                </div>
                            )}
                            {typeof selected.follow_up_count === "number" && (
                                <div>
                                    <p className="text-muted-foreground font-medium mb-1">Follow-ups</p>
                                    <p>{selected.follow_up_count}</p>
                                </div>
                            )}
                            {selected.next_follow_up_at && (
                                <div>
                                    <p className="text-muted-foreground font-medium mb-1">Next follow-up</p>
                                    <p>{formatDate(selected.next_follow_up_at)}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Latest reply */}
                    {selected.last_reply_snippet && (
                        <div>
                            <p className="text-xs font-medium text-muted-foreground mb-2">
                                Latest reply
                            </p>
                            <div className="rounded-lg border border-border bg-muted/30 p-3 max-h-40 overflow-auto">
                                <p className="text-xs text-muted-foreground whitespace-pre-wrap">
                                    {selected.last_reply_snippet}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Your notes */}
                    {selected.user_notes && (
                        <div>
                            <p className="text-xs font-medium text-muted-foreground mb-2">
                                Your notes
                            </p>
                            <div className="rounded-lg border border-border bg-muted/30 p-3 max-h-40 overflow-auto">
                                <p className="text-xs text-muted-foreground whitespace-pre-wrap">
                                    {selected.user_notes}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Disclaimer */}
                    <div className="text-xs text-muted-foreground border-t border-border pt-4 mt-4">
                        Not legal advice. Always review replies and consult professionals for complex disputes.
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}