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
    title: "Privacy Policy | GhostSweep",
    description:
        "Read GhostSweep's privacy policy. Learn what data we collect, how we protect it, and how you maintain complete control.",
    keywords: [
        "privacy policy",
        "data protection",
        "GDPR",
        "CCPA",
        "data collection",
        "privacy rights",
    ],
    openGraph: {
        title: "Privacy Policy | GhostSweep",
        description:
            "Understand GhostSweep's privacy practices and how your data is protected.",
        url: "https://ghostsweep.com/home/privacy",
        type: "website",
    },
    alternates: {
        canonical: "https://ghostsweep.com/home/privacy",
    },
};

const privacyPageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": "https://ghostsweep.com/home/privacy",
    name: "Privacy Policy | GhostSweep",
    description:
        "GhostSweep's privacy policy explaining data collection, protection, and user control.",
    url: "https://ghostsweep.com/home/privacy",
    publisher: {
        "@type": "Organization",
        name: "GhostSweep",
        logo: {
            "@type": "ImageObject",
            url: "https://znlaksqttxokoeavwqjf.supabase.co/storage/v1/object/public/news/ghost-svgrepo-com.png",
        },
    },
};

function Section({
    title,
    children,
}: {
    title: string;
    children: React.ReactNode;
}) {
    return (
        <section className="space-y-4">
            <h2 className="text-lg font-semibold tracking-tight text-foreground">
                {title}
            </h2>
            {children}
        </section>
    );
}

