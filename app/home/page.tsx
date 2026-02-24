/* eslint-disable react/no-unescaped-entities */
"use client";

import Link from "next/link";
import Image from "next/image";
import Script from "next/script";
import {
    ArrowRight,
    Check,
    Sparkles,
    Mail,
    Ghost,
    Lock,
    EyeOff,
    ShieldCheck,
    Fingerprint,
    Instagram,
    Music2,
    ScanSearch,
    Search,
    Trash2,
    Shield,
    Eye,
    AlertTriangle,
    ChevronRight,
    Inbox,
    MailX,
    DollarSign,
    User,
    Linkedin,
} from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";
import { GmailLogo } from "@/svgs";
import TeaserScan from "./_components/teaser-scan";

// ─── Structured Data ───────────────────────────────────────────
const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "GhostSweep | Know Your Digital Shadow",
    description:
        "GhostSweep discovers every account tied to your inbox, finds shadow profiles across the web, recovers hidden value from gift cards and coupons, monitors data breaches, and helps you delete the accounts you don't need — all from one dashboard.",
    url: "https://ghostsweep.com/home",
    image: "https://znlaksqttxokoeavwqjf.supabase.co/storage/v1/object/public/news/ghost-svgrepo-com.png",
    applicationCategory: "SecurityApplication",
    operatingSystem: "Web",
    publisher: {
        "@type": "Organization",
        name: "GhostSweep",
        logo: {
            "@type": "ImageObject",
            url: "https://znlaksqttxokoeavwqjf.supabase.co/storage/v1/object/public/news/ghost-svgrepo-com.png",
        },
    },
};

const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
        {
            "@type": "Question",
            name: "What does GhostSweep actually do?",
            acceptedAnswer: {
                "@type": "Answer",
                text: "GhostSweep connects to your Gmail or Outlook inbox to discover every account you've ever signed up for. It also scans the web for shadow profiles tied to your email, phone, or username. Once discovered, it helps you delete unused accounts, recover forgotten gift cards and coupons, monitor data breaches, and unsubscribe from newsletters — all from one dashboard.",
            },
        },
        {
            "@type": "Question",
            name: "What is a shadow profile?",
            acceptedAnswer: {
                "@type": "Answer",
                text: "A shadow profile is an account that exists on a website or service under your email, phone number, or username — often without your knowledge. These can be old sign-ups, data-harvested entries, or accounts you forgot about years ago. GhostSweep's Identity Shadow scanner finds them across hundreds of services.",
            },
        },
        {
            "@type": "Question",
            name: "How does GhostSweep find value in my inbox?",
            acceptedAnswer: {
                "@type": "Answer",
                text: "GhostSweep scans your inbox for forgotten digital gift cards, unused rewards points, expiring coupons, and active subscriptions. The average user discovers over $285 in hidden value that would have otherwise gone to waste.",
            },
        },
        {
            "@type": "Question",
            name: "Is GhostSweep safe to use with my email?",
            acceptedAnswer: {
                "@type": "Answer",
                text: "Yes. GhostSweep is CASA Tier 2 verified by Google. We use transient, RAM-only processing — your raw email data is never stored or sold. We're a privacy-first platform built by a privacy advocate.",
            },
        },
        {
            "@type": "Question",
            name: "Can GhostSweep help me delete old accounts?",
            acceptedAnswer: {
                "@type": "Answer",
                text: "Yes. GhostSweep discovers accounts through your inbox and shadow profile scans, then provides direct links and step-by-step instructions to delete them. You can also track deletion status and permanently remove entries from your dashboard.",
            },
        },
        {
            "@type": "Question",
            name: "Do you sell my data?",
            acceptedAnswer: {
                "@type": "Answer",
                text: "Never. We have a strict zero-data-selling policy. GhostSweep exists to protect your privacy, not exploit it. We don't sell your personal data, browsing habits, or purchase history to anyone.",
            },
        },
    ],
};

// ─── Animated Counter ──────────────────────────────────────────
function CountUp({
    value,
    duration = 1200,
    prefix = "",
    suffix = "",
}: {
    value: number;
    duration?: number;
    prefix?: string;
    suffix?: string;
}) {
    const [display, setDisplay] = useState(0);
    const ref = useRef<HTMLSpanElement>(null);
    const hasAnimated = useRef(false);

    useEffect(() => {
        if (hasAnimated.current) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !hasAnimated.current) {
                    hasAnimated.current = true;
                    const start = performance.now();
                    const tick = (now: number) => {
                        const progress = Math.min((now - start) / duration, 1);
                        setDisplay(Math.round(progress * value));
                        if (progress < 1) requestAnimationFrame(tick);
                    };
                    requestAnimationFrame(tick);
                }
            },
            { threshold: 0.3 }
        );

        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, [value, duration]);

    return (
        <span ref={ref}>
            {prefix}
            {display.toLocaleString()}
            {suffix}
        </span>
    );
}

// ─── Trustpilot ────────────────────────────────────────────────
declare global {
    interface Window {
        Trustpilot?: { loadFromElement: (el: HTMLElement, reinitialize?: boolean) => void };
    }
}

