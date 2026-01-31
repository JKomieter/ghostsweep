/* eslint-disable react/no-unescaped-entities */
"use client";

import Link from "next/link";
import {
    ArrowRight,
    ShieldCheck,
    CheckCircle,
    X,
    Check,
    Send,
    Search,
    FileWarning,
    Fingerprint,
    Sparkles,
    ListChecks,
    Mail,
    BadgeCheck,
    ChevronDown,
    Zap,
    Play,
    DollarSign,
    Trash2,
    Ghost,
    Lock,
    EyeOff,
    BarChart3,
    Clock
} from "lucide-react";
import Image from "next/image";
import { useState, useEffect } from "react";
import { OutLookLogo, GmailLogo } from "@/svgs";
import { cn } from "@/lib/utils";

// Structured data (JSON-LD) for search engines
const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "GhostSweep | The Digital Audit That Pays For Itself",
    "description": "Find forgotten money, kill inbox noise, and delete leaked data. The average GhostSweep user finds $1,800 in forgotten value.",
    "url": "https://ghostsweep.com/home",
    "image": "https://znlaksqttxokoeavwqjf.supabase.co/storage/v1/object/public/news/ghost-svgrepo-com.png",
    "publisher": {
        "@type": "Organization",
        "name": "GhostSweep",
        "logo": {
            "@type": "ImageObject",
            "url": "https://znlaksqttxokoeavwqjf.supabase.co/storage/v1/object/public/news/ghost-svgrepo-com.png",
        },
    },
};

// FAQ Schema for rich snippets
const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
        {
            "@type": "Question",
            "name": "How does GhostSweep find money?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "We scan your email metadata and content for unused gift cards, forgotten subscriptions, and expiring rewards points. The average user uncovers $1,842 in realized value.",
            },
        },
        {
            "@type": "Question",
            "name": "Is my banking data safe?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "We do NOT scan your bank account. We analyze email receipts and confirmations. Your financial credentials remain untouched. GhostSweep is privacy-first by design.",
            },
        },
        {
            "@type": "Question",
            "name": "Do you sell my data?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Absolutely not. Unlike 'free' cleanup tools, our product is you paying us, not us selling you. We operate on a strict zero-data-sales policy.",
            },
        },
        {
            "@type": "Question",
            "name": "Can I cancel?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Yes. Cancel anytime from your dashboard. If we didn't find you value, we didn't do our job.",
            },
        },
    ],
};

function HeroDashboard() {
    const [valueFound, setValueFound] = useState(0);
    const [newsletters, setNewsletters] = useState(0);
    const [accounts, setAccounts] = useState(0);

    useEffect(() => {
        const timer1 = setTimeout(() => setValueFound(1842), 500);
        const timer2 = setTimeout(() => setNewsletters(47), 800);
        const timer3 = setTimeout(() => setAccounts(147), 1100);
        return () => {
            clearTimeout(timer1);
            clearTimeout(timer2);
            clearTimeout(timer3);
        };
    }, []);

    return (
        <div className="relative mx-auto max-w-4xl rounded-xl border border-white/10 bg-black/40 p-1 backdrop-blur-xl shadow-2xl">
            <div className="absolute -inset-1 rounded-xl bg-gradient-to-r from-emerald-500/20 via-blue-500/20 to-purple-500/20 blur opacity-50" />
            <div className="relative rounded-lg bg-[#0A0A0A] p-6 sm:p-8">
                <div className="flex items-center justify-between border-b border-white/5 pb-6 mb-6">
                    <div className="flex items-center gap-3">
                        <div className="h-3 w-3 rounded-full bg-red-500/50" />
                        <div className="h-3 w-3 rounded-full bg-yellow-500/50" />
                        <div className="h-3 w-3 rounded-full bg-green-500/50" />
                    </div>
                    <div className="text-xs font-mono text-white/30 uppercase tracking-widest">
                        Live Scan :: Active
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Value Card */}
                    <div className="group rounded-lg bg-emerald-500/5 border border-emerald-500/10 p-6 transition hover:bg-emerald-500/10">
                        <div className="flex items-center justify-between mb-4">
                            <DollarSign className="h-5 w-5 text-emerald-400" />
                            <span className="text-[10px] text-emerald-400/60 uppercase tracking-wider font-semibold">Value Recovered</span>
                        </div>
                        <div className="text-3xl font-light text-white transition-all duration-1000">
                            ${valueFound.toLocaleString()}
                        </div>
                        <p className="mt-2 text-xs text-white/40">
                            Unclaimed cards & subscriptions
                        </p>
                    </div>

                    {/* Newsletters Card */}
                    <div className="group rounded-lg bg-blue-500/5 border border-blue-500/10 p-6 transition hover:bg-blue-500/10">
                        <div className="flex items-center justify-between mb-4">
                            <Mail className="h-5 w-5 text-blue-400" />
                            <span className="text-[10px] text-blue-400/60 uppercase tracking-wider font-semibold">Noise Removed</span>
                        </div>
                        <div className="text-3xl font-light text-white transition-all duration-1000">
                            {newsletters}
                        </div>
                        <p className="mt-2 text-xs text-white/40">
                            Newsletters ghosted forever
                        </p>
                    </div>

                    {/* Accounts Card */}
                    <div className="group rounded-lg bg-purple-500/5 border border-purple-500/10 p-6 transition hover:bg-purple-500/10">
                        <div className="flex items-center justify-between mb-4">
                            <Ghost className="h-5 w-5 text-purple-400" />
                            <span className="text-[10px] text-purple-400/60 uppercase tracking-wider font-semibold">Shadow Cleared</span>
                        </div>
                        <div className="text-3xl font-light text-white transition-all duration-1000">
                            {accounts}
                        </div>
                        <p className="mt-2 text-xs text-white/40">
                            Zombie accounts identified
                        </p>
                    </div>
                </div>

                <div className="mt-8 flex items-center justify-between text-xs text-white/30 font-mono">
                    <div>SCAN_ID: GS-8829-X</div>
                    <div className="flex items-center gap-2">
                         <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        Processing...
                    </div>
                </div>
            </div>
        </div>
    );
}

