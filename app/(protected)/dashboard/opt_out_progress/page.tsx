/* eslint-disable @typescript-eslint/no-explicit-any */
// app/dashboard/opt-out-progress/page.tsx

"use client";

import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Spinner } from "@/components/ui/spinner";
import {
    CheckCircle2,
    Clock,
    XCircle,
    AlertCircle,
    RefreshCw,
    ChevronDown,
    ChevronUp,
    TrendingUp,
    Target,
    ArrowRight,
} from "lucide-react";
import { toast } from "sonner";

type OptOutStatus = "not_started" | "in_progress" | "completed" | "failed";
type OptOutMethod = "email" | "web_form" | "phone" | "mail";

type OptOutRequest = {
    id: string;
    broker_id: string;
    status: OptOutStatus;
    method?: OptOutMethod;
    created_at: string;
    updated_at: string;
    notes?: string;
    broker: {
        id: string;
        name: string;
        type: string;
        category?: string;
        removal_url?: string;
        contact_email?: string;
        description?: string;
    };
};

type OptOutProgressData = {
    requests: OptOutRequest[];
    stats: {
        total: number;
        not_started: number;
        in_progress: number;
        completed: number;
        failed: number;
    };
    progress: {
        completed: number;
        inProgress: number;
        total: number;
        percentage: number;
    };
    averageResponseTime?: number;
};

