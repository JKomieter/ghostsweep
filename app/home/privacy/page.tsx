// app/privacy/page.tsx
import Link from "next/link";
import {
    ShieldCheck,
    Mail,
    Globe2,
    Lock,
    AlertCircle,
    Send,
    Trash2,
    RefreshCw,
} from "lucide-react";

export default function PrivacyPolicyPage() {
    return (
        <main className="min-h-screen bg-background text-foreground">
            <div className="mx-auto max-w-4xl px-4 py-10 space-y-10">
                {/* Header */}
                <header className="space-y-3">
                    <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                        Privacy Policy
                    </p>
                    <h1 className="text-2xl font-semibold tracking-tight">
                        GhostSweep Privacy Policy
                    </h1>
                    <p className="max-w-2xl text-sm text-muted-foreground">
                        This Privacy Policy explains how GhostSweep collects, uses, and protects your
                        information when you use our services. GhostSweep is designed to help you reduce your
                        digital footprint and track deletion requests — while minimizing what we store.
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                        Last updated: Dec 13, 2025
                    </p>
                </header>

                {/* Summary */}
                <section className="grid gap-4 md:grid-cols-3 text-sm">
                    <div className="rounded-xl border border-white/10 bg-[#050505] p-4">
                        <div className="mb-2 flex items-center gap-2 text-xs font-medium text-muted-foreground">
                            <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                            Metadata-first
                        </div>
                        <p className="text-xs text-muted-foreground/90">
                            Sweeps analyze email metadata (e.g., sender, subject, date) to detect services. We do
                            not read or store full email bodies as part of sweeps.
                        </p>
                    </div>

                    <div className="rounded-xl border border-white/10 bg-[#050505] p-4">
                        <div className="mb-2 flex items-center gap-2 text-xs font-medium text-muted-foreground">
                            <Lock className="h-3.5 w-3.5 text-primary" />
                            You control actions
                        </div>
                        <p className="text-xs text-muted-foreground/90">
                            Deletion emails are only sent when you explicitly trigger them (e.g., “Start Deletion”
                            or follow-ups you enable).
                        </p>
                    </div>

                    <div className="rounded-xl border border-white/10 bg-[#050505] p-4">
                        <div className="mb-2 flex items-center gap-2 text-xs font-medium text-muted-foreground">
                            <Globe2 className="h-3.5 w-3.5 text-primary" />
                            No selling data
                        </div>
                        <p className="text-xs text-muted-foreground/90">
                            We do not sell your personal data. Limited third-party services are used only to
                            operate GhostSweep (hosting, billing, error monitoring).
                        </p>
                    </div>
                </section>

                {/* Who we are */}
                <section className="space-y-3 rounded-xl border border-white/10 bg-[#050505] p-5 text-sm">
                    <h2 className="text-base font-semibold tracking-tight">1. Who we are</h2>
                    <p className="text-sm text-muted-foreground">
                        GhostSweep is a web application that helps you:
                    </p>
                    <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                        <li>Find services linked to your email address (via inbox metadata signals).</li>
                        <li>Identify potential breach exposure using breach sources you choose to query.</li>
                        <li>Generate and track account deletion requests across services.</li>
                    </ul>
                    <p className="text-sm text-muted-foreground">
                        If you have questions about this policy, contact{" "}
                        <a href="mailto:support@ghostsweep.com" className="text-primary underline">
                            support@ghostsweep.com
                        </a>
                        .
                    </p>
                </section>

                {/* Information we collect */}
                <section className="space-y-3 rounded-xl border border-white/10 bg-[#050505] p-5 text-sm">
                    <h2 className="text-base font-semibold tracking-tight">2. Information we collect</h2>

                    <div className="space-y-2">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-[0.12em]">
                            2.1 Account information
                        </p>
                        <p className="text-sm text-muted-foreground">
                            When you create an account, we collect your email address and authentication details
                            through our authentication provider (Supabase Auth). We may store basic profile
                            information if you choose to provide it.
                        </p>
                    </div>

                    <div className="space-y-2">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-[0.12em]">
                            2.2 Gmail connection (Google OAuth)
                        </p>
                        <p className="text-sm text-muted-foreground">
                            When you connect Gmail, we use Google OAuth scopes to access the data needed to
                            provide GhostSweep features.
                        </p>

                        <div className="mt-2 grid gap-3 md:grid-cols-2">
                            <div className="rounded-lg border border-white/10 bg-black/40 p-3">
                                <div className="mb-2 flex items-center gap-2 text-xs font-medium text-white/80">
                                    <Mail className="h-4 w-4 text-primary" />
                                    Inbox scanning (sweeps)
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Sweeps access email metadata (sender, subject, timestamps, labels/headers as
                                    needed) to detect services and security signals. We do not read or store full
                                    email bodies as part of sweep processing.
                                </p>
                            </div>

                            <div className="rounded-lg border border-white/10 bg-black/40 p-3">
                                <div className="mb-2 flex items-center gap-2 text-xs font-medium text-white/80">
                                    <Send className="h-4 w-4 text-primary" />
                                    Sending deletion requests (optional)
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    If you use deletion features that send emails, GhostSweep may request Gmail “send”
                                    permissions so we can send deletion request emails on your behalf. We only send
                                    emails when you explicitly trigger them (e.g., “Start Deletion”, “Send follow-up”,
                                    or a follow-up automation you enable).
                                </p>
                            </div>
                        </div>

                        <p className="mt-2 text-sm text-muted-foreground">
                            You can disconnect Gmail at any time to revoke access.
                        </p>
                    </div>

                    <div className="space-y-2">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-[0.12em]">
                            2.3 Sweep summaries and service data
                        </p>
                        <p className="text-sm text-muted-foreground">
                            To show results, we store:
                        </p>
                        <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                            <li>Detected services/domains associated with your inbox signals.</li>
                            <li>Activity indicators (e.g., first seen, last seen) and message counts.</li>
                            <li>Risk indicators (e.g., “breached” flags and related breach metadata when available).</li>
                            <li>Sweep history (e.g., status, progress, timestamps).</li>
                        </ul>
                    </div>

                    <div className="space-y-2">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-[0.12em]">
                            2.4 Deletion requests and tracking
                        </p>
                        <p className="text-sm text-muted-foreground">
                            If you use “Bulk Delete” or deletion tracking, we store deletion workflow records such as:
                        </p>
                        <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                            <li>Which services you selected for deletion.</li>
                            <li>Deletion method (open link vs email) and destination address/link (when available).</li>
                            <li>Status tracking (e.g., queued, sent, waiting, follow-up sent, completed, failed).</li>
                            <li>Timestamps (sent at, follow-up at, completed at) and limited error logs.</li>
                        </ul>
                        <p className="text-sm text-muted-foreground">
                            GhostSweep does not automatically delete accounts. It helps you send requests and track progress.
                        </p>
                    </div>

                    <div className="space-y-2">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-[0.12em]">
                            2.5 AI-generated suggestions (optional)
                        </p>
                        <p className="text-sm text-muted-foreground">
                            GhostSweep may offer AI-assisted suggestions (for example, “recommended next steps” or
                            “suggested deletion method”) for a service. When enabled, we send only the minimum
                            necessary inputs (such as domain, subjects/snippets we already store, or aggregated signals)
                            to generate suggestions. We do not send full email bodies for these suggestions.
                        </p>
                    </div>

                    <div className="space-y-2">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-[0.12em]">
                            2.6 Payment information
                        </p>
                        <p className="text-sm text-muted-foreground">
                            When you purchase a Professional subscription, payments are processed by Stripe.
                            GhostSweep does not store your full card details. We store subscription status, plan,
                            and billing metadata (e.g., Stripe customer ID, renewals).
                        </p>
                    </div>

                    <div className="space-y-2">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-[0.12em]">
                            2.7 Usage and diagnostic data
                        </p>
                        <p className="text-sm text-muted-foreground">
                            We may collect basic technical and diagnostic information (e.g., pages visited, device/browser
                            type, approximate region, performance metrics, and error logs) to operate and improve GhostSweep.
                            We do not sell this data or use it to build advertising profiles.
                        </p>
                    </div>
                </section>

                {/* How we use your information */}
                <section className="space-y-3 rounded-xl border border-white/10 bg-[#050505] p-5 text-sm">
                    <h2 className="text-base font-semibold tracking-tight">3. How we use your information</h2>
                    <p className="text-sm text-muted-foreground">
                        We use the information we collect to:
                    </p>
                    <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                        <li>Run inbox sweeps you request and display service/breach results.</li>
                        <li>Show account risk indicators and priority signals (e.g., “breached”, “high priority”).</li>
                        <li>
                            Power deletion workflows you initiate (open deletion pages, send deletion emails, and track requests).
                        </li>
                        <li>Send service-related emails (e.g., sweep completed, deletion request sent) when relevant.</li>
                        <li>Provide support and respond to issues you report.</li>
                        <li>Handle billing and subscriptions.</li>
                        <li>Improve accuracy, reliability, security, and user experience.</li>
                    </ul>
                </section>

                {/* Google user data */}
                <section className="space-y-3 rounded-xl border border-white/10 bg-[#050505] p-5 text-sm">
                    <h2 className="text-base font-semibold tracking-tight">4. Use of Google user data</h2>
                    <p className="text-sm text-muted-foreground">
                        GhostSweep’s use of information received from Google APIs adheres to the{" "}
                        <a
                            href="https://developers.google.com/terms/api-services-user-data-policy"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary underline"
                        >
                            Google API Services User Data Policy
                        </a>
                        , including the Limited Use requirements.
                    </p>
                    <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                        <li>
                            We use Gmail data to provide features you explicitly request (such as running a sweep or sending a deletion request you trigger).
                        </li>
                        <li>We do not use Google user data for ads or marketing profiling.</li>
                        <li>
                            We do not sell Google user data. We only share data with service providers as necessary to run GhostSweep (e.g., hosting, billing),
                            or when required by law.
                        </li>
                        <li>
                            Access to Google data is restricted to automated systems and is not available for human review except when necessary for security,
                            legal compliance, or debugging a specific issue you request help with.
                        </li>
                    </ul>
                    <div className="mt-3 rounded-lg border border-white/10 bg-black/40 p-3">
                        <div className="mb-2 flex items-center gap-2 text-xs font-medium text-white/80">
                            <Trash2 className="h-4 w-4 text-primary" />
                            You can revoke access
                        </div>
                        <p className="text-xs text-muted-foreground">
                            You can disconnect Gmail anytime from the app to revoke tokens. You can also delete sweep and deletion-tracking data from within the app.
                        </p>
                    </div>
                </section>

                {/* Data retention */}
                <section className="space-y-3 rounded-xl border border-white/10 bg-[#050505] p-5 text-sm">
                    <h2 className="text-base font-semibold tracking-tight">5. Data retention and deletion</h2>
                    <p className="text-sm text-muted-foreground">
                        We retain your account information, subscription status, sweep summaries, and deletion tracking records for as long as your account remains active,
                        unless you request deletion.
                    </p>
                    <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                        <li>You can delete sweep data (services, summary signals, scan history) from within the app.</li>
                        <li>You can delete deletion tracking records (deletion requests, batches, and statuses) from within the app.</li>
                        <li>
                            You can disconnect Gmail to revoke access. We recommend deleting stored sweep and deletion-tracking data if you no longer want it retained.
                        </li>
                        <li>
                            You can request account deletion. This may permanently remove your profile, subscriptions, and history, subject to minimal legal retention needs
                            (e.g., billing records).
                        </li>
                    </ul>
                </section>

                {/* Sharing */}
                <section className="space-y-3 rounded-xl border border-white/10 bg-[#050505] p-5 text-sm">
                    <h2 className="text-base font-semibold tracking-tight">6. Sharing your information</h2>
                    <p className="text-sm text-muted-foreground">
                        We do not sell your personal data. We may share limited information with:
                    </p>
                    <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                        <li>Infrastructure providers (database, hosting, serverless functions).</li>
                        <li>Payment processors (Stripe) for billing.</li>
                        <li>Analytics/logging tools to monitor performance and stability.</li>
                        <li>Authorities if required by law or valid legal process.</li>
                    </ul>
                    <p className="mt-2 text-sm text-muted-foreground">
                        We only share the minimum necessary to provide GhostSweep.
                    </p>
                </section>

                {/* Your rights */}
                <section className="space-y-3 rounded-xl border border-white/10 bg-[#050505] p-5 text-sm">
                    <h2 className="text-base font-semibold tracking-tight">7. Your rights and choices</h2>
                    <p className="text-sm text-muted-foreground">
                        Depending on your location, you may have rights over your data such as access, correction,
                        deletion, limitation, or portability.
                    </p>
                    <p className="text-sm text-muted-foreground">
                        To exercise these rights, contact{" "}
                        <a href="mailto:support@ghostsweep.com" className="text-primary underline">
                            support@ghostsweep.com
                        </a>
                        .
                    </p>

                    <div className="mt-3 grid gap-3 md:grid-cols-2">
                        <div className="rounded-lg border border-white/10 bg-black/40 p-3">
                            <div className="mb-2 flex items-center gap-2 text-xs font-medium text-white/80">
                                <RefreshCw className="h-4 w-4 text-primary" />
                                Manage automations
                            </div>
                            <p className="text-xs text-muted-foreground">
                                If you enable follow-up reminders/automations for deletion requests, you can disable them anytime.
                            </p>
                        </div>
                        <div className="rounded-lg border border-white/10 bg-black/40 p-3">
                            <div className="mb-2 flex items-center gap-2 text-xs font-medium text-white/80">
                                <Lock className="h-4 w-4 text-primary" />
                                Security choices
                            </div>
                            <p className="text-xs text-muted-foreground">
                                You can revoke Gmail access, change your password, and delete stored data from within the app.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Security */}
                <section className="space-y-3 rounded-xl border border-white/10 bg-[#050505] p-5 text-sm">
                    <h2 className="text-base font-semibold tracking-tight">8. Security</h2>
                    <p className="text-sm text-muted-foreground">
                        We use reasonable measures to protect data, including encryption in transit, restricted access,
                        and scoped database policies. No method is 100% secure.
                    </p>
                    <p className="text-sm text-muted-foreground">
                        If you believe your GhostSweep account or Gmail connection has been compromised, disconnect Gmail,
                        change your password, and contact us.
                    </p>
                </section>

                {/* Children */}
                <section className="space-y-3 rounded-xl border border-white/10 bg-[#050505] p-5 text-sm">
                    <h2 className="text-base font-semibold tracking-tight">9. Children&apos;s privacy</h2>
                    <p className="text-sm text-muted-foreground">
                        GhostSweep is not intended for children under 16. We do not knowingly collect personal data from children.
                    </p>
                </section>

                {/* Changes */}
                <section className="space-y-3 rounded-xl border border-white/10 bg-[#050505] p-5 text-sm">
                    <h2 className="text-base font-semibold tracking-tight">10. Changes to this policy</h2>
                    <p className="text-sm text-muted-foreground">
                        We may update this policy to reflect changes to GhostSweep or the law. We will update the “Last updated”
                        date and may notify you in-app or by email for material changes.
                    </p>
                </section>

                {/* Contact */}
                <section className="space-y-3 rounded-xl border border-white/10 bg-[#050505] p-5 text-sm">
                    <div className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-primary" />
                        <h2 className="text-base font-semibold tracking-tight">Questions about this policy?</h2>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        Contact us at:
                    </p>
                    <p className="text-sm text-muted-foreground">
                        <Mail className="mr-1 inline h-3 w-3 text-primary" />
                        <a href="mailto:support@ghostsweep.com" className="text-primary underline">
                            support@ghostsweep.com
                        </a>
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                        Please avoid sending sensitive information (passwords, full payment card numbers) by email.
                    </p>
                </section>

                {/* Back */}
                <div className="pb-10 text-xs text-muted-foreground">
                    <Link href="/" className="text-primary underline hover:opacity-90 transition">
                        Back to GhostSweep
                    </Link>
                </div>
            </div>
        </main>
    );
}