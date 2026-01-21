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
} from "lucide-react";

function Pill({ children }: { children: React.ReactNode }) {
    return (
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] text-white/70">
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
        <div className="rounded-2xl border border-white/10 bg-black/40 p-5">
            <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15">
                        {icon}
                    </div>
                    <div className="space-y-0.5">
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-white/50">
                            Step {step}
                        </p>
                        <p className="text-sm font-semibold text-white/90">{title}</p>
                    </div>
                </div>

                <div className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] text-white/60">
                    {step}
                </div>
            </div>

            <p className="mt-3 text-xs text-muted-foreground leading-relaxed">{body}</p>

            {bullets?.length ? (
                <ul className="mt-4 space-y-2 text-xs text-muted-foreground">
                    {bullets.map((b) => (
                        <li key={b} className="flex items-start gap-2">
                            <CheckCircle className="mt-0.5 h-3.5 w-3.5 text-primary" />
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
        "name": "How to Find and Delete Hidden Accounts with GhostSweep",
        "description": "Step-by-step process to connect Gmail or Outlook, scan for hidden accounts, and delete services you no longer use",
        "image": "https://znlaksqttxokoeavwqjf.supabase.co/storage/v1/object/public/news/ghost-svgrepo-com.png",
        "step": [
            {
                "@type": "HowToStep",
                "name": "Connect Gmail or Outlook with OAuth",
                "text": "Sign in with Google or Microsoft and grant GhostSweep permission to scan email metadata. You can disconnect anytime.",
                "image": "https://znlaksqttxokoeavwqjf.supabase.co/storage/v1/object/public/news/ghost-svgrepo-com.png"
            },
            {
                "@type": "HowToStep",
                "name": "Scan metadata for account signals",
                "text": "GhostSweep analyzes sender addresses, subjects, and dates to detect signup patterns and account signals. No email bodies are read.",
                "image": "https://znlaksqttxokoeavwqjf.supabase.co/storage/v1/object/public/news/ghost-svgrepo-com.png"
            },
            {
                "@type": "HowToStep",
                "name": "View your account footprint",
                "text": "Get a count of all accounts (Free) or a detailed list organized by service (Pro). See breach indicators and risk signals.",
                "image": "https://znlaksqttxokoeavwqjf.supabase.co/storage/v1/object/public/news/ghost-svgrepo-com.png"
            },
            {
                "@type": "HowToStep",
                "name": "Delete accounts and track progress",
                "text": "Choose accounts to delete, preview deletion emails, and track which services you've successfully removed (Pro feature).",
                "image": "https://znlaksqttxokoeavwqjf.supabase.co/storage/v1/object/public/news/ghost-svgrepo-com.png"
            }
        ]
    };

    // WebPage schema
    const pageSchema = {
        "@context": "https://schema.org",
        "@type": "WebPage",
        "name": "How GhostSweep Works | Email Scan to Account Cleanup",
        "description": "Step-by-step guide explaining how GhostSweep finds hidden accounts using Gmail and Outlook, and helps delete them.",
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
        <main className="min-h-screen bg-linear-to-b from-black via-zinc-950 to-black text-foreground">
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
                        <div className="inline-flex items-center gap-2 rounded-full border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-[11px] text-emerald-200">
                            <span className="relative inline-flex h-2 w-2">
                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/70" />
                                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                            </span>
                            How GhostSweep Works
                        </div>

                        <div className="space-y-4">
                            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight">
                                Connect Gmail or Outlook → see your accounts → delete what you don&apos;t want.
                                <br />
                                <span className="text-white/80">A cleanup workflow built from email metadata.</span>
                            </h1>

                            {/* Purpose line (explicit for reviewers) */}
                            <p className="text-sm sm:text-base text-muted-foreground max-w-xl">
                                <span className="text-white/80 font-medium">GhostSweep</span> is a privacy-first application that scans Gmail and Outlook{" "}
                                <span className="text-white/80">metadata</span> (sender, subject, date) — not email bodies or attachments — to estimate where your
                                email is registered, organize those services into one view, and help you remove accounts that still hold your data.
                            </p>

                            {/* One emotional line (not a second paragraph) */}
                            <div className="max-w-xl rounded-xl border border-white/10 bg-white/5 p-4">
                                <div className="flex items-start gap-3">
                                    <TriangleAlert className="mt-0.5 h-4 w-4 text-amber-300" />
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium text-white/90">The risk isn’t one account — it’s the list you can’t see.</p>
                                        <p className="text-xs text-muted-foreground leading-relaxed">
                                            Old signups pile up quietly. GhostSweep gives you visibility, then a simple path to clean up.
                                        </p>
                                    </div>
                                </div>
                            </div>
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

                        <div className="flex flex-wrap gap-2">
                            <Pill>
                                <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                                Google & Microsoft OAuth (permissioned)
                            </Pill>
                            <Pill>
                                <EyeOff className="h-3.5 w-3.5 text-primary" />
                                Metadata-only scanning
                            </Pill>
                            <Pill>
                                <Lock className="h-3.5 w-3.5 text-primary" />
                                Revoke anytime
                            </Pill>
                        </div>
                    </div>

                    {/* Right column: “What you get” */}
                    <div className="rounded-2xl border border-white/10 bg-black/40 p-6 shadow-lg">
                        <div className="space-y-4">
                            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] text-white/70">
                                <Sparkles className="h-3.5 w-3.5 text-primary" />
                                What you get after connecting Gmail or Outlook
                            </div>

                            <h2 className="text-lg font-semibold tracking-tight text-white/90">
                                A footprint you can act on.
                            </h2>

                            <div className="space-y-3">
                                {[
                                    {
                                        icon: <Fingerprint className="h-4 w-4 text-primary" />,
                                        title: "Your total account count (Free)",
                                        body: "A quick estimate of how many services are connected to your email.",
                                    },
                                    {
                                        icon: <Database className="h-4 w-4 text-primary" />,
                                        title: "Organized services (Pro)",
                                        body: "A full list of detected services grouped into a clean footprint view.",
                                    },
                                    {
                                        icon: <AlertTriangle className="h-4 w-4 text-red-400" />,
                                        title: "Risk signals (Pro)",
                                        body: "Breach and security indicators so you know what to prioritize first.",
                                    },
                                    {
                                        icon: <Trash2 className="h-4 w-4 text-primary" />,
                                        title: "Deletion + tracking (Pro)",
                                        body: "Deletion links/emails + follow-ups so you don’t lose your place.",
                                    },
                                ].map((i) => (
                                    <div key={i.title} className="flex gap-3 rounded-xl border border-white/10 bg-white/5 p-3">
                                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15">
                                            {i.icon}
                                        </div>
                                        <div className="space-y-0.5">
                                            <p className="text-sm font-medium text-white/90">{i.title}</p>
                                            <p className="text-xs text-muted-foreground leading-relaxed">{i.body}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <Link
                                href="/login"
                                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-4 py-2.5 text-xs font-medium text-primary-foreground shadow-sm hover:opacity-90 transition"
                            >
                                Start a free scan
                                <ArrowRight className="h-3.5 w-3.5" />
                            </Link>

                            <p className="text-[11px] text-muted-foreground text-center">
                                GhostSweep never reads email bodies. You can revoke access at any time.
                            </p>
                        </div>
                    </div>
                </section>

                {/* STEP-BY-STEP (this is the missing piece) */}
                <section className="space-y-8 border-t border-white/10 pt-10">
                    <div className="space-y-2">
                        <h2 className="text-xl sm:text-2xl font-semibold tracking-tight">
                            Step-by-step: what GhostSweep does
                        </h2>
                        <p className="text-sm text-muted-foreground max-w-2xl">
                            This is the exact workflow—from connecting Gmail or Outlook to sending deletions. Clear, permissioned, and review-first.
                        </p>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        <StepCard
                            step="1"
                            icon={<ShieldCheck className="h-5 w-5 text-primary" />}
                            title="Connect Gmail or Outlook with OAuth"
                            body="You connect through Google's or Microsoft's official OAuth flow. GhostSweep only requests the minimum access needed to scan metadata signals."
                            bullets={[
                                "You'll see the permission screen before anything happens",
                                "You can disconnect anytime from GhostSweep or your Google/Microsoft account",
                            ]}
                        />

                        <StepCard
                            step="2"
                            icon={<MailSearch className="h-5 w-5 text-primary" />}
                            title="Scan metadata for account signals"
                            body="GhostSweep looks at sender addresses, subjects, and dates to detect patterns like welcomes, receipts, verification, password resets, and security alerts."
                            bullets={[
                                "No email body scanning",
                                "No attachments scanning",
                                "No password access",
                            ]}
                        />

                        <StepCard
                            step="3"
                            icon={<Database className="h-5 w-5 text-primary" />}
                            title="Build your account footprint"
                            body="We group signals into services so you get an organized footprint. Free shows the total count; Pro unlocks the full list and details."
                            bullets={[
                                "Grouped by service / brand",
                                "Reduced duplicates and noise",
                                "Clear ‘what exists’ view",
                            ]}
                        />

                        <StepCard
                            step="4"
                            icon={<Trash2 className="h-5 w-5 text-primary" />}
                            title="Take action: delete and track (Pro)"
                            body="When you choose to clean up, GhostSweep helps you open deletion pages or generate deletion emails—and track replies and follow-ups."
                            bullets={[
                                "Nothing is sent automatically",
                                "You preview every deletion email first",
                                "Track replies and follow-ups in one place",
                            ]}
                        />
                    </div>

                    <div className="rounded-xl border border-white/10 bg-black/40 p-4">
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            <span className="font-medium text-white/80">Important:</span> GhostSweep does not silently delete accounts.
                            You decide what to remove, and you approve every action.
                        </p>
                    </div>
                </section>

                {/* WHAT WE LOOK FOR (keep, but make it tighter) */}
                <section className="space-y-8 border-t border-white/10 pt-10">
                    <div className="space-y-2">
                        <h2 className="text-xl sm:text-2xl font-semibold tracking-tight">What GhostSweep looks for</h2>
                        <p className="text-sm text-muted-foreground max-w-2xl">
                            We infer accounts and risk using metadata patterns—then turn it into next steps.
                        </p>
                    </div>

                    <div className="grid gap-4 md:grid-cols-3">
                        {[
                            {
                                iconBg: "bg-primary/15",
                                icon: <MailSearch className="h-5 w-5 text-primary" />,
                                title: "Account signals",
                                body: "Welcome emails, verification, receipts, password resets, and security notices that indicate real accounts.",
                            },
                            {
                                iconBg: "bg-red-500/20",
                                icon: <AlertTriangle className="h-5 w-5 text-red-400" />,
                                title: "Risk indicators (Pro)",
                                body: "Breached services and security-related signals so you can prioritize high-risk accounts first.",
                            },
                            {
                                iconBg: "bg-primary/15",
                                icon: <Wand2 className="h-5 w-5 text-primary" />,
                                title: "Next-step readiness (Pro)",
                                body: "Suggested next actions: open deletion pages, email privacy contacts, or tighten security settings.",
                            },
                        ].map((card) => (
                            <div key={card.title} className="space-y-3 rounded-xl border border-white/10 bg-black/40 p-4">
                                <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${card.iconBg}`}>
                                    {card.icon}
                                </div>
                                <h3 className="text-sm font-semibold">{card.title}</h3>
                                <p className="text-xs text-muted-foreground leading-relaxed">{card.body}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* FREE VS PRO (keep) */}
                {/* FREE VS PRO */}
                <section className="space-y-8 border-t border-white/10 pt-10">
                    <div className="space-y-2">
                        <h2 className="text-xl sm:text-2xl font-semibold tracking-tight">
                            Free discovery vs full control (Professional)
                        </h2>
                        <p className="text-sm text-muted-foreground max-w-2xl">
                            Free shows you what you have. Professional gives you the tools to delete it all and stay protected.
                        </p>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 max-w-4xl">
                        {/* Free */}
                        <div className="space-y-5 rounded-xl border border-white/10 bg-black/40 p-5">
                            <div className="space-y-1">
                                <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Free</p>
                                <p className="text-xs text-muted-foreground">Discover your digital footprint</p>
                            </div>
                            <ul className="space-y-2 text-xs text-muted-foreground">
                                <li className="flex items-start gap-2">
                                    <CheckCircle className="h-3.5 w-3.5 text-primary mt-0.5" />
                                    <span>Scan your email once</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle className="h-3.5 w-3.5 text-primary mt-0.5" />
                                    <span>See total account count</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle className="h-3.5 w-3.5 text-primary mt-0.5" />
                                    <span>View up to 10 accounts</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle className="h-3.5 w-3.5 text-primary mt-0.5" />
                                    <span>View all breach alerts</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle className="h-3.5 w-3.5 text-primary mt-0.5" />
                                    <span>Privacy score dashboard</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <X className="h-3.5 w-3.5 text-white/40 mt-0.5" />
                                    <span>No deletion playbooks</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <X className="h-3.5 w-3.5 text-white/40 mt-0.5" />
                                    <span>No continuous monitoring</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <X className="h-3.5 w-3.5 text-white/40 mt-0.5" />
                                    <span>No deletion tracking</span>
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
                                <p className="text-[11px] font-semibold uppercase tracking-wide text-primary">Complete privacy control</p>
                                <p className="text-xs text-muted-foreground">
                                    Unlimited access + deletion tools + continuous protection
                                </p>
                            </div>

                            <ul className="space-y-2 text-xs text-muted-foreground">
                                <li className="flex items-start gap-2">
                                    <CheckCircle className="h-3.5 w-3.5 text-primary mt-0.5" />
                                    <span className="font-medium">Everything in Free, plus:</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle className="h-3.5 w-3.5 text-primary mt-0.5" />
                                    <span>Unlimited accounts discovered</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle className="h-3.5 w-3.5 text-primary mt-0.5" />
                                    <span>Step-by-step deletion playbooks</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle className="h-3.5 w-3.5 text-primary mt-0.5" />
                                    <span>Weekly monitoring (auto-detect new accounts)</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle className="h-3.5 w-3.5 text-primary mt-0.5" />
                                    <span>Deletion tracking dashboard</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle className="h-3.5 w-3.5 text-primary mt-0.5" />
                                    <span>Continuous breach monitoring + alerts</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle className="h-3.5 w-3.5 text-primary mt-0.5" />
                                    <span>Export privacy report (PDF)</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle className="h-3.5 w-3.5 text-primary mt-0.5" />
                                    <span>Priority email support</span>
                                </li>
                            </ul>

                            <Link
                                href="/dashboard/billing?plan=monthly"
                                className="inline-flex w-full items-center justify-center rounded-full bg-primary px-4 py-2.5 text-xs font-medium text-primary-foreground shadow-sm hover:opacity-90 transition"
                            >
                                Upgrade to Pro — $9.99/mo
                            </Link>
                        </div>
                    </div>

                    {/* Quick comparison note */}
                    <div className="max-w-4xl">
                        <p className="text-xs text-muted-foreground border-l-2 border-primary/30 pl-3">
                            <strong className="text-foreground">Free users see what they have.</strong> Pro users get the tools to delete it all—with playbooks for every account, tracking dashboards, and continuous monitoring to catch new accounts automatically.
                        </p>
                    </div>
                </section>


                {/* PRIVACY GUARANTEE (keep, tighten) */}
                <section className="space-y-6 border-t border-primary/40 pt-10">
                    <div className="rounded-2xl border border-primary/40 bg-primary/5 p-6 md:p-8">
                        <div className="space-y-4 max-w-2xl">
                            <div className="flex flex-wrap gap-4 text-[11px] text-muted-foreground">
                                <span className="inline-flex items-center gap-2">
                                    <EyeOff className="h-4 w-4 text-primary" />
                                    Metadata-only scanning
                                </span>
                                <span className="inline-flex items-center gap-2">
                                    <Lock className="h-4 w-4 text-primary" />
                                    Revoke access anytime
                                </span>
                                <span className="inline-flex items-center gap-2">
                                    <Bell className="h-4 w-4 text-primary" />
                                    Monitoring is Pro-only
                                </span>
                            </div>

                            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                                GhostSweep uses Google&apos;s or Microsoft&apos;s OAuth2 flow. We scan email metadata (sender, subject, date) from Gmail and Outlook — not email bodies or attachments.
                                Deletion emails/steps are generated and executed only when you explicitly choose to.
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
                        <h2 className="text-xl sm:text-2xl font-semibold tracking-tight">Ready to see your footprint?</h2>
                        <p className="text-sm text-muted-foreground">
                            Run a free scan in minutes. Upgrade only if you want the full list + clean-up workflows.
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
        </main>
    );
}