import Link from "next/link";
import { AlertTriangle, ArrowRight, Lock } from "lucide-react";

function isEmail(input: string): boolean {
    return /\S+@\S+\.\S+/.test(input);
}

export function signupHrefFor(query: string): string {
    const trimmed = query.trim();
    return isEmail(trimmed)
        ? `/login?mode=signup&email=${encodeURIComponent(trimmed)}`
        : "/login?mode=signup";
}

type BreachSignupCtaProps = {
    query: string;
    breachCount: number;
    // Breaches left out of the free preview; shown in the bottom box
    hiddenCount?: number;
};

export function BreachSignupCta({
    query,
    breachCount,
    hiddenCount = 0,
}: BreachSignupCtaProps) {
    const subject = isEmail(query.trim()) ? "Your email" : "This domain";
    const breachLabel = `${breachCount.toLocaleString()} ${breachCount === 1 ? "breach" : "breaches"}`;

    return (
        <div className="rounded-2xl border border-red-500/25 bg-red-500/5 p-5 sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-500/10 text-red-600 dark:text-red-400">
                        {hiddenCount > 0 ? (
                            <Lock className="h-4 w-4" />
                        ) : (
                            <AlertTriangle className="h-4 w-4" />
                        )}
                    </span>
                    <div>
                        <p className="text-sm font-semibold text-foreground">
                            {hiddenCount > 0
                                ? `${hiddenCount.toLocaleString()} more ${hiddenCount === 1 ? "breach" : "breaches"} not shown`
                                : `${subject} is in ${breachLabel}.`}
                        </p>
                        <p className="mt-1 text-xs text-foreground/65 leading-relaxed">
                            See which of your accounts are still exposed, and
                            close them in a few clicks.
                        </p>
                    </div>
                </div>

                <Link
                    href={signupHrefFor(query)}
                    className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-black hover:bg-emerald-400 transition"
                >
                    Connect inbox (free)
                    <ArrowRight className="h-4 w-4" />
                </Link>
            </div>
        </div>
    );
}
