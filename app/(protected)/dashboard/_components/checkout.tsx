"use client";

import { Button } from "@/components/ui/button";
import { useSyncExternalStore } from "react";
import { Loader2, Zap } from "lucide-react";
import { useCheckout } from "@/hooks/use-checkout";
import { PAID_PLANS, type PaidPlanId } from "@/lib/plans";

// Read once from storage; the server snapshot is false so hydration matches
const subscribeNoop = () => () => {};
function readHasReferral() {
    try {
        return Boolean(localStorage.getItem("referral_code"));
    } catch {
        return false;
    }
}

export default function CheckoutForm({ plan }: { plan: PaidPlanId }) {
    const { startCheckout, pendingPlan, error } = useCheckout();
    const hasReferral = useSyncExternalStore(subscribeNoop, readHasReferral, () => false);
    const isLoading = pendingPlan !== null;

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        startCheckout(plan);
    };

    return (
        <div className="space-y-3">
            {hasReferral && (
                <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                    <Zap className="h-4 w-4 fill-emerald-400" />
                    <span>Referral applied: <strong>50% off</strong> {PAID_PLANS[plan].mode === "payment" ? "your Buster Pass" : "your first payment"}!</span>
                </div>
            )}
            {error && (
                <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-800 dark:text-red-200">
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
