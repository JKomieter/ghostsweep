// app/dashboard/billing/page.tsx
export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { cn } from "@/lib/utils";
import CheckoutForm from "../_components/checkout";
import { ShieldCheck, CalendarClock } from "lucide-react";

const PRO_MONTHLY_PRICE_CENTS = 1999; // $19.99
const PRO_YEARLY_PRICE_CENTS = 14900; // $149.00

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

        console.log("User visited billing page:", JSON.stringify(sub));

    const isPro = sub?.current_plan === "pro";
    const renewsAt = sub?.renews_at ?? null;
    const wasCanceled = params?.canceled === "true"; // Add this

    // Selected interval from URL (?plan=yearly)
    const selectedPlan: BillingInterval =
        params?.plan === "yearly" ? "yearly" : "monthly";

    const planConfig =
        selectedPlan === "monthly"
            ? {
                label: "Value Hunter — Monthly",
                priceCents: PRO_MONTHLY_PRICE_CENTS,
                priceLabel: "$19.99 / month",
                interval: "monthly" as BillingInterval,
                subline: "Perfect for a one-time savings extraction and inbox audit.",
                // NOTE: this should be a PRICE id (price_xxx), not a product id (prod_xxx)
                priceId: process.env.STRIPE_PRICE_PRO!,
            }
            : {
                label: "Savings Pro — Yearly",
                priceCents: PRO_YEARLY_PRICE_CENTS,
                priceLabel: "$149 / year",
                interval: "yearly" as BillingInterval,
                subline: "Save 35% vs monthly. Continuous monitoring for new value.",
                // NOTE: this should be a PRICE id (price_xxx), not a product id (prod_xxx)
                priceId: process.env.STRIPE_PRICE_SENTINEL!,
            };

    return (
        <main className="min-h-screen flex items-center justify-center bg-[#050505] px-4 py-8">
            <div className="w-full max-w-xl mx-auto rounded-lg border border-white/5 bg-white/2 p-6 md:p-8 shadow-lg space-y-8">
                {/* Header */}
                <header className="space-y-2">
                    <h1 className="text-3xl font-light tracking-tight text-white">
                        GhostSweep Billing
                    </h1>
                    <p className="text-sm text-white/60">
                        Manage your Professional plan and billing details.
                    </p>
                </header>

                {/* ADD THIS: Canceled message */}
                {wasCanceled && !isPro && (
                    <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 p-4">
                        <p className="text-sm text-amber-300">
                            Checkout was canceled. You can try again whenever you&apos;re ready.
                        </p>
                    </div>
                )}

                {/* ✅ Already Pro UI */}
                {isPro ? (
                    <section className="rounded-lg border border-white/5 bg-white/2 p-6 space-y-4">
                        <div className="flex items-start gap-3">
                            <div className="mt-0.5 rounded-full bg-emerald-500/20 p-2.5 text-emerald-400">
                                <ShieldCheck className="h-5 w-5" />
                            </div>

                            <div className="flex-1">
                                <p className="text-sm font-light text-white">
                                    You’re already on GhostSweep Professional
                                </p>

                                {renewsAt ? (
                                    <p className="mt-2 text-xs text-white/60 flex items-center gap-2">
                                        <CalendarClock className="h-4 w-4" />
                                        Renews on <span className="font-light text-white">{formatDate(renewsAt)}</span>
                                    </p>
                                ) : (
                                    <p className="mt-2 text-xs text-white/60 flex items-center gap-2">
                                        <CalendarClock className="h-4 w-4" />
                                        No renewal date on file (one-time purchase or manual subscription).
                                    </p>
                                )}

                                <div className="mt-4 grid gap-2 text-xs text-white/60">
                                    <p className="text-[11px] font-medium uppercase tracking-widest text-white/40">
                                        What you can do here
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
                                            "bg-white/2 hover:bg-white/3 border border-white/5 hover:border-white/10 text-white"
                                        )}
                                    >
                                        Back to dashboard
                                    </Link>

                                    <Link
                                        href="/dashboard/support"
                                        className={cn(
                                            "inline-flex items-center justify-center rounded-md px-3 py-2 text-sm",
                                            "bg-white/2 hover:bg-white/3 border border-white/5 hover:border-white/10 text-emerald-400"
                                        )}
                                    >
                                        Billing help
                                    </Link>
                                </div>

                                {/* Optional note if you *don’t* have portal yet */}
                                <p className="mt-3 text-[11px] text-white/40">
                                    Tip: If you want cancellations/plan changes, add Stripe Billing Portal later.
                                </p>
                            </div>
                        </div>
                    </section>
                ) : (
                    <>
                        {/* Plan toggle */}
                        <div className="inline-flex rounded-lg border border-white/5 bg-white/2 p-1 text-xs">
                            <Link
                                href="/dashboard/billing?plan=monthly"
                                className={cn(
                                    "px-3 py-1.5 rounded-md transition-colors",
                                    selectedPlan === "monthly"
                                        ? "bg-white text-black font-light"
                                        : "text-white/60 hover:text-white/80"
                                )}
                            >
                                Monthly · $19.99
                            </Link>
                            <Link
                                href="/dashboard/billing?plan=yearly"
                                className={cn(
                                    "px-3 py-1.5 rounded-md transition-colors",
                                    selectedPlan === "yearly"
                                        ? "bg-white text-black font-light"
                                        : "text-white/60 hover:text-white/80"
                                )}
                            >
                                Yearly · $149
                            </Link>
                        </div>

                        {/* Selected plan summary */}
                        <section className="rounded-lg border border-white/5 bg-white/2 p-6 space-y-4">
                            <div className="flex items-baseline justify-between gap-3">
                                <div>
                                    <p className="text-sm font-light text-white/80">
                                        {planConfig.label}
                                    </p>
                                    <p className="mt-1 text-3xl font-light text-white">
                                        {planConfig.priceLabel}
                                    </p>
                                    <p className="mt-1 text-xs text-white/60">
                                        {planConfig.subline}
                                    </p>
                                </div>
                                <span className={cn(
                                    "rounded-lg border px-3 py-1 text-[11px] font-medium",
                                    selectedPlan === "yearly" 
                                        ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                                        : "border-white/5 bg-white/2 text-white/80"
                                )}>
                                    {selectedPlan === "yearly" ? "Savings Pro" : "Value Hunter"}
                                </span>
                            </div>

                            <div className="h-px bg-white/5" />

                            <div className="grid gap-2 text-xs text-white/60">
                                <p className="text-[11px] font-medium uppercase tracking-widest text-white/40">What you get</p>
                                {selectedPlan === "monthly" ? (
                                    <ul className="space-y-1">
                                        <li>• Unlimited Coupon Discovery</li>
                                        <li>• Gift Card & Rewards Rescue</li>
                                        <li>• Account Deletion Engine</li>
                                    </ul>
                                ) : (
                                    <ul className="space-y-1">
                                        <li>• Everything in Monthly</li>
                                        <li>• Expiring Points Alerts</li>
                                        <li>• Continuous value monitoring</li>
                                        <li>• Save 35% vs Monthly</li>
                                    </ul>
                                )}
                            </div>
                        </section>

                        {/* Checkout */}
                        <section className="space-y-3 max-w-md">
                            <p className="text-sm text-white/60">
                                You&apos;re upgrading to{" "}
                                <span className="font-light text-white">
                                    {planConfig.priceLabel}
                                </span>
                                .
                            </p>

                            <CheckoutForm priceId={planConfig.priceId} />
                        </section>

                        <footer className="space-y-1 text-[11px] text-white/40">
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