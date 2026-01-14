import { Users, TrendingUp, Zap, Shield } from "lucide-react";
import { DigitalShadowResponse } from "../../digital_shadow/page";
import { clamp, getRiskLevel } from "./helpers";


// -------------------- Stats Overview --------------------
export default function StatsOverview({ data }: { data: DigitalShadowResponse }) {
    const stats = (data).stats;
    if (!stats) return null;

    const totalServices = stats.totalServices ?? 0;
    const totalBrokers = stats.totalBrokers ?? 0;
    const totalLinks = stats.totalLinks ?? 0;
    const riskScore = clamp(stats.riskScore ?? 0, 0, 100);
    const risk = getRiskLevel(riskScore);

    return (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
                icon={<Users className="h-4 w-4" />}
                label="Accounts Detected"
                value={totalServices.toLocaleString()}
                iconColor="text-blue-400"
            />
            <StatCard
                icon={<TrendingUp className="h-4 w-4" />}
                label="Data Brokers"
                value={totalBrokers.toLocaleString()}
                iconColor="text-purple-400"
            />
            <StatCard
                icon={<Zap className="h-4 w-4" />}
                label="Total Connections"
                value={totalLinks.toLocaleString()}
                iconColor="text-amber-400"
            />
            <StatCard
                icon={<Shield className="h-4 w-4" />}
                label="Risk Score"
                value={`${riskScore}/100`}
                subtitle={risk.level}
                iconColor="text-red-400"
            />
        </div>
    );
}

function StatCard({
    icon,
    label,
    value,
    subtitle,
    iconColor,
}: {
    icon: React.ReactNode;
    label: string;
    value: string;
    subtitle?: string;
    iconBg?: string;
    iconBorder?: string;
    iconColor: string;
}) {
    return (
        <div className="rounded-lg border border-white/10 bg-white/5 p-4 hover:border-white/20 transition-all hover:bg-white/8">
            <div className="flex items-center justify-between">
                <div className="flex-1">
                    <div className="text-xs text-white/60 mb-1">{label}</div>
                    <div className="flex items-baseline gap-2">
                        <div className="text-xl font-semibold text-white">{value}</div>
                        {subtitle && (
                            <div className="text-xs font-medium text-white/60">{subtitle}</div>
                        )}
                    </div>
                </div>
                <div className={`flex h-8 w-8 items-center justify-center ${iconColor}`}>
                    {icon}
                </div>
            </div>
        </div>
    );
}