export default function OptOutProgressPage() {
    const [filter, setFilter] = React.useState<"all" | OptOutStatus>("all");
    const [sortBy, setSortBy] = React.useState<"date" | "status" | "name">("date");
    const [query, setQuery] = React.useState("");

    const {
        data,
        isLoading,
        isError,
        error,
        refetch,
        isFetching,
    } = useQuery<OptOutProgressData>({
        queryKey: ["opt_out_progress"],
        queryFn: async () => {
            const res = await fetch("/api/opt-out-requests", { cache: "no-store" });
            const j = await res.json().catch(() => ({}));
            if (!res.ok) {
                const msg =
                    typeof (j as any)?.error === "string"
                        ? (j as any).error
                        : "Failed to load progress";
                throw new Error(msg);
            }
            return j as OptOutProgressData;
        },
        refetchInterval: 30_000,
        refetchOnWindowFocus: false,
        staleTime: 10_000,
        retry: 1,
    });

    const filteredRequests = React.useMemo(() => {
        if (!data?.requests) return [];

        let rows = [...data.requests];

        const q = query.trim().toLowerCase();
        if (q) {
            rows = rows.filter((r) => {
                const name = (r.broker?.name ?? "").toLowerCase();
                const type = (r.broker?.type ?? "").toLowerCase();
                const category = (r.broker?.category ?? "").toLowerCase();
                const method = (r.method ?? "").toLowerCase();
                const status = (r.status ?? "").toLowerCase();
                return (
                    name.includes(q) ||
                    type.includes(q) ||
                    category.includes(q) ||
                    method.includes(q) ||
                    status.includes(q)
                );
            });
        }

        if (filter !== "all") {
            rows = rows.filter((r) => r.status === filter);
        }

        // Sort
        rows.sort((a, b) => {
            if (sortBy === "date") {
                const at = new Date(a.updated_at).getTime();
                const bt = new Date(b.updated_at).getTime();
                return bt - at;
            }
            if (sortBy === "status") {
                const order: Record<OptOutStatus, number> = {
                    completed: 0,
                    in_progress: 1,
                    failed: 2,
                    not_started: 3,
                };
                return order[a.status] - order[b.status];
            }
            // name
            return (a.broker?.name ?? "").localeCompare(b.broker?.name ?? "");
        });

        return rows;
    }, [data, query, filter, sortBy]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-linear-to-b from-[#020308] via-black to-[#050608] flex items-center justify-center">
                <Spinner className="h-8 w-8 text-emerald-500" />
            </div>
        );
    }

    if (isError) {
        return (
            <main className="min-h-screen bg-linear-to-b from-[#020308] via-black to-[#050608]">
                <div className="mx-auto max-w-3xl px-4 py-16">
                    <div className="rounded-2xl border border-white/10 bg-[#050509] p-10 text-center">
                        <AlertCircle className="h-10 w-10 text-red-300 mx-auto mb-3" />
                        <h2 className="text-xl font-semibold text-white">Couldn’t load opt-out progress</h2>
                        <p className="mt-2 text-sm text-white/60">
                            {(error as any)?.message ?? "Unknown error"}
                        </p>
                        <div className="mt-6">
                            <Button
                                size="lg"
                                className="border-white/15 bg-white/5 text-white hover:bg-white/10"
                                onClick={() => refetch()}
                            >
                                <RefreshCw className={`h-4 w-4 mr-2 ${isFetching ? "animate-spin" : ""}`} />
                                Retry
                            </Button>
                        </div>
                    </div>
                </div>
            </main>
        );
    }

    if (!data || data.progress.total === 0) {
        return <EmptyState />;
    }

    const { stats, progress } = data;

    const successRate =
        stats.total > 0 ? `${Math.round((stats.completed / stats.total) * 100)}%` : "0%";

    return (
        <main className="min-h-screen bg-linear-to-b from-[#020308] via-black to-[#050608]">
            <div className="mx-auto max-w-6xl px-4 py-8 space-y-6">
                {/* Header */}
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div className="space-y-2">
                        <h1 className="text-2xl font-bold text-white">Opt-Out Progress</h1>
                        <p className="text-sm text-white/60">Track your data removal requests and their status</p>
                    </div>

                    <Button
                        size="sm"
                        className="w-fit border-white/15 bg-white/5 text-white hover:bg-white/10"
                        onClick={() => refetch()}
                    >
                        <RefreshCw className={`h-4 w-4 mr-2 ${isFetching ? "animate-spin" : ""}`} />
                        Refresh
                    </Button>
                </div>

                {/* Overall Progress Card */}
                <div className="rounded-xl border border-white/10 bg-white/5 p-6">
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="font-semibold text-white">Progress</h2>
                        <Badge className="bg-emerald-500 text-white">{progress.percentage}%</Badge>
                    </div>
                    <Progress value={progress.percentage} className="h-2" />
                    <p className="text-xs text-white/60 mt-2">{progress.completed} of {progress.total} completed</p>
                </div>

                {/* Quick Stats Grid */}
                <div className="grid gap-3 md:grid-cols-4">
                    <StatCard
                        icon={<CheckCircle2 className="h-4 w-4" />}
                        label="Removed"
                        value={stats.completed.toString()}
                        iconColor="text-emerald-400"
                    />
                    <StatCard
                        icon={<Target className="h-4 w-4" />}
                        label="Total Brokers"
                        value={stats.total.toString()}
                        iconColor="text-blue-400"
                    />
                    <StatCard
                        icon={<Clock className="h-4 w-4" />}
                        label="In Progress"
                        value={stats.in_progress.toString()}
                        iconColor="text-amber-400"
                    />
                    <StatCard
                        icon={<TrendingUp className="h-4 w-4" />}
                        label="Success Rate"
                        value={successRate}
                        iconColor="text-purple-400"
                    />
                </div>

                {/* Filters & Sort */}
                <div className="rounded-lg border border-white/10 bg-white/5 p-4 space-y-3">
                    {/* Search */}
                    <input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search brokers…"
                        className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />

                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                        <div className="flex flex-wrap gap-2">
                            <FilterButton active={filter === "all"} onClick={() => setFilter("all")} label="All" count={stats.total} />
                            <FilterButton active={filter === "completed"} onClick={() => setFilter("completed")} label="Completed" count={stats.completed} />
                            <FilterButton active={filter === "in_progress"} onClick={() => setFilter("in_progress")} label="In Progress" count={stats.in_progress} />
                            <FilterButton active={filter === "failed"} onClick={() => setFilter("failed")} label="Failed" count={stats.failed} />
                            <FilterButton active={filter === "not_started"} onClick={() => setFilter("not_started")} label="Not Started" count={stats.not_started} />
                        </div>

                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as any)}
                            className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        >
                            <option value="date">Recently Updated</option>
                            <option value="status">By Status</option>
                            <option value="name">Alphabetical</option>
                        </select>
                    </div>
                </div>

                {/* Request List */}
                <div className="space-y-3">
                    {filteredRequests.length === 0 ? (
                        <div className="rounded-2xl border border-white/10 bg-linear-to-br from-[#050509] to-black p-12 text-center">
                            <AlertCircle className="h-12 w-12 text-white/30 mx-auto mb-4" />
                            <div className="text-lg font-semibold text-white mb-2">No requests found</div>
                            <div className="text-sm text-white/60">Try changing your filter or search.</div>
                        </div>
                    ) : (
                        filteredRequests.map((request) => <RequestRow key={request.id} request={request} />)
                    )}
                </div>

                {/* Achievement Banner (if completed) */}
                {progress.percentage === 100 && <AchievementBanner stats={stats} />}
            </div>
        </main>
    );
}

