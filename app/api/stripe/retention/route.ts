import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import stripe from "@/lib/stripe";
import { RECOVERABLE_VALUE_TYPES } from "@/lib/found-values";
import { isAccountRow } from "@/lib/account-risk";
import { PAID_PLANS } from "@/lib/plans";

// Save-before-cancel flow. GET returns what GhostSweep has done for the user plus the offers they
// qualify for; POST applies one, or hands back a billing-portal link straight to cancellation.

export type RetentionOffer = "pause" | "discount" | "annual";

export type RetentionResponse = {
    interval: "month" | "year";
    offers: RetentionOffer[];
    value: { foundDollars: number; accounts: number; closed: number };
};

const PAUSE_DAYS = 30;
// One save offer per customer in this window, so the cancel button can't be farmed for discounts
const OFFER_COOLDOWN_DAYS = 180;
const RETENTION_COUPON_ID = "ghostsweep-stay-50-once";
const OFFER_USED_KEY = "retention_offer_used_at";

async function loadContext(userId: string) {
    const supabase = await createClient();
    const { data: sub } = await supabase
        .from("user_subscriptions")
        .select("stripe_customer_id")
        .eq("user_id", userId)
        .maybeSingle();

    const customerId = sub?.stripe_customer_id as string | undefined;
    if (!customerId) return { supabase, customer: null, subscription: null };

    const [customer, subs] = await Promise.all([
        stripe.customers.retrieve(customerId),
        stripe.subscriptions.list({ customer: customerId, status: "active", limit: 1 }),
    ]);
    if ((customer as Stripe.DeletedCustomer).deleted) return { supabase, customer: null, subscription: null };

    return { supabase, customer: customer as Stripe.Customer, subscription: subs.data[0] ?? null };
}

function offersFor(customer: Stripe.Customer, subscription: Stripe.Subscription): RetentionOffer[] {
    const usedAt = Number(customer.metadata?.[OFFER_USED_KEY] ?? 0);
    if (usedAt && Date.now() - usedAt < OFFER_COOLDOWN_DAYS * 24 * 60 * 60 * 1000) return [];
    if (subscription.pause_collection) return []; // already paused

    const interval = subscription.items.data[0]?.price.recurring?.interval;
    // Half price only makes sense as "one month"; annual subscribers get the pause instead
    return interval === "month" ? ["discount", "pause", "annual"] : ["pause"];
}

async function ensureRetentionCoupon() {
    try {
        await stripe.coupons.retrieve(RETENTION_COUPON_ID);
    } catch (err) {
        if ((err as { code?: string })?.code !== "resource_missing") throw err;
        await stripe.coupons.create({
            id: RETENTION_COUPON_ID,
            percent_off: 50,
            duration: "once",
            name: "50% off your next month",
        });
    }
}

export async function GET() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { customer, subscription } = await loadContext(user.id);
    if (!customer || !subscription) {
        return NextResponse.json({ error: "No active subscription" }, { status: 404 });
    }

    // What the user would be walking away from
    const [values, services, deletions] = await Promise.all([
        supabase.from("found_values").select("amount, status, risk_level")
            .eq("user_id", user.id).in("type", [...RECOVERABLE_VALUE_TYPES]).in("status", ["active", "recovered"]),
        supabase.from("user_services").select("id, is_spam, services!inner(category)").eq("user_id", user.id),
        supabase.from("deletion_requests").select("id", { count: "exact", head: true }).eq("user_id", user.id),
    ]);
    const foundCents = (values.data ?? [])
        .filter((v) => v.risk_level !== "high_risk")
        .reduce((sum, v) => sum + (Number(v.amount) || 0), 0);

    const payload: RetentionResponse = {
        interval: subscription.items.data[0]?.price.recurring?.interval === "year" ? "year" : "month",
        offers: offersFor(customer, subscription),
        value: {
            foundDollars: Math.round(foundCents / 100),
            accounts: (services.data ?? []).filter((s) => isAccountRow(s, s.services)).length,
            closed: deletions.count ?? 0,
        },
    };
    return NextResponse.json(payload);
}

export async function POST(req: NextRequest) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { action } = (await req.json().catch(() => ({}))) as { action?: RetentionOffer | "cancel" };

    const { customer, subscription } = await loadContext(user.id);
    if (!customer || !subscription) {
        return NextResponse.json({ error: "No active subscription" }, { status: 404 });
    }

    try {
        if (action === "cancel") {
            // Straight to Stripe's cancel confirmation, skipping the rest of the portal
            const portal = await stripe.billingPortal.sessions.create({
                customer: customer.id,
                return_url: process.env.NODE_ENV === "development"
                    ? "http://localhost:3000/dashboard/settings"
                    : "https://www.ghostsweep.com/dashboard/settings",
                flow_data: {
                    type: "subscription_cancel",
                    subscription_cancel: { subscription: subscription.id },
                },
            });
            return NextResponse.json({ url: portal.url });
        }

        if (!action || !offersFor(customer, subscription).includes(action)) {
            return NextResponse.json({ error: "Offer not available" }, { status: 400 });
        }

        let message: string;
        if (action === "pause") {
            const resumesAt = Math.floor(Date.now() / 1000) + PAUSE_DAYS * 24 * 60 * 60;
            await stripe.subscriptions.update(subscription.id, {
                pause_collection: { behavior: "void", resumes_at: resumesAt },
            });
            message = `Billing paused for ${PAUSE_DAYS} days. Your data and monitoring stay in place.`;
        } else if (action === "discount") {
            await ensureRetentionCoupon();
            await stripe.subscriptions.update(subscription.id, {
                discounts: [{ coupon: RETENTION_COUPON_ID }],
            });
            message = "Done. Your next month is 50% off.";
        } else {
            const annualPrice = process.env.STRIPE_PRICE_SENTINEL;
            if (!annualPrice) throw new Error("STRIPE_PRICE_SENTINEL is not set");
            await stripe.subscriptions.update(subscription.id, {
                items: [{ id: subscription.items.data[0].id, price: annualPrice }],
                proration_behavior: "create_prorations",
            });
            // Changing the interval starts a new yearly period, so Stripe invoices now (minus unused time)
            message = `Switched to ${PAID_PLANS.sentinel.name}. Today's charge is ${PAID_PLANS.sentinel.price} minus the unused part of this month.`;
        }

        await stripe.customers.update(customer.id, {
            metadata: { [OFFER_USED_KEY]: String(Date.now()), retention_offer: action },
        });

        return NextResponse.json({ success: true, message });
    } catch (err) {
        console.error("Retention action failed:", action, err);
        return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
    }
}
