// app/dashboard/billing/manage/page.tsx
import { redirect } from "next/navigation"
import { createClient } from "@/utils/supabase/server"
import { stripe } from "@/lib/stripe"

export const dynamic = "force-dynamic"

const baseUrl = process.env.NODE_ENV === "production" ?
    "https://www.ghostsweep.com" : "http://localhost:3000"

export default async function ManageBillingPage() {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect("/login")
    }

    // Get stripe_customer_id
    const { data: subRow, error } = await supabase
        .from("user_subscriptions")
        .select("stripe_customer_id")
        .eq("user_id", user.id)
        .maybeSingle()

    if (error || !subRow?.stripe_customer_id) {
        // no customer yet → just send them back to billing upgrade page
        redirect("/dashboard/billing")
    }

    // Create Stripe billing portal session
    const portalSession = await stripe.billingPortal.sessions.create({
        customer: subRow.stripe_customer_id,
        return_url: process.env.NEXT_PUBLIC_APP_URL
            ? `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`
            :  `${baseUrl}/dashboard`,
    })

    // Redirect straight to Stripe
    redirect(portalSession.url)
}