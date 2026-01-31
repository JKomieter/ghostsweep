"use client";

import Link from "next/link";
import {
    ArrowRight,
    ShieldCheck,
    MailSearch,
    Database,
    AlertTriangle,
    Trash2,
    EyeOff,
    Lock,
    CheckCircle,
    ExternalLink,
    X,
    Wand2,
    Bell,
    Fingerprint,
    TriangleAlert,
    Sparkles,
    DollarSign,
    Zap,
    Ghost,
    Mail
} from "lucide-react";

function Pill({ children }: { children: React.ReactNode }) {
    return (
        <div className="inline-flex items-center gap-2 rounded-full border border-white/5 bg-white/2 px-3 py-1 text-[11px] text-white/60">
            {children}
        </div>
    );
}

function StepCard({
    step,
    icon,
    title,
    body,
    bullets,
}: {
    step: string;
    icon: React.ReactNode;
    title: string;
    body: string;
    bullets?: string[];
}) {
    return (
        <div className="rounded-lg border border-white/5 bg-white/2 p-5 backdrop-blur-sm">
            <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5">
                        {icon}
                    </div>
                    <div className="space-y-0.5">
                        <p className="text-[11px] font-light uppercase tracking-wide text-white/40">
                            Step {step}
                        </p>
                        <p className="text-sm font-light text-white">{title}</p>
                    </div>
                </div>

                <div className="rounded-full border border-white/5 bg-white/2 px-2.5 py-1 text-[10px] text-white/60">
                    {step}
                </div>
            </div>

            <p className="mt-3 text-xs text-white/60 leading-relaxed">{body}</p>

            {bullets?.length ? (
                <ul className="mt-4 space-y-2 text-xs text-white/60">
                    {bullets.map((b) => (
                        <li key={b} className="flex items-start gap-2">
                            <CheckCircle className="mt-0.5 h-3.5 w-3.5 text-white" />
                            <span>{b}</span>
                        </li>
                    ))}
                </ul>
            ) : null}
        </div>
    );
}

