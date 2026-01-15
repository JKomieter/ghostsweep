/* eslint-disable react/no-unescaped-entities */
"use client";

import Link from "next/link";
import {
    ArrowRight,
    ShieldCheck,
    EyeOff,
    Lock,
    CheckCircle,
    X,
    Check,
    Bell,
    Send,
    Search,
    FileWarning,
    Fingerprint,
    TriangleAlert,
    Sparkles,
    ListChecks,
    Mail,
    BadgeCheck,
    ChevronDown,
    Zap,
    Play
} from "lucide-react";
import Image from "next/image";
import { useState, useEffect } from "react";
import { DigitalShadowSection } from "./_components/digital-shadow-section";

function ExitIntentPopup({ onClose }: { onClose: () => void }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                onClick={onClose}
            />
            <div className="relative z-10 max-w-md rounded-2xl border border-white/10 bg-[#050509] p-8 text-center shadow-2xl">
                <h3 className="text-xl font-bold text-white">
                    Wait — before you go
                </h3>
                <p className="mt-3 text-sm text-zinc-400">
                    Takes 2 minutes to find accounts you forgot about.
                    <br />
                    <span className="text-white font-medium">Completely free. No credit card.</span>
                </p>
                <Link
                    href="/login"
                    className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-medium text-black hover:bg-zinc-100 transition"
                >
                    Okay, scan my email
                    <ArrowRight className="h-4 w-4" />
                </Link>
                <button
                    onClick={onClose}
                    className="mt-3 text-xs text-zinc-500 hover:text-zinc-300 transition"
                >
                    No thanks, I'll stay insecure
                </button>
            </div>
        </div>
    );
}

function VideoModal({
    open,
    onClose,
    videoUrl,
    title,
}: {
    open: boolean;
    onClose: () => void;
    videoUrl: string;
    title: string;
}) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <button
                className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                onClick={onClose}
                aria-label="Close video"
            />
            <div className="relative z-10 w-full max-w-3xl overflow-hidden rounded-2xl border border-white/10 bg-[#050507] shadow-[0_30px_120px_rgba(0,0,0,0.75)]">
                <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
                    <div className="text-sm font-semibold text-white">{title}</div>
                    <button
                        onClick={onClose}
                        className="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-xs text-white/80 hover:bg-white/10"
                    >
                        Close
                    </button>
                </div>

                <div className="relative w-full" style={{ paddingTop: "56.25%" }}>
                    <iframe
                        className="absolute inset-0 h-full w-full"
                        src={videoUrl}
                        title={title}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        referrerPolicy="strict-origin-when-cross-origin"
                        allowFullScreen
                    />
                </div>
            </div>
        </div>
    );
}

function FounderVideoSection() {
    const [open, setOpen] = useState(false);

    const videoEmbedUrl = "https://www.youtube.com/embed/FYN08Jr-PTE?si=KZIubL2gTsAHEyWw";
    const thumbUrl = "https://auth.ghostsweep.com/storage/v1/object/public/news/You%20in%202017.png";

    return (
        <section className="space-y-6">
            <SectionTitle
                eyebrow="See how it works"
                title="Real story. Real inbox. No fluff."
                desc="Watch me use GhostSweep to find 258 accounts I forgot existed."
            />

            <div className="grid gap-4 md:grid-cols-2">
                <button
                    type="button"
                    onClick={() => setOpen(true)}
                    className="group relative overflow-hidden rounded-2xl border border-white/10 bg-[#050509] text-left"
                    aria-label="Play video"
                >
                    <div className="relative aspect-video w-full">
                        <Image
                            src={thumbUrl}
                            alt="Watch the GhostSweep story video"
                            fill
                            className="object-cover opacity-90 transition group-hover:opacity-100"
                            priority={false}
                            unoptimized
                        />
                        <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/10 to-transparent" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="flex items-center gap-2 rounded-full border border-white/15 bg-black/50 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm transition group-hover:scale-[1.03]">
                                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-black">
                                    <Play className="h-4 w-4" />
                                </span>
                                Watch the video
                            </div>
                        </div>
                    </div>

                    <div className="p-4">
                        <div className="text-sm font-semibold text-white">
                            "I couldn't remember what I signed up for…"
                        </div>
                        <div className="mt-1 text-xs text-zinc-400">
                            Click to play — shows my real workflow using GhostSweep.
                        </div>
                    </div>
                </button>

                <div className="rounded-2xl border border-white/10 bg-[#050509] p-5">
                    <div className="space-y-3">
                        <p className="text-sm font-semibold text-white">
                            This video shows my actual results
                        </p>
                        <p className="text-sm text-zinc-400 leading-relaxed">
                            I kept finding old accounts I forgot existed — which later became spam,
                            breach exposure, and security risk. This video shows how GhostSweep
                            scans Gmail metadata, builds your footprint, and helps you clean it up.
                        </p>

                        <div className="rounded-xl border border-white/10 bg-black/30 p-4 text-xs text-zinc-400">
                            <div className="flex items-start gap-2">
                                <ShieldCheck className="mt-0.5 h-4 w-4 text-emerald-300" />
                                <div>
                                    <p className="text-zinc-200 font-medium">Privacy-first by design</p>
                                    <p className="mt-1">
                                        Metadata only · OAuth · revoke anytime · you approve every deletion email
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                            <Link
                                href="/login"
                                className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-2.5 text-sm font-medium text-black hover:bg-zinc-100 transition"
                            >
                                Find My Hidden Accounts <ArrowRight className="h-4 w-4" />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            <VideoModal
                open={open}
                onClose={() => setOpen(false)}
                videoUrl={videoEmbedUrl}
                title="Why You Get Spam From Companies You've Never Heard Of"
            />
        </section>
    );
}

