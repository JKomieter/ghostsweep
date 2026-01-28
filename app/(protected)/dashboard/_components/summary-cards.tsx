import { useQuery } from "@tanstack/react-query";
import { formatDate } from "@/utils/format_date";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Info, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { DashboardMetricsQueryResult } from "@/queryTypes";

type StatCardProps = {
    label: string;
    value: string | number;
    accent?: "default" | "danger" | "warning" | "success";
    href?: string;
};

function StatCard({
    label,
    value,
    accent = "default",
    href
}: StatCardProps) {
    const accentConfig = {
        default: {
            text: "text-white",
            indicator: "bg-zinc-500"
        },
        danger: {
            text: "text-white",
            indicator: "bg-red-500"
        },
        warning: {
            text: "text-white",
            indicator: "bg-amber-500"
        },
        success: {
            text: "text-white",
            indicator: "bg-emerald-500"
        },
    }[accent];

    const content = (
        <div className="group relative h-full">
            <div className="flex h-full flex-col justify-between space-y-4 rounded-lg border border-white/5 bg-white/2 p-6 transition-all hover:border-white/10 hover:bg-white/3">
                <div className="flex items-start justify-between">
                    <span className="text-[11px] font-medium uppercase tracking-widest text-white/40">
                        {label}
                    </span>
                    {href && (
                        <ArrowUpRight className="h-3.5 w-3.5 text-white/20 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-white/40" />
                    )}
                </div>
                <div className="flex items-end justify-between">
                    <span className={`text-4xl font-light tracking-tight ${accentConfig.text}`}>
                        {value}
                    </span>
                    <div className={`h-1 w-1 rounded-full ${accentConfig.indicator}`} />
                </div>
            </div>
        </div>
    );

    if (href) {
        return (
            <Link href={href} className="block">
                {content}
            </Link>
        );
    }

    return content;
}

export default function SummaryCards() {
    const { data, status } = useQuery({
        queryKey: ["metrics"],
        queryFn: async (): Promise<DashboardMetricsQueryResult> => {
            const res = await fetch("/api/metrics");
            if (!res.ok) throw new Error("Network response was not ok");
            const data = await res.json();
            return data
        },
        staleTime: 5 * 60 * 1000,
    });

    const isLoading = status === "pending";

    const serviceCount = data?.service_count ?? 0;
    const breachCount = data?.breach_count ?? 0;
    const pending = data?.pending_requests ?? 0;
    const responded = data?.responded_requests ?? 0;
    const lastScanLabel = data?.last_scan_date
        ? formatDate(data.last_scan_date)
        : "Never";

    const score = data?.security_score?.score ?? null;
    const grade = data?.security_score?.grade ?? null;

    const scoreTextClass =
        score === null
            ? "text-foreground"
            : score >= 90
                ? "text-emerald-400"
                : score >= 75
                    ? "text-lime-400"
                    : score >= 60
                        ? "text-amber-400"
                        : score >= 40
                            ? "text-orange-400"
                            : "text-red-400";

    return (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            <StatCard
                label="Services"
                value={isLoading ? "—" : serviceCount}
                href="/dashboard/user_services"
            />

            <StatCard
                label="Breaches"
                value={isLoading ? "—" : breachCount}
                accent="danger"
            />

            <StatCard
                label="Last Sweep"
                value={isLoading ? "—" : lastScanLabel}
            />

            <StatCard
                label="Pending"
                value={isLoading ? "—" : pending}
                accent="warning"
                href="/dashboard/deletion_requests"
            />

            <StatCard
                label="Responded"
                value={isLoading ? "—" : responded}
                accent="success"
            />

            {/* Security Score */}
            <div className="group relative h-full">
                <div className="flex h-full flex-col justify-between space-y-4 rounded-lg border border-white/5 bg-white/2 p-6 transition-all hover:border-white/10 hover:bg-white/3">
                    <div className="flex items-start justify-between">
                        <span className="text-[11px] font-medium uppercase tracking-widest text-white/40">
                            Score
                        </span>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <button
                                    type="button"
                                    className="flex h-4 w-4 items-center justify-center text-white/20 transition-colors hover:text-white/40"
                                    aria-label="Security score info"
                                >
                                    <Info className="h-3 w-3" />
                                </button>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="text-xs">
                                Based on accounts, breaches & requests
                            </TooltipContent>
                        </Tooltip>
                    </div>
                    <div className="flex items-end justify-between">
                        <div className="flex items-baseline gap-2">
                            <span className={`text-4xl font-light tracking-tight ${scoreTextClass}`}>
                                {isLoading ? "—" : score ?? "—"}
                            </span>
                            {!isLoading && grade && (
                                <span className="text-sm font-medium text-white/30">
                                    {grade}
                                </span>
                            )}
                        </div>
                        <div className={`h-1 w-1 rounded-full ${score === null ? 'bg-zinc-500' : score >= 75 ? 'bg-emerald-500' : score >= 40 ? 'bg-amber-500' : 'bg-red-500'}`} />
                    </div>
                </div>
            </div>
        </div>
    );
}
