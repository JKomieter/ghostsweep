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
      // CHECKOUT COMPLETED - First time user subscribes
      // Edge function will auto-detect if new user and add 3-day trial
      // ================================================================
      case "checkout.session.completed": {
        const session = event.data.object
        const supabaseUserId = session.metadata?.supabase_user_id

        if (!supabaseUserId) {
          console.warn("⚠️ checkout.session.completed missing supabase_user_id")
          break
        }

        const stripeCustomerId = session.customer as string
        const subscriptionId = session.subscription as string

        // Get the actual subscription to get the current_period_end
        const subscription = await stripe.subscriptions.retrieve(subscriptionId)
        const priceId = subscription.items.data[0].price.id
        
        // Calculate when the subscription would normally renew (before trial extension)
        const renewsAt = subscription.items.data[0].current_period_end
          ? new Date(subscription.items.data[0].current_period_end * 1000).toISOString()
          : getRenewalDate(priceId)

        console.log(`✅ Checkout completed for user ${supabaseUserId}`)

        // Handle referral credits
        const referrerStripeCustomerId = session.metadata?.referrer_stripe_customer_id
        const referrerSupabaseId = session.metadata?.referrer_supabase_id

        if (referrerStripeCustomerId && referrerSupabaseId) {
          const REFERRAL_REWARD_CENTS = 1999; // $19.99

          try {
            // 1. Apply credit to Stripe
            await stripe.customers.createBalanceTransaction(
              referrerStripeCustomerId,
              {
                amount: -REFERRAL_REWARD_CENTS,
                currency: 'usd',
                description: `Referral reward for bringing in user ${supabaseUserId}`,
              }
            );

            console.log(`💰 $19.99 credit added to Stripe for ${referrerStripeCustomerId}`);

            // 2. Update Supabase
            const { error: edgeError } = await supabase.functions.invoke('update-referral-credits', {
              body: {
                referrerUserId: referrerSupabaseId,
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

        // Edge function will detect if first-time user and extend renewsAt by 3 days
        const { data: updateData, error: updateError } = await supabase.functions.invoke(
          "update-subscription",
          {
            body: {
              userId: supabaseUserId,
              stripeCustomerId,
              renewsAt, // Edge function will extend this if first-time user
            },
            headers: {
              "x-ghostsweep-secret": process.env.FUNCTION_SECRET!
            }
          }
        )

        if (updateError) {
          console.error("❌ Error updating subscription:", updateError)
        } else {
          const wasExtended = updateData?.trial_extended ? " (3-day trial added)" : ""
          console.log(`✨ User ${supabaseUserId} subscribed${wasExtended}`)
        }

        break
      }

      // ================================================================
      // TRIAL WILL END - Fires 3 days before trial ends
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

        const trialEndDate = subscription.trial_end
          ? new Date(subscription.trial_end * 1000).toISOString()
          : null

        const { error: trialError } = await supabase.functions.invoke(
          "trial-will-end-notification",
          {
            body: {
              userId: data.userId,
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

        console.log(`⏰ Trial notification sent for user ${data.userId} (ends: ${trialEndDate})`)
        break
      }

      // ================================================================
      // SUBSCRIPTION UPDATED - Fires when subscription changes
      // This handles: plan changes, trial → paid conversion, renewals
      // ================================================================
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        const { data, error } = await supabase.functions.invoke('get-userId-by-stripe', {
          body: { stripeCustomerId: customerId },
          headers: {
            "x-ghostsweep-secret": process.env.FUNCTION_SECRET!
          }
        })

        if (error || !data?.userId) {
          console.error(`❌ Subscription updated but no user found for customer ${customerId}:`, error)
          break
        }

        // Check if this is a trial → paid conversion
        const previousAttributes = event.data.previous_attributes
        const wasInTrial = previousAttributes?.status === 'trialing'
        const isNowActive = subscription.status === 'active'

        const currentPeriodEnd = subscription.items.data[0].current_period_end
        const renewsAt = currentPeriodEnd
          ? new Date(currentPeriodEnd * 1000).toISOString()
          : getNextMonthDate()

        // Only update if subscription is active or past_due
        if (subscription.status === 'active' || subscription.status === 'past_due') {
          const { error: updateError } = await supabase.functions.invoke(
            "update-subscription",
            {
              body: {
                userId: data.userId,
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

          if (wasInTrial && isNowActive) {
            console.log(`✅ User ${data.userId} converted from trial to paid (renews: ${renewsAt})`)
          } else {
            console.log(`✅ Subscription updated for user ${data.userId} (status: ${subscription.status})`)
          }
        } else {
          console.log(`ℹ️ Subscription update ignored (status: ${subscription.status})`)
        }

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
          console.error(`❌ Subscription deleted but no user found for customer ${customerId}:`, error)
          break
        }

        const { error: updateError } = await supabase.functions.invoke(
          'downgrade-user-subscription',
          {
            body: {
              userId: data.userId,
            },
            headers: {
              "x-ghostsweep-secret": process.env.FUNCTION_SECRET!
            }
          }
        )

        if (updateError) {
          console.error("❌ Error downgrading user:", updateError)
        }

        console.log(`✅ User ${data.userId} downgraded to Free`)
        break
      }

      // // ================================================================
      // // PAYMENT SUCCEEDED - Renewal payment succeeded
      // // ================================================================
      // case "invoice.payment_succeeded": {
      //   const invoice = event.data.object as Stripe.Invoice
      //   const customerId = invoice.customer as string

      //   // Skip if this is the first invoice (already handled by checkout.session.completed)
      //   if (invoice.billing_reason === 'subscription_create') {
      //     console.log(`ℹ️ Skipping initial invoice for customer ${customerId}`)
      //     break
      //   }

      //   const { data, error } = await supabase.functions.invoke('get-userId-by-stripe', {
      //     body: { stripeCustomerId: customerId },
      //     headers: {
      //       "x-ghostsweep-secret": process.env.FUNCTION_SECRET!
      //     }
      //   })

      //   if (error || !data?.userId) {
      //     console.error(`❌ Payment succeeded but no user found for customer ${customerId}:`, error)
      //     break
      //   }

      //   const subscriptionId = invoice.subscription as string
      //   if (subscriptionId) {
      //     const subscription = await stripe.subscriptions.retrieve(subscriptionId)
      //     const renewsAt = new Date(subscription.current_period_end * 1000).toISOString()

      //     const { error: updateError } = await supabase.functions.invoke(
      //       "update-subscription",
      //       {
      //         body: {
      //           userId: data.userId,
      //           stripeCustomerId: customerId,
      //           renewsAt,
      //         },
      //         headers: {
      //           "x-ghostsweep-secret": process.env.FUNCTION_SECRET!
      //         }
      //       }
      //     )

      //     if (updateError) {
      //       console.error("❌ Error updating subscription after payment:", updateError)
      //     }

      //     console.log(`✅ Payment succeeded for user ${data.userId} (next renewal: ${renewsAt})`)
      //   }

      //   break
      // }

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

        const { error: notifError } = await supabase.functions.invoke(
          'payment-failed-notification',
          {
            body: {
              userId: data.userId,
            },
            headers: {
              "x-ghostsweep-secret": process.env.FUNCTION_SECRET!
            }
          }
        )

        if (notifError) {
          console.warn("⚠️ Failed to create notification:", notifError)
        }

        console.log(`⚠️ Payment failed for user ${data.userId}`)
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
