/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import * as d3 from "d3";
import { useQuery } from "@tanstack/react-query";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import Link from "next/link";

// ---- Types ----
type Plan = "free" | "pro";

type ApiUserService = {
    id: string;
    email_count: number | null;
    first_seen_at: string | null;
    last_seen_at: string | null;
    deletion_requests?: { id: string; status: string }[] | null;
    service: {
        id: string;
        name: string | null;
        domain: string | null;
        category: string | null;
        logo_url: string | null;
        is_breached?: boolean | null;
    };
};

type AllUserServicesResponse = { userServices: ApiUserService[] } | ApiUserService[];

type CategoryKey =
    | "social"
    | "shopping"
    | "entertainment"
    | "finance"
    | "health"
    | "productivity"
    | "travel"
    | "gaming"
    | "news"
    | "communication"
    | "other";

type ServiceNode = {
    id: string;
    name: string;
    categoryKey: CategoryKey;
    categoryLabel: string;
    status: "active" | "pending" | "deleted";
    breached: boolean;
    risk: "high" | "medium" | "low";
};

function categoryToKey(category: string | null | undefined): CategoryKey {
    const c = (category ?? "").toLowerCase();
    if (c.includes("social")) return "social";
    if (c.includes("shopping") || c.includes("e-commerce")) return "shopping";
    if (c.includes("streaming") || c.includes("entertainment")) return "entertainment";
    if (c.includes("financial") || c.includes("payments")) return "finance";
    if (c.includes("health") || c.includes("fitness")) return "health";
    if (c.includes("productivity") || c.includes("work")) return "productivity";
    if (c.includes("travel") || c.includes("transportation")) return "travel";
    if (c.includes("gaming")) return "gaming";
    if (c.includes("news") || c.includes("media")) return "news";
    if (c.includes("email") || c.includes("communication")) return "communication";
    return "other";
}

function statusFromDeletionRequests(reqs?: { status: string }[] | null): ServiceNode["status"] {
    const s = reqs?.[0]?.status;
    if (!s) return "active";
    if (s === "completed") return "deleted";
    if (["drafted", "sent", "received", "needs_verification", "in_progress"].includes(s)) return "pending";
    return "active";
}

function riskFromSignals(emailCount: number, breached: boolean): ServiceNode["risk"] {
    if (breached) return "high";
    if (emailCount >= 20) return "high";
    if (emailCount >= 5) return "medium";
    return "low";
}

// --- Fetchers ---
async function fetchPlan(): Promise<Plan> {
    const res = await fetch("/api/me/subscription", { cache: "no-store" });
    const j = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(j?.error ?? "Failed to load subscription");
    return (j?.plan as Plan) ?? "free";
}

async function fetchAllUserServices(): Promise<ApiUserService[]> {
    const res = await fetch("/api/user_services/all", { cache: "no-store" });
    const j = (await res.json().catch(() => ({}))) as AllUserServicesResponse;

    if (!res.ok) {
        const msg = typeof (j as any)?.error === "string" ? (j as any).error : "Failed to load user services";
        throw new Error(msg);
    }
    if (Array.isArray(j)) return j;
    if (Array.isArray((j as any)?.userServices)) return (j as any).userServices;
    return [];
}

async function fetchUserServicesCount(): Promise<number> {
    const res = await fetch("/api/user_services/count", { cache: "no-store" });
    const j = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(j?.error ?? "Failed to load count");
    return Number(j?.count ?? 0);
}

