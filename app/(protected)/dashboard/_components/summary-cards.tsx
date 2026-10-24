import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import type { PlanResponse } from "@/lib/plans";


// Always two decimals: subscription totals are averaged to monthly and can have more
const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2, maximumFractionDigits: 2 });

type RecentFind = { id: string; type: string; amount: number; service_name: string | null; detected_at: string | null };

function StatCard({ label, value, accent = "default", href, hint }: { label: string; value: string | number; accent?: "default" | "danger" | "warning" | "success"; href?: string; hint?: string }) {
    const accentConfig = {
        default: { text: "text-foreground", indicator: "bg-foreground/40" },
        danger: { text: "text-foreground", indicator: "bg-red-500" },
        warning: { text: "text-foreground", indicator: "bg-amber-500" },
        success: { text: "text-foreground", indicator: "bg-emerald-500" },
    }[accent];
    const content = (
        <div className="group relative h-full">
            <div className="flex h-full flex-col justify-between space-y-4 rounded-lg border border-foreground/5 bg-foreground/2 p-6 transition-all hover:border-foreground/10 hover:bg-foreground/3">
                <div className="flex items-start justify-between">
                    <span className="text-[11px] font-medium uppercase tracking-widest text-foreground/40">{label}</span>
                    {hint && <span className="text-[11px] font-medium text-emerald-700 dark:text-emerald-400">{hint}</span>}
                </div>
                <div className="flex items-end justify-between">
                    <span className={`text-4xl font-light tracking-tight ${accentConfig.text}`}>{value}</span>
                    <div className={`h-1 w-1 rounded-full ${accentConfig.indicator}`} />
                </div>
            </div>
        </div>
    );
    if (href) return <Link href={href} className="block">{content}</Link>;
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
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            <StatCard
                label="Total Value Found"
                value={isLoading ? "—" : `$${totalValue.toLocaleString()}`}
                accent="success"
                href="/dashboard/value-recovery"
                hint={planData?.current_plan === "free" && totalValue > 0 ? "Unlock to claim →" : undefined}
            />
            <StatCard
                label="Active Subscriptions"
                value={isLoading ? "—" : `${usd.format(totalSubs)}/mo`}
                accent="warning"
                href="/dashboard/subscriptions"
            />
            <StatCard label="Newsletters" value={isLoading ? "—" : newsletters} href="/dashboard/newsletters" />
            <StatCard label="Accounts" value={isLoading ? "—" : oldAccounts} href="/dashboard/accounts" />
            <div className="group relative h-full">
                <div className="flex h-full flex-col justify-between space-y-4 rounded-lg border border-foreground/5 bg-foreground/2 p-6 transition-all hover:border-foreground/10 hover:bg-foreground/3">
                    <div className="flex items-start justify-between">
                        <span className="text-[11px] font-medium uppercase tracking-widest text-foreground/40">Recent Finds</span>
                    </div>
                    <div className="flex flex-col gap-1">
                        {isLoading ? (
                            <span className="text-foreground/40 text-sm">Loading…</span>
                        ) : recent.length === 0 ? (
                            <span className="text-foreground/40 text-sm">No recent finds</span>
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
        </div>
    );
}
