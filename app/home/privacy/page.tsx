/* eslint-disable react/no-unescaped-entities */
import Link from "next/link";
import { Metadata } from "next";
import {
    ShieldCheck,
    Mail,
    Globe2,
    Lock,
    AlertCircle,
    Send,
    Trash2,
    RefreshCw,
    ArrowRight,
} from "lucide-react";

export const metadata: Metadata = {
    title: "Privacy Policy | GhostSweep Data Protection",
    description: "Read GhostSweep's comprehensive privacy policy. Learn what data we collect, how we protect it, and how you maintain control over your information.",
    keywords: [
        "privacy policy",
        "data protection",
        "user data",
        "GDPR",
        "CCPA",
        "data collection",
        "privacy rights",
        "data deletion",
    ],
    openGraph: {
        title: "Privacy Policy | GhostSweep Data Protection",
        description: "Understand GhostSweep's privacy practices and how your data is protected.",
        url: "https://ghostsweep.com/home/privacy",
        type: "website",
    },
    alternates: {
        canonical: "https://ghostsweep.com/home/privacy",
    },
};

// WebPage schema for privacy page
const privacyPageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": "https://ghostsweep.com/home/privacy",
    "name": "Privacy Policy | GhostSweep Data Protection",
    "description": "GhostSweep's comprehensive privacy policy explaining data collection, protection, and user control.",
    "url": "https://ghostsweep.com/home/privacy",
    "publisher": {
        "@type": "Organization",
        "name": "GhostSweep",
        "logo": {
            "@type": "ImageObject",
            "url": "https://znlaksqttxokoeavwqjf.supabase.co/storage/v1/object/public/news/ghost-svgrepo-com.png",
        },
    },
};

