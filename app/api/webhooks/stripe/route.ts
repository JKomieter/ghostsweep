// app/api/webhooks/stripe/route.ts
import { NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import Stripe from "stripe"
import stripe from "@/lib/stripe"

const MONTHLY_PRICE_ID = "price_1SwHKrK2SUgcYUhjU6WHuXUn"

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
      // CHECKOUT COMPLETED - First time user subscribes (with trial)
      // This fires when user completes checkout and subscription is created
      // ================================================================
      case "checkout.session.completed": {
        const session = event.data.object 
        const supabaseUserId = session.metadata?.supabase_user_id
        
        if (!supabaseUserId) {
          console.warn("⚠️ checkout.session.completed missing supabase_user_id")
          break
        }

        const stripeCustomerId = session.customer as string
        const priceId = session.metadata?.price_id || ""
        const referralCode = session.metadata?.referral_code || null
        const referrerStripeCustomerId = session.metadata?.referrer_stripe_customer_id || null
        const renewsAt = getRenewalDate(priceId)

        console.log(`✅ Checkout completed for user ${supabaseUserId}`)

        if (referrerStripeCustomerId) {
          const REFERRAL_REWARD_CENTS = 1999; // $19.99

          try {
            // 1. Apply ONLY the incremental reward to Stripe
            await stripe.customers.createBalanceTransaction(
              referrerStripeCustomerId,
              {
                amount: -REFERRAL_REWARD_CENTS, // Just the $19.99, not the running total
                currency: 'usd',
                description: `Referral reward for bringing in user ${supabaseUserId}`,
              }
            );

            console.log(`💰 $19.99 credit added to Stripe for ${referrerStripeCustomerId}`);

            // 2. Update Supabase via Edge Function
            // We pass the STATIC amount to add, the edge function handles the math
            const { error: edgeError } = await supabase.functions.invoke('update-referral-credits', {
              body: {
                referrerUserId: session.metadata?.referrer_supabase_id, // Make sure you pass this in checkout metadata!
                referredUserId: supabaseUserId,
                creditsToAdd: REFERRAL_REWARD_CENTS
              },
              headers: {
                "x-ghostsweep-secret": process.env.FUNCTION_SECRET!
              }
            });

            if (edgeError) console.error("❌ Edge Function Error:", edgeError);

          } catch (stripeErr) {
            console.error("❌ Stripe Balance Error:", stripeErr);
          }
        }

        // Edge function will auto-detect if this is a new trial
        // and override renewsAt to 7 days if needed
        const { error: updateError } = await supabase.functions.invoke(
          "update-subscription",
          {
            body: {
              userId: supabaseUserId,
              stripeCustomerId,
              renewsAt, // Pass the normal renewal date; edge function will override if trial
            },
            headers: {
              "x-ghostsweep-secret": process.env.FUNCTION_SECRET!
            }
          }
        )

        if (updateError) {
          console.error("❌ Error updating subscription:", updateError)
        }

        console.log(`✨ User ${supabaseUserId} subscribed (renews: ${renewsAt})`)
        break
      }

      // ================================================================
      // TRIAL WILL END - Fires 3 days before trial ends
      // Stripe sends this automatically when trial_period_days is set
      // ================================================================
      case "customer.subscription.trial_will_end": {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        const { data, error } = await supabase.functions.invoke('get-userId-by-stripe', {
          body: { stripeCustomerId: customerId },
          headers: {
            "x-ghostsweep-secret": process.env.FUNCTION_SECRET!
          }
        })

        if (error || !data?.userId) {
          console.error(`❌ Trial ending but no user found for customer ${customerId}:`, error)
          break
        }

        const subRow = { user_id: data.userId }

        const trialEndDate = subscription.trial_end
          ? new Date(subscription.trial_end * 1000).toISOString()
          : null

        // Edge function checks if trial actually ended or just ending soon
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

        console.log(`⏰ Trial notification sent for user ${subRow.user_id} (ends: ${trialEndDate})`)
        break
      }

      // ================================================================
      // SUBSCRIPTION UPDATED - Fires when subscription changes
      // This includes: trial → paid, plan changes, cancellations scheduled
      // ================================================================
      case "customer.subscription.updated": {
        const subscription = event.data.object
        const customerId = subscription.customer as string
        
        const { data, error } = await supabase.functions.invoke('get-userId-by-stripe', {
          body: { stripeCustomerId: customerId },
          headers: {
            "x-ghostsweep-secret": process.env.FUNCTION_SECRET!
          }
        })

        if (error || !data?.userId) {
          console.error(`❌ Customer subscription updated but no user found for customer ${customerId}:`, error)
          break
        }

        const subRow = { user_id: data.userId }

        const currentPeriodEnd = subscription.items.data[0].current_period_end
        const priceId = subscription.items.data[0].price.id || subscription.items.data[0].plan.id

        const renewsAt = currentPeriodEnd ? new Date(currentPeriodEnd * 1000).toISOString() : getRenewalDate(priceId)

        // Edge function will detect if user was on trial and convert them
        const { error: updateError } = await supabase.functions.invoke(
          "update-subscription",
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
      // SUBSCRIPTION DELETED - User canceled and subscription ended
      // ================================================================
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        const { data, error } = await supabase.functions.invoke('get-userId-by-stripe', {
          body: { stripeCustomerId: customerId },
          headers: {
            "x-ghostsweep-secret": process.env.FUNCTION_SECRET!
          }
        })

        if (error || !data?.userId) {
          console.error(`❌ Customer subscription deleted but no user found for customer ${customerId}:`, error)
          break
        }

        const subRow = { user_id: data.userId }

        const { error: updateError } = await supabase.functions.invoke(
          'downgrade-user-subscription',
          {
            body: {
              userId: subRow.user_id,
            },
            headers: {
              "x-ghostsweep-secret": process.env.FUNCTION_SECRET!
            }
          }
        )

        if (updateError) {
          console.error("❌ Error downgrading user:", updateError)
        }

        console.log(`✅ User ${subRow.user_id} downgraded to Free`)
        break
      }

      // ================================================================
      // PAYMENT FAILED - Renewal payment failed
      // ================================================================
      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice
        const customerId = invoice.customer as string

        const { data, error } = await supabase.functions.invoke('get-userId-by-stripe', {
          body: { stripeCustomerId: customerId },
          headers: {
            "x-ghostsweep-secret": process.env.FUNCTION_SECRET!
          }
        })

        if (error || !data?.userId) {
          console.error(`❌ Payment failed but no user found for customer ${customerId}:`, error)
          break
        }

        const subRow = { user_id: data.userId }

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
        break
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
