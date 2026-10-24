"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, Circle, ChevronRight, PartyPopper } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import type { ChecklistItem, ProgressResponse } from "@/app/api/dashboard/progress/route";

const isComplete = (item: ChecklistItem) => item.total === 0 || item.done >= item.total;

function plural(n: number, one: string, many: string) {
    return `${n} ${n === 1 ? one : many}`;
}

/** "You closed 5 accounts and claimed $25 this month — risk down 12%", or null when there's no win yet. */
function winMessage(m: ProgressResponse["month"]) {
    const parts: string[] = [];
    if (m.accountsClosed > 0) parts.push(`closed ${plural(m.accountsClosed, "account", "accounts")}`);
    if (m.newslettersUnsubscribed > 0) parts.push(`unsubscribed from ${plural(m.newslettersUnsubscribed, "newsletter", "newsletters")}`);
    if (m.valueClaimed > 0) parts.push(`claimed $${Math.round(m.valueClaimed).toLocaleString()}`);
    if (parts.length === 0) return null;

    const list = parts.length > 1 ? `${parts.slice(0, -1).join(", ")} and ${parts[parts.length - 1]}` : parts[0];
    const risk = m.riskReducedPercent > 0 ? ` — risk down ${m.riskReducedPercent}%` : "";
    return `This month you ${list}${risk}.`;
}

export default function CleanupProgress() {
    const { data, status } = useQuery<ProgressResponse>({
        queryKey: ["dashboard-progress"],
        queryFn: async () => {
            const res = await fetch("/api/dashboard/progress");
            if (!res.ok) throw new Error("Failed to load progress");
            return res.json();
        },
        staleTime: 60_000,
    });

    if (status !== "success" || !data) return null;

    const completed = data.checklist.filter(isComplete).length;
    const total = data.checklist.length;
    const win = winMessage(data.month);
    const allDone = completed === total;

    return (
        <section className="rounded-lg border border-foreground/5 bg-foreground/2 p-6 space-y-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="space-y-1">
                    <div className="text-sm font-medium text-foreground">Your cleanup</div>
                    <div className="text-xs text-foreground/50">
                        {allDone ? "Everything's handled. We'll keep watching for new finds." : "Work through these and your footprint shrinks."}
                    </div>
                </div>

                <div className="flex gap-6 text-right">
                    {data.privacyScore !== null && (
                        <div>
                            <div className="text-2xl font-light text-foreground">{data.privacyScore}</div>
                            <div className="text-[11px] uppercase tracking-widest text-foreground/40">Privacy score</div>
                        </div>
                    )}
                    <div>
                        <div className="text-2xl font-light text-foreground">{data.month.accountsClosed}</div>
                        <div className="text-[11px] uppercase tracking-widest text-foreground/40">Cleaned this month</div>
                    </div>
                    <div>
                        <div className="text-2xl font-light text-foreground">
                            {completed}/{total}
                        </div>
                        <div className="text-[11px] uppercase tracking-widest text-foreground/40">Steps done</div>
                    </div>
                </div>
            </div>

            <Progress value={(completed / total) * 100} className="h-1.5 bg-foreground/10" />

            {win && (
                <div className="flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-4 py-3 text-sm text-emerald-800 dark:text-emerald-300">
                    <PartyPopper className="h-4 w-4 shrink-0" />
                    {win}
                </div>
            )}

            <ul className="divide-y divide-foreground/5">
                {data.checklist.map((item) => {
                    const complete = isComplete(item);
                    return (
                        <li key={item.key}>
                            <Link
                                href={item.href}
                                className="group flex items-center gap-3 py-2.5 text-sm transition-colors hover:text-foreground"
                            >
                                {complete ? (
                                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                                ) : (
                                    <Circle className="h-4 w-4 shrink-0 text-foreground/30" />
                                )}
                                <span className={complete ? "flex-1 text-foreground/45 line-through decoration-foreground/20" : "flex-1 text-foreground/85"}>
                                    {item.label}
                                </span>
                                {item.total > 1 && (
                                    <span className="text-xs tabular-nums text-foreground/45">
                                        {item.done} of {item.total}
                                    </span>
                                )}
                                {!complete && <ChevronRight className="h-4 w-4 text-foreground/30 transition-transform group-hover:translate-x-0.5" />}
                            </Link>
                        </li>
                    );
                })}
            </ul>
        </section>
    );
}
