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
    ArrowDown,
} from "lucide-react";
import Image from "next/image";

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
    return (
        <main className="min-h-screen bg-linear-to-b from-[#020308] via-black to-[#050608] text-foreground">
            <div className="mx-auto max-w-6xl px-4 pb-20 pt-10 space-y-16 md:space-y-20">
                {/* HERO */}
                <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.02] p-6 sm:p-10">
                    {/* premium glow */}
                    <div className="pointer-events-none absolute inset-0">
                        <div className="absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-emerald-500/10 blur-3xl" />
                        <div className="absolute -bottom-24 right-10 h-72 w-72 rounded-full bg-white/5 blur-3xl" />
                    </div>

                    <div className="relative space-y-8">
                        <div className="flex flex-wrap items-center justify-center gap-2">
                            <Badge>
                                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                                <span>
                                    <span className="font-medium text-white">GhostSweep</span> · Privacy-first Gmail metadata scanning
                                </span>
                            </Badge>
                            <Badge>
                                <Lock className="h-3.5 w-3.5 text-emerald-400" />
                                <span>Revocable access · You stay in control</span>
                            </Badge>
                        </div>

                        <div className="mx-auto max-w-3xl space-y-4 text-center">
                            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl">
                                The average person has 130+ online accounts.
                                <br />
                                <span className="text-zinc-400">
                                    They remember about 12.
                                </span>
                            </h1>

                            {/* ONE subtext: purpose + benefit (Google-friendly) */}
                            <p className="text-sm text-zinc-400 sm:text-base">
                                Scan your Gmail in 3 minutes. See every account. Delete the ones you forgot existed
                            </p>

                            {/* emotional hit (compact, premium) */}
                            <div className="mx-auto max-w-2xl rounded-2xl border border-white/10 bg-black/20 p-4 text-left">
                                <div className="flex items-start gap-3">
                                    <TriangleAlert className="mt-0.5 h-4 w-4 text-amber-300" />
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium text-white">The risk is the accounts you can’t remember.</p>
                                        <p className="text-xs text-zinc-400">
                                            Old signups become breach exposure, spam, and takeover attempts later. GhostSweep gives you visibility — then a path
                                            to cleanup.
                                        </p>
                                    </div>
                                </div>
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
                                    href="#how"
                                    className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 py-2.5 text-sm text-zinc-100 hover:bg-white/10 transition"
                                >
                                    See how it works
                                    <ArrowDown className="h-4 w-4" />
                                </Link>
                            </div>

                            {/* Proof chips */}
                            <div className="flex flex-wrap justify-center gap-4 text-[11px] text-zinc-400">
                                <span className="inline-flex items-center gap-1">
                                    <Check className="h-3 w-3 text-emerald-400" />
                                    We don’t read email bodies
                                </span>
                                <span className="inline-flex items-center gap-1">
                                    <Check className="h-3 w-3 text-emerald-400" />
                                    Access is revocable anytime
                                </span>
                                <span className="inline-flex items-center gap-1">
                                    <Check className="h-3 w-3 text-emerald-400" />
                                    You approve every email
                                </span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* HOW IT WORKS (premium stepper) */}
                <section className="space-y-8" id="how">
                    <SectionTitle
                        eyebrow="How it works"
                        title="A simple loop: discover → prioritize → clean up"
                        desc="GhostSweep turns a messy inbox into a repeatable cleanup workflow you can actually finish."
                    />

                    <div className="grid gap-4 md:grid-cols-3">
                        {[
                            {
                                icon: Mail,
                                title: "Connect Gmail (securely)",
                                body: "Sign in with Google using OAuth. You see permissions before you grant access, and you can revoke anytime.",
                            },
                            {
                                icon: Fingerprint,
                                title: "Build your footprint",
                                body: "We group signup signals from metadata into services so you can see what’s connected to your email.",
                            },
                            {
                                icon: ListChecks,
                                title: "Take action (Pro)",
                                body: "Generate deletion steps (email/link/manual), bulk where possible, and track replies + follow-ups.",
                            },
                        ].map((s) => (
                            <div key={s.title} className="rounded-2xl border border-white/10 bg-[#050509] p-5">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10">
                                        <s.icon className="h-4 w-4 text-emerald-300" />
                                    </div>
                                    <p className="text-sm font-semibold text-white">{s.title}</p>
                                </div>
                                <p className="mt-3 text-xs leading-relaxed text-zinc-400">{s.body}</p>
                            </div>
                        ))}
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
                        <p className="text-xs text-zinc-400">
                            <span className="font-medium text-zinc-200">Important:</span> GhostSweep never sends deletion emails automatically. You
                            preview and approve everything.
                        </p>
                    </div>
                </section>

                {/* WHAT YOU'LL SEE (text-only premium mock) */}
                <section className="space-y-8">
                    <SectionTitle
                        eyebrow="Preview"
                        title="What you’ll see after you connect"
                        desc="A clean, organized view of your footprint — without reading your emails."
                    />

                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="rounded-2xl border border-white/10 bg-[#050509] p-5">
                            <div className="flex items-center gap-2">
                                <Sparkles className="h-4 w-4 text-emerald-300" />
                                <p className="text-sm font-semibold text-white">Footprint summary</p>
                            </div>
                            <p className="mt-2 text-xs text-zinc-400">
                                GhostSweep aggregates signup signals into a footprint you can understand in minutes.
                            </p>

                            <div className="mt-4 grid gap-2 sm:grid-cols-3">
                                {[
                                    { label: "Accounts discovered", value: "—" },
                                    { label: "Forgotten or inactive", value: "—" },
                                    { label: "Deletion actions available", value: "—" },
                                ].map((x) => (
                                    <div key={x.label} className="rounded-xl border border-white/10 bg-white/5 p-3">
                                        <p className="text-[11px] text-zinc-400">{x.label}</p>
                                        <p className="text-lg font-semibold text-white">{x.value}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-4 text-[11px] text-zinc-500">
                                Free shows your total count. Pro unlocks the full list + workflows.
                            </div>
                        </div>

                        <div className="rounded-2xl border border-white/10 bg-[#050509] p-5">
                            <div className="flex items-center gap-2">
                                <ListChecks className="h-4 w-4 text-emerald-300" />
                                <p className="text-sm font-semibold text-white">Account list (example)</p>
                            </div>
                            <p className="mt-2 text-xs text-zinc-400">
                                GhostSweep groups Gmail signup signals into a clear account footprint — so you can see what exists and decide what stays.
                            </p>

                            <div className="mt-4 space-y-2">
                                {[
                                    {
                                        name: "Dropbox",
                                        meta: "last seen 2019 · login / security emails",
                                        status: "inactive",
                                    },
                                    {
                                        name: "Spotify",
                                        meta: "subscription / billing emails",
                                        status: "active",
                                    },
                                    {
                                        name: "LinkedIn",
                                        meta: "security alerts · password reset",
                                        status: "security",
                                    },
                                    {
                                        name: "Old e-commerce site",
                                        meta: "receipt emails · no activity in years",
                                        status: "cleanup",
                                    },
                                ].map((row) => (
                                    <div
                                        key={row.name}
                                        className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2"
                                    >
                                        <div className="flex flex-col">
                                            <p className="text-xs font-medium text-white/90">{row.name}</p>
                                            <span className="text-[10px] text-zinc-400">{row.meta}</span>
                                        </div>

                                        <span
                                            className={`text-[10px] rounded-full px-2 py-0.5 border ${row.status === "inactive"
                                                    ? "border-zinc-500/40 text-zinc-300"
                                                    : row.status === "security"
                                                        ? "border-amber-500/40 text-amber-300"
                                                        : "border-emerald-500/40 text-emerald-300"
                                                }`}
                                        >
                                            {row.status}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-4 text-[11px] text-zinc-500">
                                Pro adds breach visibility, deletion workflows, and follow-up tracking.
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-center">
                        <Link
                            href="/login"
                            className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-2.5 text-sm font-medium text-black hover:bg-zinc-100 transition"
                        >
                            Run my scan
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>
                </section>

                {/* FEATURES */}
                <section className="space-y-8">
                    <SectionTitle
                        eyebrow="What GhostSweep does"
                        title="A cleanup workflow you’ll actually finish"
                        desc="Discover accounts, spot risk, then delete what you don’t want holding your data."
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
                                foot: "No more “where was that link?”",
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
                        eyebrow="Trust"
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
                                        {/* Put your image in /public and set src="/joel.jpg" */}
                                        <Image src="https://ghostsweep.t3.storage.dev/f1789004-4f47-4d23-a5c9-d66f62e532f3.jpg" alt="Founder of GhostSweep" fill className="object-cover" />
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
                        title="Free to see the risk. Pro to fix it."
                        desc="Free shows the total count. Pro shows the list, breach signals, and gives you deletion + tracking tools."
                    />

                    <div className="grid gap-4 md:grid-cols-2">
                        {/* Free */}
                        <div className="rounded-2xl border border-white/10 bg-[#050509] p-6 space-y-5">
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
                                    <span>No breach visibility</span>
                                </li>
                                <li className="flex items-start gap-2 text-zinc-400">
                                    <X className="mt-0.5 h-3.5 w-3.5 text-zinc-500" />
                                    <span>No deletion tools</span>
                                </li>
                                <li className="flex items-start gap-2 text-zinc-400">
                                    <X className="mt-0.5 h-3.5 w-3.5 text-zinc-500" />
                                    <span>No auto follow-ups/status checking</span>
                                </li>
                            </ul>

                            <Link
                                href="/login"
                                className="inline-flex w-full items-center justify-center rounded-full border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-medium text-zinc-50 hover:bg-white/10 transition"
                            >
                                Start free scan
                            </Link>
                        </div>

                        {/* Pro */}
                        <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/5 p-6 space-y-5">
                            <div className="space-y-2">
                                <p className="text-xs font-semibold uppercase tracking-wide text-emerald-300">Professional</p>
                                <div className="flex items-baseline gap-2">
                                    <p className="text-3xl font-semibold text-white">$9.99</p>
                                    <span className="text-xs text-zinc-300">/month</span>
                                </div>
                                <p className="text-xs text-emerald-300">Full visibility, breach alerts, and clean-up workflows.</p>
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
                                    <span>
                                        New account detection{" "}
                                        <span className="inline-flex items-center gap-1 ml-1 text-xs text-zinc-300">
                                            <Bell className="h-3 w-3" /> alerts
                                        </span>
                                    </span>
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
                                className="inline-flex w-full items-center justify-center rounded-full bg-white px-4 py-2.5 text-sm font-medium text-black hover:bg-zinc-100 transition"
                            >
                                Upgrade to Pro
                            </Link>
                        </div>
                    </div>
                </section>

                {/* FAQ */}
                <section className="space-y-8" id="faq">
                    <SectionTitle title="Frequently asked questions" />
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
                <section className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 sm:p-8 text-center space-y-4">
                    <h2 className="text-lg font-semibold text-white sm:text-xl">Get visibility in minutes</h2>
                    <p className="mx-auto max-w-xl text-sm text-zinc-400">
                        You can’t protect what you can’t see. Run a scan, see your footprint, then choose what you want to shut down.
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
    );
}