"use client";

import { cn } from "@/lib/utils";

type StatCardProps = {
    label: string;
    value: string | number;
    accent?: "default" | "warning" | "success" | "danger";
};

function StatCard({
    label,
    value,
    accent = "default",
}: StatCardProps) {
    const accentClasses = {
        default: "text-foreground",
        warning: "text-yellow-500/80",
        success: "text-emerald-500/80",
        danger: "text-destructive/80",
    }[accent];

    return (
        <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                {label}
            </p>
            <h2 className={cn("text-2xl font-semibold", accentClasses)}>
                {value}
            </h2>
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
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <StatCard
                label="Total Sent"
                value={isLoading ? "…" : total}
            />
            <StatCard
                label="Awaiting"
                value={isLoading ? "…" : open}
                accent="warning"
            />
            <StatCard
                label="Completed"
                value={isLoading ? "…" : completed}
                accent="success"
            />
            <StatCard
                label="Failed"
                value={isLoading ? "…" : failedOrExpired}
                accent="danger"
            />
        </div>
    );
}
