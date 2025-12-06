/* eslint-disable react/no-unescaped-entities */
// app/security/page.tsx
import Link from "next/link";
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
    Github,
    ArrowRight,
} from "lucide-react";

export default function SecurityPage() {
    return (
        <main className="min-h-screen text-foreground bg-gradient-to-b from-[#020308] via-black to-[#050608]">
            <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pb-20 pt-12 space-y-16">
                {/* HERO */}
                <section className="space-y-8">
                    <div className="text-center space-y-5 max-w-3xl mx-auto">
                        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-[11px] text-emerald-200">
                            <Shield className="h-3 w-3" />
                            Security & Privacy Overview
                        </div>

                        <div className="space-y-3">
                            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight leading-tight">
                                How GhostSweep Protects Your Data
                            </h1>
                            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                                GhostSweep maps your digital footprint without reading the content
                                of your emails. This page explains exactly what we can access,
                                what we store, and how you stay in control.
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

                            <a
                                href="https://github.com/JKomieter/ghostsweep-api.git"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 px-7 py-2.5 text-xs sm:text-sm font-medium hover:bg-white/5 transition"
                            >
                                <Github className="h-4 w-4" />
                                View core logic on GitHub
                            </a>
                        </div>
                    </div>

                    {/* At a glance */}
                    <div className="grid gap-4 md:grid-cols-3 text-xs sm:text-sm">
                        <div className="rounded-xl border border-white/10 bg-black/40 p-4 space-y-1.5">
                            <p className="font-medium flex items-center gap-2">
                                <EyeOff className="h-3.5 w-3.5 text-emerald-400" />
                                No email content
                            </p>
                            <p className="text-muted-foreground">
                                We only use metadata (From, Subject, Date) to detect accounts and
                                breaches. Email bodies and attachments stay in Gmail.
                            </p>
                        </div>
                        <div className="rounded-xl border border-white/10 bg-black/40 p-4 space-y-1.5">
                            <p className="font-medium flex items-center gap-2">
                                <Lock className="h-3.5 w-3.5 text-primary" />
                                Read-only OAuth
                            </p>
                            <p className="text-muted-foreground">
                                GhostSweep cannot send, delete, or modify emails. You can revoke
                                access at any time from your Google account.
                            </p>
                        </div>
                        <div className="rounded-xl border border-white/10 bg-black/40 p-4 space-y-1.5">
                            <p className="font-medium flex items-center gap-2">
                                <Shield className="h-3.5 w-3.5 text-emerald-400" />
                                Minimal storage
                            </p>
                            <p className="text-muted-foreground">
                                We store only what’s needed for your dashboard: detected services,
                                breach matches, and privacy request status.
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
                                Core Principle: Metadata In, Content Out
                            </h2>
                            <p className="text-xs sm:text-sm text-emerald-50/90 leading-relaxed max-w-3xl">
                                GhostSweep analyzes{" "}
                                <span className="font-semibold">sender addresses, subject lines, and timestamps</span>{" "}
                                to detect accounts and breaches. We don’t read the body of your
                                emails or download attachments. That’s a hard line, not a marketing line.
                            </p>
                            <div className="grid gap-2 sm:grid-cols-3 text-xs">
                                <div className="inline-flex items-start gap-2">
                                    <CheckCircle className="h-4 w-4 text-emerald-300 mt-0.5 shrink-0" />
                                    <span>We never store full email bodies.</span>
                                </div>
                                <div className="inline-flex items-start gap-2">
                                    <CheckCircle className="h-4 w-4 text-emerald-300 mt-0.5 shrink-0" />
                                    <span>We never send emails on your behalf.</span>
                                </div>
                                <div className="inline-flex items-start gap-2">
                                    <CheckCircle className="h-4 w-4 text-emerald-300 mt-0.5 shrink-0" />
                                    <span>You can disconnect and wipe scan data anytime.</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* PERMISSIONS: CAN / CANNOT ACCESS */}
                <section className="space-y-8">
                    <div className="text-center space-y-2 max-w-3xl mx-auto">
                        <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">
                            Exactly What GhostSweep Can Access
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            These permissions are granted via Google OAuth and constrained by
                            read-only scopes.
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
                                    What we access (via Gmail)
                                </h3>
                            </div>

                            <p className="text-xs sm:text-sm text-muted-foreground">
                                When you connect Gmail, you grant read-only access through OAuth.
                                We cannot see or change your Google password.
                            </p>

                            <div className="space-y-4">
                                <div>
                                    <h4 className="text-xs font-semibold text-primary mb-1.5 uppercase tracking-wide">
                                        Gmail metadata we use
                                    </h4>
                                    <ul className="space-y-1.5 text-xs sm:text-sm text-muted-foreground">
                                        <li className="flex items-start gap-2">
                                            <CheckCircle className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                                            <span>Sender addresses (who sent the email)</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <CheckCircle className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                                            <span>Subject lines (“Welcome”, “Verify your email”, etc.)</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <CheckCircle className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                                            <span>Dates, timestamps, and basic labels</span>
                                        </li>
                                    </ul>
                                </div>

                                <div>
                                    <h4 className="text-xs font-semibold text-primary mb-1.5 uppercase tracking-wide">
                                        What we do with it
                                    </h4>
                                    <ul className="space-y-1.5 text-xs sm:text-sm text-muted-foreground">
                                        <li className="flex items-start gap-2">
                                            <span className="text-primary">•</span>
                                            <span>Detect services from account, receipt, and verification emails</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-primary">•</span>
                                            <span>Match your accounts against known breach databases</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-primary">•</span>
                                            <span>Track replies to your privacy/deletion requests</span>
                                        </li>
                                    </ul>
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
                                    What we never access
                                </h3>
                            </div>

                            <p className="text-xs sm:text-sm text-muted-foreground">
                                These restrictions are enforced by Google’s scopes and our own
                                architecture.
                            </p>

                            <ul className="space-y-2.5 text-xs sm:text-sm">
                                <li className="flex items-start gap-3 rounded-lg bg-black/40 p-3">
                                    <span className="text-red-400 text-base shrink-0">✕</span>
                                    <div>
                                        <p className="font-medium">Email content</p>
                                        <p className="text-[11px] text-muted-foreground mt-1">
                                            We don’t read the body of your emails.
                                        </p>
                                    </div>
                                </li>
                                <li className="flex items-start gap-3 rounded-lg bg-black/40 p-3">
                                    <span className="text-red-400 text-base shrink-0">✕</span>
                                    <div>
                                        <p className="font-medium">Attachments</p>
                                        <p className="text-[11px] text-muted-foreground mt-1">
                                            Files, images, and documents remain in your inbox.
                                        </p>
                                    </div>
                                </li>
                                <li className="flex items-start gap-3 rounded-lg bg-black/40 p-3">
                                    <span className="text-red-400 text-base shrink-0">✕</span>
                                    <div>
                                        <p className="font-medium">Sending / deleting mail</p>
                                        <p className="text-[11px] text-muted-foreground mt-1">
                                            We can’t send, delete, or modify messages.
                                        </p>
                                    </div>
                                </li>
                                <li className="flex items-start gap-3 rounded-lg bg-black/40 p-3">
                                    <span className="text-red-400 text-base shrink-0">✕</span>
                                    <div>
                                        <p className="font-medium">Advertising or resale</p>
                                        <p className="text-[11px] text-muted-foreground mt-1">
                                            We don’t sell, rent, or share your data with advertisers.
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
                            We store only the minimum needed to power your dashboard.
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
                                        <p className="text-[11px] mt-1">
                                            Your email and basic account settings.
                                        </p>
                                    </div>
                                </li>
                                <li className="flex items-start gap-3">
                                    <CheckCircle className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                                    <div>
                                        <p className="font-medium text-foreground">Connected Gmail address</p>
                                        <p className="text-[11px] mt-1">
                                            So we know which inbox we’re scanning.
                                        </p>
                                    </div>
                                </li>
                                <li className="flex items-start gap-3">
                                    <CheckCircle className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                                    <div>
                                        <p className="font-medium text-foreground">Detected services</p>
                                        <p className="text-[11px] mt-1">
                                            Service name, domain, category, and basic activity dates.
                                        </p>
                                    </div>
                                </li>
                                <li className="flex items-start gap-3">
                                    <CheckCircle className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                                    <div>
                                        <p className="font-medium text-foreground">Breach matches</p>
                                        <p className="text-[11px] mt-1">
                                            Which services were in public breaches and when.
                                        </p>
                                    </div>
                                </li>
                                <li className="flex items-start gap-3">
                                    <CheckCircle className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                                    <div>
                                        <p className="font-medium text-foreground">Privacy / deletion requests</p>
                                        <p className="text-[11px] mt-1">
                                            Template usage and status so you can track responses.
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
                                <h3 className="text-sm sm:text-base font-semibold">
                                    Never stored
                                </h3>
                            </div>

                            <ul className="space-y-3 text-xs sm:text-sm text-muted-foreground">
                                <li className="flex items-start gap-3">
                                    <span className="text-emerald-300 text-base shrink-0">✓</span>
                                    <div>
                                        <p className="font-medium text-foreground">Email bodies</p>
                                        <p className="text-[11px] mt-1">
                                            The content of your emails never leaves Gmail.
                                        </p>
                                    </div>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="text-emerald-300 text-base shrink-0">✓</span>
                                    <div>
                                        <p className="font-medium text-foreground">Attachments and files</p>
                                        <p className="text-[11px] mt-1">
                                            No images, PDFs, or documents are copied to our servers.
                                        </p>
                                    </div>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="text-emerald-300 text-base shrink-0">✓</span>
                                    <div>
                                        <p className="font-medium text-foreground">Google passwords</p>
                                        <p className="text-[11px] mt-1">
                                            Authentication is handled by OAuth.
                                        </p>
                                    </div>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="text-emerald-300 text-base shrink-0">✓</span>
                                    <div>
                                        <p className="font-medium text-foreground">Raw mailbox exports</p>
                                        <p className="text-[11px] mt-1">
                                            We don’t keep full mailbox backups or bulk exports.
                                        </p>
                                    </div>
                                </li>
                            </ul>

                            <div className="pt-4 border-t border-white/10">
                                <p className="text-[11px] text-muted-foreground">
                                    When you disconnect Gmail, we delete your connection and the
                                    associated scan data (services, breaches, events) from GhostSweep.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* SECURITY MEASURES */}
                <section className="space-y-8">
                    <div className="text-center space-y-2 max-w-3xl mx-auto">
                        <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">
                            How We Secure GhostSweep Itself
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
                                <li>OAuth tokens encrypted with AES-256-GCM.</li>
                                <li>All traffic over HTTPS / TLS 1.3.</li>
                                <li>Database encrypted at rest.</li>
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
                                <li>Audit trails for scan operations.</li>
                            </ul>
                        </div>

                        <div className="space-y-3 rounded-2xl border border-white/10 bg-black/40 p-5">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20">
                                <Shield className="h-5 w-5 text-primary" />
                            </div>
                            <h3 className="text-sm font-semibold">Access control</h3>
                            <ul className="space-y-1.5 text-xs text-muted-foreground">
                                <li>Read-only Gmail scopes only.</li>
                                <li>Backend-only access to sensitive data.</li>
                                <li>No third-party selling or ad tracking.</li>
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
                                Gmail API and OAuth authentication for read-only access.
                            </p>
                        </div>
                        <div className="space-y-2 rounded-xl border border-white/10 bg-black/40 p-5">
                            <div className="flex items-center gap-2">
                                <Lock className="h-4 w-4 text-primary" />
                                <p className="font-medium">Stripe</p>
                            </div>
                            <p className="text-muted-foreground">
                                Handles all payment data. We never see card numbers.
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
                        These providers are{" "}
                        <span className="font-medium text-foreground">not allowed</span> to
                        use your data for advertising or resell it.
                    </div>
                </section>

                {/* YOUR RIGHTS */}
                <section className="space-y-8 rounded-2xl border border-primary/40 bg-primary/5 p-6 sm:p-8 md:p-10">
                    <div className="text-center space-y-2">
                        <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">
                            Your Rights & Control
                        </h2>
                        <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl mx-auto">
                            GhostSweep is designed so you can easily disconnect, delete, or
                            export your data.
                        </p>
                    </div>

                    <div className="grid gap-5 md:grid-cols-2 text-xs sm:text-sm">
                        <div className="flex items-start gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20 shrink-0">
                                <CheckCircle className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                                <h3 className="font-medium mb-0.5">Disconnect anytime</h3>
                                <p className="text-muted-foreground">
                                    Revoke Gmail access from GhostSweep or directly from your Google
                                    account settings.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20 shrink-0">
                                <CheckCircle className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                                <h3 className="font-medium mb-0.5">Delete your data</h3>
                                <p className="text-muted-foreground">
                                    Request account deletion and we’ll remove your scan data and
                                    profile from our systems.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20 shrink-0">
                                <CheckCircle className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                                <h3 className="font-medium mb-0.5">Export your data</h3>
                                <p className="text-muted-foreground">
                                    Download your detected services, breaches, and request history
                                    for your own records.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20 shrink-0">
                                <CheckCircle className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                                <h3 className="font-medium mb-0.5">Email preferences</h3>
                                <p className="text-muted-foreground">
                                    Control breach alerts and product emails where supported.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* VERIFY / REPORT */}
                <section className="grid gap-8 md:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
                    {/* Verify */}
                    <div className="space-y-5 rounded-2xl border border-emerald-500/35 bg-emerald-500/5 p-6 md:p-7 text-center md:text-left">
                        <h2 className="text-lg sm:text-xl font-semibold">
                            Verify our permissions yourself
                        </h2>
                        <p className="text-xs sm:text-sm text-muted-foreground max-w-xl">
                            You don’t have to take our word for it. You can see exactly what
                            access GhostSweep has and review the core scanning logic.
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
                            <a
                                href="https://github.com/JKomieter/ghostsweep-api.git"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 px-6 py-2.5 text-xs sm:text-sm font-medium hover:bg-white/5 transition"
                            >
                                <Github className="h-4 w-4" />
                                Audit core code
                            </a>
                        </div>

                        <p className="text-[11px] text-muted-foreground">
                            You control access from your Google account, and our scanning
                            logic is visible on GitHub.
                        </p>
                    </div>

                    {/* Report */}
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
                                    If you believe you’ve found a vulnerability or privacy issue in
                                    GhostSweep, please contact us directly. We take security reports
                                    seriously and respond as quickly as we can.
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
                        GhostSweep exists to give you visibility and control over where your
                        data lives—not to become another data risk. If anything on this page
                        is unclear, email{" "}
                        <a
                            href="mailto:support@ghostsweep.com"
                            className="font-medium text-primary hover:underline"
                        >
                            support@ghostsweep.com
                        </a>{" "}
                        and we’ll clarify.
                    </p>
                </section>
            </div>
        </main>
    );
}