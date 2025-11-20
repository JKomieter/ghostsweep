// app/dashboard/billing/page.tsx
export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { stripe } from "@/lib/stripe";
import { createClient } from "@/utils/supabase/server";
import CheckoutForm from "../_components/checkout";

const PRO_MONTHLY_PRICE_CENTS = 699; // $6.99

export default async function BillingPage() {
    // 1) Get Supabase user
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    // 2) Look up existing subscription row
    const { data: subRow } = await supabase
        .from("user_subscriptions")
        .select("stripe_customer_id")
        .eq("user_id", user.id)
        .maybeSingle();

    let stripeCustomerId = subRow?.stripe_customer_id as string | null;

    // 3) If no Stripe customer yet, create one and store it
    if (!stripeCustomerId) {
        const customer = await stripe.customers.create({
            email: user.email ?? undefined,
            metadata: {
                supabase_user_id: user.id,
            },
        });

        stripeCustomerId = customer.id;

        if (subRow) {
            // row exists, just update it
            await supabase.functions.invoke('update-user-stripeId', {
                body: { 
                    userId: user.id, 
                    stripeCustomerId
                 },
                headers: {
                    "Content-Type": "application/json",
                    "x-ghostsweep-secret": process.env.UPDATE_STRIPE_CUSTOMER_SECRET!,
                },
            })
        } 
    }

    // 4) Create PaymentIntent for GhostSweep Pro (monthly)
    const paymentIntent = await stripe.paymentIntents.create({
        amount: PRO_MONTHLY_PRICE_CENTS,
        currency: "usd",
        customer: stripeCustomerId,
        automatic_payment_methods: {
            enabled: true,
        },
        metadata: {
            product: "GhostSweep Pro",
            billing_interval: "monthly",
            supabase_user_id: user.id, // used in webhook to upgrade plan
            type: "one_time_checkout",
        },
    });

    if (!paymentIntent.client_secret) {
        throw new Error("Failed to create payment intent");
    }

    return (
        <main className="min-h-screen flex items-center justify-center bg-background text-foreground px-4">
            <div className="w-full max-w-3xl mx-auto rounded-2xl border border-white/10 bg-[#050505] p-6 shadow-lg">
                <h1 className="text-2xl font-semibold tracking-tight">
                    Upgrade to GhostSweep Pro
                </h1>
                <p className="mt-2 text-sm text-muted-foreground max-w-xl">
                    Go Pro for deeper sweeps, full breach visibility, and privacy tools
                    that help you clean up your digital footprint.
                </p>

                <div className="mt-6 rounded-xl border border-white/10 bg-[#080808] p-4">
                    <div className="flex items-baseline justify-between gap-4">
                        <div>
                            <p className="text-sm font-medium text-primary">GhostSweep Pro</p>
                            <p className="mt-1 text-3xl font-semibold">
                                $6.99
                                <span className="text-sm font-normal text-muted-foreground">
                                    {" "}
                                    / month
                                </span>
                            </p>
                        </div>
                        <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                            Monthly plan
                        </span>
                    </div>

                    <ul className="mt-4 space-y-1.5 text-xs text-muted-foreground">
                        <li>• Unlimited sweeps</li>
                        <li>• View all connected services and breach history</li>
                        <li>• Data removal email templates & privacy tools</li>
                        <li>• Priority checks and future Pro features</li>
                    </ul>
                </div>

                {/* Checkout form */}
                <div className="mt-8 max-w-md">
                    <p className="text-sm text-muted-foreground mb-2">
                        You&apos;re upgrading to{" "}
                        <span className="font-medium text-primary">$6.99 / month</span>.
                    </p>
                    <CheckoutForm clientSecret={paymentIntent.client_secret} />
                </div>

                <div className="mt-4 flex flex-col gap-1 text-xs text-muted-foreground">
                    <span>
                        Payments are securely processed by Stripe. GhostSweep never stores
                        your card details.
                    </span>
                    <span>
                        This environment is in Stripe test mode. Use a test card such as{" "}
                        <code>4242 4242 4242 4242</code> while integrating.
                    </span>
                </div>
            </div>
        </main>
    );
}