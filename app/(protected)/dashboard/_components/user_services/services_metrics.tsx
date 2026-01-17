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
    const valueColor = {
        default: "text-foreground",
        danger: "text-destructive",
        warning: "text-amber-500/80",
        success: "text-emerald-500/80",
    }[accent];

    return (
        <div className="space-y-1">
            <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    {label}
                </p>
                {tooltip && (
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <button
                                type="button"
                                className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-border text-[10px] text-muted-foreground hover:text-foreground"
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
            </div>
            <h2 className={`text-3xl font-semibold ${valueColor}`}>
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
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
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