function TrustpilotWidget() {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Script may already be loaded if user navigated back
        if (window.Trustpilot && ref.current) {
            window.Trustpilot.loadFromElement(ref.current, true);
        }
    }, []);

    return (
        <>
            <Script
                src="//widget.trustpilot.com/bootstrap/v5/tp.widget.bootstrap.min.js"
                strategy="lazyOnload"
                onLoad={() => {
                    if (window.Trustpilot && ref.current) {
                        window.Trustpilot.loadFromElement(ref.current, true);
                    }
                }}
            />
            <div
                ref={ref}
                className="trustpilot-widget"
                data-locale="en-US"
                data-template-id="56278e9abfbbba0bdcd568bc"
                data-businessunit-id="698a0804abb8a0a2645298d1"
                data-style-height="52px"
                data-style-width="100%"
                data-token="a4f1da35-84f9-4ce7-a194-d98c7539f15d"
            >
                <a
                    href="https://www.trustpilot.com/review/ghostsweep.com"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    Trustpilot
                </a>
            </div>
        </>
    );
}

// ─── Hero ──────────────────────────────────────────────────────
function Hero({ onScan }: { onScan?: (username: string) => void }) {
    const [heroInput, setHeroInput] = useState("");

    const handleHeroScan = () => {
        if (!heroInput.trim()) return;
        onScan?.(heroInput.trim());
    };

    return (
        <section className="relative isolate overflow-hidden pt-24 pb-20 sm:pt-36 sm:pb-32">
            {/* Background glow */}
            <div className="pointer-events-none absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
                <div className="relative left-[calc(50%-11rem)] aspect-1155/678 w-xl -translate-x-1/2 rotate-30 bg-linear-to-tr from-emerald-500 to-teal-700 opacity-15 sm:left-[calc(50%-30rem)] sm:w-6xl" />
            </div>

            <div className="mx-auto max-w-5xl px-6 text-center">
                {/* Pill */}
                <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs text-white/60">
                    <Ghost className="h-3 w-3 text-emerald-400" />
                    <span>Digital privacy, account control, and hidden value — one platform</span>
                </div>

                {/* Headline */}
                <h1 className="text-5xl sm:text-7xl font-semibold tracking-tight text-white leading-[1.08]">
                    Every account.{" "}
                    <br className="hidden sm:block" />
                    Every trace.{" "}
                    <span className="text-emerald-400">Found.</span>
                </h1>

                <p className="mx-auto mt-8 max-w-2xl text-lg sm:text-xl text-white/50 font-light leading-relaxed">
                    GhostSweep connects to your Gmail or Outlook, discovers every account you've ever created,
                    scans the web for shadow profiles, recovers hidden money from your inbox, and helps you{" "}
                    <span className="text-white/80">
                        delete what you don't need
                    </span>.
                </p>

                {/* Inline shadow scan — the "Aha" moment before the paywall */}
                <div className="mt-12 w-full max-w-sm mx-auto">
                    <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 pl-4 pr-1.5 py-1.5 focus-within:border-purple-500/30 transition backdrop-blur-sm">
                        <User className="h-3.5 w-3.5 text-white/25 shrink-0" />
                        <input
                            type="text"
                            placeholder="your_username"
                            value={heroInput}
                            onChange={(e) => setHeroInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleHeroScan()}
                            className="flex-1 min-w-0 bg-transparent text-sm text-white placeholder-white/25 focus:outline-none"
                            autoComplete="off"
                            spellCheck={false}
                        />
                        <button
                            onClick={handleHeroScan}
                            disabled={!heroInput.trim()}
                            className="rounded-full bg-purple-500 px-4 py-2 text-xs font-semibold text-white hover:bg-purple-400 disabled:opacity-25 transition active:scale-95 shrink-0"
                        >
                            Scan free
                        </button>
                    </div>
                    <p className="text-[10px] text-white/20 text-center mt-2">
                        No account needed · 3 real profiles instantly · No credit card ever
                    </p>
                </div>

                {/* Secondary CTAs */}
                <div className="mt-5 flex items-center justify-center gap-5 text-sm text-white/35">
                    <Link
                        href="/login"
                        className="inline-flex items-center gap-1.5 hover:text-white/60 transition"
                    >
                        Connect Gmail for full scan
                        <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                    <span className="text-white/10">·</span>
                    <Link
                        href="/home/how-it-works"
                        className="inline-flex items-center gap-1 hover:text-white/60 transition"
                    >
                        How it works
                        <ChevronRight className="h-3 w-3" />
                    </Link>
                </div>

                {/* Trust strip */}
                <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[11px] text-white/35">
                    <span className="flex items-center gap-1.5">
                        <ShieldCheck className="h-3.5 w-3.5 text-emerald-400/60" />
                        CASA Tier 2 Verified
                    </span>
                    <span className="hidden sm:inline text-white/10">|</span>
                    <span className="flex items-center gap-1.5">
                        <Lock className="h-3.5 w-3.5" />
                        Zero email storage
                    </span>
                    <span className="hidden sm:inline text-white/10">|</span>
                    <span className="flex items-center gap-1.5">
                        <EyeOff className="h-3.5 w-3.5" />
                        We never sell your data
                    </span>
                    <span className="hidden sm:inline text-white/10">|</span>
                    <span className="flex items-center gap-1.5">
                        <GmailLogo className="h-3.5 w-3.5" />
                        Google Verified App
                    </span>
                </div>

                {/* Trustpilot */}
                <div className="mt-6 max-w-xs mx-auto">
                    <TrustpilotWidget />
                </div>
            </div>
        </section>
    );
}

