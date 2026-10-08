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
    ChevronDown,
    Inbox,
    MailX,
    DollarSign,
    Linkedin,
    Loader2,
} from "lucide-react";
import { useState, useEffect, useRef, type FormEvent } from "react";
import { useTheme } from "next-themes";
import { GmailLogo } from "@/svgs";
import TeaserScan from "./_components/teaser-scan";

const SIGNUP_HREF = "/login?mode=signup";

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

const FAQS = [
    {
        q: "What does GhostSweep actually do?",
        a: "GhostSweep connects to your Gmail or Outlook inbox to discover every account you've ever signed up for. It also scans the web for shadow profiles tied to your email, phone, or username. Once discovered, it helps you delete unused accounts, recover forgotten gift cards and coupons, monitor data breaches, and unsubscribe from newsletters — all from one dashboard.",
    },
    {
        q: "Is GhostSweep safe to use with my email?",
        a: "Yes. GhostSweep is CASA Tier 2 verified by Google. We use transient, RAM-only processing — your raw email data is never stored, never sold, never shared. You can revoke access at any time from GhostSweep or your Google/Microsoft account.",
    },
    {
        q: "Is it really free to start?",
        a: "Yes. The breach check and shadow scan on this page need no account. The free plan includes one inbox scan, your breach summary, and a preview of your ghost profiles — no credit card required. You only pay if you want the full list and deletion tools.",
    },
    {
        q: "What is a shadow profile?",
        a: "A shadow profile is an account that exists on a website or service under your email, phone number, or username — often without your knowledge. These can be old sign-ups, data-harvested entries, or accounts you forgot about years ago. GhostSweep's Identity Shadow scanner finds them across hundreds of services.",
    },
    {
        q: "Can GhostSweep help me delete old accounts?",
        a: "Yes. GhostSweep discovers accounts through your inbox and shadow profile scans, then provides direct links and step-by-step instructions to delete them. You can track deletion status and permanently remove entries from your dashboard.",
    },
    {
        q: "How does GhostSweep find hidden value in my inbox?",
        a: "We scan your inbox for forgotten digital gift cards, unused rewards points, expiring coupons, and active subscriptions you might be overpaying for.",
    },
    {
        q: "Do you sell my data?",
        a: "Never. We have a strict zero-data-selling policy. GhostSweep exists to protect your privacy, not exploit it. We don't sell your personal data, browsing habits, or purchase history to anyone.",
    },
];

const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
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
    const { resolvedTheme } = useTheme();
    const theme = resolvedTheme === "dark" ? "dark" : "light";

    useEffect(() => {
        // Script may already be loaded if user navigated back, or the theme changed
        if (window.Trustpilot && ref.current) {
            window.Trustpilot.loadFromElement(ref.current, true);
        }
    }, [theme]);

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
                key={theme}
                ref={ref}
                className="trustpilot-widget"
                data-locale="en-US"
                data-template-id="56278e9abfbbba0bdcd568bc"
                data-businessunit-id="698a0804abb8a0a2645298d1"
                data-style-height="52px"
                data-style-width="100%"
                data-theme={theme}
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

// ─── Shared bits ───────────────────────────────────────────────
function SectionHeading({
    eyebrow,
    title,
    muted,
    description,
}: {
    eyebrow: string;
    title: React.ReactNode;
    muted?: React.ReactNode;
    description?: React.ReactNode;
}) {
    return (
        <div className="text-center mb-14 sm:mb-16">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-emerald-700 dark:text-emerald-400 mb-4">
                {eyebrow}
            </p>
            <h2 className="text-3xl sm:text-5xl font-semibold tracking-tight text-foreground leading-tight">
                {title}
                {muted && (
                    <>
                        <br className="hidden sm:block" />{" "}
                        <span className="text-foreground/45">{muted}</span>
                    </>
                )}
            </h2>
            {description && (
                <p className="mx-auto mt-5 max-w-xl text-base text-foreground/65 leading-relaxed">
                    {description}
                </p>
            )}
        </div>
    );
}

function PrimaryCTA({
    href = SIGNUP_HREF,
    children,
    size = "md",
}: {
    href?: string;
    children: React.ReactNode;
    size?: "md" | "lg";
}) {
    const sizing = size === "lg" ? "px-9 py-4 text-base" : "px-7 py-3.5 text-sm";
    return (
        <Link
            href={href}
            className={`group inline-flex items-center justify-center gap-2 rounded-full bg-emerald-500 font-semibold text-black shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-400 active:scale-[0.98] ${sizing}`}
        >
            {children}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
    );
}

const TRUST_POINTS = [
    { icon: ShieldCheck, label: "CASA Tier 2 verified" },
    { icon: Lock, label: "Zero email storage" },
    { icon: EyeOff, label: "We never sell your data" },
    { icon: Check, label: "No credit card to start" },
];

