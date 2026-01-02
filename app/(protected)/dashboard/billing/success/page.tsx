// app/dashboard/billing/success/page.tsx
export const dynamic = "force-dynamic";

import Link from "next/link";
import { redirect } from "next/navigation";
import type Stripe from "stripe";
import { stripe } from "@/lib/stripe";

const SuccessIcon = (
    <svg width="16" height="14" viewBox="0 0 16 14" fill="none" aria-hidden="true">
        <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M15.4695 0.232963C15.8241 0.561287 15.8454 1.1149 15.5171 1.46949L6.14206 11.5945C5.97228 11.7778 5.73221 11.8799 5.48237 11.8748C5.23253 11.8698 4.99677 11.7582 4.83452 11.5681L0.459523 6.44311C0.145767 6.07557 0.18937 5.52327 0.556912 5.20951C0.924454 4.89575 1.47676 4.93936 1.79051 5.3069L5.52658 9.68343L14.233 0.280522C14.5613 -0.0740672 15.1149 -0.0953599 15.4695 0.232963Z"
            fill="white"
        />
    </svg>
);

const ErrorIcon = (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M1.25628 1.25628C1.59799 0.914573 2.15201 0.914573 2.49372 1.25628L8 6.76256L13.5063 1.25628C13.848 0.914573 14.402 0.914573 14.7437 1.25628C15.0854 1.59799 15.0854 2.15201 14.7437 2.49372L9.23744 8L14.7437 13.5063C15.0854 13.848 15.0854 14.402 14.7437 14.7437C14.402 15.0854 13.848 15.0854 13.5063 14.7437L8 9.23744L2.49372 14.7437C2.15201 15.0854 1.59799 15.0854 1.25628 14.7437C0.914573 14.402 0.914573 13.848 1.25628 13.5063L6.76256 8L1.25628 2.49372C0.914573 2.15201 0.914573 1.59799 1.25628 1.25628Z"
            fill="white"
        />
    </svg>
);

const InfoIcon = (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
        <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M10 1.5H4C2.61929 1.5 1.5 2.61929 1.5 4V10C1.5 11.3807 2.61929 12.5 4 12.5H10C11.3807 12.5 12.5 11.3807 12.5 10V4C12.5 2.61929 11.3807 1.5 10 1.5ZM4 0C1.79086 0 0 1.79086 0 4V10C0 12.2091 1.79086 14 4 14H10C12.2091 14 14 12.2091 14 10V4C14 1.79086 12.2091 0 10 0H4Z"
            fill="white"
        />
        <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M5.25 7C5.25 6.58579 5.58579 6.25 6 6.25H7.25C7.66421 6.25 8 6.58579 8 7V10.5C8 10.9142 7.66421 11.25 7.25 11.25C6.83579 11.25 6.5 10.9142 6.5 10.5V7.75H6C5.58579 7.75 5.25 7.41421 5.25 7Z"
            fill="white"
        />
        <path
            d="M5.75 4C5.75 3.31075 6.31075 2.75 7 2.75C7.68925 2.75 8.25 3.31075 8.25 4C8.25 4.68925 7.68925 5.25 7 5.25C6.31075 5.25 5.75 4.68925 5.75 4Z"
            fill="white"
        />
    </svg>
);

const STATUS_CONTENT_MAP: Record<
    string,
    { title: string; subtitle: string; iconColor: string; icon: React.JSX.Element }
> = {
    succeeded: {
        title: "You’re all set.",
        subtitle: "Your plan will activate shortly — usually within a few seconds.",
        iconColor: "#16a34a",
        icon: SuccessIcon,
    },
    processing: {
        title: "Payment processing…",
        subtitle: "This can take a minute. Your plan will activate once it clears.",
        iconColor: "#64748b",
        icon: InfoIcon,
    },
    requires_payment_method: {
        title: "Payment failed.",
        subtitle: "Your payment wasn’t successful. Please try again.",
        iconColor: "#ef4444",
        icon: ErrorIcon,
    },
    requires_action: {
        title: "Action required.",
        subtitle: "Additional authentication is required to complete payment.",
        iconColor: "#64748b",
        icon: InfoIcon,
    },
    canceled: {
        title: "Payment canceled.",
        subtitle: "No worries — you can try again anytime.",
        iconColor: "#ef4444",
        icon: ErrorIcon,
    },
    default: {
        title: "Something went wrong.",
        subtitle: "Please try again, or contact support if it keeps happening.",
        iconColor: "#ef4444",
        icon: ErrorIcon,
    },
};

function shortId(id: string) {
    if (!id) return "—";
    if (id.length <= 18) return id;
    return `${id.slice(0, 10)}…${id.slice(-6)}`;
}

