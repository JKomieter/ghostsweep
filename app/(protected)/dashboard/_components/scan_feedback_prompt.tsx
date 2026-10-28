"use client";

import { useEffect, useState } from "react";
import { Check, ExternalLink, Star } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export const TRUSTPILOT_REVIEW_URL =
    process.env.NEXT_PUBLIC_TRUSTPILOT_REVIEW_URL ?? "https://www.trustpilot.com/evaluate/ghostsweep.com";

// Let the "Sweep complete" toast and refreshed results land before asking.
const OPEN_DELAY_MS = 6000;

const RATING_LABELS = ["", "Not useful", "Could be better", "It was okay", "Pretty good", "Loved it"];

// Shown once after a successful scan that found something: a quick star rating and optional note
// for us, then an invitation (to everyone, whatever they rated) to review GhostSweep on Trustpilot.
export default function ScanFeedbackPrompt({ sweepId, servicesFound }: { sweepId: string | null; servicesFound: number }) {
    const [open, setOpen] = useState(false);
    const [step, setStep] = useState<"rate" | "thanks">("rate");
    const [rating, setRating] = useState(0);
    const [hovered, setHovered] = useState(0);
    const [note, setNote] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [copied, setCopied] = useState(false);

    // Once per account: the server decides whether this user has already answered or snoozed
    useEffect(() => {
        if (!sweepId || servicesFound <= 0) return;
        let cancelled = false;
        let timer: ReturnType<typeof setTimeout>;
        fetch("/api/feedback")
            .then((res) => (res.ok ? res.json() : { shouldAsk: false }))
            .then(({ shouldAsk }: { shouldAsk: boolean }) => {
                if (shouldAsk && !cancelled) timer = setTimeout(() => setOpen(true), OPEN_DELAY_MS);
            })
            .catch(() => {});
        return () => {
            cancelled = true;
            clearTimeout(timer);
        };
    }, [sweepId, servicesFound]);

    const close = (nextOpen: boolean) => {
        if (nextOpen) return;
        // Closing before rating counts as "not now"; after rating the server has marked it done
        if (step === "rate") {
            fetch("/api/feedback", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ dismissed: true }),
            }).catch(() => {});
        }
        setOpen(false);
    };

    const submit = async () => {
        if (!rating) return;
        setSubmitting(true);
        try {
            const res = await fetch("/api/feedback", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ rating, note, sweepId }),
            });
            if (!res.ok) throw new Error("Failed to send feedback");
            setStep("thanks");
        } catch {
            toast.error("Couldn't send your feedback", { description: "Please try again in a moment." });
        } finally {
            setSubmitting(false);
        }
    };

    const copyNote = async () => {
        try {
            await navigator.clipboard.writeText(note.trim());
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // Clipboard blocked; they can still type it on Trustpilot
        }
    };

    const shown = hovered || rating;
    const hasNote = note.trim().length > 0;

    return (
        <Dialog open={open} onOpenChange={close}>
            <DialogContent className="sm:max-w-md">
                {step === "rate" ? (
                    <>
                        <DialogHeader>
                            <DialogTitle>How was your scan?</DialogTitle>
                            <DialogDescription>
                                We found {servicesFound.toLocaleString("en-US")} account{servicesFound === 1 ? "" : "s"} tied to your inbox.
                                Your feedback helps us make GhostSweep better.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4">
                            <div className="flex flex-col items-center gap-2">
                                <div role="radiogroup" aria-label="Rate your scan" className="flex gap-1" onMouseLeave={() => setHovered(0)}>
                                    {[1, 2, 3, 4, 5].map((value) => (
                                        <button
                                            key={value}
                                            type="button"
                                            role="radio"
                                            aria-checked={rating === value}
                                            aria-label={`${value} star${value === 1 ? "" : "s"}`}
                                            onClick={() => setRating(value)}
                                            onMouseEnter={() => setHovered(value)}
                                            className="rounded-md p-1 transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                        >
                                            <Star
                                                className={cn(
                                                    "h-8 w-8 transition-colors",
                                                    value <= shown ? "fill-amber-400 text-amber-400" : "text-foreground/20",
                                                )}
                                            />
                                        </button>
                                    ))}
                                </div>
                                <p className="h-4 text-xs text-muted-foreground">{RATING_LABELS[shown]}</p>
                            </div>

                            <Textarea
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                maxLength={2000}
                                rows={3}
                                placeholder={
                                    rating && rating <= 3
                                        ? "What could we do better? (optional)"
                                        : "Anything you'd like to tell us? (optional)"
                                }
                            />
                        </div>

                        <DialogFooter>
                            <Button variant="ghost" onClick={() => close(false)} className="text-muted-foreground">
                                Not now
                            </Button>
                            <Button onClick={submit} disabled={!rating || submitting}>
                                {submitting ? "Sending…" : "Send feedback"}
                            </Button>
                        </DialogFooter>
                    </>
                ) : (
                    <>
                        <DialogHeader>
                            <DialogTitle>Thanks for the feedback!</DialogTitle>
                            <DialogDescription>
                                {rating <= 3
                                    ? "We read every response and will use yours to improve. "
                                    : "Glad it helped. "}
                                If you have a minute, a public review on Trustpilot helps other people find GhostSweep.
                            </DialogDescription>
                        </DialogHeader>

                        {hasNote && (
                            <div className="space-y-2">
                                <div className="rounded-lg border border-border bg-muted/40 p-3 text-sm text-foreground/80 whitespace-pre-wrap">
                                    {note.trim()}
                                </div>
                                <Button size="sm" variant="outline" onClick={copyNote}>
                                    {copied ? <Check className="mr-1.5 h-3.5 w-3.5" /> : null}
                                    {copied ? "Copied" : "Copy your note to paste on Trustpilot"}
                                </Button>
                            </div>
                        )}

                        <DialogFooter>
                            <Button variant="ghost" onClick={() => setOpen(false)} className="text-muted-foreground">
                                Close
                            </Button>
                            <Button asChild>
                                <a href={TRUSTPILOT_REVIEW_URL} target="_blank" rel="noopener noreferrer" onClick={() => setOpen(false)}>
                                    Review on Trustpilot <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
                                </a>
                            </Button>
                        </DialogFooter>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}