// ─── Hero: real breach check ───────────────────────────────────
type Breach = {
    Name: string | null;
    Title: string | null;
    BreachDate: string | null;
    DataClasses: string[] | null;
};

type HeroStatus = "idle" | "loading" | "result" | "error";

function Hero() {
    const [email, setEmail] = useState("");
    const [status, setStatus] = useState<HeroStatus>("idle");
    const [checkedEmail, setCheckedEmail] = useState("");
    const [breaches, setBreaches] = useState<Breach[]>([]);
    const [errorMsg, setErrorMsg] = useState("");

    const handleCheck = async (e: FormEvent) => {
        e.preventDefault();
        const value = email.trim();
        if (!value) return;

        setCheckedEmail(value);
        setStatus("loading");
        setErrorMsg("");

        try {
            const res = await fetch("/api/breach_check", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ query: value }),
            });
            const data = await res.json().catch(() => null);
            if (!res.ok) {
                throw new Error(
                    res.status === 429
                        ? "You've hit the free check limit for now. Create a free account to keep going."
                        : data?.error || "We couldn't run the check right now."
                );
            }
            setBreaches((data?.breaches ?? []) as Breach[]);
            setStatus("result");
        } catch (err) {
            setErrorMsg(err instanceof Error ? err.message : "Something went wrong.");
            setStatus("error");
        }
    };

    const reset = () => {
        setStatus("idle");
        setBreaches([]);
        setEmail("");
    };

    const signupWithEmail = `/login?email=${encodeURIComponent(checkedEmail)}`;
    const leakedData = Array.from(
        new Set(breaches.flatMap((b) => b.DataClasses ?? []))
    ).slice(0, 5);

    return (
        <section className="relative isolate overflow-hidden pt-16 pb-16 sm:pt-28 sm:pb-24">
            {/* Background glow */}
            <div className="pointer-events-none absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
                <div className="relative left-[calc(50%-11rem)] aspect-1155/678 w-xl -translate-x-1/2 rotate-30 bg-linear-to-tr from-emerald-400 to-teal-600 opacity-20 dark:opacity-15 sm:left-[calc(50%-30rem)] sm:w-6xl" />
            </div>

            <div className="mx-auto max-w-5xl px-6 text-center">
                <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-foreground/10 bg-card px-4 py-1.5 text-xs font-medium text-foreground/70 shadow-sm">
                    <Ghost className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                    Stop being haunted by your ghost accounts
                </div>

                <h1 className="text-4xl sm:text-6xl lg:text-7xl font-semibold tracking-tight text-foreground leading-[1.06]">
                    Find every account
                    <br className="hidden sm:block" />{" "}
                    <span className="text-emerald-600 dark:text-emerald-400">you forgot you made.</span>
                </h1>

                <p className="mx-auto mt-6 max-w-2xl text-lg sm:text-xl text-foreground/65 leading-relaxed">
                    GhostSweep scans your inbox and the open web to uncover old accounts, data
                    breaches, and forgotten gift cards — then helps you delete what you don't need.
                </p>

                <div className="mt-10 w-full max-w-lg mx-auto">
                    {(status === "idle" || status === "loading") && (
                        <form onSubmit={handleCheck}>
                            <label htmlFor="hero-email" className="sr-only">
                                Email address
                            </label>
                            <div className="flex flex-col sm:flex-row items-stretch gap-2 rounded-2xl sm:rounded-full border border-foreground/10 bg-card p-2 shadow-lg shadow-foreground/5 focus-within:border-emerald-500/50 transition">
                                <div className="flex flex-1 items-center gap-2 px-3">
                                    <Mail className="h-4 w-4 text-foreground/40 shrink-0" />
                                    <input
                                        id="hero-email"
                                        type="email"
                                        required
                                        placeholder="you@email.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="h-11 flex-1 min-w-0 bg-transparent text-base text-foreground placeholder-foreground/40 focus:outline-none"
                                        autoComplete="email"
                                        spellCheck={false}
                                        disabled={status === "loading"}
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={!email.trim() || status === "loading"}
                                    className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-emerald-500 px-6 text-sm font-semibold text-black transition hover:bg-emerald-400 disabled:opacity-50 active:scale-[0.98] shrink-0"
                                >
                                    {status === "loading" ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            Checking…
                                        </>
                                    ) : (
                                        <>
                                            Check my email free
                                            <ArrowRight className="h-4 w-4" />
                                        </>
                                    )}
                                </button>
                            </div>
                            <p className="mt-3 text-xs text-foreground/55">
                                Instant breach check · No sign-up · We don't store what you type
                            </p>
                        </form>
                    )}

                    {status === "result" && (
                        <div
                            className={`rounded-2xl border p-6 text-left shadow-lg ${
                                breaches.length > 0
                                    ? "border-red-500/30 bg-red-500/5"
                                    : "border-emerald-500/30 bg-emerald-500/5"
                            }`}
                        >
                            {breaches.length > 0 ? (
                                <>
                                    <div className="flex items-center gap-2 mb-2">
                                        <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 shrink-0" />
                                        <span className="text-base font-semibold text-foreground">
                                            Found in {breaches.length} data breach{breaches.length !== 1 ? "es" : ""}
                                        </span>
                                    </div>
                                    <p className="text-sm text-foreground/70 mb-4 leading-relaxed">
                                        <span className="font-medium text-foreground">{checkedEmail}</span> was
                                        exposed in {breaches.slice(0, 3).map((b) => b.Title ?? b.Name).join(", ")}
                                        {breaches.length > 3 ? ` and ${breaches.length - 3} more` : ""}.
                                        {leakedData.length > 0 && (
                                            <> Leaked data includes {leakedData.join(", ").toLowerCase()}.</>
                                        )}
                                    </p>
                                    <p className="text-sm text-foreground/70 mb-5">
                                        Breaches only show what leaked. Your inbox shows every account still
                                        holding your data — and which ones to delete first.
                                    </p>
                                </>
                            ) : (
                                <>
                                    <div className="flex items-center gap-2 mb-2">
                                        <ShieldCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                                        <span className="text-base font-semibold text-foreground">
                                            No known breaches — nice.
                                        </span>
                                    </div>
                                    <p className="text-sm text-foreground/70 mb-5 leading-relaxed">
                                        <span className="font-medium text-foreground">{checkedEmail}</span> isn't
                                        in any public breach we know of. But breaches are only part of the picture —
                                        old accounts you forgot about still hold your data. Your inbox knows where they are.
                                    </p>
                                </>
                            )}
                            <Link
                                href={signupWithEmail}
                                className="w-full flex items-center justify-center gap-2 rounded-full bg-emerald-500 py-3 text-sm font-semibold text-black hover:bg-emerald-400 transition"
                            >
                                <GmailLogo className="h-4 w-4" />
                                Find every account linked to this email
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                            <p className="mt-2.5 text-center text-xs text-foreground/55">
                                Free · Read-only inbox access · Revoke anytime
                            </p>
                            <button
                                onClick={reset}
                                className="w-full mt-3 text-xs text-foreground/55 hover:text-foreground transition"
                            >
                                Check a different email
                            </button>
                        </div>
                    )}

                    {status === "error" && (
                        <div className="rounded-2xl border border-foreground/10 bg-card p-6 text-left shadow-lg">
                            <p className="text-sm text-foreground/75 mb-4">{errorMsg}</p>
                            <div className="flex flex-col sm:flex-row gap-2">
                                <Link
                                    href={signupWithEmail}
                                    className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-emerald-500 py-2.5 text-sm font-semibold text-black hover:bg-emerald-400 transition"
                                >
                                    Start free scan
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                                <button
                                    onClick={reset}
                                    className="flex-1 rounded-full border border-foreground/10 py-2.5 text-sm text-foreground/70 hover:bg-foreground/5 transition"
                                >
                                    Try again
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-foreground/60">
                    <a
                        href="#shadow-scan"
                        className="inline-flex items-center gap-1.5 hover:text-foreground transition"
                    >
                        <Fingerprint className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                        Or scan a username for shadow profiles
                    </a>
                </div>

                {/* Trust strip */}
                <ul className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-xs font-medium text-foreground/65">
                    {TRUST_POINTS.map((t) => (
                        <li key={t.label} className="flex items-center gap-1.5">
                            <t.icon className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                            {t.label}
                        </li>
                    ))}
                </ul>

                <div className="mt-6 max-w-xs mx-auto">
                    <TrustpilotWidget />
                </div>
            </div>
        </section>
    );
}

