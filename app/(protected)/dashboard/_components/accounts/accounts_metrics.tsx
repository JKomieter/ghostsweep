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
                <div key={metric.label} className="rounded-lg border border-foreground/5 bg-foreground/2 p-4 hover:bg-foreground/3">
                    <span className="text-[11px] font-medium uppercase tracking-widest text-foreground/40">
                        {metric.label}
                    </span>
                    <div className={`text-2xl font-light tracking-tight ${metric.color || "text-foreground"}`}>
                        {metric.value}
                    </div>
                </div>
            ))}
        </div>
    );
}