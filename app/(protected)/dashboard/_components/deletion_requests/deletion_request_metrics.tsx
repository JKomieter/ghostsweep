"use client";

import { Info } from "lucide-react";
import { cn } from "@/lib/utils";
import {
    Tooltip,
    TooltipProvider,
    TooltipTrigger,
    TooltipContent,
} from "@/components/ui/tooltip";

type StatCardProps = {
    label: string;
    value: string | number;
    description: string;
    accent?: "default" | "danger" | "warning" | "success";
    tooltip?: string;
};

function StatCard({
    label,
    value,
    description,
    accent = "default",
    tooltip,
}: StatCardProps) {
    const baseClasses =
        "rounded-xl bg-[#050505] border p-5 transition-all min-h-32";
    const accentClasses = {
        default: "border-white/10 hover:border-primary/40",
        danger: "border-destructive/50 hover:border-destructive/70",
        warning: "border-yellow-500/30 hover:border-yellow-500/50",
        success: "border-emerald-500/30 hover:border-emerald-500/50",
    }[accent];

    return (
        <div className={cn(baseClasses, accentClasses, "w-full")}>
            <div className="flex items-start justify-between gap-2">
                <p className="text-sm text-white/60 flex items-center gap-1">
                    <span>{label}</span>
                    {tooltip && (
                        <TooltipProvider>
                            <Tooltip delayDuration={150}>
                                <TooltipTrigger asChild>
                                    <button
                                        type="button"
                                        className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-white/20 text-[10px] text-white/60 hover:border-white/40 hover:text-white"
                                        aria-label={tooltip}
                                    >
                                        <Info className="h-3 w-3" />
                                    </button>
                                </TooltipTrigger>
                                <TooltipContent className="max-w-xs bg-[#020617] border border-white/15 text-xs text-slate-100">
                                    {tooltip}
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    )}
                </p>
            </div>
            <h2 className="mt-1 text-3xl font-semibold text-white">{value}</h2>
            <p className="mt-2 text-xs text-white/40">{description}</p>
        </div>
    );
}

interface DeletionRequestsMetricsProps {
    isLoading: boolean;
    total: number;
    open: number;
    completed: number;
    failedOrExpired: number
}

export default function DeletionRequestsMetrics({
    isLoading,
    total,
    open,
    completed,
    failedOrExpired
}: DeletionRequestsMetricsProps) {

    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {/* Requests Sent */}
            <StatCard
                label="Requests Sent"
                value={isLoading ? "…" : total}
                description="GDPR/CCPA deletion emails you’ve sent so far."
                tooltip="Total number of deletion requests you started from GhostSweep, including open, completed, failed, and expired."
            />

            {/* Awaiting Response */}
            <StatCard
                label="Awaiting Response"
                value={isLoading ? "…" : open}
                description="Companies you’re still waiting to hear back from."
                accent="warning"
                tooltip="Requests marked as sent, received, needs verification, or in progress. These are still active and not resolved yet."
            />

            {/* Completed */}
            <StatCard
                label="Completed"
                value={isLoading ? "…" : completed}
                description="Requests where companies confirmed deletion."
                accent="success"
                tooltip="Requests where the status is completed — the company says they have deleted your account and data."
            />

            {/* Failed / Expired */}
            <StatCard
                label="Failed / Expired"
                value={isLoading ? "…" : failedOrExpired}
                description="No response after 30 days or request refused."
                accent="danger"
                tooltip="Includes requests marked as failed or expired — either the company refused, or there was no meaningful reply in time."
            />
        </div>
    );
}