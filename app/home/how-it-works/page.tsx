"use client";

import Link from "next/link";
import {
    ArrowRight,
    ShieldCheck,
    MailSearch,
    Database,
    AlertTriangle,
    Trash2,
    Bell,
    EyeOff,
    Lock,
    PlayCircle,
    CheckCircle,
    ExternalLink,
    X,
    ListChecks,
    Wand2,
} from "lucide-react";
import { useState, useRef } from "react";
import Image from "next/image";

export default function HowItWorksPage() {
    const [showVideo, setShowVideo] = useState(false);
    const videoRef = useRef<HTMLVideoElement | null>(null);

    const [lightboxImage, setLightboxImage] = useState<{ src: string; alt: string } | null>(null);

    const handlePlay = () => {
        setShowVideo(true);
        setTimeout(() => videoRef.current?.play().catch(() => { }), 0);
    };

    const openLightbox = (src: string, alt: string) => setLightboxImage({ src, alt });
    const closeLightbox = () => setLightboxImage(null);

    const demoThumbnailSrc =
        "https://ghostsweep.t3.storage.dev/Screenshot%202025-11-29%20at%202.34.51%E2%80%AFAM.png";

    return (
        <main className="min-h-screen bg-gradient-to-b from-black via-zinc-950 to-black text-foreground">
            <div className="mx-auto max-w-6xl px-4 pb-20 pt-12 space-y-20">
                {/* HERO */}
                <section className="grid gap-10 md:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] md:items-center">
                    {/* Copy */}
                    <div className="space-y-6">
                        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-[11px] text-emerald-200">
                            <span className="relative inline-flex h-2 w-2">
                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/70" />
                                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                            </span>
                            How GhostSweep Works
                        </div>

                        <div className="space-y-4">
                            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight">
                                Find accounts tied to your email. Flag risk. Clean up faster.
                            </h1>
                            <p className="text-sm sm:text-base text-muted-foreground max-w-xl">
                                GhostSweep turns your inbox into a living map of where your data exists. You get a clear
                                list of services, signals that indicate risk, and workflows to close what you don’t need.
                            </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                            <Link
                                href="/login"
                                className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-2.5 text-xs font-medium text-primary-foreground shadow-sm hover:opacity-90 transition"
                            >
                                Start a free scan
                                <ArrowRight className="h-3.5 w-3.5" />
                            </Link>
                            <Link
                                href="/home/security"
                                className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition"
                            >
                                View security details
                                <ExternalLink className="h-3 w-3" />
                            </Link>
                        </div>

                        <div className="flex flex-wrap gap-3 text-[11px] text-muted-foreground">
                            <div className="inline-flex items-center gap-1">
                                <ShieldCheck className="h-3 w-3 text-primary" />
                                Google OAuth
                            </div>
                            <div className="inline-flex items-center gap-1">
                                <EyeOff className="h-3 w-3 text-primary" />
                                Privacy-first approach
                            </div>
                            <div className="inline-flex items-center gap-1">
                                <Lock className="h-3 w-3 text-primary" />
                                Disconnect anytime
                            </div>
                        </div>

                        {/* Quick value chips */}
                        <div className="flex flex-wrap gap-2 pt-1">
                            {[
                                { icon: <MailSearch className="h-3.5 w-3.5" />, text: "Account discovery" },
                                { icon: <AlertTriangle className="h-3.5 w-3.5" />, text: "Breach signals" },
                                { icon: <Trash2 className="h-3.5 w-3.5" />, text: "Bulk clean-up" },
                                { icon: <ListChecks className="h-3.5 w-3.5" />, text: "Deletion tracking" },
                            ].map((c) => (
                                <div
                                    key={c.text}
                                    className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] text-white/70"
                                >
                                    <span className="text-primary">{c.icon}</span>
                                    {c.text}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Video */}
                    <div className="rounded-2xl border border-white/10 bg-black/40 p-3 shadow-lg">
                        <div className="relative aspect-video overflow-hidden rounded-xl border border-white/15 bg-black">
                            {showVideo ? (
                                <video
                                    ref={videoRef}
                                    src="https://ghostsweep.t3.storage.dev/Timeline%201.mov"
                                    controls
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <button type="button" onClick={handlePlay} className="group relative h-full w-full">
                                    <Image
                                        src={demoThumbnailSrc}
                                        alt="GhostSweep dashboard demo"
                                        width={1920}
                                        height={1080}
                                        className="h-full w-full object-cover cursor-zoom-in"
                                        priority
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            openLightbox(demoThumbnailSrc, "GhostSweep dashboard screenshot");
                                        }}
                                    />

                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 pointer-events-none">
                                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-black shadow-xl group-hover:scale-110 transition-transform">
                                            <PlayCircle className="h-8 w-8" />
                                        </div>
                                        <p className="text-xs text-white font-medium drop-shadow">Watch a quick walkthrough</p>
                                    </div>
                                </button>
                            )}
                        </div>
                    </div>
                </section>

                {/* CORE FLOW (non-literal) */}
                <section className="space-y-8 border-t border-white/10 pt-10">
                    <div className="space-y-2">
                        <h2 className="text-xl sm:text-2xl font-semibold tracking-tight">
                            A simple loop: discover → prioritize → clean up → stay organized
                        </h2>
                        <p className="text-sm text-muted-foreground max-w-2xl">
                            GhostSweep is built for real life: your inbox is messy, accounts pile up, and closing them is
                            annoying. This turns it into a repeatable workflow.
                        </p>
                    </div>

                    <div className="grid gap-4 md:grid-cols-4">
                        {[
                            {
                                icon: <ShieldCheck className="h-5 w-5 text-primary" />,
                                title: "Connect securely",
                                body:
                                    "Connect Gmail using Google OAuth. You stay in control and can revoke access any time.",
                            },
                            {
                                icon: <Database className="h-5 w-5 text-primary" />,
                                title: "Build your footprint map",
                                body:
                                    "GhostSweep groups inbox signals into services so you can see where your email has been used.",
                            },
                            {
                                icon: <AlertTriangle className="h-5 w-5 text-red-400" />,
                                title: "Highlight risk",
                                body:
                                    "We surface things that matter: breach exposure, security alerts, and high-priority accounts to review.",
                            },
                            {
                                icon: <Trash2 className="h-5 w-5 text-primary" />,
                                title: "Clean up fast",
                                body:
                                    "Use bulk actions to open deletion links, generate deletion emails, and track progress until done.",
                            },
                        ].map((card) => (
                            <div key={card.title} className="space-y-3 rounded-xl border border-white/10 bg-black/40 p-4">
                                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15">
                                    {card.icon}
                                </div>
                                <h3 className="text-sm font-semibold">{card.title}</h3>
                                <p className="text-xs text-muted-foreground leading-relaxed">{card.body}</p>
                            </div>
                        ))}
                    </div>

                    <div className="rounded-xl border border-white/10 bg-black/40 p-4">
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            <span className="font-medium text-white/80">Note:</span> GhostSweep helps you take action faster,
                            but <span className="text-white/80">you</span> decide what happens. We don’t delete accounts silently
                            or automatically.
                        </p>
                    </div>
                </section>

                {/* WHAT WE LOOK FOR */}
                <section className="space-y-8 border-t border-white/10 pt-10">
                    <div className="space-y-2">
                        <h2 className="text-xl sm:text-2xl font-semibold tracking-tight">What GhostSweep looks for</h2>
                        <p className="text-sm text-muted-foreground max-w-2xl">
                            We use inbox patterns to infer services and risk — then turn it into next steps you can act on.
                        </p>
                    </div>

                    <div className="grid gap-4 md:grid-cols-3 text-sm">
                        <div className="space-y-3 rounded-xl border border-white/10 bg-black/40 p-4">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15">
                                <MailSearch className="h-5 w-5 text-primary" />
                            </div>
                            <h3 className="text-sm font-semibold">Account signals</h3>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                “Welcome”, verification, receipts, password resets, and other transactional patterns help identify
                                real accounts vs noise.
                            </p>
                        </div>

                        <div className="space-y-3 rounded-xl border border-white/10 bg-black/40 p-4">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-500/20">
                                <AlertTriangle className="h-5 w-5 text-red-400" />
                            </div>
                            <h3 className="text-sm font-semibold">Risk indicators</h3>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                We flag breached services, suspicious security emails, and high-activity accounts that deserve attention.
                            </p>
                        </div>

                        <div className="space-y-3 rounded-xl border border-white/10 bg-black/40 p-4">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15">
                                <Wand2 className="h-5 w-5 text-primary" />
                            </div>
                            <h3 className="text-sm font-semibold">Next-step readiness</h3>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                GhostSweep suggests a “best next action” — open a deletion page, email a privacy contact, or tighten security.
                            </p>
                        </div>
                    </div>
                </section>

                {/* FREE VS PRO */}
                <section className="space-y-8 border-t border-white/10 pt-10">
                    <div className="space-y-2">
                        <h2 className="text-xl sm:text-2xl font-semibold tracking-tight">
                            Free snapshot vs full clean-up (Professional)
                        </h2>
                        <p className="text-sm text-muted-foreground max-w-2xl">
                            Free is for quick clarity. Professional is for doing the work: full visibility, bulk actions, and tracking.
                        </p>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 max-w-4xl">
                        {/* Free */}
                        <div className="space-y-5 rounded-xl border border-white/10 bg-black/40 p-5">
                            <div className="space-y-1">
                                <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Free</p>
                                <p className="text-xs text-muted-foreground">A quick snapshot</p>
                            </div>
                            <ul className="space-y-2 text-xs text-muted-foreground">
                                <li className="flex items-start gap-2">
                                    <CheckCircle className="h-3.5 w-3.5 text-primary mt-0.5" />
                                    <span>One scan per month</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle className="h-3.5 w-3.5 text-primary mt-0.5" />
                                    <span>Limited account visibility</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle className="h-3.5 w-3.5 text-primary mt-0.5" />
                                    <span>Basic breach snapshot</span>
                                </li>
                            </ul>
                            <Link
                                href="/login"
                                className="inline-flex w-full items-center justify-center rounded-full border border-white/20 px-4 py-2.5 text-xs font-medium hover:bg-white/5 transition"
                            >
                                Start free
                            </Link>
                        </div>

                        {/* Pro */}
                        <div className="relative space-y-5 rounded-xl border border-primary/60 bg-primary/5 p-5">
                            <div className="absolute -top-3 left-5 rounded-full bg-primary px-3 py-1 text-[10px] font-medium text-primary-foreground shadow">
                                Professional
                            </div>
                            <div className="space-y-1 pt-2">
                                <p className="text-[11px] font-semibold uppercase tracking-wide text-primary">Clean-up mode</p>
                                <p className="text-xs text-muted-foreground">
                                    Full account list, detailed breach info, bulk deletion workflows, and tracking.
                                </p>
                            </div>
                            <ul className="space-y-2 text-xs text-muted-foreground">
                                <li className="flex items-start gap-2">
                                    <CheckCircle className="h-3.5 w-3.5 text-primary mt-0.5" />
                                    <span>Unlimited scans + full list</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle className="h-3.5 w-3.5 text-primary mt-0.5" />
                                    <span>Detailed breach view</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle className="h-3.5 w-3.5 text-primary mt-0.5" />
                                    <span>Bulk actions + templates</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle className="h-3.5 w-3.5 text-primary mt-0.5" />
                                    <span>Deletion request tracking</span>
                                </li>
                            </ul>
                            <Link
                                href="/dashboard/billing?plan=monthly"
                                className="inline-flex w-full items-center justify-center rounded-full bg-primary px-4 py-2.5 text-xs font-medium text-primary-foreground shadow-sm hover:opacity-90 transition"
                            >
                                Upgrade to Pro
                            </Link>
                        </div>
                    </div>
                </section>

                {/* PRIVACY GUARANTEE */}
                <section className="space-y-6 border-t border-primary/40 pt-10">
                    <div className="rounded-2xl border border-primary/40 bg-primary/5 p-6 md:p-8">
                        <div className="space-y-4 max-w-2xl">
                            <div className="flex flex-wrap gap-4 text-[11px] text-muted-foreground">
                                <span className="inline-flex items-center gap-2">
                                    <EyeOff className="h-4 w-4 text-primary" />
                                    Privacy-first scanning
                                </span>
                                <span className="inline-flex items-center gap-2">
                                    <Lock className="h-4 w-4 text-primary" />
                                    Disconnect anytime
                                </span>
                            </div>

                            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                                GhostSweep uses Google&apos;s OAuth2 flow. Scans are designed to minimize what’s accessed.
                                When deletion emails are available, they’re generated and sent only when you explicitly choose to.
                            </p>

                            <Link href="/home/security" className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
                                Read the full security overview
                                <ArrowRight className="h-3 w-3" />
                            </Link>
                        </div>
                    </div>
                </section>

                {/* FINAL CTA */}
                <section className="space-y-4 border-t border-white/10 pt-10 text-center">
                    <div className="space-y-2 max-w-xl mx-auto">
                        <h2 className="text-xl sm:text-2xl font-semibold tracking-tight">Ready to see who has your data?</h2>
                        <p className="text-sm text-muted-foreground">
                            Run a scan, surface risk, and start cleaning up with a workflow you can actually stick to.
                        </p>
                    </div>

                    <div className="flex flex-wrap justify-center gap-3">
                        <Link
                            href="/login"
                            className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-xs font-medium text-primary-foreground shadow-sm hover:opacity-90 transition"
                        >
                            Start a free scan
                            <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                        <Link
                            href="/home#pricing"
                            className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition"
                        >
                            Compare plans
                            <ArrowRight className="h-3 w-3" />
                        </Link>
                    </div>
                </section>
            </div>

            {/* LIGHTBOX */}
            {lightboxImage && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4" onClick={closeLightbox}>
                    <button
                        type="button"
                        className="absolute right-4 top-4 rounded-full bg-black/80 p-2 text-white hover:bg-black"
                        onClick={(e) => {
                            e.stopPropagation();
                            closeLightbox();
                        }}
                    >
                        <X className="h-4 w-4" />
                    </button>

                    <div className="relative max-h-[90vh] w-full max-w-4xl" onClick={(e) => e.stopPropagation()}>
                        <Image
                            src={lightboxImage.src}
                            alt={lightboxImage.alt}
                            width={1920}
                            height={1080}
                            className="h-full w-full object-contain"
                        />
                    </div>
                </div>
            )}
        </main>
    );
}