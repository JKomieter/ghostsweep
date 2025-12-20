"use client"

import {
    ShieldCheck,
    EyeOff,
    Lock,
    ArrowRight,
    PlayCircle,
    CheckCircle,
    X,
    Check,
    Bell,
    Send,
    Search,
    FileWarning,
} from "lucide-react"
import { useRef, useState } from "react"
import Link from "next/link"
import Image from "next/image"

const CASA_URL: string | null = null

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
]

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
        title: "Google-approved OAuth",
        desc: "We use Google's official OAuth system, which shows you exactly what permissions we request before you grant access.",
        linkText: null as string | null,
        linkHref: null as string | null,
    },
    {
        icon: CheckCircle,
        title: "You preview everything",
        desc: "Every deletion email is shown to you before it's sent. You approve each one individually or in bulk. No surprises.",
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
                    <div className="relative w-full max-w-6xl" onClick={(e) => e.stopPropagation()}>
                        <button
                            type="button"
                            className="absolute -top-10 right-0 flex items-center gap-2 text-xs text-zinc-300 hover:text-white"
                            onClick={() => setLightbox(null)}
                        >
                            <X className="h-4 w-4" />
                            <span>Close</span>
                        </button>

                        <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-white/10 bg-black">
                            <Image src={lightbox.src} alt={lightbox.alt} fill className="object-contain" />
                        </div>
                    </div>
                </div>
            )}

            <main className="min-h-screen bg-linear-to-b from-[#020308] via-black to-[#050608] text-foreground">
                <div className="mx-auto max-w-6xl px-4 pb-20 pt-10 space-y-16 md:space-y-20">
                    {/* HERO */}
                    <section className="space-y-10">
                        <div className="flex justify-center">
                            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] text-zinc-300">
                                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                                <span>Privacy-first · Gmail metadata scanning · Revocable access</span>
                            </div>
                        </div>

                        <div className="mx-auto max-w-3xl space-y-4 text-center">
                            <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl md:text-5xl">
                                See your digital footprint.
                                <br />
                                <span className="text-zinc-300">Then delete what you don&apos;t want.</span>
                            </h1>
                            <p className="text-sm text-zinc-400 sm:text-base">
                                GhostSweep scans Gmail in a privacy-aware way to detect the services you&apos;ve signed up for. On Pro, it
                                helps you send deletion requests, track replies, and follow up automatically.
                            </p>
                        </div>

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

                        <div className="flex flex-wrap justify-center gap-4 text-[11px] text-zinc-400">
                            <span className="inline-flex items-center gap-1">
                                <Check className="h-3 w-3 text-emerald-400" />
                                No email body or attachments
                            </span>
                            <span className="inline-flex items-center gap-1">
                                <Check className="h-3 w-3 text-emerald-400" />
                                Access is revocable anytime
                            </span>
                            <span className="inline-flex items-center gap-1">
                                <Check className="h-3 w-3 text-emerald-400" />
                                You preview & approve every email
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
                                    <button type="button" onClick={handlePlay} className="group relative h-full w-full">
                                        <Image
                                            src="https://ghostsweep.t3.storage.dev/Screenshot%202025-11-29%20at%202.34.51%E2%80%AFAM.png"
                                            alt="GhostSweep preview"
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
                                            <p className="text-xs text-zinc-100">Watch how it works</p>
                                        </div>
                                    </button>
                                )}
                            </div>
                        </div>
                    </section>

                    {/* WHAT YOU GET */}
                    <section className="space-y-6">
                        <div className="space-y-2 text-center">
                            <h2 className="text-xl font-semibold text-white sm:text-2xl">What GhostSweep does</h2>
                            <p className="mx-auto max-w-2xl text-sm text-zinc-400">
                                Scan your Gmail for signup emails, see which services you&apos;ve created accounts with, and send deletion requests—all while keeping your inbox private.
                            </p>
                        </div>

                        <div className="grid gap-4 md:grid-cols-3">
                            <div className="space-y-3 rounded-xl border border-white/10 bg-[#050509] p-4">
                                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5">
                                    <Search className="h-4 w-4 text-zinc-200" />
                                </div>
                                <p className="text-sm font-medium text-white">Account detection</p>
                                <p className="text-xs text-zinc-400">
                                    Detect services tied to your inbox using metadata signals, then group them into one view.
                                </p>
                            </div>

                            <div className="space-y-3 rounded-xl border border-white/10 bg-[#050509] p-4">
                                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5">
                                    <FileWarning className="h-4 w-4 text-zinc-200" />
                                </div>
                                <p className="text-sm font-medium text-white">Breach visibility (Pro)</p>
                                <p className="text-xs text-zinc-400">
                                    See breach indicators and prioritize which accounts to clean up first.
                                </p>
                            </div>

                            <div className="space-y-3 rounded-xl border border-white/10 bg-[#050509] p-4">
                                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5">
                                    <Send className="h-4 w-4 text-zinc-200" />
                                </div>
                                <p className="text-sm font-medium text-white">Deletion workflow (Pro)</p>
                                <p className="text-xs text-zinc-400">
                                    Send deletion requests, bulk-send where possible, and track replies and follow-ups.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* FOOTPRINT MAP PLACEHOLDER */}
                    <section className="space-y-4">
                        <div className="space-y-1 text-center">
                            <h2 className="text-xl font-semibold text-white sm:text-2xl">Your footprint, visualized</h2>
                            <p className="text-sm text-zinc-400">
                                A simple map of your accounts—so you can understand your exposure at a glance.
                            </p>
                        </div>

                        <div className="rounded-2xl border border-white/10 bg-[#050509] p-3">
                            <div className="relative aspect-[16/9] overflow-hidden rounded-xl border border-white/10 bg-black">
                                <Image
                                    src="https://ghostsweep.t3.storage.dev/footprint-map-placeholder.png"
                                    alt="Footprint map placeholder"
                                    fill
                                    className="object-cover opacity-90"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />
                                <div className="absolute bottom-3 left-3 rounded-full border border-white/10 bg-black/60 px-3 py-1 text-[11px] text-zinc-200">
                                    Placeholder — real map shows on dashboard
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* TRUST / SECURITY */}
                    <section className="space-y-6">
                        <div className="space-y-2 text-center">
                            <h2 className="text-xl font-semibold text-white sm:text-2xl">Privacy-first, not privacy-flavored</h2>
                            <p className="mx-auto max-w-2xl text-sm text-zinc-400">
                                GhostSweep is designed to minimize access, be explicit about what it does, and make it easy to revoke
                                permissions. Trust is earned by clarity.
                            </p>
                        </div>

                        <div className="grid gap-4 md:grid-cols-3">
                            {trustItems.map((item) => (
                                <div key={item.title} className="space-y-3 rounded-xl border border-white/10 bg-[#050509] p-4">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10">
                                        <item.icon className="h-4 w-4 text-emerald-400" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium text-white">{item.title}</p>
                                        <p className="text-xs text-zinc-400">{item.desc}</p>
                                        {item.linkHref && item.linkText ? (
                                            <Link
                                                href={item.linkHref}
                                                target="_blank"
                                                className="inline-flex items-center gap-1 text-[11px] text-emerald-300 hover:text-emerald-200"
                                            >
                                                {item.linkText}
                                                <ArrowRight className="h-3 w-3" />
                                            </Link>
                                        ) : null}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="text-center">
                            <Link
                                href="/home/security"
                                className="inline-flex items-center gap-1 text-xs text-zinc-300 hover:text-white"
                            >
                                Read the security overview
                                <ArrowRight className="h-3 w-3" />
                            </Link>
                        </div>
                    </section>

                    {/* PRICING */}
                    <section className="space-y-6">
                        <div className="space-y-2 text-center">
                            <h2 className="text-xl font-semibold text-white sm:text-2xl">Free to scan. Pro to act.</h2>
                            <p className="text-sm text-zinc-400">
                                Free shows you the count. Pro shows you the list, breaches, and gives you deletion + tracking tools.
                            </p>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            {/* Free */}
                            <div className="space-y-5 rounded-xl border border-white/10 bg-[#050509] p-6">
                                <div className="space-y-2">
                                    <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">Free</p>
                                    <div className="flex items-baseline gap-1">
                                        <p className="text-3xl font-semibold text-white">$0</p>
                                        <span className="text-xs text-zinc-400">always free</span>
                                    </div>
                                </div>

                                <ul className="space-y-2 text-sm text-zinc-300">
                                    <li className="flex items-start gap-2">
                                        <CheckCircle className="mt-0.5 h-3.5 w-3.5 text-emerald-400" />
                                        <span>Run a scan</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <CheckCircle className="mt-0.5 h-3.5 w-3.5 text-emerald-400" />
                                        <span>See your total account count</span>
                                    </li>

                                    <li className="flex items-start gap-2 text-zinc-400">
                                        <X className="mt-0.5 h-3.5 w-3.5 text-zinc-500" />
                                        <span>No account list (count only)</span>
                                    </li>
                                    <li className="flex items-start gap-2 text-zinc-400">
                                        <X className="mt-0.5 h-3.5 w-3.5 text-zinc-500" />
                                        <span>No breach list/visibility</span>
                                    </li>
                                    <li className="flex items-start gap-2 text-zinc-400">
                                        <X className="mt-0.5 h-3.5 w-3.5 text-zinc-500" />
                                        <span>No deletion tools (including bulk)</span>
                                    </li>
                                    <li className="flex items-start gap-2 text-zinc-400">
                                        <X className="mt-0.5 h-3.5 w-3.5 text-zinc-500" />
                                        <span>No new-account detection</span>
                                    </li>
                                    <li className="flex items-start gap-2 text-zinc-400">
                                        <X className="mt-0.5 h-3.5 w-3.5 text-zinc-500" />
                                        <span>No auto follow-ups or reply/status checking</span>
                                    </li>
                                </ul>

                                <Link
                                    href="/login"
                                    className="mt-2 inline-flex w-full items-center justify-center rounded-full border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-medium text-zinc-50 hover:bg-white/10 transition"
                                >
                                    Start free scan
                                </Link>
                            </div>

                            {/* Pro */}
                            <div className="space-y-5 rounded-xl border border-emerald-500/40 bg-emerald-500/5 p-6">
                                <div className="space-y-2">
                                    <p className="text-xs font-semibold uppercase tracking-wide text-emerald-300">
                                        Professional
                                    </p>
                                    <div className="flex items-baseline gap-2">
                                        <p className="text-3xl font-semibold text-white">$9.99</p>
                                        <span className="text-xs text-zinc-300">/month</span>
                                    </div>
                                    <p className="text-xs text-emerald-300">
                                        Full visibility, breach alerts, and automated deletion workflows.
                                    </p>
                                </div>

                                <ul className="space-y-2 text-sm text-zinc-200">
                                    <li className="flex items-start gap-2">
                                        <CheckCircle className="mt-0.5 h-3.5 w-3.5 text-emerald-400" />
                                        <span>See the full account list</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <CheckCircle className="mt-0.5 h-3.5 w-3.5 text-emerald-400" />
                                        <span>Breach visibility + prioritization</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <CheckCircle className="mt-0.5 h-3.5 w-3.5 text-emerald-400" />
                                        <span>New account detection <span className="inline-flex items-center gap-1 ml-1 text-xs text-zinc-300"><Bell className="h-3 w-3" /> alerts</span></span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <CheckCircle className="mt-0.5 h-3.5 w-3.5 text-emerald-400" />
                                        <span>Send deletion requests (email/link/manual)</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <CheckCircle className="mt-0.5 h-3.5 w-3.5 text-emerald-400" />
                                        <span>Bulk deletion workflows</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <CheckCircle className="mt-0.5 h-3.5 w-3.5 text-emerald-400" />
                                        <span>Auto follow-ups + reply/status checking</span>
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
                            <h2 className="text-xl font-semibold text-white sm:text-2xl">Frequently asked questions</h2>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            {faqs.map((item) => (
                                <div key={item.q} className="space-y-2 rounded-xl border border-white/10 bg-[#050509] p-4">
                                    <p className="text-sm font-medium text-white">{item.q}</p>
                                    <p className="text-xs text-zinc-400">{item.a}</p>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* FINAL CTA */}
                    <section className="space-y-4 rounded-xl border border-white/15 bg-[#050509] p-6 text-center">
                        <h2 className="text-lg font-semibold text-white sm:text-xl">Start with a scan</h2>
                        <p className="mx-auto max-w-xl text-sm text-zinc-400">
                            See how many accounts your inbox is connected to. Upgrade only if you want full visibility and cleanup tools.
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
                                    Revoke access any time
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
        </>
    )
}