// ─── Dashboard Preview ─────────────────────────────────────────
function DashboardPreview() {
    return (
        <section className="relative -mt-4 pb-24">
            <div className="mx-auto max-w-5xl px-6">
                <div className="relative rounded-2xl border border-white/10 bg-black/60 p-1 shadow-2xl shadow-emerald-900/10">
                    <div className="absolute -inset-1 rounded-2xl bg-linear-to-r from-emerald-500/15 via-transparent to-emerald-500/15 blur-sm opacity-60" />
                    <div className="relative rounded-xl bg-[#0A0A0A] overflow-hidden">
                        {/* Window chrome */}
                        <div className="flex items-center gap-2 border-b border-white/5 px-5 py-3.5">
                            <div className="h-2.5 w-2.5 rounded-full bg-white/10" />
                            <div className="h-2.5 w-2.5 rounded-full bg-white/10" />
                            <div className="h-2.5 w-2.5 rounded-full bg-white/10" />
                            <span className="ml-3 text-[10px] font-mono text-white/20 uppercase tracking-widest">
                                GhostSweep Dashboard — Live Scan
                            </span>
                        </div>

                        {/* Stat cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-px bg-white/5">
                            <div className="bg-[#0A0A0A] p-6 sm:p-8">
                                <div className="flex items-center gap-2 mb-4">
                                    <Inbox className="h-4 w-4 text-emerald-400/60" />
                                    <span className="text-[10px] uppercase tracking-widest text-white/30 font-medium">
                                        Accounts Found
                                    </span>
                                </div>
                                <div className="text-4xl font-light text-emerald-400 tabular-nums">
                                    <CountUp value={134} />
                                </div>
                            </div>
                            <div className="bg-[#0A0A0A] p-6 sm:p-8">
                                <div className="flex items-center gap-2 mb-4">
                                    <Ghost className="h-4 w-4 text-purple-400/60" />
                                    <span className="text-[10px] uppercase tracking-widest text-white/30 font-medium">
                                        Shadow Profiles
                                    </span>
                                </div>
                                <div className="text-4xl font-light text-purple-400 tabular-nums">
                                    <CountUp value={37} />
                                </div>
                            </div>
                            <div className="bg-[#0A0A0A] p-6 sm:p-8">
                                <div className="flex items-center gap-2 mb-4">
                                    <AlertTriangle className="h-4 w-4 text-red-400/60" />
                                    <span className="text-[10px] uppercase tracking-widest text-white/30 font-medium">
                                        Breached
                                    </span>
                                </div>
                                <div className="text-4xl font-light text-red-400 tabular-nums">
                                    <CountUp value={12} />
                                </div>
                            </div>
                            <div className="bg-[#0A0A0A] p-6 sm:p-8">
                                <div className="flex items-center gap-2 mb-4">
                                    <DollarSign className="h-4 w-4 text-amber-400/60" />
                                    <span className="text-[10px] uppercase tracking-widest text-white/30 font-medium">
                                        Hidden Value
                                    </span>
                                </div>
                                <div className="text-4xl font-light text-amber-400 tabular-nums">
                                    <CountUp value={285} prefix="$" />
                                </div>
                            </div>
                        </div>

                        {/* Terminal output */}
                        <div className="border-t border-white/5 p-6 font-mono text-xs space-y-2.5 text-white/30">
                            <div className="flex items-center gap-2 text-emerald-400/70">
                                <ScanSearch className="h-3 w-3" />
                                <span>Scanning inbox: j***@gmail.com</span>
                            </div>
                            <div className="pl-5">
                                → Discovered accounts on{" "}
                                <span className="text-white/50">linkedin.com</span>,{" "}
                                <span className="text-white/50">spotify.com</span>,{" "}
                                <span className="text-red-400/70">adobe.com (breached)</span>
                            </div>
                            <div className="pl-5">
                                → Shadow profile found on{" "}
                                <span className="text-purple-400/70">canva.com</span>,{" "}
                                <span className="text-purple-400/70">notion.so</span>
                            </div>
                            <div className="pl-5">
                                → Recovered:{" "}
                                <span className="text-amber-400/70">$25.00 Starbucks gift card</span>,{" "}
                                <span className="text-amber-400/70">15% off coupon (expires 3 days)</span>
                            </div>
                            <div className="pl-5">
                                → Found{" "}
                                <span className="text-white/50">18 newsletter subscriptions</span>{" "}
                                ready to unsubscribe
                            </div>
                            <div className="flex items-center gap-2 text-white/20 animate-pulse">
                                <span>▎</span>
                                <span>Scanning for more…</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

// ─── What GhostSweep Does ──────────────────────────────────────
function WhatWeDoSection() {
    const capabilities = [
        {
            icon: Inbox,
            title: "Inbox Account Discovery",
            description:
                "Connect your Gmail or Outlook and we'll scan your inbox to discover every service you've ever signed up for — dating back years.",
            color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
        },
        {
            icon: Fingerprint,
            title: "Shadow Profile Scanner",
            description:
                "Enter your email, phone, or username. We search the web across hundreds of services to find accounts linked to your identity — even ones you never created.",
            color: "text-purple-400 bg-purple-500/10 border-purple-500/20",
        },
        {
            icon: AlertTriangle,
            title: "Breach Detection & Monitoring",
            description:
                "Every discovered account is cross-referenced against known data breaches. Get alerts when your credentials appear in new leaks.",
            color: "text-red-400 bg-red-500/10 border-red-500/20",
        },
        {
            icon: Trash2,
            title: "Account Deletion",
            description:
                "Found accounts you forgot about or don't want? We provide direct links and step-by-step guides to delete them permanently.",
            color: "text-rose-400 bg-rose-500/10 border-rose-500/20",
        },
        {
            icon: DollarSign,
            title: "Hidden Value Recovery",
            description:
                "We dig through your inbox for forgotten gift cards, unused rewards points, expiring coupons, and active subscriptions you might be overpaying for.",
            color: "text-amber-400 bg-amber-500/10 border-amber-500/20",
        },
        {
            icon: MailX,
            title: "Newsletter Unsubscribe",
            description:
                "See every newsletter and marketing list you're subscribed to in one place. Unsubscribe from what you don't need with one click.",
            color: "text-blue-400 bg-blue-500/10 border-blue-500/20",
        },
    ];

    return (
        <section className="py-28 border-t border-white/5">
            <div className="mx-auto max-w-5xl px-6">
                <div className="text-center mb-20">
                    <p className="text-sm uppercase tracking-[0.2em] text-white/25 mb-6">
                        What we do
                    </p>
                    <h2 className="text-3xl sm:text-5xl font-semibold tracking-tight text-white leading-tight">
                        One platform.{" "}
                        <br className="hidden sm:block" />
                        <span className="text-white/30">Total digital control.</span>
                    </h2>
                    <p className="mx-auto mt-6 max-w-xl text-base text-white/45 leading-relaxed">
                        GhostSweep brings together everything you need to understand, clean up, and protect your digital presence.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {capabilities.map((cap) => (
                        <div
                            key={cap.title}
                            className="rounded-2xl border border-white/5 bg-white/2 p-8 hover:border-white/10 transition-colors duration-300"
                        >
                            <div className={`h-11 w-11 rounded-xl border flex items-center justify-center mb-5 ${cap.color}`}>
                                <cap.icon className="h-5 w-5" />
                            </div>
                            <h3 className="text-base font-medium text-white mb-2">
                                {cap.title}
                            </h3>
                            <p className="text-sm text-white/40 leading-relaxed">
                                {cap.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

// ─── How It Works ──────────────────────────────────────────────
function HowItWorksSection() {
    const steps = [
        {
            num: "01",
            title: "Connect your inbox",
            description:
                "Sign in with Gmail or Outlook. GhostSweep securely scans your inbox to discover every account, subscription, and newsletter tied to your email.",
            icon: Mail,
        },
        {
            num: "02",
            title: "We scan everywhere",
            description:
                "Your inbox reveals hidden accounts. Our shadow scanner searches the web for profiles you didn't even know existed. Breach databases are checked in real-time.",
            icon: ScanSearch,
        },
        {
            num: "03",
            title: "See the full picture",
            description:
                "Everything surfaces on your dashboard — accounts, shadow profiles, breaches, forgotten gift cards, active subscriptions, and newsletters. Risk-scored and organized.",
            icon: Eye,
        },
        {
            num: "04",
            title: "Take action",
            description:
                "Delete accounts you don't need. Unsubscribe from junk newsletters. Recover hidden value. Secure breached credentials. Your digital life, cleaned up.",
            icon: Trash2,
        },
    ];

    return (
        <section className="py-28 border-t border-white/5">
            <div className="mx-auto max-w-5xl px-6">
                <div className="text-center mb-20">
                    <p className="text-sm uppercase tracking-[0.2em] text-white/25 mb-6">
                        How it works
                    </p>
                    <h2 className="text-3xl sm:text-5xl font-semibold tracking-tight text-white">
                        Connect. Discover.{" "}
                        <br className="hidden sm:block" />
                        <span className="text-white/30">Take control.</span>
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {steps.map((step) => (
                        <div
                            key={step.num}
                            className="group relative rounded-2xl border border-white/5 bg-white/2 p-8 hover:border-white/10 transition-all duration-300"
                        >
                            <div className="flex items-start gap-5">
                                <div className="shrink-0 h-12 w-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                                    <step.icon className="h-5 w-5 text-emerald-400" />
                                </div>
                                <div>
                                    <span className="text-[10px] font-mono text-white/20 uppercase tracking-widest">
                                        Step {step.num}
                                    </span>
                                    <h3 className="text-lg font-medium text-white mt-1 mb-2">
                                        {step.title}
                                    </h3>
                                    <p className="text-sm text-white/40 leading-relaxed">
                                        {step.description}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

// ─── Identity Shadow Feature Spotlight ─────────────────────────
function IdentityShadowSection({
    defaultUsername = "",
    scanKey = 0,
    autoStart = false,
}: {
    defaultUsername?: string;
    scanKey?: number;
    autoStart?: boolean;
}) {
    return (
        <section className="py-28 border-t border-white/5 relative overflow-hidden" id="shadow-scan">
            {/* Subtle background glow */}
            <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-purple-500/5 blur-3xl" />

            <div className="mx-auto max-w-5xl px-6 relative z-10">
                <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/20 bg-purple-500/5 px-4 py-1.5 text-xs text-purple-400 mb-6">
                        <Fingerprint className="h-3 w-3" />
                        <span>New — Identity Shadow Scanner</span>
                    </div>
                    <h2 className="text-3xl sm:text-5xl font-semibold tracking-tight text-white leading-tight">
                        Your inbox shows what you signed up for.
                        <br />
                        <span className="text-white/30">We find what you didn&apos;t.</span>
                    </h2>
                    <p className="mx-auto mt-6 max-w-xl text-base text-white/45 leading-relaxed">
                        Beyond inbox scanning, the Identity Shadow scanner searches the open web using your email, phone number, or username — discovering accounts and profiles that exist without your knowledge.
                    </p>
                </div>

                {/* Live teaser scan */}
                <div className="max-w-2xl mx-auto mb-16">
                    <TeaserScan
                        key={scanKey}
                        defaultUsername={defaultUsername}
                        autoStart={autoStart}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {[
                        {
                            icon: Search,
                            title: "Web-Wide Discovery",
                            description:
                                "We search across hundreds of services using your selectors — email, phone, or username — to find accounts you never knew existed.",
                        },
                        {
                            icon: AlertTriangle,
                            title: "Breach Cross-Reference",
                            description:
                                "Every shadow profile is checked against known data breaches. See which ghost accounts have already been compromised.",
                        },
                        {
                            icon: Shield,
                            title: "Risk Scoring",
                            description:
                                "Each profile gets a risk score based on breach history, data sensitivity, and account age. Focus on what matters most.",
                        },
                        {
                            icon: Trash2,
                            title: "Full Remediation",
                            description:
                                "Visit the account, mark it as deleted, ignore it, or permanently remove it from your shadow map. Your identity, your rules.",
                        },
                    ].map((feature) => (
                        <div
                            key={feature.title}
                            className="rounded-2xl border border-white/5 bg-white/2 p-8 hover:border-purple-500/20 transition-colors duration-300"
                        >
                            <feature.icon className="h-6 w-6 text-purple-400 mb-4" />
                            <h3 className="text-base font-medium text-white mb-2">
                                {feature.title}
                            </h3>
                            <p className="text-sm text-white/40 leading-relaxed">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>

                {/* CTA */}
                <div className="mt-14 text-center">
                    <Link
                        href="/login"
                        className="group inline-flex items-center gap-2.5 rounded-full bg-white/5 border border-white/10 px-8 py-4 text-sm text-white hover:bg-white/10 transition"
                    >
                        <Fingerprint className="h-4 w-4 text-purple-400" />
                        Discover your shadow profiles
                        <ArrowRight className="h-4 w-4 opacity-40 group-hover:opacity-100 transition-opacity" />
                    </Link>
                </div>
            </div>
        </section>
    );
}

// ─── Privacy Section ───────────────────────────────────────────
function PrivacySection() {
    return (
        <section className="py-28 border-t border-white/5 bg-white/2">
            <div className="mx-auto max-w-5xl px-6">
                <div className="flex flex-col lg:flex-row items-start gap-16">
                    <div className="flex-1 space-y-8">
                        <p className="text-sm uppercase tracking-[0.2em] text-white/25">
                            Privacy
                        </p>
                        <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white leading-tight">
                            We see your shadow.
                            <br />
                            <span className="text-white/30">Never your secrets.</span>
                        </h2>
                        <p className="text-base text-white/45 leading-relaxed max-w-lg">
                            Competitors sell your data to hedge funds. We built the opposite.
                            GhostSweep uses transient, RAM-only processing. Your raw data is
                            never stored, never sold, never shared. Privacy isn't a feature —
                            it's the architecture.
                        </p>

                        <div className="space-y-5 pt-2">
                            {[
                                {
                                    icon: ShieldCheck,
                                    title: "CASA Tier 2 Verified",
                                    text: "Google-vetted security certification for apps handling sensitive user data.",
                                },
                                {
                                    icon: EyeOff,
                                    title: "Transient Processing",
                                    text: "Scanned, extracted, deleted. Your raw email data never touches permanent storage.",
                                },
                                {
                                    icon: Lock,
                                    title: "End-to-End Encrypted",
                                    text: "256-bit encryption on every connection. Your data is protected in transit and at rest.",
                                },
                            ].map((item) => (
                                <div key={item.title} className="flex gap-4">
                                    <div className="mt-0.5 h-9 w-9 shrink-0 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                                        <item.icon className="h-4 w-4 text-emerald-400" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-medium text-white mb-0.5">
                                            {item.title}
                                        </h4>
                                        <p className="text-xs text-white/40 leading-relaxed">
                                            {item.text}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="flex flex-wrap gap-4 pt-2">
                            <div className="flex items-center gap-2 px-4 py-2 rounded-lg border border-white/10 bg-[#EA4335]/10 text-white/70 text-xs">
                                <GmailLogo className="h-4 w-4 opacity-70" />
                                <span>Google Verified Partner</span>
                            </div>
                        </div>
                    </div>

                    {/* Terminal visual */}
                    <div className="flex-1 w-full">
                        <div className="rounded-2xl border border-white/10 bg-black/80 overflow-hidden shadow-2xl">
                            <div className="flex items-center gap-2 border-b border-white/5 px-5 py-3.5 bg-white/3">
                                <div className="h-2.5 w-2.5 rounded-full bg-white/10" />
                                <div className="h-2.5 w-2.5 rounded-full bg-white/10" />
                                <div className="h-2.5 w-2.5 rounded-full bg-white/10" />
                                <span className="ml-2 text-[10px] text-white/20 font-mono">
                                    privacy_audit.log
                                </span>
                            </div>
                            <div className="p-6 font-mono text-xs space-y-3">
                                <div className="flex items-center gap-2 text-emerald-400/70">
                                    <Check className="h-3 w-3" />
                                    <span>Inbox scan initiated: 8,294 emails queued</span>
                                </div>
                                <div className="text-white/30 pl-5">
                                    Processing in transient memory…
                                </div>
                                <div className="flex items-center gap-2 text-emerald-400/70 pl-5">
                                    <Check className="h-3 w-3" />
                                    <span>134 accounts discovered via inbox</span>
                                </div>
                                <div className="flex items-center gap-2 text-purple-400/70 pl-5">
                                    <Fingerprint className="h-3 w-3" />
                                    <span>37 shadow profiles found via web scan</span>
                                </div>
                                <div className="flex items-center gap-2 text-red-400/70 pl-5">
                                    <AlertTriangle className="h-3 w-3" />
                                    <span>12 accounts linked to known breaches</span>
                                </div>
                                <div className="flex items-center gap-2 text-amber-400/70 pl-5">
                                    <DollarSign className="h-3 w-3" />
                                    <span>$285 in forgotten gift cards & coupons</span>
                                </div>
                                <div className="flex items-center gap-2 text-blue-400/70 pl-5">
                                    <MailX className="h-3 w-3" />
                                    <span>18 newsletters ready to unsubscribe</span>
                                </div>
                                <div className="flex items-center gap-2 text-emerald-400 pl-5 bg-emerald-500/10 py-1.5 px-2 rounded w-fit">
                                    <Lock className="h-3 w-3" />
                                    <span>Raw data purged. Zero residual storage.</span>
                                </div>
                                <div className="text-white/20 pl-5 pt-1 animate-pulse">
                                    ▎ Audit complete. Your data stays yours.
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

// ─── Pricing ───────────────────────────────────────────────────
function PricingSection() {
    const plans = [
        {
            name: "Free",
            price: "$0",
            period: "",
            oneTime: false,
            badge: null as string | null,
            badgeStyle: "",
            description: "See what's hiding in your inbox and across the web.",
            cta: "Start Free",
            href: "/login",
            featured: false,
            accentClass: "text-white",
            checkClass: "text-white/25",
            borderClass: "border-white/5 bg-white/2",
            ctaClass: "bg-white/5 border border-white/10 text-white hover:bg-white/10",
            features: [
                { text: "1 inbox scan (link your Gmail)", locked: false },
                { text: "5 ghost profiles visible (rest blurred)", locked: false },
                { text: "Breach summary — times your email leaked", locked: false },
                { text: "Gift cards & hidden accounts found", locked: true },
                { text: "Full ghost account list", locked: true },
            ],
        },
        {
            name: 'The "Buster"',
            price: "$19",
            period: "",
            oneTime: true,
            badge: "One-Time Pass",
            badgeStyle: "bg-amber-500 text-black",
            description: "Deep audit on up to 3 emails. Pay once, no recurring bill.",
            cta: "Buy Once — $19",
            href: "/login?plan=buster",
            featured: false,
            accentClass: "text-amber-400",
            checkClass: "text-amber-400",
            borderClass: "border-amber-500/20 bg-amber-500/[0.04]",
            ctaClass: "bg-amber-500/15 border border-amber-500/30 text-amber-300 hover:bg-amber-500/25",
            features: [
                { text: "3 scan credits (Work, Personal, Old School)", locked: false },
                { text: "Full Maigret OSINT deep-web search", locked: false },
                { text: "Every ghost account & gift card unlocked", locked: false },
                { text: "PDF Identity Audit + 1Password-ready CSV", locked: false },
                { text: "One-click account deletion links", locked: false },
                { text: "No subscription — pay once, stay clean", locked: false },
            ],
        },
        {
            name: "Pro",
            price: "$14.99",
            period: "/mo",
            oneTime: false,
            badge: "3-Day Free Trial",
            badgeStyle: "bg-purple-500 text-white",
            description: "Full visibility, unlimited connections, and real-time monitoring.",
            cta: "Start Free Trial",
            href: "/login?plan=monthly",
            featured: false,
            accentClass: "text-emerald-400",
            checkClass: "text-emerald-400/60",
            borderClass: "border-white/5 bg-white/2",
            ctaClass: "bg-white/5 border border-white/10 text-white hover:bg-white/10",
            features: [
                { text: "Everything in Buster", locked: false },
                { text: "Unlimited inbox connections", locked: false },
                { text: "Real-time breach alerts", locked: false },
                { text: "Weekly shadow web re-scan", locked: false },
                { text: 'Newsletter "Ghost" unsubscribe', locked: false },
            ],
        },
        {
            name: "Sentinel",
            price: "$89",
            period: "/yr",
            oneTime: false,
            badge: "Best Value — Save 50%+",
            badgeStyle: "bg-emerald-500 text-black",
            description: "Everything in Pro. Best value — save 50%+ vs monthly.",
            cta: "Get Sentinel",
            href: "/login?plan=annual",
            featured: true,
            accentClass: "text-emerald-400",
            checkClass: "text-emerald-400",
            borderClass: "border-emerald-500/30 bg-white/5 shadow-2xl shadow-emerald-900/20",
            ctaClass: "bg-emerald-500 text-black hover:bg-emerald-400",
            features: [
                { text: "Everything in Pro", locked: false },
                { text: 'Priority "Shadow Watch" scan queue', locked: false },
                { text: "Gift card expiry alerts", locked: false },
                { text: "Monthly Identity Health Report (PDF)", locked: false },
                { text: "Priority deletion support", locked: false },
            ],
        },
    ];

    return (
        <section className="py-28 border-t border-white/5" id="pricing">
            <div className="mx-auto max-w-6xl px-6">
                <div className="text-center mb-16">
                    <p className="text-sm uppercase tracking-[0.2em] text-white/25 mb-6">
                        Pricing
                    </p>
                    <h2 className="text-3xl sm:text-5xl font-semibold tracking-tight text-white">
                        Simple plans.
                        <br />
                        <span className="text-white/30">Real results.</span>
                    </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                    {plans.map((plan) => (
                        <div
                            key={plan.name}
                            className={`relative rounded-2xl border p-7 flex flex-col ${plan.borderClass}`}
                        >
                            {plan.badge && (
                                <div className={`absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wide ${plan.badgeStyle}`}>
                                    {plan.badge}
                                </div>
                            )}
                            <div className="mb-1 text-sm font-medium text-white/60">
                                {plan.name}
                            </div>
                            <div className="flex items-baseline gap-1 mb-1">
                                <span className={`text-4xl font-light ${plan.accentClass}`}>
                                    {plan.price}
                                </span>
                                {plan.period && (
                                    <span className="text-white/30 text-sm">{plan.period}</span>
                                )}
                            </div>
                            {plan.oneTime && (
                                <p className="text-[11px] text-amber-400/70 font-medium mb-1">
                                    One-time payment
                                </p>
                            )}
                            <p className="text-xs text-white/35 mb-6 mt-1">
                                {plan.description}
                            </p>
                            <ul className="space-y-2.5 mb-8 flex-1">
                                {plan.features.map((feature) => (
                                    <li
                                        key={feature.text}
                                        className="flex items-start gap-2 text-xs"
                                    >
                                        {feature.locked ? (
                                            <Lock className="h-3.5 w-3.5 shrink-0 mt-0.5 text-white/15" />
                                        ) : (
                                            <Check className={`h-3.5 w-3.5 shrink-0 mt-0.5 ${plan.checkClass}`} />
                                        )}
                                        <span className={feature.locked ? "text-white/20" : "text-white/60"}>
                                            {feature.text}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                            <Link
                                href={plan.href}
                                className={`w-full flex items-center justify-center rounded-lg py-2.5 text-sm font-medium transition ${plan.ctaClass}`}
                            >
                                {plan.cta}
                            </Link>
                        </div>
                    ))}
                </div>

                <p className="text-center mt-8 text-xs text-white/25">
                    Cancel anytime. 30-day money-back guarantee.
                </p>
            </div>
        </section>
    );
}

// ─── FAQ ────────────────────────────────────────────────────────
function FAQSection() {
    const faqs = [
        {
            q: "What does GhostSweep actually do?",
            a: "GhostSweep connects to your Gmail or Outlook inbox to discover every account you've ever signed up for. It also scans the web for shadow profiles tied to your email, phone, or username. Once discovered, it helps you delete unused accounts, recover forgotten gift cards and coupons, monitor data breaches, and unsubscribe from newsletters — all from one dashboard.",
        },
        {
            q: "What is a shadow profile?",
            a: "A shadow profile is an account that exists on a website or service under your email, phone number, or username — often without your knowledge. These can be old sign-ups, data-harvested entries, or accounts you forgot about years ago. GhostSweep's Identity Shadow scanner finds them across hundreds of services.",
        },
        {
            q: "How does GhostSweep find hidden value in my inbox?",
            a: "We scan your inbox for forgotten digital gift cards, unused rewards points, expiring coupons, and active subscriptions you might be overpaying for. The average user discovers over $285 in hidden value that would have otherwise gone to waste.",
        },
        {
            q: "Can GhostSweep help me delete old accounts?",
            a: "Yes. GhostSweep discovers accounts through your inbox and shadow profile scans, then provides direct links and step-by-step instructions to delete them. You can track deletion status and permanently remove entries from your dashboard.",
        },
        {
            q: "Is GhostSweep safe to use with my email?",
            a: "Yes. We're CASA Tier 2 verified by Google. We use transient, RAM-only processing — your raw email data is never stored, never sold, never shared. Privacy is the architecture, not a feature.",
        },
        {
            q: "Do you sell my data?",
            a: "Never. We have a strict zero-data-selling policy. GhostSweep exists to protect your privacy, not exploit it. We don't sell your personal data, browsing habits, or purchase history to anyone.",
        },
    ];

    return (
        <section className="py-28 border-t border-white/5" id="faq">
            <div className="mx-auto max-w-3xl px-6">
                <div className="text-center mb-16">
                    <p className="text-sm uppercase tracking-[0.2em] text-white/25 mb-6">
                        FAQ
                    </p>
                    <h2 className="text-3xl font-semibold tracking-tight text-white">
                        Common questions
                    </h2>
                </div>
                <div className="space-y-4">
                    {faqs.map((faq, i) => (
                        <div
                            key={i}
                            className="rounded-xl border border-white/5 bg-white/2 p-6 hover:border-white/10 transition"
                        >
                            <h3 className="text-sm font-medium text-white mb-2">
                                {faq.q}
                            </h3>
                            <p className="text-sm text-white/40 leading-relaxed">
                                {faq.a}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

// ─── Founder ───────────────────────────────────────────────────
function FounderSection() {
    return (
        <section className="py-28 border-t border-white/5" id="founder">
            <div className="mx-auto max-w-4xl px-6">
                <div className="flex flex-col md:flex-row items-center gap-12 md:gap-16">
                    <div className="relative shrink-0">
                        <div className="relative w-48 h-48 md:w-56 md:h-56 rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-emerald-500/10">
                            <Image
                                src="https://ghostsweep.t3.storage.dev/f1789004-4f47-4d23-a5c9-d66f62e532f3.jpg"
                                alt="Joel Komieter — Founder of GhostSweep"
                                fill
                                className="object-cover"
                                priority
                            />
                            <div className="absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-transparent" />
                        </div>
                        <a
                            href="https://www.linkedin.com/in/joelkomieter"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="absolute -bottom-3 -right-3 flex items-center gap-1.5 rounded-full bg-[#0A66C2] px-3 py-1.5 text-xs font-medium text-white shadow-lg hover:bg-[#004182] transition-colors"
                        >
                            <Linkedin className="h-3.5 w-3.5" />
                            <span>Verified Founder</span>
                        </a>
                    </div>

                    <div className="flex-1 text-center md:text-left">
                        <span className="text-5xl text-emerald-400/40 font-serif leading-none select-none">
                            &ldquo;
                        </span>
                        <blockquote className="text-xl md:text-2xl font-light text-white/80 leading-relaxed mb-6 -mt-4">
                            I built GhostSweep because your digital identity shouldn't be
                            someone else's business model. Every forgotten account is a risk.
                            Every shadow profile is a vulnerability. Every buried gift card is money left on the table.
                            This tool exists to give that power back to you.
                        </blockquote>
                        <div>
                            <p className="font-medium text-white">Joel Komieter</p>
                            <p className="text-sm text-white/40">Founder & Engineer</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

// ─── Final CTA ─────────────────────────────────────────────────
function FinalCTA() {
    return (
        <section className="py-28 border-t border-white/5">
            <div className="mx-auto max-w-3xl px-6 text-center">
                <h2 className="text-3xl sm:text-5xl font-semibold tracking-tight text-white leading-tight">
                    Your digital life is messier
                    <br />
                    than you think.{" "}
                    <span className="text-emerald-400">Clean it up.</span>
                </h2>
                <p className="mx-auto mt-6 max-w-lg text-base text-white/40 leading-relaxed">
                    In under two minutes, you'll see every forgotten account, every shadow
                    profile, every breach risk, and every dollar hiding in your inbox.
                </p>
                <div className="mt-10">
                    <Link
                        href="/login"
                        className="group inline-flex items-center gap-2.5 rounded-full bg-emerald-500 px-10 py-5 text-base font-semibold text-black transition-all hover:bg-emerald-400 hover:shadow-[0_0_80px_-15px_rgba(16,185,129,0.4)]"
                    >
                        <Sparkles className="h-4 w-4" />
                        Get your free scan
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                </div>
                <div className="mt-6 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[11px] text-white/25">
                    <span>No credit card required</span>
                    <span className="text-white/10">•</span>
                    <span>CASA Tier 2 Verified</span>
                    <span className="text-white/10">•</span>
                    <span>Results in under 2 minutes</span>
                </div>
            </div>
        </section>
    );
}

// ─── Page ──────────────────────────────────────────────────────
export default function HomePage() {
    const [scanTrigger, setScanTrigger] = useState<{ username: string; key: number }>({
        username: "",
        key: 0,
    });
    const scanSectionRef = useRef<HTMLDivElement>(null);

    const handleHeroScan = useCallback((username: string) => {
        setScanTrigger((prev) => ({ username, key: prev.key + 1 }));
        setTimeout(() => {
            scanSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 80);
    }, []);

    return (
        <main className="min-h-screen bg-[#050505] selection:bg-emerald-500/30">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
            />

            <Hero onScan={handleHeroScan} />
            <div ref={scanSectionRef}>
                <IdentityShadowSection
                    defaultUsername={scanTrigger.username}
                    scanKey={scanTrigger.key}
                    autoStart={scanTrigger.key > 0}
                />
            </div>
            <DashboardPreview />
            <WhatWeDoSection />
            <HowItWorksSection />
            <PrivacySection />
            <PricingSection />
            <FAQSection />
            <FounderSection />
            <FinalCTA />

            {/* Footer */}
            <footer className="border-t border-white/5 py-12 bg-black/40">
                <div className="mx-auto max-w-5xl px-6">
                    <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
                        <div className="flex items-center gap-2">
                            <span className="text-white/80 font-semibold tracking-tight">
                                GhostSweep
                            </span>
                            <span className="text-white/15 text-xs">v3.0</span>
                        </div>

                        <p className="text-[11px] text-white/30">
                            © {new Date().getFullYear()} GhostSweep Inc. Privacy-First.
                        </p>

                        <div className="flex flex-wrap justify-center items-center gap-6 text-xs text-white/40">
                            <Link href="/home/privacy" className="hover:text-white transition">
                                Privacy
                            </Link>
                            <Link href="/home/terms" className="hover:text-white transition">
                                Terms
                            </Link>
                            <Link href="/home/security" className="hover:text-white transition">
                                Security
                            </Link>
                            <Link
                                href="mailto:support@ghostsweep.com"
                                className="hover:text-white transition"
                            >
                                Support
                            </Link>
                            <div className="flex items-center gap-4 border-l border-white/10 pl-6">
                                <Link
                                    href="https://www.instagram.com/ghost_sweep/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hover:text-white transition"
                                >
                                    <Instagram className="h-4 w-4" />
                                </Link>
                                <Link
                                    href="https://www.tiktok.com/@ghostsweep_?lang=en"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hover:text-white transition"
                                >
                                    <Music2 className="h-4 w-4" />
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>

            {/* Mobile spacer */}
            <div className="h-20 md:hidden" />

            {/* Sticky Mobile CTA */}
            <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
                <div className="bg-linear-to-t from-black via-black/95 to-transparent pt-6 pb-4 px-4">
                    <Link
                        href="/login"
                        className="flex items-center justify-center gap-2 w-full rounded-full bg-emerald-500 py-4 text-sm font-semibold text-black shadow-lg shadow-emerald-500/25 active:scale-[0.98] transition"
                    >
                        <Sparkles className="h-4 w-4" />
                        Start Free Scan
                        <ArrowRight className="h-4 w-4" />
                    </Link>
                    <p className="text-center text-[10px] text-white/30 mt-2">
                        Free • No credit card • Results in 2 min
                    </p>
                </div>
            </div>
        </main>
    );
}
