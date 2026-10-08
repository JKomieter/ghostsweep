"use client";

import * as React from "react";

type Service = { id: string; name: string; domain: string };
type Broker = { id: string; name: string };

// Mock data
const MOCK_SERVICES: Service[] = [
    { id: "1", name: "Gmail", domain: "gmail.com" },
    { id: "2", name: "LinkedIn", domain: "linkedin.com" },
    { id: "3", name: "Spotify", domain: "spotify.com" },
    { id: "4", name: "Airbnb", domain: "airbnb.com" },
    { id: "5", name: "Amazon", domain: "amazon.com" },
    { id: "6", name: "Netflix", domain: "netflix.com" },
    { id: "7", name: "Twitter/X", domain: "x.com" },
    { id: "8", name: "Instagram", domain: "instagram.com" },
];

const MOCK_BROKERS: Broker[] = [
    { id: "b1", name: "Experian" },
    { id: "b2", name: "Equifax" },
    { id: "b3", name: "TransUnion" },
    { id: "b4", name: "Oracle" },
    { id: "b5", name: "Acxiom" },
    { id: "b6", name: "Epsilon" },
    { id: "b7", name: "CoreLogic" },
    { id: "b8", name: "Infogroup" },
    { id: "b9", name: "Spokeo" },
    { id: "b10", name: "Whitepages" },
    { id: "b11", name: "MyLife" },
    { id: "b12", name: "PeopleFinders" },
];

type NodeType = "user" | "service" | "broker";
type Node = {
    id: string;
    label: string;
    sublabel?: string;
    x: number;
    y: number;
    r: number;
    type: NodeType;
    color: string;
    pulsePhase: number;
};

type Link = {
    from: string;
    to: string;
    kind: "user_service" | "service_broker";
    weight: number;
    color: string;
    alpha: number;
    dashed?: boolean;
};

function clamp(n: number, min: number, max: number) {
    return Math.max(min, Math.min(max, n));
}

function formatTooltip(node: Node) {
    if (node.type === "user") return { title: "You", desc: "Your email account" };
    if (node.type === "service") return { title: node.label, desc: node.sublabel || "Service" };
    return { title: node.label, desc: "Data broker" };
}

