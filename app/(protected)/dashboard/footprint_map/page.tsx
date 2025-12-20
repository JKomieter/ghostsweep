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

// ---- Types ----
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

type AllUserServicesResponse =
    | { userServices: ApiUserService[] }
    | ApiUserService[];

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

async function fetchAllUserServices(): Promise<ApiUserService[]> {
    const res = await fetch("/api/user_services/all", { cache: "no-store" });
    const j = (await res.json().catch(() => ({}))) as AllUserServicesResponse;

    if (!res.ok) {
        const msg =
            typeof (j as any)?.error === "string" ? (j as any).error : "Failed to load user services";
        throw new Error(msg);
    }

    if (Array.isArray(j)) return j;
    if (Array.isArray((j as any)?.userServices)) return (j as any).userServices;
    return [];
}

export default function FootprintPage() {
    const svgRef = useRef<SVGSVGElement>(null);
    const [hoveredNode, setHoveredNode] = useState<ServiceNode | null>(null);
    const [zoomTransform, setZoomTransform] = useState<d3.ZoomTransform | null>(null);

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

        // Zoom container
        const g = svg.append("g");

        // Glow filter for breached accounts
        const defs = svg.append("defs");
        const filter = defs.append("filter").attr("id", "glow");
        filter.append("feGaussianBlur").attr("stdDeviation", "3.5").attr("result", "coloredBlur");
        const feMerge = filter.append("feMerge");
        feMerge.append("feMergeNode").attr("in", "coloredBlur");
        feMerge.append("feMergeNode").attr("in", "SourceGraphic");

        // Force simulation
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

        // Draw links
        const link = g
            .append("g")
            .attr("stroke", "#374151")
            .attr("stroke-opacity", 0.28)
            .selectAll<SVGLineElement, SimLink>("line")
            .data(links)
            .join("line")
            .attr("stroke-width", 1);

        // Draw nodes
        const node = g
            .append("g")
            .selectAll<SVGGElement, SimNode>("g")
            .data(nodes)
            .join("g")
            .style("cursor", "pointer")
            .call(
                d3
                    .drag<SVGGElement, SimNode>()
                    .on("start", (event: d3.D3DragEvent<SVGGElement, SimNode, SimNode>, d: SimNode) => {
                        if (!event.active) simulation.alphaTarget(0.25).restart();
                        d.fx = d.x;
                        d.fy = d.y;
                    })
                    .on("drag", (event: d3.D3DragEvent<SVGGElement, SimNode, SimNode>, d: SimNode) => {
                        d.fx = event.x;
                        d.fy = event.y;
                    })
                    .on("end", (event: d3.D3DragEvent<SVGGElement, SimNode, SimNode>, d: SimNode) => {
                        if (!event.active) simulation.alphaTarget(0);
                        d.fx = null;
                        d.fy = null;
                    })
            );

        // Outer circle (category color)
        node
            .append("circle")
            .attr("r", 25)
            .attr("fill", (d) => categoryColors[d.categoryKey] ?? categoryColors.other)
            .attr("opacity", 0.18);

        // Inner circle (risk color)
        node
            .append("circle")
            .attr("class", "inner")
            .attr("r", 18)
            .attr("fill", (d) => riskColors[d.risk])
            .attr("stroke", (d) => (d.breached ? "#fecaca" : "#ffffff"))
            .attr("stroke-width", (d) => (d.breached ? 3 : 2))
            .attr("filter", (d) => (d.breached ? "url(#glow)" : "none"))
            .attr("opacity", (d) => (d.status === "deleted" ? 0.28 : 1));

        // Pending indicator (yellow dot)
        node
            .filter((d) => d.status === "pending")
            .append("circle")
            .attr("r", 5)
            .attr("fill", "#fbbf24")
            .attr("cx", 12)
            .attr("cy", -12);

        // Labels
        node
            .append("text")
            .text((d) => (d.name.length > 10 ? d.name.slice(0, 10) + "…" : d.name))
            .attr("font-size", "9px")
            .attr("text-anchor", "middle")
            .attr("dy", 36)
            .attr("fill", "#9ca3af")
            .attr("pointer-events", "none");

        // Hover effects
        node
            .on("mouseenter", function (_event, d) {
                setHoveredNode(d);
                d3.select(this).select<SVGCircleElement>("circle.inner").attr("r", 22);
            })
            .on("mouseleave", function () {
                setHoveredNode(null);
                d3.select(this).select<SVGCircleElement>("circle.inner").attr("r", 18);
            });

        // Zoom behavior
        const zoom = d3.zoom<SVGSVGElement, unknown>()
            .scaleExtent([0.3, 3])
            .on("zoom", (event) => {
                g.attr("transform", event.transform);
                setZoomTransform(event.transform);
            });

        svg.call(zoom);

        // Double-click to reset zoom
        svg.on("dblclick.zoom", () => {
            svg.transition()
                .duration(750)
                .call(zoom.transform, d3.zoomIdentity);
        });

        // Update positions on tick
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

    return (
        <div className="p-4">
            <Card>
                <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <CardTitle>Digital Footprint Map</CardTitle>
                        <CardDescription>Interactive visualization of your online presence</CardDescription>
                    </div>
                    <div className="text-xs text-white/60">
                        {isPending ? "Loading…" : `${services.length.toLocaleString()} services`}
                    </div>
                </CardHeader>

                <CardContent>
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
                        <>
                            {/* Instructions */}
                            <div className="mb-4 p-3 bg-slate-900/50 border border-slate-800 rounded-lg text-xs text-slate-400">
                                <div className="flex items-start gap-2">
                                    <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <div className="space-y-1">
                                        <p><strong>Controls:</strong></p>
                                        <ul className="space-y-0.5 ml-4 list-disc">
                                            <li>Scroll to zoom in/out</li>
                                            <li>Drag background to pan</li>
                                            <li>Drag nodes to reposition</li>
                                            <li>Double-click to reset view</li>
                                            <li>Hover nodes for details</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            <div className="relative">
                                <svg
                                    ref={svgRef}
                                    className="w-full h-auto bg-slate-950 rounded-lg border border-slate-800"
                                    style={{ maxHeight: "620px" }}
                                />

                                {/* Zoom Controls */}
                                <div className="absolute bottom-4 left-4 flex flex-col gap-2">
                                    <button
                                        onClick={() => {
                                            if (!svgRef.current) return;
                                            const svg = d3.select(svgRef.current);
                                            svg.transition().duration(300).call(
                                                d3.zoom<SVGSVGElement, unknown>().scaleBy as any,
                                                1.3
                                            );
                                        }}
                                        className="w-10 h-10 bg-slate-800/90 hover:bg-slate-700 border border-slate-600 rounded-lg flex items-center justify-center text-white transition-colors"
                                        title="Zoom In"
                                    >
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                        </svg>
                                    </button>

                                    <button
                                        onClick={() => {
                                            if (!svgRef.current) return;
                                            const svg = d3.select(svgRef.current);
                                            svg.transition().duration(300).call(
                                                d3.zoom<SVGSVGElement, unknown>().scaleBy as any,
                                                0.7
                                            );
                                        }}
                                        className="w-10 h-10 bg-slate-800/90 hover:bg-slate-700 border border-slate-600 rounded-lg flex items-center justify-center text-white transition-colors"
                                        title="Zoom Out"
                                    >
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                                        </svg>
                                    </button>

                                    <button
                                        onClick={() => {
                                            if (!svgRef.current) return;
                                            const svg = d3.select(svgRef.current);
                                            svg.transition().duration(750).call(
                                                d3.zoom<SVGSVGElement, unknown>().transform as any,
                                                d3.zoomIdentity
                                            );
                                        }}
                                        className="w-10 h-10 bg-slate-800/90 hover:bg-slate-700 border border-slate-600 rounded-lg flex items-center justify-center text-white transition-colors"
                                        title="Reset View"
                                    >
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                        </svg>
                                    </button>
                                </div>

                                {/* Zoom Level Indicator */}
                                {zoomTransform && (
                                    <div className="absolute bottom-4 right-4 bg-slate-800/90 border border-slate-600 rounded-lg px-3 py-1.5 text-xs text-slate-300">
                                        Zoom: {Math.round(zoomTransform.k * 100)}%
                                    </div>
                                )}

                                {/* Hover Tooltip */}
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

                                            <div className="flex items-center justify-between">
                                                <span className="text-slate-400">Status:</span>
                                                <span
                                                    className={`font-semibold ${hoveredNode.status === "deleted"
                                                            ? "text-slate-500"
                                                            : hoveredNode.status === "pending"
                                                                ? "text-amber-400"
                                                                : "text-green-400"
                                                        }`}
                                                >
                                                    {hoveredNode.status.toUpperCase()}
                                                </span>
                                            </div>

                                            {hoveredNode.breached && (
                                                <div className="pt-2 border-t border-slate-700">
                                                    <div className="flex items-center gap-2 text-red-400">
                                                        <svg
                                                            className="w-4 h-4"
                                                            fill="none"
                                                            viewBox="0 0 24 24"
                                                            stroke="currentColor"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth={2}
                                                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                                            />
                                                        </svg>
                                                        <span className="text-xs font-medium">Breach detected</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Legend */}
                                <div className="mt-6 pt-4 border-t border-slate-800">
                                    <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs">
                                        <LegendDot label="High Risk" className="bg-red-500" />
                                        <LegendDot label="Medium Risk" className="bg-amber-500" />
                                        <LegendDot label="Low Risk" className="bg-green-500" />
                                        <LegendDot label="Breached" className="bg-red-500 ring-2 ring-red-300/50" />
                                        <LegendDot label="Pending" className="bg-amber-400" />
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

function LegendDot({ label, className }: { label: string; className: string }) {
    return (
        <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${className}`} />
            <span className="text-slate-400">{label}</span>
        </div>
    );
}