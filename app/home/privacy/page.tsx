// app/privacy/page.tsx
import Link from "next/link"
import { ShieldCheck, Mail, Globe2, Lock, AlertCircle } from "lucide-react"

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
                        This Privacy Policy explains how GhostSweep collects, uses, and protects
                        your information when you use our services. We designed GhostSweep to be
                        privacy-first and give you control over your data.
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                        Last updated: Dec 01, 2025
                    </p>
                </header>

                {/* Summary */}
                <section className="grid gap-4 md:grid-cols-3 text-sm">
                    <div className="rounded-xl border border-white/10 bg-[#050505] p-4">
                        <div className="mb-2 flex items-center gap-2 text-xs font-medium text-muted-foreground">
                            <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                            Privacy-first
                        </div>
                        <p className="text-xs text-muted-foreground/90">
                            GhostSweep analyzes metadata to map where your data lives. We don&apos;t
                            read or store full email bodies.
                        </p>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-[#050505] p-4">
                        <div className="mb-2 flex items-center gap-2 text-xs font-medium text-muted-foreground">
                            <Lock className="h-3.5 w-3.5 text-primary" />
                            You&apos;re in control
                        </div>
                        <p className="text-xs text-muted-foreground/90">
                            You can disconnect Gmail, delete sweep data, or delete your account at
                            any time from within the app.
                        </p>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-[#050505] p-4">
                        <div className="mb-2 flex items-center gap-2 text-xs font-medium text-muted-foreground">
                            <Globe2 className="h-3.5 w-3.5 text-primary" />
                            No selling data
                        </div>
                        <p className="text-xs text-muted-foreground/90">
                            We do not sell your personal data. Limited third-party services are
                            used only to operate GhostSweep (for example, hosting and billing).
                        </p>
                    </div>
                </section>

                {/* Who we are */}
                <section className="space-y-3 rounded-xl border border-white/10 bg-[#050505] p-5 text-sm">
                    <h2 className="text-base font-semibold tracking-tight">
                        1. Who we are
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        GhostSweep is a web application that helps you understand where your
                        email address is used, which services hold your data, and which of those
                        services may have been involved in known data breaches.
                    </p>
                    <p className="text-sm text-muted-foreground">
                        If you have questions about this policy, you can contact us at{" "}
                        <a
                            href="mailto:support@ghostsweep.com"
                            className="text-primary underline"
                        >
                            support@ghostsweep.com
                        </a>
                        .
                    </p>
                </section>

                {/* Information we collect */}
                <section className="space-y-3 rounded-xl border border-white/10 bg-[#050505] p-5 text-sm">
                    <h2 className="text-base font-semibold tracking-tight">
                        2. Information we collect
                    </h2>

                    <div className="space-y-2">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-[0.12em]">
                            2.1 Account information
                        </p>
                        <p className="text-sm text-muted-foreground">
                            When you create an account, we collect your email address and basic
                            authentication details through our authentication provider (Supabase Auth). We may also store basic profile information if you
                            choose to provide it.
                        </p>
                    </div>

                    <div className="space-y-2">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-[0.12em]">
                            2.2 Gmail connection (Google OAuth)
                        </p>
                        <p className="text-sm text-muted-foreground">
                            When you connect your Gmail account, we use Google&apos;s OAuth
                            permission system to request <span className="font-medium">read-only</span>{" "}
                            access to your mailbox and basic profile details (such as your email
                            address). GhostSweep does not request permission to send, delete, or
                            modify emails.
                        </p>
                        <p className="mt-1 text-sm text-muted-foreground">
                            During sweeps, we access mailbox metadata (for example, sender, subject
                            line, and timestamp) to detect services and security-related messages.
                            We do not need to permanently store raw email messages to provide
                            GhostSweep&apos;s functionality.
                        </p>
                    </div>

                    <div className="space-y-2">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-[0.12em]">
                            2.3 Sweep summaries and service data
                        </p>
                        <p className="text-sm text-muted-foreground">
                            To show you your results, we store:
                        </p>
                        <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                            <li>Detected services and domains associated with your email</li>
                            <li>Basic activity indicators (for example, first seen, last seen)</li>
                            <li>Counts of messages related to each service</li>
                            <li>Known breach information linked to your email address</li>
                            <li>High-level scan history (for example, last sweep date)</li>
                        </ul>
                    </div>

                    <div className="space-y-2">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-[0.12em]">
                            2.4 Payment information
                        </p>
                        <p className="text-sm text-muted-foreground">
                            When you purchase a Professional subscription, payments are processed by our
                            third-party payment provider (Stripe). We do not store your
                            full payment card details on our own servers. We may store subscription
                            status, plan type, and billing-related metadata.
                        </p>
                    </div>

                    <div className="space-y-2">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-[0.12em]">
                            2.5 Usage data
                        </p>
                        <p className="text-sm text-muted-foreground">
                            We may collect basic technical information about how you use GhostSweep,
                            such as browser type, approximate region, and pages visited. We use this
                            to improve performance, reliability, and usability. We do not use this
                            data to build marketing profiles or sell it to third parties.
                        </p>
                    </div>
                </section>

                {/* How we use your information */}
                <section className="space-y-3 rounded-xl border border-white/10 bg-[#050505] p-5 text-sm">
                    <h2 className="text-base font-semibold tracking-tight">
                        3. How we use your information
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        We use the information we collect for the following purposes:
                    </p>
                    <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                        <li>To operate and maintain GhostSweep</li>
                        <li>To perform inbox sweeps at your request</li>
                        <li>To identify services and accounts linked to your email address</li>
                        <li>To display breach information and risk indicators</li>
                        <li>To provide support and respond to issues you report</li>
                        <li>To handle billing, subscriptions, and account changes</li>
                        <li>To improve GhostSweep&apos;s accuracy, reliability, and UX</li>
                    </ul>
                </section>

                {/* Gmail API Limited Use */}
                <section className="space-y-3 rounded-xl border border-white/10 bg-[#050505] p-5 text-sm">
                    <h2 className="text-base font-semibold tracking-tight">
                        4. Use of Google user data
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        When you connect a Google account, GhostSweep&apos;s use of information
                        received from Google APIs adheres to the{" "}
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
                            GhostSweep only uses Gmail data to provide features you explicitly
                            request (for example, running a sweep to detect services).
                        </li>
                        <li>
                            We do not use Gmail data to serve ads or for marketing purposes.
                        </li>
                        <li>
                            We do not sell or transfer Gmail data to third parties, except where
                            necessary to provide the service (for example, secure hosting) or where
                            required by law.
                        </li>
                        <li>
                            Access to Google data is restricted to automated systems and is not
                            available for human review except when necessary for security, legal
                            compliance, or debugging a specific issue you request help with.
                        </li>
                    </ul>
                </section>

                {/* Data retention & deletion */}
                <section className="space-y-3 rounded-xl border border-white/10 bg-[#050505] p-5 text-sm">
                    <h2 className="text-base font-semibold tracking-tight">
                        5. Data retention and deletion
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        We retain your account information, subscription status, and sweep
                        summaries for as long as your account remains active, unless you request
                        deletion.
                    </p>
                    <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                        <li>
                            You can delete sweep data from within the app. This removes stored
                            service summaries and breach results linked to your account.
                        </li>
                        <li>
                            You can disconnect your Gmail account. This revokes future access via
                            Google OAuth. We recommend deleting your sweep data as well if you no
                            longer want GhostSweep to retain it.
                        </li>
                        <li>
                            You can request full account deletion. This may permanently remove your
                            profile, subscriptions, and sweep history, subject to any legal
                            requirements to retain minimal billing records.
                        </li>
                    </ul>
                </section>

                {/* Sharing and third parties */}
                <section className="space-y-3 rounded-xl border border-white/10 bg-[#050505] p-5 text-sm">
                    <h2 className="text-base font-semibold tracking-tight">
                        6. Sharing your information
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        We do not sell your personal data. We may share limited information with:
                    </p>
                    <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                        <li>
                            Hosting and infrastructure providers that help us run GhostSweep (for
                            example, database, storage, serverless functions)
                        </li>
                        <li>
                            Payment processors that handle subscriptions and billing on our behalf
                        </li>
                        <li>
                            Analytics or logging tools used to monitor performance and stability
                        </li>
                        <li>
                            Law enforcement or authorities, if required by applicable law or in
                            response to valid legal process
                        </li>
                    </ul>
                    <p className="mt-2 text-sm text-muted-foreground">
                        We only share the minimum amount of information necessary for these
                        providers to perform their services, and we expect them to protect your
                        data appropriately.
                    </p>
                </section>

                {/* Your rights */}
                <section className="space-y-3 rounded-xl border border-white/10 bg-[#050505] p-5 text-sm">
                    <h2 className="text-base font-semibold tracking-tight">
                        7. Your rights and choices
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        Depending on your location and applicable laws, you may have rights over
                        your personal data, such as:
                    </p>
                    <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                        <li>Accessing the information we store about you</li>
                        <li>Correcting inaccurate or incomplete information</li>
                        <li>Requesting deletion of your data</li>
                        <li>Objecting to or limiting certain types of processing</li>
                        <li>Exporting your data in a portable format</li>
                    </ul>
                    <p className="mt-2 text-sm text-muted-foreground">
                        To exercise these rights, you can contact us at{" "}
                        <a
                            href="mailto:support@ghostsweep.com"
                            className="text-primary underline"
                        >
                            support@ghostsweep.com
                        </a>
                        . We may need to verify your identity before fulfilling certain requests.
                    </p>
                </section>

                {/* Security */}
                <section className="space-y-3 rounded-xl border border-white/10 bg-[#050505] p-5 text-sm">
                    <h2 className="text-base font-semibold tracking-tight">
                        8. Security
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        We use reasonable technical and organizational measures to protect your
                        data, including encryption in transit, restricted access to production
                        systems, and scoped database policies. However, no method of transmission
                        or storage is completely secure, and we cannot guarantee absolute
                        security.
                    </p>
                    <p className="text-sm text-muted-foreground">
                        If you believe your GhostSweep account or Gmail connection has been
                        compromised, please disconnect your Gmail account, change your password,
                        and contact us immediately.
                    </p>
                </section>

                {/* Children */}
                <section className="space-y-3 rounded-xl border border-white/10 bg-[#050505] p-5 text-sm">
                    <h2 className="text-base font-semibold tracking-tight">
                        9. Children&apos;s privacy
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        GhostSweep is not intended for use by children under the age of 16. We do
                        not knowingly collect personal information from children. If we learn that
                        we have collected such information, we will take steps to delete it.
                    </p>
                </section>

                {/* Changes */}
                <section className="space-y-3 rounded-xl border border-white/10 bg-[#050505] p-5 text-sm">
                    <h2 className="text-base font-semibold tracking-tight">
                        10. Changes to this policy
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        We may update this Privacy Policy from time to time to reflect changes in
                        GhostSweep or applicable laws. When we make material changes, we will
                        update the &quot;Last updated&quot; date at the top of this page and, where
                        appropriate, notify you inside the app or by email.
                    </p>
                </section>

                {/* Contact */}
                <section className="space-y-3 rounded-xl border border-white/10 bg-[#050505] p-5 text-sm">
                    <div className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-primary" />
                        <h2 className="text-base font-semibold tracking-tight">
                            Questions about this policy?
                        </h2>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        If you have any questions or concerns about how GhostSweep handles your
                        data, or if you want to exercise your privacy rights, you can reach us at:
                    </p>
                    <p className="text-sm text-muted-foreground">
                        <Mail className="mr-1 inline h-3 w-3 text-primary" />
                        <a
                            href="mailto:support@ghostsweep.com"
                            className="text-primary underline"
                        >
                            support@ghostsweep.com
                        </a>
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                        Please avoid sending sensitive information (such as passwords or full
                        payment card numbers) in emails.
                    </p>
                </section>

                {/* Back to app / home */}
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