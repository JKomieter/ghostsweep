// app/security/page.tsx
export default function SecurityPage() {
    return (
        <main className="min-h-screen bg-[#050505] text-white">
            <div className="mx-auto w-full max-w-5xl px-4 py-16 md:px-6 lg:px-8">
                {/* Hero */}
                <section className="mb-10 md:mb-14">
                    <div className="inline-flex rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-200">
                        Security & Privacy
                    </div>

                    <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
                        How GhostSweep protects your inbox and your data
                    </h1>

                    <p className="mt-3 max-w-2xl text-sm text-white/60 sm:text-base">
                        GhostSweep is designed to map your digital footprint without
                        reading your private email content. This page explains what we can
                        access, what we store, how we secure it, and how you stay in
                        control.
                    </p>
                </section>

                {/* Metadata callout */}
                <section className="mb-10">
                    <div className="rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent p-5 sm:p-6">
                        <h2 className="text-sm font-semibold text-emerald-200">
                            Inbox access at a glance
                        </h2>
                        <p className="mt-2 text-sm text-white/80">
                            GhostSweep analyzes{" "}
                            <span className="font-semibold text-emerald-200">
                                email metadata only
                            </span>{" "}
                            — things like sender, subject line, date, labels, and thread IDs —
                            to detect accounts and breaches.
                        </p>
                        <ul className="mt-3 space-y-1.5 text-xs text-white/70 sm:text-sm">
                            <li>• We do not store full email bodies or attachments.</li>
                            <li>
                                • We never send emails on your behalf — you stay in control of
                                requests.
                            </li>
                            <li>
                                • You can disconnect Gmail at any time, which deletes linked
                                scan data.
                            </li>
                        </ul>
                    </div>
                </section>

                {/* 2-column grid */}
                <section className="mb-10 grid gap-6 md:grid-cols-2">
                    {/* What we can access */}
                    <div className="rounded-xl border border-white/10 bg-black/40 p-5 sm:p-6">
                        <h2 className="text-sm font-semibold text-white/90">
                            What GhostSweep can access
                        </h2>
                        <p className="mt-2 text-xs text-white/60 sm:text-sm">
                            When you connect Gmail, you grant GhostSweep read-only access
                            using Google OAuth. We cannot see or change your password.
                        </p>
                        <h3 className="mt-4 text-xs font-semibold uppercase tracking-wide text-white/50">
                            We use Gmail metadata to:
                        </h3>
                        <ul className="mt-2 space-y-1.5 text-xs text-white/70 sm:text-sm">
                            <li>• Detect services from “welcome”, “verify”, and receipt emails.</li>
                            <li>• Identify potential breaches connected to your accounts.</li>
                            <li>
                                • Track replies to your privacy requests (subject line, sender,
                                short snippet).
                            </li>
                        </ul>
                        <h3 className="mt-4 text-xs font-semibold uppercase tracking-wide text-white/50">
                            We do <span className="text-red-400">not</span>:
                        </h3>
                        <ul className="mt-2 space-y-1.5 text-xs text-white/70 sm:text-sm">
                            <li>• Store full email bodies.</li>
                            <li>• Store attachments or inline images.</li>
                            <li>• Send emails on your behalf.</li>
                            <li>• Share your inbox data with advertisers or data brokers.</li>
                        </ul>
                    </div>

                    {/* What we store */}
                    <div className="rounded-xl border border-white/10 bg-black/40 p-5 sm:p-6">
                        <h2 className="text-sm font-semibold text-white/90">
                            What data we store
                        </h2>
                        <p className="mt-2 text-xs text-white/60 sm:text-sm">
                            We store only the minimum needed to power your dashboard and
                            automation features.
                        </p>
                        <h3 className="mt-4 text-xs font-semibold uppercase tracking-wide text-white/50">
                            Stored in GhostSweep:
                        </h3>
                        <ul className="mt-2 space-y-1.5 text-xs text-white/70 sm:text-sm">
                            <li>• Your GhostSweep account (email and basic profile).</li>
                            <li>• Connected Gmail address (for display and routing).</li>
                            <li>• List of detected services (name, domain, category, activity).</li>
                            <li>
                                • Breach matches and high-level breach details (from public
                                breach sources).
                            </li>
                            <li>
                                • Privacy requests you start (service, action, status, timestamps).
                            </li>
                            <li>
                                • Short snippets from company replies, so you have proof of how
                                they responded.
                            </li>
                        </ul>
                        <h3 className="mt-4 text-xs font-semibold uppercase tracking-wide text-white/50">
                            Not stored:
                        </h3>
                        <ul className="mt-2 space-y-1.5 text-xs text-white/70 sm:text-sm">
                            <li>• Full email content.</li>
                            <li>• Attachments or raw mailbox exports.</li>
                            <li>• Your Google password or OAuth refresh screen details.</li>
                        </ul>
                    </div>
                </section>

                {/* Encryption & infrastructure */}
                <section className="mb-10 grid gap-6 md:grid-cols-2">
                    <div className="rounded-xl border border-white/10 bg-black/40 p-5 sm:p-6">
                        <h2 className="text-sm font-semibold text-white/90">
                            Encryption & token security
                        </h2>
                        <ul className="mt-3 space-y-1.5 text-xs text-white/70 sm:text-sm">
                            <li>
                                • OAuth tokens are encrypted at rest using{" "}
                                <span className="font-mono text-[11px] sm:text-xs">
                                    AES-256-GCM
                                </span>{" "}
                                with a 32-byte key.
                            </li>
                            <li>• All communication with GhostSweep uses HTTPS/TLS.</li>
                            <li>
                                • Only backend services with strict access controls can read
                                encrypted tokens to talk to Gmail.
                            </li>
                        </ul>
                        <p className="mt-3 text-xs text-white/60 sm:text-sm">
                            If you disconnect Gmail, we delete your Gmail connection and
                            associated scan data (services, breaches, scan events) tied to
                            that connection.
                        </p>
                    </div>

                    <div className="rounded-xl border border-white/10 bg-black/40 p-5 sm:p-6">
                        <h2 className="text-sm font-semibold text-white/90">
                            Infrastructure & data retention
                        </h2>
                        <ul className="mt-3 space-y-1.5 text-xs text-white/70 sm:text-sm">
                            <li>• GhostSweep runs on a managed Postgres + object storage stack.</li>
                            <li>• Production data is restricted to backend services.</li>
                            <li>• We keep audit trails of scan events and key status changes.</li>
                            <li>
                                • You can request account deletion; we remove your account,
                                Gmail connection, and linked scan data under that identity.
                            </li>
                        </ul>
                    </div>
                </section>

                {/* Third parties & responsible disclosure */}
                <section className="mb-10 grid gap-6 md:grid-cols-2">
                    <div className="rounded-xl border border-white/10 bg-black/40 p-5 sm:p-6">
                        <h2 className="text-sm font-semibold text-white/90">
                            Third-party services
                        </h2>
                        <p className="mt-2 text-xs text-white/60 sm:text-sm">
                            We rely on a small set of trusted vendors, and we share only what
                            is necessary to provide GhostSweep.
                        </p>
                        <ul className="mt-3 space-y-1.5 text-xs text-white/70 sm:text-sm">
                            <li>• <span className="font-semibold">Google</span> — OAuth and Gmail metadata access.</li>
                            <li>• <span className="font-semibold">Stripe</span> — subscription billing (we never store card numbers).</li>
                            <li>• <span className="font-semibold">Email provider</span> — sends transactional emails like alerts.</li>
                        </ul>
                        <p className="mt-3 text-xs text-white/50">
                            These providers are not allowed to use your data for their own
                            advertising or resell it.
                        </p>
                    </div>

                    <div className="rounded-xl border border-white/10 bg-black/40 p-5 sm:p-6">
                        <h2 className="text-sm font-semibold text-white/90">
                            Your rights & reporting a security issue
                        </h2>
                        <ul className="mt-3 space-y-1.5 text-xs text-white/70 sm:text-sm">
                            <li>• You can disconnect Gmail from inside GhostSweep at any time.</li>
                            <li>• You can ask us to delete your account and associated data.</li>
                            <li>• You can opt out of certain email alerts where supported.</li>
                        </ul>
                        <p className="mt-3 text-xs text-white/60 sm:text-sm">
                            If you believe you have found a security vulnerability or privacy
                            issue in GhostSweep, please contact us at{" "}
                            <a
                                href="mailto:security@ghostsweep.com"
                                className="font-medium text-emerald-300 underline underline-offset-2"
                            >
                                security@ghostsweep.com
                            </a>
                            . We’ll review your report and respond as quickly as we can.
                        </p>
                    </div>
                </section>

                {/* Last line */}
                <section className="border-t border-white/10 pt-6 text-xs text-white/40">
                    GhostSweep is built to give you visibility and control over your
                    digital footprint — not to become another data risk. If you have
                    questions about this page, reach out and we’ll clarify anything that
                    isn’t clear.
                </section>
            </div>
        </main>
    );
}