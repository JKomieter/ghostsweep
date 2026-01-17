import { useQuery } from "@tanstack/react-query";
import { formatDate } from "@/utils/format_date";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Info, SquareArrowOutUpRight } from "lucide-react";
import Link from "next/link";
import { DashboardMetricsQueryResult } from "@/queryTypes";

type StatCardProps = {
    label: string;
    value: string | number;
    accent?: "default" | "danger" | "warning" | "success";
    action?: React.ReactElement
};

function StatCard({
    label,
    value,
    accent = "default",
    action
}: StatCardProps) {
    const accentClasses = {
        default: "text-foreground",
        danger: "text-destructive",
        warning: "text-yellow-500/80",
        success: "text-emerald-500/80",
    }[accent];

    return (
        <div className="space-y-1">
            <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    {label}
                </p>
                {action}
            </div>
            <h2 className={`text-3xl font-semibold ${accentClasses}`}>
                {value}
            </h2>
        </div>
    );
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
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-6">
            {/* Services Found */}
            <StatCard
                label="Services"
                value={isLoading ? "…" : serviceCount}
                action={(
                    <Link href="/dashboard/user_services">
                        <SquareArrowOutUpRight size={14} className="text-muted-foreground" />
                    </Link>
                )}
            />

            {/* Breaches Detected */}
            <StatCard
                label="Breaches"
                value={isLoading ? "…" : breachCount}
                accent="danger"
            />

            {/* Last Sweep */}
            <StatCard
                label="Last Sweep"
                value={isLoading ? "…" : lastScanLabel}
            />

            {/* Pending Deletion Requests */}
            <StatCard
                label="Pending"
                value={isLoading ? "…" : pending}
                accent="warning"
                action={(
                    <Link href="/dashboard/deletion_requests">
                        <SquareArrowOutUpRight size={14} className="text-muted-foreground" />
                    </Link>
                )}
            />

            {/* Companies Responded */}
            <StatCard
                label="Responded"
                value={isLoading ? "…" : responded}
                accent="success"
            />

            {/* Security Score */}
            <div className="space-y-1">
                <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Score
                    </p>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <button
                                type="button"
                                className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-border text-[10px] text-muted-foreground hover:text-foreground"
                                aria-label="Security score info"
                            >
                                <Info className="h-3 w-3" />
                            </button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p className="text-xs">Based on accounts, breaches & completed requests</p>
                        </TooltipContent>
                    </Tooltip>
                </div>
                <div className="flex items-baseline gap-2">
                    <h2 className={`text-3xl font-semibold ${scoreTextClass}`}>
                        {isLoading ? "…" : score ?? "—"}
                    </h2>
                    {!isLoading && grade && (
                        <span className="text-xs font-medium text-muted-foreground">
                            {grade}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}
