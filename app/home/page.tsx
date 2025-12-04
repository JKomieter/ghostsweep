/* eslint-disable react/no-unescaped-entities */
"use client"
import Link from "next/link";
import {
    ShieldCheck,
    EyeOff,
    AlertTriangle,
    Trash2,
    Lock,
    ArrowRight,
    PlayCircle,
    Activity,
    CheckCircle,
    X,
    Github,
    ExternalLink
} from "lucide-react";
import { FormEvent, useRef, useState } from "react";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import Image from "next/image";

const faqs = [
    {
        q: "Do you read my emails?",
        a: "No. We only access metadata (sender, subject, date). Never email content or attachments.",
    },
    {
        q: "Can you send or delete my emails?",
        a: "No. We use read-only OAuth. We cannot send, modify, or delete anything.",
    },
    {
        q: "How do I disconnect?",
        a: "One click in settings. Or revoke directly from your Google account settings.",
    },
    {
        q: "Do you sell my data?",
        a: "Never. We don't run ads, track you, or share your data with anyone.",
    },
];

export default function HomePage() {
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false)
    const [showVideo, setShowVideo] = useState(false);
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const [lightbox, setLightbox] = useState<{ src: string; alt: string } | null>(null);

    const handlePlay = () => {
        setShowVideo(true);
        setTimeout(() => {
            videoRef.current?.play().catch(() => {});
        }, 0);
    };

    const joinWaitlist = async (e: FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        try {
            const res = await fetch("/api/waitlist", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email })
            })

            if (res.ok) {
                toast.success("You're on the waitlist! We'll notify you about updates.")
                setEmail("")
            } else {
                toast.error("Something went wrong. Please try again.")
            }
        } catch (error) {
            toast.error("There was a problem joining waitlist. Please try again later")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <>
            {lightbox && (
                <div
                    className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
                    onClick={() => setLightbox(null)}
                >
                    <div
                        className="relative w-full max-w-6xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            type="button"
                            className="absolute -top-12 right-0 text-sm text-white/80 hover:text-white flex items-center gap-2"
                            onClick={() => setLightbox(null)}
                        >
                            <X className="h-5 w-5" />
                            Close
                        </button>

                        <div className="relative w-full aspect-video rounded-xl border border-white/20 bg-black overflow-hidden shadow-2xl">
                            <Image
                                src={lightbox.src}
                                alt={lightbox.alt}
                                fill
                                className="object-contain"
                            />
                        </div>
                    </div>
                </div>
            )}
            
        <main className="min-h-screen bg-background text-foreground">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-20 pt-12 space-y-24">
                
                {/* HERO */}
                <section className="space-y-10">
                    <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-xs text-emerald-200">
                        <span className="relative inline-flex h-2 w-2">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/75" />
                            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                        </span>
                        Privacy-first • Read-only • CASA certification in progress
                    </div>

                    <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
                        {/* Left: Headline + CTA */}
                        <div className="space-y-8">
                            <div className="space-y-6">
                                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
                                    You have 200+ accounts online.
                                    <br />
                                    <span className="text-muted-foreground">You remember maybe 30.</span>
                                </h1>
                                <p className="text-lg text-muted-foreground leading-relaxed max-w-xl">
                                    GhostSweep scans your Gmail to find every forgotten account—then helps you delete what you don't need.
                                </p>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4">
                                <Link
                                    href="/login"
                                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-8 py-3.5 text-sm font-semibold text-primary-foreground shadow-lg hover:opacity-90 transition"
                                >
                                    Start Free Scan
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                                <Link
                                    href="/home/how-it-works"
                                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/20 px-8 py-3.5 text-sm font-semibold hover:bg-white/5 transition"
                                >
                                    How It Works
                                </Link>
                            </div>

                            <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="h-4 w-4 text-primary" />
                                    <span>Read-only access</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="h-4 w-4 text-primary" />
                                    <span>Never reads content</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="h-4 w-4 text-primary" />
                                    <span>Disconnect anytime</span>
                                </div>
                            </div>
                        </div>

                        {/* Right: Video */}
                        <div className="rounded-2xl border border-white/10 bg-black/40 p-4 shadow-2xl">
                            <div className="relative aspect-video overflow-hidden rounded-xl border border-white/20 bg-black">
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
                                            src="https://ghostsweep.t3.storage.dev/Screenshot%202025-11-29%20at%202.34.51%E2%80%AFAM.png"
                                            alt="GhostSweep dashboard"
                                            className="h-full w-full object-cover"
                                            width={1920}
                                            height={1080}
                                            priority
                                        />

                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-black shadow-2xl group-hover:scale-110 transition-transform">
                                                <PlayCircle className="h-8 w-8" />
                                            </div>
                                            <p className="text-sm text-white font-medium drop-shadow-lg">
                                                Watch Demo
                                            </p>
                                        </div>
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </section>

                {/* TRUST BAR */}
                <section className="border-y border-white/10 py-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                        <div>
                            <p className="text-3xl font-bold text-primary">156</p>
                            <p className="text-sm text-muted-foreground mt-1">Avg accounts found</p>
                        </div>
                        <div>
                            <p className="text-3xl font-bold text-primary">59%</p>
                            <p className="text-sm text-muted-foreground mt-1">Forgotten accounts</p>
                        </div>
                        <div>
                            <p className="text-3xl font-bold text-red-400">73%</p>
                            <p className="text-sm text-muted-foreground mt-1">Have been breached</p>
                        </div>
                        <div>
                            <p className="text-3xl font-bold text-primary">5 min</p>
                            <p className="text-sm text-muted-foreground mt-1">To complete scan</p>
                        </div>
                    </div>
                </section>

                {/* HOW IT WORKS */}
                <section id="how" className="space-y-12">
                    <div className="text-center space-y-4 max-w-3xl mx-auto">
                        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
                            How GhostSweep Works
                        </h2>
                        <p className="text-lg text-muted-foreground">
                            Connect Gmail → Scan metadata → See all accounts → Delete what you don't need
                        </p>
                    </div>

                    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
                        <div className="space-y-4 rounded-xl border border-white/10 bg-black/40 p-6">
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/20">
                                <span className="text-xl font-bold text-primary">1</span>
                            </div>
                            <h3 className="text-lg font-semibold">Connect Gmail</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                Read-only OAuth access. We can't send, delete, or modify emails.
                            </p>
                        </div>

                        <div className="space-y-4 rounded-xl border border-white/10 bg-black/40 p-6">
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/20">
                                <span className="text-xl font-bold text-primary">2</span>
                            </div>
                            <h3 className="text-lg font-semibold">Scan Metadata</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                We analyze sender addresses and dates—never email content.
                            </p>
                        </div>

                        <div className="space-y-4 rounded-xl border border-white/10 bg-black/40 p-6">
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/20">
                                <span className="text-xl font-bold text-primary">3</span>
                            </div>
                            <h3 className="text-lg font-semibold">View Results</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                See every account, breaches, and which services have your data.
                            </p>
                        </div>

                        <div className="space-y-4 rounded-xl border border-white/10 bg-black/40 p-6">
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/20">
                                <span className="text-xl font-bold text-primary">4</span>
                            </div>
                            <h3 className="text-lg font-semibold">Delete Accounts</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                Get GDPR templates and track which companies respond.
                            </p>
                        </div>
                    </div>
                </section>

                {/* LARGE SCREENSHOT */}
                <section className="space-y-8">
                    <div className="text-center space-y-4 max-w-3xl mx-auto">
                        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
                            See Your Digital Footprint
                        </h2>
                        <p className="text-lg text-muted-foreground">
                            Real results from actual scans. Click to enlarge.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => setLightbox({
                            src: "https://ghostsweep.t3.storage.dev/Screenshot%202025-11-29%20at%202.34.51%E2%80%AFAM.png",
                            alt: "GhostSweep dashboard"
                        })}
                        className="group relative w-full rounded-2xl border border-white/10 bg-black/40 p-6 overflow-hidden hover:border-primary/50 transition-all"
                    >
                        <div className="relative aspect-video rounded-xl overflow-hidden border border-white/20">
                            <Image
                                src="https://ghostsweep.t3.storage.dev/Screenshot%202025-11-29%20at%202.34.51%E2%80%AFAM.png"
                                alt="GhostSweep dashboard"
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                                priority
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <div className="flex items-center gap-2 text-white bg-black/80 px-4 py-2 rounded-lg">
                                    <ExternalLink className="h-4 w-4" />
                                    <span className="text-sm font-medium">Click to Enlarge</span>
                                </div>
                            </div>
                        </div>
                    </button>

                    {/* Feature Grid with Larger Images */}
                    <div className="grid gap-6 md:grid-cols-3">
                        <button
                            type="button"
                            onClick={() => setLightbox({
                                src: "https://ghostsweep.t3.storage.dev/Screenshot%202025-12-02%20at%205.10.31%E2%80%AFPM.png",
                                alt: "Breach detection"
                            })}
                            className="group space-y-4 text-left"
                        >
                            <div className="relative aspect-[4/3] rounded-xl overflow-hidden border border-white/10 bg-black/40">
                                <Image
                                    src="https://ghostsweep.t3.storage.dev/Screenshot%202025-12-02%20at%205.10.31%E2%80%AFPM.png"
                                    alt="Breach detection"
                                    fill
                                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <div className="flex items-center gap-2 text-white bg-black/80 px-4 py-2 rounded-lg">
                                            <ExternalLink className="h-4 w-4" />
                                            <span className="text-sm font-medium">Click to Enlarge</span>
                                        </div>
                                    </div>
                            </div>
                            <div className="space-y-2 px-2">
                                <div className="flex items-center gap-2">
                                    <AlertTriangle className="h-5 w-5 text-red-400" />
                                    <h3 className="font-semibold">Breach Detection</h3>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    See which services leaked your data and what was exposed
                                </p>
                            </div>
                        </button>

                        <button
                            type="button"
                            onClick={() => setLightbox({
                                src: "https://ghostsweep.t3.storage.dev/Screenshot%202025-12-02%20at%204.57.17%E2%80%AFPM%20(2).png",
                                alt: "Account timeline"
                            })}
                            className="group space-y-4 text-left"
                        >
                            <div className="relative aspect-[4/3] rounded-xl overflow-hidden border border-white/10 bg-black/40">
                                <Image
                                    src="https://ghostsweep.t3.storage.dev/Screenshot%202025-12-02%20at%204.57.17%E2%80%AFPM%20(2).png"
                                    alt="Account timeline"
                                    fill
                                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <div className="flex items-center gap-2 text-white bg-black/80 px-4 py-2 rounded-lg">
                                            <ExternalLink className="h-4 w-4" />
                                            <span className="text-sm font-medium">Click to Enlarge</span>
                                        </div>
                                    </div>
                            </div>
                            <div className="space-y-2 px-2">
                                <div className="flex items-center gap-2">
                                    <Activity className="h-5 w-5 text-primary" />
                                    <h3 className="font-semibold">Account Timeline</h3>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    View accounts by creation date, from oldest to newest
                                </p>
                            </div>
                        </button>

                        <button
                            type="button"
                            onClick={() => setLightbox({
                                src: "https://ghostsweep.t3.storage.dev/Screenshot%202025-12-02%20at%205.46.57%E2%80%AFPM.png",
                                alt: "Deletion tools"
                            })}
                            className="group space-y-4 text-left"
                        >
                            <div className="relative aspect-[4/3] rounded-xl overflow-hidden border border-white/10 bg-black/40">
                                <Image
                                    src="https://ghostsweep.t3.storage.dev/Screenshot%202025-12-02%20at%205.46.57%E2%80%AFPM.png"
                                    alt="Deletion tools"
                                    fill
                                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <div className="flex items-center gap-2 text-white bg-black/80 px-4 py-2 rounded-lg">
                                            <ExternalLink className="h-4 w-4" />
                                            <span className="text-sm font-medium">Click to Enlarge</span>
                                        </div>
                                    </div>
                            </div>
                            <div className="space-y-2 px-2">
                                <div className="flex items-center gap-2">
                                    <Trash2 className="h-5 w-5 text-emerald-400" />
                                    <h3 className="font-semibold">Deletion Tools</h3>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    GDPR/CCPA templates and progress tracking
                                </p>
                            </div>
                        </button>
                    </div>
                </section>

                {/* WHY TRUST US */}
                <section className="space-y-12">
                    <div className="text-center space-y-4 max-w-3xl mx-auto">
                        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
                            Why Trust GhostSweep?
                        </h2>
                        <p className="text-lg text-muted-foreground">
                            We're not Google. We're not Atlassian. We earn trust through transparency.
                        </p>
                    </div>

                    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                        <div className="space-y-4 rounded-xl border border-white/10 bg-black/40 p-6">
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/20">
                                <EyeOff className="h-6 w-6 text-primary" />
                            </div>
                            <h3 className="text-lg font-semibold">Metadata Only</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                We only see sender addresses and dates. Never email content or attachments. Ever.
                            </p>
                        </div>

                        <div className="space-y-4 rounded-xl border border-white/10 bg-black/40 p-6">
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/20">
                                <Github className="h-6 w-6 text-primary" />
                            </div>
                            <h3 className="text-lg font-semibold">Open Source Core</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                Our scanning logic is on GitHub. Don't trust us? Audit the code yourself.
                            </p>
                                <Link href="https://github.com/JKomieter/ghostsweep-api.git" target="_blank" className="inline-flex items-center gap-1 text-sm text-primary hover:underline">
                                View on GitHub
                                <ExternalLink className="h-3 w-3" />
                            </Link>
                        </div>

                        <div className="space-y-4 rounded-xl border border-white/10 bg-black/40 p-6">
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/20">
                                <ShieldCheck className="h-6 w-6 text-primary" />
                            </div>
                            <h3 className="text-lg font-semibold">Verify Everything</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                Check our OAuth permissions yourself at myaccount.google.com/permissions
                            </p>
                        </div>

                        <div className="space-y-4 rounded-xl border border-white/10 bg-black/40 p-6">
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/20">
                                <Lock className="h-6 w-6 text-primary" />
                            </div>
                            <h3 className="text-lg font-semibold">Instant Disconnect</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                Revoke access anytime with one click. No dark patterns or retention.
                            </p>
                        </div>

                        <div className="space-y-4 rounded-xl border border-white/10 bg-black/40 p-6">
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-500/20">
                                <Activity className="h-6 w-6 text-emerald-400" />
                            </div>
                            <h3 className="text-lg font-semibold">CASA Certified</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                Security certification in progress. Independent audit by Google-approved assessors.
                            </p>
                        </div>

                        <div className="space-y-4 rounded-xl border border-white/10 bg-black/40 p-6">
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/20">
                                <CheckCircle className="h-6 w-6 text-primary" />
                            </div>
                            <h3 className="text-lg font-semibold">Built by Real Person</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                Hi, I'm Joel. I use GhostSweep on my own Gmail. Email me: komieterj@gmail.com
                            </p>
                        </div>
                    </div>

                    <div className="text-center">
                        <Link
                            href="/home/security"
                            className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                        >
                            Read Full Security Documentation
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>
                </section>

                {/* PRICING (SIMPLIFIED) */}
                <section id="pricing" className="space-y-12">
                    <div className="text-center space-y-4 max-w-3xl mx-auto">
                        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
                            Simple Pricing
                        </h2>
                        <p className="text-lg text-muted-foreground">
                            Try free. Upgrade when you're ready.
                        </p>
                    </div>

                    <div className="grid gap-8 md:grid-cols-2 max-w-4xl mx-auto">
                        {/* Free */}
                        <div className="space-y-6 rounded-2xl border border-white/10 bg-black/40 p-8">
                            <div className="space-y-2">
                                <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                                    Free
                                </h3>
                                <div className="flex items-baseline gap-2">
                                    <p className="text-4xl font-bold">$0</p>
                                    <p className="text-muted-foreground">forever</p>
                                </div>
                            </div>

                            <ul className="space-y-3 text-sm">
                                <li className="flex items-start gap-3">
                                    <CheckCircle className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                                    <span>One background scan</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <CheckCircle className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                                    <span>See first 50 accounts</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <CheckCircle className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                                    <span>Basic breach detection</span>
                                </li>
                            </ul>

                            <Link
                                href="/login"
                                className="block w-full text-center rounded-lg border border-white/20 px-6 py-3 text-sm font-semibold hover:bg-white/5 transition"
                            >
                                Start Free
                            </Link>
                        </div>

                        {/* Pro */}
                        <div className="relative space-y-6 rounded-2xl border-2 border-primary/60 bg-primary/5 p-8">
                            <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                                <span className="rounded-full bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground shadow-lg">
                                    Beta Pricing
                                </span>
                            </div>

                            <div className="space-y-2">
                                <h3 className="text-sm font-semibold uppercase tracking-wide text-primary">
                                    Professional
                                </h3>
                                <div className="flex items-baseline gap-3">
                                    <p className="text-4xl font-bold">$9.99</p>
                                    <span className="text-sm text-muted-foreground line-through">$12.99</span>
                                    <p className="text-muted-foreground">/month</p>
                                </div>
                                <p className="text-xs text-emerald-200">
                                    Lock in beta pricing forever
                                </p>
                            </div>

                            <ul className="space-y-3 text-sm">
                                <li className="flex items-start gap-3">
                                    <CheckCircle className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                                    <span>Unlimited scans</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <CheckCircle className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                                    <span>See all accounts</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <CheckCircle className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                                    <span>Full breach history</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <CheckCircle className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                                    <span>Deletion templates</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <CheckCircle className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                                    <span>Ongoing monitoring</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <CheckCircle className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                                    <span>Priority support</span>
                                </li>
                            </ul>

                            <Link
                                href="/dashboard/billing?plan=monthly"
                                className="block w-full text-center rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-lg hover:opacity-90 transition"
                            >
                                Upgrade to Pro
                            </Link>
                        </div>
                    </div>
                </section>

                {/* FAQ (CONDENSED) */}
                <section className="space-y-12">
                    <div className="text-center space-y-4 max-w-3xl mx-auto">
                        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
                            Common Questions
                        </h2>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2 max-w-4xl mx-auto">
                        {faqs.map((item) => (
                            <div
                                key={item.q}
                                className="space-y-3 rounded-xl border border-white/10 bg-black/40 p-6"
                            >
                                <h3 className="font-semibold">{item.q}</h3>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    {item.a}
                                </p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* FINAL CTA */}
                <section className="space-y-8 rounded-2xl border border-primary/60 bg-primary/5 p-12 text-center">
                    <div className="space-y-4 max-w-2xl mx-auto">
                        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
                            Ready to see your digital footprint?
                        </h2>
                        <p className="text-lg text-muted-foreground">
                            Find every forgotten account in 5 minutes.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <Link
                            href="/login"
                            className="inline-flex items-center gap-2 rounded-lg bg-primary px-8 py-4 text-sm font-semibold text-primary-foreground shadow-lg hover:opacity-90 transition"
                        >
                            Start Free Scan
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1.5">
                                <CheckCircle className="h-4 w-4 text-primary" />
                                No credit card
                            </span>
                            <span className="flex items-center gap-1.5">
                                <CheckCircle className="h-4 w-4 text-primary" />
                                5 min setup
                            </span>
                        </div>
                    </div>
                </section>

                {/* FOOTER */}
                <footer className="border-t border-white/10 pt-8 text-sm text-muted-foreground">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                        <p>© {new Date().getFullYear()} GhostSweep. Built with privacy in mind.</p>
                        <div className="flex flex-wrap gap-6 justify-center">
                            <Link href="/home/privacy" className="hover:text-foreground transition">
                                Privacy
                            </Link>
                            <Link href="/home/terms" className="hover:text-foreground transition">
                                Terms
                            </Link>
                            <Link href="/home/security" className="hover:text-foreground transition">
                                Security
                            </Link>
                            <Link href="mailto:support@ghostsweep.com" className="hover:text-foreground transition">
                                Contact
                            </Link>
                        </div>
                    </div>
                </footer>
            </div>
        </main>
        </>
    );
}