const faqs = [
    {
        q: "Do you read my emails?",
        a: "No. GhostSweep uses Gmail metadata (sender, subject, date) to detect accounts. We do not read email bodies, passwords, or attachments.",
    },
    {
        q: "Can GhostSweep send emails on my behalf?",
        a: "Yes, but only when you explicitly approve. Deletion requests are sent FROM your Gmail account, and you preview every email before it's sent. We never send anything without your permission.",
    },
    {
        q: "What happens if I disconnect Gmail?",
        a: "You can revoke access any time from GhostSweep settings or your Google account. When you disconnect, we lose access immediately. Your saved data remains unless you delete it.",
    },
    {
        q: "Do you sell my data?",
        a: "No. We don't sell your data, run ads, or track you across other websites. Your privacy is the product, not the price.",
    },
];

const trustItems = [
    {
        icon: EyeOff,
        title: "Metadata only",
        desc: "We scan sender addresses, subjects, and dates to detect signup emails. We never read message bodies, passwords, or attachments.",
        linkText: null as string | null,
        linkHref: null as string | null,
    },
    {
        icon: Lock,
        title: "Easy revoke",
        desc: "Disconnect in GhostSweep settings or revoke access from your Google account. When you disconnect, we lose access immediately.",
        linkText: null as string | null,
        linkHref: null as string | null,
    },
    {
        icon: ShieldCheck,
        title: "Google OAuth",
        desc: "We use Google's official OAuth flow so you see exactly what permissions you grant before anything runs.",
        linkText: null as string | null,
        linkHref: null as string | null,
    },
    {
        icon: CheckCircle,
        title: "You approve everything",
        desc: "Deletion emails and clean-up steps are shown to you first. Nothing is sent automatically.",
        linkText: null as string | null,
        linkHref: null as string | null,
    },
    {
        icon: CheckCircle,
        title: "Human support",
        desc: "Questions or concerns? Email support directly and get a real response from a real person.",
        linkText: "Contact support",
        linkHref: "mailto:support@ghostsweep.com",
    },
    {
        icon: BadgeCheck,
        title: "Google verified + CASA certified",
        desc: "GhostSweep is verified for Google OAuth and CASA certified for sensitive scopes.",
        linkText: "Learn more",
        linkHref: "/home/security",
    },
];

function Badge({ children }: { children: React.ReactNode }) {
    return (
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] text-zinc-300">
            {children}
        </div>
    );
}

function SectionTitle({
    eyebrow,
    title,
    desc,
    id,
}: {
    eyebrow?: string;
    title: string;
    desc?: string;
    id?: string;
}) {
    return (
        <div className="space-y-2 text-center" id={id}>
            {eyebrow ? (
                <div className="flex justify-center">
                    <Badge>
                        <Sparkles className="h-3.5 w-3.5 text-emerald-300" />
                        <span>{eyebrow}</span>
                    </Badge>
                </div>
            ) : null}
            <h2 className="text-xl font-semibold text-white sm:text-2xl">{title}</h2>
            {desc ? <p className="mx-auto max-w-2xl text-sm text-zinc-400">{desc}</p> : null}
        </div>
    );
}

