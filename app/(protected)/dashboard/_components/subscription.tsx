"use client";

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, Crown } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";


export default function SubscriptionModal({
    open,
    onOpenChangeAction,
}: {
    open: boolean;
    onOpenChangeAction: React.Dispatch<React.SetStateAction<boolean>>;
}) {
    const [billingLoading ] = useState(false);
    const [billingError] = useState<string | null>(null);

    // Load plan when modal opens
    const {data, status} = useQuery({
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

    const handleUpgrade = () => {
        // TODO: replace with your Stripe Checkout / upgrade flow
        // e.g. window.location.href = "/api/create-checkout-session"
        window.location.href = "/dashboard/billing";
    };

    const handleManageBilling = async () => {
        try {
            const res = await fetch('/api/stripe/customer_portal_session', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!res.ok) {
                throw new Error('Failed to create billing portal session');
            }

            const data = await res.json();
            window.location.href = data.url;
        } catch (error) {
            toast.error('Could not open billing portal. Please try again later.');
            console.error('Error managing billing:', error);
        }
    };
    const loading = status === "pending"
    const isPro = data?.current_plan === "pro";

    const renewalLabel = isPro 

    return (
        <Dialog open={open} onOpenChange={onOpenChangeAction}>
            <DialogContent className="sm:max-w-md bg-[#0f0f0f] border border-white/10">
                <DialogHeader>
                    <DialogTitle className="text-lg flex items-center gap-2">
                        <Crown className="h-4 w-4 text-yellow-400" />
                        Subscription & Billing
                    </DialogTitle>
                    <DialogDescription className="text-xs text-muted-foreground">
                        View your current GhostSweep plan, renewal date, and manage billing.
                    </DialogDescription>
                </DialogHeader>

                <div className="mt-4 space-y-6">
                    {/* Plan status */}
                    <div className="space-y-2">
                        <p className="text-xs font-medium text-muted-foreground">
                            Current plan
                        </p>

                        {loading ? (
                            <div className="flex items-center gap-2">
                                <Skeleton className="h-6 w-24 rounded-full bg-white/10" />
                            </div>
                        ) : data ? (
                            <div className="flex items-center gap-2">
                                <Badge
                                    className={
                                        isPro
                                            ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/40"
                                            : "bg-zinc-700/40 text-zinc-100 border border-zinc-500/40"
                                    }
                                >
                                    {isPro ? "Professional" : "Free"}
                                </Badge>
                                {isPro ? (
                                    <span className="text-xs text-muted-foreground">
                                        Billed via Stripe
                                    </span>
                                ) : (
                                    <span className="text-xs text-muted-foreground">
                                        You’re on the free plan. Upgrade to unlock full sweeps and
                                        breach reports.
                                    </span>
                                )}
                            </div>
                        ) : (
                            <p className="text-xs text-red-400">
                                Couldn’t load your plan. Please try again.
                            </p>
                        )}

                        {status == "error" && (
                            <p className="flex items-center gap-1 text-[11px] text-red-400">
                                <AlertCircle className="h-3 w-3" />
                                Problem gettiing your current plan
                            </p>
                        )}
                    </div>

                    {/* Renewal info (Pro only) */}
                    {isPro && (
                        <div className="space-y-1">
                            <p className="text-xs font-medium text-muted-foreground">
                                Renewal date
                            </p>
                            <p className="text-sm text-white">
                                {renewalLabel ?? "Next renewal date unavailable"}
                            </p>
                            <p className="text-[11px] text-muted-foreground">
                                Your subscription will renew automatically unless cancelled via
                                the billing portal.
                            </p>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="space-y-2">
                        {/* Upgrade button for Free users */}
                        {!isPro && (
                            <Button className="w-full justify-center" variant="outline" size="sm" onClick={handleUpgrade} disabled={loading}>
                                Upgrade to Professional
                            </Button>
                        )}

                        {/* Manage billing for Pro users */}
                        {isPro && (
                            <Button
                                className="w-full justify-center"
                                size="sm"
                                variant="outline"
                                onClick={handleManageBilling}
                                disabled={billingLoading}
                            >
                                {billingLoading ? "Opening billing portal..." : "Manage billing"}
                            </Button>
                        )}

                        {/* Small note */}
                        <p className="text-[11px] text-muted-foreground mt-1">
                            All payments are processed securely by Stripe. You can cancel or
                            change your plan anytime.
                        </p>

                        {billingError && (
                            <p className="flex items-center gap-1 text-[11px] text-red-400">
                                <AlertCircle className="h-3 w-3" />
                                {billingError}
                            </p>
                        )}
                    </div>

                    {/* Footer: Close */}
                    <div className="flex justify-end pt-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onOpenChangeAction(false)}
                        >
                            Close
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}