import { useQuery } from "@tanstack/react-query";
import { formatDate } from "@/utils/format_date";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Info, SquareArrowOutUpRight } from "lucide-react";
import Link from "next/link";
import { DashboardMetricsQueryResult } from "@/queryTypes";

type StatCardProps = {
    label: string;
    value: string | number;
    description: string;
    accent?: "default" | "danger" | "warning" | "success";
    action?: React.ReactElement
};

function StatCard({
    label,
    value,
    description,
    accent = "default",
    action
}: StatCardProps) {
    const baseClasses =
        "rounded-xl bg-[#050505] border p-5 transition-all min-h-36";

    const accentClasses = {
        default: "border-white/10 hover:border-primary/40",
        danger: "border-destructive/50 hover:border-destructive/70",
        warning: "border-yellow-500/30 hover:border-yellow-500/50",
        success: "border-emerald-500/30 hover:border-emerald-500/50",
    }[accent];

    return (
        <div className={`${baseClasses} ${accentClasses} w-full`}>
            <div className="flex flex-row items-center justify-between">
                <p className="text-sm text-white/60">{label}</p>
                {action}
            </div>
            <h2 className="mt-1 text-3xl font-semibold text-white">{value}</h2>
            <p className="mt-2 text-xs text-white/40">{description}</p>
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

    // pick colors based on score
    const scoreBorderClass =
        score === null
            ? "border-white/10 hover:border-white/30"
            : score >= 90
                ? "border-emerald-500/40 hover:border-emerald-500/70"
                : score >= 75
                    ? "border-lime-500/40 hover:border-lime-500/70"
                    : score >= 60
                        ? "border-amber-500/40 hover:border-amber-500/70"
                        : score >= 40
                            ? "border-orange-500/40 hover:border-orange-500/70"
                            : "border-red-500/40 hover:border-red-500/70";

    const scoreTextClass =
        score === null
            ? "text-white"
            : score >= 90
                ? "text-emerald-400"
                : score >= 75
                    ? "text-lime-400"
                    : score >= 60
                        ? "text-amber-400"
                        : score >= 40
                            ? "text-orange-400"
                            : "text-red-400";

    const badgeClass =
        score === null
            ? "bg-zinc-500/20 border-zinc-500/40 text-zinc-200"
            : score >= 90
                ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-200"
                : score >= 75
                    ? "bg-lime-500/20 border-lime-500/40 text-lime-200"
                    : score >= 60
                        ? "bg-amber-500/20 border-amber-500/40 text-amber-200"
                        : score >= 40
                            ? "bg-orange-500/20 border-orange-500/40 text-orange-200"
                            : "bg-red-500/20 border-red-500/40 text-red-200";

    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            {/* Services Found */}
            <StatCard
                label="Services Found"
                value={isLoading ? "…" : serviceCount}
                description="Companies holding your personal data"
                action={(
                    <Link href="/dashboard/services">
                        <SquareArrowOutUpRight color="gray" size={16} />
                    </Link>
                )}
            />

            {/* Breaches Detected */}
            <div className="rounded-xl bg-[#050505] border border-destructive/50 p-5 hover:border-destructive/70 transition-all min-h-36">
                <p className="text-sm text-white/60">Breaches Detected</p>
                <h2 className="mt-1 text-3xl font-semibold text-destructive">
                    {isLoading ? "…" : breachCount}
                </h2>
                <p className="mt-2 text-xs text-white/40">
                    Found via known data leaks
                </p>
            </div>

            {/* Last Sweep */}
            <StatCard
                label="Last Sweep"
                value={isLoading ? "…" : lastScanLabel}
                description="Keep your data fresh by sweeping regularly"
            />

            {/* Pending Deletion Requests */}
            <StatCard
                label="Pending Deletion Requests"
                value={isLoading ? "…" : pending}
                description="Companies you’re waiting to hear back from"
                accent="warning"
                action={(
                    <Link href="/dashboard/deletion_requests">
                        <SquareArrowOutUpRight color="gray" size={16} />
                    </Link>
                )}
            />

            {/* Companies Responded */}
            <StatCard
                label="Companies Responded"
                value={isLoading ? "…" : responded}
                description="Replies received from privacy requests"
                accent="success"
            />

            {/* Security Score */}
            <div
                className={`rounded-xl bg-[#050505] border p-5 transition-all min-h-36 ${scoreBorderClass}`}
            >
                <div className="flex flex-row items-center justify-between">
                    <p className="text-sm text-white/60">Security Score</p>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <button
                                type="button"
                                className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-white/20 text-[10px] text-white/60 hover:border-white/40 hover:text-white"
                                aria-label="Security score factors"
                            >
                                <Info className="h-3 w-3" />
                            </button>
                        </TooltipTrigger>
                        <TooltipContent className="bg-[#0A0A0A] border border-white/10">
                            <p className="mb-2 font-semibold text-white">
                                Security Score Factors:
                            </p>

                            <ul className="space-y-1 list-disc px-2 text-white/80">
                                <li>Secured accounts</li>
                                <li>Active breaches</li>
                                <li>Unresolved deletion requests</li>
                                <li>Completed privacy cleanups</li>
                            </ul>
                        </TooltipContent>
                    </Tooltip>
                </div>

                <div className="mt-1 flex items-baseline gap-2">
                    <h2
                        className={`text-3xl font-semibold ${scoreTextClass}`}
                    >
                        {isLoading ? "…" : score ?? "—"}
                    </h2>

                    {!isLoading && grade && (
                        <span
                            className={`text-[10px] px-2 py-0.5 rounded-full border ${badgeClass}`}
                        >
                            {grade}
                        </span>
                    )}
                </div>

                <p className="mt-2 text-xs text-white/40">
                    Based on your linked accounts & breaches
                </p>
            </div>
        </div>
    );
}