/* eslint-disable react/no-unescaped-entities */
"use client";

import Link from "next/link";
import {
    ArrowRight,
    ShieldCheck,
    CheckCircle,
    X,
    Check,
    Send,
    Search,
    FileWarning,
    Fingerprint,
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
            <div className="relative z-10 max-w-md rounded-lg border border-white/5 bg-white/2 p-8 text-center shadow-2xl">
                <h3 className="text-xl font-light text-white">
                    Wait — before you go
                </h3>
                <p className="mt-3 text-sm text-white/60">
                    Takes 2 minutes to find accounts you forgot about.
                    <br />
                    <span className="text-white font-light">Completely free. No credit card.</span>
                </p>
                <Link
                    href="/login"
                    className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-light text-black hover:bg-white/90 transition"
                >
                    Okay, scan my email
                    <ArrowRight className="h-4 w-4" />
                </Link>
                <button
                    onClick={onClose}
                    className="mt-3 text-xs text-white/40 hover:text-white/60 transition"
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
            <div className="relative z-10 w-full max-w-3xl overflow-hidden rounded-lg border border-white/5 bg-white/2 shadow-[0_30px_120px_rgba(0,0,0,0.75)]">
                <div className="flex items-center justify-between border-b border-white/5 px-4 py-3">
                    <div className="text-sm font-light text-white">{title}</div>
                    <button
                        onClick={onClose}
                        className="rounded-lg border border-white/5 bg-white/2 px-2 py-1 text-xs text-white/70 hover:bg-white/3 hover:border-white/10"
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
                    className="group relative overflow-hidden rounded-lg border border-white/5 bg-white/2 text-left"
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
                            <div className="flex items-center gap-2 rounded-full border border-white/10 bg-black/50 px-4 py-2 text-sm font-light text-white backdrop-blur-sm transition group-hover:scale-[1.03]">
                                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-black">
                                    <Play className="h-4 w-4" />
                                </span>
                                Watch the video
                            </div>
                        </div>
                    </div>

                    <div className="p-4">
                        <div className="text-sm font-light text-white">
                            "I couldn't remember what I signed up for…"
                        </div>
                        <div className="mt-1 text-xs text-white/60">
                            Click to play — shows my real workflow using GhostSweep.
                        </div>
                    </div>
                </button>

                <div className="rounded-lg border border-white/5 bg-white/2 p-5">
                    <div className="space-y-3">
                        <p className="text-sm font-light text-white">
                            This video shows my actual results
                        </p>
                        <p className="text-sm text-white/60 leading-relaxed">
                            I kept finding old accounts I forgot existed — which later became spam,
                            breach exposure, and security risk. This video shows how GhostSweep
                            scans email metadata from Gmail and Outlook, builds your footprint, and helps you clean it up.
                        </p>

                        <div className="rounded-lg border border-white/5 bg-white/2 p-4 text-xs text-white/60">
                            <div className="flex items-start gap-2">
                                <ShieldCheck className="mt-0.5 h-4 w-4 text-emerald-300" />
                                <div>
                                    <p className="text-white/80 font-light">Privacy-first by design</p>
                                    <p className="mt-1">
                                        Metadata only · OAuth · revoke anytime · you approve every deletion email
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                            <Link
                                href="/login"
                                className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-2.5 text-sm font-light text-black hover:bg-white/90 transition"
                            >
                                Scan My Digital Shadow <ArrowRight className="h-4 w-4" />
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
        <div className="inline-flex items-center gap-2 rounded-full border border-white/5 bg-white/2 px-3 py-1.5 text-[11px] text-white/70">
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
            <h2 className="text-xl font-light text-white sm:text-2xl">{title}</h2>
            {desc ? <p className="mx-auto max-w-2xl text-sm text-white/60">{desc}</p> : null}
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
        <main className="min-h-screen bg-[#050505] text-foreground">
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
                <section className="relative overflow-hidden rounded-lg border border-white/5 bg-white/2 p-6 sm:p-10">
                    <div className="pointer-events-none absolute inset-0">
                        <div className="absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-emerald-500/10 blur-3xl" />
                        <div className="absolute -bottom-24 right-10 h-72 w-72 rounded-full bg-white/5 blur-3xl" />
                    </div>

                    <div className="relative space-y-6">
                        {/* Subtle proof */}
                        <div className="flex justify-center">
                            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-2">
                                <span className="text-sm font-light text-emerald-300">
                                    332 users discovered 17,013 services
                                </span>
                            </div>
                        </div>

                        {/* Main headline - PROBLEM FOCUSED */}
                        <div className="mx-auto max-w-3xl space-y-3 text-center">
                            <h1 className="text-3xl font-light tracking-tight text-white sm:text-4xl md:text-5xl">
                                You are exposed in 200+ places.
                                <br />
                                <span className="text-white/60">
                                    It's time to disappear.
                                </span>
                            </h1>

                            <p className="text-sm sm:text-base text-white/60">
                                GhostSweep maps your forgotten digital footprint and helps you automate the deletion of your data from brokers and "zombie" accounts. Stop the leaks before they become identity theft.
                            </p>
                        </div>

                        {/* Soft risk callout */}
                        <div className="mx-auto max-w-2xl rounded-lg border border-white/5 bg-white/2 p-5">
                            <div className="space-y-2 text-left">
                                <p className="text-sm font-light text-white">
                                    Forgotten accounts still hold your data.
                                </p>
                                <p className="text-xs text-white/60">
                                    Old signups, free trials, and dormant profiles quietly persist in dozens of systems. We surface them so you can decide what stays and what goes.
                                </p>
                            </div>
                        </div>

                        {/* Primary CTA */}
                        <div className="flex justify-center">
                            <Link
                                href="/login"
                                className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-light text-black shadow-[0_0_25px_rgba(16,185,129,0.45)] ring-1 ring-emerald-400/40 hover:bg-white/90 hover:shadow-[0_0_35px_rgba(16,185,129,0.6)] transition"
                            >
                                Scan My Digital Shadow
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                        </div>

                        {/* Trust bullets */}
                        <div className="flex flex-wrap justify-center gap-4 text-xs text-white/60">
                            <span className="inline-flex items-center gap-1">
                                <Check className="h-3 w-3 text-emerald-400" />
                                2-minute scan
                            </span>
                            {/* <span className="inline-flex items-center gap-1">
                                <Check className="h-3 w-3 text-emerald-400" />
                                No credit card
                            </span> */}
                            <span className="inline-flex items-center gap-1">
                                <Check className="h-3 w-3 text-emerald-400" />
                                Revoke anytime
                            </span>
                        </div>

                        {/* Concrete result preview */}
                        <div className="mx-auto max-w-2xl rounded-lg border border-white/5 bg-white/2 p-5">
                            <div className="flex items-start gap-3">
                                <Sparkles className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-300" />
                                <div className="space-y-2 text-left">
                                    <p className="text-sm font-light text-white">
                                        Here's what you'll discover:
                                    </p>
                                    <ul className="space-y-1 text-xs text-white/60">
                                        <li>• Old forums you joined in 2011</li>
                                        <li>• Shopping sites you used once</li>
                                        <li>• Free trials you never canceled</li>
                                        <li>• Services that got breached</li>
                                        <li>• Apps you forgot existed</li>
                                    </ul>
                                    <p className="text-xs text-emerald-300 font-medium pt-1">
                                        → Then we show you step-by-step how to delete them
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* TESTIMONIAL SECTION */}
                <section className="mx-auto max-w-2xl py-4">
                    <div className="space-y-4 pl-6 border-l border-emerald-500/30">
                        <svg className="h-5 w-5 text-emerald-400/60" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M3 21c3 0 7-1 7-8V5c0-1.25-4.25-2-7-2s-7 .75-7 2v10c0 1 0 7 7 8z" />
                            <path d="M15 19c3.5-1 7-4 7-10V5c0-1.25-4.25-2-7-2s-7 .75-7 2v10c0 1 0 7 7 8z" />
                        </svg>

                        <p className="text-base leading-relaxed text-white/90 font-light">
                            GhostSweep was a real eye-opener. It revealed just how many accounts I'd accumulated over the years, including many I'd completely forgotten about. The scan and clean-up process are incredibly intuitive, making it quick and easy to review everything in one place and deciding what to keep or delete. It's a great solution for anyone who wants a clearer picture of their digital footprint and more control over their online presence.
                        </p>

                        <div className="flex items-center gap-3 pt-2">
                            <div>
                                <p className="text-sm font-light text-white">Anon</p>
                                <p className="text-xs text-white/50">Software Engineer</p>
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
                        <h2 className="text-2xl font-light text-white sm:text-3xl">
                            Find every account in 3 clicks
                        </h2>
                        <p className="text-sm text-white/60">
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
                            <div key={s.step} className="rounded-lg border border-white/5 bg-white/2 p-6 text-center">
                                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 text-xl font-light text-emerald-300">
                                    {s.step}
                                </div>
                                <s.icon className="mx-auto mb-3 h-6 w-6 text-white/60" />
                                <p className="mb-2 text-base font-light text-white">{s.title}</p>
                                <p className="text-sm text-white/60">{s.body}</p>
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-center">
                        <Link
                            href="/login"
                            className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-light text-black hover:bg-white/90 transition"
                        >
                            Scan My Digital Shadow
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>

                    {/* SUPPORTED PROVIDERS */}
                    <div className="mt-12 flex flex-col items-center gap-4">
                        <p className="text-sm text-white/60">We support</p>
                        <div className="flex items-center gap-8">
                            <div className="flex items-center gap-2">
                                <GmailLogo className="h-8 w-8" />
                                <span className="text-sm font-light text-white/70">Gmail</span>
                            </div>
                            <div className="text-white/40">•</div>
                            <div className="flex items-center gap-2">
                                <OutLookLogo className="h-8 w-8" />
                                <span className="text-sm font-light text-white/70">Outlook</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* DIGITAL SHADOW SECTION */}
                <DigitalShadowSection />

                {/* WHY GO PRO - CLEAR VALUE PROP */}
                <section className="relative overflow-hidden rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-6 sm:p-10">
                    <div className="pointer-events-none absolute inset-0">
                        <div className="absolute -top-32 right-10 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl" />
                    </div>

                    <div className="relative space-y-8">
                        <div className="space-y-3 text-center">
                            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/15 px-3.5 py-1.5 text-xs font-light text-emerald-300 backdrop-blur-sm">
                                <Zap className="h-3.5 w-3.5" />
                                <span>Upgrade Anytime</span>
                            </div>
                            <h2 className="text-3xl sm:text-4xl font-light text-white">
                                Free shows what's exposed.<br />Pro handles the cleanup.
                            </h2>
                            <p className="mx-auto max-w-2xl text-base text-emerald-100/70">
                                Free plan reveals your digital shadow. Pro gives you templates and tracking to reclaim it.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                            <div className="rounded-lg border border-emerald-500/20 bg-black/30 p-4 space-y-2 group hover:bg-emerald-500/10 transition">
                                <div className="text-emerald-300 font-light text-sm">All Accounts</div>
                                <p className="text-xs text-emerald-100/60">vs 10 on Free</p>
                            </div>
                            <div className="rounded-lg border border-emerald-500/20 bg-black/30 p-4 space-y-2 group hover:bg-emerald-500/10 transition">
                                <div className="text-emerald-300 font-light text-sm">Deletion Templates</div>
                                <p className="text-xs text-emerald-100/60">100+ brokers</p>
                            </div>
                            <div className="rounded-lg border border-emerald-500/20 bg-black/30 p-4 space-y-2 group hover:bg-emerald-500/10 transition">
                                <div className="text-emerald-300 font-light text-sm">Weekly Monitoring</div>
                                <p className="text-xs text-emerald-100/60">Catch new accounts</p>
                            </div>
                            <div className="rounded-lg border border-emerald-500/20 bg-black/30 p-4 space-y-2 group hover:bg-emerald-500/10 transition">
                                <div className="text-emerald-300 font-light text-sm">Breach Alerts</div>
                                <p className="text-xs text-emerald-100/60">Email notifications</p>
                            </div>
                            <div className="rounded-lg border border-emerald-500/20 bg-black/30 p-4 space-y-2 group hover:bg-emerald-500/10 transition">
                                <div className="text-emerald-300 font-light text-sm">Track Progress</div>
                                <p className="text-xs text-emerald-100/60">See deletions happen</p>
                            </div>
                        </div>

                        <div className="text-center">
                            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-sm font-light text-emerald-300">
                                <span>Only $9.99/month</span>
                                <span className="text-emerald-400">($79/year)</span>
                            </div>
                            <p className="text-xs text-emerald-100/60 mt-3">50% cheaper than DeleteMe. Cancel anytime.</p>
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
                        <h2 className="text-2xl font-light text-white sm:text-3xl">
                            Real examples from real scans
                        </h2>
                        <p className="text-sm text-white/60">
                            Most people discover 50-200 accounts they completely forgot about
                        </p>
                    </div>

                    {/* VISUAL MOCK OF RESULTS */}
                    <div className="rounded-lg border border-white/5 bg-white/2 p-6">
                        <div className="mb-6 grid gap-4 sm:grid-cols-3">
                            <div className="rounded-lg border border-white/5 bg-white/2 p-4 text-center">
                                <p className="text-3xl font-light text-white">127</p>
                                <p className="text-xs text-white/60 mt-1">Accounts found</p>
                            </div>
                            <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 p-4 text-center">
                                <p className="text-3xl font-light text-amber-300">23</p>
                                <p className="text-xs text-white/60 mt-1">Breached</p>
                            </div>
                            <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-4 text-center">
                                <p className="text-3xl font-light text-emerald-300">89</p>
                                <p className="text-xs text-white/60 mt-1">Can be deleted</p>
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
                                    className="flex items-center justify-between gap-3 rounded-lg border border-white/5 bg-white/2 px-4 py-3"
                                >
                                    <div className="flex-1">
                                        <p className="text-sm font-light text-white">{item.name}</p>
                                        <p className="text-xs text-white/60">{item.risk}</p>
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

                        <p className="mt-4 text-center text-xs text-white/40">
                            This is what your dashboard will look like (with your real accounts)
                        </p>
                    </div>

                    <div className="flex justify-center">
                        <Link
                            href="/login"
                            className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-light text-black hover:bg-white/90 transition"
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
                            <div key={f.title} className="rounded-lg border border-white/5 bg-white/2 p-5">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/5">
                                    <f.icon className="h-4 w-4 text-white/80" />
                                </div>
                                <p className="mt-3 text-sm font-light text-white">{f.title}</p>
                                <p className="mt-2 text-xs leading-relaxed text-white/60">{f.body}</p>
                                <p className="mt-3 text-[11px] text-white/40">{f.foot}</p>
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
                        <h2 className="text-3xl sm:text-4xl font-light text-white">
                            Trusted by privacy-conscious users
                        </h2>
                        <p className="mx-auto max-w-2xl text-base text-white/60">
                            Founded by a privacy engineer. Built with security first. Used by thousands.
                        </p>
                    </div>

                    {/* Certifications & Trust Indicators */}
                    <div className="rounded-lg border border-white/5 bg-white/2 p-6">
                        <p className="text-center text-sm font-light text-white/70 mb-4">Verified & Certified</p>
                        <div className="flex flex-wrap items-center justify-center gap-8">
                            <div className="flex flex-col items-center gap-2">
                                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/20 border border-blue-500/30">
                                    <span className="text-xl">🔐</span>
                                </div>
                                <span className="text-xs text-white/60 text-center">Google Sign-In<br/>Verified</span>
                            </div>
                            <div className="flex flex-col items-center gap-2">
                                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/20 border border-blue-500/30">
                                    <span className="text-xl">🛡️</span>
                                </div>
                                <span className="text-xs text-white/60 text-center">CASA<br/>Certified</span>
                            </div>
                            <div className="flex flex-col items-center gap-2">
                                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-500/20 border border-emerald-500/30">
                                    <span className="text-xl">🔒</span>
                                </div>
                                <span className="text-xs text-white/60 text-center">AES-256<br/>Encrypted</span>
                            </div>
                            <div className="flex flex-col items-center gap-2">
                                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-500/20 border border-emerald-500/30">
                                    <span className="text-xl">⚖️</span>
                                </div>
                                <span className="text-xs text-white/60 text-center">GDPR &<br/>CCPA Ready</span>
                            </div>
                        </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-4">
                        <div className="rounded-lg border border-white/5 bg-white/2 p-6 text-center space-y-3">
                            <div className="text-3xl font-light text-emerald-400">87</div>
                            <p className="text-sm text-white font-light">Forgotten Accounts</p>
                            <p className="text-xs text-white/60">Joel found personally</p>
                        </div>
                        <div className="rounded-lg border border-white/5 bg-white/2 p-6 text-center space-y-3">
                            <div className="text-3xl font-light text-emerald-400">🚀</div>
                            <p className="text-sm text-white font-light">Privacy-First</p>
                            <p className="text-xs text-white/60">Built with security</p>
                        </div>
                        <div className="rounded-lg border border-white/5 bg-white/2 p-6 text-center space-y-3">
                            <div className="text-3xl font-light text-emerald-400">99.9%</div>
                            <p className="text-sm text-white font-light">Data Security</p>
                            <p className="text-xs text-white/60">AES-256 encrypted</p>
                        </div>
                        <div className="rounded-lg border border-white/5 bg-white/2 p-6 text-center space-y-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/20 mx-auto">
                                <BadgeCheck className="h-5 w-5 text-emerald-400" />
                            </div>
                            <p className="text-sm text-white font-light">Privacy First</p>
                            <p className="text-xs text-white/60">GDPR & CCPA Ready</p>
                        </div>
                    </div>

                    <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-6 space-y-4">
                        <div className="flex items-center gap-4">
                            <div className="flex h-16 w-16 items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-500/10">
                                <Image
                                    src="https://ghostsweep.t3.storage.dev/f1789004-4f47-4d23-a5c9-d66f62e532f3.jpg"
                                    alt="Joel Komieter"
                                    width={64}
                                    height={64}
                                    className="rounded-full"
                                />
                            </div>
                            <div>
                                <p className="font-light text-white">Built by Joel Komieter</p>
                                <p className="text-sm text-emerald-100/70">Privacy engineer. Founder.</p>
                            </div>
                        </div>
                        <p className="text-sm text-emerald-100/70 leading-relaxed">
                            "I found 187 forgotten accounts tied to my email. Most tools make it hard to delete them or compromise your privacy. This doesn't."
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

                    <div className="grid gap-4 md:grid-cols-3">
                        {/* Free */}
                        <div className="rounded-lg border border-white/5 bg-white/2 p-6 space-y-5">
                            <div className="space-y-2">
                                <p className="text-xs font-light uppercase tracking-wide text-white/60">Free</p>
                                <div className="flex items-baseline gap-1">
                                    <p className="text-3xl font-light text-white">$0</p>
                                    <span className="text-xs text-white/60">forever</span>
                                </div>
                                <p className="text-xs text-white/60">See your digital shadow. Limited to 10 accounts.</p>
                            </div>

                            <ul className="space-y-2 text-sm text-white/70">
                                <li className="flex items-start gap-2">
                                    <CheckCircle className="mt-0.5 h-3.5 w-3.5 text-emerald-400" />
                                    <span>One email scan</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle className="mt-0.5 h-3.5 w-3.5 text-emerald-400" />
                                    <span>View up to 10 accounts <span className="text-white/40">(Average: 180+)</span></span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle className="mt-0.5 h-3.5 w-3.5 text-emerald-400" />
                                    <span>View all breach alerts</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle className="mt-0.5 h-3.5 w-3.5 text-emerald-400" />
                                    <span>Privacy score dashboard</span>
                                </li>
                                <li className="flex items-start gap-2 text-white/40">
                                    <X className="mt-0.5 h-3.5 w-3.5 text-white/30" />
                                    <span>Can't see full account list</span>
                                </li>
                                <li className="flex items-start gap-2 text-white/40">
                                    <X className="mt-0.5 h-3.5 w-3.5 text-white/30" />
                                    <span>No deletion guidance</span>
                                </li>
                                <li className="flex items-start gap-2 text-white/40">
                                    <X className="mt-0.5 h-3.5 w-3.5 text-white/30" />
                                    <span>No monitoring for new breaches</span>
                                </li>
                            </ul>

                            <Link
                                href="/login"
                                className="inline-flex w-full items-center justify-center rounded-full border border-white/10 bg-white/2 px-4 py-2.5 text-xs font-light text-white hover:bg-white/3 hover:border-white/15 transition"
                            >
                                Continue with free
                            </Link>
                        </div>

                        {/* Pro */}
                        <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-6 space-y-5 relative">

                            <div className="space-y-2">
                                <p className="text-xs font-light uppercase tracking-wide text-emerald-300">Professional</p>
                                <div className="flex items-baseline gap-2">
                                    <p className="text-4xl font-light text-white">$9.99</p>
                                    <span className="text-sm text-white/70">/ month</span>
                                </div>
                                <p className="text-xs text-emerald-100/70 font-light">Includes deletion templates, monitoring, and progress tracking.</p>
                                <p className="text-xs text-emerald-300 pt-1">1-day trial available.</p>
                            </div>

                            <ul className="space-y-2.5 text-sm text-emerald-100/80">
                                <li className="flex items-start gap-2">
                                    <CheckCircle className="mt-0.5 h-3.5 w-3.5 text-emerald-400 flex-shrink-0" />
                                    <span>
                                        <span className="font-light">See all accounts</span> (vs 10 on Free)
                                    </span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle className="mt-0.5 h-3.5 w-3.5 text-emerald-400 flex-shrink-0" />
                                    <span>
                                        <span className="font-light">One-click deletion templates</span> for 100+ brokers
                                    </span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle className="mt-0.5 h-3.5 w-3.5 text-emerald-400 flex-shrink-0" />
                                    <span>
                                        <span className="font-light">Weekly monitoring</span> (catch new accounts)
                                    </span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle className="mt-0.5 h-3.5 w-3.5 text-emerald-400 flex-shrink-0" />
                                    <span>
                                        <span className="font-light">Breach alerts</span> with email notifications
                                    </span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle className="mt-0.5 h-3.5 w-3.5 text-emerald-400 flex-shrink-0" />
                                    <span>
                                        <span className="font-light">Track all deletions</span> in real time
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
                                className="inline-flex w-full items-center justify-center rounded-full bg-emerald-500 px-5 py-2.5 text-xs font-light text-white hover:bg-emerald-600 transition"
                            >
                                Try Pro for 1 day
                                <ArrowRight className="ml-1 h-3.5 w-3.5" />
                            </Link>
                            <p className="text-center text-[11px] text-white/40">
                                No commitment. Cancel anytime during trial.
                            </p>
                        </div>
                    </div>

                        {/* Enterprise */}
                        <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-6 space-y-5 relative">
                            <div className="space-y-2">
                                <p className="text-xs font-light uppercase tracking-wide text-blue-300">Enterprise</p>
                                <div className="flex items-baseline gap-2">
                                    <p className="text-4xl font-light text-white">Custom</p>
                                </div>
                                <p className="text-xs text-blue-100/70 font-light">Tailored solutions for organizations protecting executive teams.</p>
                            </div>

                            <ul className="space-y-2.5 text-sm text-blue-100/80">
                                <li className="flex items-start gap-2">
                                    <CheckCircle className="mt-0.5 h-3.5 w-3.5 text-blue-400 flex-shrink-0" />
                                    <span>Everything in Pro</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle className="mt-0.5 h-3.5 w-3.5 text-blue-400 flex-shrink-0" />
                                    <span>
                                        <span className="font-light">Multi-user management</span> for teams
                                    </span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle className="mt-0.5 h-3.5 w-3.5 text-blue-400 flex-shrink-0" />
                                    <span>
                                        <span className="font-light">Custom integrations</span> & API access
                                    </span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle className="mt-0.5 h-3.5 w-3.5 text-blue-400 flex-shrink-0" />
                                    <span>
                                        <span className="font-light">Dedicated account manager</span>
                                    </span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle className="mt-0.5 h-3.5 w-3.5 text-blue-400 flex-shrink-0" />
                                    <span>
                                        <span className="font-light">SSO & advanced security</span>
                                    </span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle className="mt-0.5 h-3.5 w-3.5 text-blue-400 flex-shrink-0" />
                                    <span>
                                        SLA guarantees & compliance support
                                    </span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle className="mt-0.5 h-3.5 w-3.5 text-blue-400 flex-shrink-0" />
                                    <span>
                                        White-label options available
                                    </span>
                                </li>
                            </ul>

                            <div className="space-y-2">
                                <a
                                    href="mailto:support@ghostsweep.com?subject=Enterprise%20Plan%20Inquiry"
                                    className="inline-flex w-full items-center justify-center rounded-full bg-blue-500 px-5 py-2.5 text-xs font-light text-white hover:bg-blue-600 transition"
                                >
                                    Contact Sales
                                    <ArrowRight className="ml-1 h-3.5 w-3.5" />
                                </a>
                                <p className="text-center text-[11px] text-white/40">
                                    Let's discuss your organization's needs.
                                </p>
                            </div>
                        </div>
                    </div>

                {/* Value Comparison */}
                <div className="rounded-lg border border-white/5 bg-white/2 p-6">
                    <div className="space-y-2">
                        <p className="text-sm font-light text-white">
                            Designed to be fair and predictable.
                        </p>
                        <div className="space-y-1 text-sm text-white/60">
                            <p>• Priced below most privacy services.</p>
                            <p>• Saves hours compared to manual clean-up.</p>
                            <p>• Built for ongoing monitoring, not one-off reports.</p>
                        </div>
                    </div>
                </div>

                {/* Annual Plan */}
                <div className="rounded-lg border border-white/5 bg-white/2 p-4">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div>
                            <p className="text-sm font-light text-white">Already decided? Annual saves more</p>
                            <p className="text-xs text-white/60">Get full year for less than 1 month of coffee</p>
                        </div>
                        <div className="text-center sm:text-right">
                            <p className="text-2xl font-light text-emerald-400">$79/year</p>
                            <p className="text-xs text-white/70">$6.58/month equivalent</p>
                        </div>
                        <Link
                            href="/login?plan=pro-annual"
                            className="inline-flex items-center justify-center rounded-full bg-emerald-500/20 border border-emerald-500/30 px-6 py-2 text-sm font-light text-emerald-300 hover:bg-emerald-500/30 transition"
                        >
                            Go Annual
                        </Link>
                    </div>
                </div>

                {/* FAQ below pricing */}
                <div className="mt-8 pt-8 border-t border-white/5 space-y-4">
                        <details className="text-sm group">
                            <summary className="cursor-pointer text-white/70 hover:text-white font-light flex items-center justify-between">
                                What happens if I find more than 10 accounts?
                                <ChevronDown className="h-4 w-4 transition group-open:rotate-180" />
                            </summary>
                            <p className="mt-2 text-white/60 text-xs pl-4">
                                Free users can see the total number of accounts found (e.g., &quot;37 accounts&quot;), but can only view details for the first 10. Upgrade to Pro to see all accounts and get step-by-step deletion instructions for each one.
                            </p>
                        </details>

                        <details className="text-sm group">
                            <summary className="cursor-pointer text-white/70 hover:text-white font-light flex items-center justify-between">
                                Do I still see breach alerts on the free plan?
                                <ChevronDown className="h-4 w-4 transition group-open:rotate-180" />
                            </summary>
                            <p className="mt-2 text-white/60 text-xs pl-4">
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
                            <div key={item.q} className="rounded-lg border border-white/5 bg-white/2 p-5 space-y-2">
                                <p className="text-sm font-light text-white">{item.q}</p>
                                <p className="text-xs text-white/60">{item.a}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* FINAL CTA */}
                <section className="relative overflow-hidden rounded-lg border border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 via-black to-black p-6 sm:p-12 text-center space-y-6">
                    <div className="pointer-events-none absolute inset-0">
                        <div className="absolute -top-32 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-emerald-500/10 blur-3xl" />
                    </div>

                    <div className="relative space-y-4">
                        <h2 className="text-3xl sm:text-4xl font-light text-white">
                            Stop paying for data brokers to sell your info
                        </h2>
                        <p className="mx-auto max-w-2xl text-base text-white/70">
                            You've found where your data is. Now take control. Start your 1-day free trial to delete accounts and reclaim your privacy.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                            <Link
                                href="/login?plan=pro"
                                className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-500 px-8 py-4 text-base font-light text-white hover:bg-emerald-600 transition shadow-lg hover:shadow-emerald-500/40"
                            >
                                Try Pro Free (1 Day)
                                <ArrowRight className="h-5 w-5" />
                            </Link>
                            <Link
                                href="/login"
                                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/2 px-8 py-4 text-base font-light text-white hover:bg-white/3 hover:border-white/20 transition"
                            >
                                Or start with Free
                                <ArrowRight className="h-5 w-5" />
                            </Link>
                        </div>

                        <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-white/70 pt-2">
                            {/* <span className="inline-flex items-center gap-1">
                                <Check className="h-4 w-4 text-emerald-400" />
                                No credit card
                            </span> */}
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
                <footer className="border-t border-white/5 pt-6 text-[11px] text-white/40">
                    <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
                        <p>© {new Date().getFullYear()} GhostSweep. Built with privacy in mind.</p>
                        <div className="flex flex-wrap justify-center gap-4">
                            <Link href="/home/privacy" className="hover:text-white/60 transition">
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
                            <a href="mailto:joel@ghostsweep.com?subject=Executive%20Suite%20Inquiry" className="hover:text-zinc-300 transition">
                                Enterprise
                            </a>
                        </div>
                    </div>
                </footer>
            </div>
        </main>
    );
}