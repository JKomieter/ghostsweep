// app/terms/page.tsx
import Link from "next/link"
import {
    FileText,
    ShieldCheck,
    CreditCard,
    AlertTriangle,
    Gavel,
    UserX2,
} from "lucide-react"

export default function TermsPage() {
    return (
        <main className="min-h-screen bg-background text-foreground">
            <div className="mx-auto max-w-4xl px-4 py-10 space-y-10">
                {/* Header */}
                <header className="space-y-3">
                    <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                        Terms of Service
                    </p>
                    <h1 className="text-2xl font-semibold tracking-tight">
                        GhostSweep Terms of Service
                    </h1>
                    <p className="max-w-2xl text-sm text-muted-foreground">
                        These Terms of Service (&quot;Terms&quot;) govern your access to and use of
                        GhostSweep. By creating an account or using the service, you agree to be
                        bound by these Terms.
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                        Last updated: ec 01, 2025
                    </p>
                </header>

                {/* Summary tiles */}
                <section className="grid gap-4 md:grid-cols-3 text-sm">
                    <div className="rounded-xl border border-white/10 bg-[#050505] p-4">
                        <div className="mb-2 flex items-center gap-2 text-xs font-medium text-muted-foreground">
                            <FileText className="h-3.5 w-3.5 text-primary" />
                            Overview
                        </div>
                        <p className="text-xs text-muted-foreground/90">
                            GhostSweep helps you understand which services have your data and
                            highlights potential exposure risks.
                        </p>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-[#050505] p-4">
                        <div className="mb-2 flex items-center gap-2 text-xs font-medium text-muted-foreground">
                            <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                            No guarantees
                        </div>
                        <p className="text-xs text-muted-foreground/90">
                            GhostSweep provides information and tools, but cannot guarantee that all
                            accounts or breaches are detected.
                        </p>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-[#050505] p-4">
                        <div className="mb-2 flex items-center gap-2 text-xs font-medium text-muted-foreground">
                            <CreditCard className="h-3.5 w-3.5 text-primary" />
                            Subscriptions
                        </div>
                        <p className="text-xs text-muted-foreground/90">
                            Professional plans renew automatically unless cancelled. Billing is handled
                            securely via our payment provider.
                        </p>
                    </div>
                </section>

                {/* 1. Agreement */}
                <section className="space-y-3 rounded-xl border border-white/10 bg-[#050505] p-5 text-sm">
                    <h2 className="text-base font-semibold tracking-tight">
                        1. Agreement to Terms
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        By accessing or using GhostSweep, you agree to be bound by these Terms
                        and our{" "}
                        <Link href="/home/privacy" className="text-primary underline">
                            Privacy Policy
                        </Link>
                        . If you do not agree, you may not use the service.
                    </p>
                </section>

                {/* 2. Eligibility & accounts */}
                <section className="space-y-3 rounded-xl border border-white/10 bg-[#050505] p-5 text-sm">
                    <h2 className="text-base font-semibold tracking-tight">
                        2. Eligibility & Accounts
                    </h2>
                    <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                        <li>You must be at least 16 years old to use GhostSweep.</li>
                        <li>
                            You are responsible for maintaining the confidentiality of your account
                            credentials and for all activity under your account.
                        </li>
                        <li>
                            You agree to provide accurate information and to notify us of any
                            unauthorized use of your account.
                        </li>
                        <li>
                            We reserve the right to suspend or terminate accounts that violate these
                            Terms or are used in a way that risks the security or stability of the
                            service.
                        </li>
                    </ul>
                </section>

                {/* 3. Use of the service */}
                <section className="space-y-3 rounded-xl border border-white/10 bg-[#050505] p-5 text-sm">
                    <h2 className="text-base font-semibold tracking-tight">
                        3. Use of GhostSweep
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        GhostSweep is intended to help you:
                    </p>
                    <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                        <li>Identify services and accounts associated with your email address</li>
                        <li>Understand where your data is stored or used</li>
                        <li>View known breach information related to your email address</li>
                        <li>
                            Take informed steps to close accounts, secure logins, or request data
                            removal directly with those services
                        </li>
                    </ul>
                    <p className="mt-2 text-sm text-muted-foreground">
                        You are responsible for your own decisions about which services to keep,
                        secure, or close. GhostSweep provides information and tools, but does not
                        act on your behalf to delete accounts or remove data from third-party
                        services.
                    </p>
                </section>

                {/* 4. Acceptable use */}
                <section className="space-y-3 rounded-xl border border-white/10 bg-[#050505] p-5 text-sm">
                    <h2 className="text-base font-semibold tracking-tight">
                        4. Acceptable Use
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        You agree not to misuse GhostSweep, including (but not limited to):
                    </p>
                    <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                        <li>Accessing or attempting to access another person&apos;s inbox</li>
                        <li>
                            Using GhostSweep in violation of any applicable law, regulation, or
                            third-party terms
                        </li>
                        <li>
                            Attempting to reverse engineer, probe, or disrupt the service or its
                            infrastructure
                        </li>
                        <li>
                            Using GhostSweep to build a competing service that copies substantial
                            parts of its functionality or design
                        </li>
                        <li>
                            Uploading or transmitting malicious code, automated scripts, or harmful
                            content
                        </li>
                    </ul>
                </section>

                {/* 5. Subscriptions & billing */}
                <section className="space-y-3 rounded-xl border border-white/10 bg-[#050505] p-5 text-sm">
                    <h2 className="text-base font-semibold tracking-tight">
                        5. Subscriptions & Billing
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        GhostSweep may offer both free and paid plans. Additional features or
                        higher limits may require a paid subscription.
                    </p>
                    <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                        <li>
                            Paid subscriptions are billed in advance on a recurring basis (for
                            example, monthly or annually) until cancelled.
                        </li>
                        <li>
                            Billing and payment processing are handled by our third-party provider
                            (Stripe). Their terms may also apply to your use of the
                            payment features.
                        </li>
                        <li>
                            You can cancel your subscription at any time. Cancellation will
                            typically apply to future billing periods and does not automatically
                            issue refunds for past periods, unless required by law or our refund
                            policy.
                        </li>
                        <li>
                            We may change pricing or plan features in the future. If we make
                            material changes to pricing for existing subscribers, we will provide
                            notice where reasonable.
                        </li>
                    </ul>
                </section>

                {/* 6. Third-party services */}
                <section className="space-y-3 rounded-xl border border-white/10 bg-[#050505] p-5 text-sm">
                    <h2 className="text-base font-semibold tracking-tight">
                        6. Third-Party Services
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        GhostSweep integrates with third-party services, such as:
                    </p>
                    <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                        <li>Google (Gmail and basic profile information via OAuth)</li>
                        <li>Payment processors for billing and subscriptions</li>
                        <li>
                            Breach data providers or APIs that help identify known data breaches
                        </li>
                    </ul>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Those services are governed by their own terms and privacy policies. We do
                        not control and are not responsible for their content, security, or
                        practices.
                    </p>
                </section>

                {/* 7. No guarantees / informational only */}
                <section className="space-y-3 rounded-xl border border-white/10 bg-[#050505] p-5 text-sm">
                    <h2 className="text-base font-semibold tracking-tight">
                        7. No Guarantees & Disclaimer
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        GhostSweep is an informational and analysis tool. We strive to be
                        accurate and helpful, but:
                    </p>
                    <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                        <li>We cannot guarantee that all services or accounts will be detected.</li>
                        <li>
                            We cannot guarantee that breach information is complete, current, or
                            error-free.
                        </li>
                        <li>
                            We do not provide legal, security, or professional advice. Any actions
                            you take based on GhostSweep&apos;s results are your responsibility.
                        </li>
                    </ul>
                    <p className="mt-2 text-sm text-muted-foreground">
                        To the fullest extent permitted by law, GhostSweep is provided
                        &quot;as is&quot; without warranties of any kind, whether express or
                        implied, including but not limited to implied warranties of
                        merchantability, fitness for a particular purpose, and non-infringement.
                    </p>
                </section>

                {/* 8. Limitation of liability */}
                <section className="space-y-3 rounded-xl border border-white/10 bg-[#050505] p-5 text-sm">
                    <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-primary" />
                        <h2 className="text-base font-semibold tracking-tight">
                            8. Limitation of Liability
                        </h2>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        To the fullest extent permitted by law, GhostSweep and its operators shall
                        not be liable for any:
                    </p>
                    <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                        <li>
                            Indirect, incidental, special, consequential, or punitive damages, or
                        </li>
                        <li>
                            Loss of profits, revenue, data, or goodwill arising out of or related to
                            your use of the service,
                        </li>
                    </ul>
                    <p className="mt-2 text-sm text-muted-foreground">
                        even if we have been advised of the possibility of such damages. Our total
                        aggregate liability for any claim relating to the service will not exceed
                        the amount you paid (if any) for GhostSweep in the 3 months before the
                        event giving rise to the claim.
                    </p>
                </section>

                {/* 9. Termination */}
                <section className="space-y-3 rounded-xl border border-white/10 bg-[#050505] p-5 text-sm">
                    <div className="flex items-center gap-2">
                        <UserX2 className="h-4 w-4 text-primary" />
                        <h2 className="text-base font-semibold tracking-tight">
                            9. Suspension & Termination
                        </h2>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        We may suspend or terminate your access to GhostSweep, with or without
                        notice, if we believe:
                    </p>
                    <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                        <li>You have violated these Terms or applicable law,</li>
                        <li>Your use poses a security or misuse risk, or</li>
                        <li>We are required to do so by a third party or legal authority.</li>
                    </ul>
                    <p className="mt-2 text-sm text-muted-foreground">
                        You may also stop using GhostSweep at any time and may request account
                        deletion and data removal as described in our Privacy Policy.
                    </p>
                </section>

                {/* 10. Governing law */}
                <section className="space-y-3 rounded-xl border border-white/10 bg-[#050505] p-5 text-sm">
                    <div className="flex items-center gap-2">
                        <Gavel className="h-4 w-4 text-primary" />
                        <h2 className="text-base font-semibold tracking-tight">
                            10. Governing Law
                        </h2>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        These Terms will be governed by and construed in accordance with the laws
                        of the jurisdiction in which GhostSweep is operated or registered, without
                        regard to its conflict of law principles.
                    </p>
                </section>

                {/* 11. Changes */}
                <section className="space-y-3 rounded-xl border border-white/10 bg-[#050505] p-5 text-sm">
                    <h2 className="text-base font-semibold tracking-tight">
                        11. Changes to These Terms
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        We may update these Terms from time to time. When we make material
                        changes, we will update the &quot;Last updated&quot; date at the top of
                        this page and may provide additional notice within the app or by email.
                    </p>
                    <p className="text-sm text-muted-foreground">
                        Your continued use of GhostSweep after changes take effect constitutes
                        acceptance of the updated Terms.
                    </p>
                </section>

                {/* 12. Contact */}
                <section className="space-y-3 rounded-xl border border-white/10 bg-[#050505] p-5 text-sm">
                    <div className="flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4 text-primary" />
                        <h2 className="text-base font-semibold tracking-tight">
                            12. Contact
                        </h2>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        If you have questions about these Terms, you can contact us at:
                    </p>
                    <p className="text-sm text-muted-foreground">
                        <a
                            href="mailto:support@ghostsweep.com"
                            className="text-primary underline"
                        >
                            support@ghostsweep.com
                        </a>
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                        Please do not send sensitive information (such as passwords or full card
                        numbers) via email.
                    </p>
                </section>

                {/* Back link */}
                <div className="pb-10 text-xs text-muted-foreground">
                    <Link
                        href="/"
                        className="text-primary underline hover:opacity-90 transition"
                    >
                        Back to GhostSweep
                    </Link>
                </div>
            </div>
        </main>
    )
}