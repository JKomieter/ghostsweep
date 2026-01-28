/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import * as d3 from "d3";
import Link from "next/link";
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
import { DeletionRequest, Service } from "@/types";

type ApiUserService = {
    id: string;
    user_id: string;
    service_id: string;
    email_count: number | null;
    first_seen_at: string | null;
    last_seen_at: string | null;
    deletion_request: Pick<
        DeletionRequest,
        "id" | "status" | "sent_at" | "updated_at"
    > | null;
    service: Pick<
        Service,
        "id" | "name" | "domain" | "category" | "logo_url" | "is_breached"
    > | null;
};

type AllUserServicesResponse = {
    userServices: ApiUserService[];
    total: number;
    gated?: boolean;
    limit?: number | null;
};

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

const FREE_VISIBLE_LIMIT = 10;

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

function statusFromDeletionRequests(
    req?: ApiUserService["deletion_request"],
): ServiceNode["status"] {
    const s = req?.status;
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

/**
 * IMPORTANT:
 * This endpoint should return ONLY the first 10 services for Free users,
 * and the full list for Pro users. It should still return `total` and `gated`.
 */
async function fetchUserServicesForFootprint(): Promise<AllUserServicesResponse> {
    const res = await fetch("/api/user_services/all", { cache: "no-store" });
    const j = (await res.json().catch(() => ({}))) as AllUserServicesResponse;

    if (!res.ok) {
        const msg =
            typeof (j as any)?.error === "string"
                ? (j as any).error
                : "Failed to load user services";
        throw new Error(msg);
    }
    return j;
}

export default function FootprintPage() {
    const svgRef = useRef<SVGSVGElement>(null);
    const [hoveredNode, setHoveredNode] = useState<ServiceNode | null>(null);
    const [zoomTransform, setZoomTransform] = useState<d3.ZoomTransform | null>(null);

    const { data, isPending, isError, error, refetch } = useQuery({
        queryKey: ["user_services", "footprint"],
        queryFn: fetchUserServicesForFootprint,
        staleTime: 60_000,
    });

    const returnedCount = data?.userServices?.length ?? 0;
    const totalCount = data?.total ?? returnedCount;

    // Prefer backend truth if provided, else infer
    const isGated =
        Boolean(data?.gated) ||
        (totalCount > returnedCount && returnedCount <= (data?.limit ?? FREE_VISIBLE_LIMIT));

    const visibleLimit = (data?.limit ?? FREE_VISIBLE_LIMIT) || FREE_VISIBLE_LIMIT;

    const services = useMemo(() => {
        if (!data?.userServices) return [];
        return data.userServices.map((r) => {
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
                status: statusFromDeletionRequests(r?.deletion_request ?? null),
                risk: riskFromSignals(emailCount, breached),
            };
        });
    }, [data]);

    useEffect(() => {
        if (!svgRef.current || isPending || !services || services.length === 0) return;

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
                    .strength(0.25),
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
                    }),
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
    }, [services, isPending]);

    const headerCountLabel = isGated
        ? `${returnedCount.toLocaleString()} shown • ${totalCount.toLocaleString()} total`
        : `${totalCount.toLocaleString()} services found`;

    return (
        <div className="p-4 md:p-8 min-h-[calc(100vh-3.5rem)]">
            <div className="max-w-7xl mx-auto space-y-8">
                <div className="space-y-2">
                    <h1 className="text-3xl font-light tracking-tight text-white">Digital Footprint Map</h1>
                    <p className="text-sm text-white/60">Interactive visualization of your online presence across {headerCountLabel.split(" ")[0]} services</p>
                </div>

                <div className="rounded-lg border border-white/5 bg-white/2 overflow-hidden">
                <div className="p-6">
                    {/* Upgrade indicator (top) */}
                    {!isPending && !isError && isGated ? (
                        <div className="mb-4 rounded-xl border border-white/10 bg-black/40 p-3">
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                <div className="text-xs text-white/70">
                                    You’re seeing <strong className="text-white">{returnedCount}</strong> of{" "}
                                    <strong className="text-white">{totalCount.toLocaleString()}</strong> services.
                                    <span className="text-white/60"> Upgrade to visualize your full footprint.</span>
                                </div>

                                <div className="flex gap-2">
                                    <Link href="/dashboard/billing">
                                        <Button size="sm" className="bg-white text-black hover:bg-zinc-100">
                                            Upgrade to Pro
                                        </Button>
                                    </Link>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="border-white/15"
                                        onClick={() => refetch()}
                                    >
                                        Refresh
                                    </Button>
                                </div>
                            </div>
                            <div className="mt-2 text-[11px] text-white/50">
                                Pro also unlocks breach monitoring, deletion tracking, and follow-ups.
                            </div>
                        </div>
                    ) : null}

                    {isPending ? (
                        <div className="flex items-center justify-center py-24">
                            <Spinner className="text-white" />
                        </div>
                    ) : isError ? (
                        <div className="text-center py-16">
                            <div className="text-sm font-light text-white mb-2">Unable to load footprint</div>
                            <div className="text-xs text-white/60 mb-4">
                                {(error as any)?.message ?? "Please try again"}
                            </div>
                            <Button size="sm" variant="ghost" className="border border-white/5 bg-white/2 hover:border-white/10 hover:bg-white/3" onClick={() => refetch()}>
                                Retry
                            </Button>
                        </div>
                    ) : !services || services.length === 0 ? (
                        <div className="text-sm text-white/60 text-center py-16">
                            No services found yet. Connect Gmail and run a scan to get started.
                        </div>
                    ) : (
                        <>
                            {/* Instructions - Minimal */}
                            <div className="mb-6 p-4 bg-white/2 border border-white/5 rounded-lg text-xs text-white/60">
                                <p className="text-[11px] uppercase tracking-widest text-white/40 mb-3">How to use</p>
                                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                                    <div><span className="text-white/80">Scroll</span> to zoom</div>
                                    <div><span className="text-white/80">Drag</span> to pan</div>
                                    <div><span className="text-white/80">Drag nodes</span> to move</div>
                                    <div><span className="text-white/80">Double-click</span> reset</div>
                                    <div><span className="text-white/80">Hover</span> details</div>
                                </div>
                            </div>

                            <div className="relative">
                                {/* Subtle gating overlay */}
                                {isGated ? (
                                    <div className="pointer-events-none absolute inset-0 z-10">
                                        <div className="absolute inset-0 rounded-lg bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-lg border border-white/5 bg-black/80 px-4 py-2 text-[11px] text-white/60 backdrop-blur">
                                            Showing first {visibleLimit} services — upgrade to see all
                                        </div>
                                    </div>
                                ) : null}

                                <svg
                                    ref={svgRef}
                                    className="w-full h-auto bg-gradient-to-br from-black via-black to-black/80 rounded-lg border border-white/5"
                                    style={{ maxHeight: "620px" }}
                                />

                                {/* Zoom Controls - Minimal */}
                                <div className="absolute bottom-4 left-4 flex flex-col gap-1.5">
                                    <button
                                        onClick={() => {
                                            if (!svgRef.current) return;
                                            const svg = d3.select(svgRef.current);
                                            svg.transition().duration(300).call(
                                                (d3.zoom<SVGSVGElement, unknown>().scaleBy as any),
                                                1.3,
                                            );
                                        }}
                                        className="w-9 h-9 bg-white/2 hover:bg-white/3 border border-white/5 hover:border-white/10 rounded-lg flex items-center justify-center text-white/60 hover:text-white/80 transition-all backdrop-blur"
                                        title="Zoom In"
                                    >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                        </svg>
                                    </button>

                                    <button
                                        onClick={() => {
                                            if (!svgRef.current) return;
                                            const svg = d3.select(svgRef.current);
                                            svg.transition().duration(300).call(
                                                (d3.zoom<SVGSVGElement, unknown>().scaleBy as any),
                                                0.7,
                                            );
                                        }}
                                        className="w-9 h-9 bg-white/2 hover:bg-white/3 border border-white/5 hover:border-white/10 rounded-lg flex items-center justify-center text-white/60 hover:text-white/80 transition-all backdrop-blur"
                                        title="Zoom Out"
                                    >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                                        </svg>
                                    </button>

                                    <button
                                        onClick={() => {
                                            if (!svgRef.current) return;
                                            const svg = d3.select(svgRef.current);
                                            svg.transition().duration(750).call(
                                                (d3.zoom<SVGSVGElement, unknown>().transform as any),
                                                d3.zoomIdentity,
                                            );
                                        }}
                                        className="w-9 h-9 bg-white/2 hover:bg-white/3 border border-white/5 hover:border-white/10 rounded-lg flex items-center justify-center text-white/60 hover:text-white/80 transition-all backdrop-blur"
                                        title="Reset View"
                                    >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                                            />
                                        </svg>
                                    </button>
                                </div>

                                {/* Zoom Level - Minimal */}
                                {zoomTransform && (
                                    <div className="absolute bottom-4 right-4 bg-white/2 border border-white/5 rounded-lg px-3 py-1.5 text-xs text-white/60 backdrop-blur">
                                        {Math.round(zoomTransform.k * 100)}%
                                    </div>
                                )}

                                {/* Hover Tooltip - Cleaner */}
                                {hoveredNode && (
                                    <div className="absolute top-4 right-4 bg-black/95 backdrop-blur-md border border-white/5 rounded-lg p-4 shadow-2xl w-[260px] z-10">
                                        <h4 className="font-light text-white truncate text-sm">{hoveredNode.name}</h4>
                                        <div className="mt-3 space-y-2.5 text-xs">
                                            <div className="flex items-center justify-between">
                                                <span className="text-white/40">Category</span>
                                                <span className="text-white/80 font-light">{hoveredNode.categoryLabel}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-white/40">Risk</span>
                                                <span
                                                    className={`font-light ${hoveredNode.risk === "high"
                                                            ? "text-red-400"
                                                            : hoveredNode.risk === "medium"
                                                                ? "text-amber-400"
                                                                : "text-emerald-400"
                                                        }`}
                                                >
                                                    {hoveredNode.risk.toUpperCase()}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-white/40">Status</span>
                                                <span
                                                    className={`font-light ${hoveredNode.status === "deleted"
                                                            ? "text-white/40"
                                                            : hoveredNode.status === "pending"
                                                                ? "text-amber-400"
                                                                : "text-emerald-400"
                                                        }`}
                                                >
                                                    {hoveredNode.status.toUpperCase()}
                                                </span>
                                            </div>

                                            {hoveredNode.breached && (
                                                <div className="pt-2 border-t border-white/5 flex items-center gap-2 text-red-400">
                                                    <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                                        />
                                                    </svg>
                                                    <span className="text-xs font-light">Breach detected</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Legend - Minimal */}
                                <div className="mt-6 pt-4 border-t border-white/5">
                                    <div className="flex flex-wrap gap-x-6 gap-y-2.5 text-xs">
                                        <LegendDot label="High Risk" className="bg-red-500" />
                                        <LegendDot label="Medium Risk" className="bg-amber-500" />
                                        <LegendDot label="Low Risk" className="bg-emerald-500" />
                                        <LegendDot label="Breached" className="bg-red-500 ring-2 ring-red-400/40" />
                                        <LegendDot label="Pending" className="bg-amber-400" />
                                    </div>
                                </div>
                            </div>

                            {/* Bottom CTA */}
                            {isGated ? (
                                <div className="mt-6 rounded-lg border border-white/5 bg-white/2 p-4 text-xs text-white/60 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                    <div>
                                        <span className="text-white font-light">{returnedCount}</span> of <span className="text-white font-light">{totalCount.toLocaleString()}</span> services. Upgrade for the full map.
                                    </div>
                                    <Link href="/dashboard/billing">
                                        <Button size="sm" className="bg-white text-black hover:bg-white/90">
                                            Upgrade
                                        </Button>
                                    </Link>
                                </div>
                            ) : null}
                        </>
                    )}
                </div>
            </div>
            </div>
        </div>
    );
}

function LegendDot({ label, className }: { label: string; className: string }) {
    return (
        <div className="flex items-center gap-2">
            <div className={`w-1.5 h-1.5 rounded-full ${className}`} />
            <span className="text-white/40 text-xs">{label}</span>
        </div>
    );
}