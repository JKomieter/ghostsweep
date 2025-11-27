// app/how-it-works/page.tsx
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
} from "lucide-react";

export default function HowItWorksPage() {
    return (
        <main className="min-h-screen bg-background text-foreground">
            <div className="mx-auto max-w-5xl px-4 pb-16 pt-10 space-y-16">
                {/* Hero / Intro */}
                <section className="space-y-6">
                    <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] text-muted-foreground">
                        <span className="relative inline-flex h-2.5 w-2.5 items-center justify-center">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/40" />
                            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
                        </span>
                        How GhostSweep works (step-by-step)
                    </div>

                    <div className="space-y-3">
                        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                            A private, read-only audit of your digital footprint.
                        </h1>
                        <p className="max-w-xl text-sm text-muted-foreground">
                            GhostSweep scans your inbox to discover every account you&apos;ve created—
                            without reading email content. Find forgotten accounts, see which were
                            breached, and clean up what you don&apos;t need.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <Link
                            href="/login"
                            className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-xs font-medium text-primary-foreground shadow-sm transition hover:opacity-90"
                        >
                            Start your first scan (Free)
                            <ArrowRight className="h-3 w-3" />
                        </Link>
                        <Link
                            href="/security"
                            className="text-xs text-muted-foreground transition-colors hover:text-foreground"
                        >
                            See how we protect your data →
                        </Link>
                    </div>
                </section>

                {/* Step overview */}
                <section className="space-y-8">
                    <div className="space-y-2">
                        <h2 className="text-xl font-semibold tracking-tight">
                            4 steps from “no idea who has my data” to a clear map
                        </h2>
                        <p className="max-w-xl text-sm text-muted-foreground">
                            The flow is simple: connect, scan, review, and clean up. You stay
                            in control the entire time.
                        </p>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        {/* Step 1 */}
                        <div className="space-y-2 rounded-xl border border-white/10 bg-[#050505] p-4">
                            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                <ShieldCheck className="h-4 w-4 text-primary" />
                                Step 1 · Secure, read-only connection
                            </div>
                            <p className="text-sm font-medium">
                                Connect Gmail using Google&apos;s official OAuth.
                            </p>
                            <p className="text-xs text-muted-foreground">
                                GhostSweep uses Google&lsquo;s official OAuth with{" "}
                                <span className="font-medium text-foreground">
                                    read-only Gmail
                                </span>{" "}
                                access.
                                We cannot send, delete, or modify emails. Revoke access anytime from
                                your Google account settings.
                            </p>
                        </div>

                        {/* Step 2 */}
                        <div className="space-y-2 rounded-xl border border-white/10 bg-[#050505] p-4">
                            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                <MailSearch className="h-4 w-4 text-primary" />
                                Step 2 · Scan email metadata only
                            </div>
                            <p className="text-sm font-medium">
                                We never read or store email bodies.
                            </p>
                            <p className="text-xs text-muted-foreground">
                                GhostSweep analyzes{" "}
                                <span className="font-medium text-foreground">
                                    senders, subjects, and timestamps
                                </span>{" "}
                                to detect sign-ups, receipts, security alerts, and account
                                emails. Email content is never accessed or stored.
                            </p>
                        </div>

                        {/* Step 3 */}
                        <div className="space-y-2 rounded-xl border border-white/10 bg-[#050505] p-4">
                            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                <Database className="h-4 w-4 text-primary" />
                                Step 3 · Build your account map
                            </div>
                            <p className="text-sm font-medium">
                                Turn a noisy inbox into a structured service list.
                            </p>
                            <p className="text-xs text-muted-foreground">
                                We group emails by domain and service, so you see{" "}
                                <span className="font-medium text-foreground">
                                    every company holding your data
                                </span>{" "}
                                — from big platforms to forgotten trials and niche tools.
                            </p>
                        </div>

                        {/* Step 4 */}
                        <div className="space-y-2 rounded-xl border border-white/10 bg-[#050505] p-4">
                            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                <AlertTriangle className="h-4 w-4 text-red-400" />
                                Step 4 · Detect breaches & clean up
                            </div>
                            <p className="text-sm font-medium">
                                See which accounts were breached and what to close.
                            </p>
                            <p className="text-xs text-muted-foreground">
                                GhostSweep cross-checks your services against known{" "}
                                <span className="font-medium text-foreground">
                                    data breaches
                                </span>{" "}
                                and highlights risky accounts. Pro users can track deletion
                                requests and get templates to help shut them down faster.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Demo section (video placeholder) */}
                <section className="space-y-4">
                    <div className="space-y-2">
                        <h2 className="text-xl font-semibold tracking-tight">
                            See GhostSweep in action
                        </h2>
                        <p className="max-w-xl text-sm text-muted-foreground">
                            Here&apos;s a quick walkthrough of a real scan: from connecting
                            Gmail to reviewing services, breaches, and privacy requests.
                        </p>
                    </div>

                    <div className="rounded-xl border border-white/10 bg-[#050505] p-3">
                        <div className="aspect-video w-full rounded-lg border border-white/10 bg-linear-to-br from-slate-900 via-slate-950 to-black flex items-center justify-center text-xs text-muted-foreground">
                            {/* Replace this with a real <video> or embed once ready */}
                            Demo video coming soon — a real GhostSweep scan from inbox to cleanup.
                        </div>
                    </div>
                </section>

                {/* What Free vs Professional actually do */}
                <section className="space-y-6">
                    <div className="space-y-2">
                        <h2 className="text-xl font-semibold tracking-tight">
                            What happens on Free vs Professional scans
                        </h2>
                        <p className="max-w-xl text-sm text-muted-foreground">
                            Both tiers respect your privacy. The difference is how deep we
                            scan and how much ongoing monitoring you get.
                        </p>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 text-xs">
                        {/* Free */}
                        <div className="space-y-3 rounded-xl border border-white/10 bg-[#050505] p-4">
                            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                                Free · One scan per month
                            </p>
                            <ul className="space-y-1 text-muted-foreground">
                                <li>• Scan your inbox once</li>
                                <li>• See up to 15 accounts</li>
                                <li>• Basic breach check (yes/no only)</li>
                                <li>• No ongoing monitoring</li>
                                <li>• No deletion tracking</li>
                            </ul>
                            <Link
                                href="/login"
                                className="mt-2 inline-flex items-center gap-1 rounded-full border border-white/20 px-4 py-1.5 text-[11px] font-medium hover:bg-white/5"
                            >
                                Run your free scan
                                <ArrowRight className="h-3 w-3" />
                            </Link>
                        </div>

                        {/* Professional */}
                        <div className="space-y-3 rounded-xl border border-primary/50 bg-primary/5 p-4">
                            <div className="flex items-center justify-between">
                                <p className="text-[11px] font-semibold uppercase tracking-wide text-primary">
                                    Professional · Ongoing protection
                                </p>
                                <span className="rounded-full bg-primary/20 px-2.5 py-0.5 text-[10px] font-medium text-primary-foreground/90">
                                    Most popular
                                </span>
                            </div>
                            <ul className="space-y-1 text-muted-foreground">
                                <li>• Unlimited inbox scans</li>
                                <li>• See ALL accounts (not just 50)</li>
                                <li>• Full breach history with details</li>
                                <li>• Auto-detect new accounts</li>
                                <li>• Deletion request templates</li>
                                <li>• Track deletion progress</li>
                                <li>• Email alerts for new breaches</li>
                            </ul>
                            <Link
                                href="/dashboard/billing?plan=monthly"
                                className="mt-2 inline-flex items-center gap-1 rounded-full bg-primary px-4 py-1.5 text-[11px] font-medium text-primary-foreground shadow-sm hover:opacity-90"
                            >
                                Upgrade to Professional
                                <ArrowRight className="h-3 w-3" />
                            </Link>
                        </div>
                    </div>
                </section>

                {/* Behind the scenes: signals we look at */}
                <section className="space-y-6">
                    <div className="space-y-2">
                        <h2 className="text-xl font-semibold tracking-tight">
                            What GhostSweep looks for under the hood
                        </h2>
                        <p className="max-w-xl text-sm text-muted-foreground">
                            We use common email patterns to infer where your data lives —
                            without opening or storing the message contents.
                        </p>
                    </div>

                    <div className="grid gap-4 md:grid-cols-3 text-xs">
                        <div className="space-y-2 rounded-lg border border-white/10 bg-[#050505] p-3">
                            <div className="flex items-center gap-2">
                                <MailSearch className="h-3.5 w-3.5 text-primary" />
                                <p className="font-medium">Account & signup emails</p>
                            </div>
                            <p className="text-muted-foreground">
                                Subjects like &quot;Welcome to Netflix&quot;, &quot;Your Spotify account&quot;,
                                &quot;Verify your email&quot;, reveal where you&apos;ve signed up.
                            </p>
                        </div>

                        <div className="space-y-2 rounded-lg border border-white/10 bg-[#050505] p-3">
                            <div className="flex items-center gap-2">
                                <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                                <p className="font-medium">Security & login alerts</p>
                            </div>
                            <p className="text-muted-foreground">
                                Password resets, new device logins, and unusual activity emails
                                indicate active accounts that deserve attention.
                            </p>
                        </div>

                        <div className="space-y-2 rounded-lg border border-white/10 bg-[#050505] p-3">
                            <div className="flex items-center gap-2">
                                <Trash2 className="h-3.5 w-3.5 text-primary" />
                                <p className="font-medium">Cancellation & deletion emails</p>
                            </div>
                            <p className="text-muted-foreground">
                                Messages about account closure or &quot;we&apos;re sad to see
                                you go&quot; help identify where data might already be removed.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Monitoring & alerts */}
                <section className="space-y-6">
                    <div className="space-y-2">
                        <h2 className="text-xl font-semibold tracking-tight">
                            What ongoing monitoring looks like
                        </h2>
                        <p className="max-w-xl text-sm text-muted-foreground">
                            Professional users get quiet, useful alerts instead of noisy
                            dashboards.
                        </p>
                    </div>

                    <div className="grid gap-4 md:grid-cols-3 text-xs">
                        <div className="space-y-2 rounded-lg border border-white/10 bg-[#050505] p-3">
                            <div className="flex items-center gap-2">
                                <Bell className="h-3.5 w-3.5 text-primary" />
                                <p className="font-medium">New account detection</p>
                            </div>
                            <p className="text-muted-foreground">
                                When GhostSweep spots &quot;Welcome&quot; / &quot;Account
                                created&quot; style emails from a service you&apos;ve never seen
                                before, you get a gentle alert.
                            </p>
                        </div>

                        <div className="space-y-2 rounded-lg border border-white/10 bg-[#050505] p-3">
                            <div className="flex items-center gap-2">
                                <AlertTriangle className="h-3.5 w-3.5 text-red-400" />
                                <p className="font-medium">New breach exposure</p>
                            </div>
                            <p className="text-muted-foreground">
                                If a service tied to your inbox appears in a new breach record,
                                GhostSweep can flag it so you can reset passwords or close the
                                account.
                            </p>
                        </div>

                        <div className="space-y-2 rounded-lg border border-white/10 bg-[#050505] p-3">
                            <div className="flex items-center gap-2">
                                <Trash2 className="h-3.5 w-3.5 text-primary" />
                                <p className="font-medium">Deletion request tracking</p>
                            </div>
                            <p className="text-muted-foreground">
                                Track which services you&apos;ve asked to delete or reduce data
                                usage, and see when they reply or complete your request.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Privacy reassurance */}
                <section className="space-y-4 rounded-xl border border-white/10 bg-[#050505] p-5 text-xs">
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-2">
                            <EyeOff className="h-3.5 w-3.5 text-primary" />
                            <span className="font-medium">No email content access</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Lock className="h-3.5 w-3.5 text-primary" />
                            <span className="font-medium">Encrypted tokens</span>
                        </div>
                    </div>
                    <p className="text-muted-foreground">
                        GhostSweep uses Google&apos;s official OAuth2 flow and only ever
                        reads metadata (From, Subject, Date). OAuth tokens are stored
                        encrypted, and you can disconnect and wipe your scan history at any
                        time. For full details, see the{" "}
                        <Link
                            href="/home/security"
                            className="text-primary underline-offset-2 hover:underline"
                        >
                            Security page
                        </Link>
                        .
                    </p>
                </section>

                {/* Final CTA */}
                <section className="space-y-4 rounded-xl border border-white/10 bg-[#050505] p-5">
                    <h2 className="text-lg font-semibold tracking-tight">
                        Ready to see who has your data?
                    </h2>
                    <p className="max-w-xl text-sm text-muted-foreground">
                        Run a private, read-only scan and get a clear map of your accounts,
                        breaches, and privacy opportunities in a few minutes.
                    </p>
                    <div className="flex flex-wrap items-center gap-3">
                        <Link
                            href="/login"
                            className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-xs font-medium text-primary-foreground shadow-sm transition hover:opacity-90"
                        >
                            Start your free scan
                            <ArrowRight className="h-3 w-3" />
                        </Link>
                        <Link
                            href="/home#pricing"
                            className="text-[11px] text-muted-foreground hover:text-foreground"
                        >
                            Compare Free vs Professional →
                        </Link>
                    </div>
                </section>
            </div>
        </main>
    );
}