/* eslint-disable react/no-unescaped-entities */
"use client";

import Link from "next/link";
import {
    ArrowRight,
    ShieldCheck,
    Mail,
    Scan,
    Trash2,
    Eye,
    Lock,
    EyeOff,
    CheckCircle,
    Fingerprint,
    DollarSign,
    Ghost,
    Sparkles,
} from "lucide-react";

export default function HowItWorksPage() {
    const howToSchema = {
        "@context": "https://schema.org",
        "@type": "HowTo",
        name: "How GhostSweep Works — Find, Protect, and Clean Your Digital Life",
        description:
            "Step-by-step: connect your inbox, scan for accounts and shadow profiles, recover hidden value, and delete what you don't need.",
        image: "https://znlaksqttxokoeavwqjf.supabase.co/storage/v1/object/public/news/ghost-svgrepo-com.png",
        step: [
            {
                "@type": "HowToStep",
                name: "Connect your inbox",
                text: "Sign in securely with Gmail or Outlook. GhostSweep scans your inbox to discover every account you've ever created.",
            },
            {
                "@type": "HowToStep",
                name: "We scan everywhere",
                text: "Your inbox reveals hidden accounts. Our shadow scanner searches the web for profiles tied to your identity. Breach databases are checked in real-time.",
            },
            {
                "@type": "HowToStep",
                name: "See the full picture",
                text: "Everything surfaces on your dashboard — accounts, shadow profiles, breaches, gift cards, subscriptions, and newsletters.",
            },
            {
                "@type": "HowToStep",
                name: "Take action",
                text: "Delete accounts, unsubscribe from newsletters, recover hidden money, and secure breached credentials.",
            },
        ],
    };

    const pageSchema = {
        "@context": "https://schema.org",
        "@type": "WebPage",
        name: "How It Works | GhostSweep",
        description:
            "Learn how GhostSweep discovers every account, finds shadow profiles, and recovers hidden value from your inbox.",
        url: "https://ghostsweep.com/home/how-it-works",
        publisher: {
            "@type": "Organization",
            name: "GhostSweep",
            logo: {
                "@type": "ImageObject",
                url: "https://znlaksqttxokoeavwqjf.supabase.co/storage/v1/object/public/news/ghost-svgrepo-com.png",
            },
        },
    };

    const steps = [
        {
            num: "01",
            icon: Mail,
            title: "Connect your inbox",
            description:
                "Sign in with Gmail or Outlook through Google's or Microsoft's official OAuth flow. GhostSweep securely scans your inbox to discover every service you've ever signed up for.",
            details: [
                "You'll see the permission screen before anything happens",
                "We only request minimum access needed",
                "Disconnect anytime from GhostSweep or your Google/Microsoft account",
            ],
        },
        {
            num: "02",
            icon: Scan,
            title: "We scan everywhere",
            description:
                "Your inbox reveals accounts you forgot about. Our Identity Shadow scanner searches the web using your email, phone, or username to find profiles you didn't even know existed. Every discovery is cross-referenced against breach databases.",
            details: [
                "Inbox scan discovers services from years of sign-ups",
                "Shadow scanner checks hundreds of services across the web",
                "Real-time breach detection on every discovered account",
            ],
        },
        {
            num: "03",
            icon: Eye,
            title: "See the full picture",
            description:
                "Everything surfaces on your dashboard — discovered accounts, shadow profiles, breach risks, forgotten gift cards, active subscriptions, and newsletter noise. Risk-scored and organized.",
            details: [
                "Accounts grouped by service with breach flags",
                "Hidden value surfaced: gift cards, coupons, rewards",
                "Newsletters identified and ready to unsubscribe",
            ],
        },
        {
            num: "04",
            icon: Trash2,
            title: "Take action",
            description:
                "Delete accounts you don't need. Unsubscribe from junk newsletters. Recover forgotten gift cards and coupons. Secure breached credentials. Everything is review-first — nothing happens without your explicit approval.",
            details: [
                "Direct links and step-by-step deletion guides",
                "One-click bulk newsletter unsubscribe",
                "Value recovery for gift cards and rewards",
                "You preview and approve every action",
            ],
        },
    ];

    return (
        <main className="min-h-screen bg-[#050505]">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(pageSchema) }}
            />

            {/* Hero */}
            <section className="relative isolate overflow-hidden pt-24 pb-20 sm:pt-32 sm:pb-28">
                <div className="pointer-events-none absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
                    <div className="relative left-[calc(50%-11rem)] aspect-1155/678 w-xl -translate-x-1/2 rotate-30 bg-linear-to-tr from-emerald-500 to-teal-700 opacity-10 sm:left-[calc(50%-30rem)] sm:w-6xl" />
                </div>

                <div className="mx-auto max-w-3xl px-6 text-center">
                    <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs text-white/50">
                        <Ghost className="h-3 w-3 text-emerald-400" />
                        How GhostSweep works
                    </div>

                    <h1 className="text-4xl sm:text-6xl font-semibold tracking-tight text-white leading-[1.08]">
                        Connect. Discover.
                        <br />
                        <span className="text-white/30">Take control.</span>
                    </h1>

                    <p className="mx-auto mt-8 max-w-xl text-lg text-white/45 font-light leading-relaxed">
                        Four steps to understanding your entire digital footprint — every account, every shadow profile, every dollar hiding in your inbox.
                    </p>
                </div>
            </section>

            {/* Steps */}
            <section className="pb-28">
                <div className="mx-auto max-w-4xl px-6 space-y-8">
                    {steps.map((step) => (
                        <div
                            key={step.num}
                            className="group rounded-2xl border border-white/5 bg-white/2 p-8 sm:p-10 hover:border-white/10 transition-colors duration-300"
                        >
                            <div className="flex flex-col sm:flex-row items-start gap-6">
                                <div className="shrink-0 h-14 w-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                                    <step.icon className="h-6 w-6 text-emerald-400" />
                                </div>
                                <div className="flex-1">
                                    <span className="text-[10px] font-mono text-white/20 uppercase tracking-widest">
                                        Step {step.num}
                                    </span>
                                    <h2 className="text-xl sm:text-2xl font-semibold text-white mt-1 mb-3">
                                        {step.title}
                                    </h2>
                                    <p className="text-sm text-white/45 leading-relaxed mb-6 max-w-2xl">
                                        {step.description}
                                    </p>
                                    <ul className="space-y-2.5">
                                        {step.details.map((detail) => (
                                            <li
                                                key={detail}
                                                className="flex items-start gap-2.5 text-sm text-white/55"
                                            >
                                                <CheckCircle className="h-4 w-4 text-emerald-400/60 mt-0.5 shrink-0" />
                                                {detail}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* What we look for */}
            <section className="py-28 border-t border-white/5">
                <div className="mx-auto max-w-4xl px-6">
                    <div className="text-center mb-16">
                        <p className="text-sm uppercase tracking-[0.2em] text-white/25 mb-6">
                            What we find
                        </p>
                        <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white">
                            Three categories of discovery.
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        {[
                            {
                                icon: DollarSign,
                                title: "Hidden Value",
                                description:
                                    "Gift card codes, unused rewards points, expiring coupons, and subscriptions you're overpaying for.",
                                color: "text-amber-400 bg-amber-500/10 border-amber-500/20",
                            },
                            {
                                icon: Fingerprint,
                                title: "Shadow Profiles",
                                description:
                                    "Accounts that exist under your email, phone, or username — often without your knowledge. Found across hundreds of services.",
                                color: "text-purple-400 bg-purple-500/10 border-purple-500/20",
                            },
                            {
                                icon: ShieldCheck,
                                title: "Safety Risks",
                                description:
                                    "Breached services, compromised credentials, and forgotten accounts leaking your data to anyone who looks.",
                                color: "text-red-400 bg-red-500/10 border-red-500/20",
                            },
                        ].map((card) => (
                            <div
                                key={card.title}
                                className="rounded-2xl border border-white/5 bg-white/2 p-8 hover:border-white/10 transition-colors duration-300"
                            >
                                <div
                                    className={`h-11 w-11 rounded-xl border flex items-center justify-center mb-5 ${card.color}`}
                                >
                                    <card.icon className="h-5 w-5" />
                                </div>
                                <h3 className="text-base font-medium text-white mb-2">
                                    {card.title}
                                </h3>
                                <p className="text-sm text-white/40 leading-relaxed">
                                    {card.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Privacy guarantee */}
            <section className="py-20 border-t border-white/5">
                <div className="mx-auto max-w-3xl px-6">
                    <div className="rounded-2xl border border-white/10 bg-white/3 p-8 sm:p-10">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                                <Lock className="h-5 w-5 text-emerald-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-white">
                                Privacy guarantee
                            </h3>
                        </div>

                        <p className="text-sm text-white/45 leading-relaxed mb-6">
                            GhostSweep uses transient, RAM-only processing. Your raw email data is never stored, never sold, never shared. Nothing happens automatically — you preview and approve every action.
                        </p>

                        <div className="flex flex-wrap gap-6 text-xs text-white/35">
                            <span className="flex items-center gap-1.5">
                                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400/60" />
                                CASA Tier 2 Verified
                            </span>
                            <span className="flex items-center gap-1.5">
                                <EyeOff className="h-3.5 w-3.5" />
                                Zero email storage
                            </span>
                            <span className="flex items-center gap-1.5">
                                <Lock className="h-3.5 w-3.5" />
                                Revoke access anytime
                            </span>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-28 border-t border-white/5">
                <div className="mx-auto max-w-3xl px-6 text-center">
                    <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white leading-tight">
                        Ready to see your
                        <br />
                        full digital footprint?
                    </h2>
                    <p className="mx-auto mt-6 max-w-md text-base text-white/40 leading-relaxed">
                        Free scan. Results in under two minutes. Upgrade only when you want full control.
                    </p>
                    <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link
                            href="/login"
                            className="group inline-flex items-center gap-2.5 rounded-full bg-emerald-500 px-8 py-4 text-sm font-semibold text-black transition-all hover:bg-emerald-400 hover:shadow-[0_0_60px_-10px_rgba(16,185,129,0.4)]"
                        >
                            <Sparkles className="h-4 w-4" />
                            Start Free Scan
                            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </Link>
                        <Link
                            href="/home#pricing"
                            className="text-sm text-white/40 hover:text-white transition"
                        >
                            Compare plans →
                        </Link>
                    </div>
                </div>
            </section>
        </main>
    );
}
