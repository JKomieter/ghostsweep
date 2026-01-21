import Link from "next/link";
import { Metadata } from "next";
import {
    Shield,
    Lock,
    Eye,
    EyeOff,
    Database,
    Server,
    Users,
    AlertCircle,
    CheckCircle,
    ExternalLink,
    ArrowRight,
    Send,
    Mail,
    Trash2,
} from "lucide-react";

export const metadata: Metadata = {
    title: "Security & Privacy | How GhostSweep Protects Your Data",
    description: "Learn how GhostSweep securely scans your email using metadata-only analysis, Google OAuth, and privacy-first design. CASA certified and Google verified.",
    keywords: [
        "email security",
        "privacy protection",
        "OAuth security",
        "data privacy",
        "email scanning security",
        "CCPA compliant",
        "GDPR compliant",
        "data encryption",
        "metadata analysis",
        "privacy certification",
    ],
    openGraph: {
        title: "Security & Privacy | How GhostSweep Protects Your Data",
        description: "Discover how GhostSweep securely protects your privacy with metadata-only scanning and Google OAuth verification.",
        url: "https://ghostsweep.com/home/security",
        type: "website",
    },
    alternates: {
        canonical: "https://ghostsweep.com/home/security",
    },
};

// Organization schema for security page
const securityPageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Security & Privacy | How GhostSweep Protects Your Data",
    "description": "Learn how GhostSweep securely scans your email using metadata-only analysis, Google OAuth, and privacy-first design.",
    "url": "https://ghostsweep.com/home/security",
    "publisher": {
        "@type": "Organization",
        "name": "GhostSweep",
        "logo": {
            "@type": "ImageObject",
            "url": "https://znlaksqttxokoeavwqjf.supabase.co/storage/v1/object/public/news/ghost-svgrepo-com.png",
        },
        "sameAs": [
            "https://twitter.com/ghostsweep",
            "https://ghostsweep.com",
        ],
    },
};