export default function HowItWorksPage() {
    // HowTo schema for search results
    const howToSchema = {
        "@context": "https://schema.org",
        "@type": "HowTo",
        "name": "How to Find Hidden Money & Delete Accounts with GhostSweep",
        "description": "Step-by-step process to connect your email, find forgotten gift cards and subscriptions, and delete unwanted services.",
        "image": "https://znlaksqttxokoeavwqjf.supabase.co/storage/v1/object/public/news/ghost-svgrepo-com.png",
        "step": [
            {
                "@type": "HowToStep",
                "name": "Connect Gmail or Outlook",
                "text": "Sign in securely via OAuth. We scan transaction receipts and emails transiently, without storing them, to find value.",
                "image": "https://znlaksqttxokoeavwqjf.supabase.co/storage/v1/object/public/news/ghost-svgrepo-com.png"
            },
            {
                "@type": "HowToStep",
                "name": "AI Value Audit",
                "text": "Our Ghost Engine identifies unused gift cards, forgotten subscriptions, and expiring rewards points.",
                "image": "https://znlaksqttxokoeavwqjf.supabase.co/storage/v1/object/public/news/ghost-svgrepo-com.png"
            },
            {
                "@type": "HowToStep",
                "name": "Sanitize & Recover",
                "text": "One-click unsubscribe from junk, recover your found money, and delete zombie accounts.",
                "image": "https://znlaksqttxokoeavwqjf.supabase.co/storage/v1/object/public/news/ghost-svgrepo-com.png"
            }
        ]
    };

    // WebPage schema
    const pageSchema = {
        "@context": "https://schema.org",
        "@type": "WebPage",
        "name": "How It Works | GhostSweep Value Recovery",
        "description": "Learn how GhostSweep turns your email history into found money and digital privacy.",
        "url": "https://ghostsweep.com/home/how-it-works",
        "publisher": {
            "@type": "Organization",
            "name": "GhostSweep",
            "logo": {
                "@type": "ImageObject",
                "url": "https://znlaksqttxokoeavwqjf.supabase.co/storage/v1/object/public/news/ghost-svgrepo-com.png",
            },
        },
    };

    return (
        <main className="min-h-screen bg-[#050505] text-white">
            {/* JSON-LD Structured Data */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(pageSchema) }}
            />
            <div className="mx-auto max-w-6xl px-4 pb-20 pt-12 space-y-20">
                {/* HERO */}
                <section className="grid gap-10 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] md:items-start">
                    {/* Copy */}
                    <div className="space-y-6">
                        <div className="inline-flex items-center gap-2 rounded-full border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-[11px] text-emerald-300">
                            <span className="relative inline-flex h-2 w-2">
                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/70" />
                                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                            </span>
                            Value Recovery Protocol
                        </div>

                        <div className="space-y-4">
                            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-light tracking-tight text-white">
                                Scan your inbox. <br/> Find hidden wealth. <br/> Delete the rest.
                                <br />
                                <span className="text-white/40 text-2xl sm:text-3xl block mt-2">The digital audit that pays you back.</span>
                            </h1>

                            {/* Purpose line (explicit for reviewers) */}
                            <p className="text-sm sm:text-base text-white/60 max-w-xl">
                                <span className="text-white font-light">GhostSweep</span> analyzes your email history to uncover 
                                <span className="text-emerald-400"> unused gift cards</span>, 
                                <span className="text-red-400"> forgotten subscriptions</span>, and 
                                <span className="text-blue-400"> dormant accounts</span>. 
                                We don&apos;t read your personal letters—we parse transaction details to find value.
                            </p>

                           
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                            <Link
                                href="/login"
                                className="inline-flex items-center justify-center gap-2 rounded-full bg-white text-black px-5 py-2.5 text-xs font-light shadow-sm hover:bg-white/90 transition"
                            >
                                Start Wealth Scan
                                <ArrowRight className="h-3.5 w-3.5" />
                            </Link>

                            <Link
                                href="/home/security"
                                className="inline-flex items-center gap-1 text-[11px] text-white/60 hover:text-white transition"
                            >
                                How we protect financial data
                                <ExternalLink className="h-3 w-3" />
                            </Link>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            <Pill>
                                <ShieldCheck className="h-3.5 w-3.5 text-white" />
                                Bank-Grade Security
                            </Pill>
                            <Pill>
                                <EyeOff className="h-3.5 w-3.5 text-white" />
                                Zero-Knowledge Storage
                            </Pill>
                            <Pill>
                                <DollarSign className="h-3.5 w-3.5 text-white" />
                                $1,800 Avg. Found
                            </Pill>
                        </div>
                    </div>

                    {/* Right column: “What you get” */}
                    <div className="rounded-lg border border-white/5 bg-white/2 p-6 shadow-lg backdrop-blur-sm">
                        <div className="space-y-4">
                            <div className="inline-flex items-center gap-2 rounded-full border border-white/5 bg-white/2 px-3 py-1 text-[11px] text-white/60">
                                <Sparkles className="h-3.5 w-3.5 text-white" />
                                Your Scan Results
                            </div>

                            <h2 className="text-lg font-light tracking-tight text-white">
                                Three pillars of value.
                            </h2>

                            <div className="space-y-3">
                                {[
                                    {
                                        icon: <DollarSign className="h-4 w-4 text-emerald-400" />,
                                        title: "Found Money (Value)",
                                        body: "Total value of unused gift cards and active subscriptions burning cash.",
                                    },
                                    {
                                        icon: <Mail className="h-4 w-4 text-blue-400" />,
                                        title: "Inbox Zero (Noise)",
                                        body: "Bulk unsubscribe list for newsletters you never read.",
                                    },
                                    {
                                        icon: <Ghost className="h-4 w-4 text-purple-400" />,
                                        title: "Shadow Map (Privacy)",
                                        body: "List of zombie accounts exposing your data to breaches.",
                                    },
                                     {
                                        icon: <Trash2 className="h-4 w-4 text-white" />,
                                        title: "Audit & Nuke",
                                        body: "Tools to claim cards, cancel subs, and delete accounts instantly.",
                                    },
                                ].map((i) => (
                                    <div key={i.title} className="flex gap-3 rounded-lg border border-white/5 bg-white/2 p-3 backdrop-blur-sm">
                                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5">
                                            {i.icon}
                                        </div>
                                        <div className="space-y-0.5">
                                            <p className="text-sm font-light text-white">{i.title}</p>
                                            <p className="text-xs text-white/60 leading-relaxed">{i.body}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <Link
                                href="/login"
                                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-white text-black px-4 py-2.5 text-xs font-light shadow-sm hover:bg-white/90 transition"
                            >
                                Start a free scan
                                <ArrowRight className="h-3.5 w-3.5" />
                            </Link>

                            <p className="text-[11px] text-white/60 text-center">
                                GhostSweep never stores email bodies. You can revoke access at any time.
                            </p>
                        </div>
                    </div>
                </section>

                {/* STEP-BY-STEP (this is the missing piece) */}
                <section className="space-y-8 border-t border-white/5 pt-10">
                    <div className="space-y-2">
                        <h2 className="text-xl sm:text-2xl font-light tracking-tight text-white">
                            Step-by-step: what GhostSweep does
                        </h2>
                        <p className="text-sm text-white/60 max-w-2xl">
                            This is the exact workflow—from connecting Gmail or Outlook to sending deletions. Clear, permissioned, and review-first.
                        </p>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        <StepCard
                            step="1"
                            icon={<ShieldCheck className="h-5 w-5 text-primary" />}
                            title="Connect Gmail or Outlook with OAuth"
                            body="You connect through Google's or Microsoft's official OAuth flow. GhostSweep only requests the minimum access needed to find value signals."
                            bullets={[
                                "You'll see the permission screen before anything happens",
                                "You can disconnect anytime from GhostSweep or your Google/Microsoft account",
                            ]}
                        />

                        <StepCard
                            step="2"
                            icon={<Zap className="h-5 w-5 text-emerald-400" />}
                            title="Find Wealth & Waste"
                            body="Our engine scans specifically for financial signals: gift card codes, subscription receipts, and rewards balances. This is where most users find $1,800+ in value."
                            bullets={[
                                "Detects unused gift cards",
                                "Finds forgotten subscriptions",
                                "Identifies rewards points",
                            ]}
                        />

                        <StepCard
                            step="3"
                            icon={<Ghost className="h-5 w-5 text-purple-400" />}
                            title="See your digital shadow"
                            body="We map every service connected to your email history. You'll see a complete list of accounts, newsletters, and potential breaches."
                            bullets={[
                                "Grouped by service / brand",
                                "Filtered to remove noise",
                                "Clear 'what exists' view",
                            ]}
                        />

                        <StepCard
                            step="4"
                            icon={<Trash2 className="h-5 w-5 text-red-500" />}
                            title="Recover & Delete"
                            body="The fun part. Claim your money, cancel the subscriptions you don't use, and nuke the old accounts that are leaking your data."
                            bullets={[
                                "One-click unsubscribe",
                                "Generated deletion requests",
                                "Value recovery workflows",
                                "Nothing is sent automatically",
                                "You preview every deletion email first",
                                "Track replies and follow-ups in one place",
                            ]}
                        />
                    </div>

                    <div className="rounded-lg border border-white/5 bg-white/2 p-4 backdrop-blur-sm">
                        <p className="text-xs text-white/60 leading-relaxed">
                            <span className="font-light text-white">Important:</span> GhostSweep does not silently delete accounts.
                            You decide what to remove, and you approve every action.
                        </p>
                    </div>
                </section>

                {/* WHAT WE LOOK FOR (keep, but make it tighter) */}
                <section className="space-y-8 border-t border-white/5 pt-10">
                    <div className="space-y-2">
                        <h2 className="text-xl sm:text-2xl font-light tracking-tight text-white">What GhostSweep looks for</h2>
                        <p className="text-sm text-white/60 max-w-2xl">
                            We infer value and risk using advanced scanning patterns—then help you claim it or kill it.
                        </p>
                    </div>

                    <div className="grid gap-4 md:grid-cols-3">
                        {[
                            {
                                iconBg: "bg-emerald-500/10",
                                icon: <DollarSign className="h-5 w-5 text-emerald-400" />,
                                title: "Financial Signals",
                                body: "Gift card codes, subscription receipts, rewards balance notifications, and class action settlement emails.",
                            },
                            {
                                iconBg: "bg-red-500/10",
                                icon: <AlertTriangle className="h-5 w-5 text-red-400" />,
                                title: "Safety Risks",
                                body: "Breached services, password reset loops, and security alerts from old accounts you forgot existed.",
                            },
                            {
                                iconBg: "bg-brand/10",
                                icon: <Trash2 className="h-5 w-5 text-brand" />,
                                title: "Deletion Readiness",
                                body: "Direct links to deletion pages and privacy contacts for 20,000+ services.",
                            },
                        ].map((card) => (
                            <div key={card.title} className="space-y-3 rounded-lg border border-white/5 bg-white/2 p-4 backdrop-blur-sm">
                                <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${card.iconBg}`}>
                                    {card.icon}
                                </div>
                                <h3 className="text-sm font-light text-white">{card.title}</h3>
                                <p className="text-xs text-white/60 leading-relaxed">{card.body}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* FREE VS PRO (keep) */}
                {/* FREE VS PRO */}
                <section className="space-y-8 border-t border-white/5 pt-10">
                    <div className="space-y-2">
                        <h2 className="text-xl sm:text-2xl font-light tracking-tight text-white">
                            Free discovery vs full control (Professional)
                        </h2>
                        <p className="text-sm text-white/60 max-w-2xl">
                            Free users see what they have. Pro users recover value and delete the noise.
                        </p>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 max-w-4xl">
                        {/* Free */}
                        <div className="space-y-5 rounded-lg border border-white/5 bg-white/2 p-5 backdrop-blur-sm">
                            <div className="space-y-1">
                                <p className="text-[11px] font-light uppercase tracking-wide text-white/60">Free</p>
                                <p className="text-xs text-white/60">Discover the value hiding in your inbox</p>
                            </div>
                            <ul className="space-y-2 text-xs text-white/60">
                                <li className="flex items-start gap-2">
                                    <CheckCircle className="h-3.5 w-3.5 text-white mt-0.5" />
                                    <span>Connect Gmail (read-only)</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle className="h-3.5 w-3.5 text-white mt-0.5" />
                                    <span>See total value found ($2,847 avg)</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle className="h-3.5 w-3.5 text-white mt-0.5" />
                                    <span>View up to 5 accounts</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle className="h-3.5 w-3.5 text-white mt-0.5" />
                                    <span>Count of newsletters found</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle className="h-3.5 w-3.5 text-white mt-0.5" />
                                    <span>Count of subscriptions found</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle className="h-3.5 w-3.5 text-white mt-0.5" />
                                    <span>Breach alerts (HIBP)</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle className="h-3.5 w-3.5 text-white mt-0.5" />
                                    <span>Privacy score</span>
                                </li>
                            </ul>
                            <Link
                                href="/login"
                                className="inline-flex w-full items-center justify-center rounded-full border border-white/5 bg-white/2 px-4 py-2.5 text-xs font-light hover:bg-white/3 hover:border-white/10 transition text-white"
                            >
                                Start free scan
                            </Link>
                        </div>

                        {/* Pro */}
                        <div className="relative space-y-5 rounded-lg border border-emerald-500/30 bg-white/5 p-5 backdrop-blur-sm shadow-xl shadow-emerald-900/10">
                            <div className="absolute -top-3 left-5 rounded-full bg-emerald-500 text-black px-3 py-1 text-[10px] font-bold shadow">
                                Professional
                            </div>

                            <div className="space-y-1 pt-2">
                                <p className="text-[11px] font-light uppercase tracking-wide text-white">Value Recovery & Automation</p>
                                <p className="text-xs text-white/60">
                                    Actually recover the money and delete the noise.
                                </p>
                            </div>

                            <ul className="space-y-2 text-xs text-white/60">
                                <li className="flex items-start gap-2">
                                    <CheckCircle className="h-3.5 w-3.5 text-emerald-400 mt-0.5" />
                                    <span className="font-medium text-white">Everything in Free, plus:</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle className="h-3.5 w-3.5 text-emerald-400 mt-0.5" />
                                    <span>Recover gift cards (see codes, copy, redeem)</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle className="h-3.5 w-3.5 text-emerald-400 mt-0.5" />
                                    <span>Cancel subscriptions (direct links + instructions)</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle className="h-3.5 w-3.5 text-emerald-400 mt-0.5" />
                                    <span>Batch unsubscribe newsletters</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle className="h-3.5 w-3.5 text-emerald-400 mt-0.5" />
                                    <span>Redeem rewards (before expiry)</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle className="h-3.5 w-3.5 text-emerald-400 mt-0.5" />
                                    <span>View ALL accounts (unlimited)</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle className="h-3.5 w-3.5 text-emerald-400 mt-0.5" />
                                    <span>Delete accounts (automation + tracking)</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle className="h-3.5 w-3.5 text-emerald-400 mt-0.5" />
                                    <span>Priority support</span>
                                </li>
                            </ul>

                            <Link
                                href="/dashboard/billing?plan=monthly"
                                className="inline-flex w-full items-center justify-center rounded-full bg-emerald-500 text-black px-4 py-2.5 text-xs font-bold shadow-sm hover:bg-emerald-400 transition"
                            >
                                Get Pro — $19.99/mo
                            </Link>
                        </div>
                    </div>

                    {/* Quick comparison note */}
                    <div className="max-w-4xl">
                         <div className="rounded-lg border border-emerald-500/20 bg-emerald-900/10 p-4 flex items-start gap-3">
                            <DollarSign className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                            <div>
                                <p className="text-sm font-medium text-emerald-400">ROI Guarantee</p>
                                <p className="text-xs text-emerald-400/80 leading-relaxed mt-1">
                                    We are so confident you will find value that we offer a promise: Find $100+ in realizable value (gift cards, sub savings) or we&apos;ll refund your first month.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>


                {/* PRIVACY GUARANTEE (keep, tighten) */}
                <section className="space-y-6 border-t border-white/10 pt-10">
                    <div className="rounded-lg border border-white/10 bg-white/5 p-6 md:p-8 backdrop-blur-sm">
                        <div className="space-y-4 max-w-2xl">
                            <div className="flex flex-wrap gap-4 text-[11px] text-white/60">
                                <span className="inline-flex items-center gap-2">
                                    <EyeOff className="h-4 w-4 text-white" />
                                    Zero-storage scanning
                                </span>
                                <span className="inline-flex items-center gap-2">
                                    <Lock className="h-4 w-4 text-white" />
                                    Revoke access anytime
                                </span>
                                <span className="inline-flex items-center gap-2">
                                    <Bell className="h-4 w-4 text-white" />
                                    Monitoring is Pro-only
                                </span>
                            </div>

                            <p className="text-xs sm:text-sm text-white/60 leading-relaxed">
                                GhostSweep uses Google&apos;s or Microsoft&apos;s OAuth2 flow. We scan email data transiently to find value, but we never store email bodies or attachments.
                                Deletion emails/steps are generated and executed only when you explicitly choose to.
                            </p>

                            <Link href="/home/security" className="inline-flex items-center gap-1 text-xs text-white hover:underline">
                                Read the full security overview
                                <ArrowRight className="h-3 w-3" />
                            </Link>
                        </div>
                    </div>
                </section>

                {/* FINAL CTA */}
                <section className="space-y-4 border-t border-white/5 pt-10 text-center">
                    <div className="space-y-2 max-w-xl mx-auto">
                        <h2 className="text-xl sm:text-2xl font-light tracking-tight text-white">Ready to see your footprint?</h2>
                        <p className="text-sm text-white/60">
                            Run a free scan in minutes. Upgrade only if you want the full list + clean-up workflows.
                        </p>
                    </div>

                    <div className="flex flex-wrap justify-center gap-3">
                        <Link
                            href="/login"
                            className="inline-flex items-center gap-2 rounded-full bg-white text-black px-6 py-2.5 text-xs font-light shadow-sm hover:bg-white/90 transition"
                        >
                            Start a free scan
                            <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                        <Link
                            href="/home#pricing"
                            className="inline-flex items-center gap-1 text-[11px] text-white/60 hover:text-white transition"
                        >
                            Compare plans
                            <ArrowRight className="h-3 w-3" />
                        </Link>
                    </div>
                </section>
            </div>
        </main>
    );
}