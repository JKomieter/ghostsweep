// app/api/webhooks/stripe/route.ts
import { NextResponse } from "next/server"
import Stripe from "stripe"
import { createClient } from "@/utils/supabase/server"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const MONTHLY_PRICE_ID = "price_1SVNdMK2SUgcYUhjVOPOghzk"

function getNextMonthDate(): string {
  const now = new Date()
  return new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    now.getDate()
  ).toISOString()
}

function getNextYearDate(): string {
  const now = new Date()
  return new Date(
    now.getFullYear() + 1,
    now.getMonth(),
    now.getDate()
  ).toISOString()
}

function getRenewalDate(priceId: string): string {
  return priceId === MONTHLY_PRICE_ID ? getNextMonthDate() : getNextYearDate()
}

export async function POST(req: Request) {
  let event: Stripe.Event;

  try {
    const signature = req.headers.get("stripe-signature");

    if (!signature) {
      console.error("❌ Missing Stripe signature");
      return NextResponse.json({ error: "Missing Stripe signature" }, { status: 400 });
    }

    event = stripe.webhooks.constructEvent(
      await req.text(),
      signature as string,
      process.env.STRIPE_WEBHOOK_SECRET as string
    );
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    if (err! instanceof Error) console.log(err);
    console.log(`❌ Error message: ${errorMessage}`);
    return NextResponse.json(
      { message: `Webhook Error: ${errorMessage}` },
      { status: 400 }
    );
  }

  const supabase = await createClient()

  try {
    switch (event.type) {
      // ================================================================
      // CHECKOUT SESSION COMPLETED
      // ================================================================
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session
        const supabaseUserId = session.metadata?.supabase_user_id

        if (!supabaseUserId) {
          console.warn("⚠️ checkout.session.completed missing supabase_user_id")
          break
        }

        const stripeCustomerId = session.customer as string
        const priceId = session.metadata?.price_id || ""
        const renewsAt = getRenewalDate(priceId)

        console.log(`✅ Checkout completed for user ${supabaseUserId}`)

        // Update subscription via Edge Function
        const { error: updateError } = await supabase.functions.invoke(
          "renew-user-subscription",
          {
            body: {
              userId: supabaseUserId,
              stripeCustomerId,
              renewsAt,
            },
            headers: {
              "x-ghostsweep-secret": process.env.FUNCTION_SECRET!
            }
          }
        )

        if (updateError) {
          console.error("❌ Error updating subscription:", updateError)
        }

        console.log(`✨ User ${supabaseUserId} upgraded to Pro (renews: ${renewsAt})`)
        break
      }

      // ================================================================
      // 🔥 TRIAL WILL END (3 days before trial ends)
      // ================================================================
      case "customer.subscription.trial_will_end": {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        // Find user by Stripe customer ID
        const { data: subRow, error: findError } = await supabase
          .from("user_subscriptions")
          .select("user_id")
          .eq("stripe_customer_id", customerId)
          .maybeSingle()

        if (findError || !subRow) {
          console.warn(`⚠️ No user found for customer ${customerId}`)
          break
        }

        const trialEndDate = subscription.trial_end
          ? new Date(subscription.trial_end * 1000).toISOString()
          : null

        // Call edge function to handle trial ending reminder
        const { error: trialError } = await supabase.functions.invoke(
          "trial-will-end-notification",
          {
            body: {
              userId: subRow.user_id,
              trialEndDate,
            },
            headers: {
              "x-ghostsweep-secret": process.env.FUNCTION_SECRET!
            }
          }
        )

        if (trialError) {
          console.error("❌ Error sending trial reminder:", trialError)
        }

        console.log(`⏰ Trial ending soon for user ${subRow.user_id} (ends: ${trialEndDate})`)
        break
      }

      // ================================================================
      // SUBSCRIPTION UPDATED
      // ================================================================
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        const { data: subRow, error: findError } = await supabase
          .from("user_subscriptions")
          .select("user_id")
          .eq("stripe_customer_id", customerId)
          .maybeSingle()

        if (findError || !subRow) {
          console.warn(`⚠️ No user found for customer ${customerId}`)
          break
        }

        const isActive = subscription.status === "active"
        const renewsAt = isActive
          ? new Date(subscription.items.data[0].current_period_end * 1000).toISOString()
          : null

        const { error: updateError } = await supabase.functions.invoke(
          "renew-user-subscription",
          {
            body: {
              userId: subRow.user_id,
              stripeCustomerId: customerId,
              renewsAt,
            },
            headers: {
              "x-ghostsweep-secret": process.env.FUNCTION_SECRET!
            }
          }
        )

        if (updateError) {
          console.error("❌ Error updating subscription:", updateError)
        }

        console.log(`✅ Subscription updated for user ${subRow.user_id} (status: ${subscription.status})`)
        break
      }

      // ================================================================
      // SUBSCRIPTION DELETED (Canceled)
      // ================================================================
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        const { data: subRow, error: findError } = await supabase
          .from("user_subscriptions")
          .select("user_id")
          .eq("stripe_customer_id", customerId)
          .maybeSingle()

        if (findError || !subRow) {
          console.warn(`⚠️ No user found for customer ${customerId}`)
          break
        }

        const { error: updateError } = await supabase.functions.invoke('downgrade-user-subscription', {
          body: {
            userId: subRow.user_id,
          },
          headers: {
            "x-ghostsweep-secret": process.env.FUNCTION_SECRET!
          }
        })

        if (updateError) {
          console.error("❌ Error downgrading user:", updateError)
        }

        console.log(`✅ User ${subRow.user_id} downgraded to Free`)
        break
      }

      // ================================================================
      // PAYMENT FAILED
      // ================================================================
      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice
        const customerId = invoice.customer as string

        const { data: subRow, error: findError } = await supabase
          .from("user_subscriptions")
          .select("user_id")
          .eq("stripe_customer_id", customerId)
          .maybeSingle()

        if (findError || !subRow) {
          console.warn(`⚠️ No user found for customer ${customerId}`)
          break
        }

        const { error: notifError } = await supabase.functions.invoke(
          'payment-failed-notification',
          {
            body: {
              userId: subRow.user_id,
            },
            headers: {
              "x-ghostsweep-secret": process.env.FUNCTION_SECRET!
            }
          }
        )

        if (notifError) {
          console.warn("⚠️ Failed to create notification:", notifError)
        }

        console.log(`⚠️ Payment failed for user ${subRow.user_id}`)
        break
      }

      default:
        console.log(`🔔 Unhandled Stripe event: ${event.type}`)
    }

    return NextResponse.json({ received: true }, { status: 200 })

  } catch (err) {
    console.error("❌ Stripe Webhook Handler Error:", err)
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    )
  }
}
