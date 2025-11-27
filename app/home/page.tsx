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
            {/* Top nav */}
            {/* <header className="border-b border-white/10 bg-black/40 backdrop-blur-sm">
                <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/15">
                            <span className="text-sm">👻</span>
                        </div>
                        <span className="text-sm font-semibold tracking-tight">
                            GhostSweep
                        </span>
                    </Link>

                    <nav className="hidden items-center gap-6 text-xs text-muted-foreground md:flex">
                        <Link href="/how-it-works" className="hover:text-foreground">
                            How it works
                        </Link>
                        <Link href="/security" className="hover:text-foreground">
                            Security
                        </Link>
                        <Link href="/blogs" className="hover:text-foreground">
                            Blog
                        </Link>
                        <Link href="/breach-check" className="hover:text-foreground">
                            Breach checker
                        </Link>
                        <a href="#pricing" className="hover:text-foreground">
                            Pricing
                        </a>
                    </nav>

                    <div className="flex items-center gap-2">
                        <Link
                            href="/login"
                            className="hidden text-xs text-muted-foreground hover:text-foreground md:inline-flex"
                        >
                            Log in
                        </Link>
                        <Link
                            href="/login"
                            className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-1.5 text-xs font-medium text-primary-foreground shadow-sm hover:opacity-90"
                        >
                            Start free scan
                            <ArrowRight className="h-3 w-3" />
                        </Link>
                    </div>
                </div>
            </header> */}

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
                                    Know who has your data.
                                    <br />
                                    Take back control.
                                </h1>
                                <p className="max-w-xl text-sm text-muted-foreground">
                                    GhostSweep scans your inbox (metadata only) to uncover every
                                    account, breach, and hidden service holding your personal
                                    data. Get a clear map of your digital footprint — then clean
                                    it up.
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

                            {/* Waitlist */}
                            <div className="mt-4 rounded-xl border border-white/10 bg-black/40 p-3">
                                <p className="text-[11px] font-medium text-muted-foreground mb-2">
                                    Not ready to connect yet?
                                </p>
                                <p className="text-[11px] text-muted-foreground mb-2">
                                    Join the GhostSweep update list to hear when new features launch:
                                    breach checker, CASA certification, and more.
                                </p>
                                <form
                                    action="/api/waitlist"
                                    method="POST"
                                    className="flex flex-col gap-2 sm:flex-row"
                                >
                                    <input
                                        name="email"
                                        type="email"
                                        required
                                        placeholder="you@example.com"
                                        className="flex-1 rounded-full border border-white/15 bg-black/60 px-3 py-1.5 text-xs outline-none focus-visible:ring-1 focus-visible:ring-primary"
                                    />
                                    <button
                                        type="submit"
                                        className="inline-flex items-center justify-center rounded-full bg-white px-3 py-1.5 text-[11px] font-medium text-black hover:bg-zinc-200 transition"
                                    >
                                        Join waitlist
                                    </button>
                                </form>
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
                                    Disconnect & delete data anytime
                                </div>
                            </div>
                        </div>

                        {/* Right: video demo / fake player */}
                        <div className="rounded-2xl border border-white/10 bg-[#050505] p-3 shadow-lg">
                            <div className="flex items-center justify-between text-[11px] text-muted-foreground mb-2">
                                <span className="inline-flex items-center gap-1">
                                    <PlayCircle className="h-3 w-3 text-primary" />
                                    Product demo
                                </span>
                                <span>1:42 · Overview</span>
                            </div>
                            <div className="relative aspect-video overflow-hidden rounded-xl border border-white/10 bg-black/60">
                                {/* Replace this div with an actual <video> or <iframe> when ready */}
                                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                                    <button className="flex h-12 w-12 items-center justify-center rounded-full bg-white/90 text-black shadow-lg">
                                        <PlayCircle className="h-6 w-6" />
                                    </button>
                                    <p className="text-[11px] text-muted-foreground">
                                        GhostSweep dashboard walkthrough (coming soon)
                                    </p>
                                </div>
                            </div>

                            {/* Tiny stats row */}
                            <div className="mt-3 grid gap-2 text-[11px] text-muted-foreground sm:grid-cols-3">
                                <div className="rounded-lg border border-white/10 bg-black/40 p-2">
                                    <p>Services found</p>
                                    <p className="mt-1 text-lg font-semibold text-foreground">86</p>
                                </div>
                                <div className="rounded-lg border border-white/10 bg-black/40 p-2">
                                    <p>Breaches linked</p>
                                    <p className="mt-1 text-lg font-semibold text-red-400">4</p>
                                </div>
                                <div className="rounded-lg border border-white/10 bg-black/40 p-2">
                                    <p>Security score</p>
                                    <p className="mt-1 text-lg font-semibold text-emerald-400">
                                        78 / 100
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* HOW IT WORKS TEASER (with link to full page) */}
                <section id="how" className="space-y-6">
                    <div className="flex flex-wrap items-baseline justify-between gap-3">
                        <div className="space-y-2">
                            <h2 className="text-xl font-semibold tracking-tight">
                                A private audit of everywhere your data lives
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
                                1. Connect (read-only OAuth)
                            </p>
                            <p className="text-xs text-muted-foreground">
                                We use Google OAuth with Gmail read-only permissions. GhostSweep
                                cannot send, delete, or change emails.
                            </p>
                        </div>
                        <div className="space-y-2 rounded-lg border border-white/10 bg-black/40 p-3">
                            <p className="text-[11px] font-semibold text-muted-foreground">
                                2. Analyze metadata only
                            </p>
                            <p className="text-xs text-muted-foreground">
                                We only see sender, subject, and timestamps to detect services,
                                logins, billing, and security alerts.
                            </p>
                        </div>
                        <div className="space-y-2 rounded-lg border border-white/10 bg-black/40 p-3">
                            <p className="text-[11px] font-semibold text-muted-foreground">
                                3. Map services & breaches
                            </p>
                            <p className="text-xs text-muted-foreground">
                                View every account tied to your inbox and see which ones appear
                                in known data breaches.
                            </p>
                        </div>
                        <div className="space-y-2 rounded-lg border border-white/10 bg-black/40 p-3">
                            <p className="text-[11px] font-semibold text-muted-foreground">
                                4. Take action
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Use deletion templates and privacy request tracking (Professional)
                                to shrink your footprint over time.
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
                                Check if your email appears in known breaches
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Quickly test an address against breach databases. GhostSweep
                                helps you understand where your data may have leaked.
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
                                Practical guides on data hygiene
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Learn how to reduce your digital footprint, understand breaches,
                                and use privacy laws in your favor.
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
                            Built as a privacy tool first, product second
                        </h2>
                        <p className="max-w-xl text-sm text-muted-foreground">
                            GhostSweep is designed to minimize data access, not maximize it.
                            We only ask for what we need to answer one question:{" "}
                            <span className="font-medium text-foreground">
                                “Where does my data live?”
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
                            Start free. Upgrade to Professional if you need more.
                        </h2>
                        <p className="max-w-xl text-sm text-muted-foreground">
                            The free plan gives you a meaningful snapshot of your digital
                            footprint. Professional unlocks unlimited sweeps, breach alerts,
                            new account detection, and deletion tracking.
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
                                <li>• 1 inbox sweep per month</li>
                                <li>• Service discovery from recent email activity</li>
                                <li>• Basic breach visibility for detected services</li>
                                <li>• Manual privacy actions</li>
                                <li>• Disconnect & delete your data anytime</li>
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
                                    Best for ongoing protection
                                </span>
                            </div>
                            <div className="flex items-baseline gap-3">
                                <div>
                                    <p className="text-2xl font-semibold">$7.99</p>
                                    <p className="text-xs text-muted-foreground"> / month</p>
                                </div>
                                <div className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-2 py-1 text-[10px]">
                                    Yearly: <span className="font-semibold">$79.99 / year</span>{" "}
                                    · Save ~16.5%
                                </div>
                            </div>
                            <ul className="space-y-1 text-xs text-muted-foreground">
                                <li>• Unlimited inbox sweeps</li>
                                <li>• Full service discovery (including older + hidden accounts)</li>
                                <li>• Full breach history visibility and new breach alerts</li>
                                <li>• New Account Detection via ongoing scans</li>
                                <li>• Deletion tracking & privacy request templates</li>
                                <li>• Privacy request status emails & dashboard tracking</li>
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
                            Connecting email to a privacy tool is a big deal. These are the
                            questions we think you should ask any product like GhostSweep.
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
                        still hold your data. Find forgotten accounts, review breached
                        services, and start shrinking your digital footprint.
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