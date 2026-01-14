import { AlertTriangle, Clock } from "lucide-react";
import { BrokerOut } from "../../digital_shadow/page";
import { Button } from "@/components/ui/button";
import { TypeBadge } from "./preview-content";
import { confidenceColor, confidenceLabel } from "./helpers";
import Link from "next/link";


// -------------------- Priority Actions Panel --------------------
export default function PriorityActionsPanel({ brokers }: { brokers: BrokerOut[] }) {
    if (brokers.length === 0) return null;

    return (
        <div className="rounded-lg border border-orange-500/30 bg-orange-500/5 p-4">
            <div className="space-y-3">
                <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-orange-400 shrink-0 mt-0.5" />
                    <div className="flex-1">
                        <h2 className="font-semibold text-white text-sm">Priority Actions Needed</h2>
                        <p className="text-xs text-white/70 mt-0.5">
                            These {brokers.length} broker{brokers.length !== 1 ? 's' : ''} pose the highest risk.
                        </p>
                    </div>
                </div>

                <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
                    {brokers.map((broker) => (
                        <PriorityBrokerCard key={broker.id ?? broker.name} broker={broker} />
                    ))}
                </div>
            </div>
        </div>
    );
}

function PriorityBrokerCard({ broker }: { broker: BrokerOut }) {
    const canOptOut = Boolean(broker.removal_url || broker.contact_email);

    return (
        <div className="rounded-lg border border-white/10 bg-white/5 p-3 hover:border-white/20 transition-all hover:bg-white/8">
            <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex-1 min-w-0">
                    <div className="font-semibold text-white truncate text-sm">{broker.name}</div>
                    <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                        <TypeBadge type={broker.type} />
                        <span
                            className="text-xs font-medium"
                            style={{ color: confidenceColor(broker.highestConfidence) }}
                        >
                            {confidenceLabel(broker.highestConfidence)}
                        </span>
                    </div>
                </div>
            </div>

            <div className="text-xs text-white/60 mb-3">
                Tracking <span className="font-semibold text-white">{broker.serviceCount}</span> accounts
            </div>

            <div className="flex gap-1.5">
                {canOptOut ? (
                    <>
                        <Link href={`#broker-${broker.id}`} className="flex-1">
                            <Button
                                size="sm"
                                className="w-full h-7 bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/30 text-xs"
                            >
                                <Clock className="h-3 w-3 mr-1" />
                                Opt Out
                            </Button>
                        </Link>
                        <Link href={`#broker-${broker.id}`} className="flex-1">
                            <Button
                                size="sm"
                                variant="outline"
                                className="w-full h-7 border-white/15 bg-white/5 text-white hover:bg-white/10 text-xs"
                            >
                                Details
                            </Button>
                        </Link>
                    </>
                ) : (
                    <Button
                        size="sm"
                        variant="outline"
                        className="w-full h-7 border-white/15 bg-white/5 text-white hover:bg-white/10 text-xs"
                        disabled
                    >
                        No removal
                    </Button>
                )}
            </div>
        </div>
    );
}