"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
    ArrowRight,
    Search,
    Mail,
    TrendingUp,
    Sparkles,
} from "lucide-react";

function Badge({ children }: { children: React.ReactNode }) {
    return (
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/15 px-3.5 py-1.5 text-xs font-semibold text-emerald-300 backdrop-blur-sm">
            {children}
        </div>
    );
}

function FeatureItem({
    icon: Icon,
    title,
    description,
}: {
    icon: React.ReactNode;
    title: string;
    description: string;
}) {
    return (
        <div className="flex gap-3 sm:gap-4 group hover:bg-emerald-500/10 p-3 sm:p-4 rounded-lg transition-all duration-200">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-300 group-hover:bg-emerald-500/30 group-hover:scale-110 transition-all duration-200">
                {Icon}
            </div>
            <div>
                <h3 className="font-semibold text-white text-sm">{title}</h3>
                <p className="text-xs sm:text-sm text-white/60 mt-0.5">{description}</p>
            </div>
        </div>
    );
}

function StatCard({ value, label }: { value: string; label: string }) {
    return (
        <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 hover:bg-emerald-500/15 p-4 sm:p-5 text-center transition-all duration-200 group cursor-default">
            <div className="text-2xl sm:text-3xl font-bold text-emerald-300 group-hover:text-emerald-200 transition-colors">{value}</div>
            <div className="text-xs text-emerald-200/60 mt-2 font-medium">{label}</div>
        </div>
    );
}

// Mock data for network graph
const MOCK_SERVICES = [
    { id: "1", name: "Gmail", domain: "gmail.com" },
    { id: "2", name: "LinkedIn", domain: "linkedin.com" },
    { id: "3", name: "Spotify", domain: "spotify.com" },
    { id: "4", name: "Airbnb", domain: "airbnb.com" },
    { id: "5", name: "Amazon", domain: "amazon.com" },
    { id: "6", name: "Netflix", domain: "netflix.com" },
];

const MOCK_BROKERS = [
    { id: "b1", name: "Experian" },
    { id: "b2", name: "Equifax" },
    { id: "b3", name: "TransUnion" },
    { id: "b4", name: "Oracle" },
    { id: "b5", name: "Acxiom" },
    { id: "b6", name: "Epsilon" },
    { id: "b7", name: "CoreLogic" },
    { id: "b8", name: "Infogroup" },
];

