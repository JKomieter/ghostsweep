import Link from "next/link";
import {
    ShieldCheck,
    EyeOff,
    AlertTriangle,
    Mail,
    Trash2,
    Lock,
    Database,
    ArrowRight,
} from "lucide-react";

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
    return (
        <main className="min-h-screen bg-background text-foreground">            

            <div className="mx-auto max-w-5xl px-4 pb-16 pt-10 space-y-16">
                {/* Hero */}
                <section className="space-y-8">
                    <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] text-muted-foreground">
                        <span className="relative inline-flex h-2.5 w-2.5 items-center justify-center">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/40" />
                            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
                        </span>
                        Privacy-first email footprint scanner
                    </div>

                    <div className="space-y-4">
                        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                            Know who has your data.
                            <br />
                            Take back control.
                        </h1>
                        <p className="max-w-xl text-sm text-muted-foreground">
                            Your inbox contains a complete history of every service that holds
                            your personal information. GhostSweep scans it securely – read
                            only – to show your full digital footprint, highlight breached
                            accounts, and help you clean up your online presence.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <Link
                            href="/login"
                            className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-xs font-medium text-primary-foreground shadow-sm hover:opacity-90 transition"
                        >
                            Scan your inbox (Free)
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
                            100% privacy-first
                        </div>
                        <div className="inline-flex items-center gap-1">
                            <EyeOff className="h-3 w-3 text-primary" />
                            No email content accessed
                        </div>
                        <div className="inline-flex items-center gap-1">
                            <Lock className="h-3 w-3 text-primary" />
                            Disconnect and delete data anytime
                        </div>
                    </div>

                    {/* Simple "fake screenshot" hero card */}
                    <div className="mt-4 rounded-xl border border-white/10 bg-[#050505] p-4 shadow-lg">
                        <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                            <span>Latest sweep</span>
                            <span>Just now · Demo view</span>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-3">
                            <div className="rounded-lg border border-white/10 bg-black/40 p-3 space-y-1">
                                <p className="text-[11px] text-muted-foreground">
                                    Services found
                                </p>
                                <p className="text-xl font-semibold">86</p>
                                <p className="text-[11px] text-muted-foreground">
                                    Accounts and companies holding your data.
                                </p>
                            </div>
                            <div className="rounded-lg border border-white/10 bg-black/40 p-3 space-y-1">
                                <p className="text-[11px] text-muted-foreground">
                                    Known breaches
                                </p>
                                <p className="text-xl font-semibold text-red-400">4</p>
                                <p className="text-[11px] text-muted-foreground">
                                    Services linked to past data exposures.
                                </p>
                            </div>
                            <div className="rounded-lg border border-white/10 bg-black/40 p-3 space-y-1">
                                <p className="text-[11px] text-muted-foreground">
                                    Last active account
                                </p>
                                <p className="text-xl font-semibold">3d ago</p>
                                <p className="text-[11px] text-muted-foreground">
                                    Based on recent login, receipt, and security emails.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* How it works */}
                <section id="how" className="space-y-6">
                    <div className="space-y-2">
                        <h2 className="text-xl font-semibold tracking-tight">
                            A private, secure audit of your digital footprint
                        </h2>
                        <p className="max-w-xl text-sm text-muted-foreground">
                            GhostSweep is designed to answer one question:{" "}
                            <span className="font-medium text-foreground">
                                “Who has my data?”
                            </span>{" "}
                            – without sacrificing your privacy to find out.
                        </p>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 text-sm">
                        <div className="space-y-2 rounded-lg border border-white/10 bg-black/40 p-3">
                            <p className="text-xs font-semibold text-muted-foreground">
                                1. Connect your email (read-only)
                            </p>
                            <p className="text-xs text-muted-foreground">
                                We use Google’s official OAuth system with Gmail read-only
                                permissions. GhostSweep cannot send, delete, or change anything.
                            </p>
                        </div>
                        <div className="space-y-2 rounded-lg border border-white/10 bg-black/40 p-3">
                            <p className="text-xs font-semibold text-muted-foreground">
                                2. Analyze metadata only
                            </p>
                            <p className="text-xs text-muted-foreground">
                                We never access the content of your emails. Only senders,
                                subjects, and timestamps are used to map your accounts.
                            </p>
                        </div>
                        <div className="space-y-2 rounded-lg border border-white/10 bg-black/40 p-3">
                            <p className="text-xs font-semibold text-muted-foreground">
                                3. See every service with your data
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Your inbox reveals sign-ups, receipts, security alerts, and
                                forgotten accounts – all organized in one place.
                            </p>
                        </div>
                        <div className="space-y-2 rounded-lg border border-white/10 bg-black/40 p-3">
                            <p className="text-xs font-semibold text-muted-foreground">
                                4. Review breaches & take action
                            </p>
                            <p className="text-xs text-muted-foreground">
                                See which services were breached and send privacy-friendly data
                                removal requests when you’re ready.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Features */}
                <section className="space-y-6">
                    <div className="space-y-2">
                        <h2 className="text-xl font-semibold tracking-tight">
                            Everything you need to protect your digital identity
                        </h2>
                        <p className="max-w-xl text-sm text-muted-foreground">
                            GhostSweep makes your digital footprint visible, understandable,
                            and manageable – without technical complexity.
                        </p>
                    </div>

                    <div className="grid gap-4 md:grid-cols-3 text-sm">
                        <div className="space-y-2 rounded-lg border border-white/10 bg-black/40 p-4">
                            <div className="flex items-center gap-2">
                                <Database className="h-4 w-4 text-primary" />
                                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                    Account discovery
                                </p>
                            </div>
                            <p className="text-sm font-medium">
                                Identify every account tied to your email
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Social platforms, shopping sites, banking, newsletters, and
                                subscriptions – all mapped from your inbox.
                            </p>
                        </div>

                        <div className="space-y-2 rounded-lg border border-white/10 bg-black/40 p-4">
                            <div className="flex items-center gap-2">
                                <AlertTriangle className="h-4 w-4 text-red-400" />
                                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                    Breach awareness
                                </p>
                            </div>
                            <p className="text-sm font-medium">Instant breach insights</p>
                            <p className="text-xs text-muted-foreground">
                                See which services connected to your email have been involved in
                                known data breaches, so you can respond quickly.
                            </p>
                        </div>

                        <div className="space-y-2 rounded-lg border border-white/10 bg-black/40 p-4">
                            <div className="flex items-center gap-2">
                                <Mail className="h-4 w-4 text-primary" />
                                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                    Privacy tools
                                </p>
                            </div>
                            <p className="text-sm font-medium">
                                Data removal email templates (Pro)
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Generate ready-to-send emails asking services to delete your
                                account and personal data, written in a clear, rights-respecting
                                way.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Security */}
                <section id="security" className="space-y-6">
                    <div className="space-y-2">
                        <h2 className="text-xl font-semibold tracking-tight">
                            Built with privacy at the core
                        </h2>
                        <p className="max-w-xl text-sm text-muted-foreground">
                            GhostSweep is designed as a privacy tool first, product second.
                            Access is minimal, storage is limited, and you stay in control.
                        </p>
                    </div>

                    <div className="grid gap-4 md:grid-cols-3 text-xs">
                        <div className="space-y-2 rounded-lg border border-white/10 bg-black/40 p-3">
                            <div className="flex items-center gap-2">
                                <EyeOff className="h-3 w-3 text-primary" />
                                <p className="font-medium">No email content</p>
                            </div>
                            <p className="text-muted-foreground">
                                We never read or store the bodies of your emails. Only metadata
                                is used to detect accounts and services.
                            </p>
                        </div>
                        <div className="space-y-2 rounded-lg border border-white/10 bg-black/40 p-3">
                            <div className="flex items-center gap-2">
                                <Lock className="h-3 w-3 text-primary" />
                                <p className="font-medium">Encrypted tokens</p>
                            </div>
                            <p className="text-muted-foreground">
                                OAuth tokens are stored encrypted using industry-standard
                                encryption. You can revoke access at any time.
                            </p>
                        </div>
                        <div className="space-y-2 rounded-lg border border-white/10 bg-black/40 p-3">
                            <div className="flex items-center gap-2">
                                <Trash2 className="h-3 w-3 text-primary" />
                                <p className="font-medium">Full control of your data</p>
                            </div>
                            <p className="text-muted-foreground">
                                Delete your sweep history or disconnect GhostSweep whenever you
                                choose – no questions asked.
                            </p>
                        </div>
                    </div>

                    <p className="text-[11px] text-muted-foreground">
                        GhostSweep uses Google&apos;s official OAuth2 flow, PKCE, and secure
                        HTTPS for all communication. We don&apos;t run ads, implement
                        cross-site tracking, or sell your data.
                    </p>
                </section>

                {/* Why it matters */}
                <section className="space-y-4">
                    <h2 className="text-xl font-semibold tracking-tight">
                        Your inbox is a map of every place your data lives
                    </h2>
                    <p className="max-w-xl text-sm text-muted-foreground">
                        Most people underestimate how many services still hold their data:
                        old gaming accounts, shopping sites, trial subscriptions, forgotten
                        newsletters, and platforms that have already been breached.
                    </p>
                    <p className="max-w-xl text-sm text-muted-foreground">
                        GhostSweep makes that invisible footprint visible again – so you can
                        decide what to keep, what to close, and where to demand data
                        deletion.
                    </p>
                </section>

                {/* Pricing */}
                <section id="pricing" className="space-y-6">
                    <div className="space-y-2">
                        <h2 className="text-xl font-semibold tracking-tight">
                            Start free. Upgrade only if you need more.
                        </h2>
                        <p className="max-w-xl text-sm text-muted-foreground">
                            GhostSweep is designed to be useful from the first scan. The free
                            plan gives you a clear snapshot. Pro unlocks deeper insight and
                            advanced privacy tools.
                        </p>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
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
                                <li>• Scan your inbox with read-only access</li>
                                <li>• See a limited set of detected services</li>
                                <li>• Basic breach awareness</li>
                                <li>• Disconnect and delete data anytime</li>
                            </ul>
                            <Link
                                href="/login"
                                className="inline-flex items-center justify-center rounded-full border border-white/20 px-4 py-2 text-xs font-medium hover:bg-white/5 transition"
                            >
                                Start free scan
                            </Link>
                        </div>

                        {/* Pro */}
                        <div className="space-y-4 rounded-xl border border-primary/50 bg-primary/5 p-5">
                            <div className="flex items-center justify-between">
                                <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                                    Pro
                                </p>
                                <span className="rounded-full bg-primary/20 px-2 py-0.5 text-[10px] text-primary-foreground/90">
                                    Best for ongoing monitoring
                                </span>
                            </div>
                            <div className="flex items-baseline gap-1">
                                <p className="text-2xl font-semibold">$6.99</p>
                                <p className="text-xs text-muted-foreground"> / month</p>
                            </div>
                            <ul className="space-y-1 text-xs text-muted-foreground">
                                <li>• Full service discovery from your inbox</li>
                                <li>• Complete breach history visibility</li>
                                <li>• Data removal email templates</li>
                                <li>• More generous scan limits</li>
                                <li>• Priority rescans and updates</li>
                            </ul>
                            <Link
                                href="/billing"
                                className="inline-flex items-center justify-center rounded-full bg-primary px-4 py-2 text-xs font-medium text-primary-foreground shadow-sm hover:opacity-90 transition"
                            >
                                Upgrade to Pro
                            </Link>
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
                            If you&apos;re connecting your email to a privacy tool, you should
                            have questions. Here are the most important ones.
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
                        See your digital footprint in minutes
                    </h2>
                    <p className="max-w-xl text-sm text-muted-foreground">
                        Run a private, read-only scan of your inbox and see which companies
                        still hold your data. Clean up old accounts, review breached
                        services, and take control of your digital identity.
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
                            href="/home/legal/privacy"
                            className="hover:text-foreground transition-colors"
                        >
                            Privacy Policy
                        </Link>
                        <Link
                            href="/home/legal/terms"
                            className="hover:text-foreground transition-colors"
                        >
                            Terms
                        </Link>
                        <a
                            href="mailto:support@ghostsweep.app"
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