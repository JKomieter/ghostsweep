/* eslint-disable react/no-unescaped-entities */
import Link from "next/link";
import { Metadata } from "next";
import {
    FileText,
    ShieldCheck,
    CreditCard,
    AlertTriangle,
    Gavel,
    UserX2,
    ArrowRight,
} from "lucide-react";

export const metadata: Metadata = {
    title: "Terms of Service | GhostSweep",
    description:
        "Read GhostSweep's Terms of Service. Understand the rules and guidelines for using our platform.",
    keywords: [
        "terms of service",
        "terms and conditions",
        "user agreement",
    ],
    openGraph: {
        title: "Terms of Service | GhostSweep",
        description:
            "GhostSweep Terms of Service — governing access and use of our service.",
        url: "https://ghostsweep.com/home/terms",
        type: "website",
    },
    alternates: {
        canonical: "https://ghostsweep.com/home/terms",
    },
};

const termsPageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": "https://ghostsweep.com/home/terms",
    name: "Terms of Service | GhostSweep",
    description:
        "GhostSweep Terms of Service governing access and use of the platform.",
    url: "https://ghostsweep.com/home/terms",
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
    icon,
    children,
}: {
    title: string;
    icon?: React.ReactNode;
    children: React.ReactNode;
}) {
    return (
        <section className="space-y-4">
            <h2 className="text-lg font-semibold tracking-tight text-foreground flex items-center gap-2">
                {icon}
                {title}
            </h2>
            {children}
        </section>
    );
}