// -------------------- Components --------------------

function StatCard({
    icon,
    label,
    value,
    iconColor,
}: {
    icon: React.ReactNode;
    label: string;
    value: string;
    iconColor: string;
}) {
    return (
        <div className="rounded-lg border border-white/10 bg-white/5 p-4">
            <div className="flex items-center justify-between">
                <div className="flex-1">
                    <div className="text-xs text-white/60 mb-1">
                        {label}
                    </div>
                    <div className="text-xl font-semibold text-white">{value}</div>
                </div>
                <div className={`h-8 w-8 flex items-center justify-center ${iconColor}`}>
                    {icon}
                </div>
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
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${active
                    ? "bg-emerald-500 text-white"
                    : "bg-white/5 text-white/70 hover:bg-white/10 border border-white/10"
                }`}
        >
            {label} ({count})
        </button>
    );
}

function RequestRow({ request }: { request: OptOutRequest }) {
    const [expanded, setExpanded] = React.useState(false);
    const [currentTime, setCurrentTime] = React.useState(0);

    React.useEffect(() => {
        setCurrentTime(Date.now());
        const interval = setInterval(() => setCurrentTime(Date.now()), 60000); // Update every minute
        return () => clearInterval(interval);
    }, []);

    const statusConfig = {
        completed: {
            icon: <CheckCircle2 className="h-4 w-4" />,
            badge: "Completed",
            color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
            dot: "bg-emerald-500",
        },
        in_progress: {
            icon: <Clock className="h-4 w-4" />,
            badge: "In Progress",
            color: "bg-amber-500/20 text-amber-400 border-amber-500/30",
            dot: "bg-amber-500",
        },
        failed: {
            icon: <XCircle className="h-4 w-4" />,
            badge: "Failed",
            color: "bg-red-500/20 text-red-400 border-red-500/30",
            dot: "bg-red-500",
        },
        not_started: {
            icon: <AlertCircle className="h-4 w-4" />,
            badge: "Not Started",
            color: "bg-slate-500/20 text-slate-400 border-slate-500/30",
            dot: "bg-slate-500",
        },
    };

    const config = statusConfig[request.status];
    const daysSince = React.useMemo(() => {
        return Math.floor(
            (currentTime - new Date(request.created_at).getTime()) / (1000 * 60 * 60 * 24)
        );
    }, [request.created_at, currentTime]);

    return (
        <div className="rounded-lg border border-white/10 bg-white/5 overflow-hidden hover:border-white/20 transition-all hover:bg-white/8">
            <button
                onClick={() => setExpanded(!expanded)}
                className="w-full px-5 py-4 flex items-center justify-between text-left group"
            >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                    {/* Status Dot with Pulse */}
                    <div className={`h-2 w-2 rounded-full ${config.dot} shrink-0 ${request.status === 'in_progress' ? 'animate-pulse' : ''}`} />

                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="font-semibold text-sm text-white truncate">
                                {request.broker.name}
                            </span>
                            <Badge className={`${config.color} text-xs border`}>
                                {config.icon}
                                <span className="ml-1">{config.badge}</span>
                            </Badge>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 text-xs text-white/60">
                            <span className="capitalize">{request.broker.type || "Data Broker"}</span>
                            {request.created_at && (
                                <>
                                    <span>·</span>
                                    <span>Started {daysSince} day{daysSince !== 1 ? 's' : ''} ago</span>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                <div className="text-white/40 ml-3">
                    {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </div>
            </button>

            {expanded && <RequestDetails request={request} />}
        </div>
    );
}

type UpdateAction = "mark_completed" | "mark_failed" | "update_notes";
function RequestDetails({ request }: { request: OptOutRequest }) {
    const [notes, setNotes] = React.useState(request.notes || "");
    const [isSaving, setIsSaving] = React.useState(false);
    const queryClient = useQueryClient();

    const method = request.method
        ? request.method.replace("_", " ").toUpperCase()
        : "N/A";

    const handleUpdateRequest = useMutation({
        mutationFn: async (action: UpdateAction) => {
            const patchData: Record<string, any> = {};
            if (action === "mark_completed") {
                patchData.status = "completed";
            } else if (action === "mark_failed") {
                patchData.status = "failed";
            } else if (action === "update_notes" && notes !== (request.notes || "")) {
                patchData.notes = notes;
            }

            // Only send request if there are actual changes
            if (Object.keys(patchData).length === 0) {
                return request;
            }

            const res = await fetch(`/api/opt-out-requests/${request.id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(patchData),
            });
            if (!res.ok) {
                const j = await res.json().catch(() => ({}));
                const msg =
                    typeof (j as any)?.error === "string"
                        ? (j as any).error
                        : "Failed to update request";
                throw new Error(msg);
            }
            return res.json();
        },
        onMutate: () => {
            setIsSaving(true);
        },
        onError: (error) => {
            console.error("Failed to update request:", error);
            toast.error("Failed to update request");
        },
        onSuccess: () => {
            toast.success("Request updated successfully");
            queryClient.invalidateQueries({queryKey: ["opt_out_progress"]});
        },
        onSettled: () => {
            setIsSaving(false);
        },
    });

    const handleSaveNotes = () => {
        handleUpdateRequest.mutate("update_notes");
    };

    const handleMarkCompleted = () => {
        handleUpdateRequest.mutate("mark_completed");
    };

    const handleMarkFailed = () => {
        handleUpdateRequest.mutate("mark_failed");
    };

    React.useEffect(() => {
        // Setup polling for updates
        const interval = setInterval(() => {}, 60000); // Update every minute
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="px-4 pb-4 border-t border-white/10 bg-black/10 space-y-4">
            <div className="grid md:grid-cols-2 gap-4 py-3 text-sm">
                {/* Left Column */}
                <div className="space-y-2">
                    <div>
                        <h4 className="text-xs font-semibold text-white/60 mb-2">
                            Timeline
                        </h4>
                        <div className="space-y-2">
                            <TimelineItem
                                date={new Date(request.created_at).toLocaleDateString()}
                                label="Request started"
                                completed
                            />
                            {request.status === "completed" && (
                                <TimelineItem
                                    date={new Date(request.updated_at).toLocaleDateString()}
                                    label="Completed"
                                    completed
                                />
                            )}
                            {request.status === "failed" && (
                                <TimelineItem
                                    date={new Date(request.updated_at).toLocaleDateString()}
                                    label="Failed"
                                    completed={false}
                                    failed
                                />
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column */}
                <div className="space-y-2">
                    <div>
                        <h4 className="text-xs font-semibold text-white/60 mb-2">
                            Details
                        </h4>
                        {request.broker.contact_email && (
                            <div className="text-xs text-white/60 mb-2">
                                Contact: <span className="text-white">{request.broker.contact_email}</span>
                            </div>
                        )}
                        <div className="text-xs text-white/60">
                            Method: <span className="text-white">{method}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Notes Section */}
            <div className="pt-3 border-t border-white/10 space-y-2">
                <h4 className="text-xs font-semibold text-white/60">Notes</h4>
                <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add any notes about this opt-out request..."
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white placeholder:text-white/40 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    rows={3}
                />
                <Button
                    size="sm"
                    onClick={handleSaveNotes}
                    disabled={isSaving}
                    className="bg-emerald-500 text-white hover:bg-emerald-600"
                >
                    {isSaving ? "Saving..." : "Save Notes"}
                </Button>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-2 pt-3 border-t border-white/10">
                {request.broker.removal_url && (
                    <Button
                        size="sm"
                        variant="outline"
                        className="border-white/15 bg-white/5 text-white hover:bg-white/10"
                        onClick={() => window.open(request.broker.removal_url!, "_blank")}
                    >
                        Visit Opt-Out Page
                    </Button>
                )}
                {request.status !== "completed" && (
                    <>
                        <Button
                            size="sm"
                            className="bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/30"
                            onClick={handleMarkCompleted}
                            disabled={isSaving}
                        >
                            Mark as Completed
                        </Button>
                        <Button
                            size="sm"
                            variant="outline"
                            className="border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20"
                            onClick={handleMarkFailed}
                            disabled={isSaving}
                        >
                            Mark as Failed
                        </Button>
                    </>
                )}
            </div>
        </div>
    );
}

