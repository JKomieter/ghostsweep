import { Badge } from "@/components/ui/badge";
import { BrokerOut } from "../../digital_shadow/page";
import NetworkGraph from "./network-graph";


// -------------------- Network Graph View --------------------
export default function NetworkGraphView({
    services,
    brokers,
}: {
    services: Array<{ id: string; name: string; domain?: string | null; category?: string | null }>;
    brokers: BrokerOut[];
}) {
    return (
        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-[#050509] to-black p-6">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-6">
                <div>
                    <h2 className="text-xl font-bold text-white">Network Visualization</h2>
                    <p className="text-sm text-white/60 mt-1">
                        Your accounts (inner ring) connected to data brokers (outer ring)
                    </p>
                </div>
                <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-400 font-semibold w-fit">
                    Pro
                </Badge>
            </div>

            <NetworkGraph services={services} brokers={brokers} />

            <div className="mt-4 text-xs text-white/50 text-center">
                💡 Tip: Hover over nodes for details · Drag nodes to rearrange · Thicker lines = more connections
            </div>
        </div>
    );
}