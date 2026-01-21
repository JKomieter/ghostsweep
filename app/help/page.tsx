// app/help/page.tsx
import Link from "next/link"
import { ShieldCheck, Mail, HelpCircle, AlertTriangle, Lock } from "lucide-react"

export default function HelpPage() {
    return (
        <main className="min-h-screen bg-background text-foreground">
            <div className="mx-auto max-w-4xl px-4 py-10 space-y-10">
                {/* Header */}
                <header className="space-y-2">
                    <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                        Help Center
                    </p>
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Need help with GhostSweep?
                    </h1>
                    <p className="max-w-2xl text-sm text-muted-foreground">
                        Here you&apos;ll find answers to the most common questions about sweeps, your
                        data, privacy, and subscriptions. If you&apos;re still stuck, you can always
                        contact support.
                    </p>
                </header>

                {/* Quick links */}
                <section className="grid gap-4 md:grid-cols-3 text-sm">
                    <Link
                        href="#getting-started"
                        className="rounded-lg border border-white/10 bg-[#050505] p-4 hover:border-primary/60 hover:bg-white/5 transition"
                    >
                        <p className="text-xs font-semibold text-muted-foreground">
                            Getting started
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground/80">
                            Learn how GhostSweep works and what a sweep does.
                        </p>
                    </Link>
                    <Link
                        href="#privacy-security"
                        className="rounded-lg border border-white/10 bg-[#050505] p-4 hover:border-primary/60 hover:bg-white/5 transition"
                    >
                        <p className="text-xs font-semibold text-muted-foreground">
                            Privacy & security
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground/80">
                            Understand what we access, store, and how you stay in control.
                        </p>
                    </Link>
                    <Link
                        href="#billing"
                        className="rounded-lg border border-white/10 bg-[#050505] p-4 hover:border-primary/60 hover:bg-white/5 transition"
                    >
                        <p className="text-xs font-semibold text-muted-foreground">
                            Billing & plans
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground/80">
                            Free vs Pro, upgrading, and managing your subscription.
                        </p>
                    </Link>
                </section>

                {/* Getting started */}
                <section id="getting-started" className="space-y-4">
                    <div className="flex items-center gap-2">
                        <HelpCircle className="h-4 w-4 text-primary" />
                        <h2 className="text-lg font-semibold tracking-tight">
                            Getting started
                        </h2>
                    </div>
                    <div className="space-y-3 rounded-xl border border-white/10 bg-[#050505] p-5 text-sm">
                        <div>
                            <p className="text-xs font-medium text-muted-foreground">
                                What does GhostSweep do?
                            </p>
                            <p className="mt-1 text-sm text-muted-foreground">
                                GhostSweep scans your inbox using read-only access to identify
                                services, accounts, and companies that hold your data. It highlights
                                active services, suspected accounts, and known breaches so you can
                                decide what to keep, secure, or close.
                            </p>
                        </div>
                        <div>
                            <p className="text-xs font-medium text-muted-foreground">
                                Why do I need to connect my email account?
                            </p>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Your inbox is a complete history of sign-ups, receipts, and security
                                emails. By connecting Gmail or Outlook with read-only permissions, GhostSweep can
                                build a map of where your data lives without ever modifying or sending
                                emails on your behalf.
                            </p>
                        </div>
                        <div>
                            <p className="text-xs font-medium text-muted-foreground">
                                What does a sweep actually look at?
                            </p>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Sweeps use email metadata like the sender, subject line, and timestamps
                                to detect services and categorize them. We don&apos;t need to read the
                                full body of emails to answer: <span className="font-medium">“Who has my data?”</span>
                            </p>
                        </div>
                    </div>
                </section>

                {/* Privacy & Security */}
                <section id="privacy-security" className="space-y-4">
                    <div className="flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4 text-primary" />
                        <h2 className="text-lg font-semibold tracking-tight">
                            Privacy & security
                        </h2>
                    </div>
                    <div className="space-y-3 rounded-xl border border-white/10 bg-[#050505] p-5 text-sm">
                        <div>
                            <p className="text-xs font-medium text-muted-foreground">
                                Do you read the content of my emails?
                            </p>
                            <p className="mt-1 text-sm text-muted-foreground">
                                No. GhostSweep is designed as a privacy-first tool. We analyze
                                metadata (for example, senders and subject lines) to detect accounts
                                and services. We do not read or store full email bodies.
                            </p>
                        </div>
                        <div>
                            <p className="text-xs font-medium text-muted-foreground">
                                What permissions do you request from Google and Microsoft?
                            </p>
                            <p className="mt-1 text-sm text-muted-foreground">
                                We use official OAuth flows with read-only access to your
                                email and basic profile details (email address and name). GhostSweep
                                cannot send, delete, or modify emails in your inbox.
                            </p>
                        </div>
                        <div>
                            <p className="text-xs font-medium text-muted-foreground">
                                What do you store, and can I delete it?
                            </p>
                            <p className="mt-1 text-sm text-muted-foreground">
                                We store a summary of detected services, breaches linked to your
                                email, and basic scan history. You can delete your sweep data at any
                                time from within the app. If you disconnect your email account, we also recommend
                                deleting your sweep history for maximum privacy.
                            </p>
                        </div>
                        <div>
                            <p className="text-xs font-medium text-muted-foreground">
                                How are tokens and credentials handled?
                            </p>
                            <p className="mt-1 text-sm text-muted-foreground">
                                OAuth tokens are stored encrypted and are only used to perform sweeps
                                you request. You can revoke access at any time from your Google
                                account security settings or within GhostSweep by disconnecting your
                                account.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Account & billing */}
                <section id="billing" className="space-y-4">
                    <div className="flex items-center gap-2">
                        <Lock className="h-4 w-4 text-primary" />
                        <h2 className="text-lg font-semibold tracking-tight">
                            Account, plans & billing
                        </h2>
                    </div>
                    <div className="space-y-3 rounded-xl border border-white/10 bg-[#050505] p-5 text-sm">
                        <div>
                            <p className="text-xs font-medium text-muted-foreground">
                                What&apos;s the difference between Free and Pro?
                            </p>
                            <p className="mt-1 text-sm text-muted-foreground">
                                The Free plan gives you a limited view of detected services and
                                basic breach awareness. Professional unlocks full service discovery, complete
                                breach history, more generous sweep limits, and access to data
                                removal email templates.
                            </p>
                        </div>
                        <div>
                            <p className="text-xs font-medium text-muted-foreground">
                                How do I upgrade or cancel?
                            </p>
                            <p className="mt-1 text-sm text-muted-foreground">
                                You can upgrade to Professional or manage your existing subscription from the
                                Subscription &amp; Billing section inside the app. Billing is handled
                                securely via Stripe, and you can cancel anytime from the customer
                                portal.
                            </p>
                        </div>
                        <div>
                            <p className="text-xs font-medium text-muted-foreground">
                                What happens to my data if I cancel?
                            </p>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Cancelling Professional stops future billing but doesn&apos;t automatically
                                delete your sweep history. You can manually delete sweep data and, if
                                you wish, delete your entire account from the Privacy Tools section.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Troubleshooting */}
                <section id="troubleshooting" className="space-y-4">
                    <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-primary" />
                        <h2 className="text-lg font-semibold tracking-tight">
                            Troubleshooting
                        </h2>
                    </div>
                    <div className="space-y-3 rounded-xl border border-white/10 bg-[#050505] p-5 text-sm">
                        <div>
                            <p className="text-xs font-medium text-muted-foreground">
                                My sweep shows no services. Is that normal?
                            </p>
                            <p className="mt-1 text-sm text-muted-foreground">
                                If you recently created your email, or if you rarely sign up for new
                                services, it&apos;s possible that there&apos;s very little to detect.
                                If you think something&apos;s off, try running another sweep or
                                reconnecting your email account.
                            </p>
                        </div>
                        <div>
                            <p className="text-xs font-medium text-muted-foreground">
                                I disconnected my email account, but sweep data is still visible.
                            </p>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Disconnecting removes future access, but doesn't
                                automatically delete past sweep summaries. You can remove all saved
                                sweep data from the Privacy Tools section inside the app.
                            </p>
                        </div>
                        <div>
                            <p className="text-xs font-medium text-muted-foreground">
                                I think a service was detected incorrectly.
                            </p>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Misclassifications can happen if different services share domains
                                or email templates. You can report incorrect detections directly from
                                the dashboard or from the{" "}
                                <Link href="/support/report" className="text-primary underline">
                                    Report an issue
                                </Link>{" "}
                                page.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Contact support */}
                <section className="space-y-3 rounded-xl border border-white/10 bg-[#050505] p-5 text-sm">
                    <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-primary" />
                        <h2 className="text-base font-semibold tracking-tight">
                            Still need help?
                        </h2>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        If you couldn&apos;t find what you&apos;re looking for, you can contact
                        support or report a specific issue. We&apos;ll do our best to respond as
                        quickly as possible.
                    </p>
                    <div className="flex flex-wrap gap-3">
                        <a
                            href="mailto:support@ghostsweep.com?subject=GhostSweep%20Support"
                            className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-1.5 text-xs font-medium hover:bg-white/5 transition"
                        >
                            Contact support
                        </a>
                        <Link
                            href="/support/report"
                            className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-1.5 text-xs font-medium text-primary-foreground shadow-sm hover:opacity-90 transition"
                        >
                            Report an issue
                        </Link>
                    </div>
                </section>
            </div>
        </main>
    )
}