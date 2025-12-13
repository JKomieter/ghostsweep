// app/dashboard/billing/page.tsx
export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { cn } from "@/lib/utils";
import CheckoutForm from "../_components/checkout";
import { ShieldCheck, CalendarClock } from "lucide-react";

const PRO_MONTHLY_PRICE_CENTS = 999; // $9.99
const PRO_YEARLY_PRICE_CENTS = 9588; // $95.88

type BillingInterval = "monthly" | "yearly";

type PageProps = {
    searchParams?: Promise<{ plan?: string, canceled?: string }>;
};

function formatDate(d: string) {
    try {
        return new Date(d).toLocaleDateString(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    } catch {
        return d;
    }
}

export default async function BillingPage({ searchParams }: PageProps) {
    const params = await searchParams;

    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) redirect("/login");

    const { data: sub } = await supabase
        .from("user_subscriptions")
        .select("current_plan, renews_at")
        .eq("user_id", user.id)
        .maybeSingle();

    const isPro = sub?.current_plan === "pro";
    const renewsAt = sub?.renews_at ?? null;
    const wasCanceled = params?.canceled === "true"; // Add this

    // Selected interval from URL (?plan=yearly)
    const selectedPlan: BillingInterval =
        params?.plan === "yearly" ? "yearly" : "monthly";

    const planConfig =
        selectedPlan === "monthly"
            ? {
                label: "GhostSweep Professional — Monthly",
                priceCents: PRO_MONTHLY_PRICE_CENTS,
                priceLabel: "$9.99 / month",
                interval: "monthly" as BillingInterval,
                subline: "Pay month-to-month. Cancel anytime.",
                // NOTE: this should be a PRICE id (price_xxx), not a product id (prod_xxx)
                priceId: "price_1SVNdMK2SUgcYUhjVOPOghzk",
            }
            : {
                label: "GhostSweep Professional — Yearly",
                priceCents: PRO_YEARLY_PRICE_CENTS,
                priceLabel: "$95.88 / year",
                interval: "yearly" as BillingInterval,
                subline: "Save ~20% vs paying monthly.",
                // NOTE: this should be a PRICE id (price_xxx), not a product id (prod_xxx)
                priceId: "price_1SVNecK2SUgcYUhjSkW1DnwS",
            };

    return (
        <main className="min-h-screen flex items-center justify-center bg-background text-foreground px-4">
            <div className="w-full max-w-xl mx-auto rounded-2xl border border-white/10 bg-[#050505] p-6 shadow-lg space-y-6">
                {/* Header */}
                <header className="space-y-1">
                    <h1 className="text-2xl font-semibold tracking-tight">
                        GhostSweep Billing
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Manage your Professional plan and billing details.
                    </p>
                </header>

                {/* ADD THIS: Canceled message */}
                {wasCanceled && !isPro && (
                    <div className="rounded-lg border border-yellow-500/20 bg-yellow-500/10 p-3">
                        <p className="text-sm text-yellow-200">
                            Checkout was canceled. You can try again whenever you&apos;re ready.
                        </p>
                    </div>
                )}

                {/* ✅ Already Pro UI */}
                {isPro ? (
                    <section className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 space-y-3">
                        <div className="flex items-start gap-3">
                            <div className="mt-0.5 rounded-full bg-emerald-500/10 p-2 text-emerald-300">
                                <ShieldCheck className="h-5 w-5" />
                            </div>

                            <div className="flex-1">
                                <p className="text-sm font-semibold text-emerald-200">
                                    You’re already on GhostSweep Professional
                                </p>

                                {renewsAt ? (
                                    <p className="mt-1 text-xs text-emerald-200/80 flex items-center gap-2">
                                        <CalendarClock className="h-4 w-4" />
                                        Renews on <span className="font-medium">{formatDate(renewsAt)}</span>
                                    </p>
                                ) : (
                                    <p className="mt-1 text-xs text-emerald-200/80 flex items-center gap-2">
                                        <CalendarClock className="h-4 w-4" />
                                        No renewal date on file (one-time purchase or manual subscription).
                                    </p>
                                )}

                                <div className="mt-3 grid gap-2 text-xs text-emerald-200/80">
                                    <p className="font-medium text-emerald-100/90">
                                        What you can do here:
                                    </p>
                                    <ul className="space-y-1">
                                        <li>• Keep using Professional features right now</li>
                                        <li>• Switch monthly/yearly only if you add recurring subscriptions later</li>
                                    </ul>
                                </div>

                                <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                                    <Link
                                        href="/dashboard"
                                        className={cn(
                                            "inline-flex items-center justify-center rounded-md px-3 py-2 text-sm",
                                            "bg-white/5 hover:bg-white/10 border border-white/10"
                                        )}
                                    >
                                        Back to dashboard
                                    </Link>

                                    <Link
                                        href="/dashboard/support"
                                        className={cn(
                                            "inline-flex items-center justify-center rounded-md px-3 py-2 text-sm",
                                            "bg-emerald-500/10 hover:bg-emerald-500/15 border border-emerald-500/20 text-emerald-200"
                                        )}
                                    >
                                        Billing help
                                    </Link>
                                </div>

                                {/* Optional note if you *don’t* have portal yet */}
                                <p className="mt-3 text-[11px] text-emerald-200/60">
                                    Tip: If you want cancellations/plan changes, add Stripe Billing Portal later.
                                </p>
                            </div>
                        </div>
                    </section>
                ) : (
                    <>
                        {/* Plan toggle */}
                        <div className="inline-flex rounded-full border border-white/10 bg-[#080808] p-1 text-xs">
                            <Link
                                href="/dashboard/billing?plan=monthly"
                                className={cn(
                                    "px-3 py-1.5 rounded-full transition-colors",
                                    selectedPlan === "monthly"
                                        ? "bg-white text-black font-medium"
                                        : "text-muted-foreground hover:text-white"
                                )}
                            >
                                Monthly · $9.99
                            </Link>
                            <Link
                                href="/dashboard/billing?plan=yearly"
                                className={cn(
                                    "px-3 py-1.5 rounded-full transition-colors",
                                    selectedPlan === "yearly"
                                        ? "bg-white text-black font-medium"
                                        : "text-muted-foreground hover:text-white"
                                )}
                            >
                                Yearly · $95.88
                            </Link>
                        </div>

                        {/* Selected plan summary */}
                        <section className="rounded-xl border border-white/10 bg-[#080808] p-4 space-y-3">
                            <div className="flex items-baseline justify-between gap-3">
                                <div>
                                    <p className="text-sm font-medium text-primary">
                                        {planConfig.label}
                                    </p>
                                    <p className="mt-1 text-3xl font-semibold">
                                        {planConfig.priceLabel}
                                    </p>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        {planConfig.subline}
                                    </p>
                                </div>
                                <span className="rounded-full bg-primary/10 px-3 py-1 text-[11px] font-medium text-primary">
                                    Professional plan
                                </span>
                            </div>

                            <div className="h-px bg-white/5" />

                            <div className="grid gap-2 text-xs text-muted-foreground">
                                <p className="font-medium text-white/80">What you get:</p>
                                <ul className="space-y-1">
                                    <li>• Unlimited inbox scans</li>
                                    <li>• See ALL accounts (not just 50)</li>
                                    <li>• Full breach history with details</li>
                                    <li>• Auto-detect new accounts</li>
                                    <li>• Deletion request templates</li>
                                    <li>• Track deletion progress</li>
                                    <li>• Email alerts for new breaches</li>
                                </ul>
                            </div>
                        </section>

                        {/* Checkout */}
                        <section className="space-y-2 max-w-md">
                            <p className="text-sm text-muted-foreground">
                                You&apos;re upgrading to{" "}
                                <span className="font-medium text-primary">
                                    {planConfig.priceLabel}
                                </span>
                                .
                            </p>

                            <CheckoutForm priceId={planConfig.priceId} />
                        </section>

                        <footer className="space-y-1 text-[11px] text-muted-foreground">
                            <p>
                                Payments are securely processed by Stripe. GhostSweep never stores
                                your card details.
                            </p>
                        </footer>
                    </>
                )}
            </div>
        </main>
    );
}