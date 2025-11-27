"use client";

import { FormEvent, useState } from "react";
import {
    PaymentElement,
    useStripe,
    useElements,
    Elements
} from '@stripe/react-stripe-js'
import { Appearance, loadStripe } from '@stripe/stripe-js'
import { toast } from "sonner";
import Input from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";

// Make sure to call loadStripe outside of a component’s render to avoid
// recreating the Stripe object on every render.
// This is your test publishable API key.
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

const baseUrl = process.env.NODE_ENV === "production" ?
    "https://www.ghostsweep.com" : "http://localhost:3000"

function PaymentForm() {
    const stripe = useStripe();
    const elements = useElements();

    const [email, setEmail] = useState('');

    const { data, status } = useQuery({
        queryKey: ['plan'],
        queryFn: async (): Promise<{ current_plan: "free" | "pro" }> => {
            const res = await fetch('/api/plan', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!res.ok) {
                throw new Error('Failed to fetch plan data');
            }

            return res.json();
        },
    })

    const [message, setMessage] = useState<string>();
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        if (!stripe || !elements) {
            // Stripe.js hasn't yet loaded.
            // Make sure to disable form submission until Stripe.js has loaded.
            return;
        }

        if (data?.current_plan === "pro") {
            toast(() => (
                <div>
                    <p>
                        You’re already on GhostSweep Professional
                    </p>
                    <p className="text-sm">
                        Your account is already upgraded. You don’t need to purchase this plan again.
                    </p>
                </div>
            ))
        }

        setIsLoading(true);

        const { error } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                // Make sure to change this to your payment completion page
                return_url: `${baseUrl}/dashboard/billing/success`,
                receipt_email: email,
            },
        });

        // This point will only be reached if there is an immediate error when
        // confirming the payment. Otherwise, your customer will be redirected to
        // your `return_url`. For some payment methods like iDEAL, your customer will
        // be redirected to an intermediate site first to authorize the payment, then
        // redirected to the `return_url`.
        if (error.type === "card_error" || error.type === "validation_error") {
            setMessage(error.message);
            toast.error(error.message)
        } else {
            setMessage("An unexpected error occurred.");
            toast.error("An unexpected error occurred.")
        }

        setIsLoading(false);
    };

    return (
        <form id="payment-form" onSubmit={handleSubmit} className="space-y-2">
            <Input
                id="email"
                type="email"
                value={email}
                onChange={setEmail}
                placeholder="Enter email address"
            />
            <PaymentElement id="payment-element" options={{ layout: "accordion", }} />
            <Button disabled={isLoading || !stripe || !elements} id="submit" className="mt-2 w-full">
                <span id="button-text">
                    {isLoading ? <div className="spinner" id="spinner"></div> : "Pay now"}
                </span>
            </Button>
            {/* Show any error or success messages */}
            {message && <div id="payment-message">{message}</div>}
        </form>
    );
}

export default function CheckoutForm({ clientSecret }: {clientSecret: string}) {
    const appearance = {
        theme: 'night',
    } as Appearance;

    return (
        <Elements stripe={stripePromise} options={{ appearance, clientSecret }}>
            <PaymentForm />
        </Elements>
    )
}