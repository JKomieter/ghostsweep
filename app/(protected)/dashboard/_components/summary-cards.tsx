import { useQuery } from "@tanstack/react-query";
import { formatDate } from "@/utils/format-date";
import SweepCard from "./sweep-card";

interface MetricsData {
    service_count: number;
    breach_count: number;
    last_scan_date: string | null;
    pending_requests: number;
    responded_requests: number;
}

type StatCardProps = {
    label: string;
    value: string | number;
    description: string;
    accent?: "default" | "danger" | "warning" | "success";
};

function StatCard({
    label,
    value,
    description,
    accent = "default",
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
            <p className="text-sm text-white/60">{label}</p>
            <h2 className="mt-1 text-3xl font-semibold text-white">{value}</h2>
            <p className="mt-2 text-xs text-white/40">{description}</p>
        </div>
    );
}

export default function SummaryCards() {
    const { data, status } = useQuery({
        queryKey: ["metrics"],
        queryFn: async (): Promise<MetricsData> => {
            const res = await fetch("/api/metrics");
            if (!res.ok) throw new Error("Network response was not ok");
            return res.json();
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

    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            {/* Services Found */}
            <StatCard
                label="Services Found"
                value={isLoading ? "…" : serviceCount}
                description="Companies holding your personal data"
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

            {/* Sweep CTA */}
            {/* <SweepCard /> */}

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
            />

            {/* Companies Responded */}
            <StatCard
                label="Companies Responded"
                value={isLoading ? "…" : responded}
                description="Replies received from privacy requests"
                accent="success"
            />
        </div>
    );
}