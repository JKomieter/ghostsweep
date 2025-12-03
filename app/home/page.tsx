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
    BookOpenText,
    CheckCircle,
    TrendingUp,
    X
} from "lucide-react";
import { FormEvent, useRef, useState } from "react";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import Image from "next/image";

const faqs = [
    {
        q: "Do you read my emails?",
        a: "No. GhostSweep never accesses the content of your emails. We only read Gmail metadata such as sender, subject line, and timestamps—never the body or attachments.",
    },
    {
        q: "Can GhostSweep send or delete emails?",
        a: "No. We use Gmail's read-only permission. GhostSweep cannot send, modify, or delete any email in your account. We can only view sender information and dates.",
    },
    {
        q: "What happens if I disconnect my Gmail?",
        a: "GhostSweep instantly loses access to your account. You stay in full control and can revoke access at any time from your Google account settings.",
    },
    {
        q: "How does account deletion work?",
        a: "We provide GDPR/CCPA compliant deletion request templates for each service. You send them yourself (we can't access your accounts), and we help you track which companies respond.",
    },
    {
        q: "Can I delete my sweep history?",
        a: "Yes. You can permanently delete your detected services, breaches, and scan events with a single click from the privacy tools.",
    },
    {
        q: "Do you sell or share my data?",
        a: "Never. We don't run ads, we don't track you across the web, and we don't sell or share your data with third parties. Your data is yours.",
    },
    {
        q: "What's the difference between Free and Pro?",
        a: "Free gives you one scan and shows 50 accounts. Pro gives unlimited scans, full account list, automated deletion templates, ongoing monitoring, and breach alerts.",
    },
    {
        q: "Is my payment information secure?",
        a: "Yes. We use Stripe for payment processing. We never see or store your credit card information—Stripe handles all payment data securely.",
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
            videoRef.current?.play().catch(() => {
                // autoplay might be blocked
            });
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
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
                    className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4"
                    onClick={() => setLightbox(null)}
                >
                    <div
                        className="relative w-full max-w-5xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            type="button"
                            className="absolute -top-10 right-0 text-xs text-muted-foreground hover:text-white flex items-center gap-1"
                            onClick={() => setLightbox(null)}
                        >
                            <X className="h-4 w-4" />
                            Close
                        </button>

                        <div className="relative w-full aspect-video rounded-lg border border-white/20 bg-black overflow-hidden">
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
            <div className="mx-auto max-w-6xl px-4 pb-16 pt-10 space-y-16">
                {/* HERO + VIDEO */}
                <section className="space-y-8">
                    <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] text-muted-foreground">
                        <span className="relative inline-flex h-2.5 w-2.5 items-center justify-center">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/40" />
                            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
                        </span>
                        Privacy-first inbox scan for your entire digital footprint
                    </div>

                    <div className="grid gap-8 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] md:items-start">
                        {/* Left: copy + CTAs */}
                        <div className="space-y-6">
                            <div className="space-y-4">
                                <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                                    You have 200+ accounts online.
                                    <br />
                                    You remember maybe 30.
                                </h1>
                                <p className="max-w-xl text-sm text-muted-foreground">
                                    GhostSweep runs a deep, read-only scan of your inbox to discover every account you've ever created—streaming services, old social media, forgotten subscriptions. We do the heavy lifting in the background and notify you when your report is ready so you can see what was breached and delete what you don't need.
                                </p>
                            </div>

                            <div className="flex flex-wrap items-center gap-3">
                                <Link
                                    href="/login"
                                    className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-xs font-medium text-primary-foreground shadow-sm hover:opacity-90 transition"
                                >
                                    Start your free sweep
                                    <ArrowRight className="h-3 w-3" />
                                </Link>
                                <Link
                                    href="/login"
                                    className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    Already have an account? <span className="underline">Log in</span>
                                </Link>
                            </div>

                            <div className="flex flex-wrap gap-4 text-[11px] text-muted-foreground">
                                <div className="inline-flex items-center gap-1">
                                    <ShieldCheck className="h-3 w-3 text-primary" />
                                    Read-only Gmail access
                                </div>
                                <div className="inline-flex items-center gap-1">
                                    <EyeOff className="h-3 w-3 text-primary" />
                                    Only metadata, never content
                                </div>
                                <div className="inline-flex items-center gap-1">
                                    <Lock className="h-3 w-3 text-primary" />
                                    Revoke access anytime
                                </div>
                            </div>
                        </div>

                        {/* Right: video demo */}
                        <div className="rounded-2xl border border-white/10 bg-[#050505] p-3 shadow-lg">
                            <div className="relative aspect-video overflow-hidden rounded-xl border border-white/10 bg-black/60">
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
                                            alt="GhostSweep dashboard showing discovered accounts"
                                            className="h-full w-full object-cover"
                                            width={1000}
                                            height={600}
                                            priority
                                        />

                                        {/* *** NO BLUR, NO OVERLAY *** */}

                                        {/* Play button overlay (clean, sharp) */}
                                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 pointer-events-none">
                                            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-black shadow-xl group-hover:scale-110 transition-transform">
                                                <PlayCircle className="h-8 w-8" />
                                            </div>
                                            <p className="text-xs text-white/90 font-medium drop-shadow">
                                                Watch the GhostSweep dashboard in action
                                            </p>
                                        </div>
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </section>

                {/* ✅ NEW: EARLY RESULTS SECTION (Honest Social Proof) */}
                <section className="space-y-6">
                    <div className="space-y-2">
                        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-[11px] text-emerald-200">
                            <Activity className="h-3 w-3" />
                            Early Beta Results
                        </div>
                        <h2 className="text-xl font-semibold tracking-tight">
                            What early testers are discovering
                        </h2>
                        <p className="max-w-xl text-sm text-muted-foreground">
                            GhostSweep is in early beta. Here's what the first users found when they scanned their inboxes.
                        </p>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid gap-4 md:grid-cols-4 text-sm">
                        <div className="space-y-1 rounded-lg border border-white/10 bg-black/40 p-4">
                            <p className="text-2xl font-semibold text-primary">153</p>
                            <p className="text-xs text-muted-foreground">
                                Average accounts found
                            </p>
                        </div>
                        <div className="space-y-1 rounded-lg border border-white/10 bg-black/40 p-4">
                            <p className="text-2xl font-semibold text-primary">59%</p>
                            <p className="text-xs text-muted-foreground">
                                Accounts users forgot about
                            </p>
                        </div>
                        <div className="space-y-1 rounded-lg border border-white/10 bg-black/40 p-4">
                            <p className="text-2xl font-semibold text-red-400">5</p>
                            <p className="text-xs text-muted-foreground">
                                Average breaches per user
                            </p>
                        </div>
                        <div className="space-y-1 rounded-lg border border-white/10 bg-black/40 p-4">
                            <p className="text-2xl font-semibold text-primary">127-189</p>
                            <p className="text-xs text-muted-foreground">
                                Range of accounts found
                            </p>
                        </div>
                    </div>

                    {/* Testimonials */}
                    <div className="grid gap-4 md:grid-cols-3">
                        <div className="space-y-2 rounded-lg border border-white/10 bg-black/40 p-4">
                            <div className="flex items-center gap-2">
                                <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-semibold">
                                    B
                                </div>
                                <div>
                                    <p className="text-xs font-medium">Blay</p>
                                    <p className="text-[10px] text-muted-foreground">Software Engineer</p>
                                </div>
                            </div>
                            <p className="text-xs text-muted-foreground italic">
                                "Bro. I had no idea. I thought I was good with this stuff."
                            </p>
                            <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                                <span>143 accounts</span>
                                <span>•</span>
                                <span>5 breaches</span>
                            </div>
                        </div>

                        <div className="space-y-2 rounded-lg border border-white/10 bg-black/40 p-4">
                            <div className="flex items-center gap-2">
                                <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-semibold">
                                    P
                                </div>
                                <div>
                                    <p className="text-xs font-medium">Philemon</p>
                                    <p className="text-[10px] text-muted-foreground">Designer</p>
                                </div>
                            </div>
                            <p className="text-xs text-muted-foreground italic">
                                "This is both amazing and terrifying. Can I share this with my team?"
                            </p>
                            <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                                <span>127 accounts</span>
                                <span>•</span>
                                <span>3 breaches</span>
                            </div>
                        </div>

                        <div className="space-y-2 rounded-lg border border-white/10 bg-black/40 p-4">
                            <div className="flex items-center gap-2">
                                <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-semibold">
                                    D
                                </div>
                                <div>
                                    <p className="text-xs font-medium">Doris</p>
                                    <p className="text-[10px] text-muted-foreground">Marketing Manager</p>
                                </div>
                            </div>
                            <p className="text-xs text-muted-foreground italic">
                                "189?! Joel, I guessed maybe 40. This is insane."
                            </p>
                            <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                                <span>189 accounts</span>
                                <span>•</span>
                                <span>6 breaches</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ✅ NEW: VISUAL RESULTS SECTION */}
                <section className="space-y-6">
                    <div className="space-y-2">
                        <h2 className="text-xl font-semibold tracking-tight">
                            See exactly what GhostSweep finds
                        </h2>
                        <p className="max-w-xl text-sm text-muted-foreground">
                            Real results from actual scans. Your dashboard will show every account, breach details, and deletion options.
                        </p>
                    </div>

                    {/* 
                    PLACEHOLDER: Main Screenshot
                    Create a professional screenshot showing:
                    
                    Option A: Dashboard Overview
                    - Header showing "166 accounts found"
                    - List of 8-10 services (Netflix, Amazon, Spotify, etc.)
                    - Each with: Logo, name, email count, "breached" badge
                    - Clean, organized table view
                    - Redact any sensitive info
                    
                    Option B: Split View (Better)
                    - Left side: List of accounts
                    - Right side: Breach detail panel
                    - Shows the value immediately
                    */}
                    <div className="rounded-2xl border border-white/10 bg-[#050505] p-4 shadow-lg">
                        <div className="aspect-video rounded-xl border border-white/10 bg-linear-to-br from-black/60 to-black/40 flex items-center justify-center overflow-hidden">
                            {/* <div className="text-center space-y-2">
                                <p className="text-xs text-muted-foreground">
                                    [SCREENSHOT: Dashboard showing discovered accounts]
                                </p>
                                <p className="text-[10px] text-muted-foreground max-w-md">
                                    Show: Account list with logos, breach badges, email counts.
                                    Example services: Netflix, Amazon, old MySpace, forgotten trials
                                </p>
                            </div> */}
                            <Image
                                src="https://ghostsweep.t3.storage.dev/Screenshot%202025-11-29%20at%202.34.51%E2%80%AFAM.png"
                                width={1920}       // <-- use large width
                                height={1080}
                                alt="GhostSweep screenshot"
                                className="w-full h-full object-contain"
                                priority
                            />
                        </div>
                    </div>

                    {/* Feature Highlights with Screenshots */}
                    <div className="grid gap-4 md:grid-cols-3">
                        {/* 
                        PLACEHOLDER: Breach Detection Screenshot
                        Show: Red alert icon, breach name, date, what was exposed
                        */}
                        <div className="space-y-3 rounded-lg border border-white/10 bg-black/40 p-4">
                            <button
                                type="button"
                                className="aspect-4/3 rounded-lg border border-red-500/20 bg-linear-to-br from-red-500/10 to-black/40 flex items-center justify-center overflow-hidden w-full"
                                onClick={() =>
                                    setLightbox({
                                        src: "https://ghostsweep.t3.storage.dev/Screenshot%202025-12-02%20at%205.10.31%E2%80%AFPM.png",
                                        alt: "GhostSweep breach detection view",
                                    })
                                }
                            >
                                <Image
                                    src="https://ghostsweep.t3.storage.dev/Screenshot%202025-12-02%20at%205.10.31%E2%80%AFPM.png"
                                    alt="GhostSweep breach detection view"
                                    width={1600}
                                    height={1200}
                                    className="object-cover w-full h-full cursor-zoom-in"
                                    priority
                                />
                            </button>
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <AlertTriangle className="h-4 w-4 text-red-400" />
                                    <p className="text-xs font-medium">Breach Detection</p>
                                </div>
                                <p className="text-[11px] text-muted-foreground">
                                    See which services leaked your data, when, and what was exposed (passwords, emails, addresses)
                                </p>
                            </div>
                        </div>

                        {/* 
                        PLACEHOLDER: Account Timeline Screenshot
                        Show: List of accounts sorted by date, oldest at top
                        */}
                            <div className="space-y-3 rounded-lg border border-white/10 bg-black/40 p-4">
                                <button
                                    type="button"
                                    className="aspect-4/3 rounded-lg border border-primary/20 bg-linear-to-br from-primary/10 to-black/40 flex items-center justify-center overflow-hidden w-full"
                                    onClick={() =>
                                        setLightbox({
                                            src: "https://ghostsweep.t3.storage.dev/Screenshot%202025-12-02%20at%204.57.17%E2%80%AFPM%20(2).png",
                                            alt: "GhostSweep account timeline view",
                                        })
                                    }
                                >
                                    <Image
                                        src="https://ghostsweep.t3.storage.dev/Screenshot%202025-12-02%20at%204.57.17%E2%80%AFPM%20(2).png"
                                        alt="GhostSweep account timeline view"
                                        width={1600}
                                        height={1200}
                                        className="object-cover w-full h-full cursor-zoom-in"
                                        priority
                                    />
                                </button>
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <TrendingUp className="h-4 w-4 text-primary" />
                                        <p className="text-xs font-medium">Account Timeline</p>
                                    </div>
                                    <p className="text-[11px] text-muted-foreground">
                                        See when you created each account, from your oldest (2007 MySpace?) to newest
                                    </p>
                                </div>
                            </div>

                        {/* 
                        PLACEHOLDER: Deletion Tools Screenshot
                        Show: Template email, track status feature
                        */}
                            <div className="space-y-3 rounded-lg border border-white/10 bg-black/40 p-4">
                                <button
                                    type="button"
                                    className="aspect-4/3 rounded-lg border border-emerald-500/20 bg-linear-to-br from-emerald-500/10 to-black/40 flex items-center justify-center overflow-hidden w-full"
                                    onClick={() =>
                                        setLightbox({
                                            src: "https://ghostsweep.t3.storage.dev/Screenshot%202025-12-02%20at%205.46.57%E2%80%AFPM.png",
                                            alt: "GhostSweep deletion tools view",
                                        })
                                    }
                                >
                                    <Image
                                        src="https://ghostsweep.t3.storage.dev/Screenshot%202025-12-02%20at%205.46.57%E2%80%AFPM.png"
                                        alt="GhostSweep deletion tools view"
                                        width={1600}
                                        height={1200}
                                        className="object-cover w-full h-full cursor-zoom-in"
                                        priority
                                    />
                                </button>
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <Trash2 className="h-4 w-4 text-emerald-400" />
                                        <p className="text-xs font-medium">Deletion Tools</p>
                                    </div>
                                    <p className="text-[11px] text-muted-foreground">
                                        GDPR/CCPA compliant templates for each service. Track which companies respond
                                    </p>
                                </div>
                            </div>
                    </div>
                </section>

                {/* HOW IT WORKS */}
                <section id="how" className="space-y-6">
                    <div className="flex flex-wrap items-baseline justify-between gap-3">
                        <div className="space-y-2">
                            <h2 className="text-xl font-semibold tracking-tight">
                                How it works: 4 steps to map your footprint
                            </h2>
                            <p className="max-w-xl text-sm text-muted-foreground">
                                GhostSweep connects to your Gmail with read-only access, analyzes metadata only, and turns your inbox into a map of your accounts, breaches, and privacy risk. Scans run securely in the background—we&apos;ll let you know as soon as your report is ready.
                            </p>
                        </div>
                        <Link
                            href="/home/how-it-works"
                            className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                        >
                            See full &quot;How it works&quot;
                            <ArrowRight className="h-3 w-3" />
                        </Link>
                    </div>

                    <div className="grid gap-4 text-sm md:grid-cols-4">
                        <div className="space-y-2 rounded-lg border border-white/10 bg-black/40 p-3">
                            <p className="text-[11px] font-semibold text-muted-foreground">
                                1. Connect your Gmail
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Read-only access via Google OAuth. We can&#39;t send, delete, or modify any emails. You stay in control.
                            </p>
                        </div>
                        <div className="space-y-2 rounded-lg border border-white/10 bg-black/40 p-3">
                            <p className="text-[11px] font-semibold text-muted-foreground">
                                2. We scan metadata only
                            </p>
                            <p className="text-xs text-muted-foreground">
                                We analyze sender, subject, and timestamps—never email bodies or attachments. Scans run in the background so you don&apos;t have to wait.
                            </p>
                        </div>
                        <div className="space-y-2 rounded-lg border border-white/10 bg-black/40 p-3">
                            <p className="text-[11px] font-semibold text-muted-foreground">
                                3. See all your accounts
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Every service you&lsquo;ve signed up for, which ones were breached, and when. Early users average 150+ accounts.
                            </p>
                        </div>
                        <div className="space-y-2 rounded-lg border border-white/10 bg-black/40 p-3">
                            <p className="text-[11px] font-semibold text-muted-foreground">
                                4. Clean up your footprint
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Get deletion request templates, track responses, and monitor for new accounts (Professional plan).
                            </p>
                        </div>
                    </div>
                </section>

                {/* SECURITY SECTION */}
                <section id="security" className="space-y-6">
                    <div className="space-y-2">
                        <h2 className="text-xl font-semibold tracking-tight">
                            Security and privacy are non-negotiable
                        </h2>
                        <p className="max-w-xl text-sm text-muted-foreground">
                            We only access what&apos;s absolutely necessary to answer one question: Where does your data live?{" "}
                            <span className="font-medium text-foreground">
                                Nothing more.
                            </span>
                        </p>
                    </div>

                    <div className="grid gap-4 text-xs md:grid-cols-3">
                        <div className="space-y-2 rounded-lg border border-white/10 bg-black/40 p-3">
                            <div className="flex items-center gap-2">
                                <EyeOff className="h-3 w-3 text-primary" />
                                <p className="font-medium">No email content, ever</p>
                            </div>
                            <p className="text-muted-foreground">
                                GhostSweep only uses metadata (From, Subject, Date) to identify accounts and breaches. Email bodies and attachments are never accessed, read, or stored.
                            </p>
                        </div>
                        <div className="space-y-2 rounded-lg border border-white/10 bg-black/40 p-3">
                            <div className="flex items-center gap-2">
                                <Lock className="h-3 w-3 text-primary" />
                                <p className="font-medium">Encrypted tokens & easy revoke</p>
                            </div>
                            <p className="text-muted-foreground">
                                OAuth tokens are encrypted at rest with AES-256. You can disconnect GhostSweep from your Google account at any time, instantly revoking all access.
                            </p>
                        </div>
                        <div className="space-y-2 rounded-lg border border-white/10 bg-black/40 p-3">
                            <div className="flex items-center gap-2">
                                <Trash2 className="h-3 w-3 text-primary" />
                                <p className="font-medium">Delete your data with one click</p>
                            </div>
                            <p className="text-muted-foreground">
                                Remove your sweep results, breaches, and linked services from GhostSweep whenever you choose—no dark patterns, no hoops to jump through.
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
                        <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/5 px-2.5 py-1">
                            <Activity className="h-3 w-3 text-emerald-400" />
                            CASA certification: <span className="font-medium">In progress</span>
                        </span>
                        <Link
                            href="/home/security"
                            className="text-[11px] text-primary hover:underline"
                        >
                            Read the full security overview →
                        </Link>
                    </div>
                </section>

                {/* PRICING */}
                <section id="pricing" className="space-y-6">
                    <div className="space-y-2">
                        <h2 className="text-xl font-semibold tracking-tight">
                            Try free. Upgrade when you&apos;re ready.
                        </h2>
                        <p className="max-w-xl text-sm text-muted-foreground">
                            Free plan gives you a one-off background sweep and a snapshot of your accounts. Professional plan adds ongoing scans, breach alerts, and tools to actually clean everything up.
                        </p>
                    </div>

                    {/* Beta Pricing Banner */}
                    <div className="rounded-lg border border-primary/40 bg-primary/10 p-3">
                        <div className="flex items-start gap-3">
                            <div className="rounded-full bg-primary/20 p-1.5">
                                <CheckCircle className="h-4 w-4 text-primary" />
                            </div>
                            <div className="flex-1 space-y-1">
                                <p className="text-xs font-medium text-foreground">
                                    🎉 Beta Pricing Available
                                </p>
                                <p className="text-[11px] text-muted-foreground">
                                    Lock in $9.99/month forever. After beta ends, the price increases to $12.99/month for new users. Early adopters keep the lower rate permanently.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
                        {/* Free */}
                        <div className="space-y-4 rounded-xl border border-white/10 bg-black/40 p-5">
                            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                Free
                            </p>
                            <div className="flex items-baseline gap-1">
                                <p className="text-2xl font-semibold">$0</p>
                                <p className="text-xs text-muted-foreground"> / forever</p>
                            </div>
                            <ul className="space-y-1.5 text-xs text-muted-foreground">
                                <li className="flex items-start gap-2">
                                    <CheckCircle className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                                    <span>Run one background sweep</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                                    <span>See up to 50 accounts</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                                    <span>Basic breach check</span>
                                </li>
                                <li className="flex items-start gap-2 opacity-50">
                                    <span className="h-3.5 w-3.5 mt-0.5 shrink-0">✕</span>
                                    <span>No ongoing monitoring</span>
                                </li>
                                <li className="flex items-start gap-2 opacity-50">
                                    <span className="h-3.5 w-3.5 mt-0.5 shrink-0">✕</span>
                                    <span>No deletion templates</span>
                                </li>
                            </ul>
                            <Link
                                href="/login"
                                className="inline-flex w-full items-center justify-center rounded-full border border-white/20 px-4 py-2 text-xs font-medium hover:bg-white/5 transition"
                            >
                                Start free sweep
                            </Link>
                        </div>

                        {/* Professional */}
                        <div className="space-y-4 rounded-xl border border-primary/60 bg-primary/5 p-5 relative">
                            <div className="absolute -top-3 right-4">
                                <span className="rounded-full bg-primary px-3 py-1 text-[10px] font-medium text-primary-foreground shadow-lg">
                                    Beta Pricing
                                </span>
                            </div>

                            <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                                Professional
                            </p>

                            <div className="space-y-2">
                                <div className="flex items-baseline gap-3">
                                    <div>
                                        <div className="flex items-baseline gap-2">
                                            <p className="text-2xl font-semibold">$9.99</p>
                                            <span className="text-xs text-muted-foreground line-through">$12.99</span>
                                        </div>
                                        <p className="text-xs text-muted-foreground">/ month</p>
                                    </div>
                                </div>
                                <div className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-2 py-1.5 text-[10px]">
                                    <p className="font-medium text-emerald-200">Yearly: $95.88/year · Save ~20%</p>
                                    <p className="text-emerald-300/70">Lock in beta pricing forever</p>
                                </div>
                            </div>

                            <ul className="space-y-1.5 text-xs text-muted-foreground">
                                <li className="flex items-start gap-2">
                                    <CheckCircle className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                                    <span>Unlimited background sweeps</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                                    <span>See ALL accounts (not just 50)</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                                    <span>Full breach history with details</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                                    <span>Auto-detect new accounts over time</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                                    <span>GDPR/CCPA deletion templates</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                                    <span>Track deletion progress</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                                    <span>Email alerts for new breaches</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                                    <span>Priority support</span>
                                </li>
                            </ul>

                            <div className="space-y-3">
                                <Link
                                    href="/dashboard/billing?plan=monthly"
                                    className="inline-flex w-full items-center justify-center rounded-full bg-primary px-4 py-2.5 text-xs font-medium text-primary-foreground shadow-sm hover:opacity-90 transition"
                                >
                                    Upgrade to Professional
                                </Link>
                                <Link
                                    href="/dashboard/billing?plan=yearly"
                                    className="block text-center text-[11px] text-primary hover:underline"
                                >
                                    Or save 20% with yearly billing →
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Pricing FAQ */}
                    <div className="rounded-lg border border-white/10 bg-black/40 p-4 text-xs space-y-2">
                        <p className="font-medium">💰 About Beta Pricing</p>
                        <p className="text-muted-foreground">
                            Early adopters lock in $9.99/month forever—even after the public launch at $12.99/month. This is our way of thanking you for trusting us during beta. If you upgrade during beta, your rate never increases.
                        </p>
                    </div>
                </section>

                {/* FEATURE ROW */}
                <section className="space-y-4">
                    <h2 className="text-xl font-semibold tracking-tight">
                        Explore the GhostSweep toolkit
                    </h2>
                    <div className="grid gap-4 md:grid-cols-3 text-sm">
                        <Link
                            href="/home/breach-check"
                            className="group space-y-2 rounded-xl border border-white/10 bg-black/40 p-4 transition hover:border-primary/60 hover:bg-black/60"
                        >
                            <div className="flex items-center gap-2">
                                <AlertTriangle className="h-4 w-4 text-red-400" />
                                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                    Breach checker
                                </p>
                            </div>
                            <p className="text-sm font-medium text-foreground">
                                Check if your email was breached
                            </p>
                            <p className="text-xs text-muted-foreground">
                                See which data breaches exposed your email, when it happened, and what information was leaked. Free, no signup required.
                            </p>
                            <span className="inline-flex items-center gap-1 text-[11px] text-primary mt-1">
                                Try the breach checker
                                <ArrowRight className="h-3 w-3" />
                            </span>
                        </Link>

                        <Link
                            href="/home/blogs"
                            className="group space-y-2 rounded-xl border border-white/10 bg-black/40 p-4 transition hover:border-primary/60 hover:bg-black/60"
                        >
                            <div className="flex items-center gap-2">
                                <BookOpenText className="h-4 w-4 text-primary" />
                                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                    Blog
                                </p>
                            </div>
                            <p className="text-sm font-medium text-foreground">
                                Privacy guides and account deletion tips
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Step-by-step guides to delete Instagram, find all your accounts, and reduce your digital footprint.
                            </p>
                            <span className="inline-flex items-center gap-1 text-[11px] text-primary mt-1">
                                Read the blog
                                <ArrowRight className="h-3 w-3" />
                            </span>
                        </Link>

                        <Link
                            href="/home/security"
                            className="group space-y-2 rounded-xl border border-white/10 bg-black/40 p-4 transition hover:border-primary/60 hover:bg-black/60"
                        >
                            <div className="flex items-center gap-2">
                                <ShieldCheck className="h-4 w-4 text-primary" />
                                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                    Security & trust
                                </p>
                            </div>
                            <p className="text-sm font-medium text-foreground">
                                How GhostSweep protects your data
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Read about encryption, access controls, and our ongoing CASA security certification.
                            </p>
                            <span className="inline-flex items-center gap-1 text-[11px] text-primary mt-1">
                                View security details
                                <ArrowRight className="h-3 w-3" />
                            </span>
                        </Link>
                    </div>
                </section>

                {/* FAQ */}
                <section id="faq" className="space-y-6">
                    <div className="space-y-2">
                        <h2 className="text-xl font-semibold tracking-tight">
                            Frequently asked questions
                        </h2>
                        <p className="max-w-xl text-sm text-muted-foreground">
                            You're trusting us with email access. Here are the questions you should ask before connecting.
                        </p>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                        {faqs.map((item) => (
                            <div
                                key={item.q}
                                className="space-y-2 rounded-lg border border-white/10 bg-black/40 p-4 text-sm"
                            >
                                <p className="font-medium text-sm">{item.q}</p>
                                <p className="text-xs text-muted-foreground leading-relaxed">{item.a}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* ✅ NEW: FOUNDER STORY */}
                <section className="space-y-6">
                    <div className="space-y-2">
                        <h2 className="text-xl font-semibold tracking-tight">
                            Built by someone who needed it
                        </h2>
                    </div>

                    <div className="rounded-xl border border-white/10 bg-black/40 p-6">
                        <div className="flex flex-col md:flex-row gap-6">
                            {/* 
                            PLACEHOLDER: Your Photo
                            Professional headshot or casual photo
                            Square ratio, 200x200px minimum
                            Friendly, approachable look
                            */}
                            <div className="shrink-0">
                                <div className="h-24 w-24 rounded-full bg-linear-to-br from-primary/20 to-primary/5 border border-white/10 flex items-center justify-center">
                                    <span className="text-2xl">👤</span>
                                </div>
                            </div>

                            <div className="flex-1 space-y-3">
                                <div className="space-y-1">
                                    <p className="text-sm font-medium">Joel Komieter</p>
                                    <p className="text-xs text-muted-foreground">Founder, GhostSweep</p>
                                </div>

                                <div className="space-y-2 text-xs text-muted-foreground leading-relaxed">
                                    <p>
                                        "I got a breach notification at 2 AM for a service I'd forgotten I even signed up for.
                                    </p>
                                    <p>
                                        When I scanned my Gmail, I found 166 companies with my data. 8 of them had been breached. I had no idea.
                                    </p>
                                    <p>
                                        I built GhostSweep because I knew I wasn't the only one with this problem. Everyone I showed it to had the same reaction: 'I had no idea it was this many.'"
                                    </p>
                                </div>

                                <Link
                                    href="/home/blogs"
                                    className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline"
                                >
                                    Read the full story
                                    <ArrowRight className="h-3 w-3" />
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>

                {/* WAITLIST SECTION */}
                <section className="space-y-4">
                    <div className="rounded-xl border border-white/10 bg-black/40 p-5">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <p className="text-xs font-medium text-muted-foreground">
                                    Not ready yet?
                                </p>
                                <h3 className="text-lg font-semibold">
                                    Join the waitlist for updates
                                </h3>
                                <p className="text-xs text-muted-foreground max-w-xl">
                                    Get notified when we complete CASA security certification, launch new features, and share privacy tips. No spam, just important updates.
                                </p>
                            </div>

                            <form
                                onSubmit={joinWaitlist}
                                className="flex flex-col gap-3 sm:flex-row sm:items-center"
                            >
                                <input
                                    name="email"
                                    type="email"
                                    required
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="flex-1 rounded-full border border-white/15 bg-black/60 px-4 py-2 text-xs outline-none focus-visible:ring-1 focus-visible:ring-primary"
                                />
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="inline-flex items-center justify-center rounded-full bg-white px-5 py-2 text-xs font-medium text-black hover:bg-zinc-200 transition disabled:opacity-50"
                                >
                                    {isLoading ? <Spinner className="text-black" /> : "Join waitlist"}
                                </button>
                            </form>
                        </div>
                    </div>
                </section>

                {/* Final CTA */}
                <section className="space-y-4 rounded-xl border border-primary/60 bg-primary/5 p-6">
                    <h2 className="text-lg font-semibold tracking-tight">
                        Ready to see your digital footprint?
                    </h2>
                    <p className="max-w-xl text-sm text-muted-foreground">
                        Connect your inbox and let GhostSweep run a deep background scan to discover every account you've ever created. We'll notify you when your report is ready so you can see breaches, delete what you don&apos;t need, and take back control.
                    </p>
                    <div className="flex flex-wrap items-center gap-4">
                        <Link
                            href="/login"
                            className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-xs font-medium text-primary-foreground shadow-sm hover:opacity-90 transition"
                        >
                            Start your free sweep
                            <ArrowRight className="h-3 w-3" />
                        </Link>
                        <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                            <span className="flex items-center gap-1">
                                <CheckCircle className="h-3 w-3 text-primary" />
                                No credit card required
                            </span>
                            <span className="flex items-center gap-1">
                                <CheckCircle className="h-3 w-3 text-primary" />
                                Disconnect anytime
                            </span>
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="border-t border-border/60 pt-6 text-[11px] text-muted-foreground">
                    <div className="flex flex-col gap-4 md:flex-row md:justify-between">
                        <p>© {new Date().getFullYear()} GhostSweep. All rights reserved.</p>
                        <div className="flex flex-wrap gap-4">
                            <Link
                                href="/home/privacy"
                                className="hover:text-foreground transition-colors"
                            >
                                Privacy Policy
                            </Link>
                            <Link
                                href="/home/terms"
                                className="hover:text-foreground transition-colors"
                            >
                                Terms
                            </Link>
                            <Link
                                href="/home/security"
                                className="hover:text-foreground transition-colors"
                            >
                                Security
                            </Link>
                            <Link
                                href="mailto:support@ghostsweep.com"
                                className="hover:text-foreground transition-colors"
                            >
                                Support
                            </Link>
                        </div>
                    </div>
                </footer>
            </div >
        </main >
        </>
    );
}
