// app/api/webhooks/stripe/route.ts
import { NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import Stripe from "stripe"
import * as Sentry from "@sentry/nextjs"
import stripe from "@/lib/stripe"

const MONTHLY_PRICE_ID = process.env.STRIPE_PRICE_PRO!

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

// Errors here are caught and logged, so they never reach Sentry on their own — report them explicitly
function reportWebhookError(
  message: string,
  err: unknown,
  event?: Stripe.Event,
  extra?: Record<string, unknown>
) {
  console.error(`❌ ${message}:`, err)
  Sentry.withScope((scope) => {
    scope.setTag("webhook", "stripe")
    if (event) {
      scope.setTag("stripe_event_type", event.type)
      scope.setContext("stripe_event", { id: event.id, type: event.type, livemode: event.livemode })
    }
    if (extra) scope.setExtras(extra)
    scope.setExtra("message", message)
    if (err instanceof Error) {
      Sentry.captureException(err)
    } else {
      scope.setExtra("error", err)
      Sentry.captureMessage(message, "error")
    }
  })
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
    Sentry.captureException(err, {
      level: "warning",
      tags: { webhook: "stripe", stage: "signature_verification" },
    });
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
      // ================================================================
      case "checkout.session.completed": {
        const session = event.data.object
        const supabaseUserId = session.metadata?.supabase_user_id
        
        if (!supabaseUserId) {
          reportWebhookError("checkout.session.completed missing supabase_user_id", null, event, { sessionId: session.id })
          break
        }

        const stripeCustomerId = session.customer as string
        const subscriptionId = session.subscription as string

        // Get the actual subscription to get the current_period_end
        const subscription = await stripe.subscriptions.retrieve(subscriptionId)
        const priceId = subscription.items.data[0].price.id
        
        const renewsAt = subscription.items.data[0].current_period_end
          ? new Date(subscription.items.data[0].current_period_end * 1000).toISOString()
          : getRenewalDate(priceId)

        console.log(`✅ Checkout completed for user ${supabaseUserId}`)

        // Handle referral credits
        const referrerStripeCustomerId = session.metadata?.referrer_stripe_customer_id
        const referrerSupabaseId = session.metadata?.referrer_supabase_id

        if (referrerStripeCustomerId && referrerSupabaseId) {
          const REFERRAL_REWARD_CENTS = 799; // $7.99

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

            console.log(`💰 $7.99 credit added to Stripe for ${referrerStripeCustomerId}`);

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

            if (edgeError) {
              reportWebhookError("update-referral-credits failed", edgeError, event, { referrerSupabaseId, supabaseUserId });
            }

          } catch (stripeErr) {
            reportWebhookError("Stripe referral balance credit failed", stripeErr, event, { referrerStripeCustomerId, supabaseUserId });
          }
        }

        const { error: updateError } = await supabase.functions.invoke(
          "update-subscription",
          {
            body: {
              userId: supabaseUserId,
              stripeCustomerId,
              renewsAt,
              mode: session.mode, // "subscription" or "payment"
            },
            headers: {
              "x-ghostsweep-secret": process.env.FUNCTION_SECRET!
            }
          }
        )

        if (updateError) {
          reportWebhookError("update-subscription failed after checkout", updateError, event, { supabaseUserId, stripeCustomerId })
        } else {
          console.log(`✨ User ${supabaseUserId} subscribed`)
        }

        break
      }

      // ================================================================
      // SUBSCRIPTION UPDATED - Fires when subscription changes
      // This handles: plan changes, renewals
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
          reportWebhookError("Subscription updated but no user found", error, event, { customerId })
          break
        }

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
            reportWebhookError("update-subscription failed", updateError, event, { userId: data.userId, customerId })
          }

          console.log(`✅ Subscription updated for user ${data.userId} (status: ${subscription.status})`)
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
          reportWebhookError("Subscription deleted but no user found", error, event, { customerId })
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
          reportWebhookError("downgrade-user-subscription failed", updateError, event, { userId: data.userId, customerId })
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
          reportWebhookError("Payment failed but no user found", error, event, { customerId })
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
          reportWebhookError("payment-failed-notification failed", notifError, event, { userId: data.userId, customerId })
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
    reportWebhookError("Stripe webhook handler error", err, event)
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    )
  }
}
