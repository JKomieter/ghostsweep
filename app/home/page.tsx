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
} from "lucide-react";
import { FormEvent, useRef, useState } from "react";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import Image from "next/image";

const faqs = [
    {
        q: "Do you read my emails?",
        a: "No. GhostSweep never accesses the content of your emails. We only read Gmail metadata such as sender, subject line, and timestamps.",
    },
    {
        q: "Can GhostSweep send or delete emails?",
        a: "No. We use Gmail's read-only permission. GhostSweep cannot send, modify, or delete any email in your account.",
    },
    {
        q: "What happens if I disconnect my Gmail?",
        a: "GhostSweep instantly loses access to your account. You stay in full control and can revoke access at any time from your Google account settings.",
    },
    {
        q: "Can I delete my sweep history?",
        a: "Yes. You can permanently delete your detected services, breaches, and scan events with a single click from the privacy tools.",
    },
    {
        q: "Do you sell or share my data?",
        a: "Never. We don’t run ads, we don’t track you across the web, and we don’t sell or share your data with third parties.",
    },
];

export default function HomePage() {
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false)
    const [showVideo, setShowVideo] = useState(false);
    const videoRef = useRef<HTMLVideoElement | null>(null);

    const handlePlay = () => {
        setShowVideo(true);
        // let the video render, then play
        setTimeout(() => {
            videoRef.current?.play().catch(() => {
                // autoplay might be blocked, user can hit play manually
            });
        }, 0);
    };

    const joinWaitlist = async (e: FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        try {
            await fetch("/api/waitlist", {
                method: "POST",
                body: JSON.stringify({ email })
            })
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
            toast.error("There was a problem joining waitlist. Please try again later")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <main className="min-h-screen bg-background text-foreground">

            <div className="mx-auto max-w-6xl px-4 pb-16 pt-10 space-y-16">
                {/* HERO + VIDEO + WAITLIST */}
                <section className="space-y-8">
                    <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] text-muted-foreground">
                        <span className="relative inline-flex h-2.5 w-2.5 items-center justify-center">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/40" />
                            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
                        </span>
                        Privacy-first inbox scan for your entire digital footprint
                    </div>

                    <div className="grid gap-8 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] md:items-start">
                        {/* Left: copy + CTAs + waitlist */}
                        <div className="space-y-6">
                            <div className="space-y-4">
                                <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                                    You have 200+ accounts online.
                                    <br />
                                    You remember maybe 30.
                                </h1>
                                <p className="max-w-xl text-sm text-muted-foreground">
                                    GhostSweep scans your inbox to discover every account you&apos;ve ever created—
                                    streaming services, old social media, forgotten subscriptions. See which
                                    ones were breached, then delete what you don&apos;t need.
                                </p>
                            </div>

                            <div className="flex flex-wrap items-center gap-3">
                                <Link
                                    href="/login"
                                    className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-xs font-medium text-primary-foreground shadow-sm hover:opacity-90 transition"
                                >
                                    Start free scan
                                    <ArrowRight className="h-3 w-3" />
                                </Link>
                                <Link
                                    href="/login"
                                    className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    Already have an account? <span className="underline">Log in</span>
                                </Link>
                            </div>

                            {/* Waitlist */}
                            <div className="mt-4 rounded-xl border border-white/10 bg-black/40 p-3">
                                <p className="text-[11px] font-medium text-muted-foreground mb-2">
                                    Not ready yet?
                                </p>
                                <p className="text-[11px] text-muted-foreground mb-2">
                                    Get notified when we complete CASA security certification and launch
                                    new features. No spam, just important updates
                                </p>
                                <form
                                    onSubmit={joinWaitlist}
                                    className="flex flex-col gap-2 sm:flex-row"
                                >
                                    <input
                                        name="email"
                                        type="email"
                                        required
                                        placeholder="you@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="flex-1 rounded-full border border-white/15 bg-black/60 px-3 py-1.5 text-xs outline-none focus-visible:ring-1 focus-visible:ring-primary"
                                    />
                                    <button
                                        type="submit"
                                        className="inline-flex items-center justify-center rounded-full bg-white px-3 py-1.5 text-[11px] font-medium text-black hover:bg-zinc-200 transition resize-none"
                                    >
                                        {isLoading ? <Spinner className="text-black" /> : "Join waitlist"}
                                    </button>
                                </form>
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

                        {/* Right: video demo / fake player */}
                        <div className="rounded-2xl border border-white/10 bg-[#050505] p-3 shadow-lg">
                            <div className="relative aspect-video overflow-hidden rounded-xl border border-white/10 bg-black/60">
                                {showVideo ? (
                                    <video
                                        ref={videoRef}
                                        src="https://ghostsweep.t3.storage.dev/GhostSweep%20First%20Demo%20Video.mov"
                                        controls
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <button
                                        type="button"
                                        onClick={handlePlay}
                                        className="group relative h-full w-full"
                                    >
                                        {/* Thumbnail image */}
                                        <Image
                                            src="https://ghostsweep.t3.storage.dev/Screenshot%202025-11-29%20at%202.34.51%E2%80%AFAM.png"
                                            alt="GhostSweep product demo"
                                            className="h-full w-full object-cover"
                                            width={100}
                                            height={100}
                                        />

                                        {/* Dark overlay */}
                                        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors" />

                                        {/* Play button + text */}
                                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/90 text-black shadow-lg group-hover:scale-105 transition-transform">
                                                <PlayCircle className="h-6 w-6" />
                                            </div>
                                            <p className="text-xs text-white/80">
                                                Watch the GhostSweep dashboard in action
                                            </p>
                                        </div>
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </section>

                {/* HOW IT WORKS TEASER (with link to full page) */}
                <section id="how" className="space-y-6">
                    <div className="flex flex-wrap items-baseline justify-between gap-3">
                        <div className="space-y-2">
                            <h2 className="text-xl font-semibold tracking-tight">
                                How it works: 4 steps to map your footprint
                            </h2>
                            <p className="max-w-xl text-sm text-muted-foreground">
                                GhostSweep connects to your Gmail with read-only access,
                                analyzes metadata only, and turns your inbox into a map of your
                                accounts, breaches, and privacy risk.
                            </p>
                        </div>
                        <Link
                            href="/home/how-it-works"
                            className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                        >
                            See full “How it works”
                            <ArrowRight className="h-3 w-3" />
                        </Link>
                    </div>

                    <div className="grid gap-4 text-sm md:grid-cols-4">
                        <div className="space-y-2 rounded-lg border border-white/10 bg-black/40 p-3">
                            <p className="text-[11px] font-semibold text-muted-foreground">
                                1. Connect your Gmail
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Read-only access via Google OAuth. We can&apos;t send, delete, or
                                modify any emails. You stay in control.
                            </p>
                        </div>
                        <div className="space-y-2 rounded-lg border border-white/10 bg-black/40 p-3">
                            <p className="text-[11px] font-semibold text-muted-foreground">
                                2. We scan metadata only
                            </p>
                            <p className="text-xs text-muted-foreground">
                                We analyze sender, subject, and timestamps—never email bodies or
                                attachments. Find accounts from receipts, confirmations, and alerts.
                            </p>
                        </div>
                        <div className="space-y-2 rounded-lg border border-white/10 bg-black/40 p-3">
                            <p className="text-[11px] font-semibold text-muted-foreground">
                                3. See all your accounts
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Every service you&apos;ve signed up for, which ones were breached,
                                and when. Average user discovers 200+ accounts.
                            </p>
                        </div>
                        <div className="space-y-2 rounded-lg border border-white/10 bg-black/40 p-3">
                            <p className="text-[11px] font-semibold text-muted-foreground">
                                4. Clean up your footprint
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Get deletion request templates, track responses, and monitor for
                                new accounts. (Professional plan)
                            </p>
                        </div>
                    </div>
                </section>

                {/* FEATURE ROW: Check breaches / Blog / Security */}
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
                                See which data breaches exposed your email, when it happened,
                                and what information was leaked. Free, no signup required.
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
                                How to delete accounts and reduce your footprint
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Step-by-step guides to delete Facebook, Instagram, Twitter, and
                                200+ services. Plus: what to do after a breach.
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
                                Read about encryption, access controls, and our ongoing CASA
                                security certification (in progress).
                            </p>
                            <span className="inline-flex items-center gap-1 text-[11px] text-primary mt-1">
                                View security details
                                <ArrowRight className="h-3 w-3" />
                            </span>
                        </Link>
                    </div>
                </section>

                {/* SECURITY SNIPPET (with CASA mention) */}
                <section id="security" className="space-y-6">
                    <div className="space-y-2">
                        <h2 className="text-xl font-semibold tracking-tight">
                            Security and privacy are non-negotiable
                        </h2>
                        <p className="max-w-xl text-sm text-muted-foreground">
                            We only access what&lsquo;s absolutely necessary to answer one question:
                            Where does your data live?{" "}
                            <span className="font-medium text-foreground">
                                Nothing more.
                            </span>
                            .
                        </p>
                    </div>

                    <div className="grid gap-4 text-xs md:grid-cols-3">
                        <div className="space-y-2 rounded-lg border border-white/10 bg-black/40 p-3">
                            <div className="flex items-center gap-2">
                                <EyeOff className="h-3 w-3 text-primary" />
                                <p className="font-medium">No email content, ever</p>
                            </div>
                            <p className="text-muted-foreground">
                                GhostSweep only uses metadata (From, Subject, Date) to infer
                                accounts and breaches. Bodies and attachments are never stored
                                or indexed.
                            </p>
                        </div>
                        <div className="space-y-2 rounded-lg border border-white/10 bg-black/40 p-3">
                            <div className="flex items-center gap-2">
                                <Lock className="h-3 w-3 text-primary" />
                                <p className="font-medium">Encrypted tokens & easy revoke</p>
                            </div>
                            <p className="text-muted-foreground">
                                OAuth tokens are encrypted at rest. You can disconnect
                                GhostSweep from your Google account at any time.
                            </p>
                        </div>
                        <div className="space-y-2 rounded-lg border border-white/10 bg-black/40 p-3">
                            <div className="flex items-center gap-2">
                                <Trash2 className="h-3 w-3 text-primary" />
                                <p className="font-medium">Delete your footprint with one click</p>
                            </div>
                            <p className="text-muted-foreground">
                                Remove your sweep results, breaches, and linked services from
                                GhostSweep whenever you choose — no dark patterns.
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
                        <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/5 px-2.5 py-1">
                            <Activity className="h-3 w-3 text-emerald-400" />
                            CASA application: <span className="font-medium">In progress</span>
                        </span>
                        <Link
                            href="/home/security"
                            className="text-[11px] text-primary hover:underline"
                        >
                            Read the full security overview →
                        </Link>
                    </div>
                </section>

                {/* PRICING: Free vs Professional */}
                <section id="pricing" className="space-y-6">
                    <div className="space-y-2">
                        <h2 className="text-xl font-semibold tracking-tight">
                            Try free. Upgrade when you&apos;re ready.
                        </h2>
                        <p className="max-w-xl text-sm text-muted-foreground">
                            Free plan shows you what accounts exist. Professional plan helps
                            you track breaches, monitor new accounts, and clean everything up.
                        </p>
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
                            <ul className="space-y-1 text-xs text-muted-foreground">
                                <li>• Scan your inbox once</li>
                                <li>• See up to 15 accounts</li>
                                <li>• Basic breach check (yes/no only)</li>
                                <li>• No ongoing monitoring</li>
                                <li>• No deletion tracking</li>
                            </ul>
                            <Link
                                href="/login"
                                className="inline-flex items-center justify-center rounded-full border border-white/20 px-4 py-2 text-xs font-medium hover:bg-white/5 transition"
                            >
                                Start free scan
                            </Link>
                        </div>

                        {/* Professional */}
                        <div className="space-y-4 rounded-xl border border-primary/60 bg-primary/5 p-5">
                            <div className="flex items-center justify-between">
                                <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                                    Professional
                                </p>
                                <span className="rounded-full bg-primary/15 px-2.5 py-0.5 text-[10px] font-medium text-primary-foreground/90">
                                    Most popular
                                </span>
                            </div>
                            <div className="flex items-baseline gap-3">
                                <div>
                                    <p className="text-2xl font-semibold">$9.99</p>
                                    <p className="text-xs text-muted-foreground"> / month</p>
                                </div>
                                <div className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-2 py-1 text-[10px]">
                                    Yearly: <span className="font-semibold">$95.88 / year</span>{" "}
                                    · Save ~20%
                                </div>
                            </div>
                            <ul className="space-y-1 text-xs text-muted-foreground">
                                <li>• Unlimited inbox scans</li>
                                <li>• See ALL accounts (not just 50)</li>
                                <li>• Full breach history with details</li>
                                <li>• Auto-detect new accounts</li>
                                <li>• Deletion request templates</li>
                                <li>• Track deletion progress</li>
                                <li>• Email alerts for new breaches</li>
                            </ul>
                            <div className="flex flex-wrap items-center gap-3">
                                <Link
                                    href="/dashboard/billing?plan=monthly"
                                    className="inline-flex items-center justify-center rounded-full bg-primary px-4 py-2 text-xs font-medium text-primary-foreground shadow-sm hover:opacity-90 transition"
                                >
                                    Upgrade to Professional
                                </Link>
                                <Link
                                    href="/dashboard/billing?plan=yearly"
                                    className="text-[11px] text-primary hover:underline"
                                >
                                    Or choose yearly and save →
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>

                {/* FAQ */}
                <section id="faq" className="space-y-6">
                    <div className="space-y-2">
                        <h2 className="text-xl font-semibold tracking-tight">
                            Frequently asked questions
                        </h2>
                        <p className="max-w-xl text-sm text-muted-foreground">
                            You&apos;re trusting us with email access. Here are the questions you
                            should ask before connecting.
                        </p>
                    </div>
                    <div className="space-y-4">
                        {faqs.map((item) => (
                            <div
                                key={item.q}
                                className="space-y-1 rounded-lg border border-white/10 bg-black/40 p-3 text-sm"
                            >
                                <p className="font-medium">{item.q}</p>
                                <p className="text-xs text-muted-foreground">{item.a}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Final CTA */}
                <section className="space-y-4 rounded-xl border border-white/10 bg-black/40 p-5">
                    <h2 className="text-lg font-semibold tracking-tight">
                        Ready to see your digital footprint?
                    </h2>
                    <p className="max-w-xl text-sm text-muted-foreground">
                        Connect your inbox, scan in minutes, and discover every account
                        you&apos;ve ever created. See breaches, delete what you don&apos;t need,
                        and take back control.
                    </p>
                    <div className="flex flex-wrap items-center gap-3">
                        <Link
                            href="/login"
                            className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-xs font-medium text-primary-foreground shadow-sm hover:opacity-90 transition"
                        >
                            Start your free scan
                            <ArrowRight className="h-3 w-3" />
                        </Link>
                        <span className="text-[11px] text-muted-foreground">
                            No email content read. Disconnect and delete data anytime.
                        </span>
                    </div>
                </section>

                {/* Footer */}
                <footer className="border-t border-border/60 pt-4 text-[11px] text-muted-foreground flex flex-wrap justify-between gap-2">
                    <p>© {new Date().getFullYear()} GhostSweep. All rights reserved.</p>
                    <div className="flex gap-4">
                        <Link
                            href="/home//privacy"
                            className="hover:text-foreground transition-colors"
                        >
                            Privacy Policy
                        </Link>
                        <Link
                            href="/home//terms"
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
                        <a
                            href="mailto:support@ghostsweep.com"
                            className="hover:text-foreground transition-colors"
                        >
                            Support
                        </a>
                    </div>
                </footer>
            </div>
        </main>
    );
}