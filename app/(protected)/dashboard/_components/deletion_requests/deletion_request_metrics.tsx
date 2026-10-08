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
    const dotColor = {
        default: "bg-foreground/20",
        warning: "bg-amber-500",
        success: "bg-emerald-500",
        danger: "bg-red-500",
    }[accent];

    return (
        <div className="rounded-lg border border-foreground/5 bg-foreground/2 p-4">
            <div className="flex items-start justify-between">
                <div className="text-[11px] font-medium uppercase tracking-widest text-foreground/40">
                    {label}
                </div>
                <div className={`h-1 w-1 rounded-full ${dotColor}`} />
            </div>
            <h2 className="mt-2 text-2xl font-light text-foreground">
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
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:gap-6">
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
