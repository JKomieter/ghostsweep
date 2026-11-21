import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import type { PlanResponse } from "@/lib/plans";
import { Skeleton } from "@/components/ui/skeleton";


// Always two decimals: subscription totals are averaged to monthly and can have more
const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2, maximumFractionDigits: 2 });

type RecentFind = { id: string; type: string; amount: number; service_name: string | null; detected_at: string | null };

// One ledger strip rather than five floating cards: hairline-divided cells, plain labels,
// monospaced figures. Colour only marks meaning (a small status dot), never decoration.
function StatCell({ label, value, accent = "default", href, hint }: { label: string; value: React.ReactNode; accent?: "default" | "danger" | "warning" | "success"; href?: string; hint?: string }) {
    const dot = {
        default: null,
        danger: "bg-red-500",
        warning: "bg-amber-500",
        success: "bg-primary",
    }[accent];
    const content = (
        <div className="flex h-full flex-col justify-between gap-3 bg-card p-5 transition-colors group-hover:bg-background">
            <div className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-2 text-xs text-foreground/60">
                    {dot && <span aria-hidden className={`h-1.5 w-1.5 rounded-full ${dot}`} />}
                    {label}
                </span>
                {hint && <span className="text-xs font-medium text-primary">{hint}</span>}
            </div>
            <span className="font-mono text-2xl font-medium tabular-nums text-foreground">{value}</span>
        </div>
    );
    if (href) return <Link href={href} className="group block h-full">{content}</Link>;
    return content;
}

export default function SummaryCards() {
    const { data, status } = useQuery({
        queryKey: ["dashboard-overview"],
        queryFn: async () => {
            const res = await fetch("/api/dashboard/overview");
            if (!res.ok) throw new Error("Network response was not ok");
            return res.json();
        },
        staleTime: 5 * 60 * 1000,
    });

    const { data: planData } = useQuery<PlanResponse>({
        queryKey: ["plan"],
        queryFn: async () => {
            const res = await fetch("/api/plan");
            if (!res.ok) throw new Error("Failed to fetch plan");
            return res.json();
        },
    });

    const isLoading = status === "pending";
    const totalValue = Math.round(data?.totalValue ?? 0);
    const totalSubs = data?.totalSubs ?? 0;
    const newsletters = data?.newsletters ?? 0;
    const oldAccounts = data?.oldAccounts ?? 0;
    const recent = data?.recent ?? [];

    return (
        <div className="grid grid-cols-1 gap-px overflow-hidden rounded-lg border border-foreground/10 bg-foreground/10 sm:grid-cols-2 xl:grid-cols-5">
            <StatCell
                label="Total Value Found"
                value={isLoading ? <Skeleton className="inline-block align-middle h-7 w-20" /> : `$${totalValue.toLocaleString()}`}
                accent="success"
                href="/dashboard/value-recovery"
                hint={planData?.current_plan === "free" && totalValue > 0 ? "Unlock to claim →" : undefined}
            />
            <StatCell
                label="Active Subscriptions"
                value={isLoading ? <Skeleton className="inline-block align-middle h-7 w-20" /> : `${usd.format(totalSubs)}/mo`}
                accent="warning"
                href="/dashboard/subscriptions"
            />
            <StatCell label="Newsletters" value={isLoading ? <Skeleton className="inline-block align-middle h-7 w-20" /> : newsletters} href="/dashboard/newsletters" />
            <StatCell label="Accounts" value={isLoading ? <Skeleton className="inline-block align-middle h-7 w-20" /> : oldAccounts} href="/dashboard/accounts" />
            <div className="flex h-full flex-col gap-3 bg-card p-5 sm:col-span-2 xl:col-span-1">
                <span className="text-xs text-foreground/60">Recent finds</span>
                <div>
                        {isLoading ? (
                            <div className="space-y-2">
                                <Skeleton className="h-3 w-full" />
                                <Skeleton className="h-3 w-4/5" />
                                <Skeleton className="h-3 w-3/5" />
                            </div>
                        ) : recent.length === 0 ? (
                            <span className="text-foreground/50 text-sm">No recent finds</span>
                        ) : (
                            recent.map((item: RecentFind) => (
                                <div key={item.id} className="text-xs text-foreground/80 truncate">
                                    {usd.format(item.amount / 100)} {item.service_name ? `${item.service_name} ` : ""}
                                    {item.type.replace("_", " ")}
                                    {item.detected_at && (
                                        <span className="text-foreground/45">
                                            {" · "}
                                            {new Date(item.detected_at).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                                        </span>
                                    )}
                                </div>
                            ))
                        )}
                </div>
            </div>
        </div>
    );
}
