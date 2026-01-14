import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BrokerOut } from "../../digital_shadow/page";
import { TypeBadge } from "./preview-content";
import { confidenceColor, confidenceLabel } from "./helpers";



// -------------------- Broker Cards View (Mobile) --------------------
export default function BrokerCardsView({ brokers }: { brokers: BrokerOut[] }) {
    return (
        <div className="rounded-lg border border-white/10 bg-white/5 p-4">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h2 className="text-lg font-semibold text-white">Your Data Brokers</h2>
                    <p className="text-xs text-white/60 mt-0.5">
                        {brokers.length} brokers detected
                    </p>
                </div>
                <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs">
                    Pro
                </Badge>
            </div>

            <div className="grid gap-2 md:grid-cols-2">
                {brokers.slice(0, 20).map((b) => (
                    <div
                        key={b.id ?? b.name}
                        className="rounded-lg border border-white/10 bg-white/5 p-3 hover:bg-white/8 transition-all"
                    >
                        <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="flex-1 min-w-0">
                                <div className="font-semibold text-white truncate text-sm">{b.name}</div>
                                <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                                    <TypeBadge type={b.type} />
                                    <span
                                        className="text-xs font-medium"
                                        style={{ color: confidenceColor(b.highestConfidence) }}
                                    >
                                        {confidenceLabel(b.highestConfidence)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="text-xs text-white/60 mb-2">
                            {b.serviceCount} connections
                        </div>

                        <div className="flex flex-wrap gap-1">
                            {(b.services ?? []).slice(0, 3).map((s) => (
                                <Badge
                                    key={`${b.id}-${s.id}`}
                                    variant="outline"
                                    className="border-white/15 bg-black/20 text-white/70 text-xs"
                                >
                                    {s.name ?? s.domain ?? "Service"}
                                </Badge>
                            ))}
                            {(b.services?.length ?? 0) > 3 && (
                                <span className="text-xs text-white/50 self-center px-1">
                                    +{(b.services?.length ?? 0) - 3}
                                </span>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {brokers.length > 20 && (
                <div className="mt-3 text-center">
                    <Button variant="outline" size="sm" className="border-white/15 bg-white/5 text-white hover:bg-white/10 text-xs">
                        Show all {brokers.length}
                    </Button>
                </div>
            )}
        </div>
    );
}