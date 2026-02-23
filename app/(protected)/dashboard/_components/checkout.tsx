"use client";

import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { Loader2, Zap, Clock } from "lucide-react";
import { toast } from "sonner";

export default function CheckoutForm({
    priceId,
    mode = "subscription",
}: {
    priceId: string;
    mode?: "subscription" | "payment";
}) {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [referralCode, setReferralCode] = useState<string | null>(null);

    useEffect(() => {
        if (typeof window !== "undefined") {
            const code = localStorage.getItem("referral_code");
            if (code) setReferralCode(code);
        }
    }, []);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch("/api/stripe/checkout_sessions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    price_id: priceId,
                    mode,
                    ...(referralCode ? { referral_code: referralCode } : {}),
                }),
            });

            if (response.status === 429) {
                const data = await response.json();
                toast.error("Premium Service Demand", {
                    description: data.message || "We're currently handling a high volume of requests.",
                    icon: <Clock className="h-4 w-4 text-red-500" />,
                    duration: 6000,
                });
                setIsLoading(false);
                return;
            }

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
            {referralCode && (
                <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm text-emerald-400 flex items-center gap-2">
                    <Zap className="h-4 w-4 fill-emerald-400" />
                    <span>Referral applied: <strong>50% off</strong> first month!</span>
                </div>
            )}
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