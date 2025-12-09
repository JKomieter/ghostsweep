import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Info } from "lucide-react";


type MiniMetricCardProps = {
    label: string;
    value: string | number;
    description: string;
    accent?: "default" | "danger" | "warning" | "success";
    tooltip?: string
};

function MiniMetricCard({
    label,
    value,
    description,
    accent = "default",
    tooltip,
}: MiniMetricCardProps) {
    const baseClasses =
        "rounded-xl bg-[#050505] border p-5 transition-all min-h-32 w-full";

    const accentClasses = {
        default: "border-white/10 hover:border-white/30",
        danger: "border-red-500/40 hover:border-red-500/70",
        warning: "border-amber-500/40 hover:border-amber-500/70",
        success: "border-emerald-500/40 hover:border-emerald-500/70",
    }[accent];

    const valueColor = {
        default: "text-white",
        danger: "text-red-400",
        warning: "text-amber-400",
        success: "text-emerald-400",
    }[accent];

    return (
        <div className={`${baseClasses} ${accentClasses}`}>
            <div className="flex flex-row items-center justify-between">
            <p className="text-sm text-white/60">{label}</p>
            {tooltip && (
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <button>
                                <Info color="gray" size={16} />
                            </button>
                        </TooltipTrigger>
                        <TooltipContent className="bg-[#0A0A0A] border border-white/10">
                            <p className="text-white">{tooltip}</p>
                        </TooltipContent>
                    </Tooltip>

            )}
            </div>

            <h2 className={`mt-1 text-3xl font-semibold ${valueColor}`}>
                {value}
            </h2>

            <p className="mt-2 text-xs text-white/40">{description}</p>
        </div>
    );
}

interface AccountMetricsProps {
    accountsFound: number;
    forgotten: number;
    breached: number;
    deletions: number;
    isLoading?: boolean;
}

export default function ServicesMetrics({
    accountsFound,
    forgotten,
    breached,
    deletions,
    isLoading = false,
}: AccountMetricsProps) {
    return (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {/* Accounts Found */}
            <MiniMetricCard
                label="Accounts Found"
                value={isLoading ? "…" : accountsFound}
                description="Services linked to your email"
            />

            {/* Forgotten */}
            <MiniMetricCard
                label="Forgotten"
                value={isLoading ? "…" : forgotten}
                description="You no longer actively use these"
                accent="warning"
                tooltip="Accounts you forgot about, but that never forgot about you."
            />

            {/* Breached */}
            <MiniMetricCard
                label="Breached"
                value={isLoading ? "…" : breached}
                description="Appeared in confirmed breaches"
                accent="danger"
            />

            {/* Deletions */}
            <MiniMetricCard
                label="Deletions"
                value={isLoading ? "…" : deletions}
                description="GDPR/CCPA requests sent"
                accent="success"
            />
        </div>
    );
}