export default function SecurityPage() {
    return (
        <main className="min-h-screen text-foreground bg-linear-to-b from-[#020308] via-black to-[#050608]">
            {/* JSON-LD Structured Data */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(securityPageSchema) }}
            />

            <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pb-20 pt-12 space-y-16">
                {/* HERO */}
                <section className="space-y-8">
                    <div className="text-center space-y-5 max-w-3xl mx-auto">
                        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-[11px] text-emerald-200">
                            <Shield className="h-3 w-3" />
                            Google OAuth · Metadata-only scanning · You control all actions
                        </div>

                        <div className="space-y-3">
                            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight leading-tight">
                                How GhostSweep Protects Your Data
                            </h1>
                            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                                GhostSweep helps you understand which services are linked to your email and
                                gives you tools to clean up. This page explains what we can access, what we
                                store, and how you stay in control.
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <Link
                                href="/login"
                                className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-7 py-2.5 text-xs sm:text-sm font-medium text-primary-foreground shadow-sm hover:opacity-90 transition"
                            >
                                Start a free scan
                                <ArrowRight className="h-3.5 w-3.5" />
                            </Link>

                            <Link
                                href="/home/privacy"
                                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 px-7 py-2.5 text-xs sm:text-sm font-medium hover:bg-white/5 transition"
                            >
                                Read privacy policy
                                <ExternalLink className="h-4 w-4" />
                            </Link>
                        </div>
                    </div>

                    {/* At a glance */}
                    <div className="grid gap-4 md:grid-cols-3 text-xs sm:text-sm">
                        <div className="rounded-xl border border-white/10 bg-black/40 p-4 space-y-1.5">
                            <p className="font-medium flex items-center gap-2">
                                <EyeOff className="h-3.5 w-3.5 text-emerald-400" />
                                We don’t store email bodies
                            </p>
                            <p className="text-muted-foreground">
                                Scans are designed to minimize access and avoid storing full email content or attachments
                                in GhostSweep.
                            </p>
                        </div>

                        <div className="rounded-xl border border-white/10 bg-black/40 p-4 space-y-1.5">
                            <p className="font-medium flex items-center gap-2">
                                <Lock className="h-3.5 w-3.5 text-primary" />
                                Permissioned access only
                            </p>
                            <p className="text-muted-foreground">
                                Email access is granted via Google or Microsoft OAuth and can be revoked at any time from your Google or Microsoft account.
                            </p>
                        </div>

                        <div className="rounded-xl border border-white/10 bg-black/40 p-4 space-y-1.5">
                            <p className="font-medium flex items-center gap-2">
                                <Shield className="h-3.5 w-3.5 text-emerald-400" />
                                Minimal storage
                            </p>
                            <p className="text-muted-foreground">
                                We store only what’s needed for your dashboard: detected services, breach matches, and deletion
                                tracking status.
                            </p>
                        </div>
                    </div>
                </section>

                {/* KEY PRINCIPLE */}
                <section className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-6 sm:p-8 md:p-10">
                    <div className="flex flex-col md:flex-row items-start gap-4 md:gap-6">
                        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-500/25 shrink-0">
                            <EyeOff className="h-5 w-5 text-emerald-200" />
                        </div>

                        <div className="space-y-3">
                            <h2 className="text-lg sm:text-xl font-semibold text-emerald-50">
                                Core Principle: Minimize Access, Maximize Control
                            </h2>

                            <p className="text-xs sm:text-sm text-emerald-50/90 leading-relaxed max-w-3xl">
                                GhostSweep is built to keep your inbox private. We focus on{" "}
                                <span className="font-semibold">account signals</span> (like sender, subject, and timestamps)
                                to build your service list and surface risk. When you choose to take action (like sending a deletion request),
                                the app will only do so with your explicit confirmation.
                            </p>

                            <div className="grid gap-2 sm:grid-cols-3 text-xs">
                                <div className="inline-flex items-start gap-2">
                                    <CheckCircle className="h-4 w-4 text-emerald-300 mt-0.5 shrink-0" />
                                    <span>No storing full email bodies.</span>
                                </div>
                                <div className="inline-flex items-start gap-2">
                                    <CheckCircle className="h-4 w-4 text-emerald-300 mt-0.5 shrink-0" />
                                    <span>Deletion emails sent only after you preview and approve.</span>
                                </div>
                                <div className="inline-flex items-start gap-2">
                                    <CheckCircle className="h-4 w-4 text-emerald-300 mt-0.5 shrink-0" />
                                    <span>Disconnect & wipe scan data anytime.</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* PERMISSIONS */}
                <section className="space-y-8">
                    <div className="text-center space-y-2 max-w-3xl mx-auto">
                        <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">
                            Exactly What GhostSweep Can Access
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            Permissions are granted via Google OAuth. We request only what’s needed for the features you use.
                        </p>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                        {/* CAN ACCESS */}
                        <div className="space-y-5 rounded-2xl border border-white/10 bg-black/40 p-6">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20">
                                    <Eye className="h-5 w-5 text-primary" />
                                </div>
                                <h3 className="text-sm sm:text-base font-semibold">
                                    What we access (via Gmail and Outlook)
                                </h3>
                            </div>

                            <p className="text-xs sm:text-sm text-muted-foreground">
                                Access is scoped and permissioned. GhostSweep does not see your Google password and cannot bypass OAuth controls.
                            </p>

                            <div className="space-y-4">
                                <div>
                                    <h4 className="text-xs font-semibold text-primary mb-1.5 uppercase tracking-wide">
                                        For scanning (account discovery)
                                    </h4>
                                    <ul className="space-y-1.5 text-xs sm:text-sm text-muted-foreground">
                                        <li className="flex items-start gap-2">
                                            <CheckCircle className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                                            <span>Sender addresses (who sent the email)</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <CheckCircle className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                                            <span>Subject lines (e.g., “Welcome”, “Receipt”, “Verify your email”)</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <CheckCircle className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                                            <span>Timestamps and basic message metadata</span>
                                        </li>
                                    </ul>
                                </div>

                                <div>
                                    <h4 className="text-xs font-semibold text-primary mb-1.5 uppercase tracking-wide">
                                        Optional: For deletion requests (only when you choose)
                                    </h4>
                                    <ul className="space-y-1.5 text-xs sm:text-sm text-muted-foreground">
                                        <li className="flex items-start gap-2">
                                            <Send className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                                            <span>
                                                Send deletion request emails when you click <span className="font-medium text-foreground">Start Deletion</span>
                                            </span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <Mail className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                                            <span>
                                                Track deletion request status (which services were contacted, when, and reply status)
                                            </span>
                                        </li>
                                    </ul>

                                    <p className="mt-2 text-[11px] text-muted-foreground">
                                        If you prefer, you can choose a workflow that opens the provider’s deletion page (no email sent),
                                        or you can disconnect your email after sending.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* CANNOT ACCESS */}
                        <div className="space-y-5 rounded-2xl border border-red-500/35 bg-red-500/5 p-6">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/20">
                                    <EyeOff className="h-5 w-5 text-red-300" />
                                </div>
                                <h3 className="text-sm sm:text-base font-semibold">
                                    What we never access / do
                                </h3>
                            </div>

                            <p className="text-xs sm:text-sm text-muted-foreground">
                                These are hard constraints—by design and by policy.
                            </p>

                            <ul className="space-y-2.5 text-xs sm:text-sm">
                                <li className="flex items-start gap-3 rounded-lg bg-black/40 p-3">
                                    <span className="text-red-400 text-base shrink-0">✕</span>
                                    <div>
                                        <p className="font-medium">Sell data or run ads</p>
                                        <p className="text-[11px] text-muted-foreground mt-1">
                                            We do not sell, rent, or share your email data for advertising.
                                        </p>
                                    </div>
                                </li>

                                <li className="flex items-start gap-3 rounded-lg bg-black/40 p-3">
                                    <span className="text-red-400 text-base shrink-0">✕</span>
                                    <div>
                                        <p className="font-medium">Automatic deletions</p>
                                        <p className="text-[11px] text-muted-foreground mt-1">
                                            We never delete accounts or send emails without your explicit approval. You preview every action first.
                                        </p>
                                    </div>
                                </li>

                                <li className="flex items-start gap-3 rounded-lg bg-black/40 p-3">
                                    <span className="text-red-400 text-base shrink-0">✕</span>
                                    <div>
                                        <p className="font-medium">Bulk mailbox export</p>
                                        <p className="text-[11px] text-muted-foreground mt-1">
                                            We don’t keep a copy of your full mailbox or export it to our servers.
                                        </p>
                                    </div>
                                </li>

                                <li className="flex items-start gap-3 rounded-lg bg-black/40 p-3">
                                    <span className="text-red-400 text-base shrink-0">✕</span>
                                    <div>
                                        <p className="font-medium">Password access</p>
                                        <p className="text-[11px] text-muted-foreground mt-1">
                                            OAuth means GhostSweep never sees your Google password.
                                        </p>
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </div>
                </section>

                {/* WHAT WE STORE */}
                <section className="space-y-8">
                    <div className="text-center space-y-2 max-w-3xl mx-auto">
                        <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">
                            What We Store (and What We Don’t)
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            We store only what’s needed to power your dashboard and deletion tracking.
                        </p>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-5 rounded-2xl border border-white/10 bg-black/40 p-6">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20">
                                    <Database className="h-5 w-5 text-primary" />
                                </div>
                                <h3 className="text-sm sm:text-base font-semibold">
                                    Stored in GhostSweep
                                </h3>
                            </div>

                            <ul className="space-y-3 text-xs sm:text-sm text-muted-foreground">
                                <li className="flex items-start gap-3">
                                    <CheckCircle className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                                    <div>
                                        <p className="font-medium text-foreground">Account profile</p>
                                        <p className="text-[11px] mt-1">Email + basic settings.</p>
                                    </div>
                                </li>

                                <li className="flex items-start gap-3">
                                    <CheckCircle className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                                    <div>
                                        <p className="font-medium text-foreground">Detected services</p>
                                        <p className="text-[11px] mt-1">
                                            Service/domain + activity indicators (first seen, last seen, email count).
                                        </p>
                                    </div>
                                </li>

                                <li className="flex items-start gap-3">
                                    <CheckCircle className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                                    <div>
                                        <p className="font-medium text-foreground">Breach matches</p>
                                        <p className="text-[11px] mt-1">
                                            Which services appear in public breach datasets (sourced from Have I Been Pwned and similar databases).
                                        </p>
                                    </div>
                                </li>

                                <li className="flex items-start gap-3">
                                    <CheckCircle className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                                    <div>
                                        <p className="font-medium text-foreground">Deletion request tracking</p>
                                        <p className="text-[11px] mt-1">
                                            Which services you started deletion for, timestamps, and status (pending / completed).
                                        </p>
                                    </div>
                                </li>
                            </ul>
                        </div>

                        <div className="space-y-5 rounded-2xl border border-emerald-500/35 bg-emerald-500/5 p-6">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/20">
                                    <Shield className="h-5 w-5 text-emerald-300" />
                                </div>
                                <h3 className="text-sm sm:text-base font-semibold">Never stored</h3>
                            </div>

                            <ul className="space-y-3 text-xs sm:text-sm text-muted-foreground">
                                <li className="flex items-start gap-3">
                                    <span className="text-emerald-300 text-base shrink-0">✓</span>
                                    <div>
                                        <p className="font-medium text-foreground">Email bodies</p>
                                        <p className="text-[11px] mt-1">We don’t store full message content.</p>
                                    </div>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="text-emerald-300 text-base shrink-0">✓</span>
                                    <div>
                                        <p className="font-medium text-foreground">Attachments and files</p>
                                        <p className="text-[11px] mt-1">No PDFs, images, or documents are stored.</p>
                                    </div>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="text-emerald-300 text-base shrink-0">✓</span>
                                    <div>
                                        <p className="font-medium text-foreground">Passwords or credentials</p>
                                        <p className="text-[11px] mt-1">We never see your Google password or any passwords from emails. OAuth only.</p>
                                    </div>
                                </li>
                            </ul>

                            <div className="pt-4 border-t border-white/10">
                                <p className="text-[11px] text-muted-foreground">
                                    You can disconnect your email at any time. If you also delete your scan data, we remove stored service
                                    summaries and deletion tracking records associated with your account.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* SECURITY MEASURES */}
                <section className="space-y-8">
                    <div className="text-center space-y-2 max-w-3xl mx-auto">
                        <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">
                            How We Secure GhostSweep
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            Encryption, infrastructure, and access controls.
                        </p>
                    </div>

                    <div className="grid gap-6 md:grid-cols-3">
                        <div className="space-y-3 rounded-2xl border border-white/10 bg-black/40 p-5">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20">
                                <Lock className="h-5 w-5 text-primary" />
                            </div>
                            <h3 className="text-sm font-semibold">Encryption</h3>
                            <ul className="space-y-1.5 text-xs text-muted-foreground">
                                <li>Tokens stored encrypted at rest.</li>
                                <li>All traffic over HTTPS / TLS.</li>
                                <li>Database encryption at rest (provider-managed).</li>
                            </ul>
                        </div>

                        <div className="space-y-3 rounded-2xl border border-white/10 bg-black/40 p-5">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20">
                                <Server className="h-5 w-5 text-primary" />
                            </div>
                            <h3 className="text-sm font-semibold">Infrastructure</h3>
                            <ul className="space-y-1.5 text-xs text-muted-foreground">
                                <li>Managed Postgres for persistence.</li>
                                <li>Restricted admin access.</li>
                                <li>Server-side processing for sensitive operations.</li>
                            </ul>
                        </div>

                        <div className="space-y-3 rounded-2xl border border-white/10 bg-black/40 p-5">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20">
                                <Shield className="h-5 w-5 text-primary" />
                            </div>
                            <h3 className="text-sm font-semibold">Access control</h3>
                            <ul className="space-y-1.5 text-xs text-muted-foreground">
                                <li>Least-privilege OAuth scopes.</li>
                                <li>Scoped database policies per user.</li>
                                <li>No ad trackers selling user data.</li>
                            </ul>
                        </div>
                    </div>
                </section>

                {/* THIRD PARTIES */}
                <section className="space-y-8">
                    <div className="text-center space-y-2 max-w-3xl mx-auto">
                        <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">
                            Third-Party Services We Rely On
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            Trusted vendors that help us run GhostSweep.
                        </p>
                    </div>

                    <div className="grid gap-5 md:grid-cols-3 text-xs sm:text-sm">
                        <div className="space-y-2 rounded-xl border border-white/10 bg-black/40 p-5">
                            <div className="flex items-center gap-2">
                                <Users className="h-4 w-4 text-primary" />
                                <p className="font-medium">Google</p>
                            </div>
                            <p className="text-muted-foreground">
                                Email APIs and OAuth permissions to scan and (optionally) send deletion request emails when you choose.
                            </p>
                        </div>

                        <div className="space-y-2 rounded-xl border border-white/10 bg-black/40 p-5">
                            <div className="flex items-center gap-2">
                                <Lock className="h-4 w-4 text-primary" />
                                <p className="font-medium">Stripe</p>
                            </div>
                            <p className="text-muted-foreground">
                                Handles all payment data. GhostSweep never stores card numbers.
                            </p>
                        </div>

                        <div className="space-y-2 rounded-xl border border-white/10 bg-black/40 p-5">
                            <div className="flex items-center gap-2">
                                <Database className="h-4 w-4 text-primary" />
                                <p className="font-medium">Hosting / Infra</p>
                            </div>
                            <p className="text-muted-foreground">
                                Vercel (frontend) plus managed database infrastructure.
                            </p>
                        </div>
                    </div>

                    <div className="rounded-lg border border-white/10 bg-black/40 p-4 text-center text-xs sm:text-sm text-muted-foreground">
                        Providers are used only to operate GhostSweep and are not permitted to use your data for advertising or resale.
                    </div>
                </section>

                {/* YOUR RIGHTS */}
                <section className="space-y-8 rounded-2xl border border-primary/40 bg-primary/5 p-6 sm:p-8 md:p-10">
                    <div className="text-center space-y-2">
                        <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">
                            Your Control
                        </h2>
                        <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl mx-auto">
                            GhostSweep is designed so you can disconnect, delete, and stay in control of actions.
                        </p>
                    </div>

                    <div className="grid gap-5 md:grid-cols-2 text-xs sm:text-sm">
                        {[
                            {
                                title: "Disconnect anytime",
                                body: "Revoke email access from GhostSweep or directly from your Google/Microsoft account settings.",
                            },
                            {
                                title: "Delete your data",
                                body: "Request deletion and we’ll remove your scan summaries and tracking data from our systems (subject to legal requirements).",
                            },
                            {
                                title: "Choose how you act",
                                body: "For deletion, you may open provider pages, send emails, or do nothing—GhostSweep follows your choices.",
                                icon: <Trash2 className="h-4 w-4 text-primary" />,
                            },
                            {
                                title: "Email preferences",
                                body: "Control alerts and notifications where supported.",
                            },
                        ].map((item) => (
                            <div key={item.title} className="flex items-start gap-3">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20 shrink-0">
                                    {item.icon ?? <CheckCircle className="h-4 w-4 text-primary" />}
                                </div>
                                <div>
                                    <h3 className="font-medium mb-0.5">{item.title}</h3>
                                    <p className="text-muted-foreground">{item.body}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* REPORT */}
                <section className="grid gap-8 md:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
                    <div className="space-y-5 rounded-2xl border border-emerald-500/35 bg-emerald-500/5 p-6 md:p-7 text-center md:text-left">
                        <h2 className="text-lg sm:text-xl font-semibold">
                            Verify permissions yourself
                        </h2>
                        <p className="text-xs sm:text-sm text-muted-foreground max-w-xl">
                            You can see exactly what access GhostSweep has from your Google account page at any time.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
                            <a
                                href="https://myaccount.google.com/permissions"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-500 px-6 py-2.5 text-xs sm:text-sm font-medium text-black hover:bg-emerald-600 transition"
                            >
                                Check OAuth permissions
                                <ExternalLink className="h-3.5 w-3.5" />
                            </a>

                            <Link
                                href="/home/privacy"
                                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 px-6 py-2.5 text-xs sm:text-sm font-medium hover:bg-white/5 transition"
                            >
                                Read privacy policy
                                <ExternalLink className="h-4 w-4" />
                            </Link>
                        </div>

                        <p className="text-[11px] text-muted-foreground">
                            You control access from your Google account, and you can disconnect at any time.
                        </p>
                    </div>

                    <div className="space-y-4 rounded-2xl border border-red-500/30 bg-red-500/5 p-6 md:p-7">
                        <div className="flex items-start gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/20 shrink-0">
                                <AlertCircle className="h-5 w-5 text-red-300" />
                            </div>
                            <div className="space-y-2">
                                <h2 className="text-sm sm:text-base font-semibold">
                                    Report a security or privacy issue
                                </h2>
                                <p className="text-xs sm:text-sm text-muted-foreground">
                                    If you believe you’ve found a vulnerability or privacy issue in GhostSweep, please contact us directly.
                                </p>
                                <div className="flex flex-wrap gap-3 text-xs sm:text-sm">
                                    <a
                                        href="mailto:support@ghostsweep.com"
                                        className="inline-flex items-center gap-1.5 font-medium text-red-300 hover:text-red-200 transition"
                                    >
                                        support@ghostsweep.com
                                        <ExternalLink className="h-3.5 w-3.5" />
                                    </a>
                                    <a
                                        href="mailto:komieterj@gmail.com"
                                        className="inline-flex items-center gap-1.5 font-medium text-red-300 hover:text-red-200 transition"
                                    >
                                        komieterj@gmail.com
                                        <ExternalLink className="h-3.5 w-3.5" />
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* FINAL NOTE */}
                <section className="border-t border-white/10 pt-6 text-center">
                    <p className="text-xs sm:text-sm text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                        GhostSweep exists to give you visibility and control—not to become another data risk.
                        If anything on this page is unclear, email{" "}
                        <a href="mailto:support@ghostsweep.com" className="font-medium text-primary hover:underline">
                            support@ghostsweep.com
                        </a>{" "}
                        and we’ll clarify.
                    </p>
                </section>
            </div>
        </main>
    );
}