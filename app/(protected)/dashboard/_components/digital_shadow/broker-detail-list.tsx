/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from "@/components/ui/button";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { Clock, CheckCircle2, XCircle, AlertCircle, Mail, Loader2, ExternalLink } from "lucide-react";
import React from "react";
import { toast } from "sonner";
import { BrokerOut } from "../../digital_shadow/page";
import { confidenceColor, confidenceLabel } from "./helpers";
import { TypeBadge } from "./preview-content";
import { Badge } from "@/components/ui/badge";
import OptOutEmailModal from "./opt-out-email-modal";


// -------------------- Broker Details List --------------------
export default function BrokerDetailsList({ brokers, stats }: { brokers: BrokerOut[]; stats: any }) {
    const [filter, setFilter] = React.useState<"all" | "government" | "confirmed">("all");

    const filtered = React.useMemo(() => {
        if (filter === "government") return brokers.filter(b => b.type === "government");
        if (filter === "confirmed") return brokers.filter(b => b.highestConfidence === "confirmed");
        return brokers;
    }, [brokers, filter]);

    return (
        <div className="rounded-lg border border-white/10 bg-white/5 p-4">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-white">All Data Brokers</h2>
                <div className="flex gap-1.5">
                    <FilterButton
                        active={filter === "all"}
                        onClick={() => setFilter("all")}
                        label="All"
                        count={brokers.length}
                    />
                    <FilterButton
                        active={filter === "confirmed"}
                        onClick={() => setFilter("confirmed")}
                        label="Confirmed"
                        count={stats?.byConfidence?.confirmed ?? 0}
                    />
                    <FilterButton
                        active={filter === "government"}
                        onClick={() => setFilter("government")}
                        label="Government"
                        count={stats?.byType?.government ?? 0}
                    />
                </div>
            </div>

            <div className="space-y-1.5">
                {filtered.map((broker) => (
                    <div key={broker.id ?? broker.name} id={`broker-${broker.id}`}>
                        <BrokerDetailRow broker={broker} />
                    </div>
                ))}
            </div>
        </div>
    );
}

function FilterButton({
    active,
    onClick,
    label,
    count,
}: {
    active: boolean;
    onClick: () => void;
    label: string;
    count: number;
}) {
    return (
        <button
            onClick={onClick}
            className={`px-2 py-1 rounded-lg text-xs font-medium transition-all ${active
                    ? "bg-emerald-500 text-white"
                    : "bg-white/5 text-white/70 hover:bg-white/10 border border-white/10"
                }`}
        >
            {label} ({count})
        </button>
    );
}

