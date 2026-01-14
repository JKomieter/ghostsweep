/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { BrokerOut, Confidence } from "../../digital_shadow/page";
import { confidenceColor, confidenceLabel } from "./helpers";
import { Badge } from "@/components/ui/badge";


// -------------------- D3 Network Graph (IMPROVED) --------------------
export default function NetworkGraph({
    services,
    brokers,
}: {
    services: Array<{ id: string; name: string; domain?: string | null; category?: string | null }>;
    brokers: BrokerOut[];
}) {
    const wrapRef = React.useRef<HTMLDivElement | null>(null);
    const svgRef = React.useRef<SVGSVGElement | null>(null);
    const [size, setSize] = React.useState({ w: 1000, h: 700 });

    React.useEffect(() => {
        if (!wrapRef.current) return;
        const ro = new ResizeObserver((entries) => {
            const cr = entries[0]?.contentRect;
            if (!cr) return;
            setSize({ w: Math.max(720, Math.floor(cr.width)), h: 700 });
        });
        ro.observe(wrapRef.current);
        return () => ro.disconnect();
    }, []);

    React.useEffect(() => {
        let cleanup: (() => void) | undefined;

        (async () => {
            if (!svgRef.current) return;

            const d3 = await import("d3");

            const svg = d3.select(svgRef.current);
            svg.selectAll("*").remove();

            const width = size.w;
            const height = size.h;

            svg.attr("viewBox", `0 0 ${width} ${height}`);

            // ----- Build nodes -----
            type Node = {
                id: string;
                kind: "user" | "service" | "broker";
                label: string;
                confidence?: Confidence;
                weight?: number;
                type?: string;
                category?: string | null;
            };
            type Link = {
                source: string;
                target: string;
                confidence: Confidence;
                w: number;
            };

            const userNode: Node = { id: "me", kind: "user", label: "YOU" };

            const serviceNodes: Node[] = services.map((s) => ({
                id: `svc:${s.id}`,
                kind: "service",
                label: s.name ?? s.domain ?? "Service",
                category: s.category,
            }));

            const brokerNodes: Node[] = brokers.map((b) => ({
                id: `brk:${b.id ?? b.name}`,
                kind: "broker",
                label: b.name,
                confidence: b.highestConfidence,
                weight: b.serviceCount,
                type: b.type,
            }));

            const links: Link[] = [];

            // user -> services
            for (const sn of serviceNodes) {
                links.push({ source: "me", target: sn.id, confidence: "possible", w: 1 });
            }

            // services -> brokers
            for (const b of brokers) {
                const brokerId = `brk:${b.id ?? b.name}`;
                for (const s of b.services ?? []) {
                    links.push({
                        source: `svc:${s.id}`,
                        target: brokerId,
                        confidence: s.confidence,
                        w: 1,
                    });
                }
            }

            const nodes: Node[] = [userNode, ...serviceNodes, ...brokerNodes];

            // ----- Initial positions -----
            const cx = width / 2;
            const cy = height / 2;
            const rService = Math.min(width, height) * 0.25;
            const rBroker = Math.min(width, height) * 0.42;

            // @ts-expect-error d3 mutations
            userNode.x = cx;
            // @ts-expect-error
            userNode.y = cy;

            serviceNodes.forEach((n, i) => {
                const a = (i / Math.max(serviceNodes.length, 1)) * Math.PI * 2;
                // @ts-expect-error
                n.x = cx + rService * Math.cos(a);
                // @ts-expect-error
                n.y = cy + rService * Math.sin(a);
            });

            brokerNodes.forEach((n, i) => {
                const a = (i / Math.max(brokerNodes.length, 1)) * Math.PI * 2;
                // @ts-expect-error
                n.x = cx + rBroker * Math.cos(a);
                // @ts-expect-error
                n.y = cy + rBroker * Math.sin(a);
            });

            // ----- Defs -----
            const defs = svg.append("defs");

            const userGrad = defs.append("radialGradient").attr("id", "userGrad");
            userGrad.append("stop").attr("offset", "0%").attr("stop-color", "#22c55e");
            userGrad.append("stop").attr("offset", "100%").attr("stop-color", "#16a34a");

            const glow = defs.append("filter").attr("id", "glow").attr("height", "300%").attr("width", "300%").attr("x", "-100%").attr("y", "-100%");
            glow.append("feGaussianBlur").attr("stdDeviation", "4").attr("result", "coloredBlur");
            const feMerge = glow.append("feMerge");
            feMerge.append("feMergeNode").attr("in", "coloredBlur");
            feMerge.append("feMergeNode").attr("in", "SourceGraphic");

            // ----- Background rings -----
            const bg = svg.append("g").attr("opacity", 0.3);

            bg.append("circle")
                .attr("cx", cx)
                .attr("cy", cy)
                .attr("r", rBroker + 50)
                .attr("fill", "none")
                .attr("stroke", "rgba(255,255,255,0.05)")
                .attr("stroke-width", 1)
                .attr("stroke-dasharray", "8,8");

            bg.append("circle")
                .attr("cx", cx)
                .attr("cy", cy)
                .attr("r", rService + 30)
                .attr("fill", "none")
                .attr("stroke", "rgba(34,197,94,0.15)")
                .attr("stroke-width", 2)
                .attr("stroke-dasharray", "12,8");

            bg.append("circle")
                .attr("cx", cx)
                .attr("cy", cy)
                .attr("r", 50)
                .attr("fill", "rgba(34,197,94,0.08)")
                .attr("stroke", "rgba(34,197,94,0.3)")
                .attr("stroke-width", 2);

            // Ring labels
            svg.append("text")
                .attr("x", cx)
                .attr("y", cy - rService - 40)
                .attr("text-anchor", "middle")
                .attr("fill", "rgba(255,255,255,0.3)")
                .attr("font-size", 10)
                .attr("font-weight", 600)
                .attr("letter-spacing", 1)
                .text("YOUR ACCOUNTS");

            svg.append("text")
                .attr("x", cx)
                .attr("y", cy - rBroker - 60)
                .attr("text-anchor", "middle")
                .attr("fill", "rgba(255,255,255,0.3)")
                .attr("font-size", 10)
                .attr("font-weight", 600)
                .attr("letter-spacing", 1)
                .text("DATA BROKERS");

            // ----- Simulation -----
            const sim = d3
                .forceSimulation(nodes as any)
                .force("charge", d3.forceManyBody().strength(-200).distanceMax(300))
                .force("center", d3.forceCenter(cx, cy).strength(0.05))
                .force(
                    "link",
                    d3
                        .forceLink(links as any)
                        .id((d: any) => d.id)
                        .distance((l: any) => {
                            if (l.source.id === "me" || l.target.id === "me") return rService * 0.95;
                            return rBroker * 0.6;
                        })
                        .strength(0.6)
                )
                .force(
                    "collide",
                    d3.forceCollide().radius((d: any) => {
                        if (d.kind === "user") return 40;
                        if (d.kind === "service") return 22;
                        return 20 + Math.min(20, (d.weight ?? 1) * 0.9);
                    }).strength(0.8)
                )
                .force("radial", d3.forceRadial(
                    (d: any) => {
                        if (d.kind === "service") return rService;
                        if (d.kind === "broker") return rBroker;
                        return 0;
                    },
                    cx,
                    cy
                ).strength((d: any) => d.kind === "user" ? 0 : 0.7));

            // ----- Links -----
            const linkG = svg.append("g");

            const linkSel = linkG
                .selectAll("line")
                .data(links as any)
                .join("line")
                .attr("stroke", (l: any) => {
                    if (l.source === "me" || l.target === "me") return "rgba(34,197,94,0.15)";
                    return confidenceColor(l.confidence);
                })
                .attr("stroke-opacity", 0.4)
                .attr("stroke-width", (l: any) => {
                    if (l.source === "me" || l.target === "me") return 1.5;
                    return 2 + Math.min(4, l.w);
                })
                .attr("stroke-linecap", "round");

            // ----- Nodes -----
            const nodeG = svg.append("g")
                .selectAll("g")
                .data(nodes as any)
                .join("g")
                .style("cursor", "grab");

            nodeG
                .append("circle")
                .attr("class", "node-circle")
                .attr("r", (d: any) => {
                    if (d.kind === "user") return 32;
                    if (d.kind === "service") return 16;
                    return 14 + Math.min(16, (d.weight ?? 1) * 0.8);
                })
                .attr("fill", (d: any) => {
                    if (d.kind === "user") return "url(#userGrad)";
                    if (d.kind === "service") return "rgba(255,255,255,0.08)";

                    if (d.type === "government") return "rgba(239,68,68,0.6)";
                    if (d.type === "ad_network") return "rgba(251,146,60,0.6)";
                    if (d.type === "broker") return "rgba(139,92,246,0.6)";
                    return "rgba(148,163,184,0.6)";
                })
                .attr("stroke", (d: any) => {
                    if (d.kind === "user") return "rgba(34,197,94,0.8)";
                    if (d.kind === "service") return "rgba(255,255,255,0.2)";
                    return confidenceColor(d.confidence ?? "possible");
                })
                .attr("stroke-width", (d: any) => {
                    if (d.kind === "user") return 3;
                    if (d.kind === "broker") return 2.5;
                    return 1.5;
                })
                .attr("filter", (d: any) => d.kind === "user" ? "url(#glow)" : null);

            nodeG
                .filter((d: any) => d.kind === "user")
                .append("circle")
                .attr("r", 20)
                .attr("fill", "rgba(0,0,0,0.3)");

            nodeG
                .filter((d: any) => d.kind === "user")
                .append("text")
                .attr("text-anchor", "middle")
                .attr("dy", 6)
                .attr("font-size", 20)
                .attr("fill", "#fff")
                .text("👤");

            // Count badges
            nodeG
                .filter((d: any) => d.kind === "broker" && d.weight && d.weight > 10)
                .append("circle")
                .attr("cx", (d: any) => {
                    const r = 14 + Math.min(16, (d.weight ?? 1) * 0.8);
                    return r * 0.6;
                })
                .attr("cy", (d: any) => {
                    const r = 14 + Math.min(16, (d.weight ?? 1) * 0.8);
                    return -r * 0.6;
                })
                .attr("r", 11)
                .attr("fill", "#ef4444")
                .attr("stroke", "#000")
                .attr("stroke-width", 2);

            nodeG
                .filter((d: any) => d.kind === "broker" && d.weight && d.weight > 10)
                .append("text")
                .attr("x", (d: any) => {
                    const r = 14 + Math.min(16, (d.weight ?? 1) * 0.8);
                    return r * 0.6;
                })
                .attr("y", (d: any) => {
                    const r = 14 + Math.min(16, (d.weight ?? 1) * 0.8);
                    return -r * 0.6 + 4;
                })
                .attr("text-anchor", "middle")
                .attr("font-size", 9)
                .attr("font-weight", 700)
                .attr("fill", "#fff")
                .style("pointer-events", "none")
                .text((d: any) => d.weight);

            // Labels
            nodeG
                .append("text")
                .attr("class", "node-label")
                .text((d: any) => {
                    if (d.kind === "user") return "YOU";
                    const label = d.label || "";
                    return label.length > 18 ? label.slice(0, 15) + "..." : label;
                })
                .attr("text-anchor", "middle")
                .attr("dy", (d: any) => {
                    if (d.kind === "user") return 50;
                    if (d.kind === "service") return 30;
                    const r = 14 + Math.min(16, (d.weight ?? 1) * 0.8);
                    return r + 18;
                })
                .attr("fill", (d: any) => d.kind === "user" ? "#22c55e" : "rgba(255,255,255,0.7)")
                .attr("font-size", (d: any) => d.kind === "user" ? 13 : 11)
                .attr("font-weight", (d: any) => d.kind === "user" ? 700 : 600)
                .style("pointer-events", "none");

            // ----- Tooltip -----
            const tip = d3
                .select(wrapRef.current)
                .append("div")
                .style("position", "absolute")
                .style("pointer-events", "none")
                .style("opacity", "0")
                .style("transform", "translate(-9999px,-9999px)")
                .style("background", "rgba(5,5,9,0.98)")
                .style("border", "1px solid rgba(34,197,94,0.3)")
                .style("border-radius", "12px")
                .style("padding", "12px 14px")
                .style("color", "#fff")
                .style("font-size", "12px")
                .style("backdrop-filter", "blur(12px)")
                .style("box-shadow", "0 8px 32px rgba(0,0,0,0.6)")
                .style("max-width", "280px")
                .style("z-index", "1000");

            nodeG
                .on("mouseenter", function (event: any, d: any) {
                    linkSel
                        .attr("stroke-opacity", (l: any) => {
                            if (l.source.id === d.id || l.target.id === d.id) return 0.9;
                            return 0.15;
                        })
                        .attr("stroke-width", (l: any) => {
                            if (l.source.id === d.id || l.target.id === d.id) {
                                return (l.source === "me" || l.target === "me" ? 2.5 : 3.5) + Math.min(4, l.w);
                            }
                            return (l.source === "me" || l.target === "me" ? 1.5 : 2) + Math.min(4, l.w);
                        });

                    nodeG.style("opacity", (n: any) => {
                        if (n.id === d.id) return 1;
                        const isConnected = links.some((l: any) =>
                            (l.source.id === d.id && l.target.id === n.id) ||
                            (l.target.id === d.id && l.source.id === n.id)
                        );
                        return isConnected ? 1 : 0.3;
                    });

                    d3.select(this)
                        .select(".node-circle")
                        .transition()
                        .duration(200)
                        .attr("r", (d2: any) => {
                            if (d2.kind === "user") return 36;
                            if (d2.kind === "service") return 19;
                            return 17 + Math.min(18, (d2.weight ?? 1) * 0.8);
                        });
                })
                .on("mousemove", (event: any, d: any) => {
                    const [x, y] = d3.pointer(event, wrapRef.current);

                    let content = `<div style="font-weight:700;font-size:13px;margin-bottom:6px;color:#22c55e;">${escapeHtml(d.label)}</div>`;

                    if (d.kind === "broker") {
                        const typeBadge = d.type === "government" ? "🏛️ Government" :
                            d.type === "ad_network" ? "📱 Ad Network" :
                                d.type === "broker" ? "📊 Data Broker" : "Other";
                        content += `<div style="color:rgba(255,255,255,0.7);font-size:11px;margin-bottom:4px;">${typeBadge}</div>`;
                        content += `<div style="color:rgba(255,255,255,0.85);">Confidence: <span style="color:${confidenceColor(d.confidence ?? 'possible')};font-weight:600;">${confidenceLabel(d.confidence ?? "possible")}</span></div>`;
                        content += `<div style="color:rgba(255,255,255,0.85);">Tracking ${d.weight ?? 0} of your accounts</div>`;
                    } else if (d.kind === "service") {
                        content += `<div style="color:rgba(255,255,255,0.7);font-size:11px;">${d.category ?? "Service"}</div>`;
                        content += `<div style="color:rgba(255,255,255,0.85);margin-top:4px;">One of your connected accounts</div>`;
                    } else {
                        content += `<div style="color:rgba(255,255,255,0.85);">Center of your digital identity</div>`;
                    }

                    tip
                        .style("opacity", "1")
                        .style("transform", `translate(${x + 20}px,${y - 10}px)`)
                        .html(content);
                })
                .on("mouseleave", function () {
                    linkSel
                        .attr("stroke-opacity", 0.4)
                        .attr("stroke-width", (l: any) => {
                            if (l.source === "me" || l.target === "me") return 1.5;
                            return 2 + Math.min(4, l.w);
                        });

                    nodeG.style("opacity", 1);

                    d3.select(this)
                        .select(".node-circle")
                        .transition()
                        .duration(200)
                        .attr("r", (d: any) => {
                            if (d.kind === "user") return 32;
                            if (d.kind === "service") return 16;
                            return 14 + Math.min(16, (d.weight ?? 1) * 0.8);
                        });

                    tip.style("opacity", "0").style("transform", "translate(-9999px,-9999px)");
                });

            // ----- Drag -----
            const drag = d3
                .drag()
                .on("start", function (event: any, d: any) {
                    if (!event.active) sim.alphaTarget(0.3).restart();
                    d.fx = d.x;
                    d.fy = d.y;
                    d3.select(this).style("cursor", "grabbing");
                })
                .on("drag", (event: any, d: any) => {
                    d.fx = event.x;
                    d.fy = event.y;
                })
                .on("end", function (event: any, d: any) {
                    if (!event.active) sim.alphaTarget(0);
                    d.fx = null;
                    d.fy = null;
                    d3.select(this).style("cursor", "grab");
                });

            nodeG.call(drag as any);

            // ----- Tick -----
            sim.on("tick", () => {
                linkSel
                    .attr("x1", (l: any) => l.source.x)
                    .attr("y1", (l: any) => l.source.y)
                    .attr("x2", (l: any) => l.target.x)
                    .attr("y2", (l: any) => l.target.y);

                nodeG.attr("transform", (d: any) => `translate(${d.x},${d.y})`);
            });

            cleanup = () => {
                sim.stop();
                tip.remove();
            };
        })();

        return () => cleanup?.();
    }, [services, brokers, size.w, size.h]);

    return (
        <div ref={wrapRef} className="relative w-full bg-gradient-to-br from-black via-[#050509] to-black rounded-xl overflow-hidden" style={{ height: 700 }}>
            <svg ref={svgRef} className="w-full h-[700px] block" />

            {/* Legend */}
            <div className="absolute left-4 bottom-4 space-y-2 bg-black/60 backdrop-blur-md rounded-lg p-3 border border-white/10">
                <div className="text-xs font-semibold text-white/70 mb-2">Broker Types</div>
                <div className="flex items-center gap-2 text-xs text-white/60">
                    <div className="w-3 h-3 rounded-full bg-[rgba(239,68,68,0.6)] border-2 border-red-400"></div>
                    <span>Government</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-white/60">
                    <div className="w-3 h-3 rounded-full bg-[rgba(251,146,60,0.6)] border-2 border-orange-400"></div>
                    <span>Ad Networks</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-white/60">
                    <div className="w-3 h-3 rounded-full bg-[rgba(139,92,246,0.6)] border-2 border-purple-400"></div>
                    <span>Data Brokers</span>
                </div>
            </div>

            {/* Controls */}
            <div className="absolute right-4 bottom-4 flex flex-col gap-2">
                <Badge variant="outline" className="border-white/15 bg-black/60 text-white/70 backdrop-blur-md">
                    Hover for details
                </Badge>
                <Badge variant="outline" className="border-white/15 bg-black/60 text-white/70 backdrop-blur-md">
                    Drag to rearrange
                </Badge>
            </div>
        </div>
    );
}

function escapeHtml(s: string) {
    return s
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}
