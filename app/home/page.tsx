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
import { useState } from "react";
import { DigitalShadowSection } from "./_components/digital-shadow-section";
import { QuickExposureCheck } from "./_components/quick-exposure-check";
import { PrivacyTrustSection } from "./_components/privacy-trust-section";
import { ExecutiveProtectionTier } from "./_components/executive-protection-tier";
import { AutomatedRightToDelete } from "./_components/automated-right-to-delete";
import { ComparisonMatrix } from "./_components/comparison-matrix";
import { OutLookLogo, GmailLogo } from "@/svgs";

// Structured data (JSON-LD) for search engines
const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Find Hidden Accounts & Manage Your Digital Footprint | GhostSweep",
    "description": "Scan your inbox to discover forgotten accounts, detect data breaches, and take control of where your information lives.",
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
            "name": "Do you read my emails?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "No. GhostSweep uses email metadata (sender, subject, date) from Gmail and Outlook to detect accounts. We do not read email bodies, passwords, or attachments.",
            },
        },
        {
            "@type": "Question",
            "name": "Can GhostSweep send emails on my behalf?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Yes, but only when you explicitly approve. Deletion requests are sent FROM your Gmail or Outlook account, and you preview every email before it's sent. We never send anything without your permission.",
            },
        },
        {
            "@type": "Question",
            "name": "What happens if I disconnect Gmail or Outlook?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "You can revoke access any time from GhostSweep settings or your Google/Microsoft account. When you disconnect, we lose access immediately. Your saved data remains unless you delete it.",
            },
        },
        {
            "@type": "Question",
            "name": "Do you sell my data?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "No. We don't sell your data, run ads, or track you across other websites. Your privacy is the product, not the price.",
            },
        },
        {
            "@type": "Question",
            "name": "What's included in the 1-day free trial?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "You get full access to all Pro features for 1 day—unlimited accounts, deletion playbooks, tracking dashboard, and breach monitoring. No credit card required. After the trial, you can upgrade or continue with the free plan.",
            },
        },
    ],
};

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
                            scans email metadata from Gmail and Outlook, builds your footprint, and helps you clean it up.
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
        a: "No. GhostSweep uses email metadata (sender, subject, date) from Gmail and Outlook to detect accounts. We do not read email bodies, passwords, or attachments.",
    },
    {
        q: "Can GhostSweep send emails on my behalf?",
        a: "Yes, but only when you explicitly approve. Deletion requests are sent FROM your Gmail or Outlook account, and you preview every email before it's sent. We never send anything without your permission.",
    },
    {
        q: "What happens if I disconnect Gmail or Outlook?",
        a: "You can revoke access any time from GhostSweep settings or your Google/Microsoft account. When you disconnect, we lose access immediately. Your saved data remains unless you delete it.",
    },
    {
        q: "Do you sell my data?",
        a: "No. We don't sell your data, run ads, or track you across other websites. Your privacy is the product, not the price.",
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
    // const [hasShownPopup, setHasShownPopup] = useState(false);

    // useEffect(() => {
    //     const handleMouseLeave = (e: MouseEvent) => {
    //         if (e.clientY <= 0 && !hasShownPopup) {
    //             setShowExitPopup(true);
    //             setHasShownPopup(true);
    //         }
    //     };

    //     document.addEventListener('mouseleave', handleMouseLeave);
    //     return () => document.removeEventListener('mouseleave', handleMouseLeave);
    // }, [hasShownPopup]);

    return (
        <main className="min-h-screen bg-linear-to-b from-[#020308] via-black to-[#050608] text-foreground">
            {showExitPopup && <ExitIntentPopup onClose={() => setShowExitPopup(false)} />}

            {/* JSON-LD Structured Data */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
            />

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
                                    <strong className="text-white">320 people · 15,857 accounts found</strong>
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
                                        62 accounts were breached this month
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
                                title: "Connect Gmail or Outlook",
                                body: "Sign in with Google or Microsoft — takes 10 seconds",
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

                    {/* SUPPORTED PROVIDERS */}
                    <div className="mt-12 flex flex-col items-center gap-4">
                        <p className="text-sm text-zinc-400">We support</p>
                        <div className="flex items-center gap-8">
                            <div className="flex items-center gap-2">
                                <GmailLogo className="h-8 w-8" />
                                <span className="text-sm font-medium text-zinc-300">Gmail</span>
                            </div>
                            <div className="text-zinc-500">•</div>
                            <div className="flex items-center gap-2">
                                <OutLookLogo className="h-8 w-8" />
                                <span className="text-sm font-medium text-zinc-300">Outlook</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* DIGITAL SHADOW SECTION */}
                <DigitalShadowSection />

                {/* WHY GO PRO - CLEAR VALUE PROP */}
                <section className="relative overflow-hidden rounded-3xl border border-emerald-500/30 bg-emerald-500/5 p-6 sm:p-10">
                    <div className="pointer-events-none absolute inset-0">
                        <div className="absolute -top-32 right-10 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl" />
                    </div>

                    <div className="relative space-y-8">
                        <div className="space-y-3 text-center">
                            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/15 px-3.5 py-1.5 text-xs font-semibold text-emerald-300 backdrop-blur-sm">
                                <Zap className="h-3.5 w-3.5" />
                                <span>Upgrade Anytime</span>
                            </div>
                            <h2 className="text-3xl sm:text-4xl font-bold text-white">
                                Free finds accounts.<br />Pro deletes them.
                            </h2>
                            <p className="mx-auto max-w-2xl text-base text-emerald-100/80">
                                The free scan shows you what's out there. Pro handles the cleanup automatically.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                            <div className="rounded-xl border border-emerald-500/20 bg-black/30 p-4 space-y-2 group hover:bg-emerald-500/10 transition">
                                <div className="text-emerald-300 font-semibold text-sm">∞ Accounts</div>
                                <p className="text-xs text-emerald-100/60">vs 10 on Free</p>
                            </div>
                            <div className="rounded-xl border border-emerald-500/20 bg-black/30 p-4 space-y-2 group hover:bg-emerald-500/10 transition">
                                <div className="text-emerald-300 font-semibold text-sm">Deletion Playbooks</div>
                                <p className="text-xs text-emerald-100/60">100+ brokers automated</p>
                            </div>
                            <div className="rounded-xl border border-emerald-500/20 bg-black/30 p-4 space-y-2 group hover:bg-emerald-500/10 transition">
                                <div className="text-emerald-300 font-semibold text-sm">Weekly Scans</div>
                                <p className="text-xs text-emerald-100/60">Auto-monitor new accounts</p>
                            </div>
                            <div className="rounded-xl border border-emerald-500/20 bg-black/30 p-4 space-y-2 group hover:bg-emerald-500/10 transition">
                                <div className="text-emerald-300 font-semibold text-sm">Breach Alerts</div>
                                <p className="text-xs text-emerald-100/60">Real-time notifications</p>
                            </div>
                            <div className="rounded-xl border border-emerald-500/20 bg-black/30 p-4 space-y-2 group hover:bg-emerald-500/10 transition">
                                <div className="text-emerald-300 font-semibold text-sm">Track Progress</div>
                                <p className="text-xs text-emerald-100/60">Watch deletions happen</p>
                            </div>
                        </div>

                        <div className="text-center">
                            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-300">
                                <span>Only $6.58/month</span>
                                <span className="text-emerald-400">($79/year)</span>
                            </div>
                            <p className="text-xs text-emerald-100/60 mt-3">$50 cheaper than DeleteMe. Cancel anytime.</p>
                        </div>
                    </div>
                </section>

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

                {/* QUICK EXPOSURE CHECK - ZERO LOGIN LEAD MAGNET */}
                <QuickExposureCheck />

                {/* PRIVACY & TRUST SECTION */}
                <PrivacyTrustSection />

                {/* AUTOMATED RIGHT TO DELETE */}
                <AutomatedRightToDelete />

                {/* EXECUTIVE PROTECTION TIER */}
                <ExecutiveProtectionTier />

                {/* COMPARISON MATRIX */}
                <ComparisonMatrix />

                {/* TRUST & CREDIBILITY */}
                <section className="space-y-8">
                    <div className="space-y-4 text-center">
                        <h2 className="text-3xl sm:text-4xl font-bold text-white">
                            Trusted by privacy-conscious users
                        </h2>
                        <p className="mx-auto max-w-2xl text-base text-zinc-400">
                            Founded by a privacy engineer. Built with security first. Used by thousands.
                        </p>
                    </div>

                    <div className="grid gap-4 md:grid-cols-4">
                        <div className="rounded-xl border border-white/10 bg-[#050509] p-6 text-center space-y-3">
                            <div className="text-3xl font-bold text-emerald-400">87</div>
                            <p className="text-sm text-white font-medium">Forgotten Accounts</p>
                            <p className="text-xs text-zinc-400">Joel found personally</p>
                        </div>
                        <div className="rounded-xl border border-white/10 bg-[#050509] p-6 text-center space-y-3">
                            <div className="text-3xl font-bold text-emerald-400">🚀</div>
                            <p className="text-sm text-white font-medium">Privacy-First</p>
                            <p className="text-xs text-zinc-400">Built with security</p>
                        </div>
                        <div className="rounded-xl border border-white/10 bg-[#050509] p-6 text-center space-y-3">
                            <div className="text-3xl font-bold text-emerald-400">99.9%</div>
                            <p className="text-sm text-white font-medium">Data Security</p>
                            <p className="text-xs text-zinc-400">AES-256 encrypted</p>
                        </div>
                        <div className="rounded-xl border border-white/10 bg-[#050509] p-6 text-center space-y-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/20 mx-auto">
                                <BadgeCheck className="h-5 w-5 text-emerald-400" />
                            </div>
                            <p className="text-sm text-white font-medium">Privacy First</p>
                            <p className="text-xs text-zinc-400">GDPR & CCPA Ready</p>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-6 space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20">
                                <ShieldCheck className="h-6 w-6 text-emerald-400" />
                            </div>
                            <div>
                                <p className="font-semibold text-white">Built by Joel Komieter</p>
                                <p className="text-sm text-emerald-100/70">Privacy engineer solving the account cleanup problem</p>
                            </div>
                        </div>
                        <p className="text-sm text-emerald-100/80 leading-relaxed">
                            "I built GhostSweep because I found 280 forgotten accounts tied to my email. Most tools make it hard to delete them or compromise your privacy. This doesn't."
                        </p>
                    </div>
                </section>

                {/* PRICING */}
                <section className="space-y-8" id="pricing">
                    <SectionTitle
                        eyebrow="1-Day Free Trial"
                        title="Choose your plan"
                        desc="Start with free discovery. Try Pro features free for 1 day. No credit card required."
                    />

                    <div className="grid gap-4 md:grid-cols-2 md:[&>div:first-child]:order-2 md:[&>div:nth-child(2)]:order-1">
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
                                    <Zap className="h-3 w-3" /> Best Value
                                </span>
                            </div>

                            <div className="space-y-2">
                                <p className="text-xs font-semibold uppercase tracking-wide text-emerald-300">Professional</p>
                                <div className="flex items-baseline gap-2">
                                    <p className="text-4xl font-bold text-white">$9.99</p>
                                    <span className="text-sm text-zinc-300">/month</span>
                                </div>
                                <p className="text-xs text-emerald-100/80 font-medium">Full access to all Pro features</p>
                                <p className="text-xs text-emerald-300 pt-1">🎁 Or try free for 1 day</p>
                            </div>

                            <ul className="space-y-2.5 text-sm text-zinc-100">
                                <li className="flex items-start gap-2">
                                    <CheckCircle className="mt-0.5 h-3.5 w-3.5 text-emerald-400 flex-shrink-0" />
                                    <span>
                                        <strong>Unlimited account discovery</strong> (vs 10 on Free)
                                    </span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle className="mt-0.5 h-3.5 w-3.5 text-emerald-400 flex-shrink-0" />
                                    <span>
                                        <strong>Deletion playbooks</strong> for 100+ data brokers
                                    </span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle className="mt-0.5 h-3.5 w-3.5 text-emerald-400 flex-shrink-0" />
                                    <span>
                                        <strong>Weekly auto-scans</strong> (detect new accounts)
                                    </span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle className="mt-0.5 h-3.5 w-3.5 text-emerald-400 flex-shrink-0" />
                                    <span>
                                        <strong>Breach monitoring</strong> with instant alerts
                                    </span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle className="mt-0.5 h-3.5 w-3.5 text-emerald-400 flex-shrink-0" />
                                    <span>
                                        <strong>Track deletions</strong> in real time
                                    </span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle className="mt-0.5 h-3.5 w-3.5 text-emerald-400 flex-shrink-0" />
                                    <span>
                                        Weekly privacy reports & insights
                                    </span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle className="mt-0.5 h-3.5 w-3.5 text-emerald-400 flex-shrink-0" />
                                    <span>
                                        Export PDF compliance report
                                    </span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle className="mt-0.5 h-3.5 w-3.5 text-emerald-400 flex-shrink-0" />
                                    <span>Priority email support</span>
                                </li>
                            </ul>

                        <div className="space-y-2">
                            <Link
                                href="/login?plan=pro"
                                className="inline-flex w-full items-center justify-center rounded-full bg-emerald-500 px-6 py-3 text-sm font-semibold text-white hover:bg-emerald-600 transition shadow-lg hover:shadow-emerald-500/25"
                            >
                                Start 1-Day Free Trial
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                            <p className="text-center text-xs text-zinc-400">
                                No credit card. Cancel anytime. Trial expires in 1 day.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Value Comparison */}
                <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-6">
                    <div className="flex items-start gap-4">
                        <TriangleAlert className="mt-0.5 h-5 w-5 text-amber-400 flex-shrink-0" />
                        <div className="space-y-2">
                            <p className="font-semibold text-white">
                                Why Pro is a no-brainer
                            </p>
                            <div className="space-y-1 text-sm text-amber-100/80">
                                <p>• DeleteMe costs $129-149/year → <strong className="text-amber-300">You save $50+ with GhostSweep</strong></p>
                                <p>• Average account deletion takes 3-5 hours → <strong className="text-amber-300">Our playbooks save you 15+ hours</strong></p>
                                <p>• One new breach exposed per 72 hours → <strong className="text-amber-300">Get alerts instantly</strong></p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Annual Plan */}
                <div className="rounded-xl border border-white/10 bg-[#050509]/50 p-4">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div>
                            <p className="text-sm font-semibold text-white">Already decided? Annual saves more</p>
                            <p className="text-xs text-zinc-400">Get full year for less than 1 month of coffee</p>
                        </div>
                        <div className="text-center sm:text-right">
                            <p className="text-2xl font-bold text-emerald-400">$79/year</p>
                            <p className="text-xs text-zinc-300">$6.58/month equivalent</p>
                        </div>
                        <Link
                            href="/login?plan=pro-annual"
                            className="inline-flex items-center justify-center rounded-full bg-emerald-500/20 border border-emerald-500/40 px-6 py-2 text-sm font-medium text-emerald-300 hover:bg-emerald-500/30 transition"
                        >
                            Go Annual
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
                                What&apos;s included in the 1-day free trial?
                                <ChevronDown className="h-4 w-4 transition group-open:rotate-180" />
                            </summary>
                            <p className="mt-2 text-zinc-400 text-xs pl-4">
                                You get full access to all Pro features for 1 day—unlimited accounts, deletion playbooks, tracking dashboard, and breach monitoring. No credit card required. After the trial, you can upgrade or continue with the free plan.
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
                <section className="relative overflow-hidden rounded-3xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 via-black to-black p-6 sm:p-12 text-center space-y-6">
                    <div className="pointer-events-none absolute inset-0">
                        <div className="absolute -top-32 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-emerald-500/10 blur-3xl" />
                    </div>

                    <div className="relative space-y-4">
                        <h2 className="text-3xl sm:text-4xl font-bold text-white">
                            Stop paying for data brokers to sell your info
                        </h2>
                        <p className="mx-auto max-w-2xl text-base text-zinc-300">
                            You've found where your data is. Now take control. Start your 7-day free trial to delete accounts and reclaim your privacy.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                            <Link
                                href="/login?plan=pro"
                                className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-500 px-8 py-4 text-base font-semibold text-white hover:bg-emerald-600 transition shadow-lg hover:shadow-emerald-500/40"
                            >
                                Try Pro Free (1 Day)
                                <ArrowRight className="h-5 w-5" />
                            </Link>
                            <Link
                                href="/login"
                                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 bg-white/5 px-8 py-4 text-base font-semibold text-white hover:bg-white/10 transition"
                            >
                                Or start with Free
                                <ArrowRight className="h-5 w-5" />
                            </Link>
                        </div>

                        <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-zinc-300 pt-2">
                            <span className="inline-flex items-center gap-1">
                                <Check className="h-4 w-4 text-emerald-400" />
                                No credit card
                            </span>
                            <span className="inline-flex items-center gap-1">
                                <Check className="h-4 w-4 text-emerald-400" />
                                Cancel anytime
                            </span>
                            <span className="inline-flex items-center gap-1">
                                <Check className="h-4 w-4 text-emerald-400" />
                                1-day full access
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