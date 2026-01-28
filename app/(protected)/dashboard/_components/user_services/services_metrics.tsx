import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Info } from "lucide-react";

type MiniMetricCardProps = {
    label: string;
    value: string | number;
    accent?: "default" | "danger" | "warning" | "success";
    tooltip?: string
};

function MiniMetricCard({
    label,
    value,
    accent = "default",
    tooltip,
}: MiniMetricCardProps) {
    const dotColor = {
        default: "bg-white/20",
        danger: "bg-red-500",
        warning: "bg-amber-500",
        success: "bg-emerald-500",
    }[accent];

    return (
        <div className="rounded-lg border border-white/5 bg-white/2 p-4">
            <div className="flex items-start justify-between">
                <div className="text-[11px] font-medium uppercase tracking-widest text-white/40">
                    {label}
                </div>
                <div className="flex items-center gap-2">
                    {tooltip && (
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <button
                                    type="button"
                                    className="inline-flex h-4 w-4 items-center justify-center rounded-full text-[10px] text-white/40 hover:text-white/60"
                                    aria-label={tooltip}
                                >
                                    <Info className="h-3 w-3" />
                                </button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p className="text-xs">{tooltip}</p>
                            </TooltipContent>
                        </Tooltip>
                    )}
                    <div className={`h-1 w-1 rounded-full ${dotColor}`} />
                </div>
            </div>
            <h2 className="mt-2 text-2xl font-light text-white">
                {value}
            </h2>
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
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:gap-6">
            {/* Accounts Found */}
            <MiniMetricCard
                label="Accounts"
                value={isLoading ? "…" : accountsFound}
            />

            {/* Forgotten */}
            <MiniMetricCard
                label="Forgotten"
                value={isLoading ? "…" : forgotten}
                accent="warning"
                tooltip="Accounts you no longer actively use"
            />

            {/* Breached */}
            <MiniMetricCard
                label="Breached"
                value={isLoading ? "…" : breached}
                accent="danger"
            />

            {/* Deletions */}
            <MiniMetricCard
                label="Deletions"
                value={isLoading ? "…" : deletions}
                accent="success"
            />
        </div>
    );
}