export default function PrivacyPolicyPage() {
    return (
        <main className="min-h-screen bg-background">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(privacyPageSchema),
                }}
            />

            <div className="mx-auto max-w-3xl px-6 pt-24 pb-20 sm:pt-32">
                {/* Header */}
                <header className="mb-16">
                    <p className="text-sm uppercase tracking-[0.2em] text-foreground/50 mb-4">
                        Privacy Policy
                    </p>
                    <h1 className="text-3xl sm:text-5xl font-semibold tracking-tight text-foreground mb-6">
                        Your data. Your control.
                    </h1>
                    <p className="text-base text-foreground/65 leading-relaxed max-w-xl">
                        GhostSweep is built with privacy-first principles. This policy
                        explains what we collect, how we protect it, and how you stay in
                        control.
                    </p>
                    <p className="text-xs text-foreground/50 mt-4">
                        Last updated: Dec 13, 2025
                    </p>
                </header>

                {/* Summary cards */}
                <div className="grid gap-4 sm:grid-cols-3 mb-16">
                    <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-6">
                        <ShieldCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400 mb-3" />
                        <p className="text-sm font-medium text-foreground mb-1">
                            Zero-storage scanning
                        </p>
                        <p className="text-xs text-foreground/65 leading-relaxed">
                            Email bodies are scanned transiently to find value. Never
                            stored.
                        </p>
                    </div>
                    <div className="rounded-2xl border border-foreground/10 bg-foreground/3 p-6">
                        <Lock className="h-5 w-5 text-foreground/60 mb-3" />
                        <p className="text-sm font-medium text-foreground mb-1">
                            You control actions
                        </p>
                        <p className="text-xs text-foreground/65 leading-relaxed">
                            Nothing happens without your explicit approval. Deletion
                            emails only send when you trigger them.
                        </p>
                    </div>
                    <div className="rounded-2xl border border-foreground/10 bg-foreground/3 p-6">
                        <Globe2 className="h-5 w-5 text-foreground/60 mb-3" />
                        <p className="text-sm font-medium text-foreground mb-1">
                            No data selling
                        </p>
                        <p className="text-xs text-foreground/65 leading-relaxed">
                            We never sell your data. Third parties used only for hosting,
                            billing, and error monitoring.
                        </p>
                    </div>
                </div>

                {/* Policy sections */}
                <div className="space-y-12 text-sm text-foreground/50 leading-relaxed">
                    <Section title="1. Who we are">
                        <p>GhostSweep is a web application that helps you:</p>
                        <ul className="list-disc pl-5 space-y-1.5">
                            <li>
                                Find services linked to your email address via transient
                                inbox analysis.
                            </li>
                            <li>
                                Identify potential breach exposure using breach sources you
                                choose to query.
                            </li>
                            <li>
                                Generate and track account deletion requests across
                                services.
                            </li>
                        </ul>
                        <p>
                            Questions? Contact{" "}
                            <a
                                href="mailto:support@ghostsweep.com"
                                className="text-foreground underline hover:text-foreground/80"
                            >
                                support@ghostsweep.com
                            </a>
                        </p>
                    </Section>

                    <Section title="2. Information we collect">
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-xs font-medium uppercase tracking-widest text-foreground/55 mb-2">
                                    2.1 Account information
                                </h3>
                                <p>
                                    When you create an account, we collect your email
                                    address and authentication details through Supabase
                                    Auth.
                                </p>
                            </div>

                            <div>
                                <h3 className="text-xs font-medium uppercase tracking-widest text-foreground/55 mb-2">
                                    2.2 Email connection (Google & Microsoft OAuth)
                                </h3>
                                <p className="mb-4">
                                    When you connect Gmail or Outlook, we use official
                                    OAuth flows to access the data needed for GhostSweep
                                    features.
                                </p>
                                <div className="grid gap-3 sm:grid-cols-2">
                                    <div className="rounded-xl border border-foreground/5 bg-foreground/2 p-4">
                                        <Mail className="h-4 w-4 text-foreground/65 mb-2" />
                                        <p className="text-xs font-medium text-foreground mb-1">
                                            Inbox scanning
                                        </p>
                                        <p className="text-xs text-foreground/65">
                                            Scans transiently to identify gift cards,
                                            subscriptions, and receipts. Full email bodies
                                            are never stored.
                                        </p>
                                    </div>
                                    <div className="rounded-xl border border-foreground/5 bg-foreground/2 p-4">
                                        <Send className="h-4 w-4 text-foreground/65 mb-2" />
                                        <p className="text-xs font-medium text-foreground mb-1">
                                            Sending deletions
                                        </p>
                                        <p className="text-xs text-foreground/65">
                                            Deletion emails are sent only when you
                                            explicitly trigger them. We only send when you
                                            approve.
                                        </p>
                                    </div>
                                </div>
                                <p className="mt-3">
                                    You can disconnect your email account at any time to
                                    revoke access.
                                </p>
                            </div>

                            <div>
                                <h3 className="text-xs font-medium uppercase tracking-widest text-foreground/55 mb-2">
                                    2.3 Sweep summaries and service data
                                </h3>
                                <p className="mb-2">We store:</p>
                                <ul className="list-disc pl-5 space-y-1">
                                    <li>
                                        Detected services/domains from your inbox signals.
                                    </li>
                                    <li>
                                        Activity indicators (first seen, last seen, message
                                        counts).
                                    </li>
                                    <li>
                                        Risk indicators (breached flags and breach
                                        metadata).
                                    </li>
                                    <li>Sweep history (status, progress, timestamps).</li>
                                </ul>
                            </div>

                            <div>
                                <h3 className="text-xs font-medium uppercase tracking-widest text-foreground/55 mb-2">
                                    2.4 Deletion requests and tracking
                                </h3>
                                <p className="mb-2">
                                    We store deletion workflow records:
                                </p>
                                <ul className="list-disc pl-5 space-y-1">
                                    <li>Services you selected for deletion.</li>
                                    <li>Deletion method and destination address/link.</li>
                                    <li>
                                        Status tracking (queued, sent, waiting, follow-up,
                                        completed, failed).
                                    </li>
                                    <li>Timestamps and limited error logs.</li>
                                </ul>
                                <p className="mt-2">
                                    GhostSweep helps you send requests and track
                                    progress — it doesn't automatically delete accounts.
                                </p>
                            </div>

                            <div>
                                <h3 className="text-xs font-medium uppercase tracking-widest text-foreground/55 mb-2">
                                    2.5 Payment information
                                </h3>
                                <p>
                                    Payments are processed by Stripe. GhostSweep does not
                                    store full card details. We store subscription status,
                                    plan, and billing metadata.
                                </p>
                            </div>

                            <div>
                                <h3 className="text-xs font-medium uppercase tracking-widest text-foreground/55 mb-2">
                                    2.6 Usage and diagnostic data
                                </h3>
                                <p>
                                    We may collect basic technical information (pages
                                    visited, device type, performance metrics) to operate
                                    and improve GhostSweep. We do not use this data for
                                    ads.
                                </p>
                            </div>
                        </div>
                    </Section>

                    <Section title="3. How we use your information">
                        <p>We use your data to:</p>
                        <ul className="list-disc pl-5 space-y-1.5">
                            <li>Run inbox sweeps and display service/breach results.</li>
                            <li>Show account risk indicators and priority signals.</li>
                            <li>Power deletion workflows you initiate.</li>
                            <li>Send service-related emails when relevant.</li>
                            <li>Provide support and respond to issues.</li>
                            <li>Handle billing and subscriptions.</li>
                            <li>
                                Improve accuracy, reliability, security, and user
                                experience.
                            </li>
                        </ul>
                    </Section>

                    <Section title="4. Use of Google and Microsoft user data">
                        <p>
                            GhostSweep's use of information from Google and Microsoft
                            APIs adheres to their respective user data policies:{" "}
                            <a
                                href="https://developers.google.com/terms/api-services-user-data-policy"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-foreground underline hover:text-foreground/80"
                            >
                                Google API Services User Data Policy
                            </a>{" "}
                            and{" "}
                            <a
                                href="https://learn.microsoft.com/en-us/legal/content-sharing-privacy"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-foreground underline hover:text-foreground/80"
                            >
                                Microsoft Privacy Policy
                            </a>
                            .
                        </p>
                        <ul className="list-disc pl-5 space-y-1.5">
                            <li>
                                We use email data to provide features you request.
                            </li>
                            <li>
                                We don't use email data for ads or marketing profiling.
                            </li>
                            <li>
                                We don't sell email data. We only share with service
                                providers as needed.
                            </li>
                            <li>
                                Access is restricted to automated systems and not available
                                for human review except for security/debugging.
                            </li>
                        </ul>

                        <div className="rounded-xl border border-foreground/5 bg-foreground/2 p-4 mt-4">
                            <div className="flex items-center gap-2 mb-2">
                                <Trash2 className="h-4 w-4 text-foreground/65" />
                                <p className="text-sm font-medium text-foreground">
                                    You can revoke access anytime
                                </p>
                            </div>
                            <p className="text-xs text-foreground/65">
                                Disconnect your email to revoke tokens. You can also
                                delete sweep and deletion-tracking data anytime.
                            </p>
                        </div>
                    </Section>

                    <Section title="5. Data retention and deletion">
                        <p>
                            We retain your data while your account is active, unless you
                            request deletion.
                        </p>
                        <ul className="list-disc pl-5 space-y-1.5">
                            <li>Delete sweep data from within the app anytime.</li>
                            <li>
                                Delete deletion tracking records from within the app
                                anytime.
                            </li>
                            <li>Disconnect your email to revoke access.</li>
                            <li>
                                Request full account deletion (removes profile,
                                subscriptions, and history).
                            </li>
                        </ul>
                    </Section>

                    <Section title="6. Sharing your information">
                        <p>
                            We do not sell your data. We may share limited information
                            with:
                        </p>
                        <ul className="list-disc pl-5 space-y-1.5">
                            <li>
                                Infrastructure providers (database, hosting, serverless).
                            </li>
                            <li>Payment processors (Stripe) for billing.</li>
                            <li>
                                Analytics/logging tools for performance monitoring.
                            </li>
                            <li>
                                Authorities if required by law or valid legal process.
                            </li>
                        </ul>
                    </Section>

                    <Section title="7. Your rights and choices">
                        <p>
                            Depending on your location, you may have rights such as
                            access, correction, deletion, limitation, or portability.
                        </p>
                        <p>
                            To exercise these rights, contact{" "}
                            <a
                                href="mailto:support@ghostsweep.com"
                                className="text-foreground underline hover:text-foreground/80"
                            >
                                support@ghostsweep.com
                            </a>
                        </p>

                        <div className="grid gap-3 sm:grid-cols-2 mt-4">
                            <div className="rounded-xl border border-foreground/5 bg-foreground/2 p-4">
                                <RefreshCw className="h-4 w-4 text-foreground/65 mb-2" />
                                <p className="text-xs font-medium text-foreground mb-1">
                                    Manage automations
                                </p>
                                <p className="text-xs text-foreground/65">
                                    Disable follow-up reminders for deletion requests
                                    anytime.
                                </p>
                            </div>
                            <div className="rounded-xl border border-foreground/5 bg-foreground/2 p-4">
                                <Lock className="h-4 w-4 text-foreground/65 mb-2" />
                                <p className="text-xs font-medium text-foreground mb-1">
                                    Security choices
                                </p>
                                <p className="text-xs text-foreground/65">
                                    Revoke Gmail access, change password, and delete
                                    stored data.
                                </p>
                            </div>
                        </div>
                    </Section>

                    <Section title="8. Security">
                        <p>
                            We use reasonable measures to protect data, including
                            encryption in transit, restricted access, and scoped database
                            policies. No method is 100% secure.
                        </p>
                        <p>
                            If you believe your account has been compromised, disconnect
                            Gmail, change your password, and contact us.
                        </p>
                    </Section>

                    <Section title="9. Children's privacy">
                        <p>
                            GhostSweep is not intended for children under 16. We do not
                            knowingly collect personal data from children.
                        </p>
                    </Section>

                    <Section title="10. Changes to this policy">
                        <p>
                            We may update this policy to reflect changes. We will update
                            the "Last updated" date and may notify you in-app or by email
                            for material changes.
                        </p>
                    </Section>

                    <Section title="Questions?">
                        <div className="rounded-xl border border-foreground/5 bg-foreground/2 p-5">
                            <div className="flex items-center gap-2 mb-3">
                                <AlertCircle className="h-4 w-4 text-foreground/65" />
                                <p className="text-sm font-medium text-foreground">
                                    Contact us
                                </p>
                            </div>
                            <p>
                                <Mail className="mr-1.5 inline h-3 w-3 text-foreground/65" />
                                <a
                                    href="mailto:support@ghostsweep.com"
                                    className="text-foreground underline hover:text-foreground/80"
                                >
                                    support@ghostsweep.com
                                </a>
                            </p>
                            <p className="text-xs text-foreground/50 mt-2">
                                Please avoid sending sensitive information (passwords,
                                card numbers) by email.
                            </p>
                        </div>
                    </Section>
                </div>

                {/* Back */}
                <div className="mt-16 pt-8 border-t border-foreground/5">
                    <Link
                        href="/home"
                        className="inline-flex items-center gap-2 text-sm text-foreground/55 hover:text-foreground transition"
                    >
                        <ArrowRight className="h-3.5 w-3.5 rotate-180" />
                        Back to GhostSweep
                    </Link>
                </div>
            </div>
        </main>
    );
}