function TimelineItem({
    date,
    label,
    completed,
    failed,
}: {
    date: string;
    label: string;
    completed: boolean;
    failed?: boolean;
}) {
    return (
        <div className="flex items-start gap-3">
            <div
                className={`flex h-6 w-6 items-center justify-center rounded-full shrink-0 ${failed
                        ? "bg-red-500/20 border-2 border-red-500"
                        : completed
                            ? "bg-emerald-500/20 border-2 border-emerald-500"
                            : "bg-white/5 border-2 border-white/20"
                    }`}
            >
                {completed && <CheckCircle2 className="h-3 w-3 text-emerald-400" />}
                {failed && <XCircle className="h-3 w-3 text-red-400" />}
            </div>
            <div className="flex-1">
                <div className="text-sm font-medium text-white">{label}</div>
                <div className="text-xs text-white/50">{date}</div>
            </div>
        </div>
    );
}

function AchievementBanner({ stats }: { stats: { completed: number } }) {
    return (
        <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-6 text-center">
            <div className="space-y-3">
                <h2 className="text-lg font-bold text-white">
                    You&apos;ve completed removing yourself from {stats.completed} brokers!
                </h2>
                <p className="text-sm text-white/70">
                    Great work on protecting your privacy.
                </p>
            </div>
        </div>
    );
}

function EmptyState() {
    return (
        <main className="min-h-screen bg-linear-to-b from-[#020308] via-black to-[#050608]">
            <div className="mx-auto max-w-3xl px-4 py-16">
                <div className="rounded-lg border border-white/10 bg-white/5 p-8 text-center space-y-4">
                    <Target className="h-12 w-12 text-emerald-400 mx-auto" />
                    <h2 className="text-xl font-bold text-white">
                        No opt-out requests yet
                    </h2>
                    <p className="text-sm text-white/70">
                        Start your data removal journey by visiting your Digital Shadow Map.
                    </p>
                    <Button
                        size="sm"
                        className="bg-white text-black hover:bg-zinc-100 font-semibold mx-auto"
                        onClick={() => (window.location.href = "/dashboard/digital_shadow")}
                    >
                        View Digital Shadow Map
                        <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                </div>
            </div>
        </main>
    );
}
