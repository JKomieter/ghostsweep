/* eslint-disable react/no-unescaped-entities */
"use client"

import {
    ShieldCheck,
    EyeOff,
    Lock,
    ArrowRight,
    PlayCircle,
    CheckCircle,
    X,
    Github,
    Check,
} from "lucide-react"
import { useRef, useState } from "react"
import Link from "next/link"
import Image from "next/image"

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
        a: "You can disconnect from GhostSweep settings or directly from your Google account in a few clicks.",
    },
    {
        q: "Do you sell my data?",
        a: "No. We don’t run ads, we don’t track you across the web, and we don’t sell or share your data.",
    },
]

const trustItems = [
    {
        icon: EyeOff,
        title: "Metadata only",
        desc: "We only see sender, subject and timestamps. Never email content or attachments.",
        link: null as string | null,
    },
    {
        icon: ShieldCheck,
        title: "CASA in progress",
        desc: "We’re going through Google’s CASA security review to meet their highest standards.",
        link: null as string | null,
    },
    {
        icon: Github,
        title: "Open-source core",
        desc: "Key scanning logic is on GitHub so you can inspect how it works.",
        link: "https://github.com/JKomieter/ghostsweep-api.git",
    },
    {
        icon: Lock,
        title: "Easy revoke",
        desc: "Revoke access at any time. No dark patterns, no lock-in.",
        link: null as string | null,
    },
    {
        icon: CheckCircle,
        title: "Read-only access",
        desc: "We never get permission to send, delete, or modify emails.",
        link: null as string | null,
    },
    {
        icon: CheckCircle,
        title: "Built by a real person",
        desc: "Questions or concerns? Email Joel directly.",
        link: "mailto:komieterj@gmail.com",
    },
]