function TrinitySection() {
    return (
        <section className="py-24 relative overflow-hidden">
            <div className="absolute inset-0 bg-white/[0.02]" />
            <div className="container mx-auto px-4 relative z-10">
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <h2 className="text-3xl font-light text-white">The Digital Sovereignty Trinity</h2>
                    <p className="mt-4 text-white/60">
                        Most tools do one thing badly. We execute three high-leverage operations perfectly.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {/* Value Recovery */}
                    <div className="group p-8 rounded-2xl border border-white/5 bg-white/2 hover:border-emerald-500/30 transition duration-300">
                        <div className="h-12 w-12 rounded-full bg-emerald-500/10 flex items-center justify-center mb-6 text-emerald-400">
                            <DollarSign className="h-6 w-6" />
                        </div>
                        <h3 className="text-xl text-white mb-3">Value Recovery</h3>
                        <p className="text-white/50 text-sm leading-relaxed mb-6">
                            We parse years of receipts to find money you left on the table. Unused gift cards, forgotten SaaS subscriptions, and expiring rewards points.
                        </p>
                        <ul className="space-y-2 text-sm text-white/70">
                            <li className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-emerald-500/50" />
                                <span>Cancel subscriptions instantly</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-emerald-500/50" />
                                <span>Find hidden gift cards</span>
                            </li>
                        </ul>
                    </div>

                    {/* Inbox Sanitization */}
                    <div className="group p-8 rounded-2xl border border-white/5 bg-white/2 hover:border-blue-500/30 transition duration-300">
                        <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center mb-6 text-blue-400">
                            <Mail className="h-6 w-6" />
                        </div>
                        <h3 className="text-xl text-white mb-3">Inbox Sanitization</h3>
                        <p className="text-white/50 text-sm leading-relaxed mb-6">
                            Turn down the volume. Bulk-unsubscribe from the 47+ newsletters you never read but delete every morning. Reclaim your attention span.
                        </p>
                        <ul className="space-y-2 text-sm text-white/70">
                            <li className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-blue-500/50" />
                                <span>One-click bulk unsubscribe</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-blue-500/50" />
                                <span>Auto-archive noise</span>
                            </li>
                        </ul>
                    </div>

                    {/* Digital Shadow Mapping */}
                    <div className="group p-8 rounded-2xl border border-white/5 bg-white/2 hover:border-purple-500/30 transition duration-300">
                        <div className="h-12 w-12 rounded-full bg-purple-500/10 flex items-center justify-center mb-6 text-purple-400">
                            <Ghost className="h-6 w-6" />
                        </div>
                        <h3 className="text-xl text-white mb-3">Digital Shadow Mapping</h3>
                        <p className="text-white/50 text-sm leading-relaxed mb-6">
                            See everywhere you've been. We map your signups, leaked passwords, and vulnerable old accounts so you can nuke them.
                        </p>
                        <ul className="space-y-2 text-sm text-white/70">
                            <li className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-purple-500/50" />
                                <span>Delete old accounts</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-purple-500/50" />
                                <span>Breach monitoring</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </section>
    );
}

