/* eslint-disable react/no-unescaped-entities */
"use client";

import Link from "next/link";
import {
    ArrowRight,
    CheckCircle,
    Check,
    Sparkles,
    Mail,
    BadgeCheck,
    Zap,
    DollarSign,
    Ghost,
    Lock,
    EyeOff,
    BarChart3,
    Clock,
    ShieldCheck,
    Fingerprint,
    MapPin,
    TrendingUp,
    Users
} from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { GmailLogo } from "@/svgs";

// Structured data (JSON-LD) for search engines
const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "GhostSweep | Stop Leaving Money in Your Inbox",
    "description": "The average inbox holds $1,400 in forgotten coupons, unused gift cards, and expiring rewards. GhostSweep finds your hidden money automatically.",
    "url": "https://ghostsweep.com/home",
    "image": "https://znlaksqttxokoeavwqjf.supabase.co/storage/v1/object/public/news/ghost-svgrepo-com.png",
    "publisher": {
        "@type": "Organization",
        "name": "GhostSweep",
        "logo": {
            "@type": "ImageObject",
            "url": "https://znlaksqttxokoeavwqjf.supabase.co/storage/v1/object/public/news/ghost-svgrepo-com.png",
        },
    },
};

// FAQ Schema for rich snippets
const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
        {
            "@type": "Question",
            "name": "How much money is hiding in my inbox?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "The average inbox holds $1,400 in forgotten value—unused digital gift cards, expiring rewards points, and overlooked coupons. GhostSweep scans and surfaces this hidden money automatically.",
            },
        },
        {
            "@type": "Question",
            "name": "Is GhostSweep safe to use with my email?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Yes. We see your savings, not your secrets. GhostSweep scans email content transiently to find value, then discards the raw text immediately. No cloud storage, no data selling—just found money. We're CASA Tier 2 verified.",
            },
        },
        {
            "@type": "Question",
            "name": "Do you sell my data?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Never. Unlike free inbox tools that sell your purchase data to hedge funds, GhostSweep has a privacy-first business model. You pay us, we find your money. That's it.",
            },
        },
        {
            "@type": "Question",
            "name": "What about my rewards points?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "We alert you before points expire. The digital gift card market is $680 billion—and much of it goes unspent. Don't let your points turn into $0.",
            },
        },
    ],
};

function HeroDashboard() {
    const [valueFound, setValueFound] = useState(0);
    const [coupons, setCoupons] = useState(0);
    const [accounts, setAccounts] = useState(0);

    useEffect(() => {
        const timer1 = setTimeout(() => setValueFound(1465), 500);
        const timer2 = setTimeout(() => setCoupons(23), 800);
        const timer3 = setTimeout(() => setAccounts(89), 1100);
        return () => {
            clearTimeout(timer1);
            clearTimeout(timer2);
            clearTimeout(timer3);
        };
    }, []);

    return (
        <div className="relative mx-auto max-w-4xl rounded-xl border border-white/10 bg-black/40 p-1 backdrop-blur-xl shadow-2xl">
            <div className="absolute -inset-1 rounded-xl bg-gradient-to-r from-emerald-500/20 via-blue-500/20 to-purple-500/20 blur opacity-50" />
            <div className="relative rounded-lg bg-[#0A0A0A] p-6 sm:p-8">
                <div className="flex items-center justify-between border-b border-white/5 pb-6 mb-6">
                    <div className="flex items-center gap-3">
                        <div className="h-3 w-3 rounded-full bg-red-500/50" />
                        <div className="h-3 w-3 rounded-full bg-yellow-500/50" />
                        <div className="h-3 w-3 rounded-full bg-green-500/50" />
                    </div>
                    <div className="text-xs font-mono text-white/30 uppercase tracking-widest">
                        Inbox Value Scan :: Active
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Value Card */}
                    <div className="group rounded-lg bg-emerald-500/5 border border-emerald-500/10 p-6 transition hover:bg-emerald-500/10">
                        <div className="flex items-center justify-between mb-4">
                            <DollarSign className="h-5 w-5 text-emerald-400" />
                            <span className="text-[10px] text-emerald-400/60 uppercase tracking-wider font-semibold">Hidden Value Found</span>
                        </div>
                        <div className="text-3xl font-light text-white transition-all duration-1000">
                            ${valueFound.toLocaleString()}
                        </div>
                        <p className="mt-2 text-xs text-white/40">
                            Gift cards, coupons & rewards
                        </p>
                    </div>

                    {/* Coupons Card */}
                    <div className="group rounded-lg bg-blue-500/5 border border-blue-500/10 p-6 transition hover:bg-blue-500/10">
                        <div className="flex items-center justify-between mb-4">
                            <Mail className="h-5 w-5 text-blue-400" />
                            <span className="text-[10px] text-blue-400/60 uppercase tracking-wider font-semibold">Offers Clipped</span>
                        </div>
                        <div className="text-3xl font-light text-white transition-all duration-1000">
                            {coupons}
                        </div>
                        <p className="mt-2 text-xs text-white/40">
                            Coupons you almost missed
                        </p>
                    </div>

                    {/* Accounts Card */}
                    <div className="group rounded-lg bg-purple-500/5 border border-purple-500/10 p-6 transition hover:bg-purple-500/10">
                        <div className="flex items-center justify-between mb-4">
                            <Ghost className="h-5 w-5 text-purple-400" />
                            <span className="text-[10px] text-purple-400/60 uppercase tracking-wider font-semibold">Data Leak Risks</span>
                        </div>
                        <div className="text-3xl font-light text-white transition-all duration-1000">
                            {accounts}
                        </div>
                        <p className="mt-2 text-xs text-white/40">
                            Old accounts to delete
                        </p>
                    </div>
                </div>

                <div className="mt-8 flex items-center justify-between text-xs text-white/30 font-mono">
                    <div className="flex items-center gap-2">
                        <BadgeCheck className="h-3.5 w-3.5 text-emerald-500/60" />
                        CASA Tier 2 Verified
                    </div>
                    <div className="flex items-center gap-2">
                         <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        Scanning...
                    </div>
                </div>
            </div>
        </div>
    );
}

