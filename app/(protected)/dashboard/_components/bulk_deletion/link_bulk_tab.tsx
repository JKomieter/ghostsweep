"use client";

import * as React from "react";
import Image from "next/image";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { ExternalLink, RotateCcw } from "lucide-react";
import { Grouped } from "@/queryTypes";


type LinkBulkTabProps = {
    linkCount: number;
    linkServices: Grouped;
};

type RowState = "ready" | "opened" | "skipped";

const BATCH_SIZE = 10;

export default function LinkBulkTab({ linkCount, linkServices }: LinkBulkTabProps) {
    const [included, setIncluded] = React.useState<Record<string, boolean>>(() => {
        const init: Record<string, boolean> = {};
        for (const s of linkServices) init[s.id] = true;
        return init;
    });

    const [rowState, setRowState] = React.useState<Record<string, RowState>>(() => {
        const init: Record<string, RowState> = {};
        for (const s of linkServices) init[s.id] = "ready";
        return init;
    });

    const [opening, setOpening] = React.useState(false);
    const [openedCount, setOpenedCount] = React.useState(0);

    const selected = React.useMemo(() => {
        return linkServices.filter((s) => included[s.id] && s.playbook?.deletion_url);
    }, [included, linkServices]);

    const remaining = React.useMemo(() => {
        return selected.filter((s) => rowState[s.id] !== "opened");
    }, [selected, rowState]);

    const skipped = React.useMemo(() => {
        return linkServices.filter((s) => !included[s.id]);
    }, [included, linkServices]);

    const reset = () => {
        const nextIncluded: Record<string, boolean> = {};
        const nextState: Record<string, RowState> = {};
        for (const s of linkServices) {
            nextIncluded[s.id] = true;
            nextState[s.id] = "ready";
        }
        setIncluded(nextIncluded);
        setRowState(nextState);
        setOpenedCount(0);
    };

    const markOpened = (ids: string[]) => {
        setRowState((prev) => {
            const next = { ...prev };
            for (const id of ids) next[id] = "opened";
            return next;
        });
        setOpenedCount((c) => c + ids.length);
    };

    const openNextBatch = async () => {
        if (opening) return;

        const batch = remaining.slice(0, BATCH_SIZE);
        if (batch.length === 0) {
            console.log("[LinkBulkTab] Nothing left to open");
            toast.message("Nothing left to open", { description: "All selected deletion pages were opened." });
            return;
        }

        console.log(`[LinkBulkTab] Opening next batch of ${batch.length} links`);
        setOpening(true);

        const ids = batch.map((b) => b.id);
        const urls = batch.map((b) => b.playbook.deletion_url!).filter(Boolean);

        // 1) Create deletion_requests (link method) for this batch
        try {
            console.log(`[LinkBulkTab] Creating deletion requests for ${ids.length} services`);
            const res = await fetch("/api/bulk_link/opened", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ user_service_ids: ids }),
            });

            const j = await res.json().catch(() => ({}));
            if (!res.ok) {
                const errorMsg = j?.error || `HTTP ${res.status}`;
                console.error("[LinkBulkTab] Failed to create deletion requests:", errorMsg);
                throw new Error(errorMsg);
            }
            console.log("[LinkBulkTab] Deletion requests created successfully");
        } catch (e) {
            if (e instanceof Error) {
                console.error("[LinkBulkTab] Error creating deletion requests:", e);
                setOpening(false);
                toast.error("Couldn’t start link deletions", { description: e?.message ?? "Try again." });
            }
            return;
        }

        // 2) Open links in new tabs (best effort)
        try {
            console.log(`[LinkBulkTab] Opening ${urls.length} deletion URLs in new tabs`);
            const preOpened: (Window | null)[] = urls.map((url) => window.open(url, "_blank", "noopener,noreferrer"));

            // If popups blocked, stop early with a clear message
            const blocked = preOpened.some((w) => w === null);
            if (blocked) {
                console.warn("[LinkBulkTab] Popup blocked - user needs to allow popups");
                toast.error("Popup blocked", {
                    description: "Please allow popups for this site, then try again.",
                });
                setOpening(false);
                return;
            }

            console.log(`[LinkBulkTab] All ${preOpened.length} popups opened successfully`);
            // Navigate the tabs
            preOpened.forEach((w, idx) => {
                try {
                    w!.location.href = urls[idx];
                } catch (err) {
                    console.error(`[LinkBulkTab] Failed to navigate tab ${idx}:`, err);
                }
            });

            markOpened(ids);
            console.log(`[LinkBulkTab] Marked ${ids.length} items as opened`);

            toast.success("Opened deletion pages", {
                description: `Opened ${batch.length} tabs. Complete the forms, then come back for the next batch.`,
            });
        } finally {
            setOpening(false);
        }
    };

    const toggleOne = (id: string) => {
        setIncluded((prev) => ({ ...prev, [id]: !prev[id] }));
        setRowState((prev) => ({ ...prev, [id]: prev[id] === "opened" ? "opened" : "ready" }));
    };

    const includeAll = () => {
        setIncluded((prev) => {
            const next = { ...prev };
            for (const s of linkServices) next[s.id] = true;
            return next;
        });
    };

    const excludeAll = () => {
        setIncluded((prev) => {
            const next = { ...prev };
            for (const s of linkServices) next[s.id] = false;
            return next;
        });
    };

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="rounded-xl border border-white/10 bg-[#050505] p-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <div className="text-sm font-semibold text-white">Link deletions</div>
                        <div className="text-xs text-white/60">
                            Open deletion pages in batches of {BATCH_SIZE}. We’ll create a deletion request when a batch is opened.
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline" className="border-white/15 bg-white/5 text-white/80 text-xs">
                            Found: {linkCount}
                        </Badge>
                        <Badge variant="outline" className="border-white/15 bg-white/5 text-white/80 text-xs">
                            Selected: {selected.length}
                        </Badge>
                        <Badge variant="outline" className="border-white/15 bg-white/5 text-white/80 text-xs">
                            Opened: {openedCount}
                        </Badge>
                    </div>
                </div>

                <Separator className="my-3 bg-white/10" />

                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-wrap gap-2">
                        <Button size="sm" variant="outline" className="border-white/15 bg-white/5" onClick={includeAll}>
                            Include all
                        </Button>
                        <Button size="sm" variant="outline" className="border-white/15 bg-white/5" onClick={excludeAll}>
                            Exclude all
                        </Button>
                        <Button size="sm" variant="ghost" className="text-white/70" onClick={reset}>
                            <RotateCcw className="h-4 w-4 mr-2" />
                            Reset
                        </Button>
                    </div>

                    <Button
                        size="sm"
                        className={cn("bg-primary text-black hover:bg-primary/80", opening && "opacity-80")}
                        onClick={openNextBatch}
                        disabled={opening || remaining.length === 0}
                        title={remaining.length === 0 ? "No remaining selected links" : "Open next batch"}
                    >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        {opening ? "Opening…" : `Open next ${Math.min(BATCH_SIZE, remaining.length)} links`}
                    </Button>
                </div>

                {skipped.length > 0 ? (
                    <p className="mt-2 text-[11px] text-white/55">
                        Skipped: <span className="text-white/80">{skipped.length}</span> (you can add them back anytime).
                    </p>
                ) : null}
            </div>

            {/* List */}
            <div className="rounded-xl border border-white/10 bg-[#050505] p-4">
                <div className="text-xs text-white/60 mb-3">
                    Tip: If popups are blocked, allow popups for this site to open multiple deletion pages.
                </div>

                <div className="space-y-2">
                    {linkServices.map((item) => {
                        const id = item.id;
                        const url = item.playbook?.deletion_url;
                        const state = rowState[id] ?? "ready";
                        const isIncluded = !!included[id];

                        return (
                            <div
                                key={id}
                                className={cn(
                                    "flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-black/40 px-3 py-2",
                                    !isIncluded && "opacity-60"
                                )}
                            >
                                <div className="flex items-center gap-3 min-w-0">
                                    <Checkbox checked={isIncluded} onCheckedChange={() => toggleOne(id)} />

                                    <div className="relative h-8 w-8 overflow-hidden rounded-full border border-white/10 shrink-0">
                                        {item.service.logo_url ? (
                                            <Image
                                                src={item.service.logo_url}
                                                alt=""
                                                width={64}
                                                height={64}
                                                className="h-full w-full object-cover"
                                            />
                                        ) : null}
                                    </div>

                                    <div className="min-w-0">
                                        <div className="text-sm font-medium text-white truncate">
                                            {item.service.name || "Unknown service"}
                                        </div>
                                        <div className="text-xs text-white/55 truncate">
                                            {item.service.domain || "—"} {url ? `• ${new URL(url).hostname}` : ""}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 shrink-0">
                                    {state === "opened" ? (
                                        <Badge className="bg-emerald-500/15 text-emerald-200 border border-emerald-500/30 text-[11px]">
                                            Opened
                                        </Badge>
                                    ) : isIncluded ? (
                                        <Badge variant="outline" className="border-white/10 bg-white/5 text-white/70 text-[11px]">
                                            Ready
                                        </Badge>
                                    ) : (
                                        <Badge variant="outline" className="border-white/10 bg-white/5 text-white/60 text-[11px]">
                                            Skipped
                                        </Badge>
                                    )}

                                    {/* Optional: open single */}
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="h-7 px-2 text-[11px] border-white/15 bg-white/5"
                                        disabled={!url}
                                        onClick={async () => {
                                            if (!url) return;

                                            console.log(`[LinkBulkTab] Opening single link for service: ${item.service.name}`);
                                            // create deletion request for this one
                                            try {
                                                console.log(`[LinkBulkTab] Creating deletion request for single link`);
                                                const res = await fetch("/api/bulk_link/opened", {
                                                    method: "POST",
                                                    headers: { "Content-Type": "application/json" },
                                                    body: JSON.stringify({ user_service_ids: [id] }),
                                                });
                                                const j = await res.json().catch(() => ({}));
                                                if (!res.ok) {
                                                    const errorMsg = j?.error || `HTTP ${res.status}`;
                                                    console.error("[LinkBulkTab] Failed to create deletion request:", errorMsg);
                                                    throw new Error(errorMsg);
                                                }
                                                console.log("[LinkBulkTab] Deletion request created for single link");
                                            } catch (e) {
                                                if (e instanceof Error) {
                                                    console.error("[LinkBulkTab] Error opening single link:", e);
                                                    toast.error("Couldn't start", { description: e?.message ?? "Try again." });
                                                }
                                                return;
                                            }

                                            console.log(`[LinkBulkTab] Opening popup for URL: ${new URL(url).hostname}`);
                                            const w = window.open(url, "_blank", "noopener,noreferrer");
                                            if (!w) {
                                                console.warn("[LinkBulkTab] Single popup was blocked");
                                                toast.error("Popup blocked", { description: "Allow popups and try again." });
                                                return;
                                            }
                                            markOpened([id]);
                                            console.log("[LinkBulkTab] Single link opened and marked");
                                        }}
                                    >
                                        Open
                                    </Button>
                                </div>
                            </div>
                        );
                    })}

                    {linkServices.length === 0 ? (
                        <div className="text-sm text-white/60 text-center py-10">No link-based deletions found.</div>
                    ) : null}
                </div>
            </div>
        </div>
    );
}