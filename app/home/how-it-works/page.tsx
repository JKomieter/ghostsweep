 
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
} from "lucide-react";
import { useState, useRef } from "react";
import Image from "next/image";

export default function HowItWorksPage() {
    const [showVideo, setShowVideo] = useState(false);
    const videoRef = useRef<HTMLVideoElement | null>(null);

    const [lightboxImage, setLightboxImage] = useState<{
        src: string;
        alt: string;
    } | null>(null);

    const handlePlay = () => {
        setShowVideo(true);
        setTimeout(() => {
            videoRef.current?.play().catch(() => { });
        }, 0);
    };

    const openLightbox = (src: string, alt: string) => {
        setLightboxImage({ src, alt });
    };

    const closeLightbox = () => {
        setLightboxImage(null);
    };

    const demoThumbnailSrc =
        "https://ghostsweep.t3.storage.dev/Screenshot%202025-11-29%20at%202.34.51%E2%80%AFAM.png";

    return (
        <main className="min-h-screen bg-gradient-to-b from-black via-zinc-950 to-black text-foreground">
            <div className="mx-auto max-w-6xl px-4 pb-20 pt-12 space-y-20">
                {/* HERO */}
                <section className="grid gap-10 md:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] md:items-center">
                    {/* Left: copy */}
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
                                A private, read-only audit of your digital footprint
                            </h1>
                            <p className="text-sm sm:text-base text-muted-foreground max-w-xl">
                                GhostSweep scans your inbox to discover every account you&apos;ve
                                created—without ever reading email content. See forgotten
                                accounts, find breaches, and clean up what you don&apos;t need.
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
                                Read-only Gmail access
                            </div>
                            <div className="inline-flex items-center gap-1">
                                <EyeOff className="h-3 w-3 text-primary" />
                                Metadata only, never content
                            </div>
                            <div className="inline-flex items-center gap-1">
                                <Lock className="h-3 w-3 text-primary" />
                                Disconnect any time
                            </div>
                        </div>
                    </div>

                    {/* Right: video */}
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
                                <button
                                    type="button"
                                    onClick={handlePlay}
                                    className="group relative h-full w-full"
                                >
                                    <Image
                                        src={demoThumbnailSrc}
                                        alt="GhostSweep dashboard demo"
                                        width={1920}
                                        height={1080}
                                        className="h-full w-full object-cover cursor-zoom-in"
                                        priority
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            openLightbox(
                                                demoThumbnailSrc,
                                                "GhostSweep dashboard screenshot"
                                            );
                                        }}
                                    />

                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 pointer-events-none">
                                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-black shadow-xl group-hover:scale-110 transition-transform">
                                            <PlayCircle className="h-8 w-8" />
                                        </div>
                                        <p className="text-xs text-white font-medium drop-shadow">
                                            Watch a 90-second walkthrough
                                        </p>
                                    </div>
                                </button>
                            )}
                        </div>
                    </div>
                </section>

                {/* 4-STEP FLOW */}
                <section className="space-y-8 border-t border-white/10 pt-10">
                    <div className="space-y-2">
                        <h2 className="text-xl sm:text-2xl font-semibold tracking-tight">
                            From inbox to clear map in 4 steps
                        </h2>
                        <p className="text-sm text-muted-foreground max-w-2xl">
                            Connect → Scan → Review → Clean up. You stay in control the entire
                            time.
                        </p>
                    </div>

                    <div className="grid gap-4 md:grid-cols-4 text-sm">
                        {/* Step cards */}
                        {[
                            {
                                step: "Step 1",
                                icon: <ShieldCheck className="h-5 w-5 text-primary" />,
                                title: "Connect Gmail securely",
                                body: "Use Google OAuth with read-only access. We cannot send, delete, or modify emails. You can revoke access any time from your Google account.",
                            },
                            {
                                step: "Step 2",
                                icon: <MailSearch className="h-5 w-5 text-primary" />,
                                title: "Scan metadata only",
                                body: "We analyze sender, subject, and dates—never email content or attachments. The scan runs in the background; no need to sit and wait.",
                            },
                            {
                                step: "Step 3",
                                icon: <Database className="h-5 w-5 text-primary" />,
                                title: "Build your account map",
                                body: "We group signals by domain and service to show every company with your data—from major platforms to forgotten trials.",
                            },
                            {
                                step: "Step 4",
                                icon: <AlertTriangle className="h-5 w-5 text-red-400" />,
                                title: "Flag risk and clean up",
                                body: "See which accounts were breached and get GDPR/CCPA deletion templates to help you close what you no longer need.",
                            },
                        ].map((card) => (
                            <div
                                key={card.title}
                                className="space-y-3 rounded-xl border border-white/10 bg-black/40 p-4"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15">
                                        {card.icon}
                                    </div>
                                    <div className="space-y-0.5">
                                        <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                                            {card.step}
                                        </p>
                                        <h3 className="text-sm font-semibold">{card.title}</h3>
                                    </div>
                                </div>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                    {card.body}
                                </p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* WHAT WE LOOK FOR */}
                <section className="space-y-8 border-t border-white/10 pt-10">
                    <div className="space-y-2">
                        <h2 className="text-xl sm:text-2xl font-semibold tracking-tight">
                            What GhostSweep looks for
                        </h2>
                        <p className="text-sm text-muted-foreground max-w-2xl">
                            We use patterns in your inbox to infer where your data lives—no
                            scraping, no content reading.
                        </p>
                    </div>

                    <div className="grid gap-4 md:grid-cols-3 text-sm">
                        <div className="space-y-3 rounded-xl border border-white/10 bg-black/40 p-4">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15">
                                <MailSearch className="h-5 w-5 text-primary" />
                            </div>
                            <h3 className="text-sm font-semibold">Account creation emails</h3>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                &quot;Welcome to…&quot;, &quot;Verify your email&quot;, and
                                &quot;Account created&quot; subjects reveal which services
                                you&apos;ve signed up for over the years.
                            </p>
                        </div>

                        <div className="space-y-3 rounded-xl border border-white/10 bg-black/40 p-4">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15">
                                <ShieldCheck className="h-5 w-5 text-primary" />
                            </div>
                            <h3 className="text-sm font-semibold">Security & login alerts</h3>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                Password resets, new device logins, and unusual activity emails
                                highlight active accounts that deserve stronger protection.
                            </p>
                        </div>

                        <div className="space-y-3 rounded-xl border border-white/10 bg-black/40 p-4">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15">
                                <Trash2 className="h-5 w-5 text-primary" />
                            </div>
                            <h3 className="text-sm font-semibold">Closure & deletion emails</h3>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                Messages about closing accounts help distinguish services that
                                still hold your data from those that already removed it.
                            </p>
                        </div>
                    </div>
                </section>

                {/* FREE VS PRO */}
                <section className="space-y-8 border-t border-white/10 pt-10">
                    <div className="space-y-2">
                        <h2 className="text-xl sm:text-2xl font-semibold tracking-tight">
                            Free snapshot vs ongoing protection
                        </h2>
                        <p className="text-sm text-muted-foreground max-w-2xl">
                            Both plans respect your privacy. Professional adds monitoring and
                            tools to actually clean everything up.
                        </p>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 max-w-4xl">
                        {/* Free */}
                        <div className="space-y-5 rounded-xl border border-white/10 bg-black/40 p-5">
                            <div className="space-y-1">
                                <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                                    Free
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    One-off snapshot of your footprint
                                </p>
                            </div>
                            <ul className="space-y-2 text-xs text-muted-foreground">
                                <li className="flex items-start gap-2">
                                    <CheckCircle className="h-3.5 w-3.5 text-primary mt-0.5" />
                                    <span>One scan per month</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle className="h-3.5 w-3.5 text-primary mt-0.5" />
                                    <span>See your first 50 accounts</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle className="h-3.5 w-3.5 text-primary mt-0.5" />
                                    <span>Basic breach check</span>
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
                                <p className="text-[11px] font-semibold uppercase tracking-wide text-primary">
                                    Ongoing protection
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    Monitoring, breach alerts, and deletion workflows
                                </p>
                            </div>
                            <ul className="space-y-2 text-xs text-muted-foreground">
                                <li className="flex items-start gap-2">
                                    <CheckCircle className="h-3.5 w-3.5 text-primary mt-0.5" />
                                    <span>Unlimited scans and full account list</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle className="h-3.5 w-3.5 text-primary mt-0.5" />
                                    <span>Detailed breach information</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle className="h-3.5 w-3.5 text-primary mt-0.5" />
                                    <span>GDPR/CCPA deletion email templates</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle className="h-3.5 w-3.5 text-primary mt-0.5" />
                                    <span>New account detection and alerts</span>
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

                {/* ONGOING MONITORING */}
                <section className="space-y-8 border-t border-white/10 pt-10">
                    <div className="space-y-2">
                        <h2 className="text-xl sm:text-2xl font-semibold tracking-tight">
                            Ongoing monitoring (Professional)
                        </h2>
                        <p className="text-sm text-muted-foreground max-w-2xl">
                            Quiet, useful alerts instead of yet another noisy dashboard.
                        </p>
                    </div>

                    <div className="grid gap-4 md:grid-cols-3 text-sm">
                        <div className="space-y-3 rounded-xl border border-white/10 bg-black/40 p-4">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15">
                                <Bell className="h-5 w-5 text-primary" />
                            </div>
                            <h3 className="text-sm font-semibold">New accounts</h3>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                Get notified when &quot;Welcome&quot; or &quot;Account
                                created&quot; emails show up from services you&apos;ve never seen
                                in your dashboard before.
                            </p>
                        </div>

                        <div className="space-y-3 rounded-xl border border-white/10 bg-black/40 p-4">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-500/20">
                                <AlertTriangle className="h-5 w-5 text-red-400" />
                            </div>
                            <h3 className="text-sm font-semibold">New breaches</h3>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                If a service you use appears in a new breach, we&apos;ll flag it so
                                you can reset passwords or close the account quickly.
                            </p>
                        </div>

                        <div className="space-y-3 rounded-xl border border-white/10 bg-black/40 p-4">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/15">
                                <Trash2 className="h-5 w-5 text-emerald-400" />
                            </div>
                            <h3 className="text-sm font-semibold">Deletion tracking</h3>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                Track which services you&apos;ve asked to delete data and see when
                                they reply or confirm completion.
                            </p>
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
                                    Metadata only—never email content
                                </span>
                                <span className="inline-flex items-center gap-2">
                                    <Lock className="h-4 w-4 text-primary" />
                                    OAuth tokens encrypted at rest
                                </span>
                            </div>
                            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                                GhostSweep uses Google&apos;s official OAuth2 flow and only reads
                                metadata (from, subject, date). Tokens are encrypted at rest, and
                                you can disconnect and wipe your scan history at any time.
                            </p>
                            <Link
                                href="/home/security"
                                className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                            >
                                Read the full security overview
                                <ArrowRight className="h-3 w-3" />
                            </Link>
                        </div>
                    </div>
                </section>

                {/* FINAL CTA */}
                <section className="space-y-4 border-t border-white/10 pt-10 text-center">
                    <div className="space-y-2 max-w-xl mx-auto">
                        <h2 className="text-xl sm:text-2xl font-semibold tracking-tight">
                            Ready to see who has your data?
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            Run a private, read-only scan and get a clear map of your accounts,
                            breaches, and where to start cleaning up.
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
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4"
                    onClick={closeLightbox}
                >
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
                    <div
                        className="relative max-h-[90vh] w-full max-w-4xl"
                        onClick={(e) => e.stopPropagation()}
                    >
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