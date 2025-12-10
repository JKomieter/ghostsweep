import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { statusMap } from "@/constant/deletion-request-statuses";
import { formatDate } from "@/utils/format-date";
import { DeletionRequest } from "../../deletion-requests/page";

interface DeletionRequestDetailProps {
    sheetOpen: boolean;
    setSheetOpen: React.Dispatch<React.SetStateAction<boolean>>;
    selected: DeletionRequest | null;
}

export default function DeletionRequestDetail({
    sheetOpen,
    setSheetOpen,
    selected
}: DeletionRequestDetailProps) {
    return (
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetContent className="bg-[#050505] border-white/10 text-white">
                {selected && (
                    <>
                        <SheetHeader>
                            <SheetTitle className="flex flex-col gap-1">
                                <span className="text-xs uppercase tracking-wide text-muted-foreground">
                                    Deletion Request
                                </span>
                                <span className="text-lg font-semibold">
                                    {selected?.user_service?.service?.name || "Unknown service"}
                                </span>
                            </SheetTitle>
                            <SheetDescription className="text-xs text-white/50">
                                {selected?.user_service?.service?.domain}
                            </SheetDescription>
                        </SheetHeader>

                        <div className="mt-4 space-y-4 text-sm px-4">
                            <div className="flex flex-wrap gap-2">
                                <Badge variant="outline" className="text-xs capitalize">
                                    {selected?.user_service?.service?.category || "Uncategorized"}
                                </Badge>
                                <Badge
                                    className={`text-xs border-0 ${statusMap[selected.status].className
                                        }`}
                                >
                                    {statusMap[selected.status].label}
                                </Badge>
                                {selected?.user_service?.service?.is_breached && (
                                    <Badge className="text-xs bg-red-500/15 text-red-200 border-red-500/40">
                                        Breached service
                                    </Badge>
                                )}
                            </div>

                            <div className="space-y-2 text-xs">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Action</span>
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
    )
}