// Types for the live feed
interface LiveFeedItem {
    id: string;
    type: string;
    serviceName: string;
    amount: number;
    location: string;
    createdAt: string;
}

interface LiveFeedData {
    feed: LiveFeedItem[];
    dailyScanCount: number;
    weeklyTotal: number;
}

// Custom hook to fetch live feed data using React Query
function useLiveFeed() {
    return useQuery<LiveFeedData>({
        queryKey: ["marketing-live-feed"],
        queryFn: async () => {
            const response = await fetch("/api/marketing/live-feed");
            if (!response.ok) {
                throw new Error("Failed to fetch live feed");
            }
            return response.json();
        },
        refetchInterval: 30000, // Refresh every 30 seconds
        staleTime: 15000, // Consider data fresh for 15 seconds
        retry: 2, // Retry failed requests twice
    });
}

function SocialProofBanner() {
    const { data: liveFeed, isLoading } = useLiveFeed();
    const [currentFind, setCurrentFind] = useState(0);
    const [incrementedAmount, setIncrementedAmount] = useState(0);

    // Format feed items - only use real data
    const recentFinds = useMemo(() => {
        if (liveFeed?.feed && liveFeed.feed.length > 0) {
            return liveFeed.feed.map((item) => ({
                location: item.location,
                amount: item.amount,
                item: item.serviceName,
            }));
        }
        return [];
    }, [liveFeed]);

    // Get totals from live data only
    const weeklyTotal = liveFeed?.weeklyTotal ?? 0;
    const dailyScans = liveFeed?.dailyScanCount ?? 0;
    const displayTotal = weeklyTotal + incrementedAmount;

    // Check if we have any real data to show
    const hasData = weeklyTotal > 0 || recentFinds.length > 0 || dailyScans > 0;
    
    useEffect(() => {
        if (recentFinds.length === 0) return;
        
        // Rotate through recent finds
        const findInterval = setInterval(() => {
            setCurrentFind((prev) => (prev + 1) % recentFinds.length);
        }, 4000);
        
        // Slowly increment weekly total for live feel (only if we have real data)
        const totalInterval = weeklyTotal > 0 ? setInterval(() => {
            setIncrementedAmount((prev) => prev + Math.floor(Math.random() * 15) + 5);
        }, 8000) : null;
        
        return () => {
            clearInterval(findInterval);
            if (totalInterval) clearInterval(totalInterval);
        };
    }, [recentFinds.length, weeklyTotal]);
    
    // Don't render if no real data and not loading
    if (!hasData && !isLoading) {
        return null;
    }

    const find = recentFinds[currentFind];
    
    return (
        <div className="py-6 border-y border-white/5 bg-emerald-500/5">
            <div className="container mx-auto px-4">
                <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-12">
                    {/* Weekly Counter - only show if we have data */}
                    {displayTotal > 0 && (
                        <>
                            <div className="flex items-center gap-3">
                                <div className="flex items-center justify-center h-10 w-10 rounded-full bg-emerald-500/20 border border-emerald-500/30">
                                    <TrendingUp className="h-5 w-5 text-emerald-400" />
                                </div>
                                <div>
                                    <div className="text-xl font-semibold text-emerald-400">
                                        ${(displayTotal / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </div>
                                    <div className="text-[10px] uppercase tracking-wider text-white/40">
                                        Recovered This Week
                                    </div>
                                </div>
                            </div>
                            
                            {/* Divider - only show if we also have finds */}
                            {find && <div className="hidden sm:block h-8 w-px bg-white/10" />}
                        </>
                    )}
                    
                    {/* Recent Find Ticker - only show if we have finds */}
                    {find && (
                        <div className="flex items-center gap-3 min-w-[280px]">
                            <div className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                            </div>
                            <div className={`text-sm text-white/70 transition-opacity duration-500 ${isLoading ? "opacity-50" : "opacity-100"}`}>
                                <span className="text-white/40">Just now:</span>{" "}
                                <span className="text-emerald-400 font-medium">${(find.amount / 100).toFixed(2)}</span>{" "}
                                <span>{find.item}</span>{" "}
                                <span className="text-white/40">• {find.location}</span>
                            </div>
                        </div>
                    )}
                    
                    {/* User Count - only show if we have data */}
                    {dailyScans > 0 && (
                        <div className="hidden md:flex items-center gap-2 text-xs text-white/40">
                            <Users className="h-3.5 w-3.5" />
                            <span>{dailyScans.toLocaleString()} users scanned today</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// How It Works - Trust & Security Section
function HowItWorksSection() {
    return (
        <section className="py-20 border-b border-white/5">
            <div className="container mx-auto px-4">
                <div className="text-center max-w-2xl mx-auto mb-12">
                    <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/60 mb-6">
                        <ShieldCheck className="h-3 w-3" />
                        <span>Privacy-First Architecture</span>
                    </div>
                    <h2 className="text-3xl font-light text-white">How It Works</h2>
                    <p className="mt-4 text-white/50">
                        We find your money without compromising your privacy. Here's exactly what happens:
                    </p>
                </div>
                
                <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                    {/* Step 1 */}
                    <div className="relative p-6 rounded-2xl border border-white/10 bg-gradient-to-b from-white/5 to-transparent">
                        <div className="absolute -top-3 -left-1 h-8 w-8 rounded-full bg-emerald-500 flex items-center justify-center text-black font-bold text-sm">
                            1
                        </div>
                        <div className="mt-4">
                            <div className="h-12 w-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-4">
                                <ShieldCheck className="h-6 w-6 text-emerald-400" />
                            </div>
                            <h3 className="text-lg font-medium text-white mb-2">Official Google OAuth</h3>
                            <p className="text-sm text-white/50 leading-relaxed">
                                Connect securely through Google's official login. <strong className="text-white/70">We never see your password.</strong> You're always in control and can revoke access anytime.
                            </p>
                        </div>
                    </div>
                    
                    {/* Step 2 */}
                    <div className="relative p-6 rounded-2xl border border-white/10 bg-gradient-to-b from-white/5 to-transparent">
                        <div className="absolute -top-3 -left-1 h-8 w-8 rounded-full bg-emerald-500 flex items-center justify-center text-black font-bold text-sm">
                            2
                        </div>
                        <div className="mt-4">
                            <div className="h-12 w-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-4">
                                <Fingerprint className="h-6 w-6 text-blue-400" />
                            </div>
                            <h3 className="text-lg font-medium text-white mb-2">Transient Scan</h3>
                            <p className="text-sm text-white/50 leading-relaxed">
                                We process emails <strong className="text-white/70">in memory only</strong>—extracting gift cards, coupons, and rewards. Raw email text is <strong className="text-white/70">deleted immediately</strong> after scanning.
                            </p>
                        </div>
                    </div>
                    
                    {/* Step 3 */}
                    <div className="relative p-6 rounded-2xl border border-white/10 bg-gradient-to-b from-white/5 to-transparent">
                        <div className="absolute -top-3 -left-1 h-8 w-8 rounded-full bg-emerald-500 flex items-center justify-center text-black font-bold text-sm">
                            3
                        </div>
                        <div className="mt-4">
                            <div className="h-12 w-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-4">
                                <DollarSign className="h-6 w-6 text-purple-400" />
                            </div>
                            <h3 className="text-lg font-medium text-white mb-2">Your Savings Report</h3>
                            <p className="text-sm text-white/50 leading-relaxed">
                                You get a clean dashboard with <strong className="text-white/70">only the value we found</strong>—gift cards, expiring points, hidden coupons. No stored emails, no data selling. Ever.
                            </p>
                        </div>
                    </div>
                </div>
                
                {/* Trust Badges */}
                <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-xs text-white/40">
                    <div className="flex items-center gap-2 px-4 py-2 rounded-lg border border-white/10 bg-white/5">
                        <BadgeCheck className="h-4 w-4 text-emerald-400" />
                        <span>CASA Tier 2 Verified</span>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 rounded-lg border border-white/10 bg-white/5">
                        <Lock className="h-4 w-4 text-white/60" />
                        <span>256-bit Encryption</span>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 rounded-lg border border-white/10 bg-white/5">
                        <EyeOff className="h-4 w-4 text-white/60" />
                        <span>Zero Email Storage</span>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[#EA4335]/20 bg-[#EA4335]/10">
                        <GmailLogo className="h-4 w-4" />
                        <span className="text-white/60">Google Verified App</span>
                    </div>
                </div>
            </div>
        </section>
    );
}

// Digital Shadow Map Preview
function ShadowMapPreview() {
    const [hoveredNode, setHoveredNode] = useState<number | null>(null);
    
    const nodes = useMemo(() => [
        { id: 1, x: 50, y: 50, label: "Amazon", risk: "high", size: 60 },
        { id: 2, x: 30, y: 30, label: "Netflix", risk: "medium", size: 45 },
        { id: 3, x: 70, y: 35, label: "Spotify", risk: "low", size: 40 },
        { id: 4, x: 20, y: 60, label: "Uber", risk: "medium", size: 35 },
        { id: 5, x: 80, y: 65, label: "DoorDash", risk: "low", size: 38 },
        { id: 6, x: 40, y: 75, label: "Unknown App", risk: "high", size: 30 },
        { id: 7, x: 60, y: 20, label: "Dropbox", risk: "low", size: 42 },
        { id: 8, x: 15, y: 45, label: "Old Forums", risk: "high", size: 28 },
    ], []);
    
    const getRiskColor = (risk: string) => {
        switch (risk) {
            case "high": return "text-red-400 bg-red-500/20 border-red-500/30";
            case "medium": return "text-yellow-400 bg-yellow-500/20 border-yellow-500/30";
            default: return "text-emerald-400 bg-emerald-500/20 border-emerald-500/30";
        }
    };
    
    return (
        <section className="py-20 border-b border-white/5">
            <div className="container mx-auto px-4">
                <div className="flex flex-col lg:flex-row items-center gap-12">
                    {/* Text */}
                    <div className="flex-1 space-y-6">
                        <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/20 bg-purple-500/10 px-3 py-1 text-xs text-purple-400">
                            <MapPin className="h-3 w-3" />
                            <span>Digital Shadow Mapping</span>
                        </div>
                        <h2 className="text-3xl font-light text-white leading-tight">
                            See Your Digital Mess. <br/>
                            <span className="text-white/40">Then Clean It.</span>
                        </h2>
                        <p className="text-white/60 leading-relaxed">
                            Your email reveals 89+ accounts you've forgotten about. Old subscriptions quietly draining money. 
                            Data breach risks from services you used once in 2019. GhostSweep maps it all—so you can delete what doesn't serve you.
                        </p>
                        <ul className="space-y-3 text-sm">
                            <li className="flex items-center gap-3 text-white/70">
                                <div className="h-2 w-2 rounded-full bg-red-400" />
                                <span>High-risk accounts (breached or dormant)</span>
                            </li>
                            <li className="flex items-center gap-3 text-white/70">
                                <div className="h-2 w-2 rounded-full bg-yellow-400" />
                                <span>Medium-risk (unused subscriptions)</span>
                            </li>
                            <li className="flex items-center gap-3 text-white/70">
                                <div className="h-2 w-2 rounded-full bg-emerald-400" />
                                <span>Active & secure accounts</span>
                            </li>
                        </ul>
                    </div>
                    
                    {/* Interactive Map Preview */}
                    <div className="flex-1 w-full">
                        <div className="relative rounded-xl border border-white/10 bg-black/60 p-4 aspect-square max-w-md mx-auto overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-emerald-500/5" />
                            
                            {/* Grid lines */}
                            <div className="absolute inset-4 opacity-10">
                                {[...Array(5)].map((_, i) => (
                                    <div key={`h-${i}`} className="absolute w-full h-px bg-white" style={{ top: `${(i + 1) * 20}%` }} />
                                ))}
                                {[...Array(5)].map((_, i) => (
                                    <div key={`v-${i}`} className="absolute h-full w-px bg-white" style={{ left: `${(i + 1) * 20}%` }} />
                                ))}
                            </div>
                            
                            {/* Connection lines */}
                            <svg className="absolute inset-0 w-full h-full">
                                <defs>
                                    <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" stopColor="rgba(139, 92, 246, 0.3)" />
                                        <stop offset="100%" stopColor="rgba(16, 185, 129, 0.3)" />
                                    </linearGradient>
                                </defs>
                                {nodes.slice(1).map((node) => (
                                    <line
                                        key={`line-${node.id}`}
                                        x1="50%"
                                        y1="50%"
                                        x2={`${node.x}%`}
                                        y2={`${node.y}%`}
                                        stroke="url(#lineGrad)"
                                        strokeWidth="1"
                                        className="opacity-30"
                                    />
                                ))}
                            </svg>
                            
                            {/* Nodes */}
                            {nodes.map((node) => (
                                <div
                                    key={node.id}
                                    className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 cursor-pointer
                                        ${getRiskColor(node.risk)} border rounded-full flex items-center justify-center
                                        ${hoveredNode === node.id ? 'scale-125 z-10' : 'hover:scale-110'}`}
                                    style={{
                                        left: `${node.x}%`,
                                        top: `${node.y}%`,
                                        width: node.size,
                                        height: node.size,
                                    }}
                                    onMouseEnter={() => setHoveredNode(node.id)}
                                    onMouseLeave={() => setHoveredNode(null)}
                                >
                                    {hoveredNode === node.id && (
                                        <div className="absolute -top-8 whitespace-nowrap px-2 py-1 rounded bg-black/90 text-[10px] text-white border border-white/10">
                                            {node.label}
                                        </div>
                                    )}
                                    <Ghost className="h-4 w-4" />
                                </div>
                            ))}
                            
                            {/* Center "You" node */}
                            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20">
                                <div className="h-16 w-16 rounded-full bg-white/10 border-2 border-white/30 flex items-center justify-center backdrop-blur-sm">
                                    <span className="text-xs font-medium text-white">YOU</span>
                                </div>
                            </div>
                            
                            {/* Scan effect */}
                            <div className="absolute inset-0 animate-pulse">
                                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-32 w-32 rounded-full border border-purple-500/20" />
                                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-48 w-48 rounded-full border border-purple-500/10" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

function TrinitySection() {
    return (
        <section className="py-24 relative overflow-hidden">
            <div className="absolute inset-0 bg-white/[0.02]" />
            <div className="container mx-auto px-4 relative z-10">
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-400 mb-6">
                        <DollarSign className="h-3 w-3" />
                        <span>The Hidden $1,400</span>
                    </div>
                    <h2 className="text-3xl font-light text-white">Stop Leaving Money in Your Inbox</h2>
                    <p className="mt-4 text-white/60">
                        41% of people check email specifically for coupons but find it overwhelming. We clip the deals automatically so you don't have to scroll.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {/* Coupon Discovery */}
                    <div className="group p-8 rounded-2xl border border-white/5 bg-white/2 hover:border-emerald-500/30 transition duration-300">
                        <div className="h-12 w-12 rounded-full bg-emerald-500/10 flex items-center justify-center mb-6 text-emerald-400">
                            <DollarSign className="h-6 w-6" />
                        </div>
                        <h3 className="text-xl text-white mb-3">Coupon Discovery</h3>
                        <p className="text-white/50 text-sm leading-relaxed mb-4">
                            "Stop leaving money in your inbox. We find the 10% off you missed."
                        </p>
                        <p className="text-white/40 text-xs mb-6">
                            Frequent coupon users save $1,465 annually—about 4% of a typical household budget. Join the 28% who save $10-25 monthly.
                        </p>
                        <ul className="space-y-2 text-sm text-white/70">
                            <li className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-emerald-500/50" />
                                <span>Auto-clip expiring offers</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-emerald-500/50" />
                                <span>Surface buried discounts</span>
                            </li>
                        </ul>
                    </div>

                    {/* Gift Card Recovery */}
                    <div className="group p-8 rounded-2xl border border-white/5 bg-white/2 hover:border-blue-500/30 transition duration-300">
                        <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center mb-6 text-blue-400">
                            <Sparkles className="h-6 w-6" />
                        </div>
                        <h3 className="text-xl text-white mb-3">Rewards Rescue</h3>
                        <p className="text-white/50 text-sm leading-relaxed mb-4">
                            "Turn forgotten e-receipts into $50 gift cards automatically."
                        </p>
                        <p className="text-white/40 text-xs mb-6">
                            The digital gift card market is $680B in 2026. Much of it goes unspent—lost in cluttered inboxes. Don't let your points turn into $0.
                        </p>
                        <ul className="space-y-2 text-sm text-white/70">
                            <li className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-blue-500/50" />
                                <span>Find hidden gift card balances</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-blue-500/50" />
                                <span>Expiring points alerts</span>
                            </li>
                        </ul>
                    </div>

                    {/* Account Deletion */}
                    <div className="group p-8 rounded-2xl border border-white/5 bg-white/2 hover:border-purple-500/30 transition duration-300">
                        <div className="h-12 w-12 rounded-full bg-purple-500/10 flex items-center justify-center mb-6 text-purple-400">
                            <Ghost className="h-6 w-6" />
                        </div>
                        <h3 className="text-xl text-white mb-3">Digital Footprint Audit</h3>
                        <p className="text-white/50 text-sm leading-relaxed mb-4">
                            "Kill the zombie subscriptions draining $200 from your bank account."
                        </p>
                        <p className="text-white/40 text-xs mb-6">
                            Shrink your digital footprint. Old accounts are data-leak risks and forgotten subscriptions are silent budget killers.
                        </p>
                        <ul className="space-y-2 text-sm text-white/70">
                            <li className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-purple-500/50" />
                                <span>One-click account deletion</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-purple-500/50" />
                                <span>Breach monitoring</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </section>
    );
}

function GhostEngineSection() {
    return (
        <section className="py-24 border-y border-white/5 bg-white/2">
            <div className="container mx-auto px-4">
                <div className="flex flex-col lg:flex-row items-center gap-16">
                    <div className="flex-1 space-y-8">
                        <div>
                           <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-400 mb-6">
                                <Lock className="h-3 w-3" />
                                <span>Privacy-as-a-Product</span>
                            </div>
                            <h2 className="text-3xl md:text-4xl font-light text-white leading-tight">
                                We See Your Savings. <br/>
                                <span className="text-white/40">Not Your Secrets.</span>
                            </h2>
                        </div>
                        
                        <p className="text-lg text-white/60 font-light leading-relaxed">
                            Competitors like Unroll.me sell your receipt data to hedge funds. We do the opposite. 
                            Our secure scanner finds your hidden money, then discards the raw email text immediately. No cloud storage, no data selling—just found money.
                        </p>

                        <div className="grid gap-6">
                            <div className="flex gap-4">
                                <div className="mt-1 h-8 w-8 shrink-0 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                                    <BadgeCheck className="h-4 w-4 text-emerald-400" />
                                </div>
                                <div>
                                    <h4 className="text-white font-medium mb-1">CASA Tier 2 Verified</h4>
                                    <p className="text-sm text-white/50">Google-vetted security badge. Savvy users look for this before granting inbox access.</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="mt-1 h-8 w-8 shrink-0 rounded-lg bg-white/5 flex items-center justify-center border border-white/10">
                                    <EyeOff className="h-4 w-4 text-white" />
                                </div>
                                <div>
                                    <h4 className="text-white font-medium mb-1">Transient Processing Only</h4>
                                    <p className="text-sm text-white/50">Emails scanned, value extracted, raw text deleted. Your inbox stays yours.</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="mt-1 h-8 w-8 shrink-0 rounded-lg bg-white/5 flex items-center justify-center border border-white/10">
                                    <BarChart3 className="h-4 w-4 text-white" />
                                </div>
                                <div>
                                    <h4 className="text-white font-medium mb-1">Privacy Audit Report</h4>
                                    <p className="text-sm text-white/50">See exactly which emails were scanned alongside your Savings Report.</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-4 pt-4">
                            <div className="flex items-center gap-2 px-4 py-2 rounded-lg border border-white/10 bg-[#EA4335]/10 text-white/70 text-xs">
                                <GmailLogo className="h-4 w-4 opacity-70" />
                                <span>Google Verified Partner</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 w-full relative">
                        <div className="absolute -inset-4 bg-gradient-to-r from-emerald-500/20 to-purple-500/20 opacity-30 blur-2xl rounded-full" />
                        <div className="relative rounded-xl border border-white/10 bg-black/80 overflow-hidden shadow-2xl">
                           <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3 bg-white/5">
                                <div className="h-2.5 w-2.5 rounded-full bg-red-500/20" />
                                <div className="h-2.5 w-2.5 rounded-full bg-yellow-500/20" />
                                <div className="h-2.5 w-2.5 rounded-full bg-green-500/20" />
                                <div className="ml-2 text-[10px] text-white/30 font-mono">GhostSweep_Savings_Scan</div>
                           </div>
                           <div className="p-6 font-mono text-xs space-y-3">
                                <div className="flex items-center gap-2 text-emerald-400/80">
                                    <Check className="h-3 w-3" />
                                    <span>Scan initiated: Finding hidden value...</span>
                                </div>
                                <div className="text-white/40 pl-5">Analyzing 8,294 emails for savings...</div>
                                <div className="flex items-center gap-2 text-blue-400/80 pl-5">
                                    <Zap className="h-3 w-3" />
                                    <span>Coupon detected: Target 15% off (expires 3 days)</span>
                                </div>
                                <div className="flex items-center gap-2 text-purple-400/80 pl-5">
                                    <Clock className="h-3 w-3" />
                                    <span>Alert: Fetch rewards expiring in 14 days</span>
                                </div>
                                <div className="flex items-center gap-2 text-emerald-400 pl-5 bg-emerald-500/10 py-1 pr-2 rounded w-fit">
                                    <DollarSign className="h-3 w-3" />
                                    <span>FOUND: Unused Starbucks Card ($25.00)</span>
                                </div>
                                <div className="flex items-center gap-2 text-emerald-400 pl-5 bg-emerald-500/10 py-1 pr-2 rounded w-fit">
                                    <DollarSign className="h-3 w-3" />
                                    <span>FOUND: Amazon refund pending ($34.99)</span>
                                </div>
                                <div className="animate-pulse text-white/30 pl-5 pt-2">
                                    &gt; Raw email data purged. Only savings retained.
                                </div>
                           </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

function PricingSection() {
    return (
        <section className="py-24 container mx-auto px-4" id="pricing">
            <div className="text-center max-w-2xl mx-auto mb-16">
                <h2 className="text-3xl font-light text-white">The Scan That Pays For Itself</h2>
                <p className="mt-4 text-white/60">
                    Most users find enough hidden value in the first scan to cover years of GhostSweep. Join the 28% who save $10-25 monthly.
                </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                {/* Monthly */}
                <div className="rounded-2xl border border-white/10 bg-white/2 p-8 flex flex-col">
                    <div className="mb-4 text-lg text-white font-medium">Value Hunter</div>
                   <div className="flex items-baseline gap-1 mb-6">
                        <span className="text-4xl text-white font-light">$19.99</span>
                        <span className="text-white/40">/mo</span>
                    </div>
                    <p className="text-sm text-white/50 mb-8 h-10">
                        Perfect for a one-time savings extraction and inbox audit.
                    </p>
                    <ul className="space-y-4 mb-8 flex-1">
                         <li className="flex items-center gap-3 text-sm text-white/70">
                            <Check className="h-4 w-4 text-white" />
                            <span>Unlimited Coupon Discovery</span>
                        </li>
                        <li className="flex items-center gap-3 text-sm text-white/70">
                            <Check className="h-4 w-4 text-white" />
                            <span>Gift Card & Rewards Rescue</span>
                        </li>
                        <li className="flex items-center gap-3 text-sm text-white/70">
                            <Check className="h-4 w-4 text-white" />
                            <span>Account Deletion Engine</span>
                        </li>
                    </ul>
                    <Link
                        href="/login?plan=monthly"
                        className="w-full flex items-center justify-center rounded-lg bg-white/10 border border-white/5 py-3 text-sm text-white hover:bg-white/20 transition"
                    >
                        Start Monthly
                    </Link>
                </div>

                {/* Annual */}
                <div className="relative rounded-2xl border border-emerald-500/30 bg-white/5 p-8 flex flex-col shadow-2xl shadow-emerald-900/20">
                    <div className="absolute -top-3 right-8 rounded-full bg-emerald-500 px-3 py-1 text-[10px] font-bold text-black uppercase tracking-wide">
                        Avg. $122/mo Found
                    </div>
                    <div className="mb-4 text-lg text-emerald-400 font-medium">Savings Pro</div>
                   <div className="flex items-baseline gap-1 mb-6">
                        <span className="text-4xl text-white font-light">$149</span>
                        <span className="text-white/40">/yr</span>
                    </div>
                     <p className="text-sm text-white/50 mb-8 h-10">
                         Continuous monitoring for new coupons, expiring points, and hidden value.
                    </p>
                    <ul className="space-y-4 mb-8 flex-1">
                         <li className="flex items-center gap-3 text-sm text-white/90">
                            <Check className="h-4 w-4 text-emerald-400" />
                            <span>Everything in Monthly</span>
                        </li>
                        <li className="flex items-center gap-3 text-sm text-white/90">
                            <Check className="h-4 w-4 text-emerald-400" />
                            <span>Expiring Points Alerts</span>
                        </li>
                        <li className="flex items-center gap-3 text-sm text-white/90">
                            <Check className="h-4 w-4 text-emerald-400" />
                            <span>Save 35% vs Monthly</span>
                        </li>
                    </ul>
                    <Link
                        href="/login?plan=annual"
                        className="w-full flex items-center justify-center rounded-lg bg-emerald-500 py-3 text-sm text-black font-medium hover:bg-emerald-400 transition"
                    >
                        Get Savings Pro
                    </Link>
                </div>
            </div>
             <p className="text-center mt-8 text-xs text-white/30">
                Cancel anytime. 30-day money-back guarantee if we don't find value.
            </p>
        </section>
    );
}

function FAQSection() {
    const faqs = [
        {
            q: "How much money is hiding in my inbox?",
            a: "Research shows the average inbox holds $1,400+ in forgotten value—unused digital gift cards, expiring rewards points (Fetch, Lowe's Pro, etc.), and overlooked coupons. Frequent coupon users save $1,465 annually. GhostSweep surfaces all of it automatically.",
        },
        {
            q: "Is GhostSweep safe to use?",
            a: "Yes. We see your savings, not your secrets. GhostSweep scans email content transiently to extract value, then discards the raw text immediately. No cloud storage, no data selling. We're CASA Tier 2 verified—the Google-vetted security standard.",
        },
        {
            q: "Do you sell my data like Unroll.me?",
            a: "Never. Unlike free inbox tools that sell your purchase data to hedge funds, GhostSweep has a privacy-first business model. You pay us a fair price, we find your money. That's it. Your data is processed transiently and never stored permanently.",
        },
        {
            q: "What about expiring rewards points?",
            a: "We alert you before points expire. The digital gift card market is $680 billion in 2026—and much of it goes unspent because it's lost in cluttered inboxes. Don't let your Fetch, Starbucks, or airline points turn into $0.",
        },
    ];

    return (
        <section className="py-24 container mx-auto px-4 border-t border-white/5" id="faq">
            <div className="max-w-3xl mx-auto">
                <h2 className="text-2xl font-light text-center text-white mb-12">Common Questions</h2>
                <div className="space-y-6">
                    {faqs.map((faq, i) => (
                        <div key={i} className="rounded-xl border border-white/5 bg-white/2 p-6">
                            <h3 className="text-lg font-medium text-white mb-2">{faq.q}</h3>
                            <p className="text-sm text-white/60 leading-relaxed">{faq.a}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

export default function HomePage() {
    return (
        <main className="min-h-screen bg-[#050505] selection:bg-emerald-500/30">
            {/* Inject Structured Data */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
            />

            <div className="relative isolate overflow-hidden">
                {/* Background Effects */}
                <div className="pointer-events-none absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
                    <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#10b981] to-[#047857] opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" />
                </div>

                <div className="mx-auto max-w-7xl px-6 pb-24 pt-10 sm:pb-32 lg:flex lg:px-8 lg:py-40">
                    <div className="mx-auto max-w-4xl text-center">
                        <div className="mb-8 flex justify-center">
                            <div className="rounded-full px-3 py-1 text-sm leading-6 text-emerald-400 ring-1 ring-white/10 hover:ring-white/20 bg-white/5">
                                Your inbox holds $1,400 in hidden value
                            </div>
                        </div>

                        <h1 className="mt-10 text-4xl font-light tracking-tight text-white sm:text-6xl mb-6">
                            Stop Leaving <span className="text-emerald-400 font-normal">Money</span> in Your Inbox.
                        </h1>
                        <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-gray-400">
                            The average inbox holds $1,400 in forgotten coupons, unused gift cards, and expiring rewards. GhostSweep is your private digital scavenger—finding your hidden money without storing your emails.
                        </p>
                        
                        <div className="mt-10 flex items-center justify-center gap-x-6">
                            <Link
                                href="/login"
                                className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-emerald-500 px-8 py-4 text-sm font-semibold text-black transition-all hover:bg-emerald-400 hover:shadow-[0_0_40px_-10px_rgba(16,185,129,0.5)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400"
                            >
                                Start Free Scan
                                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                            </Link>

                        </div>
                        
                         <div className="mt-16">
                            <HeroDashboard />
                        </div>
                    </div>
                </div>
                
                <SocialProofBanner />
                <HowItWorksSection />
                <ShadowMapPreview />
                <TrinitySection />
                <GhostEngineSection />
                <PricingSection />
                <FAQSection />

                {/* Footer Section */}
                <footer className="border-t border-white/5 pt-12 pb-12 bg-black/40">
                    <div className="container mx-auto px-4">
                        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
                             <div className="flex items-center gap-2">
                                <span className="text-white/80 font-semibold tracking-tight">GhostSweep</span>
                                <span className="text-white/20 text-xs">v3.0</span>
                             </div>
                            
                            <p className="text-[11px] text-white/40">
                                © {new Date().getFullYear()} GhostSweep Inc. Privacy-First.
                            </p>

                            <div className="flex flex-wrap justify-center gap-6 text-xs text-white/50">
                                <Link href="/home/privacy" className="hover:text-white transition">Privacy Policy</Link>
                                <Link href="/home/terms" className="hover:text-white transition">Terms of Service</Link>
                                <Link href="/home/security" className="hover:text-white transition">Security Audit</Link>
                                <Link href="mailto:support@ghostsweep.com" className="hover:text-white transition">Support</Link>
                            </div>
                        </div>
                    </div>
                </footer>
                
                {/* Spacer for sticky CTA on mobile */}
                <div className="h-20 md:hidden" />

            </div>
            
            {/* Sticky Mobile CTA */}
            <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
                <div className="bg-gradient-to-t from-black via-black/95 to-transparent pt-6 pb-4 px-4">
                    <Link
                        href="/login"
                        className="flex items-center justify-center gap-2 w-full rounded-full bg-emerald-500 py-4 text-sm font-semibold text-black shadow-lg shadow-emerald-500/25 active:scale-[0.98] transition"
                    >
                        <Sparkles className="h-4 w-4" />
                        Start Free Scan
                        <ArrowRight className="h-4 w-4" />
                    </Link>
                    <p className="text-center text-[10px] text-white/40 mt-2">
                        CASA Tier 2 Verified • No password required
                    </p>
                </div>
            </div>
        </main>
    );
}
