// app/api/webhooks/stripe/route.ts
import { NextResponse } from "next/server"
import { headers } from "next/headers"
import Stripe from "stripe"
import { stripe } from "@/lib/stripe"
import { createClient } from "@/utils/supabase/server"

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

function getNextMonthDate() {
  const now = new Date()
  return new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    now.getDate()
  ).toISOString()
}

export async function POST(req: Request) {
  let event: Stripe.Event
  const supabase = await createClient()

  try {
    event = stripe.webhooks.constructEvent(
      await req.text(),
      (await headers()).get("stripe-signature")!,
      webhookSecret
    )
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error"
    console.error("❌ Stripe Webhook Signature Error:", msg)
    return NextResponse.json(
      { message: `Webhook Error: ${msg}` },
      { status: 400 }
    )
  }

  try {
    switch (event.type) {
      // ---------------------------------------------------------------------
      // PAYMENT SUCCESS → Upgrade user to Pro
      // ---------------------------------------------------------------------
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent

        const supabaseUserId = paymentIntent.metadata?.supabase_user_id
        const stripeCustomerId = paymentIntent.customer as string | null

        if (!supabaseUserId) {
          console.warn(
            "⚠️ payment_intent.succeeded missing supabase_user_id"
          )
          break
        }

        // 1) Update subscription in Supabase
        const { error } = await supabase.functions.invoke(
          "renew-user-subscription",
          {
            body: {
              userId: supabaseUserId,
              stripeCustomerId,
              renewsAt: getNextMonthDate(),
              secret: process.env.FUNCTION_SECRET!,
            },
            headers: {
              "x-ghostsweep-secret": process.env.FUNCTION_SECRET!
            }
          }
        )

        if (error) {
          console.error("❌ Error renewing subscription:", error)
          return NextResponse.json(
            { error: "Failed to update subscription" },
            { status: 500 }
          )
        }

        console.log(`✨ User ${supabaseUserId} upgraded to Pro.`)

        // -------------------------------------------------------------------
        // 2) Insert a plan-upgraded notification
        // -------------------------------------------------------------------
        const { error: notifError } = await supabase
          .from("user_notifications")
          .insert({
            user_id: supabaseUserId,
            type: "plan_upgraded",
            title: "You're now Pro!",
            message:
              "Your GhostSweep Professional plan is now active. Enjoy unlimited sweeps, deeper scans, and new account detection.",
            read: false,
            created_at: new Date().toISOString(),
          })

        if (notifError) {
          console.error("⚠️ Failed to insert plan upgrade notification:", notifError)
          // Do NOT throw — webhook must still succeed
        }

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