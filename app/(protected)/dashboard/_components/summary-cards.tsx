import { useQuery } from "@tanstack/react-query";
import Link from "next/link";


function StatCard({ label, value, accent = "default", href }: { label: string; value: string | number; accent?: "default" | "danger" | "warning" | "success"; href?: string }) {
    const accentConfig = {
        default: { text: "text-white", indicator: "bg-zinc-500" },
        danger: { text: "text-white", indicator: "bg-red-500" },
        warning: { text: "text-white", indicator: "bg-amber-500" },
        success: { text: "text-white", indicator: "bg-emerald-500" },
    }[accent];
    const content = (
        <div className="group relative h-full">
            <div className="flex h-full flex-col justify-between space-y-4 rounded-lg border border-white/5 bg-white/2 p-6 transition-all hover:border-white/10 hover:bg-white/3">
                <div className="flex items-start justify-between">
                    <span className="text-[11px] font-medium uppercase tracking-widest text-white/40">{label}</span>
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

    const isLoading = status === "pending";
    const totalValue = data?.totalValue ?? 0;
    const totalSubs = data?.totalSubs ?? 0;
    const newsletters = data?.newsletters ?? 0;
    const oldAccounts = data?.oldAccounts ?? 0;
    const recent = data?.recent ?? [];

    return (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            <StatCard label="Total Value Found" value={isLoading ? "—" : `$${totalValue.toLocaleString()}`} accent="success" href="/dashboard/value-recovery" />
            <StatCard label="Active Subscriptions" value={isLoading ? "—" : `$${totalSubs.toLocaleString()}/mo`} accent="warning" href="/dashboard/subscriptions" />
            <StatCard label="Newsletters" value={isLoading ? "—" : newsletters} href="/dashboard/newsletters" />
            <StatCard label="Old Accounts" value={isLoading ? "—" : oldAccounts} href="/dashboard/accounts" />
            <div className="group relative h-full">
                <div className="flex h-full flex-col justify-between space-y-4 rounded-lg border border-white/5 bg-white/2 p-6 transition-all hover:border-white/10 hover:bg-white/3">
                    <div className="flex items-start justify-between">
                        <span className="text-[11px] font-medium uppercase tracking-widest text-white/40">Recent Finds</span>
                    </div>
                    <div className="flex flex-col gap-1">
                        {isLoading ? (
                            <span className="text-white/40 text-sm">Loading…</span>
                        ) : recent.length === 0 ? (
                            <span className="text-white/40 text-sm">No recent finds</span>
                        ) : (
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            recent.map((item: any) => (
                                <div key={item.id} className="text-xs text-white/80 truncate">
                                    {item.type}: ${item.amount} – {item.detected_at?.slice(0, 10)}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
