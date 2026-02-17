/* eslint-disable react/no-unescaped-entities */
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
    description:
        "Learn how GhostSweep securely scans your email using transient, zero-storage analysis, Google OAuth, and privacy-first design.",
    keywords: [
        "email security",
        "privacy protection",
        "OAuth security",
        "data privacy",
        "CASA certified",
        "transient analysis",
    ],
    openGraph: {
        title: "Security & Privacy | How GhostSweep Protects Your Data",
        description:
            "Discover how GhostSweep protects your privacy with transient, zero-storage scanning.",
        url: "https://ghostsweep.com/home/security",
        type: "website",
    },
    alternates: {
        canonical: "https://ghostsweep.com/home/security",
    },
};

const securityPageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Security & Privacy | How GhostSweep Protects Your Data",
    description:
        "Learn how GhostSweep securely scans your email using transient, zero-storage analysis.",
    url: "https://ghostsweep.com/home/security",
    publisher: {
        "@type": "Organization",
        name: "GhostSweep",
        logo: {
            "@type": "ImageObject",
            url: "https://znlaksqttxokoeavwqjf.supabase.co/storage/v1/object/public/news/ghost-svgrepo-com.png",
        },
    },
};

export default function SecurityPage() {
    return (
        <main className="min-h-screen bg-[#050505]">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(securityPageSchema),
                }}
            />

            <div className="mx-auto max-w-4xl px-6 pt-24 pb-20 sm:pt-32 space-y-20">
                {/* Hero */}
                <section className="text-center max-w-3xl mx-auto space-y-6">
                    <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs text-white/50">
                        <Shield className="h-3 w-3 text-emerald-400" />
                        Google OAuth · Zero-storage scanning · You control all actions
                    </div>

                    <h1 className="text-4xl sm:text-6xl font-semibold tracking-tight text-white leading-[1.08]">
                        Your security.
                        <br />
                        <span className="text-white/30">Our obsession.</span>
                    </h1>

                    <p className="mx-auto max-w-xl text-lg text-white/45 font-light leading-relaxed">
                        We help you find money and clean up accounts. That means your
                        security gets treated like a bank would — transient processing,
                        zero-knowledge storage, and you control every action.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Link
                            href="/login"
                            className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-500 px-8 py-3 text-sm font-semibold text-black transition hover:bg-emerald-400"
                        >
                            Start Secure Scan
                            <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                        <Link
                            href="/home/privacy"
                            className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm text-white/60 hover:text-white hover:bg-white/10 transition"
                        >
                            Read privacy policy
                            <ExternalLink className="h-3.5 w-3.5" />
                        </Link>
                    </div>
                </section>

                {/* At a glance */}
                <section className="grid gap-4 md:grid-cols-3">
                    {[
                        {
                            icon: EyeOff,
                            title: "We do NOT scan bank logins",
                            text: "We analyze receipts and confirmation emails. Your bank credentials never touch our servers.",
                        },
                        {
                            icon: Lock,
                            title: "Permissioned access only",
                            text: "Email access via Google or Microsoft OAuth. Revoke anytime from your Google/Microsoft account.",
                        },
                        {
                            icon: Shield,
                            title: "Minimal storage",
                            text: "We store only what's needed for your dashboard: detected services, breach matches, and deletion tracking.",
                        },
                    ].map((card) => (
                        <div
                            key={card.title}
                            className="rounded-2xl border border-white/5 bg-white/2 p-6"
                        >
                            <card.icon className="h-5 w-5 text-emerald-400 mb-3" />
                            <p className="text-sm font-medium text-white mb-1.5">
                                {card.title}
                            </p>
                            <p className="text-xs text-white/40 leading-relaxed">
                                {card.text}
                            </p>
                        </div>
                    ))}
                </section>

                {/* Core principle */}
                <section className="rounded-2xl border border-white/10 bg-white/3 p-8 sm:p-10">
                    <div className="flex items-start gap-5">
                        <div className="shrink-0 h-11 w-11 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                            <EyeOff className="h-5 w-5 text-emerald-400" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-white mb-3">
                                Core Principle: Minimize Access, Maximize Control
                            </h2>
                            <p className="text-sm text-white/45 leading-relaxed max-w-2xl mb-6">
                                GhostSweep focuses on account signals (sender, subject,
                                timestamps) to build your service list. When you take
                                action, it only happens with your explicit confirmation.
                            </p>
                            <div className="grid gap-3 sm:grid-cols-3 text-xs text-white/50">
                                {[
                                    "No storing full email bodies.",
                                    "Deletion emails sent only after you preview and approve.",
                                    "Disconnect & wipe scan data anytime.",
                                ].map((text) => (
                                    <div
                                        key={text}
                                        className="flex items-start gap-2"
                                    >
                                        <CheckCircle className="h-3.5 w-3.5 text-emerald-400/60 mt-0.5 shrink-0" />
                                        <span>{text}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Permissions */}
                <section className="space-y-10">
                    <div className="text-center space-y-3 max-w-2xl mx-auto">
                        <h2 className="text-3xl font-semibold tracking-tight text-white">
                            What GhostSweep can access
                        </h2>
                        <p className="text-sm text-white/40">
                            Permissions are granted via Google OAuth. We request only
                            what's needed.
                        </p>
                    </div>

                    <div className="grid gap-5 md:grid-cols-2">
                        {/* Can access */}
                        <div className="rounded-2xl border border-white/5 bg-white/2 p-7 space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center">
                                    <Eye className="h-5 w-5 text-white/60" />
                                </div>
                                <h3 className="text-sm font-medium text-white">
                                    What we access
                                </h3>
                            </div>
                            <p className="text-xs text-white/40">
                                Scoped and permissioned. GhostSweep never sees your
                                Google password.
                            </p>

                            <div className="space-y-5">
                                <div>
                                    <h4 className="text-[10px] uppercase tracking-widest text-white/25 mb-2">
                                        For value scanning
                                    </h4>
                                    <ul className="space-y-2 text-xs text-white/50">
                                        <li className="flex items-start gap-2">
                                            <CheckCircle className="h-3.5 w-3.5 text-emerald-400/60 mt-0.5 shrink-0" />
                                            Sender addresses
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <CheckCircle className="h-3.5 w-3.5 text-emerald-400/60 mt-0.5 shrink-0" />
                                            Subject lines
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <CheckCircle className="h-3.5 w-3.5 text-emerald-400/60 mt-0.5 shrink-0" />
                                            Body content (transiently scanned, never
                                            stored)
                                        </li>
                                    </ul>
                                </div>

                                <div>
                                    <h4 className="text-[10px] uppercase tracking-widest text-white/25 mb-2">
                                        For deletion requests (optional)
                                    </h4>
                                    <ul className="space-y-2 text-xs text-white/50">
                                        <li className="flex items-start gap-2">
                                            <Send className="h-3.5 w-3.5 text-white/30 mt-0.5 shrink-0" />
                                            Send deletion emails when you click Start
                                            Deletion
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <Mail className="h-3.5 w-3.5 text-white/30 mt-0.5 shrink-0" />
                                            Track deletion request status
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Cannot access */}
                        <div className="rounded-2xl border border-red-500/15 bg-red-500/5 p-7 space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-xl bg-red-500/10 flex items-center justify-center">
                                    <EyeOff className="h-5 w-5 text-red-400" />
                                </div>
                                <h3 className="text-sm font-medium text-white">
                                    What we never do
                                </h3>
                            </div>

                            <ul className="space-y-3">
                                {[
                                    {
                                        title: "Sell data or run ads",
                                        text: "You are the customer, not the product.",
                                    },
                                    {
                                        title: "Automatic deletions",
                                        text: "You preview and approve every action.",
                                    },
                                    {
                                        title: "Bulk mailbox export",
                                        text: "No copy of your full mailbox is ever made.",
                                    },
                                    {
                                        title: "Password access",
                                        text: "OAuth means we never see your password.",
                                    },
                                ].map((item) => (
                                    <li
                                        key={item.title}
                                        className="rounded-xl bg-black/30 p-3"
                                    >
                                        <p className="text-xs font-medium text-white mb-0.5">
                                            <span className="text-red-400 mr-1.5">
                                                ✕
                                            </span>
                                            {item.title}
                                        </p>
                                        <p className="text-xs text-white/35 pl-5">
                                            {item.text}
                                        </p>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </section>

                {/* What we store */}
                <section className="space-y-10">
                    <div className="text-center space-y-3 max-w-2xl mx-auto">
                        <h2 className="text-3xl font-semibold tracking-tight text-white">
                            What we store
                        </h2>
                        <p className="text-sm text-white/40">
                            Only what's needed to power your dashboard and deletion
                            tracking.
                        </p>
                    </div>

                    <div className="grid gap-5 md:grid-cols-2">
                        <div className="rounded-2xl border border-white/5 bg-white/2 p-7 space-y-5">
                            <div className="flex items-center gap-3">
                                <Database className="h-5 w-5 text-white/60" />
                                <h3 className="text-sm font-medium text-white">
                                    Stored in GhostSweep
                                </h3>
                            </div>
                            <ul className="space-y-4 text-xs text-white/45">
                                {[
                                    {
                                        label: "Account profile",
                                        detail: "Email + basic settings.",
                                    },
                                    {
                                        label: "Detected services",
                                        detail: "Service/domain + activity indicators.",
                                    },
                                    {
                                        label: "Breach matches",
                                        detail: "Services appearing in public breach datasets.",
                                    },
                                    {
                                        label: "Deletion tracking",
                                        detail: "Status, timestamps, and progress.",
                                    },
                                ].map((item) => (
                                    <li
                                        key={item.label}
                                        className="flex items-start gap-3"
                                    >
                                        <CheckCircle className="h-3.5 w-3.5 text-emerald-400/60 mt-0.5 shrink-0" />
                                        <div>
                                            <p className="font-medium text-white">
                                                {item.label}
                                            </p>
                                            <p className="text-white/35 mt-0.5">
                                                {item.detail}
                                            </p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-7 space-y-5">
                            <div className="flex items-center gap-3">
                                <Shield className="h-5 w-5 text-emerald-400" />
                                <h3 className="text-sm font-medium text-white">
                                    Never stored
                                </h3>
                            </div>
                            <ul className="space-y-4 text-xs text-white/45">
                                {[
                                    {
                                        label: "Email bodies",
                                        detail: "Full message content is never kept.",
                                    },
                                    {
                                        label: "Attachments and files",
                                        detail: "No PDFs, images, or documents stored.",
                                    },
                                    {
                                        label: "Passwords or credentials",
                                        detail: "OAuth only — we never see your password.",
                                    },
                                ].map((item) => (
                                    <li
                                        key={item.label}
                                        className="flex items-start gap-3"
                                    >
                                        <span className="text-emerald-400 shrink-0 mt-0.5">
                                            ✓
                                        </span>
                                        <div>
                                            <p className="font-medium text-white">
                                                {item.label}
                                            </p>
                                            <p className="text-white/35 mt-0.5">
                                                {item.detail}
                                            </p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                            <div className="pt-4 border-t border-white/10">
                                <p className="text-[11px] text-white/30">
                                    Disconnect your email and delete your scan data
                                    anytime. We remove all associated records.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Security measures */}
                <section className="space-y-10">
                    <div className="text-center space-y-3 max-w-2xl mx-auto">
                        <h2 className="text-3xl font-semibold tracking-tight text-white">
                            How we secure GhostSweep
                        </h2>
                    </div>

                    <div className="grid gap-5 md:grid-cols-3">
                        {[
                            {
                                icon: Lock,
                                title: "Encryption",
                                items: [
                                    "Tokens encrypted at rest",
                                    "All traffic over HTTPS / TLS",
                                    "Database encryption at rest",
                                ],
                            },
                            {
                                icon: Server,
                                title: "Infrastructure",
                                items: [
                                    "Managed Postgres",
                                    "Restricted admin access",
                                    "Server-side sensitive operations",
                                ],
                            },
                            {
                                icon: Shield,
                                title: "Access control",
                                items: [
                                    "Least-privilege OAuth scopes",
                                    "Scoped database policies per user",
                                    "No ad trackers selling data",
                                ],
                            },
                        ].map((card) => (
                            <div
                                key={card.title}
                                className="rounded-2xl border border-white/5 bg-white/2 p-6 space-y-4"
                            >
                                <card.icon className="h-5 w-5 text-white/60" />
                                <h3 className="text-sm font-medium text-white">
                                    {card.title}
                                </h3>
                                <ul className="space-y-2 text-xs text-white/40">
                                    {card.items.map((item) => (
                                        <li key={item}>{item}</li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Third parties */}
                <section className="space-y-10">
                    <div className="text-center space-y-3 max-w-2xl mx-auto">
                        <h2 className="text-3xl font-semibold tracking-tight text-white">
                            Trusted third parties
                        </h2>
                    </div>

                    <div className="grid gap-5 md:grid-cols-3">
                        {[
                            {
                                icon: Users,
                                name: "Google",
                                text: "Email APIs and OAuth permissions for scanning and optional deletion requests.",
                            },
                            {
                                icon: Lock,
                                name: "Stripe",
                                text: "Handles all payment data. GhostSweep never stores card numbers.",
                            },
                            {
                                icon: Database,
                                name: "Hosting / Infra",
                                text: "Vercel (frontend) plus managed database infrastructure.",
                            },
                        ].map((vendor) => (
                            <div
                                key={vendor.name}
                                className="rounded-2xl border border-white/5 bg-white/2 p-6"
                            >
                                <vendor.icon className="h-5 w-5 text-white/40 mb-3" />
                                <p className="text-sm font-medium text-white mb-1.5">
                                    {vendor.name}
                                </p>
                                <p className="text-xs text-white/40 leading-relaxed">
                                    {vendor.text}
                                </p>
                            </div>
                        ))}
                    </div>

                    <p className="text-center text-xs text-white/25">
                        Providers are used only to operate GhostSweep and are not
                        permitted to use your data for advertising or resale.
                    </p>
                </section>

                {/* Your control */}
                <section className="rounded-2xl border border-white/10 bg-white/3 p-8 sm:p-10 space-y-8">
                    <div className="text-center space-y-3">
                        <h2 className="text-2xl font-semibold tracking-tight text-white">
                            Your control
                        </h2>
                        <p className="text-sm text-white/40 max-w-xl mx-auto">
                            Disconnect, delete, and stay in control at all times.
                        </p>
                    </div>

                    <div className="grid gap-5 sm:grid-cols-2">
                        {[
                            {
                                title: "Disconnect anytime",
                                body: "Revoke email access from GhostSweep or your Google/Microsoft account settings.",
                            },
                            {
                                title: "Delete your data",
                                body: "Remove scan summaries and tracking data from our systems.",
                            },
                            {
                                title: "Choose how you act",
                                body: "Open provider pages, send emails, or do nothing — your choice.",
                            },
                            {
                                title: "Email preferences",
                                body: "Control alerts and notifications.",
                            },
                        ].map((item) => (
                            <div
                                key={item.title}
                                className="flex items-start gap-3"
                            >
                                <CheckCircle className="h-4 w-4 text-emerald-400/60 mt-0.5 shrink-0" />
                                <div>
                                    <h4 className="text-sm font-medium text-white mb-0.5">
                                        {item.title}
                                    </h4>
                                    <p className="text-xs text-white/40">
                                        {item.body}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Verify + Report */}
                <section className="grid gap-5 md:grid-cols-2">
                    <div className="rounded-2xl border border-white/5 bg-white/2 p-7 space-y-5">
                        <h3 className="text-lg font-semibold text-white">
                            Verify permissions yourself
                        </h3>
                        <p className="text-sm text-white/40">
                            See exactly what access GhostSweep has from your Google
                            account.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <a
                                href="https://myaccount.google.com/permissions"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-500 px-5 py-2.5 text-xs font-semibold text-black hover:bg-emerald-400 transition"
                            >
                                Check OAuth permissions
                                <ExternalLink className="h-3 w-3" />
                            </a>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-red-500/15 bg-red-500/5 p-7 space-y-4">
                        <div className="flex items-start gap-3">
                            <AlertCircle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
                            <div>
                                <h3 className="text-sm font-medium text-white mb-2">
                                    Report a security issue
                                </h3>
                                <p className="text-xs text-white/40 mb-3">
                                    Found a vulnerability or privacy issue? Contact us
                                    directly.
                                </p>
                                <a
                                    href="mailto:support@ghostsweep.com"
                                    className="text-xs text-red-400 hover:text-red-300 underline transition"
                                >
                                    support@ghostsweep.com
                                </a>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Final note */}
                <section className="border-t border-white/5 pt-10 text-center">
                    <p className="text-sm text-white/30 max-w-2xl mx-auto leading-relaxed">
                        GhostSweep exists to give you visibility and control — not to
                        become another data risk. Questions?{" "}
                        <a
                            href="mailto:support@ghostsweep.com"
                            className="text-white underline hover:text-white/80"
                        >
                            support@ghostsweep.com
                        </a>
                    </p>
                </section>
            </div>
        </main>
    );
}