export default async function SuccessPage({
    searchParams,
}: {
    searchParams: Promise<{ session_id?: string }>;
}) {
    const sessionId = (await searchParams)?.session_id;
    if (!sessionId) redirect("/dashboard/billing");

    const session = await stripe.checkout.sessions.retrieve(sessionId, {
        expand: ["payment_intent", "line_items"],
    });

    // If user hits success URL but never completed checkout
    if (session.status === "open") redirect("/dashboard/billing");

    const paymentIntent = session.payment_intent as Stripe.PaymentIntent | null;
    const piStatus = paymentIntent?.status ?? "default";
    const ui = STATUS_CONTENT_MAP[piStatus] ?? STATUS_CONTENT_MAP.default;

    const customerEmail =
        session.customer_details?.email ??
        (typeof session.customer_email === "string" ? session.customer_email : null);

    const paymentIntentId = paymentIntent?.id ?? null;

    const isSuccess = piStatus === "succeeded";
    const isProcessing = piStatus === "processing";
    const isFailure =
        piStatus === "requires_payment_method" ||
        piStatus === "canceled" ||
        piStatus === "default";

    const showStripeLink =
        process.env.NODE_ENV !== "production" && Boolean(paymentIntentId);

    return (
        <main className="min-h-screen bg-background px-4 py-10 text-foreground">
            <div className="mx-auto w-full max-w-xl space-y-4">
                {/* Header card */}
                <div className="rounded-2xl border border-white/10 bg-[#050505] p-6 shadow-lg">
                    <div className="flex items-start gap-3">
                        <div
                            className="flex h-11 w-11 items-center justify-center rounded-full"
                            style={{ backgroundColor: ui.iconColor }}
                        >
                            {ui.icon}
                        </div>

                        <div className="flex-1">
                            <h1 className="text-xl font-semibold text-white">{ui.title}</h1>
                            <p className="mt-1 text-sm text-white/60">{ui.subtitle}</p>

                            <p className="mt-3 text-sm text-white/70">
                                {customerEmail ? (
                                    <>
                                        Receipt will be sent to{" "}
                                        <span className="font-medium text-white/85">{customerEmail}</span>.
                                    </>
                                ) : (
                                    <>Receipt will be sent to the email used at checkout.</>
                                )}
                            </p>
                        </div>
                    </div>

                    {/* What to do next */}
                    {(isSuccess || isProcessing) && (
                        <div className="mt-5 rounded-xl border border-white/10 bg-white/5 p-4">
                            <p className="text-sm font-medium text-white/85">What to do next</p>
                            <ul className="mt-2 space-y-2 text-xs text-white/65">
                                <li className="flex items-start gap-2">
                                    <span className="mt-0.5 inline-block h-1.5 w-1.5 rounded-full bg-emerald-400/80" />
                                    Go to your accounts list and start cleaning up the highest-risk services.
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="mt-0.5 inline-block h-1.5 w-1.5 rounded-full bg-emerald-400/80" />
                                    Use deletion guides, then enable auto follow-ups + status tracking.
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="mt-0.5 inline-block h-1.5 w-1.5 rounded-full bg-emerald-400/80" />
                                    If your plan doesn’t update in 1–2 minutes, refresh the dashboard.
                                </li>
                            </ul>
                        </div>
                    )}

                    {/* Unlocks */}
                    {isSuccess && (
                        <div className="mt-4 grid gap-2 sm:grid-cols-2">
                            {[
                                "Full account list (not just 10)",
                                "Deletion request tracking",
                                "Auto follow-ups + status checking",
                                "Breach monitoring",
                                "Priority email support",
                            ].map((t) => (
                                <div
                                    key={t}
                                    className="rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-xs text-white/75"
                                >
                                    {t}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* CTAs */}
                    <div className="mt-5 flex flex-col gap-2 sm:flex-row">
                        <Link
                            href="/dashboard"
                            className="inline-flex w-full items-center justify-center rounded-md bg-white px-3 py-2 text-sm font-medium text-black hover:bg-zinc-100"
                        >
                            Go to dashboard
                        </Link>

                        <Link
                            href="/dashboard/user_services"
                            className="inline-flex w-full items-center justify-center rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white hover:bg-white/10"
                        >
                            View accounts
                        </Link>
                    </div>

                    <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                        <Link
                            href="/dashboard/billing"
                            className="inline-flex w-full items-center justify-center rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white hover:bg-white/10"
                        >
                            Manage billing
                        </Link>

                        <a
                            href="mailto:support@ghostsweep.com"
                            className="inline-flex w-full items-center justify-center rounded-md border border-emerald-500/25 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200 hover:bg-emerald-500/15"
                        >
                            Contact support
                        </a>
                    </div>

                    {isFailure && (
                        <div className="mt-4 rounded-xl border border-red-500/25 bg-red-500/10 p-4">
                            <p className="text-sm font-medium text-red-200">Need help?</p>
                            <p className="mt-1 text-xs text-red-200/80">
                                If your card was charged but your plan didn’t activate, email support with the session ID below.
                            </p>
                        </div>
                    )}
                </div>

                {/* Details card */}
                <div className="rounded-2xl border border-white/10 bg-[#050505] p-5">
                    <div className="flex items-center justify-between">
                        <span className="text-xs text-white/60">Status</span>
                        <span className="rounded-full border border-white/10 bg-black/40 px-2 py-0.5 text-[12px] text-white/80">
                            {piStatus}
                        </span>
                    </div>

                    <div className="mt-3 grid gap-2 text-xs">
                        <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-3 py-2">
                            <span className="text-white/60">Checkout session</span>
                            <span className="font-mono text-white/80">{shortId(session.id)}</span>
                        </div>

                        {paymentIntentId ? (
                            <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-3 py-2">
                                <span className="text-white/60">Payment Intent</span>
                                <span className="font-mono text-white/80">{shortId(paymentIntentId)}</span>
                            </div>
                        ) : null}
                    </div>

                    {showStripeLink ? (
                        <a
                            href={`https://dashboard.stripe.com/payments/${paymentIntentId}`}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-md border border-blue-500/20 bg-blue-500/10 px-3 py-2 text-sm text-blue-200 hover:bg-blue-500/15"
                        >
                            View in Stripe Dashboard <span className="text-blue-200/70">↗</span>
                        </a>
                    ) : null}
                </div>
            </div>
        </main>
    );
}