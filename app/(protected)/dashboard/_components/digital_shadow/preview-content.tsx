import { Lock, ArrowRight, CheckCircle2, Zap } from "lucide-react";
import { DigitalShadowResponse } from "../../digital_shadow/page";
import { Badge } from "@/components/ui/badge";
import { confidenceColor, confidenceLabel } from "./helpers";
import { Button } from "@/components/ui/button";
import Link from "next/link";


// -------------------- Preview Content (Free) --------------------
export default function PreviewContent({ data }: { data: Extract<DigitalShadowResponse, { preview: true }> }) {
    return (
        <div className="grid gap-4 lg:grid-cols-3">
            {/* Main Preview */}
            <div className="lg:col-span-2 space-y-3">
                {/* Top Brokers Preview */}
                <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                    <div className="flex items-start justify-between gap-2 mb-4">
                        <div>
                            <h2 className="text-lg font-semibold text-white">Top Data Brokers</h2>
                            <p className="text-xs text-white/60 mt-0.5">
                                Preview of your most-connected brokers
                            </p>
                        </div>
                        <Badge variant="outline" className="border-amber-500/30 bg-amber-500/10 text-amber-400 text-xs">
                            Free
                        </Badge>
                    </div>

                    <div className="space-y-2">
                        {data.topBrokers.map((b, i) => (
                            <div
                                key={`${b.name}-${i}`}
                                className="group rounded-lg border border-white/10 bg-white/5 p-3 hover:bg-white/8 transition-all"
                            >
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <div className="text-sm font-semibold text-white truncate">{b.name}</div>
                                            <TypeBadge type={b.type} />
                                        </div>
                                        <div className="flex items-center gap-2 mt-1 text-xs text-white/60">
                                            <span className="flex items-center gap-1">
                                                <Zap className="h-3 w-3" />
                                                {b.serviceCount} connections
                                            </span>
                                            <span
                                                className="flex items-center gap-1 font-semibold"
                                                style={{ color: confidenceColor(b.highestConfidence) }}
                                            >
                                                <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: confidenceColor(b.highestConfidence) }} />
                                                {confidenceLabel(b.highestConfidence)}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="text-lg font-semibold text-white/40 group-hover:text-white/60 transition-colors shrink-0">
                                        #{i + 1}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Locked Preview */}
                    {data.lockedCount > 0 && (
                        <div className="mt-3 rounded-lg border border-white/10 bg-black/10 p-4 text-center">
                            <Lock className="h-6 w-6 text-white/40 mx-auto mb-2" />
                            <div className="text-sm font-semibold text-white mb-1">
                                {data.lockedCount} more brokers hidden
                            </div>
                            <p className="text-xs text-white/60 mb-3">
                                {data.upgradeMessage ?? "Upgrade to Pro to see your complete digital shadow"}
                            </p>
                            <Link href="/dashboard/billing">
                                <Button size="sm" className="bg-emerald-500 text-white hover:bg-emerald-600 mx-auto">
                                    Unlock Full Report
                                </Button>
                            </Link>
                        </div>
                    )}
                </div>
            </div>

            {/* Upgrade CTA */}
            <div className="space-y-3">
                <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-4">
                    <h3 className="text-sm font-semibold text-white mb-2">Unlock Pro Features</h3>
                    <p className="text-xs text-white/70 mb-4">
                        Get the complete picture of your data exposure
                    </p>

                    <div className="space-y-2 mb-4">
                        <FeatureItem text="Full network visualization" />
                        <FeatureItem text="All data brokers revealed" />
                        <FeatureItem text="Priority recommendations" />
                        <FeatureItem text="One-click opt-out" />
                        <FeatureItem text="Progress tracking" />
                    </div>

                    <Link href="/dashboard/billing" className="block">
                        <Button size="sm" className="w-full bg-emerald-500 text-white hover:bg-emerald-600 text-xs">
                            Upgrade to Pro <ArrowRight className="h-3 w-3 ml-2" />
                        </Button>
                    </Link>
                </div>

                <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                    <h4 className="text-xs font-semibold text-white mb-2">Why It Matters</h4>
                    <p className="text-xs text-white/60 leading-relaxed">
                        Data brokers profit from your personal information by selling it to advertisers, insurance companies, and others.
                    </p>
                </div>
            </div>
        </div>
    );
}

function FeatureItem({ text }: { text: string }) {
    return (
        <div className="flex items-center gap-2 text-xs text-white/80">
            <CheckCircle2 className="h-3 w-3 text-emerald-400 shrink-0" />
            <span>{text}</span>
        </div>
    );
}

export function TypeBadge({ type }: { type: string }) {
    const config: Record<string, { bg: string; text: string; label: string }> = {
        government: { bg: "bg-red-500/10", text: "text-red-400", label: "Gov" },
        ad_network: { bg: "bg-orange-500/10", text: "text-orange-400", label: "Ads" },
        broker: { bg: "bg-purple-500/10", text: "text-purple-400", label: "Broker" },
        other: { bg: "bg-slate-500/10", text: "text-slate-400", label: "Other" },
    };

    const c = config[type] ?? config.other;

    return (
        <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${c.bg} ${c.text}`}>
            {c.label}
        </span>
    );
}