import React from "react";
import { DigitalShadowResponse } from "../../digital_shadow/page";
import PriorityActionsPanel from "./priority-actions-panel";
import BrokerDetailsList from "./broker-detail-list";
import BrokerCardsView from "./brokers-card-view";
import NetworkGraphView from "./network-graph-view";


// -------------------- Pro Content --------------------
export default function ProContent({
    data,
    preferCards,
}: {
    data: Extract<DigitalShadowResponse, { isPro: true }>;
    preferCards: boolean;
}) {
    const brokers = data.brokers;
    const stats = data.stats;

    // Build services list
    const services = React.useMemo(() => {
        const map = new Map<string, { id: string; name: string; domain?: string | null; category?: string | null }>();
        for (const b of brokers) {
            for (const s of b.services ?? []) {
                if (!s?.id) continue;
                if (!map.has(s.id)) {
                    map.set(s.id, {
                        id: s.id,
                        name: (s.name ?? s.domain ?? "Service") as string,
                        domain: s.domain ?? null,
                        category: s.category ?? null,
                    });
                }
            }
        }
        return Array.from(map.values());
    }, [brokers]);

    // Priority brokers (government + confirmed + high connection count)
    const priorityBrokers = React.useMemo(() => {
        return brokers
            .filter(b =>
                b.type === "government" ||
                b.highestConfidence === "confirmed" ||
                b.serviceCount > 20
            )
            .sort((a, b) => {
                // Government first
                if (a.type === "government" && b.type !== "government") return -1;
                if (b.type === "government" && a.type !== "government") return 1;
                // Then by service count
                return b.serviceCount - a.serviceCount;
            })
            .slice(0, 5);
    }, [brokers]);

    return (
        <div className="space-y-6">
            {/* Priority Actions Panel */}
            <PriorityActionsPanel brokers={priorityBrokers} />

            {/* Network Graph or Cards */}
            {preferCards ? (
                <BrokerCardsView brokers={brokers} />
            ) : (
                <NetworkGraphView services={services} brokers={brokers} />
            )}

            {/* Broker Details List */}
            <BrokerDetailsList brokers={brokers} stats={stats} />
        </div>
    );
}