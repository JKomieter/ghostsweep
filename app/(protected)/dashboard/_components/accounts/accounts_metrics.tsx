interface AccountsMetricsProps {
    totalCount: number;
    breachedCount: number;
    unusedCount: number;
    deletedCount: number;
    isLoading: boolean;
}

export default function AccountsMetrics({
    totalCount,
    breachedCount,
    unusedCount,
}: AccountsMetricsProps) {
    const metrics = [
        {
            label: "Accounts",
            value: totalCount,
        },
        {
            label: "Breached",
            value: breachedCount,
            color: "text-red-600 dark:text-red-400",
        },
        {
            label: "Unused",
            value: unusedCount,
            color: "text-amber-700 dark:text-amber-400",
        },
    ];

    return (
        <div className="grid grid-cols-3 gap-4">
            {metrics.map((metric) => (
                <div key={metric.label} className="rounded-lg border border-foreground/10 bg-card p-4 hover:bg-foreground/[0.03]">
                    <span className="text-xs font-medium text-foreground/55">
                        {metric.label}
                    </span>
                    <div className={`text-2xl font-mono font-medium tabular-nums ${metric.color || "text-foreground"}`}>
                        {metric.value}
                    </div>
                </div>
            ))}
        </div>
    );
}