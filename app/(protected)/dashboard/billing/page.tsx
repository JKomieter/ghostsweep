// app/dashboard/billing/page.tsx
export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { stripe } from "@/lib/stripe";
import { createClient } from "@/utils/supabase/server";
import CheckoutForm from "../_components/checkout";
import Link from "next/link";
import { cn } from "@/lib/utils";

const PRO_MONTHLY_PRICE_CENTS = 999;   // $9.99
const PRO_YEARLY_PRICE_CENTS = 9588;   // $95.88

type BillingInterval = "monthly" | "yearly";

type PageProps = {
    searchParams?: Promise<{ plan?: string }>
};

export default async function BillingPage({ searchParams }: PageProps) {
    const params =
        await searchParams 

    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

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
            }
            : {
                label: "GhostSweep Professional — Yearly",
                priceCents: PRO_YEARLY_PRICE_CENTS,
                priceLabel: "$95.88 / year",
                interval: "yearly" as BillingInterval,
                subline: "Save ~20% vs paying monthly.",
            };

    // Existing subscription row
    const { data: subRow } = await supabase
        .from("user_subscriptions")
        .select("stripe_customer_id")
        .eq("user_id", user.id)
        .maybeSingle();

    let stripeCustomerId = subRow?.stripe_customer_id as string | null;

    // Create Stripe customer if needed
    if (!stripeCustomerId) {
        const customer = await stripe.customers.create({
            email: user.email ?? undefined,
            metadata: {
                supabase_user_id: user.id,
            },
        });

        stripeCustomerId = customer.id;

        const { error } = await supabase.functions.invoke("update-user-stripeId", {
            body: {
                userId: user.id,
                stripeCustomerId,
            },
            headers: {
                "x-ghostsweep-secret": process.env.FUNCTION_SECRET!
            }
        });

        if (error) {
            console.error("Failed to store Stripe customer ID:", error);
            throw new Error("Failed to create customer");
        }
    }

    // PaymentIntent for selected plan
    const paymentIntent = await stripe.paymentIntents.create({
        amount: planConfig.priceCents,
        currency: "usd",
        customer: stripeCustomerId,
        automatic_payment_methods: {
            enabled: true,
        },
        metadata: {
            product: "GhostSweep Professional",
            billing_interval: planConfig.interval,
            supabase_user_id: user.id,
            type: "one_time_checkout",
        },
    });

    if (!paymentIntent.client_secret) {
        throw new Error("Failed to create payment intent");
    }

    return (
        <main className="min-h-screen flex items-center justify-center bg-background text-foreground px-4">
            <div className="w-full max-w-xl mx-auto rounded-2xl border border-white/10 bg-[#050505] p-6 shadow-lg space-y-6">
                {/* Header */}
                <header className="space-y-1">
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Upgrade to GhostSweep Professional
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Free gives you <span className="font-medium">1 sweep per month</span>.
                        Professional unlocks <span className="font-medium">unlimited sweeps</span>,
                        new account detection, breach alerts, and deletion request tracking.
                    </p>
                </header>

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

                    {/* Key benefits – short & clear */}
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
                    <CheckoutForm clientSecret={paymentIntent.client_secret} />
                </section>

                {/* Footer note */}
                <footer className="space-y-1 text-[11px] text-muted-foreground">
                    <p>
                        Payments are securely processed by Stripe. GhostSweep never stores
                        your card details.
                    </p>
                    {/* <p>
                        This environment is in Stripe test mode. Use a test card like{" "}
                        <code>4242 4242 4242 4242</code> while integrating.
                    </p> */}
                </footer>
            </div>
        </main>
    );
}