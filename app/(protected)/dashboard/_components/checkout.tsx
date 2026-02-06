"use client";

import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Loader2 } from "lucide-react";

export default function CheckoutForm({
    priceId,
}: {
    priceId: string;
}) {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const referralCode =
                typeof window !== "undefined"
                    ? localStorage.getItem("referral_code")
                    : null;
            const response = await fetch("/api/stripe/checkout_sessions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    price_id: priceId,
                    ...(referralCode ? { referral_code: referralCode } : {}),
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to create checkout session");
            }

            // Redirect to Stripe Checkout
            if (data.url) {
                window.location.href = data.url;
            } else {
                throw new Error("No checkout URL returned");
            }
        } catch (err) {
            console.error("Checkout error:", err);
            setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-3">
            {error && (
                <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-200">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Redirecting to Stripe...
                        </>
                    ) : (
                        "Continue to payment"
                    )}
                </Button>
            </form>

            <p className="text-center text-xs text-muted-foreground">
                You&apos;ll be redirected to Stripe&apos;s secure checkout
            </p>
        </div>
    );
}