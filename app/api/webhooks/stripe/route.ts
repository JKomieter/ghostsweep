// app/api/webhooks/stripe/route.ts
import { NextResponse } from "next/server"
import { headers } from "next/headers"
import Stripe from "stripe"
import { stripe } from "@/lib/stripe"
import { createClient } from "@/utils/supabase/server"

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

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
  let event: Stripe.Event
  const supabase = await createClient()

  try {
    // 🔥 FIX: Get raw body as text (not JSON)
    const body = await req.text()

    // 🔥 FIX: Get signature from headers (await the headers call)
    const headersList = await headers()
    const signature = headersList.get("stripe-signature")

    if (!signature) {
      console.error("❌ No Stripe signature found")
      return NextResponse.json(
        { error: "No signature" },
        { status: 400 }
      )
    }

    // 🔥 Verify webhook signature with raw body
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)

    console.log(`✅ Verified Stripe webhook: ${event.type}`)

  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error"
    console.error("❌ Stripe Webhook Signature Error:", msg)
    return NextResponse.json(
      { error: `Webhook Error: ${msg}` },
      { status: 400 }
    )
  }

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

        // Create welcome notification
        const { error: notifError } = await supabase
          .from("user_notifications")
          .insert({
            user_id: supabaseUserId,
            type: "plan_upgraded",
            title: "Welcome to Professional! 🎉",
            message: "Your GhostSweep Professional plan is now active. Enjoy unlimited scans, breach detection, and AI-powered deletion templates.",
            read: false,
            created_at: new Date().toISOString(),
          })

        if (notifError) {
          console.warn("⚠️ Failed to create notification:", notifError)
        }

        console.log(`✨ User ${supabaseUserId} upgraded to Pro (renews: ${renewsAt})`)
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

        const { error: notifError } = await supabase
          .from("user_notifications")
          .insert({
            user_id: subRow.user_id,
            type: "plan_downgraded",
            title: "Subscription Canceled",
            message: "Your Professional plan has been canceled. You've been moved to the Free plan. You can resubscribe anytime from the billing page.",
            read: false,
            created_at: new Date().toISOString(),
          })

        if (notifError) {
          console.warn("⚠️ Failed to create notification:", notifError)
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

        const { error: notifError } = await supabase
          .from("user_notifications")
          .insert({
            user_id: subRow.user_id,
            type: "payment_failed",
            title: "Payment Failed",
            message: "Your payment couldn't be processed. Please update your payment method to keep your Professional plan active.",
            read: false,
            created_at: new Date().toISOString(),
          })

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

// 🔥 IMPORTANT: Remove this if it exists
// export const config = {
//   api: {
//     bodyParser: false,
//   },
// }