"use client";

import * as React from "react";
import Image from "next/image";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { RotateCcw } from "lucide-react";
import { Grouped } from "@/queryTypes";

type ManualRowState = "ready" | "in_progress" | "done" | "skipped";


type ManualBulkTabProps = {
    manualCount: number;
    manualServices: Grouped;
};

export default function ManualBulkTab({
    manualCount,
    manualServices,
}: ManualBulkTabProps) {
    const [included, setIncluded] = React.useState<Record<string, boolean>>(() => {
        const init: Record<string, boolean> = {};
        for (const s of manualServices) init[s.id] = true;
        return init;
    });

    const [rowState, setRowState] = React.useState<Record<string, ManualRowState>>(() => {
        const init: Record<string, ManualRowState> = {};
        for (const s of manualServices) init[s.id] = "ready";
        return init;
    });

    const selected = React.useMemo(
        () => manualServices.filter((s) => included[s.id]),
        [included, manualServices]
    );

    const counts = React.useMemo(() => {
        let ready = 0,
            in_progress = 0,
            done = 0,
            skipped = 0;

        for (const s of manualServices) {
            const st = rowState[s.id] ?? "ready";
            if (!included[s.id]) {
                skipped++;
                continue;
            }
            if (st === "ready") ready++;
            if (st === "in_progress") in_progress++;
            if (st === "done") done++;
        }

        return { ready, in_progress, done, skipped };
    }, [manualServices, rowState, included]);

    const reset = () => {
        const nextIncluded: Record<string, boolean> = {};
        const nextState: Record<string, ManualRowState> = {};
        for (const s of manualServices) {
            nextIncluded[s.id] = true;
            nextState[s.id] = "ready";
        }
        setIncluded(nextIncluded);
        setRowState(nextState);
    };

    const includeAll = () => {
        setIncluded((prev) => {
            const next = { ...prev };
            for (const s of manualServices) next[s.id] = true;
            return next;
        });
    };

    const excludeAll = () => {
        setIncluded((prev) => {
            const next = { ...prev };
            for (const s of manualServices) next[s.id] = false;
            return next;
        });
    };

    const toggleOne = (id: string) => {
        setIncluded((prev) => ({ ...prev, [id]: !prev[id] }));
    };

    // Optional persistence hook:
    // For MVP you can keep it client-only.
    // If you want persistence, call your API here.
    async function persistBulkStatus(user_service_ids: string[], status: ManualRowState) {
        try {
            const res = await fetch("/api/bulk_manual/status", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({  user_service_ids, status }),
            });
            const j = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(j?.error || "Failed to update statuses");
        } catch (e) {
            throw e;
        }
    }

    const setManyStatus = async (status: ManualRowState) => {
        const ids = selected.map((s) => s.id);
        if (ids.length === 0) return;

        // Optimistic UI
        setRowState((prev) => {
            const next = { ...prev };
            for (const id of ids) next[id] = status;
            return next;
        });

        // Optional persistence
        try {
            await persistBulkStatus(ids, status);
            toast.success("Updated", { description: `Marked ${ids.length} as ${status.replace("_", " ")}.` });
        } catch (e) {
            if (e instanceof Error)
            toast.error("Couldn’t update", { description: e?.message ?? "Try again." });
        }
    };

    const setOneStatus = async (id: string, status: ManualRowState) => {
        setRowState((prev) => ({ ...prev, [id]: status }));
        try {
            await persistBulkStatus([id], status);
        } catch (e) {
            if (e instanceof Error)
            toast.error("Couldn’t update", { description: e?.message ?? "Try again." });
        }
    };

    const badgeFor = (id: string) => {
        if (!included[id]) {
            return (
                <span className="text-xs text-white/40">
                    Skipped
                </span>
            );
        }
        const st = rowState[id] ?? "ready";
        if (st === "done") {
            return (
                <span className="text-xs text-emerald-400">
                    Done
                </span>
            );
        }
        if (st === "in_progress") {
            return (
                <span className="text-xs text-purple-400">
                    In progress
                </span>
            );
        }
        return (
            <span className="text-xs text-white/60">
                Ready
            </span>
        );
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="rounded-lg border border-white/5 bg-white/2 p-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <div className="text-[11px] font-medium uppercase tracking-widest text-white/40">Manual deletions</div>
                        <div className="text-xs text-white/60 mt-1">
                            These services don’t have a reliable deletion link or email playbook yet. Track your progress here.
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-1.5">
                            <div className="h-1 w-1 rounded-full bg-white/20" />
                            <span className="text-xs text-white/60">Found: {manualCount}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="h-1 w-1 rounded-full bg-white/20" />
                            <span className="text-xs text-white/60">Selected: {selected.length}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="h-1 w-1 rounded-full bg-white/20" />
                            <span className="text-xs text-white/60">Ready: {counts.ready}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="h-1 w-1 rounded-full bg-purple-500" />
                            <span className="text-xs text-purple-400">In progress: {counts.in_progress}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="h-1 w-1 rounded-full bg-emerald-500" />
                            <span className="text-xs text-emerald-400">Done: {counts.done}</span>
                        </div>
                    </div>
                </div>

                <Separator className="my-3 bg-white/5" />

                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-wrap gap-2">
                        <Button size="sm" variant="ghost" className="border border-white/5 bg-white/2 hover:border-white/10 hover:bg-white/3" onClick={includeAll}>
                            Include all
                        </Button>
                        <Button size="sm" variant="ghost" className="border border-white/5 bg-white/2 hover:border-white/10 hover:bg-white/3" onClick={excludeAll}>
                            Exclude all
                        </Button>
                        <Button size="sm" variant="ghost" className="text-white/60 hover:text-white/80" onClick={reset}>
                            <RotateCcw className="h-4 w-4 mr-2" />
                            Reset
                        </Button>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <Button
                            size="sm"
                            variant="ghost"
                            className="border border-white/5 bg-white/2 text-purple-400 hover:border-white/10 hover:bg-white/3"
                            onClick={() => setManyStatus("in_progress")}
                            disabled={selected.length === 0}
                        >
                            Mark all In progress
                        </Button>
                        <Button
                            size="sm"
                            className="bg-white text-black hover:bg-white/90"
                            onClick={() => setManyStatus("done")}
                            disabled={selected.length === 0}
                        >
                            Mark all Done
                        </Button>
                    </div>
                </div>

                {counts.skipped > 0 ? (
                    <p className="mt-2 text-[11px] text-white/40">
                        Skipped: <span className="text-white/60">{counts.skipped}</span>
                    </p>
                ) : null}
            </div>

            {/* List */}
            <div className="rounded-xl border border-white/10 bg-[#050505] p-4">
                <div className="text-xs text-white/60 mb-3">
                    Tip: You can keep these “In progress” and come back later. You don’t need to finish everything in one session.
                </div>

                <div className="space-y-2">
                    {manualServices.map((item) => {
                        const id = item.id;
                        const isIncluded = !!included[id];
                        const steps = item.playbook?.steps ?? [];

                        return (
                            <div
                                key={id}
                                className={cn(
                                    "flex items-start justify-between gap-3 rounded-lg border border-white/10 bg-black/40 px-3 py-2",
                                    !isIncluded && "opacity-60"
                                )}
                            >
                                <div className="flex items-start gap-3 min-w-0">
                                    <div className="pt-1">
                                        <Checkbox checked={isIncluded} onCheckedChange={() => toggleOne(id)} />
                                    </div>

                                    <div className="relative mt-0.5 h-8 w-8 overflow-hidden rounded-full border border-white/10 shrink-0">
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
                                            {item.service.domain || "—"}
                                            {item.service.category ? ` • ${item.service.category}` : ""}
                                        </div>

                                        {/* Steps preview (minimal MVP) */}
                                        {steps.length > 0 ? (
                                            <div className="mt-2 text-xs text-white/65">
                                                <div className="text-[11px] uppercase tracking-wide text-white/40">Steps</div>
                                                <ul className="mt-1 list-disc pl-4 space-y-1">
                                                    {steps.slice(0, 2).map((s, idx) => (
                                                        <li key={idx} className="line-clamp-2">
                                                            {s}
                                                        </li>
                                                    ))}
                                                    {steps.length > 2 ? (
                                                        <li className="text-white/45">+{steps.length - 2} more…</li>
                                                    ) : null}
                                                </ul>
                                            </div>
                                        ) : (
                                            <div className="mt-2 text-xs text-white/45">
                                                No instructions yet. You can still try the service’s account settings / privacy page.
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 shrink-0 pt-1">
                                    {badgeFor(id)}

                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        className="h-7 px-2 text-[11px] border border-white/5 bg-white/2 text-purple-400 hover:border-white/10 hover:bg-white/3"
                                        disabled={!isIncluded}
                                        onClick={() => setOneStatus(id, "in_progress")}
                                    >
                                        In progress
                                    </Button>

                                    <Button
                                        size="sm"
                                        className="h-7 px-2 text-[11px] bg-white text-black hover:bg-white/90"
                                        disabled={!isIncluded}
                                        onClick={() => setOneStatus(id, "done")}
                                    >
                                        Done
                                    </Button>
                                </div>
                            </div>
                        );
                    })}

                    {manualServices.length === 0 ? (
                        <div className="text-sm text-white/60 text-center py-10">No manual deletions found.</div>
                    ) : null}
                </div>
            </div>
        </div>
    );
}