export default function HomePage() {
    const [showVideo, setShowVideo] = useState(false)
    const videoRef = useRef<HTMLVideoElement | null>(null)
    const [lightbox, setLightbox] = useState<{ src: string; alt: string } | null>(null)

    const handlePlay = () => {
        setShowVideo(true)
        setTimeout(() => {
            videoRef.current?.play().catch(() => { })
        }, 0)
    }

    return (
        <>
            {/* LIGHTBOX */}
            {lightbox && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
                    onClick={() => setLightbox(null)}
                >
                    <div
                        className="relative w-full max-w-6xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            type="button"
                            className="absolute -top-10 right-0 flex items-center gap-2 text-xs text-zinc-300 hover:text-white"
                            onClick={() => setLightbox(null)}
                        >
                            <X className="h-4 w-4" />
                            <span>Close</span>
                        </button>

                        <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-white/10 bg-black">
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

            <main className="min-h-screen bg-gradient-to-b from-[#020308] via-black to-[#050608] text-foreground">
                <div className="mx-auto max-w-6xl px-4 pb-20 pt-10 space-y-16 md:space-y-20">

                    {/* HERO */}
                    <section className="space-y-10">
                        {/* Badge */}
                        <div className="flex justify-center">
                            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] text-zinc-300">
                                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                                <span>Privacy-first · Read-only Gmail · CASA security in progress</span>
                            </div>
                        </div>

                        {/* Headline */}
                        <div className="mx-auto max-w-3xl space-y-4 text-center">
                            <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl md:text-5xl">
                                You have 200+ accounts online.
                                <br />
                                <span className="text-zinc-300">You remember maybe 30.</span>
                            </h1>
                            <p className="text-sm text-zinc-400 sm:text-base">
                                GhostSweep scans your Gmail in read-only mode, finds every account tied to
                                your inbox, and shows you what can be safely deleted.
                            </p>
                        </div>

                        {/* CTAs */}
                        <div className="flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
                            <Link
                                href="/login"
                                className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-2.5 text-sm font-medium text-black shadow-sm hover:bg-zinc-100 transition"
                            >
                                Start free scan
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                            <Link
                                href="/home/how-it-works"
                                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 py-2.5 text-sm text-zinc-100 hover:bg-white/10 transition"
                            >
                                How it works
                            </Link>
                        </div>

                        {/* Trust microcopy */}
                        <div className="flex flex-wrap justify-center gap-4 text-[11px] text-zinc-400">
                            <span className="inline-flex items-center gap-1">
                                <Check className="h-3 w-3 text-emerald-400" />
                                Read-only Gmail access
                            </span>
                            <span className="inline-flex items-center gap-1">
                                <Check className="h-3 w-3 text-emerald-400" />
                                Never reads email content
                            </span>
                            <span className="inline-flex items-center gap-1">
                                <Check className="h-3 w-3 text-emerald-400" />
                                Disconnect any time
                            </span>
                        </div>
                    </section>

                    {/* HERO VIDEO / IMAGE */}
                    <section>
                        <div className="rounded-2xl border border-white/10 bg-[#050509] p-3">
                            <div className="relative aspect-video overflow-hidden rounded-xl border border-white/10 bg-black">
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
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                                            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-black shadow-lg group-hover:scale-105 transition-transform">
                                                <PlayCircle className="h-7 w-7" />
                                            </div>
                                            <p className="text-xs text-zinc-100">
                                                Watch the dashboard in action
                                            </p>
                                        </div>
                                    </button>
                                )}
                            </div>
                        </div>
                    </section>

                    {/* STATS */}
                    <section className="rounded-2xl border border-white/10 bg-[#050509] px-4 py-6 sm:px-6 sm:py-8">
                        <div className="grid gap-6 sm:grid-cols-4">
                            <div className="text-center space-y-1">
                                <p className="text-2xl font-semibold text-white sm:text-3xl">156</p>
                                <p className="text-[11px] text-zinc-400">Average accounts found</p>
                            </div>
                            <div className="text-center space-y-1">
                                <p className="text-2xl font-semibold text-white sm:text-3xl">59%</p>
                                <p className="text-[11px] text-zinc-400">Accounts people forgot about</p>
                            </div>
                            <div className="text-center space-y-1">
                                <p className="text-2xl font-semibold text-red-400 sm:text-3xl">73%</p>
                                <p className="text-[11px] text-zinc-400">Have been in at least one breach</p>
                            </div>
                            <div className="text-center space-y-1">
                                <p className="text-2xl font-semibold text-white sm:text-3xl">5 min</p>
                                <p className="text-[11px] text-zinc-400">Typical scan time</p>
                            </div>
                        </div>
                    </section>

                    {/* TRUST / SECURITY */}
                    <section className="space-y-6">
                        <div className="space-y-2 text-center">
                            <h2 className="text-xl font-semibold text-white sm:text-2xl">
                                Security and trust, explained plainly
                            </h2>
                            <p className="mx-auto max-w-2xl text-sm text-zinc-400">
                                You’re giving us limited access to your inbox. We treat that like production,
                                not a side project.
                            </p>
                        </div>

                        <div className="grid gap-4 md:grid-cols-3">
                            {trustItems.map((item) => (
                                <div
                                    key={item.title}
                                    className="space-y-3 rounded-xl border border-white/10 bg-[#050509] p-4"
                                >
                                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10">
                                        <item.icon className="h-4 w-4 text-emerald-400" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium text-white">{item.title}</p>
                                        <p className="text-xs text-zinc-400">{item.desc}</p>
                                        {item.link && (
                                            <Link
                                                href={item.link}
                                                target="_blank"
                                                className="inline-flex items-center gap-1 text-[11px] text-emerald-300 hover:text-emerald-200"
                                            >
                                                {item.icon === Github ? "View on GitHub" : "Email Joel"}
                                                <ArrowRight className="h-3 w-3" />
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="text-center">
                            <Link
                                href="/home/security"
                                className="inline-flex items-center gap-1 text-xs text-zinc-300 hover:text-white"
                            >
                                Read the full security overview
                                <ArrowRight className="h-3 w-3" />
                            </Link>
                        </div>
                    </section>

                    {/* LARGE PREVIEW */}
                    <section className="space-y-4">
                        <div className="space-y-1 text-center">
                            <h2 className="text-xl font-semibold text-white sm:text-2xl">
                                See your accounts in one place
                            </h2>
                            <p className="text-sm text-zinc-400">
                                Real screenshots from the GhostSweep dashboard.
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={() =>
                                setLightbox({
                                    src: "https://ghostsweep.t3.storage.dev/Screenshot%202025-11-29%20at%202.34.51%E2%80%AFAM.png",
                                    alt: "GhostSweep dashboard",
                                })
                            }
                            className="group block w-full rounded-2xl border border-white/10 bg-[#050509] p-3 text-left"
                        >
                            <div className="relative aspect-video overflow-hidden rounded-xl border border-white/10 bg-black">
                                <Image
                                    src="https://ghostsweep.t3.storage.dev/Screenshot%202025-12-06%20at%202.47.39%E2%80%AFAM.png"
                                    alt="GhostSweep dashboard"
                                    fill
                                    className="object-cover group-hover:scale-[1.02] transition-transform"
                                    priority
                                />
                                <div className="pointer-events-none absolute inset-0 flex items-end justify-end p-3">
                                    <div className="rounded-full bg-black/70 px-3 py-1 text-[11px] text-zinc-100 border border-white/10">
                                        Click to enlarge
                                    </div>
                                </div>
                            </div>
                        </button>
                    </section>

                    {/* PRICING */}
                    <section className="space-y-6">
                        <div className="space-y-2 text-center">
                            <h2 className="text-xl font-semibold text-white sm:text-2xl">
                                Simple, transparent pricing
                            </h2>
                            <p className="text-sm text-zinc-400">
                                Start free. Upgrade only if you need ongoing monitoring and deletion tools.
                            </p>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            {/* Free */}
                            <div className="space-y-5 rounded-xl border border-white/10 bg-[#050509] p-6">
                                <div className="space-y-2">
                                    <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                                        Free
                                    </p>
                                    <div className="flex items-baseline gap-1">
                                        <p className="text-3xl font-semibold text-white">$0</p>
                                        <span className="text-xs text-zinc-400">forever</span>
                                    </div>
                                </div>
                                <ul className="space-y-2 text-sm text-zinc-300">
                                    <li className="flex items-start gap-2">
                                        <CheckCircle className="mt-0.5 h-3.5 w-3.5 text-emerald-400" />
                                        <span>One background scan</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <CheckCircle className="mt-0.5 h-3.5 w-3.5 text-emerald-400" />
                                        <span>See first 50 accounts</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <CheckCircle className="mt-0.5 h-3.5 w-3.5 text-emerald-400" />
                                        <span>Basic breach detection</span>
                                    </li>
                                </ul>
                                <Link
                                    href="/login"
                                    className="mt-2 inline-flex w-full items-center justify-center rounded-full border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-medium text-zinc-50 hover:bg-white/10 transition"
                                >
                                    Start free
                                </Link>
                            </div>

                            {/* Pro */}
                            <div className="space-y-5 rounded-xl border border-emerald-500/40 bg-emerald-500/5 p-6">
                                <div className="space-y-2">
                                    <p className="text-xs font-semibold uppercase tracking-wide text-emerald-300">
                                        Professional · Beta
                                    </p>
                                    <div className="flex flex-wrap items-baseline gap-2">
                                        <p className="text-3xl font-semibold text-white">$9.99</p>
                                        <span className="text-xs text-zinc-400 line-through">$12.99</span>
                                        <span className="text-xs text-zinc-300">/month</span>
                                    </div>
                                    <p className="text-xs text-emerald-300">
                                        Lock in beta pricing. Your rate doesn’t increase later.
                                    </p>
                                </div>
                                <ul className="space-y-2 text-sm text-zinc-200">
                                    <li className="flex items-start gap-2">
                                        <CheckCircle className="mt-0.5 h-3.5 w-3.5 text-emerald-400" />
                                        <span>Unlimited scans</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <CheckCircle className="mt-0.5 h-3.5 w-3.5 text-emerald-400" />
                                        <span>See all accounts</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <CheckCircle className="mt-0.5 h-3.5 w-3.5 text-emerald-400" />
                                        <span>Full breach history</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <CheckCircle className="mt-0.5 h-3.5 w-3.5 text-emerald-400" />
                                        <span>GDPR/CCPA deletion templates</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <CheckCircle className="mt-0.5 h-3.5 w-3.5 text-emerald-400" />
                                        <span>Ongoing monitoring & alerts</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <CheckCircle className="mt-0.5 h-3.5 w-3.5 text-emerald-400" />
                                        <span>Priority support</span>
                                    </li>
                                </ul>
                                <Link
                                    href="/dashboard/billing?plan=monthly"
                                    className="mt-2 inline-flex w-full items-center justify-center rounded-full bg-white px-4 py-2.5 text-sm font-medium text-black hover:bg-zinc-100 transition"
                                >
                                    Upgrade to Pro
                                </Link>
                            </div>
                        </div>
                    </section>

                    {/* FAQ */}
                    <section className="space-y-6">
                        <div className="space-y-2 text-center">
                            <h2 className="text-xl font-semibold text-white sm:text-2xl">
                                Frequently asked questions
                            </h2>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            {faqs.map((item) => (
                                <div
                                    key={item.q}
                                    className="space-y-2 rounded-xl border border-white/10 bg-[#050509] p-4"
                                >
                                    <p className="text-sm font-medium text-white">{item.q}</p>
                                    <p className="text-xs text-zinc-400">{item.a}</p>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* FINAL CTA */}
                    <section className="space-y-4 rounded-xl border border-white/15 bg-[#050509] p-6 text-center">
                        <h2 className="text-lg font-semibold text-white sm:text-xl">
                            Ready to see your digital footprint?
                        </h2>
                        <p className="mx-auto max-w-xl text-sm text-zinc-400">
                            Connect your inbox and let GhostSweep map every account tied to your email in
                            a few minutes.
                        </p>
                        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
                            <Link
                                href="/login"
                                className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-2.5 text-sm font-medium text-black hover:bg-zinc-100 transition"
                            >
                                Start free scan
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                            <div className="flex flex-wrap items-center justify-center gap-3 text-[11px] text-zinc-400">
                                <span className="inline-flex items-center gap-1">
                                    <Check className="h-3 w-3 text-emerald-400" />
                                    No credit card required
                                </span>
                                <span className="inline-flex items-center gap-1">
                                    <Check className="h-3 w-3 text-emerald-400" />
                                    5-minute setup
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
                                <Link
                                    href="mailto:support@ghostsweep.com"
                                    className="hover:text-zinc-300 transition"
                                >
                                    Contact
                                </Link>
                            </div>
                        </div>
                    </footer>
                </div>
            </main>
        </>
    )
}