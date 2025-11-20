// app/api/webhooks/stripe/route.ts
import { NextResponse } from "next/server"
import { headers } from "next/headers"
import Stripe from "stripe"
import { stripe } from "@/lib/stripe"
import { createClient } from "@/utils/supabase/server"

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

function getNextMonthDate() {
    const now = new Date();
    return new Date(
        now.getFullYear(),
        now.getMonth() + 1,
        now.getDate()
    ).toISOString();
}

export async function POST(req: Request) {
    let event
    const supabase = await createClient()

    try {
        event = stripe.webhooks.constructEvent(
            await req.text(),
            (await headers()).get('stripe-signature')!,
            webhookSecret
        )
    } catch (err) {
        if (err instanceof Error) {
            const errorMessage = err.message
            // On error, log and return the error message.
            if (err) console.log(err)
            console.log(`Error message: ${errorMessage}`)
            return NextResponse.json(
                { message: `Webhook Error: ${errorMessage}` },
                { status: 400 }
            )
        }
        return NextResponse.json(
            { message: `Webhook Error` },
            { status: 400 }
        )
    }

  // Handle relevant event types
  try {
    switch (event.type) {
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent

        const supabaseUserId = paymentIntent.metadata?.supabase_user_id
        // const billingInterval = paymentIntent.metadata?.billing_interval || "monthly"
        const stripeCustomerId = paymentIntent.customer as string | null

        if (!supabaseUserId) {
          console.warn(
            "⚠️ payment_intent.succeeded without supabase_user_id metadata, skipping.",
          )
          break
        }

            const { error } = await supabase.functions.invoke('renew-user-subscription', {
                body: { 
                    userId: supabaseUserId,
                    stripeCustomerId,
                    renewsAt: getNextMonthDate()
                 },
            })

        if (error) {
          console.error("❌ Error updating user_subscriptions from webhook:", error)
          return NextResponse.json(
            { error: "Failed to update subscription" },
            { status: 500 },
          )
        }

        console.log(
          `✅ Upgraded user ${supabaseUserId} to Pro via payment_intent ${paymentIntent.id}`,
        )
        break
      }

      // You can add more types later if needed (refunds, cancellations, etc.)
      default: {
        console.log(`🔔 Unhandled Stripe event type: ${event.type}`)
      }
    }

    return NextResponse.json({ received: true }, { status: 200 })
  } catch (err) {
    console.error("❌ Error handling Stripe webhook:", err)
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 })
  }
}