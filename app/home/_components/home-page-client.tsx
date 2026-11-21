/* eslint-disable react/no-unescaped-entities */
"use client";

import Link from "next/link";
import Image from "next/image";
import Script from "next/script";
import {
    ArrowRight,
    Check,
    Mail,
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
import { useState, useEffect, type FormEvent } from "react";
import { GmailLogo, OutLookLogo } from "@/svgs";
import TeaserScan from "./teaser-scan";
import ProductDemo from "./product-demo";
import { CHECKOUT_REASSURANCE, FREE_PLAN, PAID_PLANS } from "@/lib/plans";

const SIGNUP_HREF = "/login?mode=signup";

// ─── Structured Data ───────────────────────────────────────────
const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "GhostSweep | Know Your Digital Shadow",
    description:
        "GhostSweep discovers every account tied to your inbox, finds shadow profiles across the web, recovers hidden value from gift cards and coupons, monitors data breaches, and helps you delete the accounts you don't need — all from one dashboard.",
    url: "https://www.ghostsweep.com/home",
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
        a: "Yes. The breach check and shadow scan on this page need no account. The free plan includes one inbox scan per month, your breach summary, and a preview of your ghost accounts — no credit card required. You only pay if you want the full list and deletion tools.",
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

// ─── Counter ───────────────────────────────────────────────────
// Static on purpose: numbers that tick up read as marketing, not evidence.
function CountUp({ value, prefix = "", suffix = "" }: { value: number; prefix?: string; suffix?: string }) {
    return (
        <span className="font-mono tabular-nums">
            {prefix}
            {value.toLocaleString()}
            {suffix}
        </span>
    );
}

// ─── Social proof ──────────────────────────────────────────────
type PublicStats = { scansCompleted: number; giftCardValue: number };

// Live totals from /api/marketing/stats. Renders nothing until real numbers arrive,
// so a slow or failed request never leaves an empty placeholder under the hero.
function SocialProofStats() {
    const [stats, setStats] = useState<PublicStats | null>(null);

    useEffect(() => {
        let cancelled = false;
        fetch("/api/marketing/stats")
            .then((res) => (res.ok ? res.json() : null))
            .then((data: PublicStats | null) => {
                if (!cancelled && data && data.scansCompleted > 0) setStats(data);
            })
            .catch(() => {});
        return () => {
            cancelled = true;
        };
    }, []);

    if (!stats) return null;

    return (
        <p className="mt-6 text-sm text-foreground/65">
            <span className="font-semibold text-foreground">
                <CountUp value={stats.scansCompleted} />
            </span>{" "}
            scans run
            {stats.giftCardValue > 0 && (
                <>
                    {" · "}
                    <span className="font-semibold text-amber-700 dark:text-amber-400">
                        <CountUp value={stats.giftCardValue} prefix="$" />
                    </span>{" "}
                    in gift cards found
                </>
            )}
        </p>
    );
}

// Only real customers, quoted with their permission. The section stays hidden while empty.
const TESTIMONIALS: { quote: string; name: string; detail: string }[] = [];

function TestimonialsSection() {
    if (TESTIMONIALS.length === 0) return null;

    return (
        <section className="py-20 sm:py-28 border-t border-foreground/10" id="testimonials">
            <div className="mx-auto max-w-5xl px-6">
                <SectionHeading eyebrow="Testimonials" title="What users found" />
                <div className="grid gap-6 md:grid-cols-3">
                    {TESTIMONIALS.map((t) => (
                        <figure
                            key={t.name}
                            className="flex flex-col rounded-2xl border border-foreground/10 bg-foreground/2 p-6"
                        >
                            <blockquote className="flex-1 text-sm text-foreground/80 leading-relaxed">
                                &ldquo;{t.quote}&rdquo;
                            </blockquote>
                            <figcaption className="mt-5">
                                <p className="text-sm font-semibold text-foreground">{t.name}</p>
                                <p className="text-xs text-foreground/60">{t.detail}</p>
                            </figcaption>
                        </figure>
                    ))}
                </div>
            </div>
        </section>
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
        <div className="max-w-3xl mb-12 sm:mb-14">
            <p className="font-mono text-xs uppercase tracking-[0.12em] text-foreground/55 mb-4">
                {eyebrow}
            </p>
            <h2 className="text-3xl sm:text-4xl font-medium text-foreground leading-tight">
                {title}
                {muted && (
                    <>
                        <br className="hidden sm:block" />{" "}
                        <span className="text-foreground/45">{muted}</span>
                    </>
                )}
            </h2>
            {description && (
                <p className="mt-4 max-w-xl text-base text-foreground/65 leading-relaxed">
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
            className={`group inline-flex items-center justify-center gap-2 rounded-md bg-primary font-medium text-primary-foreground transition-colors hover:bg-primary/90 ${sizing}`}
        >
            {children}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
    );
}

// Every line here must stay true and match the FAQ / security page.
const ACCESS_FACTS = [
    { label: "Inbox access", value: "Read-only, Gmail or Outlook" },
    { label: "Email content", value: "Processed in memory, never stored" },
    { label: "Your data", value: "Never sold, never shared" },
    { label: "Revoking", value: "Anytime, from GhostSweep or your Google / Microsoft account" },
    { label: "To start", value: "Free, no credit card" },
];

function AccessPanel() {
    return (
        <aside className="rounded-lg border border-foreground/10 bg-card text-left">
            <div className="flex items-center justify-between gap-3 border-b border-foreground/10 px-5 py-3">
                <span className="font-mono text-xs text-foreground/60">What GhostSweep can access</span>
                <span className="inline-flex items-center gap-1.5 font-mono text-[11px] text-emerald-700 dark:text-emerald-400">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    CASA Tier 2 verified
                </span>
            </div>
            <dl className="divide-y divide-foreground/10">
                {ACCESS_FACTS.map((f) => (
                    <div key={f.label} className="grid grid-cols-[7.5rem_1fr] gap-4 px-5 py-3.5 text-sm">
                        <dt className="text-foreground/55">{f.label}</dt>
                        <dd className="text-foreground">{f.value}</dd>
                    </div>
                ))}
            </dl>
            <div className="border-t border-foreground/10 px-5 py-3">
                <Link
                    href="/home/security"
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-primary underline-offset-4 hover:underline"
                >
                    Read how we handle your data
                    <ArrowRight className="h-3.5 w-3.5" />
                </Link>
            </div>
        </aside>
    );
}

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
    // The breach check is a secondary path; its form stays tucked away until asked for
    const [showBreachCheck, setShowBreachCheck] = useState(false);

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
        <section className="pt-14 pb-16 sm:pt-20 sm:pb-24">
            <div className="mx-auto grid max-w-6xl items-start gap-12 px-6 lg:grid-cols-[1.15fr_1fr] lg:gap-16">
              <div>
                <p className="mb-6 font-mono text-xs uppercase tracking-[0.12em] text-foreground/55">
                    Account discovery · Breach checks · Deletion
                </p>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-medium text-foreground leading-[1.05]">
                    Find every account{" "}
                    <span className="text-foreground/50">you forgot you made.</span>
                </h1>

                <p className="mt-6 max-w-xl text-lg text-foreground/65 leading-relaxed">
                    GhostSweep scans your inbox and the open web to uncover old accounts, data
                    breaches, and forgotten gift cards — then helps you delete what you don't need.
                </p>

                <div className="mt-9 w-full max-w-lg">
                    {(status === "idle" || status === "loading") && (
                        <>
                            <Link
                                href={SIGNUP_HREF}
                                className="group inline-flex w-full sm:w-auto items-center justify-center gap-3 rounded-md bg-primary px-7 py-3.5 text-base font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                            >
                                <span className="flex items-center gap-1.5">
                                    <GmailLogo className="h-5 w-5" />
                                    <OutLookLogo className="h-5 w-5" />
                                </span>
                                Connect inbox (free)
                                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                            </Link>
                            <p className="mt-3 text-xs text-foreground/55">
                                Gmail or Outlook · Read-only access · Revoke anytime
                            </p>

                            {showBreachCheck && (
                                <form onSubmit={handleCheck} className="mt-8">
                                    <label htmlFor="hero-email" className="sr-only">
                                        Email address
                                    </label>
                                    <div className="flex items-stretch gap-2 rounded-md border border-foreground/10 bg-card p-1.5 focus-within:border-foreground/25 transition">
                                        <div className="flex flex-1 items-center gap-2 px-3">
                                            <Mail className="h-4 w-4 text-foreground/40 shrink-0" />
                                            <input
                                                id="hero-email"
                                                type="email"
                                                required
                                                autoFocus
                                                placeholder="you@email.com"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                className="h-9 flex-1 min-w-0 bg-transparent text-sm text-foreground placeholder-foreground/40 focus:outline-none"
                                                autoComplete="email"
                                                spellCheck={false}
                                                disabled={status === "loading"}
                                            />
                                        </div>
                                        <button
                                            type="submit"
                                            disabled={!email.trim() || status === "loading"}
                                            className="inline-flex h-9 items-center justify-center gap-1.5 rounded-md border border-foreground/15 px-4 text-sm font-medium text-foreground transition hover:bg-foreground/5 disabled:opacity-50 shrink-0"
                                        >
                                            {status === "loading" ? (
                                                <>
                                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                    Checking…
                                                </>
                                            ) : (
                                                "Check breaches"
                                            )}
                                        </button>
                                    </div>
                                    <p className="mt-2 text-xs text-foreground/50">
                                        No sign-up · We don&apos;t store what you type
                                    </p>
                                </form>
                            )}
                        </>
                    )}

                    {status === "result" && (
                        <div
                            className={`rounded-lg border p-6 text-left ${
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
                                className="w-full flex items-center justify-center gap-2 rounded-md bg-primary py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition"
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
                        <div className="rounded-lg border border-foreground/10 bg-card p-6 text-left">
                            <p className="text-sm text-foreground/75 mb-4">{errorMsg}</p>
                            <div className="flex flex-col sm:flex-row gap-2">
                                <Link
                                    href={signupWithEmail}
                                    className="flex-1 inline-flex items-center justify-center gap-2 rounded-md bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition"
                                >
                                    Connect inbox (free)
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                                <button
                                    onClick={reset}
                                    className="flex-1 rounded-md border border-foreground/10 py-2.5 text-sm text-foreground/70 hover:bg-foreground/5 transition"
                                >
                                    Try again
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-foreground/60">
                    {status === "idle" && !showBreachCheck && (
                        <button
                            type="button"
                            onClick={() => setShowBreachCheck(true)}
                            className="inline-flex items-center gap-1.5 hover:text-foreground transition"
                        >
                            <ShieldCheck className="h-4 w-4 text-foreground/45" />
                            Just check an email for breaches
                        </button>
                    )}
                    <a
                        href="#demo"
                        className="inline-flex items-center gap-1.5 hover:text-foreground transition"
                    >
                        <Eye className="h-4 w-4 text-foreground/45" />
                        See the live demo
                    </a>
                    <a
                        href="#shadow-scan"
                        className="inline-flex items-center gap-1.5 hover:text-foreground transition"
                    >
                        <Fingerprint className="h-4 w-4 text-foreground/45" />
                        Scan a username for shadow profiles
                    </a>
                </div>

                <SocialProofStats />
              </div>

              <AccessPanel />
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
        },
        {
            icon: Fingerprint,
            title: "Uncover shadow profiles",
            description:
                "We search hundreds of sites for accounts tied to your email, phone, or username — even ones you never created.",
        },
        {
            icon: AlertTriangle,
            title: "See what's been breached",
            description:
                "Every account is checked against known data breaches, with alerts when your details show up in new leaks.",
        },
        {
            icon: Trash2,
            title: "Delete what you don't need",
            description:
                "Direct links and step-by-step guides to close old accounts for good — and track every request.",
        },
        {
            icon: MailX,
            title: "Silence newsletter noise",
            description:
                "Every mailing list you're on, in one place. Unsubscribe from the ones you don't read in a click.",
        },
        {
            icon: DollarSign,
            title: "Recover forgotten money",
            description:
                "Gift cards, rewards points, expiring coupons, and subscriptions you're still paying for — found in your inbox.",
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
                            className="rounded-lg border border-foreground/10 bg-card p-6 transition-colors hover:border-foreground/25"
                        >
                            <div className="h-9 w-9 rounded-md border border-foreground/10 bg-foreground/[0.03] text-foreground/70 flex items-center justify-center mb-5">
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

            <div className="mx-auto max-w-5xl px-6 relative z-10">
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 rounded-md border border-purple-500/25 bg-purple-500/5 px-4 py-1.5 text-xs font-medium text-purple-700 dark:text-purple-400 mb-5">
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
            description: "Your inbox, the open web, and breach databases — in the background, so you can close the tab.",
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
                                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
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
                        <div className="rounded-2xl border border-foreground/10 bg-card overflow-hidden shadow-sm shadow-foreground/5">
                            <div className="flex items-center gap-2 border-b border-foreground/10 px-5 py-3">
                                <span className="text-[11px] text-foreground/50 font-mono">privacy_audit.log</span>
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
// Three choices: try it, clean up once, or stay protected. Pro Monthly and Pro Annual are
// the same product, so they share one card with a billing toggle. Prices and features come
// from lib/plans.ts so the site, billing page and paywall always agree.
type Billing = "annual" | "monthly";

function PlanFeatures({ items }: { items: string[] }) {
    return (
        <ul className="mt-6 space-y-2.5 flex-1">
            {items.map((text) => (
                <li key={text} className="flex items-start gap-2.5 text-sm text-foreground/80">
                    <Check className="h-4 w-4 shrink-0 mt-0.5 text-emerald-700 dark:text-emerald-400" />
                    {text}
                </li>
            ))}
        </ul>
    );
}

function PlanPrice({ price, period, note }: { price: string; period?: string; note: string }) {
    return (
        <>
            <div className="mt-4 flex items-baseline gap-1">
                <span className="font-mono text-3xl font-medium tabular-nums text-foreground">{price}</span>
                {period && <span className="text-sm text-foreground/55">{period}</span>}
            </div>
            <p className="mt-1 min-h-5 text-xs text-foreground/55">{note}</p>
        </>
    );
}

function PlanButton({ href, primary, children }: { href: string; primary?: boolean; children: React.ReactNode }) {
    return (
        <Link
            href={href}
            className={`mt-8 flex w-full items-center justify-center rounded-md py-2.5 text-sm font-medium transition-colors ${
                primary
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : "border border-foreground/15 text-foreground hover:bg-foreground/5"
            }`}
        >
            {children}
        </Link>
    );
}

function PricingSection() {
    const [billing, setBilling] = useState<Billing>("annual");
    const buster = PAID_PLANS.buster;
    const pro = billing === "annual" ? PAID_PLANS.sentinel : PAID_PLANS.pro;
    const proFeatures =
        billing === "annual"
            ? [PAID_PLANS.pro.features[0], ...PAID_PLANS.sentinel.features.slice(1)]
            : PAID_PLANS.pro.features;

    return (
        <section className="py-20 sm:py-28 border-t border-foreground/10 scroll-mt-16" id="pricing">
            <div className="mx-auto max-w-5xl px-6">
                <SectionHeading
                    eyebrow="Pricing"
                    title="Start free."
                    muted="Pay only to clean up."
                    description="Your first scan costs nothing. Upgrade if you want the full list and the tools to act on it."
                />

                <div className="grid grid-cols-1 overflow-hidden rounded-lg border border-foreground/10 bg-card md:grid-cols-3 md:divide-x divide-y md:divide-y-0 divide-foreground/10">
                    {/* Free */}
                    <div className="flex flex-col p-7">
                        <h3 className="text-sm font-medium text-foreground">{FREE_PLAN.name}</h3>
                        <p className="mt-1 text-sm text-foreground/60">See what&apos;s out there.</p>
                        <PlanPrice price={FREE_PLAN.price} note={FREE_PLAN.note} />
                        <PlanFeatures items={FREE_PLAN.features.filter((f) => !f.locked).map((f) => f.text)} />
                        <PlanButton href={SIGNUP_HREF}>Start free</PlanButton>
                    </div>

                    {/* Buster — one-off */}
                    <div className="flex flex-col p-7">
                        <h3 className="text-sm font-medium text-foreground">{buster.name}</h3>
                        <p className="mt-1 text-sm text-foreground/60">One full cleanup, paid once.</p>
                        <PlanPrice price={buster.price} note={buster.note} />
                        <PlanFeatures items={buster.features} />
                        <PlanButton href="/login?mode=signup&plan=buster">{buster.cta}</PlanButton>
                    </div>

                    {/* Pro — ongoing */}
                    <div className="relative flex flex-col bg-emerald-500/[0.04] p-7 shadow-[inset_0_2px_0_0_var(--primary)]">
                        <div className="flex items-center justify-between gap-3">
                            <h3 className="text-sm font-medium text-foreground">Pro</h3>
                            <div role="radiogroup" aria-label="Billing period" className="inline-flex rounded-md border border-foreground/15 p-0.5 text-xs">
                                {(["annual", "monthly"] as const).map((b) => (
                                    <button
                                        key={b}
                                        type="button"
                                        role="radio"
                                        aria-checked={billing === b}
                                        onClick={() => setBilling(b)}
                                        className={`rounded-sm px-2.5 py-1 capitalize transition-colors ${
                                            billing === b ? "bg-foreground text-background" : "text-foreground/60 hover:text-foreground"
                                        }`}
                                    >
                                        {b}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <p className="mt-1 text-sm text-foreground/60">Ongoing monitoring and alerts.</p>
                        <PlanPrice price={pro.price} period={pro.period} note={pro.note} />
                        <PlanFeatures items={proFeatures} />
                        <PlanButton primary href={`/login?mode=signup&plan=${billing}`}>{pro.cta}</PlanButton>
                    </div>
                </div>

                <p className="mt-6 text-sm text-foreground/55">{CHECKOUT_REASSURANCE}</p>
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
                        <div className="relative w-44 h-44 md:w-52 md:h-52 rounded-2xl overflow-hidden border border-foreground/10 shadow-sm">
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
                            className="absolute -bottom-3 -right-3 flex items-center gap-1.5 rounded-md bg-[#0A66C2] px-3 py-1.5 text-xs font-medium text-white shadow-lg hover:bg-[#004182] transition-colors"
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
                    <span className="text-foreground/50">Clean it up.</span>
                </h2>
                <p className="mx-auto mt-5 max-w-lg text-base text-foreground/65 leading-relaxed">
                    One scan shows every forgotten account, shadow profile, breach risk,
                    and dollar hiding in your inbox.
                </p>
                <div className="mt-9">
                    <PrimaryCTA size="lg">
                        Get my free scan
                    </PrimaryCTA>
                </div>
                <p className="mt-5 font-mono text-xs text-foreground/55">
                    CASA Tier 2 verified · Read-only access · Never stored · Never sold
                </p>
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
            <div className="border-t border-foreground/10 bg-background px-4 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))]">
                <Link
                    href={SIGNUP_HREF}
                    className="flex items-center justify-center gap-2 w-full rounded-md bg-primary py-3.5 text-sm font-semibold text-primary-foreground shadow-lg active:scale-[0.98] transition"
                >
                    Start free scan
                    <ArrowRight className="h-4 w-4" />
                </Link>
                <p className="text-center text-[11px] text-foreground/55 mt-1.5">
                    Free · No credit card · Read-only access
                </p>
            </div>
        </div>
    );
}

// ─── Page ──────────────────────────────────────────────────────
export default function HomePageClient({ latestBlogs }: { latestBlogs?: React.ReactNode }) {
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
            <Script
                id="qurius-widget"
                src="https://qurius.app/widget-iframe-embed.js"
                strategy="afterInteractive"
                data-id="535e5bb2-be38-453d-acfd-1fc9e0f37888"
                data-key="315c76c9fbd4cb83cdb225d1c9b0cf0138a42ec10f1650597edf8063aaa85fcd"
                data-plan="pro"
                data-theme="auto"
                data-primary-color="#1F5F4A"
            />

            <Hero />
            <ProductDemo />
            <WhatWeDoSection />
            <IdentityShadowSection />
            <HowItWorksSection />
            <PrivacySection />
            <PricingSection />
            <FAQSection />
            <TestimonialsSection />
            <FounderSection />
            {latestBlogs}
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
