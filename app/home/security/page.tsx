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
        <main className="min-h-screen bg-background text-foreground">
            <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pb-20 pt-12 space-y-20">

                {/* Hero */}
                <section className="space-y-8 text-center max-w-4xl mx-auto">
                    <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-xs text-emerald-200">
                        <Shield className="h-3 w-3" />
                        Security & Privacy
                    </div>

                    <div className="space-y-6">
                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
                            How GhostSweep Protects Your Data
                        </h1>
                        <p className="text-lg text-muted-foreground leading-relaxed max-w-3xl mx-auto">
                            We map your digital footprint without reading your private emails. Here's exactly what we can access, what we store, and how you stay in control.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            href="/login"
                            className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-8 py-3.5 text-sm font-semibold text-primary-foreground shadow-lg hover:opacity-90 transition"
                        >
                            Start Free Scan
                            <ArrowRight className="h-4 w-4" />
                        </Link>

                        <a href="https://github.com/ghostsweep"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/20 px-8 py-3.5 text-sm font-semibold hover:bg-white/5 transition"
                        >
                            <Github className="h-4 w-4" />
                            View on GitHub
                        </a>
                    </div>
                </section>

                {/* Key Principle */}
                <section className="rounded-2xl border-2 border-emerald-500/40 bg-emerald-500/10 p-8 md:p-12">
                    <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-500/20 shrink-0">
                            <EyeOff className="h-6 w-6 text-emerald-400" />
                        </div>
                        <div className="space-y-3 flex-1">
                            <h2 className="text-xl font-bold text-emerald-200">
                                We Only Read Metadata
                            </h2>
                            <p className="text-sm text-white/90 leading-relaxed">
                                GhostSweep analyzes <span className="font-semibold text-emerald-200">sender addresses, subject lines, and dates</span>—never email content or attachments. This is how we detect accounts and breaches without invading your privacy.
                            </p>
                            <ul className="space-y-2 text-sm text-white/80">
                                <li className="flex items-start gap-2">
                                    <CheckCircle className="h-5 w-5 text-emerald-400 mt-0.5 shrink-0" />
                                    <span>Never store full email bodies</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle className="h-5 w-5 text-emerald-400 mt-0.5 shrink-0" />
                                    <span>Never send emails on your behalf</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle className="h-5 w-5 text-emerald-400 mt-0.5 shrink-0" />
                                    <span>Disconnect anytime to delete all scan data</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </section>

                {/* What We Can Access */}
                <section className="space-y-12">
                    <div className="text-center space-y-4 max-w-3xl mx-auto">
                        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
                            What We Can Access
                        </h2>
                        <p className="text-lg text-muted-foreground">
                            Transparent about every permission we request
                        </p>
                    </div>

                    <div className="grid gap-8 md:grid-cols-2">
                        {/* Can Access */}
                        <div className="space-y-6 rounded-2xl border border-white/10 bg-black/40 p-8">
                            <div className="flex items-center gap-3">
                                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/20">
                                    <Eye className="h-6 w-6 text-primary" />
                                </div>
                                <h3 className="text-xl font-bold">What We Access</h3>
                            </div>

                            <p className="text-sm text-muted-foreground leading-relaxed">
                                When you connect Gmail, you grant read-only access using Google OAuth. We cannot see or change your password.
                            </p>

                            <div className="space-y-4">
                                <div>
                                    <h4 className="text-sm font-semibold text-primary mb-2">
                                        Gmail Metadata:
                                    </h4>
                                    <ul className="space-y-2 text-sm text-muted-foreground">
                                        <li className="flex items-start gap-2">
                                            <CheckCircle className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                                            <span>Sender addresses (who sent the email)</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <CheckCircle className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                                            <span>Subject lines (to detect account emails)</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <CheckCircle className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                                            <span>Dates and timestamps</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <CheckCircle className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                                            <span>Labels and thread IDs</span>
                                        </li>
                                    </ul>
                                </div>

                                <div>
                                    <h4 className="text-sm font-semibold text-primary mb-2">
                                        We Use This To:
                                    </h4>
                                    <ul className="space-y-2 text-sm text-muted-foreground">
                                        <li className="flex items-start gap-2">
                                            <span className="text-primary">•</span>
                                            <span>Detect services from "welcome" and verification emails</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-primary">•</span>
                                            <span>Identify potential breaches</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-primary">•</span>
                                            <span>Track replies to privacy requests</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Cannot Access */}
                        <div className="space-y-6 rounded-2xl border border-red-500/30 bg-red-500/5 p-8">
                            <div className="flex items-center gap-3">
                                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-red-500/20">
                                    <EyeOff className="h-6 w-6 text-red-400" />
                                </div>
                                <h3 className="text-xl font-bold">What We Never Access</h3>
                            </div>

                            <p className="text-sm text-muted-foreground leading-relaxed">
                                These restrictions are enforced by Google's OAuth system and our read-only permissions.
                            </p>

                            <ul className="space-y-3 text-sm">
                                <li className="flex items-start gap-3 p-3 rounded-lg bg-black/40">
                                    <span className="text-red-400 text-lg shrink-0">✕</span>
                                    <div>
                                        <p className="font-medium">Email Content</p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            We never read the body of your emails
                                        </p>
                                    </div>
                                </li>
                                <li className="flex items-start gap-3 p-3 rounded-lg bg-black/40">
                                    <span className="text-red-400 text-lg shrink-0">✕</span>
                                    <div>
                                        <p className="font-medium">Attachments</p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Files and images remain private
                                        </p>
                                    </div>
                                </li>
                                <li className="flex items-start gap-3 p-3 rounded-lg bg-black/40">
                                    <span className="text-red-400 text-lg shrink-0">✕</span>
                                    <div>
                                        <p className="font-medium">Send Emails</p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            We cannot send emails on your behalf
                                        </p>
                                    </div>
                                </li>
                                <li className="flex items-start gap-3 p-3 rounded-lg bg-black/40">
                                    <span className="text-red-400 text-lg shrink-0">✕</span>
                                    <div>
                                        <p className="font-medium">Delete or Modify</p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Your emails stay exactly as they are
                                        </p>
                                    </div>
                                </li>
                                <li className="flex items-start gap-3 p-3 rounded-lg bg-black/40">
                                    <span className="text-red-400 text-lg shrink-0">✕</span>
                                    <div>
                                        <p className="font-medium">Share With Advertisers</p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            We never sell or share your data
                                        </p>
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </div>
                </section>

                {/* What We Store */}
                <section className="space-y-12">
                    <div className="text-center space-y-4 max-w-3xl mx-auto">
                        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
                            What We Store
                        </h2>
                        <p className="text-lg text-muted-foreground">
                            Only the minimum needed to power your dashboard
                        </p>
                    </div>

                    <div className="grid gap-8 md:grid-cols-2">
                        {/* What We Store */}
                        <div className="space-y-6 rounded-2xl border border-white/10 bg-black/40 p-8">
                            <div className="flex items-center gap-3">
                                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/20">
                                    <Database className="h-6 w-6 text-primary" />
                                </div>
                                <h3 className="text-xl font-bold">Stored in GhostSweep</h3>
                            </div>

                            <ul className="space-y-3 text-sm">
                                <li className="flex items-start gap-3">
                                    <CheckCircle className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                                    <div>
                                        <p className="font-medium">Your Account Info</p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Email and basic profile
                                        </p>
                                    </div>
                                </li>
                                <li className="flex items-start gap-3">
                                    <CheckCircle className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                                    <div>
                                        <p className="font-medium">Connected Gmail Address</p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            For display and routing
                                        </p>
                                    </div>
                                </li>
                                <li className="flex items-start gap-3">
                                    <CheckCircle className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                                    <div>
                                        <p className="font-medium">Detected Services</p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Name, domain, category, activity dates
                                        </p>
                                    </div>
                                </li>
                                <li className="flex items-start gap-3">
                                    <CheckCircle className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                                    <div>
                                        <p className="font-medium">Breach Matches</p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            From public breach databases
                                        </p>
                                    </div>
                                </li>
                                <li className="flex items-start gap-3">
                                    <CheckCircle className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                                    <div>
                                        <p className="font-medium">Deletion Requests</p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Status and timestamps for tracking
                                        </p>
                                    </div>
                                </li>
                            </ul>
                        </div>

                        {/* What We Don't Store */}
                        <div className="space-y-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-8">
                            <div className="flex items-center gap-3">
                                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-500/20">
                                    <Shield className="h-6 w-6 text-emerald-400" />
                                </div>
                                <h3 className="text-xl font-bold">Never Stored</h3>
                            </div>

                            <ul className="space-y-3 text-sm">
                                <li className="flex items-start gap-3">
                                    <span className="text-emerald-400 text-lg shrink-0">✓</span>
                                    <div>
                                        <p className="font-medium">Full Email Content</p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Email bodies never leave Gmail
                                        </p>
                                    </div>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="text-emerald-400 text-lg shrink-0">✓</span>
                                    <div>
                                        <p className="font-medium">Attachments or Files</p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            No images, PDFs, or documents
                                        </p>
                                    </div>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="text-emerald-400 text-lg shrink-0">✓</span>
                                    <div>
                                        <p className="font-medium">Your Google Password</p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            OAuth handles authentication
                                        </p>
                                    </div>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="text-emerald-400 text-lg shrink-0">✓</span>
                                    <div>
                                        <p className="font-medium">Raw Mailbox Data</p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            No bulk exports or archives
                                        </p>
                                    </div>
                                </li>
                            </ul>

                            <div className="pt-4 border-t border-white/10">
                                <p className="text-xs text-muted-foreground">
                                    <span className="font-medium text-emerald-200">Important:</span> When you disconnect Gmail, we delete your connection and all associated scan data (services, breaches, events).
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Security Measures */}
                <section className="space-y-12">
                    <div className="text-center space-y-4 max-w-3xl mx-auto">
                        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
                            How We Secure Your Data
                        </h2>
                        <p className="text-lg text-muted-foreground">
                            Industry-standard encryption and access controls
                        </p>
                    </div>

                    <div className="grid gap-8 md:grid-cols-3">
                        <div className="space-y-4 rounded-xl border border-white/10 bg-black/40 p-6">
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/20">
                                <Lock className="h-6 w-6 text-primary" />
                            </div>
                            <h3 className="text-lg font-semibold">Encryption</h3>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                                <li className="flex items-start gap-2">
                                    <span className="text-primary">•</span>
                                    <span>OAuth tokens: <code className="text-xs bg-white/5 px-1 py-0.5 rounded">AES-256-GCM</code></span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-primary">•</span>
                                    <span>All traffic: HTTPS/TLS 1.3</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-primary">•</span>
                                    <span>Database: Encrypted at rest</span>
                                </li>
                            </ul>
                        </div>

                        <div className="space-y-4 rounded-xl border border-white/10 bg-black/40 p-6">
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/20">
                                <Server className="h-6 w-6 text-primary" />
                            </div>
                            <h3 className="text-lg font-semibold">Infrastructure</h3>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                                <li className="flex items-start gap-2">
                                    <span className="text-primary">•</span>
                                    <span>Managed Postgres database</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-primary">•</span>
                                    <span>Strict access controls</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-primary">•</span>
                                    <span>Audit trails for all scans</span>
                                </li>
                            </ul>
                        </div>

                        <div className="space-y-4 rounded-xl border border-white/10 bg-black/40 p-6">
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/20">
                                <Shield className="h-6 w-6 text-primary" />
                            </div>
                            <h3 className="text-lg font-semibold">Access Control</h3>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                                <li className="flex items-start gap-2">
                                    <span className="text-primary">•</span>
                                    <span>Read-only Gmail permissions</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-primary">•</span>
                                    <span>Backend services only</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-primary">•</span>
                                    <span>No third-party data sharing</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </section>

                {/* Third Parties */}
                <section className="space-y-12">
                    <div className="text-center space-y-4 max-w-3xl mx-auto">
                        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
                            Third-Party Services
                        </h2>
                        <p className="text-lg text-muted-foreground">
                            Trusted vendors who help us operate GhostSweep
                        </p>
                    </div>

                    <div className="grid gap-6 md:grid-cols-3">
                        <div className="space-y-3 rounded-xl border border-white/10 bg-black/40 p-6">
                            <div className="flex items-center gap-2">
                                <Users className="h-5 w-5 text-primary" />
                                <h3 className="font-semibold">Google</h3>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                OAuth authentication and Gmail API access
                            </p>
                        </div>

                        <div className="space-y-3 rounded-xl border border-white/10 bg-black/40 p-6">
                            <div className="flex items-center gap-2">
                                <Lock className="h-5 w-5 text-primary" />
                                <h3 className="font-semibold">Stripe</h3>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Secure payment processing (we never see card numbers)
                            </p>
                        </div>

                        <div className="space-y-3 rounded-xl border border-white/10 bg-black/40 p-6">
                            <div className="flex items-center gap-2">
                                <Database className="h-5 w-5 text-primary" />
                                <h3 className="font-semibold">Hosting</h3>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Vercel (frontend) and managed database infrastructure
                            </p>
                        </div>
                    </div>

                    <div className="rounded-lg border border-white/10 bg-black/40 p-6 text-center">
                        <p className="text-sm text-muted-foreground">
                            These providers are <span className="font-medium text-foreground">not allowed</span> to use your data for advertising or resell it.
                        </p>
                    </div>
                </section>

                {/* Your Rights */}
                <section className="space-y-8 rounded-2xl border border-primary/40 bg-primary/5 p-8 md:p-12">
                    <div className="text-center space-y-4">
                        <h2 className="text-3xl font-bold tracking-tight">
                            Your Rights & Control
                        </h2>
                        <p className="text-muted-foreground max-w-2xl mx-auto">
                            You stay in complete control of your data at all times
                        </p>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                        <div className="flex items-start gap-4">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20 shrink-0">
                                <CheckCircle className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <h3 className="font-semibold mb-1">Disconnect Anytime</h3>
                                <p className="text-sm text-muted-foreground">
                                    Revoke Gmail access instantly from settings or your Google account
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20 shrink-0">
                                <CheckCircle className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <h3 className="font-semibold mb-1">Delete Your Data</h3>
                                <p className="text-sm text-muted-foreground">
                                    Request account deletion to remove all scan data permanently
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20 shrink-0">
                                <CheckCircle className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <h3 className="font-semibold mb-1">Export Your Data</h3>
                                <p className="text-sm text-muted-foreground">
                                    Download a copy of your detected accounts and breach history
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20 shrink-0">
                                <CheckCircle className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <h3 className="font-semibold mb-1">Email Preferences</h3>
                                <p className="text-sm text-muted-foreground">
                                    Opt out of alerts and notifications where supported
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Security Issue Reporting */}
                <section className="space-y-6 rounded-xl border border-red-500/30 bg-red-500/5 p-8">
                    <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-red-500/20 shrink-0">
                            <AlertCircle className="h-6 w-6 text-red-400" />
                        </div>
                        <div className="space-y-3 flex-1">
                            <h2 className="text-xl font-bold">Report a Security Issue</h2>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                If you believe you've found a security vulnerability or privacy issue in GhostSweep, please contact us immediately. We take security reports seriously and will respond as quickly as possible.
                            </p>
                            <div className="flex flex-wrap gap-4">

                                <a href="mailto:security@ghostsweep.com"
                                    className="inline-flex items-center gap-2 text-sm font-medium text-red-400 hover:text-red-300 transition"
                                >
                                    security@ghostsweep.com
                                    <ExternalLink className="h-4 w-4" />
                                </a>

                                <a href="mailto:komieterj@gmail.com"
                                    className="inline-flex items-center gap-2 text-sm font-medium text-red-400 hover:text-red-300 transition"
                                >
                                    komieterj@gmail.com
                                    <ExternalLink className="h-4 w-4" />
                                </a>
                            </div>
                        </div>
                    </div >
                </section >

                {/* Verification */}
                < section className="space-y-8 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-8 md:p-12 text-center" >
                    <h2 className="text-2xl font-bold">Verify Our Permissions</h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto">
                        Don't just trust us—verify for yourself
                    </p>
                    <div className="space-y-4">
                        <div className="inline-flex flex-col sm:flex-row gap-4">

                            <a href="https://myaccount.google.com/permissions"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-500 px-6 py-3 text-sm font-semibold text-white hover:bg-emerald-600 transition"
                            >
                            Check OAuth Permissions
                            <ExternalLink className="h-4 w-4" />
                            </a>

                            <a href="https://github.com/ghostsweep"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/20 px-6 py-3 text-sm font-semibold hover:bg-white/5 transition"
                            >
                                <Github className="h-4 w-4" />
                                Audit Our Code
                            </a>
                        </div >
                        <p className="text-xs text-muted-foreground">
                            See exactly what permissions GhostSweep has and review our open-source scanning logic
                        </p>
                    </div >
                </section >

                {/* Final Note */}
                < section className="border-t border-white/10 pt-8 text-center" >
                    <p className="text-sm text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                        GhostSweep is built to give you visibility and control over your digital footprint—not to become another data risk. If you have questions about anything on this page, reach out to{" "}

                        <a href="mailto:support@ghostsweep.com"
                            className="font-medium text-primary hover:underline"
                        >
                            support@ghostsweep.com
                        </a>{" "}
                        and we'll clarify.
                    </p >
                </section >
            </div >
        </main >
    );
}