function seededRand(seed: number) {
    let t = seed + 0x6d2b79f5;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

function NetworkGraphPreview() {
    const containerRef = React.useRef<HTMLDivElement>(null);
    const canvasRef = React.useRef<HTMLCanvasElement>(null);

    const rafRef = React.useRef<number | null>(null);
    const timeRef = React.useRef(0);

    const nodesRef = React.useRef<Node[]>([]);
    const linksRef = React.useRef<Link[]>([]);

    const hoverIdRef = React.useRef<string | null>(null);
    const [hovered, setHovered] = React.useState<{
        id: string;
        x: number;
        y: number;
        title: string;
        desc: string;
    } | null>(null);

    // Build graph layout
    const buildGraph = React.useCallback((width: number, height: number) => {
        const cx = width / 2;
        const cy = height / 2;

        const ring1 = clamp(Math.min(width, height) * 0.28, 100, 160);
        const ring2 = clamp(Math.min(width, height) * 0.45, 180, 260);

        const userNode: Node = {
            id: "you",
            label: "YOU",
            x: cx,
            y: cy,
            r: 18,
            type: "user",
            color: "#00f2de",
            pulsePhase: 0,
        };

        const serviceNodes: Node[] = MOCK_SERVICES.map((s, i) => {
            const a = (i / MOCK_SERVICES.length) * Math.PI * 2 - Math.PI / 2;
            return {
                id: `svc:${s.id}`,
                label: s.name,
                sublabel: s.domain,
                x: cx + Math.cos(a) * ring1,
                y: cy + Math.sin(a) * ring1,
                r: 10,
                type: "service",
                color: "#a78bfa",
                pulsePhase: i * 0.3,
            };
        });

        const brokerNodes: Node[] = MOCK_BROKERS.map((b, i) => {
            const a = (i / MOCK_BROKERS.length) * Math.PI * 2 - Math.PI / 2;
            return {
                id: `brk:${b.id}`,
                label: b.name,
                x: cx + Math.cos(a) * ring2,
                y: cy + Math.sin(a) * ring2,
                r: 6,
                type: "broker",
                color: "#ef4444",
                pulsePhase: i * 0.25,
            };
        });

        const nodes = [userNode, ...serviceNodes, ...brokerNodes];
        nodesRef.current = nodes;

        // Links
        const links: Link[] = [];

        // User -> Services (solid cyan lines)
        for (const s of serviceNodes) {
            links.push({
                from: userNode.id,
                to: s.id,
                kind: "user_service",
                weight: 2,
                color: "#00f2de",
                alpha: 0.6,
                dashed: false,
            });
        }

        // Services -> Brokers (dashed red lines, 2-3 per service)
        for (let i = 0; i < serviceNodes.length; i++) {
            const svc = serviceNodes[i];
            const baseSeed = i * 1337 + 42;
            const count = 2 + Math.floor(seededRand(baseSeed) * 2);
            const used = new Set<number>();

            for (let k = 0; k < count; k++) {
                const r = seededRand(baseSeed + k + 99);
                const idx = Math.floor(r * brokerNodes.length);
                if (used.has(idx)) continue;
                used.add(idx);

                links.push({
                    from: svc.id,
                    to: brokerNodes[idx]!.id,
                    kind: "service_broker",
                    weight: 1.5,
                    color: "#ef4444",
                    alpha: 0.3,
                    dashed: true,
                });
            }
        }

        linksRef.current = links;
    }, []);

    // Canvas setup
    React.useEffect(() => {
        const el = containerRef.current;
        const canvas = canvasRef.current;
        if (!el || !canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const resize = () => {
            const rect = el.getBoundingClientRect();
            const dpr = window.devicePixelRatio || 1;

            canvas.width = Math.max(1, Math.floor(rect.width * dpr));
            canvas.height = Math.max(1, Math.floor(rect.height * dpr));

            canvas.style.width = `${rect.width}px`;
            canvas.style.height = `${rect.height}px`;

            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            buildGraph(rect.width, rect.height);
        };

        resize();
        const ro = new ResizeObserver(resize);
        ro.observe(el);

        return () => ro.disconnect();
    }, [buildGraph]);

    // Draw loop
    React.useEffect(() => {
        const canvas = canvasRef.current;
        const el = containerRef.current;
        if (!canvas || !el) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const getNode = (id: string) => nodesRef.current.find((n) => n.id === id);

        const drawNode = (n: Node, t: number, hoveredId: string | null) => {
            const isHovered = hoveredId === n.id;
            const hoverScale = isHovered ? 1.4 : 1;
            const pulse = Math.sin(t * 1.5 + n.pulsePhase) * 0.08 + 1;
            const r = n.r * pulse * hoverScale;

            // Glow effect
            if (isHovered) {
                const g = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, r * 3);
                g.addColorStop(0, `${n.color}40`);
                g.addColorStop(0.5, `${n.color}15`);
                g.addColorStop(1, `${n.color}00`);
                ctx.beginPath();
                ctx.arc(n.x, n.y, r * 3, 0, Math.PI * 2);
                ctx.fillStyle = g;
                ctx.fill();
            }

            // Node circle
            ctx.beginPath();
            ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
            ctx.fillStyle = n.color;
            ctx.shadowColor = n.color;
            ctx.shadowBlur = isHovered ? 20 : 12;
            ctx.fill();
            ctx.shadowBlur = 0;

            // Border
            ctx.lineWidth = 2;
            ctx.strokeStyle = "rgba(255,255,255,0.2)";
            ctx.stroke();

            // Label
            if (n.type === "user" || n.type === "service") {
                ctx.save();
                ctx.fillStyle = "#ffffff";
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.font = n.type === "user" ? "700 11px Inter, system-ui" : "600 9px Inter, system-ui";
                ctx.shadowColor = "rgba(0,0,0,0.8)";
                ctx.shadowBlur = 8;
                const text = n.type === "user" ? n.label : n.label.split(" ")[0]!;
                ctx.fillText(text, n.x, n.y);
                ctx.restore();
            }
        };

        const drawLink = (from: Node, to: Node, link: Link, hoveredId: string | null) => {
            const isHighlighted = hoveredId === from.id || hoveredId === to.id;
            const alpha = isHighlighted ? Math.min(1, link.alpha + 0.3) : link.alpha;

            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.strokeStyle = link.color;
            ctx.lineWidth = link.weight;

            // Dashed for broker connections
            if (link.dashed) {
                ctx.setLineDash([6, 4]);
            }

            ctx.beginPath();
            ctx.moveTo(from.x, from.y);
            ctx.lineTo(to.x, to.y);
            ctx.stroke();

            ctx.setLineDash([]);
            ctx.restore();
        };

        const tick = () => {
            const rect = el.getBoundingClientRect();
            const width = rect.width;
            const height = rect.height;

            timeRef.current += 0.016;
            const t = timeRef.current;

            // Clear with dark gradient background
            const bg = ctx.createLinearGradient(0, 0, 0, height);
            bg.addColorStop(0, "#0a0a0a");
            bg.addColorStop(1, "#050505");
            ctx.fillStyle = bg;
            ctx.fillRect(0, 0, width, height);

            const hoveredId = hoverIdRef.current;

            // Draw links
            for (const l of linksRef.current) {
                const from = getNode(l.from);
                const to = getNode(l.to);
                if (!from || !to) continue;
                drawLink(from, to, l, hoveredId);
            }

            // Draw nodes (brokers, then services, then user on top)
            const nodes = nodesRef.current;
            const brokers = nodes.filter((n) => n.type === "broker");
            const services = nodes.filter((n) => n.type === "service");
            const user = nodes.find((n) => n.type === "user");

            for (const b of brokers) drawNode(b, t, hoveredId);
            for (const s of services) drawNode(s, t, hoveredId);
            if (user) drawNode(user, t, hoveredId);

            rafRef.current = requestAnimationFrame(tick);
        };

        rafRef.current = requestAnimationFrame(tick);
        return () => {
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
        };
    }, []);

    // Hover detection
    React.useEffect(() => {
        const canvas = canvasRef.current;
        const el = containerRef.current;
        if (!canvas || !el) return;

        const onMove = (e: MouseEvent) => {
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const nodes = nodesRef.current;
            let hit: Node | null = null;

            const ordered = [...nodes].sort((a, b) => b.r - a.r);
            for (const n of ordered) {
                const dx = x - n.x;
                const dy = y - n.y;
                const d = Math.sqrt(dx * dx + dy * dy);
                const hitRadius = n.r * 2.5;
                if (d <= hitRadius) {
                    hit = n;
                    break;
                }
            }

            if (hit) {
                hoverIdRef.current = hit.id;
                canvas.style.cursor = "pointer";
                const tip = formatTooltip(hit);
                setHovered({
                    id: hit.id,
                    x: clamp(x, 80, rect.width - 80),
                    y: clamp(y - 60, 20, rect.height - 20),
                    title: tip.title,
                    desc: tip.desc,
                });
            } else {
                hoverIdRef.current = null;
                canvas.style.cursor = "default";
                setHovered(null);
            }
        };

        const onLeave = () => {
            hoverIdRef.current = null;
            setHovered(null);
        };

        canvas.addEventListener("mousemove", onMove);
        canvas.addEventListener("mouseleave", onLeave);

        return () => {
            canvas.removeEventListener("mousemove", onMove);
            canvas.removeEventListener("mouseleave", onLeave);
        };
    }, []);

    return (
        <div className="relative w-full">
            <div className="rounded-2xl border border-foreground/5 bg-gradient-to-b from-card to-background overflow-hidden shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between gap-4 px-6 py-4 border-b border-foreground/5 bg-background/40 backdrop-blur-xl">
                    <div className="min-w-0">
                        <div className="text-base font-semibold text-foreground flex items-center gap-2">
                            <span className="text-cyan-600 dark:text-cyan-400">⚡</span>
                            Digital Shadow Map
                        </div>
                        <div className="text-xs text-foreground/50 mt-0.5">
                            Your data flow: You → Services → Data Brokers
                        </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs">
                        <LegendItem color="bg-cyan-400" label="You" />
                        <LegendItem color="bg-purple-400" label="Services" />
                        <LegendItem color="bg-red-500" label="Brokers" />
                    </div>
                </div>

                {/* Canvas */}
                <div ref={containerRef} className="relative h-[400px] sm:h-[500px]">
                    <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

                    {/* Tooltip */}
                    {hovered && (
                        <div
                            className="absolute z-50 pointer-events-none"
                            style={{ left: hovered.x, top: hovered.y }}
                        >
                            <div className="bg-background/90 backdrop-blur-xl border border-foreground/10 rounded-xl px-4 py-3 shadow-2xl">
                                <div className="text-sm font-semibold text-foreground">{hovered.title}</div>
                                <div className="text-xs text-foreground/60 mt-1">{hovered.desc}</div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-3 border-t border-foreground/5 bg-background/20 backdrop-blur">
                    <div className="flex items-center justify-between text-xs">
                        <div className="text-foreground/50">
                            <span className="text-cyan-600 dark:text-cyan-400 font-medium">{MOCK_SERVICES.length} services</span>
                            {" • "}
                            <span className="text-red-600 dark:text-red-400 font-medium">{MOCK_BROKERS.length} brokers</span>
                        </div>
                        <div className="text-foreground/65">
                            Hover nodes to see details
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function LegendItem({ color, label }: { color: string; label: string }) {
    return (
        <div className="flex items-center gap-2">
            <div className={`h-2.5 w-2.5 rounded-full ${color} shadow-lg`} />
            <span className="text-foreground/70 text-xs font-medium hidden sm:inline">{label}</span>
        </div>
    );
}

export function DigitalShadowSection() {
    return (
        <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-foreground">Your Digital Shadow</h2>
                <p className="text-sm text-foreground/60 mt-2 max-w-2xl">
                    See how your online accounts connect to data brokers. Each line represents a potential data flow.
                </p>
            </div>

            <NetworkGraphPreview />
        </section>
    );
}