// ─── Dashboard Preview ─────────────────────────────────────────
function DashboardPreview() {
    const stats = [
        { icon: Inbox, label: "Accounts found", value: 134, color: "text-emerald-600 dark:text-emerald-400" },
        { icon: Ghost, label: "Shadow profiles", value: 37, color: "text-purple-600 dark:text-purple-400" },
        { icon: AlertTriangle, label: "Breached", value: 12, color: "text-red-600 dark:text-red-400" },
        { icon: DollarSign, label: "Hidden value", value: 285, prefix: "$", color: "text-amber-700 dark:text-amber-400" },
    ];

    return (
        <section className="relative pb-20 sm:pb-28">
            <div className="mx-auto max-w-5xl px-6">
                <div className="rounded-2xl border border-foreground/10 bg-card shadow-2xl shadow-foreground/10 overflow-hidden">
                    {/* Window chrome */}
                    <div className="flex items-center gap-2 border-b border-foreground/10 px-5 py-3">
                        <div className="h-2.5 w-2.5 rounded-full bg-red-400/70" />
                        <div className="h-2.5 w-2.5 rounded-full bg-amber-400/70" />
                        <div className="h-2.5 w-2.5 rounded-full bg-emerald-400/70" />
                        <span className="ml-3 text-[11px] font-mono text-foreground/50 uppercase tracking-widest">
                            Example results — a typical first scan
                        </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-foreground/10">
                        {stats.map((s) => (
                            <div key={s.label} className="bg-card p-5 sm:p-7">
                                <div className="flex items-center gap-2 mb-3">
                                    <s.icon className={`h-4 w-4 ${s.color}`} />
                                    <span className="text-[11px] uppercase tracking-widest text-foreground/55 font-medium">
                                        {s.label}
                                    </span>
                                </div>
                                <div className={`text-3xl sm:text-4xl font-light tabular-nums ${s.color}`}>
                                    <CountUp value={s.value} prefix={s.prefix} />
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="border-t border-foreground/10 bg-foreground/2 p-5 sm:p-6 font-mono text-xs space-y-2.5 text-foreground/60">
                        <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                            <ScanSearch className="h-3.5 w-3.5" />
                            <span>Scanning inbox: j***@gmail.com</span>
                        </div>
                        <div className="pl-5">
                            → Accounts on <span className="text-foreground">linkedin.com</span>,{" "}
                            <span className="text-foreground">spotify.com</span>,{" "}
                            <span className="text-red-600 dark:text-red-400">adobe.com (breached)</span>
                        </div>
                        <div className="pl-5">
                            → Shadow profiles on{" "}
                            <span className="text-purple-600 dark:text-purple-400">canva.com</span>,{" "}
                            <span className="text-purple-600 dark:text-purple-400">notion.so</span>
                        </div>
                        <div className="pl-5">
                            → Recovered:{" "}
                            <span className="text-amber-700 dark:text-amber-400">$25.00 Starbucks gift card</span>,{" "}
                            <span className="text-amber-700 dark:text-amber-400">15% off coupon (expires in 3 days)</span>
                        </div>
                        <div className="pl-5">
                            → <span className="text-foreground">18 newsletters</span> ready to unsubscribe
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
            title: "Find every account",
            description:
                "Connect Gmail or Outlook and we surface every service you've ever signed up for — going back years.",
            color: "text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
        },
        {
            icon: Fingerprint,
            title: "Uncover shadow profiles",
            description:
                "We search hundreds of sites for accounts tied to your email, phone, or username — even ones you never created.",
            color: "text-purple-700 dark:text-purple-400 bg-purple-500/10 border-purple-500/20",
        },
        {
            icon: AlertTriangle,
            title: "See what's been breached",
            description:
                "Every account is checked against known data breaches, with alerts when your details show up in new leaks.",
            color: "text-red-700 dark:text-red-400 bg-red-500/10 border-red-500/20",
        },
        {
            icon: Trash2,
            title: "Delete what you don't need",
            description:
                "Direct links and step-by-step guides to close old accounts for good — and track every request.",
            color: "text-rose-700 dark:text-rose-400 bg-rose-500/10 border-rose-500/20",
        },
        {
            icon: MailX,
            title: "Silence newsletter noise",
            description:
                "Every mailing list you're on, in one place. Unsubscribe from the ones you don't read in a click.",
            color: "text-blue-700 dark:text-blue-400 bg-blue-500/10 border-blue-500/20",
        },
        {
            icon: DollarSign,
            title: "Recover forgotten money",
            description:
                "Gift cards, rewards points, expiring coupons, and subscriptions you're still paying for — found in your inbox.",
            color: "text-amber-700 dark:text-amber-400 bg-amber-500/10 border-amber-500/20",
        },
    ];

    return (
        <section className="py-20 sm:py-28 border-t border-foreground/10">
            <div className="mx-auto max-w-5xl px-6">
                <SectionHeading
                    eyebrow="What you get"
                    title="One scan."
                    muted="Your whole digital footprint."
                    description="Everything you need to understand, clean up, and protect your online identity — in one dashboard."
                />

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {capabilities.map((cap) => (
                        <div
                            key={cap.title}
                            className="rounded-2xl border border-foreground/10 bg-card p-7 shadow-sm transition hover:shadow-md hover:border-foreground/20"
                        >
                            <div className={`h-11 w-11 rounded-xl border flex items-center justify-center mb-5 ${cap.color}`}>
                                <cap.icon className="h-5 w-5" />
                            </div>
                            <h3 className="text-base font-semibold text-foreground mb-2">{cap.title}</h3>
                            <p className="text-sm text-foreground/65 leading-relaxed">{cap.description}</p>
                        </div>
                    ))}
                </div>

                <div className="mt-12 text-center">
                    <PrimaryCTA>Start my free scan</PrimaryCTA>
                </div>
            </div>
        </section>
    );
}

// ─── Identity Shadow (live teaser scan) ────────────────────────
function IdentityShadowSection() {
    return (
        <section className="py-20 sm:py-28 border-t border-foreground/10 relative overflow-hidden scroll-mt-16" id="shadow-scan">
            <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-purple-500/5 blur-3xl" />

            <div className="mx-auto max-w-5xl px-6 relative z-10">
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/25 bg-purple-500/5 px-4 py-1.5 text-xs font-medium text-purple-700 dark:text-purple-400 mb-5">
                        <Fingerprint className="h-3.5 w-3.5" />
                        Try it now — no account needed
                    </div>
                    <h2 className="text-3xl sm:text-5xl font-semibold tracking-tight text-foreground leading-tight">
                        Your inbox shows what you signed up for.
                        <br className="hidden sm:block" />{" "}
                        <span className="text-foreground/45">We find what you didn&apos;t.</span>
                    </h2>
                    <p className="mx-auto mt-5 max-w-xl text-base text-foreground/65 leading-relaxed">
                        Type a username you use online. We'll search hundreds of sites for profiles tied to it — live, right here.
                    </p>
                </div>

                <div className="max-w-2xl mx-auto mb-14">
                    <TeaserScan />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        { icon: Search, title: "Web-wide discovery", description: "Hundreds of services searched by email, phone, or username." },
                        { icon: AlertTriangle, title: "Breach cross-check", description: "See which ghost accounts have already been compromised." },
                        { icon: Shield, title: "Risk scoring", description: "Know which profiles to deal with first." },
                        { icon: Trash2, title: "Full remediation", description: "Visit, delete, ignore, or remove from your map." },
                    ].map((feature) => (
                        <div key={feature.title} className="rounded-2xl border border-foreground/10 bg-card p-6 shadow-sm">
                            <feature.icon className="h-5 w-5 text-purple-600 dark:text-purple-400 mb-3" />
                            <h3 className="text-sm font-semibold text-foreground mb-1">{feature.title}</h3>
                            <p className="text-sm text-foreground/65 leading-relaxed">{feature.description}</p>
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
            num: "1",
            title: "Connect your inbox",
            description: "Sign in with Gmail or Outlook through their official permission screen. Read-only, revoke anytime.",
            icon: Mail,
        },
        {
            num: "2",
            title: "We scan everywhere",
            description: "Your inbox, the open web, and breach databases — in about two minutes.",
            icon: ScanSearch,
        },
        {
            num: "3",
            title: "See the full picture",
            description: "Accounts, shadow profiles, breaches, gift cards, and newsletters — risk-scored on one dashboard.",
            icon: Eye,
        },
        {
            num: "4",
            title: "Clean it up",
            description: "Delete, unsubscribe, and recover value. Nothing happens without your approval.",
            icon: Trash2,
        },
    ];

    return (
        <section className="py-20 sm:py-28 border-t border-foreground/10">
            <div className="mx-auto max-w-5xl px-6">
                <SectionHeading eyebrow="How it works" title="Connect. Discover." muted="Take control." />

                <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {steps.map((step) => (
                        <li key={step.num} className="rounded-2xl border border-foreground/10 bg-card p-6 shadow-sm">
                            <div className="flex items-center gap-3 mb-4">
                                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 text-sm font-semibold text-black">
                                    {step.num}
                                </span>
                                <step.icon className="h-5 w-5 text-foreground/40" />
                            </div>
                            <h3 className="text-base font-semibold text-foreground mb-2">{step.title}</h3>
                            <p className="text-sm text-foreground/65 leading-relaxed">{step.description}</p>
                        </li>
                    ))}
                </ol>

                <p className="mt-8 text-center text-sm">
                    <Link href="/home/how-it-works" className="text-emerald-700 dark:text-emerald-400 font-medium hover:underline">
                        See the full walkthrough →
                    </Link>
                </p>
            </div>
        </section>
    );
}

// ─── Privacy Section ───────────────────────────────────────────
function PrivacySection() {
    return (
        <section className="py-20 sm:py-28 border-t border-foreground/10 bg-foreground/2">
            <div className="mx-auto max-w-5xl px-6">
                <div className="flex flex-col lg:flex-row items-start gap-12 lg:gap-16">
                    <div className="flex-1 space-y-7">
                        <p className="text-xs font-medium uppercase tracking-[0.2em] text-emerald-700 dark:text-emerald-400">
                            Privacy
                        </p>
                        <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-foreground leading-tight">
                            We see your shadow.
                            <br />
                            <span className="text-foreground/45">Never your secrets.</span>
                        </h2>
                        <p className="text-base text-foreground/65 leading-relaxed max-w-lg">
                            GhostSweep uses transient, RAM-only processing. Your raw email data is never
                            stored, never sold, never shared. Privacy isn't a feature — it's the architecture.
                        </p>

                        <div className="space-y-5">
                            {[
                                {
                                    icon: ShieldCheck,
                                    title: "CASA Tier 2 verified",
                                    text: "The security assessment Google requires for apps that access sensitive Gmail data.",
                                },
                                {
                                    icon: EyeOff,
                                    title: "Transient processing",
                                    text: "Scanned, extracted, deleted. Your raw email never touches permanent storage.",
                                },
                                {
                                    icon: Lock,
                                    title: "Encrypted end to end",
                                    text: "256-bit encryption on every connection, in transit and at rest.",
                                },
                            ].map((item) => (
                                <div key={item.title} className="flex gap-4">
                                    <div className="mt-0.5 h-9 w-9 shrink-0 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                                        <item.icon className="h-4 w-4 text-emerald-700 dark:text-emerald-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-semibold text-foreground mb-0.5">{item.title}</h3>
                                        <p className="text-sm text-foreground/65 leading-relaxed">{item.text}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="flex flex-wrap gap-4 text-sm">
                            <div className="flex items-center gap-2 px-4 py-2 rounded-lg border border-foreground/10 bg-card text-foreground/75">
                                <GmailLogo className="h-4 w-4" />
                                <span>Google verified app</span>
                            </div>
                            <Link
                                href="/home/security"
                                className="inline-flex items-center gap-1 px-1 py-2 text-emerald-700 dark:text-emerald-400 font-medium hover:underline"
                            >
                                Read our security model →
                            </Link>
                        </div>
                    </div>

                    <div className="flex-1 w-full">
                        <div className="rounded-2xl border border-foreground/10 bg-card overflow-hidden shadow-xl shadow-foreground/5">
                            <div className="flex items-center gap-2 border-b border-foreground/10 px-5 py-3">
                                <div className="h-2.5 w-2.5 rounded-full bg-foreground/15" />
                                <div className="h-2.5 w-2.5 rounded-full bg-foreground/15" />
                                <div className="h-2.5 w-2.5 rounded-full bg-foreground/15" />
                                <span className="ml-2 text-[11px] text-foreground/50 font-mono">privacy_audit.log</span>
                            </div>
                            <div className="p-6 font-mono text-xs space-y-3 text-foreground/70">
                                <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                                    <Check className="h-3.5 w-3.5" />
                                    <span>Inbox scan initiated: 8,294 emails queued</span>
                                </div>
                                <div className="pl-5">Processing in transient memory…</div>
                                <div className="pl-5">✓ 134 accounts discovered</div>
                                <div className="pl-5">✓ 37 shadow profiles found</div>
                                <div className="pl-5">✓ 12 accounts linked to breaches</div>
                                <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 py-1.5 px-2 rounded w-fit">
                                    <Lock className="h-3.5 w-3.5" />
                                    <span>Raw data purged. Zero residual storage.</span>
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
            note: "Free forever",
            badge: null as string | null,
            description: "See what's hiding in your inbox and across the web.",
            cta: "Start free",
            href: SIGNUP_HREF,
            featured: false,
            features: [
                { text: "1 inbox scan", locked: false },
                { text: "Breach summary for your email", locked: false },
                { text: "Preview of 10 ghost profiles", locked: false },
                { text: "Full ghost account list", locked: true },
                { text: "Gift cards & deletion tools", locked: true },
            ],
        },
        {
            name: "Annual Sentinel",
            price: "$59.99",
            period: "/yr",
            note: "Just $4.99/mo, billed yearly",
            badge: "Best value",
            description: "Everything, always on. The best price per month.",
            cta: "Get Annual Sentinel",
            href: "/login?mode=signup&plan=annual",
            featured: true,
            features: [
                { text: "Everything in Monthly", locked: false },
                { text: 'Priority "Shadow Watch" scan queue', locked: false },
                { text: "Gift card expiry alerts", locked: false },
                { text: "Monthly Identity Health Report (PDF)", locked: false },
                { text: "Priority deletion support", locked: false },
            ],
        },
        {
            name: "Monthly",
            price: "$7.99",
            period: "/mo",
            note: "Cancel anytime",
            badge: null,
            description: "Full visibility, unlimited inboxes, real-time monitoring.",
            cta: "Start monthly",
            href: "/login?mode=signup&plan=monthly",
            featured: false,
            features: [
                { text: "Everything in Buster Pass", locked: false },
                { text: "Unlimited inbox connections", locked: false },
                { text: "Real-time breach alerts", locked: false },
                { text: "Weekly shadow web re-scan", locked: false },
                { text: "One-click newsletter unsubscribe", locked: false },
            ],
        },
        {
            name: "Buster Pass",
            price: "$12.99",
            period: "",
            note: "One-time payment",
            badge: null,
            description: "A deep one-off audit of up to 3 emails. No subscription.",
            cta: "Buy once — $12.99",
            href: "/login?mode=signup&plan=buster",
            featured: false,
            features: [
                { text: "10 scan credits (work, personal, old)", locked: false },
                { text: "Deep-web OSINT shadow search", locked: false },
                { text: "Every ghost account & gift card unlocked", locked: false },
                { text: "PDF audit + password-manager CSV", locked: false },
                { text: "One-click account deletion links", locked: false },
            ],
        },
    ];

    return (
        <section className="py-20 sm:py-28 border-t border-foreground/10 scroll-mt-16" id="pricing">
            <div className="mx-auto max-w-6xl px-6">
                <SectionHeading
                    eyebrow="Pricing"
                    title="Start free."
                    muted="Upgrade when you're ready."
                    description="Run your first scan at no cost. Pay only if you want the full list and the tools to clean it up."
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 items-stretch">
                    {plans.map((plan) => (
                        <div
                            key={plan.name}
                            className={`relative rounded-2xl border p-7 flex flex-col bg-card ${
                                plan.featured
                                    ? "border-emerald-500 ring-1 ring-emerald-500 shadow-xl shadow-emerald-500/10"
                                    : "border-foreground/10 shadow-sm"
                            }`}
                        >
                            {plan.badge && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-emerald-500 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-black">
                                    {plan.badge}
                                </div>
                            )}
                            <div className="mb-2 text-sm font-semibold text-foreground">{plan.name}</div>
                            <div className="flex items-baseline gap-1">
                                <span className="text-4xl font-semibold tracking-tight text-foreground">{plan.price}</span>
                                {plan.period && <span className="text-foreground/55 text-sm">{plan.period}</span>}
                            </div>
                            <p className={`mt-1 text-xs font-medium ${plan.featured ? "text-emerald-700 dark:text-emerald-400" : "text-foreground/55"}`}>
                                {plan.note}
                            </p>
                            <p className="text-sm text-foreground/65 mt-3 mb-6">{plan.description}</p>
                            <ul className="space-y-2.5 mb-8 flex-1">
                                {plan.features.map((feature) => (
                                    <li key={feature.text} className="flex items-start gap-2 text-sm">
                                        {feature.locked ? (
                                            <Lock className="h-4 w-4 shrink-0 mt-0.5 text-foreground/30" />
                                        ) : (
                                            <Check className="h-4 w-4 shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400" />
                                        )}
                                        <span className={feature.locked ? "text-foreground/40" : "text-foreground/80"}>
                                            {feature.text}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                            <Link
                                href={plan.href}
                                className={`w-full flex items-center justify-center rounded-full py-3 text-sm font-semibold transition ${
                                    plan.featured
                                        ? "bg-emerald-500 text-black hover:bg-emerald-400"
                                        : "border border-foreground/15 text-foreground hover:bg-foreground/5"
                                }`}
                            >
                                {plan.cta}
                            </Link>
                        </div>
                    ))}
                </div>

                <p className="text-center mt-8 text-sm text-foreground/60">
                    Subscriptions cancel anytime · 30-day money-back guarantee · Secure checkout by Stripe
                </p>
            </div>
        </section>
    );
}

// ─── FAQ ────────────────────────────────────────────────────────
function FAQSection() {
    return (
        <section className="py-20 sm:py-28 border-t border-foreground/10 scroll-mt-16" id="faq">
            <div className="mx-auto max-w-3xl px-6">
                <SectionHeading eyebrow="FAQ" title="Common questions" />
                <div className="divide-y divide-foreground/10 rounded-2xl border border-foreground/10 bg-card shadow-sm">
                    {FAQS.map((faq) => (
                        <details key={faq.q} className="group px-6 py-5 [&_summary::-webkit-details-marker]:hidden">
                            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left text-base font-medium text-foreground">
                                {faq.q}
                                <ChevronDown className="h-4 w-4 shrink-0 text-foreground/50 transition-transform group-open:rotate-180" />
                            </summary>
                            <p className="mt-3 text-sm text-foreground/65 leading-relaxed">{faq.a}</p>
                        </details>
                    ))}
                </div>
            </div>
        </section>
    );
}

// ─── Founder ───────────────────────────────────────────────────
function FounderSection() {
    return (
        <section className="py-20 sm:py-28 border-t border-foreground/10" id="founder">
            <div className="mx-auto max-w-4xl px-6">
                <div className="flex flex-col md:flex-row items-center gap-10 md:gap-16">
                    <div className="relative shrink-0">
                        <div className="relative w-44 h-44 md:w-52 md:h-52 rounded-2xl overflow-hidden border border-foreground/10 shadow-xl">
                            <Image
                                src="https://ghostsweep.t3.storage.dev/f1789004-4f47-4d23-a5c9-d66f62e532f3.jpg"
                                alt="Joel Komieter — Founder of GhostSweep"
                                fill
                                sizes="208px"
                                className="object-cover"
                            />
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
                        <span className="text-5xl text-emerald-500/50 font-serif leading-none select-none">&ldquo;</span>
                        <blockquote className="text-xl md:text-2xl font-light text-foreground/85 leading-relaxed mb-6 -mt-4">
                            I built GhostSweep because your digital identity shouldn't be someone else's
                            business model. Every forgotten account is a risk. This tool exists to give
                            that power back to you.
                        </blockquote>
                        <p className="font-semibold text-foreground">Joel Komieter</p>
                        <p className="text-sm text-foreground/60">Founder & Engineer</p>
                    </div>
                </div>
            </div>
        </section>
    );
}

// ─── Final CTA ─────────────────────────────────────────────────
function FinalCTA() {
    return (
        <section className="py-20 sm:py-28 border-t border-foreground/10">
            <div className="mx-auto max-w-3xl px-6 text-center">
                <h2 className="text-3xl sm:text-5xl font-semibold tracking-tight text-foreground leading-tight">
                    Your digital life is messier than you think.{" "}
                    <span className="text-emerald-600 dark:text-emerald-400">Clean it up.</span>
                </h2>
                <p className="mx-auto mt-5 max-w-lg text-base text-foreground/65 leading-relaxed">
                    In about two minutes you'll see every forgotten account, shadow profile, breach risk,
                    and dollar hiding in your inbox.
                </p>
                <div className="mt-9">
                    <PrimaryCTA size="lg">
                        <Sparkles className="h-4 w-4" />
                        Get my free scan
                    </PrimaryCTA>
                </div>
                <ul className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs font-medium text-foreground/60">
                    {TRUST_POINTS.map((t) => (
                        <li key={t.label} className="flex items-center gap-1.5">
                            <t.icon className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                            {t.label}
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    );
}

// ─── Sticky mobile CTA (appears once the hero is out of view) ──
function StickyMobileCTA() {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const onScroll = () => setVisible(window.scrollY > 640);
        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    return (
        <div
            className={`fixed bottom-0 left-0 right-0 z-50 md:hidden transition-transform duration-300 ${
                visible ? "translate-y-0" : "translate-y-full"
            }`}
        >
            <div className="border-t border-foreground/10 bg-background/95 backdrop-blur-xl px-4 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))]">
                <Link
                    href={SIGNUP_HREF}
                    className="flex items-center justify-center gap-2 w-full rounded-full bg-emerald-500 py-3.5 text-sm font-semibold text-black shadow-lg shadow-emerald-500/25 active:scale-[0.98] transition"
                >
                    Start free scan
                    <ArrowRight className="h-4 w-4" />
                </Link>
                <p className="text-center text-[11px] text-foreground/55 mt-1.5">
                    Free · No credit card · Results in ~2 min
                </p>
            </div>
        </div>
    );
}

// ─── Page ──────────────────────────────────────────────────────
export default function HomePage() {
    return (
        <main className="min-h-screen bg-background selection:bg-emerald-500/30">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
            />

            <Hero />
            <DashboardPreview />
            <WhatWeDoSection />
            <IdentityShadowSection />
            <HowItWorksSection />
            <PrivacySection />
            <PricingSection />
            <FAQSection />
            <FounderSection />
            <FinalCTA />

            <footer className="border-t border-foreground/10 py-12 bg-foreground/2">
                <div className="mx-auto max-w-5xl px-6">
                    <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
                        <span className="text-foreground font-semibold tracking-tight">GhostSweep</span>

                        <p className="text-xs text-foreground/55">
                            © {new Date().getFullYear()} GhostSweep Inc. Privacy-first.
                        </p>

                        <div className="flex flex-wrap justify-center items-center gap-6 text-sm text-foreground/60">
                            <Link href="/home/privacy" className="hover:text-foreground transition">Privacy</Link>
                            <Link href="/home/terms" className="hover:text-foreground transition">Terms</Link>
                            <Link href="/home/security" className="hover:text-foreground transition">Security</Link>
                            <Link href="mailto:support@ghostsweep.com" className="hover:text-foreground transition">Support</Link>
                            <div className="flex items-center gap-4 border-l border-foreground/10 pl-6">
                                <Link
                                    href="https://www.instagram.com/ghost_sweep/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label="GhostSweep on Instagram"
                                    className="hover:text-foreground transition"
                                >
                                    <Instagram className="h-4 w-4" />
                                </Link>
                                <Link
                                    href="https://www.tiktok.com/@ghostsweep_?lang=en"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label="GhostSweep on TikTok"
                                    className="hover:text-foreground transition"
                                >
                                    <Music2 className="h-4 w-4" />
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>

            {/* Mobile spacer so the sticky CTA never covers the footer */}
            <div className="h-24 md:hidden" />
            <StickyMobileCTA />
        </main>
    );
}