export default function HomePage() {
    const [showExitPopup, setShowExitPopup] = useState(false);
    const [hasShownPopup, setHasShownPopup] = useState(false);

    useEffect(() => {
        const handleMouseLeave = (e: MouseEvent) => {
            if (e.clientY <= 0 && !hasShownPopup) {
                setShowExitPopup(true);
                setHasShownPopup(true);
            }
        };

        document.addEventListener('mouseleave', handleMouseLeave);
        return () => document.removeEventListener('mouseleave', handleMouseLeave);
    }, [hasShownPopup]);

    return (
        <main className="min-h-screen bg-linear-to-b from-[#020308] via-black to-[#050608] text-foreground">
            {showExitPopup && <ExitIntentPopup onClose={() => setShowExitPopup(false)} />}

            <div className="mx-auto max-w-6xl px-4 pb-20 pt-10 space-y-16 md:space-y-20">
                {/* HERO - REDESIGNED */}
                <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/2 p-6 sm:p-10">
                    <div className="pointer-events-none absolute inset-0">
                        <div className="absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-emerald-500/10 blur-3xl" />
                        <div className="absolute -bottom-24 right-10 h-72 w-72 rounded-full bg-white/5 blur-3xl" />
                    </div>

                    <div className="relative space-y-6">
                        {/* Social proof badge */}
                        <div className="flex justify-center">
                            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-sm">
                                <div className="flex -space-x-2">
                                    <div className="h-6 w-6 rounded-full border-2 border-black bg-linear-to-br from-emerald-400 to-emerald-600" />
                                    <div className="h-6 w-6 rounded-full border-2 border-black bg-linear-to-br from-cyan-400 to-cyan-600" />
                                    <div className="h-6 w-6 rounded-full border-2 border-black bg-linear-to-br from-purple-400 to-purple-600" />
                                </div>
                                <span className="text-zinc-200">
                                    <strong className="text-white">112 people · 3,540 accounts found</strong>
                                </span>
                            </div>
                        </div>

                        {/* Main headline - PROBLEM FOCUSED */}
                        <div className="mx-auto max-w-3xl space-y-4 text-center">
                            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl">
                                You have 200+ accounts.
                                <br />
                                <span className="text-zinc-400">
                                    You forgot about 180 of them.
                                </span>
                            </h1>

                            <p className="text-lg text-zinc-300 sm:text-xl">
                                Those forgotten accounts are now security risks, spam sources, and data leaks.
                                <br />
                                <span className="text-white font-semibold">Find them in 2 minutes.</span>
                            </p>
                        </div>

                        {/* Urgency warning */}
                        <div className="mx-auto max-w-2xl rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5">
                            <div className="flex items-start gap-3">
                                <TriangleAlert className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-300" />
                                <div className="space-y-2 text-left">
                                    <p className="text-sm font-semibold text-white">
                                        33 accounts were breached this month
                                    </p>
                                    <p className="text-xs text-zinc-300">
                                        Check if yours are exposed. See every account tied to your email — old forums, shopping sites, free trials you never canceled, and services that got breached.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* ONE CLEAR CTA */}
                        <div className="flex justify-center">
                            <Link
                                href="/login"
                                className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-8 py-4 text-base font-semibold text-black shadow-lg hover:bg-zinc-100 transition transform hover:scale-105"
                            >
                                Find My Hidden Accounts (Free 2-Min Scan)
                                <ArrowRight className="h-5 w-5" />
                            </Link>
                        </div>

                        {/* Trust bullets */}
                        <div className="flex flex-wrap justify-center gap-4 text-xs text-zinc-400">
                            <span className="inline-flex items-center gap-1">
                                <Check className="h-3 w-3 text-emerald-400" />
                                2-minute scan
                            </span>
                            <span className="inline-flex items-center gap-1">
                                <Check className="h-3 w-3 text-emerald-400" />
                                No credit card
                            </span>
                            <span className="inline-flex items-center gap-1">
                                <Check className="h-3 w-3 text-emerald-400" />
                                Revoke anytime
                            </span>
                        </div>

                        {/* Concrete result preview */}
                        <div className="mx-auto max-w-2xl rounded-2xl border border-white/10 bg-black/30 p-5">
                            <div className="flex items-start gap-3">
                                <Sparkles className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-300" />
                                <div className="space-y-2 text-left">
                                    <p className="text-sm font-semibold text-white">
                                        Here's what you'll discover:
                                    </p>
                                    <ul className="space-y-1 text-xs text-zinc-300">
                                        <li>• Old forums you joined in 2011</li>
                                        <li>• Shopping sites you used once</li>
                                        <li>• Free trials you never canceled</li>
                                        <li>• Services that got breached</li>
                                        <li>• Apps you forgot existed</li>
                                    </ul>
                                    <p className="text-xs text-emerald-300 font-medium pt-1">
                                        → Then we show you exactly how to delete them
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* HOW IT WORKS - SIMPLIFIED */}
                <section className="space-y-8" id="how">
                    <div className="text-center space-y-2">
                        <Badge>
                            <Sparkles className="h-3.5 w-3.5 text-emerald-300" />
                            <span>How it works</span>
                        </Badge>
                        <h2 className="text-2xl font-bold text-white sm:text-3xl">
                            Find every account in 3 clicks
                        </h2>
                        <p className="text-sm text-zinc-400">
                            No setup. No email reading. Just results.
                        </p>
                    </div>

                    <div className="grid gap-6 md:grid-cols-3">
                        {[
                            {
                                step: "1",
                                icon: Mail,
                                title: "Connect Gmail",
                                body: "Click 'Sign in with Google' — takes 10 seconds",
                            },
                            {
                                step: "2",
                                icon: Search,
                                title: "We scan metadata",
                                body: "We find signup emails (we don't read your messages)",
                            },
                            {
                                step: "3",
                                icon: ListChecks,
                                title: "See everything",
                                body: "Get your full list + steps to delete each account",
                            },
                        ].map((s) => (
                            <div key={s.step} className="rounded-2xl border border-white/10 bg-[#050509] p-6 text-center">
                                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 text-xl font-bold text-emerald-300">
                                    {s.step}
                                </div>
                                <s.icon className="mx-auto mb-3 h-6 w-6 text-zinc-400" />
                                <p className="mb-2 text-base font-semibold text-white">{s.title}</p>
                                <p className="text-sm text-zinc-400">{s.body}</p>
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-center">
                        <Link
                            href="/login"
                            className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-medium text-black hover:bg-zinc-100 transition"
                        >
                            Start My Scan Now
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>
                </section>

                {/* DIGITAL SHADOW SECTION */}
                <DigitalShadowSection />

                {/* RESULTS PREVIEW - NEW VISUAL SECTION */}
                <section className="space-y-6">
                    <div className="text-center space-y-2">
                        <Badge>
                            <Fingerprint className="h-3.5 w-3.5 text-emerald-300" />
                            <span>What you'll see</span>
                        </Badge>
                        <h2 className="text-2xl font-bold text-white sm:text-3xl">
                            Real examples from real scans
                        </h2>
                        <p className="text-sm text-zinc-400">
                            Most people discover 50-200 accounts they completely forgot about
                        </p>
                    </div>

                    {/* VISUAL MOCK OF RESULTS */}
                    <div className="rounded-2xl border border-white/10 bg-[#050509] p-6">
                        <div className="mb-6 grid gap-4 sm:grid-cols-3">
                            <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-center">
                                <p className="text-3xl font-bold text-white">127</p>
                                <p className="text-xs text-zinc-400 mt-1">Accounts found</p>
                            </div>
                            <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-center">
                                <p className="text-3xl font-bold text-amber-300">23</p>
                                <p className="text-xs text-zinc-400 mt-1">Breached</p>
                            </div>
                            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-center">
                                <p className="text-3xl font-bold text-emerald-300">89</p>
                                <p className="text-xs text-zinc-400 mt-1">Can be deleted</p>
                            </div>
                        </div>

                        <div className="space-y-2">
                            {[
                                { name: "Old Forum (2011)", risk: "Breached 2019", action: "Delete now", color: "red" },
                                { name: "Shopping site", risk: "Inactive 4 years", action: "Delete", color: "amber" },
                                { name: "Free trial (never used)", risk: "Data shared with 47 companies", action: "Delete", color: "amber" },
                                { name: "Spotify", risk: "Active subscription", action: "Keep", color: "green" },
                            ].map((item, i) => (
                                <div
                                    key={i}
                                    className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3"
                                >
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-white">{item.name}</p>
                                        <p className="text-xs text-zinc-400">{item.risk}</p>
                                    </div>
                                    <span
                                        className={`rounded-full px-3 py-1 text-xs font-medium ${item.color === "red"
                                                ? "border border-red-500/40 bg-red-500/10 text-red-300"
                                                : item.color === "amber"
                                                    ? "border border-amber-500/40 bg-amber-500/10 text-amber-300"
                                                    : "border border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
                                            }`}
                                    >
                                        {item.action}
                                    </span>
                                </div>
                            ))}
                        </div>

                        <p className="mt-4 text-center text-xs text-zinc-500">
                            This is what your dashboard will look like (with your real accounts)
                        </p>
                    </div>

                    <div className="flex justify-center">
                        <Link
                            href="/login"
                            className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-medium text-black hover:bg-zinc-100 transition"
                        >
                            See My Real Results
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>
                </section>

                {/* VIDEO - MOVED AFTER RESULTS */}
                <FounderVideoSection />

                {/* FEATURES */}
                <section className="space-y-8">
                    <SectionTitle
                        eyebrow="Features"
                        title="Everything you need to clean up"
                        desc="Discover accounts, spot risk, then delete what you don't want holding your data."
                    />

                    <div className="grid gap-4 md:grid-cols-3">
                        {[
                            {
                                icon: Search,
                                title: "Account discovery",
                                body: "Detect services tied to your inbox using safe metadata signals, then group them into one view.",
                                foot: "Free shows your total count. Pro unlocks the full list.",
                            },
                            {
                                icon: FileWarning,
                                title: "Breach visibility (Pro)",
                                body: "See breach indicators and prioritize accounts that matter — before they become a problem.",
                                foot: "Know what to fix first.",
                            },
                            {
                                icon: Send,
                                title: "Deletion workflow (Pro)",
                                body: "Generate deletion emails/links, bulk-send where possible, and track replies + follow-ups.",
                                foot: "No more \"where was that link?\"",
                            },
                        ].map((f) => (
                            <div key={f.title} className="rounded-2xl border border-white/10 bg-[#050509] p-5">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5">
                                    <f.icon className="h-4 w-4 text-zinc-200" />
                                </div>
                                <p className="mt-3 text-sm font-semibold text-white">{f.title}</p>
                                <p className="mt-2 text-xs leading-relaxed text-zinc-400">{f.body}</p>
                                <p className="mt-3 text-[11px] text-zinc-500">{f.foot}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* TRUST */}
                <section className="space-y-8">
                    <SectionTitle
                        eyebrow="Security"
                        title="Privacy-first, not privacy-flavored"
                        desc="Designed to minimize access, be explicit about what it does, and make it easy to revoke permissions."
                    />

                    <div className="grid gap-4 md:grid-cols-3">
                        {trustItems.map((item) => (
                            <div key={item.title} className="rounded-2xl border border-white/10 bg-[#050509] p-5">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10">
                                    <item.icon className="h-4 w-4 text-emerald-400" />
                                </div>

                                <div className="mt-3 space-y-1">
                                    <p className="text-sm font-semibold text-white">{item.title}</p>
                                    <p className="text-xs text-zinc-400">{item.desc}</p>

                                    {item.linkHref && item.linkText ? (
                                        <Link
                                            href={item.linkHref}
                                            target="_blank"
                                            className="inline-flex items-center gap-1 pt-2 text-[11px] text-emerald-300 hover:text-emerald-200"
                                        >
                                            {item.linkText}
                                            <ArrowRight className="h-3 w-3" />
                                        </Link>
                                    ) : null}
                                </div>
                            </div>
                        ))}

                        {/* Founder card */}
                        <div className="rounded-2xl border border-white/10 bg-[#050509] p-5 md:col-span-3">
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="relative h-12 w-12 overflow-hidden rounded-2xl border border-white/10 bg-white/5">
                                        <Image src="https://ghostsweep.t3.storage.dev/f1789004-4f47-4d23-a5c9-d66f62e532f3.jpg" alt="Founder of GhostSweep" fill className="object-cover" unoptimized />
                                    </div>

                                    <div className="space-y-0.5">
                                        <p className="text-sm font-semibold text-white">Built by Joel</p>
                                        <p className="text-xs text-zinc-400">
                                            Founder of GhostSweep — privacy-first tools, no ads, no data selling.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] text-zinc-300">
                                        Real human support
                                    </span>
                                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] text-zinc-300">
                                        Built to minimize access
                                    </span>
                                    <Link
                                        href="mailto:kommieterj@gmail.com"
                                        className="rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1 text-[11px] text-emerald-200 hover:bg-emerald-500/15 transition"
                                    >
                                        Email me
                                    </Link>
                                </div>
                            </div>

                            <div className="mt-3 rounded-xl border border-white/10 bg-black/30 p-4">
                                <p className="text-xs text-zinc-400 leading-relaxed">
                                    I built GhostSweep because deleting old accounts is deliberately hard. This tool helps you find what exists and take action —
                                    <span className="text-zinc-200"> and you stay in control the whole time.</span>
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="text-center">
                        <Link href="/home/security" className="inline-flex items-center gap-1 text-xs text-zinc-300 hover:text-white">
                            Read the security overview
                            <ArrowRight className="h-3 w-3" />
                        </Link>
                    </div>
                </section>

                {/* PRICING */}
                <section className="space-y-8" id="pricing">
                    <SectionTitle
                        eyebrow="Pricing"
                        title="Start free. Upgrade to see everything."
                        desc="Free users discover their digital footprint. Pro users get unlimited access, deletion playbooks, and continuous monitoring."
                    />

                    <div className="grid gap-4 md:grid-cols-2">
                        {/* Free */}
                        <div className="rounded-2xl border border-white/10 bg-[#050509] p-6 space-y-5">
                            <div className="space-y-2">
                                <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">Free</p>
                                <div className="flex items-baseline gap-1">
                                    <p className="text-3xl font-semibold text-white">$0</p>
                                    <span className="text-xs text-zinc-400">forever</span>
                                </div>
                                <p className="text-xs text-zinc-400">Perfect for discovering your digital footprint</p>
                            </div>

                            <ul className="space-y-2 text-sm text-zinc-300">
                                <li className="flex items-start gap-2">
                                    <CheckCircle className="mt-0.5 h-3.5 w-3.5 text-emerald-400" />
                                    <span>One email scan</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle className="mt-0.5 h-3.5 w-3.5 text-emerald-400" />
                                    <span>See up to 10 accounts</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle className="mt-0.5 h-3.5 w-3.5 text-emerald-400" />
                                    <span>View all breach alerts</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle className="mt-0.5 h-3.5 w-3.5 text-emerald-400" />
                                    <span>Privacy score dashboard</span>
                                </li>
                                <li className="flex items-start gap-2 text-zinc-400">
                                    <X className="mt-0.5 h-3.5 w-3.5 text-zinc-500" />
                                    <span>No deletion playbooks</span>
                                </li>
                                <li className="flex items-start gap-2 text-zinc-400">
                                    <X className="mt-0.5 h-3.5 w-3.5 text-zinc-500" />
                                    <span>No continuous monitoring</span>
                                </li>
                                <li className="flex items-start gap-2 text-zinc-400">
                                    <X className="mt-0.5 h-3.5 w-3.5 text-zinc-500" />
                                    <span>No deletion tracking</span>
                                </li>
                            </ul>

                            <Link
                                href="/login"
                                className="inline-flex w-full items-center justify-center rounded-full border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-medium text-zinc-50 hover:bg-white/10 transition"
                            >
                                Start free
                            </Link>
                        </div>

                        {/* Pro */}
                        <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/5 p-6 space-y-5 relative">
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500 px-3 py-1 text-xs font-semibold text-white">
                                    <Zap className="h-3 w-3" /> Most Popular
                                </span>
                            </div>

                            <div className="space-y-2">
                                <p className="text-xs font-semibold uppercase tracking-wide text-emerald-300">Professional</p>
                                <div className="flex items-baseline gap-2">
                                    <p className="text-3xl font-semibold text-white">$9.99</p>
                                    <span className="text-xs text-zinc-300">/month</span>
                                </div>
                                <p className="text-xs text-emerald-300">Complete privacy protection & account deletion</p>
                            </div>

                            <ul className="space-y-2 text-sm text-zinc-200">
                                <li className="flex items-start gap-2">
                                    <CheckCircle className="mt-0.5 h-3.5 w-3.5 text-emerald-400" />
                                    <span className="font-medium">Everything in Free, plus:</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle className="mt-0.5 h-3.5 w-3.5 text-emerald-400" />
                                    <span>
                                        <strong>Unlimited accounts</strong> discovered
                                    </span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle className="mt-0.5 h-3.5 w-3.5 text-emerald-400" />
                                    <span>
                                        <strong>Step-by-step deletion playbooks</strong> for every account
                                    </span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle className="mt-0.5 h-3.5 w-3.5 text-emerald-400" />
                                    <span>
                                        Weekly monitoring{" "}
                                        <span className="text-xs text-zinc-300">(auto-detect new accounts)</span>
                                    </span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle className="mt-0.5 h-3.5 w-3.5 text-emerald-400" />
                                    <span>
                                        Deletion tracking dashboard{" "}
                                        <span className="text-xs text-zinc-300">(mark as deleted/pending)</span>
                                    </span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle className="mt-0.5 h-3.5 w-3.5 text-emerald-400" />
                                    <span>
                                        Continuous breach monitoring{" "}
                                        <span className="inline-flex items-center gap-1 text-xs text-zinc-300">
                                            <Bell className="h-3 w-3" /> instant alerts
                                        </span>
                                    </span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle className="mt-0.5 h-3.5 w-3.5 text-emerald-400" />
                                    <span>Export privacy report (PDF)</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle className="mt-0.5 h-3.5 w-3.5 text-emerald-400" />
                                    <span>Priority email support</span>
                                </li>
                            </ul>

                            <div className="space-y-2">
                                <Link
                                    href="/dashboard/billing?plan=monthly"
                                    className="inline-flex w-full items-center justify-center rounded-full bg-white px-4 py-2.5 text-sm font-medium text-black hover:bg-zinc-100 transition"
                                >
                                    Start 7-Day Free Trial
                                </Link>
                                <p className="text-center text-xs text-zinc-400">
                                    No credit card required • Cancel anytime
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Annual Plan */}
                    <div className="rounded-xl border border-white/10 bg-[#050509]/50 p-4">
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div>
                                <p className="text-sm font-semibold text-white">Annual Plan</p>
                                <p className="text-xs text-zinc-400">Save 20% with yearly billing</p>
                            </div>
                            <div className="text-center sm:text-right">
                                <p className="text-2xl font-semibold text-white">$95.88<span className="text-sm text-zinc-400">/year</span></p>
                                <p className="text-xs text-emerald-400">Just $7.99/month</p>
                            </div>
                            <Link
                                href="/dashboard/billing?plan=annual"
                                className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-6 py-2 text-sm font-medium text-white hover:bg-emerald-600 transition"
                            >
                                Save $23.88
                            </Link>
                        </div>
                    </div>

                    {/* FAQ below pricing */}
                    <div className="mt-8 pt-8 border-t border-white/10 space-y-4">
                        <details className="text-sm group">
                            <summary className="cursor-pointer text-zinc-300 hover:text-white font-medium flex items-center justify-between">
                                What happens if I find more than 10 accounts?
                                <ChevronDown className="h-4 w-4 transition group-open:rotate-180" />
                            </summary>
                            <p className="mt-2 text-zinc-400 text-xs pl-4">
                                Free users can see the total number of accounts found (e.g., &quot;37 accounts&quot;), but can only view details for the first 10. Upgrade to Pro to see all accounts and get step-by-step deletion instructions for each one.
                            </p>
                        </details>

                        <details className="text-sm group">
                            <summary className="cursor-pointer text-zinc-300 hover:text-white font-medium flex items-center justify-between">
                                Do I still see breach alerts on the free plan?
                                <ChevronDown className="h-4 w-4 transition group-open:rotate-180" />
                            </summary>
                            <p className="mt-2 text-zinc-400 text-xs pl-4">
                                Yes! All users (free and Pro) can see which accounts have been involved in data breaches. Pro users get continuous monitoring and instant email alerts when new breaches are detected.
                            </p>
                        </details>

                        <details className="text-sm group">
                            <summary className="cursor-pointer text-zinc-300 hover:text-white font-medium flex items-center justify-between">
                                Can I scan multiple emails on the free plan?
                                <ChevronDown className="h-4 w-4 transition group-open:rotate-180" />
                            </summary>
                            <p className="mt-2 text-zinc-400 text-xs pl-4">
                                Free users can scan one email address per month. Pro users get unlimited scans plus automatic weekly monitoring to catch new accounts as they&apos;re created.
                            </p>
                        </details>

                        <details className="text-sm group">
                            <summary className="cursor-pointer text-zinc-300 hover:text-white font-medium flex items-center justify-between">
                                What&apos;s included in the 7-day free trial?
                                <ChevronDown className="h-4 w-4 transition group-open:rotate-180" />
                            </summary>
                            <p className="mt-2 text-zinc-400 text-xs pl-4">
                                You get full access to all Pro features for 7 days—unlimited accounts, deletion playbooks, tracking dashboard, and breach monitoring. No credit card required. After the trial, you can upgrade or continue with the free plan.
                            </p>
                        </details>

                        <details className="text-sm group">
                            <summary className="cursor-pointer text-zinc-300 hover:text-white font-medium flex items-center justify-between">
                                How does deletion tracking work?
                                <ChevronDown className="h-4 w-4 transition group-open:rotate-180" />
                            </summary>
                            <p className="mt-2 text-zinc-400 text-xs pl-4">
                                Pro users can mark accounts as "Pending", "Deletion Requested", or "Deleted" to track their progress. Your dashboard shows how many accounts you&apos;ve successfully removed and calculates your privacy score improvement.
                            </p>
                        </details>
                    </div>
                </section>

                {/* FAQ */}
                <section className="space-y-8" id="faq">
                    <SectionTitle
                        eyebrow="FAQ"
                        title="Common questions"
                    />
                    <div className="grid gap-4 md:grid-cols-2">
                        {faqs.map((item) => (
                            <div key={item.q} className="rounded-2xl border border-white/10 bg-[#050509] p-5 space-y-2">
                                <p className="text-sm font-semibold text-white">{item.q}</p>
                                <p className="text-xs text-zinc-400">{item.a}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* FINAL CTA */}
                <section className="rounded-3xl border border-white/10 bg-white/2 p-6 sm:p-8 text-center space-y-4">
                    <h2 className="text-lg font-semibold text-white sm:text-xl">Ready to clean up?</h2>
                    <p className="mx-auto max-w-xl text-sm text-zinc-400">
                        You can't protect what you can't see. Run a scan, see your footprint, then choose what you want to shut down.
                    </p>

                    <div className="flex flex-col items-center justify-center gap-3">
                        <Link
                            href="/login"
                            className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-8 py-4 text-base font-semibold text-black hover:bg-zinc-100 transition transform hover:scale-105"
                        >
                            Find My Hidden Accounts (Free)
                            <ArrowRight className="h-5 w-5" />
                        </Link>

                        <div className="flex flex-wrap items-center justify-center gap-3 text-[11px] text-zinc-400">
                            <span className="inline-flex items-center gap-1">
                                <Check className="h-3 w-3 text-emerald-400" />
                                2-minute scan
                            </span>
                            <span className="inline-flex items-center gap-1">
                                <Check className="h-3 w-3 text-emerald-400" />
                                No credit card
                            </span>
                            <span className="inline-flex items-center gap-1">
                                <Check className="h-3 w-3 text-emerald-400" />
                                Revoke anytime
                            </span>
                        </div>
                    </div>
                </section>

                {/* FOOTER */}
                <footer className="border-t border-white/10 pt-6 text-[11px] text-zinc-500">
                    <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
                        <p>© {new Date().getFullYear()} GhostSweep. Built with privacy in mind.</p>
                        <div className="flex flex-wrap justify-center gap-4">
                            <Link href="/home/privacy" className="hover:text-zinc-300 transition">
                                Privacy
                            </Link>
                            <Link href="/home/terms" className="hover:text-zinc-300 transition">
                                Terms
                            </Link>
                            <Link href="/home/security" className="hover:text-zinc-300 transition">
                                Security
                            </Link>
                            <Link href="mailto:support@ghostsweep.com" className="hover:text-zinc-300 transition">
                                Contact
                            </Link>
                        </div>
                    </div>
                </footer>
            </div>
        </main>
    );
}