function GhostEngineSection() {
    return (
        <section className="py-24 border-y border-white/5 bg-white/2">
            <div className="container mx-auto px-4">
                <div className="flex flex-col lg:flex-row items-center gap-16">
                    <div className="flex-1 space-y-8">
                        <div>
                           <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-400 mb-6">
                                <Sparkles className="h-3 w-3" />
                                <span>The Ghost Engine</span>
                            </div>
                            <h2 className="text-3xl md:text-4xl font-light text-white leading-tight">
                                AI Scanning. <br/>
                                <span className="text-white/40">Zero Usage Data.</span>
                            </h2>
                        </div>
                        
                        <p className="text-lg text-white/60 font-light leading-relaxed">
                            Competitors like Unroll.me sell your receipt data to hedge funds. We do the opposite. 
                            Our local-first architecture scans email metadata and body content transiently to extract value, then discards the raw text immediately.
                        </p>

                        <div className="grid gap-6">
                            <div className="flex gap-4">
                                <div className="mt-1 h-8 w-8 shrink-0 rounded-lg bg-white/5 flex items-center justify-center border border-white/10">
                                    <Lock className="h-4 w-4 text-white" />
                                </div>
                                <div>
                                    <h4 className="text-white font-medium mb-1">Bank-Grade Encryption</h4>
                                    <p className="text-sm text-white/50">Your credentials never touch our servers. We use OAuth tokens that you can revoke instantly.</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="mt-1 h-8 w-8 shrink-0 rounded-lg bg-white/5 flex items-center justify-center border border-white/10">
                                    <EyeOff className="h-4 w-4 text-white" />
                                </div>
                                <div>
                                    <h4 className="text-white font-medium mb-1">Privacy-First Business Model</h4>
                                    <p className="text-sm text-white/50">You are the customer, not the product. We charge a fair price so we never have to sell your data.</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-4 pt-4">
                            <div className="flex items-center gap-2 px-4 py-2 rounded-lg border border-white/10 bg-[#EA4335]/10 text-white/70 text-xs">
                                <GmailLogo className="h-4 w-4 opacity-70" />
                                <span>Verified Google Partner</span>
                            </div>
                            {/* <div className="flex items-center gap-2 px-4 py-2 rounded-lg border border-white/10 bg-[#0078D4]/10 text-white/70 text-xs">
                                <OutLookLogo className="h-4 w-4 opacity-70" />
                                <span>Microsoft Verified</span>
                            </div> */}
                        </div>
                    </div>

                    <div className="flex-1 w-full relative">
                        <div className="absolute -inset-4 bg-gradient-to-r from-emerald-500/20 to-purple-500/20 opacity-30 blur-2xl rounded-full" />
                        <div className="relative rounded-xl border border-white/10 bg-black/80 overflow-hidden shadow-2xl">
                           <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3 bg-white/5">
                                <div className="h-2.5 w-2.5 rounded-full bg-red-500/20" />
                                <div className="h-2.5 w-2.5 rounded-full bg-yellow-500/20" />
                                <div className="h-2.5 w-2.5 rounded-full bg-green-500/20" />
                                <div className="ml-2 text-[10px] text-white/30 font-mono">GhostEngine_Log_v2.4.1</div>
                           </div>
                           <div className="p-6 font-mono text-xs space-y-3">
                                <div className="flex items-center gap-2 text-emerald-400/80">
                                    <Check className="h-3 w-3" />
                                    <span>Scan initiated: INBOX</span>
                                </div>
                                <div className="text-white/40 pl-5">Analyzing 12,403 emails...</div>
                                <div className="flex items-center gap-2 text-blue-400/80 pl-5">
                                    <Zap className="h-3 w-3" />
                                    <span>Detected: newsletter@substack.com (High Frequency)</span>
                                </div>
                                <div className="flex items-center gap-2 text-purple-400/80 pl-5">
                                    <Ghost className="h-3 w-3" />
                                    <span>Identified: 8 yr old Netflix subscription (Inactive)</span>
                                </div>
                                <div className="flex items-center gap-2 text-emerald-400 pl-5 bg-emerald-500/10 py-1 pr-2 rounded w-fit">
                                    <DollarSign className="h-3 w-3" />
                                    <span>FOUND: $15.99/mo recurring waste</span>
                                </div>
                                <div className="flex items-center gap-2 text-emerald-400 pl-5 bg-emerald-500/10 py-1 pr-2 rounded w-fit">
                                    <DollarSign className="h-3 w-3" />
                                    <span>FOUND: Amazon Gift Card ($50.00) Balance</span>
                                </div>
                                <div className="animate-pulse text-white/30 pl-5 pt-2">
                                    &gt; Waiting for user action...
                                </div>
                           </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

function PricingSection() {
    return (
        <section className="py-24 container mx-auto px-4" id="pricing">
            <div className="text-center max-w-2xl mx-auto mb-16">
                <h2 className="text-3xl font-light text-white">The Audit That Pays For Itself</h2>
                <p className="mt-4 text-white/60">
                    Most users find enough forgotten value in the first 10 minutes to pay for 5 years of GhostSweep.
                </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                {/* Monthly */}
                <div className="rounded-2xl border border-white/10 bg-white/2 p-8 flex flex-col">
                    <div className="mb-4 text-lg text-white font-medium">Self-Funding</div>
                   <div className="flex items-baseline gap-1 mb-6">
                        <span className="text-4xl text-white font-light">$19</span>
                        <span className="text-white/40">/mo</span>
                    </div>
                    <p className="text-sm text-white/50 mb-8 h-10">
                        Perfect for a one-time deep clean and value extraction.
                    </p>
                    <ul className="space-y-4 mb-8 flex-1">
                         <li className="flex items-center gap-3 text-sm text-white/70">
                            <Check className="h-4 w-4 text-white" />
                            <span>Unlimited Value Scanning</span>
                        </li>
                        <li className="flex items-center gap-3 text-sm text-white/70">
                            <Check className="h-4 w-4 text-white" />
                            <span>Full Inbox Sanitization</span>
                        </li>
                        <li className="flex items-center gap-3 text-sm text-white/70">
                            <Check className="h-4 w-4 text-white" />
                            <span>Account Deletion Engine</span>
                        </li>
                    </ul>
                    <Link
                        href="/login?plan=monthly"
                        className="w-full flex items-center justify-center rounded-lg bg-white/10 border border-white/5 py-3 text-sm text-white hover:bg-white/20 transition"
                    >
                        Start Monthly
                    </Link>
                </div>

                {/* Annual */}
                <div className="relative rounded-2xl border border-emerald-500/30 bg-white/5 p-8 flex flex-col shadow-2xl shadow-emerald-900/20">
                    <div className="absolute -top-3 right-8 rounded-full bg-emerald-500 px-3 py-1 text-[10px] font-bold text-black uppercase tracking-wide">
                        Best Value
                    </div>
                    <div className="mb-4 text-lg text-emerald-400 font-medium">Founder's Annual</div>
                   <div className="flex items-baseline gap-1 mb-6">
                        <span className="text-4xl text-white font-light">$149</span>
                        <span className="text-white/40">/yr</span>
                    </div>
                     <p className="text-sm text-white/50 mb-8 h-10">
                         Continuous monitoring for new leaks, subscriptions, and spam.
                    </p>
                    <ul className="space-y-4 mb-8 flex-1">
                         <li className="flex items-center gap-3 text-sm text-white/90">
                            <Check className="h-4 w-4 text-emerald-400" />
                            <span>Everything in Monthly</span>
                        </li>
                        <li className="flex items-center gap-3 text-sm text-white/90">
                            <Check className="h-4 w-4 text-emerald-400" />
                            <span>Priority Support</span>
                        </li>
                        <li className="flex items-center gap-3 text-sm text-white/90">
                            <Check className="h-4 w-4 text-emerald-400" />
                            <span>Save 35% vs Monthly</span>
                        </li>
                    </ul>
                    <Link
                        href="/login?plan=annual"
                        className="w-full flex items-center justify-center rounded-lg bg-emerald-500 py-3 text-sm text-black font-medium hover:bg-emerald-400 transition"
                    >
                        Get Founder's Annual
                    </Link>
                </div>
            </div>
             <p className="text-center mt-8 text-xs text-white/30">
                Cancel anytime. 30-day money-back guarantee if we don't find value.
            </p>
        </section>
    );
}

function FAQSection() {
    const faqs = [
        {
            q: "How does GhostSweep find money?",
            a: "We scan your email metadata and content for receipts, unused gift cards, forgotten subscriptions, and expiring rewards points. The average user uncovers $1,842 in realized value.",
        },
        {
            q: "Is my banking data safe?",
            a: "We do NOT scan your bank account. We analyze email receipts and confirmations via OAuth restricted access. Your financial credentials remain untouched. GhostSweep is privacy-first by design.",
        },
        {
            q: "Do you sell my data?",
            a: "Absolutely not. Unlike 'free' cleanup tools, our product is you paying us, not us selling you. We operate on a strict zero-data-sales policy. Your data is processed transiently and never stored permanently.",
        },
        {
            q: "Can I cancel?",
            a: "Yes. Cancel anytime from your dashboard. If we didn't find you value, we didn't do our job.",
        },
    ];

    return (
        <section className="py-24 container mx-auto px-4 border-t border-white/5" id="faq">
            <div className="max-w-3xl mx-auto">
                <h2 className="text-2xl font-light text-center text-white mb-12">Common Questions</h2>
                <div className="space-y-6">
                    {faqs.map((faq, i) => (
                        <div key={i} className="rounded-xl border border-white/5 bg-white/2 p-6">
                            <h3 className="text-lg font-medium text-white mb-2">{faq.q}</h3>
                            <p className="text-sm text-white/60 leading-relaxed">{faq.a}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

export default function HomePage() {
    return (
        <main className="min-h-screen bg-[#050505] selection:bg-emerald-500/30">
            {/* Inject Structured Data */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
            />

            <div className="relative isolate overflow-hidden">
                {/* Background Effects */}
                <div className="pointer-events-none absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
                    <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#10b981] to-[#047857] opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" />
                </div>

                <div className="mx-auto max-w-7xl px-6 pb-24 pt-10 sm:pb-32 lg:flex lg:px-8 lg:py-40">
                    <div className="mx-auto max-w-4xl text-center">
                        <div className="mb-8 flex justify-center">
                            <div className="rounded-full px-3 py-1 text-sm leading-6 text-emerald-400 ring-1 ring-white/10 hover:ring-white/20 bg-white/5">
                                Now Scanning: Gift Cards & Subscriptions
                            </div>
                        </div>

                        <h1 className="mt-10 text-4xl font-light tracking-tight text-white sm:text-6xl mb-6">
                            Find <span className="text-emerald-400 font-normal">$1,800</span> hiding in your email.
                        </h1>
                        <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-gray-400">
                            GhostSweep is the digital audit that pays for itself. We find your forgotten money, kill your digital noise, and delete your leaked data.
                        </p>
                        
                        <div className="mt-10 flex items-center justify-center gap-x-6">
                            <Link
                                href="/login"
                                className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-emerald-500 px-8 py-4 text-sm font-semibold text-black transition-all hover:bg-emerald-400 hover:shadow-[0_0_40px_-10px_rgba(16,185,129,0.5)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400"
                            >
                                Start Free Scan
                                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                            </Link>

                        </div>
                        
                         <div className="mt-16">
                            <HeroDashboard />
                        </div>
                    </div>
                </div>

                <TrinitySection />
                <GhostEngineSection />
                <PricingSection />
                <FAQSection />

                {/* Footer Section */}
                <footer className="border-t border-white/5 pt-12 pb-12 bg-black/40">
                    <div className="container mx-auto px-4">
                        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
                             <div className="flex items-center gap-2">
                                <span className="text-white/80 font-semibold tracking-tight">GhostSweep</span>
                                <span className="text-white/20 text-xs">v3.0</span>
                             </div>
                            
                            <p className="text-[11px] text-white/40">
                                © {new Date().getFullYear()} GhostSweep Inc. Privacy-First.
                            </p>

                            <div className="flex flex-wrap justify-center gap-6 text-xs text-white/50">
                                <Link href="/home/privacy" className="hover:text-white transition">Privacy Policy</Link>
                                <Link href="/home/terms" className="hover:text-white transition">Terms of Service</Link>
                                <Link href="/home/security" className="hover:text-white transition">Security Audit</Link>
                                <Link href="mailto:support@ghostsweep.com" className="hover:text-white transition">Support</Link>
                            </div>
                        </div>
                    </div>
                </footer>

            </div>
        </main>
    );
}