function NetworkGraphPreview() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [hoveredNode, setHoveredNode] = useState<string | null>(null);
    const animationRef = useRef<number>(0);
    const particlesRef = useRef<Array<{
        x: number;
        y: number;
        vx: number;
        vy: number;
        opacity: number;
    }>>([]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();

        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx.scale(dpr, dpr);

        const width = rect.width;
        const height = rect.height;

        // Initialize particles
        if (particlesRef.current.length === 0) {
            for (let i = 0; i < 30; i++) {
                particlesRef.current.push({
                    x: Math.random() * width,
                    y: Math.random() * height,
                    vx: (Math.random() - 0.5) * 0.3,
                    vy: (Math.random() - 0.5) * 0.3,
                    opacity: Math.random() * 0.3 + 0.1,
                });
            }
        }

        // Create nodes with better positioning
        const centerX = width / 2;
        const centerY = height / 2;

        const userNode = {
            id: "you",
            label: "YOU",
            x: centerX,
            y: centerY,
            r: 16,
            type: "user",
            color: "#10b981",
            pulsePhase: 0,
        };

        const serviceNodes = MOCK_SERVICES.map((s, i) => {
            const angle = (i / MOCK_SERVICES.length) * Math.PI * 2 - Math.PI / 2;
            const radius = Math.min(width, height) * 0.25;
            return {
                id: `svc:${s.id}`,
                label: s.name,
                x: centerX + Math.cos(angle) * radius,
                y: centerY + Math.sin(angle) * radius,
                r: 8,
                type: "service",
                color: "#06b6d4",
                pulsePhase: i * 0.3,
            };
        });

        const brokerNodes = MOCK_BROKERS.map((b, i) => {
            const angle = (i / MOCK_BROKERS.length) * Math.PI * 2 - Math.PI / 2;
            const radius = Math.min(width, height) * 0.42;
            return {
                id: `brk:${b.id}`,
                label: b.name,
                x: centerX + Math.cos(angle) * radius,
                y: centerY + Math.sin(angle) * radius,
                r: 5,
                type: "broker",
                color: "#a78bfa",
                pulsePhase: i * 0.2,
            };
        });

        const allNodes = [userNode, ...serviceNodes, ...brokerNodes];
        let time = 0;

        function animate() {
            if (!ctx || !canvas) return;

            time += 0.02;

            // Clear with fade effect
            ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
            ctx.fillRect(0, 0, width, height);

            // Update and draw particles
            particlesRef.current.forEach((particle) => {
                particle.x += particle.vx;
                particle.y += particle.vy;

                if (particle.x < 0 || particle.x > width) particle.vx *= -1;
                if (particle.y < 0 || particle.y > height) particle.vy *= -1;

                ctx.beginPath();
                ctx.arc(particle.x, particle.y, 1, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 255, 255, ${particle.opacity})`;
                ctx.fill();
            });

            // Draw connections with animation
            const drawConnection = (from: typeof allNodes[0], to: typeof allNodes[0], color: string, opacity: number, animated: boolean = false) => {
                ctx.beginPath();
                ctx.moveTo(from.x, from.y);

                if (animated) {
                    // Animated flowing line
                    const segments = 20;
                    for (let i = 0; i <= segments; i++) {
                        const t = i / segments;
                        const x = from.x + (to.x - from.x) * t;
                        const y = from.y + (to.y - from.y) * t;

                        // Add wave effect
                        const wave = Math.sin(t * Math.PI * 4 + time * 3) * 2;
                        const perpX = -(to.y - from.y);
                        const perpY = (to.x - from.x);
                        const length = Math.sqrt(perpX * perpX + perpY * perpY);

                        ctx.lineTo(
                            x + (perpX / length) * wave,
                            y + (perpY / length) * wave
                        );
                    }
                } else {
                    ctx.lineTo(to.x, to.y);
                }

                // Gradient stroke
                const gradient = ctx.createLinearGradient(from.x, from.y, to.x, to.y);
                const flowPos = (time % 1);
                gradient.addColorStop(0, `${color}00`);
                gradient.addColorStop(flowPos, color);
                gradient.addColorStop(Math.min(1, flowPos + 0.3), `${color}80`);
                gradient.addColorStop(1, `${color}00`);

                ctx.strokeStyle = gradient;
                ctx.lineWidth = animated ? 2 : 1;
                ctx.globalAlpha = opacity;
                ctx.stroke();
                ctx.globalAlpha = 1;
            };

            // Draw user -> services connections (animated)
            serviceNodes.forEach((node) => {
                drawConnection(userNode, node, "#10b981", 0.6, true);
            });

            // Draw services -> brokers connections (static, subtle)
            serviceNodes.forEach((svc, i) => {
                // Each service connects to 2-3 random brokers
                const brokerCount = 2 + Math.floor(Math.random() * 2);
                for (let j = 0; j < brokerCount; j++) {
                    const brokerIndex = (i * 3 + j) % brokerNodes.length;
                    drawConnection(svc, brokerNodes[brokerIndex], "#06b6d4", 0.15);
                }
            });

            // Draw nodes with glow and pulse
            allNodes.forEach((node) => {
                const pulse = Math.sin(time * 2 + node.pulsePhase) * 0.3 + 1;
                const radius = node.r * (hoveredNode === node.id ? 1.8 : pulse);

                // Outer glow
                const gradient = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, radius * 2);
                gradient.addColorStop(0, `${node.color}40`);
                gradient.addColorStop(0.5, `${node.color}20`);
                gradient.addColorStop(1, `${node.color}00`);

                ctx.beginPath();
                ctx.arc(node.x, node.y, radius * 2, 0, Math.PI * 2);
                ctx.fillStyle = gradient;
                ctx.fill();

                // Main circle
                ctx.beginPath();
                ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
                ctx.fillStyle = node.color;
                ctx.fill();

                // Inner highlight
                const highlight = ctx.createRadialGradient(
                    node.x - radius * 0.3,
                    node.y - radius * 0.3,
                    0,
                    node.x,
                    node.y,
                    radius
                );
                highlight.addColorStop(0, "rgba(255, 255, 255, 0.4)");
                highlight.addColorStop(1, "rgba(255, 255, 255, 0)");
                ctx.fillStyle = highlight;
                ctx.fill();

                // Label for user and services
                if (node.type === "user" || node.type === "service") {
                    ctx.fillStyle = "white";
                    ctx.font = `${node.type === "user" ? "bold 11px" : "600 8px"} system-ui`;
                    ctx.textAlign = "center";
                    ctx.textBaseline = "middle";

                    // Text shadow for readability
                    ctx.shadowColor = "rgba(0, 0, 0, 0.8)";
                    ctx.shadowBlur = 4;
                    ctx.fillText(
                        node.type === "user" ? node.label : node.label.split(" ")[0],
                        node.x,
                        node.y
                    );
                    ctx.shadowBlur = 0;
                }

                // Broker count indicator
                if (node.type === "broker") {
                    ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
                    ctx.font = "600 6px system-ui";
                    ctx.textAlign = "center";
                    ctx.fillText("•", node.x, node.y);
                }
            });

            animationRef.current = requestAnimationFrame(animate);
        }

        animate();

        // Mouse interaction
        const handleMouseMove = (e: MouseEvent) => {
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            let found = false;
            for (const node of allNodes) {
                const dx = x - node.x;
                const dy = y - node.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < node.r * 2) {
                    setHoveredNode(node.id);
                    canvas.style.cursor = "pointer";
                    found = true;
                    break;
                }
            }

            if (!found) {
                setHoveredNode(null);
                canvas.style.cursor = "default";
            }
        };

        canvas.addEventListener("mousemove", handleMouseMove);

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
            canvas.removeEventListener("mousemove", handleMouseMove);
        };
    }, [hoveredNode]);

    return (
        <div className="relative w-full h-[350px] rounded-2xl border border-emerald-500/20 bg-black/60 backdrop-blur-sm overflow-hidden flex flex-col">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-linear-to-br from-emerald-500/5 via-transparent to-violet-500/5" />

            <canvas
            ref={canvasRef}
            className="w-full flex-1 relative z-10"
            style={{ width: "100%", height: "300px" }}
            />

            {/* Legend */}
            <div className="flex items-center justify-center gap-6 px-4 py-2.5 border-t border-white/10 bg-black/40 backdrop-blur-sm text-[10px] text-white/70 relative z-20">
            <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-lg shadow-emerald-400/50" />
                <span>You</span>
            </div>
            <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-lg shadow-cyan-400/50" />
                <span>Your Services</span>
            </div>
            <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-violet-400 shadow-lg shadow-violet-400/50" />
                <span>Data Brokers</span>
            </div>
            </div>

            {/* Hover tooltip */}
            {hoveredNode && (
            <div className="absolute top-4 left-4 bg-black/80 backdrop-blur-sm border border-white/20 rounded-lg px-3 py-2 text-xs text-white z-30">
                <div className="font-semibold">
                {hoveredNode === "you" ? "You" :
                    hoveredNode.startsWith("svc:") ? MOCK_SERVICES.find(s => `svc:${s.id}` === hoveredNode)?.name || "Service" :
                    MOCK_BROKERS.find(b => `brk:${b.id}` === hoveredNode)?.name || "Data Broker"}
                </div>
                <div className="text-white/60 text-[10px] mt-0.5">
                {hoveredNode.startsWith("brk:") ? "Tracking your data" : "Connected"}
                </div>
            </div>
            )}
        </div>
    );
}

export function DigitalShadowSection() {
    return (
        <section className="relative overflow-hidden space-y-12">
            {/* Container */}
            <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Main Content Grid */}
                <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                    {/* Left: Content */}
                    <div className="space-y-6 sm:space-y-8">
                        {/* Badge */}
                        <Badge>
                            <Sparkles className="h-3.5 w-3.5" />
                            <span>Your Digital Footprint</span>
                        </Badge>

                        {/* Headline */}
                        <div className="space-y-3">
                            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight tracking-tight">
                                See Your Complete Digital Shadow
                            </h2>
                            <p className="text-sm sm:text-base text-emerald-300/90 font-medium">
                                From your email to 100+ data brokers
                            </p>
                        </div>

                        {/* Description */}
                        <p className="text-base text-white/60 leading-relaxed max-w-md">
                            Most people don&apos;t realize 40-100+ data brokers have copies of their personal data. We show you the exact network—what data they have, where it came from, and exactly how to remove it.
                        </p>

                        {/* Stats Highlight */}
                        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 space-y-2">
                            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-300">By the numbers</p>
                            <p className="text-2xl font-bold text-white">43 brokers</p>
                            <p className="text-xs text-white/60">average per person in the US</p>
                        </div>

                        {/* Features */}
                        <div className="space-y-3 pt-2">
                            <FeatureItem
                                icon={<Search className="h-5 w-5" />}
                                title="Network Visualization"
                                description="See exactly how your data flows from accounts to brokers"
                            />
                            <FeatureItem
                                icon={<Mail className="h-5 w-5" />}
                                title="Automated Removals"
                                description="Send CCPA/GDPR deletion requests to all brokers at once"
                            />
                            <FeatureItem
                                icon={<TrendingUp className="h-5 w-5" />}
                                title="Watch It Work"
                                description="Monitor progress as your data is removed from brokers"
                            />
                        </div>

                        {/* CTA */}
                        <Link
                            href="/login"
                            className="inline-flex items-center gap-2 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 text-sm font-semibold transition-all duration-200 hover:shadow-lg hover:shadow-emerald-500/25"
                        >
                            Start Your Digital Audit
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>

                    {/* Right: Visual */}
                    <div className="relative lg:order-last">
                        {/* Glow effects */}
                        <div className="absolute -inset-4 bg-linear-to-b from-emerald-500/20 via-emerald-500/5 to-transparent blur-3xl -z-10 rounded-2xl" />
                        <div className="absolute -inset-4 bg-linear-to-t from-violet-500/10 via-transparent to-transparent blur-3xl -z-10 rounded-2xl" />

                        {/* Graph container */}
                        <div className="relative">
                            <NetworkGraphPreview />
                        </div>
                    </div>
                </div>
            </div>

            {/* Enhanced Stats Section */}
            <div className="relative">
                <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-emerald-500/30 to-transparent" />
                
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                        <div className="group">
                            <StatCard value="500+" label="Data Brokers" />
                        </div>
                        <div className="group">
                            <StatCard value="43" label="Per Person" />
                        </div>
                        <div className="group">
                            <StatCard value="100+" label="Types of Data" />
                        </div>
                        <div className="group">
                            <StatCard value="7" label="Days Average" />
                        </div>
                    </div>
                    <p className="text-xs text-white/40 text-center mt-4">
                        Data based on analysis of 10,000+ scans across the US
                    </p>
                </div>
            </div>
        </section>
    );
}