export default function FootprintPage() {
    const svgRef = useRef<SVGSVGElement>(null);
    const [hoveredNode, setHoveredNode] = useState<ServiceNode | null>(null);
    const [zoomTransform, setZoomTransform] = useState<d3.ZoomTransform | null>(null);

    // 1) plan first
    const {
        data: plan,
        isPending: planPending,
        isError: planIsError,
        error: planError,
        refetch: refetchPlan,
    } = useQuery({
        queryKey: ["me", "subscription"],
        queryFn: fetchPlan,
        staleTime: 60_000,
    });

    const isPro = plan === "pro";

    // 2) count for everyone (safe)
    const {
        data: serviceCount = 0,
        isPending: countPending,
    } = useQuery({
        queryKey: ["user_services", "count"],
        queryFn: fetchUserServicesCount,
        staleTime: 60_000,
        enabled: !planPending && !planIsError, // don’t spam if plan is failing hard
    });

    // 3) full list ONLY for pro
    const {
        data: rows = [],
        isPending,
        isError,
        error,
        refetch,
    } = useQuery({
        queryKey: ["user_services", "all"],
        queryFn: fetchAllUserServices,
        staleTime: 60_000,
        enabled: Boolean(isPro), // 🔒 gate
    });

    const services: ServiceNode[] = useMemo(() => {
        return rows.map((r) => {
            const breached = Boolean(r.service?.is_breached);
            const emailCount = r.email_count ?? 0;

            const categoryLabel = r.service?.category ?? "Other";
            const categoryKey = categoryToKey(categoryLabel);

            return {
                id: r.id,
                name: r.service?.name ?? "Unknown",
                categoryKey,
                categoryLabel,
                breached,
                status: statusFromDeletionRequests(r.deletion_requests ?? null),
                risk: riskFromSignals(emailCount, breached),
            };
        });
    }, [rows]);

    useEffect(() => {
        if (!isPro) return; // 🔒 don’t render d3 graph for free
        if (!svgRef.current || isPending || services.length === 0) return;

        const width = 900;
        const height = 620;

        const svg = d3
            .select(svgRef.current)
            .attr("width", width)
            .attr("height", height)
            .attr("viewBox", [0, 0, width, height] as any);

        svg.selectAll("*").remove();

        const categoryColors: Record<CategoryKey, string> = {
            social: "#3b82f6",
            shopping: "#10b981",
            entertainment: "#8b5cf6",
            finance: "#f59e0b",
            health: "#ef4444",
            productivity: "#06b6d4",
            travel: "#22c55e",
            gaming: "#a855f7",
            news: "#f97316",
            communication: "#38bdf8",
            other: "#6b7280",
        };

        const riskColors: Record<ServiceNode["risk"], string> = {
            high: "#dc2626",
            medium: "#f59e0b",
            low: "#10b981",
        };

        type SimNode = ServiceNode & d3.SimulationNodeDatum;
        type SimLink = d3.SimulationLinkDatum<SimNode>;

        const nodes: SimNode[] = services.map((s) => ({
            ...s,
            x: width / 2 + (Math.random() - 0.5) * 250,
            y: height / 2 + (Math.random() - 0.5) * 250,
        }));

        const byCat = d3.group(nodes, (d) => d.categoryKey);
        const links: SimLink[] = [];
        byCat.forEach((group) => {
            for (let i = 0; i < group.length - 1; i++) {
                links.push({ source: group[i], target: group[i + 1] });
            }
        });

        const g = svg.append("g");

        const defs = svg.append("defs");
        const filter = defs.append("filter").attr("id", "glow");
        filter.append("feGaussianBlur").attr("stdDeviation", "3.5").attr("result", "coloredBlur");
        const feMerge = filter.append("feMerge");
        feMerge.append("feMergeNode").attr("in", "coloredBlur");
        feMerge.append("feMergeNode").attr("in", "SourceGraphic");

        const simulation = d3
            .forceSimulation(nodes)
            .force(
                "link",
                d3
                    .forceLink<SimNode, SimLink>(links)
                    .id((d) => d.id)
                    .distance(90)
                    .strength(0.25)
            )
            .force("charge", d3.forceManyBody().strength(-320))
            .force("center", d3.forceCenter(width / 2, height / 2))
            .force("collision", d3.forceCollide().radius(36));

        const link = g
            .append("g")
            .attr("stroke", "#374151")
            .attr("stroke-opacity", 0.28)
            .selectAll<SVGLineElement, SimLink>("line")
            .data(links)
            .join("line")
            .attr("stroke-width", 1);

        const node = g
            .append("g")
            .selectAll<SVGGElement, SimNode>("g")
            .data(nodes)
            .join("g")
            .style("cursor", "pointer")
            .call(
                d3
                    .drag<SVGGElement, SimNode>()
                    .on("start", (event, d) => {
                        if (!event.active) simulation.alphaTarget(0.25).restart();
                        d.fx = d.x;
                        d.fy = d.y;
                    })
                    .on("drag", (event, d) => {
                        d.fx = event.x;
                        d.fy = event.y;
                    })
                    .on("end", (event, d) => {
                        if (!event.active) simulation.alphaTarget(0);
                        d.fx = null;
                        d.fy = null;
                    })
            );

        node
            .append("circle")
            .attr("r", 25)
            .attr("fill", (d) => categoryColors[d.categoryKey] ?? categoryColors.other)
            .attr("opacity", 0.18);

        node
            .append("circle")
            .attr("class", "inner")
            .attr("r", 18)
            .attr("fill", (d) => riskColors[d.risk])
            .attr("stroke", (d) => (d.breached ? "#fecaca" : "#ffffff"))
            .attr("stroke-width", (d) => (d.breached ? 3 : 2))
            .attr("filter", (d) => (d.breached ? "url(#glow)" : "none"))
            .attr("opacity", (d) => (d.status === "deleted" ? 0.28 : 1));

        node
            .filter((d) => d.status === "pending")
            .append("circle")
            .attr("r", 5)
            .attr("fill", "#fbbf24")
            .attr("cx", 12)
            .attr("cy", -12);

        node
            .append("text")
            .text((d) => (d.name.length > 10 ? d.name.slice(0, 10) + "…" : d.name))
            .attr("font-size", "9px")
            .attr("text-anchor", "middle")
            .attr("dy", 36)
            .attr("fill", "#9ca3af")
            .attr("pointer-events", "none");

        node
            .on("mouseenter", function (_event, d) {
                setHoveredNode(d);
                d3.select(this).select<SVGCircleElement>("circle.inner").attr("r", 22);
            })
            .on("mouseleave", function () {
                setHoveredNode(null);
                d3.select(this).select<SVGCircleElement>("circle.inner").attr("r", 18);
            });

        const zoom = d3
            .zoom<SVGSVGElement, unknown>()
            .scaleExtent([0.3, 3])
            .on("zoom", (event) => {
                g.attr("transform", event.transform);
                setZoomTransform(event.transform);
            });

        svg.call(zoom);

        svg.on("dblclick.zoom", () => {
            svg.transition().duration(750).call(zoom.transform, d3.zoomIdentity);
        });

        simulation.on("tick", () => {
            link
                .attr("x1", (d) => (d.source as SimNode).x!)
                .attr("y1", (d) => (d.source as SimNode).y!)
                .attr("x2", (d) => (d.target as SimNode).x!)
                .attr("y2", (d) => (d.target as SimNode).y!);

            node.attr("transform", (d) => `translate(${d.x},${d.y})`);
        });

        return () => {
            simulation.stop();
        };
    }, [isPro, services, isPending]);

    const headerCountLabel =
        planPending || countPending
            ? "Loading…"
            : `${serviceCount.toLocaleString()} services found`;

    return (
        <div className="p-4">
            <Card>
                <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <CardTitle>Digital Footprint Map</CardTitle>
                        <CardDescription>
                            {isPro
                                ? "Interactive visualization of your online presence"
                                : "Preview — upgrade to see your full footprint map"}
                        </CardDescription>
                    </div>
                    <div className="text-xs text-white/60">{headerCountLabel}</div>
                </CardHeader>

                <CardContent>
                    {/* Plan loading / error */}
                    {planPending ? (
                        <div className="flex items-center justify-center py-16">
                            <Spinner className="text-primary" />
                        </div>
                    ) : planIsError ? (
                        <div className="rounded-lg border border-white/10 bg-[#050505] p-4">
                            <div className="text-sm text-white">Couldn&apos;t load subscription</div>
                            <div className="mt-1 text-xs text-white/60">{(planError as any)?.message ?? "Unknown error"}</div>
                            <div className="mt-3 flex gap-2">
                                <Button size="sm" variant="outline" onClick={() => refetchPlan()}>
                                    Retry
                                </Button>
                            </div>
                        </div>
                    ) : !isPro ? (
                        // 🔒 FREE GATE VIEW
                        <div className="relative overflow-hidden rounded-xl border border-slate-800 bg-slate-950">
                            <div className="p-4 text-sm text-white">
                                <div className="font-semibold">This is a Pro feature</div>
                                <div className="mt-1 text-white/60">
                                    Free users can scan and see the <strong>number</strong> of accounts found, but not the map or the list.
                                </div>

                                <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                                    <Link href="/dashboard/billing?plan=monthly" className="inline-flex">
                                        <Button>Upgrade to Pro</Button>
                                    </Link>
                                    <Link href="/dashboard" className="inline-flex">
                                        <Button variant="outline">Back to dashboard</Button>
                                    </Link>
                                </div>
                            </div>

                            {/* blurred placeholder map */}
                            <div className="relative h-[420px] w-full border-t border-slate-800">
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(16,185,129,0.18),transparent_45%),radial-gradient(circle_at_70%_60%,rgba(59,130,246,0.16),transparent_45%)]" />
                                <div className="absolute inset-0 backdrop-blur-sm opacity-80" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="rounded-lg border border-slate-700 bg-slate-900/70 px-4 py-2 text-xs text-slate-200">
                                        Locked preview — upgrade to unlock your footprint map
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        // ✅ PRO VIEW (your original logic)
                        <>
                            {isPending ? (
                                <div className="flex items-center justify-center py-16">
                                    <Spinner className="text-primary" />
                                </div>
                            ) : isError ? (
                                <div className="rounded-lg border border-white/10 bg-[#050505] p-4">
                                    <div className="text-sm text-white">Couldn&apos;t load footprint</div>
                                    <div className="mt-1 text-xs text-white/60">{(error as any)?.message ?? "Unknown error"}</div>
                                    <div className="mt-3">
                                        <Button size="sm" variant="outline" onClick={() => refetch()}>
                                            Retry
                                        </Button>
                                    </div>
                                </div>
                            ) : services.length === 0 ? (
                                <div className="text-sm text-white/60 text-center py-16">
                                    No services found yet. Connect Gmail and run a scan.
                                </div>
                            ) : (
                                <div className="relative">
                                    <svg
                                        ref={svgRef}
                                        className="w-full h-auto bg-slate-950 rounded-lg border border-slate-800"
                                        style={{ maxHeight: "620px" }}
                                    />

                                    {zoomTransform && (
                                        <div className="absolute bottom-4 right-4 bg-slate-800/90 border border-slate-600 rounded-lg px-3 py-1.5 text-xs text-slate-300">
                                            Zoom: {Math.round(zoomTransform.k * 100)}%
                                        </div>
                                    )}

                                    {hoveredNode && (
                                        <div className="absolute top-4 right-4 bg-slate-900/95 backdrop-blur-sm border border-slate-700 rounded-lg p-4 shadow-xl w-[260px] z-10">
                                            <h4 className="font-semibold text-white truncate">{hoveredNode.name}</h4>
                                            <div className="mt-3 space-y-2 text-sm">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-slate-400">Category:</span>
                                                    <span className="text-white font-medium">{hoveredNode.categoryLabel}</span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-slate-400">Risk:</span>
                                                    <span
                                                        className={`font-semibold ${hoveredNode.risk === "high"
                                                                ? "text-red-400"
                                                                : hoveredNode.risk === "medium"
                                                                    ? "text-amber-400"
                                                                    : "text-green-400"
                                                            }`}
                                                    >
                                                        {hoveredNode.risk.toUpperCase()}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}