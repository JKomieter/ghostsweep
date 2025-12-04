/* eslint-disable react/no-unescaped-entities */
"use client";
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
    PlayCircle,
    CheckCircle,
    ExternalLink,
} from "lucide-react";
import { useState, useRef } from "react";
import Image from "next/image";

export default function HowItWorksPage() {
    const [showVideo, setShowVideo] = useState(false);
    const videoRef = useRef<HTMLVideoElement | null>(null);

    const handlePlay = () => {
        setShowVideo(true);
        setTimeout(() => {
            videoRef.current?.play().catch(() => { });
        }, 0);
    };

    return (
        <main className="min-h-screen bg-background text-foreground">
            <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pb-20 pt-12 space-y-20">

                {/* Hero */}
                <section className="space-y-8 text-center max-w-4xl mx-auto">
                    <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-xs text-emerald-200">
                        <span className="relative inline-flex h-2 w-2">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/75" />
                            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                        </span>
                        How It Works
                    </div>

                    <div className="space-y-6">
                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
                            A private, read-only audit of your digital footprint
                        </h1>
                        <p className="text-lg text-muted-foreground leading-relaxed max-w-3xl mx-auto">
                            GhostSweep scans your inbox to discover every account you've created—without reading email content. Find forgotten accounts, see which were breached, and clean up what you don't need.
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
                        <Link
                            href="/home/security"
                            className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/20 px-8 py-3.5 text-sm font-semibold hover:bg-white/5 transition"
                        >
                            Security Details
                            <ExternalLink className="h-4 w-4" />
                        </Link>
                    </div>
                </section>

                {/* 4 Steps Overview */}
                <section className="space-y-12">
                    <div className="text-center space-y-4 max-w-3xl mx-auto">
                        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
                            4 Simple Steps
                        </h2>
                        <p className="text-lg text-muted-foreground">
                            Connect → Scan → Review → Clean up. You stay in control the entire time.
                        </p>
                    </div>

                    <div className="grid gap-8 md:grid-cols-2">
                        {/* Step 1 */}
                        <div className="space-y-4 rounded-xl border border-white/10 bg-black/40 p-8">
                            <div className="flex items-center gap-3">
                                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/20 shrink-0">
                                    <ShieldCheck className="h-6 w-6 text-primary" />
                                </div>
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                        Step 1
                                    </p>
                                    <h3 className="text-lg font-semibold">
                                        Connect Gmail Securely
                                    </h3>
                                </div>
                            </div>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                Use Google's official OAuth with <span className="font-medium text-foreground">read-only access</span>. We cannot send, delete, or modify emails. Revoke access anytime from your Google account settings.
                            </p>
                        </div>

                        {/* Step 2 */}
                        <div className="space-y-4 rounded-xl border border-white/10 bg-black/40 p-8">
                            <div className="flex items-center gap-3">
                                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/20 shrink-0">
                                    <MailSearch className="h-6 w-6 text-primary" />
                                </div>
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                        Step 2
                                    </p>
                                    <h3 className="text-lg font-semibold">
                                        Scan Metadata Only
                                    </h3>
                                </div>
                            </div>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                We analyze <span className="font-medium text-foreground">sender addresses, subjects, and dates</span>—never email content or attachments. Your privacy is protected at every step.
                            </p>
                        </div>

                        {/* Step 3 */}
                        <div className="space-y-4 rounded-xl border border-white/10 bg-black/40 p-8">
                            <div className="flex items-center gap-3">
                                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/20 shrink-0">
                                    <Database className="h-6 w-6 text-primary" />
                                </div>
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                        Step 3
                                    </p>
                                    <h3 className="text-lg font-semibold">
                                        Build Account Map
                                    </h3>
                                </div>
                            </div>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                We group emails by domain and service to show <span className="font-medium text-foreground">every company with your data</span>—from major platforms to forgotten trials.
                            </p>
                        </div>

                        {/* Step 4 */}
                        <div className="space-y-4 rounded-xl border border-white/10 bg-black/40 p-8">
                            <div className="flex items-center gap-3">
                                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-red-500/20 shrink-0">
                                    <AlertTriangle className="h-6 w-6 text-red-400" />
                                </div>
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                        Step 4
                                    </p>
                                    <h3 className="text-lg font-semibold">
                                        Detect & Clean Up
                                    </h3>
                                </div>
                            </div>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                See which accounts were <span className="font-medium text-foreground">breached</span> and get GDPR/CCPA deletion templates to help you close what you don&apos;t need.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Video Demo */}
                <section className="space-y-8">
                    <div className="text-center space-y-4 max-w-3xl mx-auto">
                        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
                            See It in Action
                        </h2>
                        <p className="text-lg text-muted-foreground">
                            Watch a real scan from start to finish
                        </p>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-black/40 p-4 shadow-2xl">
                        <div className="relative aspect-video overflow-hidden rounded-xl border border-white/20 bg-black">
                            {showVideo ? (
                                <video
                                    ref={videoRef}
                                    src="https://ghostsweep.t3.storage.dev/Timeline%201.mov"
                                    controls
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <button
                                    type="button"
                                    onClick={handlePlay}
                                    className="group relative h-full w-full"
                                >
                                    <Image
                                        src="https://ghostsweep.t3.storage.dev/Screenshot%202025-11-29%20at%202.34.51%E2%80%AFAM.png"
                                        alt="GhostSweep demo"
                                        className="h-full w-full object-cover"
                                        width={1920}
                                        height={1080}
                                        priority
                                    />

                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-black shadow-2xl group-hover:scale-110 transition-transform">
                                            <PlayCircle className="h-8 w-8" />
                                        </div>
                                        <p className="text-sm text-white font-medium drop-shadow-lg">
                                            Watch Demo
                                        </p>
                                    </div>
                                </button>
                            )}
                        </div>
                    </div>
                </section>

                {/* What We Look For */}
                <section className="space-y-12">
                    <div className="text-center space-y-4 max-w-3xl mx-auto">
                        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
                            What We Look For
                        </h2>
                        <p className="text-lg text-muted-foreground">
                            Common email patterns that reveal where your data lives
                        </p>
                    </div>

                    <div className="grid gap-6 md:grid-cols-3">
                        <div className="space-y-4 rounded-xl border border-white/10 bg-black/40 p-6">
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/20">
                                <MailSearch className="h-6 w-6 text-primary" />
                            </div>
                            <h3 className="text-lg font-semibold">Account Emails</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                Subjects like "Welcome to Netflix", "Verify your email", and "Your Spotify account" reveal where you've signed up.
                            </p>
                        </div>

                        <div className="space-y-4 rounded-xl border border-white/10 bg-black/40 p-6">
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/20">
                                <ShieldCheck className="h-6 w-6 text-primary" />
                            </div>
                            <h3 className="text-lg font-semibold">Security Alerts</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                Password resets, new device logins, and unusual activity emails indicate active accounts needing attention.
                            </p>
                        </div>

                        <div className="space-y-4 rounded-xl border border-white/10 bg-black/40 p-6">
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/20">
                                <Trash2 className="h-6 w-6 text-primary" />
                            </div>
                            <h3 className="text-lg font-semibold">Deletion Emails</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                Messages about account closure help identify where data might already be removed or dormant.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Free vs Pro */}
                <section className="space-y-12">
                    <div className="text-center space-y-4 max-w-3xl mx-auto">
                        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
                            Free vs Professional
                        </h2>
                        <p className="text-lg text-muted-foreground">
                            Both respect your privacy. Pro adds ongoing monitoring and deletion tools.
                        </p>
                    </div>

                    <div className="grid gap-8 md:grid-cols-2 max-w-4xl mx-auto">
                        {/* Free */}
                        <div className="space-y-6 rounded-2xl border border-white/10 bg-black/40 p-8">
                            <div className="space-y-2">
                                <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                                    Free
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                    One-time scan to see what you have
                                </p>
                            </div>

                            <ul className="space-y-3 text-sm">
                                <li className="flex items-start gap-3">
                                    <CheckCircle className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                                    <span>One scan per month</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <CheckCircle className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                                    <span>See first 50 accounts</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <CheckCircle className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                                    <span>Basic breach check</span>
                                </li>
                            </ul>

                            <Link
                                href="/login"
                                className="block w-full text-center rounded-lg border border-white/20 px-6 py-3 text-sm font-semibold hover:bg-white/5 transition"
                            >
                                Start Free
                            </Link>
                        </div>

                        {/* Pro */}
                        <div className="relative space-y-6 rounded-2xl border-2 border-primary/60 bg-primary/5 p-8">
                            <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                                <span className="rounded-full bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground shadow-lg">
                                    Recommended
                                </span>
                            </div>

                            <div className="space-y-2">
                                <h3 className="text-sm font-semibold uppercase tracking-wide text-primary">
                                    Professional
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                    Ongoing protection and cleanup tools
                                </p>
                            </div>

                            <ul className="space-y-3 text-sm">
                                <li className="flex items-start gap-3">
                                    <CheckCircle className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                                    <span>Unlimited scans</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <CheckCircle className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                                    <span>See all accounts</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <CheckCircle className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                                    <span>Full breach details</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <CheckCircle className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                                    <span>Deletion templates</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <CheckCircle className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                                    <span>Ongoing monitoring</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <CheckCircle className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                                    <span>New breach alerts</span>
                                </li>
                            </ul>

                            <Link
                                href="/dashboard/billing?plan=monthly"
                                className="block w-full text-center rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-lg hover:opacity-90 transition"
                            >
                                Upgrade to Pro
                            </Link>
                        </div>
                    </div>
                </section>

                {/* Ongoing Monitoring */}
                <section className="space-y-12">
                    <div className="text-center space-y-4 max-w-3xl mx-auto">
                        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
                            Ongoing Monitoring (Pro)
                        </h2>
                        <p className="text-lg text-muted-foreground">
                            Quiet, useful alerts instead of noisy dashboards
                        </p>
                    </div>

                    <div className="grid gap-6 md:grid-cols-3">
                        <div className="space-y-4 rounded-xl border border-white/10 bg-black/40 p-6">
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/20">
                                <Bell className="h-6 w-6 text-primary" />
                            </div>
                            <h3 className="text-lg font-semibold">New Accounts</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                Get gentle alerts when we spot "Welcome" or "Account created" emails from services you've never seen before.
                            </p>
                        </div>

                        <div className="space-y-4 rounded-xl border border-white/10 bg-black/40 p-6">
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-red-500/20">
                                <AlertTriangle className="h-6 w-6 text-red-400" />
                            </div>
                            <h3 className="text-lg font-semibold">New Breaches</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                If a service appears in a new breach, we'll flag it so you can reset passwords or close the account.
                            </p>
                        </div>

                        <div className="space-y-4 rounded-xl border border-white/10 bg-black/40 p-6">
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-500/20">
                                <Trash2 className="h-6 w-6 text-emerald-400" />
                            </div>
                            <h3 className="text-lg font-semibold">Deletion Tracking</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                Track which services you've asked to delete data and see when they reply or complete your request.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Privacy Guarantee */}
                <section className="space-y-6 rounded-2xl border border-primary/40 bg-primary/5 p-8 md:p-12">
                    <div className="space-y-4 text-center max-w-2xl mx-auto">
                        <div className="flex justify-center gap-6">
                            <div className="flex items-center gap-2">
                                <EyeOff className="h-5 w-5 text-primary" />
                                <span className="text-sm font-medium">Metadata Only</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Lock className="h-5 w-5 text-primary" />
                                <span className="text-sm font-medium">Encrypted</span>
                            </div>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            GhostSweep uses Google's official OAuth2 and only reads metadata (sender, subject, date). OAuth tokens are encrypted, and you can disconnect and wipe your scan history anytime.
                        </p>
                        <Link
                            href="/home/security"
                            className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                        >
                            Read Full Security Documentation
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>
                </section>

                {/* Final CTA */}
                <section className="space-y-8 text-center">
                    <div className="space-y-4 max-w-2xl mx-auto">
                        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
                            Ready to see who has your data?
                        </h2>
                        <p className="text-lg text-muted-foreground">
                            Get a clear map of your accounts, breaches, and privacy opportunities in minutes.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <Link
                            href="/login"
                            className="inline-flex items-center gap-2 rounded-lg bg-primary px-8 py-4 text-sm font-semibold text-primary-foreground shadow-lg hover:opacity-90 transition"
                        >
                            Start Free Scan
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                        <Link
                            href="/home#pricing"
                            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition"
                        >
                            Compare Plans
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>
                </section>
            </div>
        </main>
    );
}