export default function PrivacyPolicyPage() {
    return (
        <main className="min-h-screen bg-[#050505]">
            {/* JSON-LD Structured Data */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(privacyPageSchema) }}
            />

            <div className="mx-auto max-w-4xl px-4 py-10 space-y-10">
                {/* Header */}
                <header className="space-y-4 rounded-lg border border-white/5 bg-white/2 p-8 backdrop-blur-sm">
                    <p className="text-[11px] font-light uppercase tracking-widest text-emerald-300">
                        Privacy Policy
                    </p>
                    <h1 className="text-3xl font-light tracking-tight text-white md:text-4xl">
                        Your Data, Your Control
                    </h1>
                    <p className="max-w-2xl text-base text-white/60">
                        GhostSweep is designed with privacy-first principles. Learn exactly what data we collect, how we protect it, and how you maintain complete control.
                    </p>
                    <p className="text-xs text-white/60">
                        Last updated: Dec 13, 2025
                    </p>
                </header>

                {/* Summary */}
                <section className="grid gap-4 md:grid-cols-3">
                    <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-5 backdrop-blur-sm">
                        <div className="mb-3 flex items-center gap-2">
                            <ShieldCheck className="h-4 w-4 text-emerald-300" />
                            <p className="text-sm font-light text-white">Metadata-first</p>
                        </div>
                        <p className="text-xs text-emerald-300/80">
                            We scan email metadata (sender, subject, date) to detect services. Full email bodies are never read or stored.
                        </p>
                    </div>

                    <div className="rounded-lg border border-cyan-500/20 bg-cyan-500/10 p-5 backdrop-blur-sm">
                        <div className="mb-3 flex items-center gap-2">
                            <Lock className="h-4 w-4 text-cyan-300" />
                            <p className="text-sm font-light text-white">You control actions</p>
                        </div>
                        <p className="text-xs text-cyan-300/80">
                            Nothing happens without your explicit approval. Deletion emails only send when you trigger them.
                        </p>
                    </div>

                    <div className="rounded-lg border border-violet-500/20 bg-violet-500/10 p-5 backdrop-blur-sm">
                        <div className="mb-3 flex items-center gap-2">
                            <Globe2 className="h-4 w-4 text-violet-300" />
                            <p className="text-sm font-light text-white">No data selling</p>
                        </div>
                        <p className="text-xs text-violet-300/80">
                            We never sell your data. Third parties only used for hosting, billing, and error monitoring.
                        </p>
                    </div>
                </section>

                {/* Who we are */}
                <section className="space-y-3 rounded-lg border border-white/5 bg-white/2 p-6 backdrop-blur-sm">
                    <h2 className="text-xl font-light text-white">1. Who we are</h2>
                    <p className="text-sm text-white/60">
                        GhostSweep is a web application that helps you:
                    </p>
                    <ul className="space-y-2 list-disc pl-5 text-sm text-white/60">
                        <li>Find services linked to your email address (via inbox metadata signals).</li>
                        <li>Identify potential breach exposure using breach sources you choose to query.</li>
                        <li>Generate and track account deletion requests across services.</li>
                    </ul>
                    <p className="text-sm text-white/60">
                        Questions? Contact{" "}
                        <a href="mailto:support@ghostsweep.com" className="text-white underline hover:text-white/80 font-light">
                            support@ghostsweep.com
                        </a>
                    </p>
                </section>

                {/* Information we collect */}
                <section className="space-y-4 rounded-lg border border-white/5 bg-white/2 p-6 backdrop-blur-sm">
                    <h2 className="text-xl font-light text-white">2. Information we collect</h2>

                    <div className="space-y-3">
                        <div>
                            <h3 className="text-[11px] font-light uppercase tracking-widest text-white/60 mb-2">2.1 Account information</h3>
                            <p className="text-sm text-white/60">
                                When you create an account, we collect your email address and authentication details through our authentication provider (Supabase Auth). We may store basic profile information if you choose to provide it.
                            </p>
                        </div>

                        <div>
                            <h3 className="text-[11px] font-light uppercase tracking-widest text-white/60 mb-2">2.2 Email connection (Google & Microsoft OAuth)</h3>
                            <p className="text-sm text-white/60 mb-3">
                                When you connect Gmail or Outlook, we use official OAuth flows to access the data needed to provide GhostSweep features.
                            </p>

                            <div className="grid gap-3 md:grid-cols-2 mb-3">
                                <div className="rounded-lg border border-white/5 bg-white/2 p-4 backdrop-blur-sm">
                                    <div className="mb-2 flex items-center gap-2">
                                        <Mail className="h-4 w-4 text-white" />
                                        <p className="text-xs font-light text-white">Inbox scanning (sweeps)</p>
                                    </div>
                                    <p className="text-xs text-white/60">
                                        Sweeps access email metadata (sender, subject, timestamps) to detect services. We do not read or store full email bodies.
                                    </p>
                                </div>

                                <div className="rounded-lg border border-white/5 bg-white/2 p-4 backdrop-blur-sm">
                                    <div className="mb-2 flex items-center gap-2">
                                        <Send className="h-4 w-4 text-white" />
                                        <p className="text-xs font-light text-white">Sending deletion requests</p>
                                    </div>
                                    <p className="text-xs text-white/60">
                                        Deletion emails are sent only when you explicitly trigger them. We only send when you approve.
                                    </p>
                                </div>
                            </div>

                            <p className="text-sm text-white/60">
                                You can disconnect your email account at any time to revoke access.
                            </p>
                        </div>

                        <div>
                            <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-emerald-300 mb-2">2.3 Sweep summaries and service data</h3>
                            <p className="text-sm text-zinc-300 mb-2">We store:</p>
                            <ul className="space-y-1 list-disc pl-5 text-sm text-zinc-300">
                                <li>Detected services/domains associated with your inbox signals.</li>
                                <li>Activity indicators (first seen, last seen, message counts).</li>
                                <li>Risk indicators (breached flags and breach metadata).</li>
                                <li>Sweep history (status, progress, timestamps).</li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-emerald-300 mb-2">2.4 Deletion requests and tracking</h3>
                            <p className="text-sm text-zinc-300 mb-2">We store deletion workflow records such as:</p>
                            <ul className="space-y-1 list-disc pl-5 text-sm text-zinc-300">
                                <li>Services you selected for deletion.</li>
                                <li>Deletion method and destination address/link.</li>
                                <li>Status tracking (queued, sent, waiting, follow-up sent, completed, failed).</li>
                                <li>Timestamps and limited error logs.</li>
                            </ul>
                            <p className="text-sm text-zinc-300 mt-2">
                                GhostSweep helps you send requests and track progress — it doesn't automatically delete accounts.
                            </p>
                        </div>

                        <div>
                            <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-emerald-300 mb-2">2.5 Payment information</h3>
                            <p className="text-sm text-zinc-300">
                                When you purchase a subscription, payments are processed by Stripe. GhostSweep does not store full card details. We store subscription status, plan, and billing metadata (Stripe customer ID, renewals).
                            </p>
                        </div>

                        <div>
                            <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-emerald-300 mb-2">2.6 Usage and diagnostic data</h3>
                            <p className="text-sm text-zinc-300">
                                We may collect basic technical information (pages visited, device/browser type, approximate region, performance metrics, error logs) to operate and improve GhostSweep. We do not use this data for ads.
                            </p>
                        </div>
                    </div>
                </section>

                {/* How we use */}
                <section className="space-y-3 rounded-lg border border-white/5 bg-white/2 p-6 backdrop-blur-sm">
                    <h2 className="text-xl font-light text-white">3. How we use your information</h2>
                    <p className="text-sm text-white/60">We use your data to:</p>
                    <ul className="space-y-2 list-disc pl-5 text-sm text-white/60">
                        <li>Run inbox sweeps and display service/breach results.</li>
                        <li>Show account risk indicators and priority signals.</li>
                        <li>Power deletion workflows you initiate.</li>
                        <li>Send service-related emails when relevant.</li>
                        <li>Provide support and respond to issues.</li>
                        <li>Handle billing and subscriptions.</li>
                        <li>Improve accuracy, reliability, security, and user experience.</li>
                    </ul>
                </section>

                {/* Google user data */}
                <section className="space-y-3 rounded-lg border border-white/5 bg-white/2 p-6 backdrop-blur-sm">
                    <h2 className="text-xl font-light text-white">4. Use of Google and Microsoft user data</h2>
                    <p className="text-sm text-white/60">
                        GhostSweep's use of information from Google and Microsoft APIs adheres to their respective user data policies: {" "}
                        <a
                            href="https://developers.google.com/terms/api-services-user-data-policy"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-white underline hover:text-white/80 font-light"
                        >
                            Google API Services User Data Policy
                        </a>
                        {" "}and{" "}
                        <a
                            href="https://learn.microsoft.com/en-us/legal/content-sharing-privacy"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-white underline hover:text-white/80 font-light"
                        >
                            Microsoft Privacy Policy
                        </a>
                    </p>
                    <ul className="space-y-2 list-disc pl-5 text-sm text-white/60">
                        <li>We use email data to provide features you request.</li>
                        <li>We don't use email data for ads or marketing profiling.</li>
                        <li>We don't sell email data. We only share with service providers as needed.</li>
                        <li>Access is restricted to automated systems and not available for human review except for security/debugging.</li>
                    </ul>

                    <div className="rounded-lg border border-white/5 bg-white/2 p-4 mt-3 backdrop-blur-sm">
                        <div className="flex items-center gap-2 mb-2">
                            <Trash2 className="h-4 w-4 text-white" />
                            <p className="text-sm font-light text-white">You can revoke access anytime</p>
                        </div>
                        <p className="text-xs text-white/60">
                            Disconnect your email from the app to revoke tokens. You can also delete sweep and deletion-tracking data anytime.
                        </p>
                    </div>
                </section>

                {/* Data retention */}
                <section className="space-y-3 rounded-lg border border-white/5 bg-white/2 p-6 backdrop-blur-sm">
                    <h2 className="text-xl font-light text-white">5. Data retention and deletion</h2>
                    <p className="text-sm text-white/60">
                        We retain your data while your account is active, unless you request deletion.
                    </p>
                    <ul className="space-y-2 list-disc pl-5 text-sm text-white/60">
                        <li>Delete sweep data from within the app anytime.</li>
                        <li>Delete deletion tracking records from within the app anytime.</li>
                        <li>Disconnect your email to revoke access (we recommend deleting stored data).</li>
                        <li>Request full account deletion (removes profile, subscriptions, and history).</li>
                    </ul>
                </section>

                {/* Sharing */}
                <section className="space-y-3 rounded-lg border border-white/5 bg-white/2 p-6 backdrop-blur-sm">
                    <h2 className="text-xl font-light text-white">6. Sharing your information</h2>
                    <p className="text-sm text-white/60">We do not sell your data. We may share limited information with:</p>
                    <ul className="space-y-2 list-disc pl-5 text-sm text-white/60">
                        <li>Infrastructure providers (database, hosting, serverless functions).</li>
                        <li>Payment processors (Stripe) for billing.</li>
                        <li>Analytics/logging tools for performance monitoring.</li>
                        <li>Authorities if required by law or valid legal process.</li>
                    </ul>
                </section>

                {/* Your rights */}
                <section className="space-y-3 rounded-lg border border-white/5 bg-white/2 p-6 backdrop-blur-sm">
                    <h2 className="text-xl font-light text-white">7. Your rights and choices</h2>
                    <p className="text-sm text-white/60">
                        Depending on your location, you may have rights such as access, correction, deletion, limitation, or portability.
                    </p>
                    <p className="text-sm text-white/60">
                        To exercise these rights, contact{" "}
                        <a href="mailto:support@ghostsweep.com" className="text-white underline hover:text-white/80 font-light">
                            support@ghostsweep.com
                        </a>
                    </p>

                    <div className="grid gap-3 md:grid-cols-2 mt-3">
                        <div className="rounded-lg border border-white/5 bg-white/2 p-4 backdrop-blur-sm">
                            <div className="flex items-center gap-2 mb-2">
                                <RefreshCw className="h-4 w-4 text-white" />
                                <p className="text-xs font-light text-white">Manage automations</p>
                            </div>
                            <p className="text-xs text-white/60">
                                Disable follow-up reminders/automations for deletion requests anytime.
                            </p>
                        </div>
                        <div className="rounded-lg border border-white/5 bg-white/2 p-4 backdrop-blur-sm">
                            <div className="flex items-center gap-2 mb-2">
                                <Lock className="h-4 w-4 text-white" />
                                <p className="text-xs font-light text-white">Security choices</p>
                            </div>
                            <p className="text-xs text-white/60">
                                Revoke Gmail access, change password, and delete stored data from the app.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Security */}
                <section className="space-y-3 rounded-lg border border-white/5 bg-white/2 p-6 backdrop-blur-sm">
                    <h2 className="text-xl font-light text-white">8. Security</h2>
                    <p className="text-sm text-white/60">
                        We use reasonable measures to protect data, including encryption in transit, restricted access, and scoped database policies. No method is 100% secure.
                    </p>
                    <p className="text-sm text-white/60">
                        If you believe your account has been compromised, disconnect Gmail, change your password, and contact us.
                    </p>
                </section>

                {/* Children */}
                <section className="space-y-3 rounded-lg border border-white/5 bg-white/2 p-6 backdrop-blur-sm">
                    <h2 className="text-xl font-light text-white">9. Children&apos;s privacy</h2>
                    <p className="text-sm text-white/60">
                        GhostSweep is not intended for children under 16. We do not knowingly collect personal data from children.
                    </p>
                </section>

                {/* Changes */}
                <section className="space-y-3 rounded-lg border border-white/5 bg-white/2 p-6 backdrop-blur-sm">
                    <h2 className="text-xl font-light text-white">10. Changes to this policy</h2>
                    <p className="text-sm text-white/60">
                        We may update this policy to reflect changes to GhostSweep or the law. We will update the "Last updated" date and may notify you in-app or by email for material changes.
                    </p>
                </section>

                {/* Contact */}
                <section className="space-y-3 rounded-lg border border-white/5 bg-white/2 p-6 backdrop-blur-sm">
                    <div className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-white" />
                        <h2 className="text-xl font-light text-white">Questions about this policy?</h2>
                    </div>
                    <p className="text-sm text-white/60">Contact us at:</p>
                    <p className="text-sm text-white/60">
                        <Mail className="mr-1 inline h-3 w-3 text-white" />
                        <a href="mailto:support@ghostsweep.com" className="text-white underline hover:text-white/80 font-light">
                            support@ghostsweep.com
                        </a>
                    </p>
                    <p className="text-xs text-white/40">
                        Please avoid sending sensitive information (passwords, card numbers) by email.
                    </p>
                </section>

                {/* Back */}
                <div className="pb-10">
                    <Link href="/home" className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white transition font-light">
                        <ArrowRight className="h-4 w-4 rotate-180" />
                        Back to GhostSweep
                    </Link>
                </div>
            </div>
        </main>
    );
}