function BrokerDetailRow({ broker }: { broker: BrokerOut }) {
    const [expanded, setExpanded] = React.useState(false);
    const queryClient = useQueryClient();

    const [emailModalOpen, setEmailModalOpen] = React.useState(false);

    // Auto-expand when scrolled to via anchor
    React.useEffect(() => {
        const hash = window.location.hash.slice(1);
        if (hash === `broker-${broker.id}`) {
            setExpanded(true);
        }
    }, [broker.id]);

    const hasOptedOut = broker.optOutRequest?.status === "completed";
    const inProgress = broker.optOutRequest?.status === "in_progress";
    const hasFailed = broker.optOutRequest?.status === "failed";
    const hasStarted = broker.optOutRequest && broker.optOutRequest.status !== "not_started";

    const visitOptOutMutation = useMutation({
        mutationFn: async () => {
            if (!broker.removal_url) {
                throw new Error("No opt-out URL available");
            }

            // Track the visit
            const res = await fetch(`/api/broker/${broker.id}/visit-opt-out-page`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
            });

            if (!res.ok) {
                throw new Error("Failed to track opt-out");
            }

            // Open page
            window.open(broker.removal_url, "_blank");

            return res.json();
        },
        onError: (error) => {
            console.error("Failed to track opt-out:", error);
            toast.error("Failed to open opt-out page");
        },
        onSuccess: () => {
            toast.success("Opening opt-out page...");
            queryClient.invalidateQueries({ queryKey: ["digital_shadow"] });
        },
    });

    const canEmail = Boolean(broker.contact_email);
    const canVisit = Boolean(broker.removal_url);

    return (
        <>
            <div 
                className="rounded-lg border border-white/10 bg-white/5 overflow-hidden hover:border-white/20 transition-all"
            >
                <button
                    onClick={() => setExpanded(!expanded)}
                    className="w-full px-3 py-2 flex items-center justify-between text-left hover:bg-white/8 transition-colors text-sm"
                >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-semibold text-white truncate text-sm">{broker.name}</span>
                                <TypeBadge type={broker.type} />
                            </div>
                            <div className="flex flex-wrap items-center gap-2 mt-0.5 text-xs text-white/60">
                                <span>{broker.serviceCount} connections</span>
                                <span
                                    className="font-medium"
                                    style={{ color: confidenceColor(broker.highestConfidence) }}
                                >
                                    {confidenceLabel(broker.highestConfidence)}
                                </span>

                                {/* Status Badge */}
                                {hasOptedOut && (
                                    <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-xs h-5">
                                        <CheckCircle2 className="h-3 w-3 mr-1" />
                                        Completed
                                    </Badge>
                                )}
                                {inProgress && (
                                    <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-xs h-5">
                                        <Clock className="h-3 w-3 mr-1" />
                                        In Progress
                                    </Badge>
                                )}
                                {hasFailed && (
                                    <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-xs h-5">
                                        <XCircle className="h-3 w-3 mr-1" />
                                        Failed
                                    </Badge>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="text-white/40 ml-2 shrink-0">
                        {expanded ? "−" : "+"}
                    </div>
                </button>

                {expanded && (
                    <div className="px-3 pb-3 border-t border-white/10 bg-black/10 text-sm space-y-2">
                        {broker.description && (
                            <p className="text-xs text-white/70 py-1">
                                {broker.description}
                            </p>
                        )}

                        {/* Warning if already contacted */}
                        {hasStarted && !hasOptedOut && (
                            <div className="mb-3 rounded-lg bg-amber-500/10 border border-amber-500/30 p-3">
                                <div className="flex items-start gap-2">
                                    <AlertCircle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                                    <div className="text-xs text-amber-400">
                                        <div className="font-medium mb-0.5">You&apos;ve already contacted this broker</div>
                                        {broker.optOutRequest?.method && (
                                            <div className="text-amber-400/70">
                                                Method: {broker.optOutRequest.method} ·
                                                Last updated: {new Date(broker.optOutRequest.updated_at).toLocaleDateString()}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="flex flex-wrap gap-2 mb-4">
                            {canEmail && (
                                <Button
                                    size="sm"
                                    className="bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/30"
                                    onClick={() => setEmailModalOpen(true)}
                                >
                                    <Mail className="h-3 w-3 mr-1" />
                                    {hasStarted ? "Resend Email" : "Generate Email"}
                                </Button>
                            )}
                            {canVisit && (
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="border-white/15 bg-white/5 text-white hover:bg-white/10"
                                    onClick={() => visitOptOutMutation.mutate()}
                                    disabled={visitOptOutMutation.isPending}
                                >
                                    {visitOptOutMutation.isPending ? (
                                        <>
                                            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                            Opening...
                                        </>
                                    ) : (
                                        <>
                                            <ExternalLink className="h-3 w-3 mr-1" />
                                            {hasStarted ? "Visit Again" : "Visit Page"}
                                        </>
                                    )}
                                </Button>
                            )}
                        </div>

                        {broker.services && broker.services.length > 0 && (
                            <div>
                                <div className="text-xs font-medium text-white/50 mb-2">
                                    Connected Accounts ({broker.services.length})
                                </div>
                                <div className="flex flex-wrap gap-1">
                                    {broker.services.slice(0, 10).map((s) => (
                                        <Badge
                                            key={s.id}
                                            variant="outline"
                                            className="border-white/15 bg-black/20 text-white/70 text-xs"
                                        >
                                            {s.name ?? s.domain ?? "Service"}
                                        </Badge>
                                    ))}
                                    {broker.services.length > 10 && (
                                        <span className="text-xs text-white/50 self-center px-1">
                                            +{broker.services.length - 10} more
                                        </span>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <OptOutEmailModal
                open={emailModalOpen}
                onOpenChange={setEmailModalOpen}
                brokerId={broker.id ?? ""}
                brokerName={broker.name}
                existingRequest={broker.optOutRequest}
            />
        </>
    );
}
