"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Gift, Loader2, PauseCircle, Percent, CalendarRange } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ANNUAL_MONTHLY_EQUIVALENT, PAID_PLANS, planPriceCents } from "@/lib/plans";
import type { RetentionOffer, RetentionResponse } from "@/app/api/stripe/retention/route";

const usd = (cents: number) => `$${(cents / 100).toFixed(2)}`;

const OFFER_COPY: Record<RetentionOffer, { icon: typeof Gift; title: string; detail: string; cta: string }> = {
    discount: {
        icon: Percent,
        title: "Half price next month",
        detail: `Pay ${usd(planPriceCents("pro") / 2)} instead of ${PAID_PLANS.pro.price} for your next month.`,
        cta: "Take 50% off",
    },
    pause: {
        icon: PauseCircle,
        title: "Pause billing for 30 days",
        detail: "No charge for a month. Your data and monitoring stay in place.",
        cta: "Pause billing",
    },
    annual: {
        icon: CalendarRange,
        title: `Switch to ${PAID_PLANS.sentinel.name}`,
        detail: `Just ${ANNUAL_MONTHLY_EQUIVALENT}, billed yearly at ${PAID_PLANS.sentinel.price}.`,
        cta: "Switch to annual",
    },
};

export default function CancelFlowDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
    const queryClient = useQueryClient();
    const [pending, setPending] = useState<RetentionOffer | "cancel" | null>(null);

    const { data, status } = useQuery<RetentionResponse>({
        queryKey: ["retention"],
        queryFn: async () => {
            const res = await fetch("/api/stripe/retention");
            if (!res.ok) throw new Error("Failed to load");
            return res.json();
        },
        enabled: open,
        staleTime: 0,
    });

    const mutation = useMutation({
        mutationFn: async (action: RetentionOffer | "cancel") => {
            setPending(action);
            const res = await fetch("/api/stripe/retention", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action }),
            });
            const json = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(json?.error || "Something went wrong");
            return json as { url?: string; message?: string };
        },
        onSuccess: (result) => {
            if (result.url) {
                window.location.href = result.url;
                return;
            }
            toast.success(result.message ?? "Done");
            queryClient.invalidateQueries({ queryKey: ["plan"] });
            queryClient.invalidateQueries({ queryKey: ["retention"] });
            setPending(null);
            onOpenChange(false);
        },
        onError: (err: Error) => {
            toast.error(err.message);
            setPending(null);
        },
    });

    const value = data?.value;
    const busy = pending !== null;

    return (
        <Dialog open={open} onOpenChange={(o) => !busy && onOpenChange(o)}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader className="text-left">
                    <DialogTitle className="text-xl">Before you go</DialogTitle>
                    <DialogDescription>
                        Cancelling stops weekly sweeps, breach alerts and your weekly summary.
                    </DialogDescription>
                </DialogHeader>

                {status === "pending" ? (
                    <div className="flex justify-center py-8">
                        <Loader2 className="h-5 w-5 animate-spin text-foreground/40" />
                    </div>
                ) : status === "error" ? (
                    <p className="text-sm text-foreground/60">We couldn&apos;t load your offers. You can still cancel below.</p>
                ) : (
                    <>
                        {value && (value.foundDollars > 0 || value.accounts > 0) && (
                            <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-4">
                                {value.foundDollars > 0 && (
                                    <p className="flex items-center gap-2 text-base font-semibold text-foreground">
                                        <Gift className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                        We&apos;ve found ${value.foundDollars.toLocaleString()} for you
                                    </p>
                                )}
                                <p className="mt-1 text-sm text-foreground/65">
                                    {value.accounts.toLocaleString()} accounts discovered
                                    {value.closed > 0 ? `, ${value.closed.toLocaleString()} already closed` : ""}. New ones keep
                                    turning up, and we catch them weekly.
                                </p>
                            </div>
                        )}

                        {data && data.offers.length > 0 && (
                            <div className="space-y-2">
                                {data.offers.map((offer) => {
                                    const copy = OFFER_COPY[offer];
                                    const Icon = copy.icon;
                                    return (
                                        <div key={offer} className="flex items-center gap-3 rounded-lg border border-foreground/10 p-3">
                                            <Icon className="h-5 w-5 shrink-0 text-foreground/50" />
                                            <div className="min-w-0 flex-1">
                                                <div className="text-sm font-medium text-foreground">{copy.title}</div>
                                                <div className="text-xs text-foreground/55">{copy.detail}</div>
                                            </div>
                                            <Button
                                                size="sm"
                                                variant={offer === data.offers[0] ? "default" : "outline"}
                                                className={offer === data.offers[0] ? "bg-emerald-500 text-black hover:bg-emerald-400" : undefined}
                                                disabled={busy}
                                                onClick={() => mutation.mutate(offer)}
                                            >
                                                {pending === offer ? <Loader2 className="h-4 w-4 animate-spin" /> : copy.cta}
                                            </Button>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </>
                )}

                <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-between">
                    <Button variant="ghost" className="text-foreground/55" disabled={busy} onClick={() => mutation.mutate("cancel")}>
                        {pending === "cancel" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        No thanks, cancel
                    </Button>
                    <Button variant="outline" disabled={busy} onClick={() => onOpenChange(false)}>
                        Keep my plan
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