export default function TermsPage() {
    return (
        <main className="min-h-screen bg-background">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(termsPageSchema),
                }}
            />

            <div className="mx-auto max-w-3xl px-6 pt-24 pb-20 sm:pt-32">
                {/* Header */}
                <header className="mb-16">
                    <p className="text-sm uppercase tracking-[0.2em] text-foreground/50 mb-4">
                        Terms of Service
                    </p>
                    <h1 className="text-3xl sm:text-5xl font-semibold tracking-tight text-foreground mb-6">
                        Terms of Service
                    </h1>
                    <p className="text-base text-foreground/65 leading-relaxed max-w-xl">
                        These Terms govern your access to and use of GhostSweep. By
                        creating an account or using the service, you agree to be bound
                        by these Terms.
                    </p>
                    <p className="text-xs text-foreground/50 mt-4">
                        Last updated: Dec 01, 2025
                    </p>
                </header>

                {/* Summary */}
                <div className="grid gap-4 sm:grid-cols-3 mb-16">
                    {[
                        {
                            icon: FileText,
                            title: "Overview",
                            text: "GhostSweep helps you understand which services have your data and highlights potential exposure risks.",
                        },
                        {
                            icon: ShieldCheck,
                            title: "No guarantees",
                            text: "We provide information and tools, but cannot guarantee all accounts or breaches are detected.",
                        },
                        {
                            icon: CreditCard,
                            title: "Subscriptions",
                            text: "Professional plans renew automatically unless cancelled. Billing handled securely via Stripe.",
                        },
                    ].map((card) => (
                        <div
                            key={card.title}
                            className="rounded-2xl border border-foreground/5 bg-foreground/2 p-6"
                        >
                            <card.icon className="h-5 w-5 text-foreground/65 mb-3" />
                            <p className="text-sm font-medium text-foreground mb-1">
                                {card.title}
                            </p>
                            <p className="text-xs text-foreground/65 leading-relaxed">
                                {card.text}
                            </p>
                        </div>
                    ))}
                </div>

                {/* Sections */}
                <div className="space-y-12 text-sm text-foreground/50 leading-relaxed">
                    <Section title="1. Agreement to Terms">
                        <p>
                            By accessing or using GhostSweep, you agree to be bound by
                            these Terms and our{" "}
                            <Link
                                href="/home/privacy"
                                className="text-foreground underline hover:text-foreground/80"
                            >
                                Privacy Policy
                            </Link>
                            . If you do not agree, you may not use the service.
                        </p>
                    </Section>

                    <Section title="2. Eligibility & Accounts">
                        <ul className="list-disc pl-5 space-y-1.5">
                            <li>You must be at least 16 years old.</li>
                            <li>
                                You are responsible for maintaining the confidentiality of
                                your account credentials and for all activity under your
                                account.
                            </li>
                            <li>
                                You agree to provide accurate information and notify us of
                                any unauthorized use.
                            </li>
                            <li>
                                We reserve the right to suspend or terminate accounts that
                                violate these Terms.
                            </li>
                        </ul>
                    </Section>

                    <Section title="3. Use of GhostSweep">
                        <p>GhostSweep is intended to help you:</p>
                        <ul className="list-disc pl-5 space-y-1.5">
                            <li>
                                Identify services and accounts associated with your email
                            </li>
                            <li>
                                Understand where your data is stored or used
                            </li>
                            <li>
                                View known breach information related to your email
                            </li>
                            <li>
                                Take informed steps to close accounts, secure logins, or
                                request data removal
                            </li>
                        </ul>
                        <p className="mt-3">
                            You are responsible for your own decisions about which
                            services to keep, secure, or close. GhostSweep provides
                            information and tools but does not act on your behalf to
                            delete accounts from third-party services.
                        </p>
                    </Section>

                    <Section title="4. Acceptable Use">
                        <p>You agree not to misuse GhostSweep, including:</p>
                        <ul className="list-disc pl-5 space-y-1.5">
                            <li>
                                Accessing or attempting to access another person's inbox
                            </li>
                            <li>
                                Using GhostSweep in violation of applicable law or
                                third-party terms
                            </li>
                            <li>
                                Attempting to reverse engineer or disrupt the service
                            </li>
                            <li>
                                Building a competing service that copies substantial parts
                                of GhostSweep
                            </li>
                            <li>
                                Uploading malicious code, automated scripts, or harmful
                                content
                            </li>
                        </ul>
                    </Section>

                    <Section title="5. Subscriptions & Billing">
                        <p>
                            GhostSweep may offer both free and paid plans.
                        </p>
                        <ul className="list-disc pl-5 space-y-1.5">
                            <li>
                                Paid subscriptions are billed in advance on a recurring
                                basis until cancelled.
                            </li>
                            <li>
                                Billing is handled by Stripe. Their terms may also apply.
                            </li>
                            <li>
                                Cancel anytime. Cancellation applies to future billing
                                periods.
                            </li>
                            <li>
                                We may change pricing with reasonable notice to existing
                                subscribers.
                            </li>
                        </ul>
                    </Section>

                    <Section title="6. Third-Party Services">
                        <p>GhostSweep integrates with third-party services:</p>
                        <ul className="list-disc pl-5 space-y-1.5">
                            <li>Google (Gmail and profile information via OAuth)</li>
                            <li>Payment processors for billing</li>
                            <li>Breach data providers or APIs</li>
                        </ul>
                        <p className="mt-3">
                            Those services are governed by their own terms and privacy
                            policies.
                        </p>
                    </Section>

                    <Section title="7. No Guarantees & Disclaimer">
                        <p>
                            GhostSweep is an informational and analysis tool. We strive
                            to be accurate, but:
                        </p>
                        <ul className="list-disc pl-5 space-y-1.5">
                            <li>
                                We cannot guarantee that all services or accounts will be
                                detected.
                            </li>
                            <li>
                                We cannot guarantee breach information is complete or
                                current.
                            </li>
                            <li>
                                We do not provide legal, security, or professional advice.
                            </li>
                        </ul>
                        <p className="mt-3">
                            GhostSweep is provided "as is" without warranties of any
                            kind, whether express or implied.
                        </p>
                    </Section>

                    <Section
                        title="8. Limitation of Liability"
                        icon={
                            <AlertTriangle className="h-4 w-4 text-foreground/65" />
                        }
                    >
                        <p>
                            To the fullest extent permitted by law, GhostSweep shall not
                            be liable for any:
                        </p>
                        <ul className="list-disc pl-5 space-y-1.5">
                            <li>
                                Indirect, incidental, special, consequential, or punitive
                                damages
                            </li>
                            <li>
                                Loss of profits, revenue, data, or goodwill arising from
                                use of the service
                            </li>
                        </ul>
                        <p className="mt-3">
                            Our total aggregate liability shall not exceed the amount you
                            paid for GhostSweep in the 3 months before the event.
                        </p>
                    </Section>

                    <Section
                        title="9. Suspension & Termination"
                        icon={<UserX2 className="h-4 w-4 text-foreground/65" />}
                    >
                        <p>
                            We may suspend or terminate your access if we believe you
                            have violated these Terms, your use poses a risk, or we are
                            required to by law.
                        </p>
                        <p className="mt-3">
                            You may stop using GhostSweep at any time and request account
                            deletion as described in our Privacy Policy.
                        </p>
                    </Section>

                    <Section
                        title="10. Governing Law"
                        icon={<Gavel className="h-4 w-4 text-foreground/65" />}
                    >
                        <p>
                            These Terms will be governed by and construed in accordance
                            with the laws of the jurisdiction in which GhostSweep is
                            operated, without regard to conflict of law principles.
                        </p>
                    </Section>

                    <Section title="11. Changes to These Terms">
                        <p>
                            We may update these Terms from time to time. When we make
                            material changes, we will update the "Last updated" date and
                            may provide additional notice within the app or by email.
                        </p>
                    </Section>

                    <Section
                        title="12. Contact"
                        icon={
                            <ShieldCheck className="h-4 w-4 text-foreground/65" />
                        }
                    >
                        <p>
                            Questions? Contact us at{" "}
                            <a
                                href="mailto:support@ghostsweep.com"
                                className="text-foreground underline hover:text-foreground/80"
                            >
                                support@ghostsweep.com
                            </a>
                        </p>
                        <p className="text-xs text-foreground/50 mt-2">
                            Please do not send sensitive information (passwords, card
                            numbers) via email.
                        </p>
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
