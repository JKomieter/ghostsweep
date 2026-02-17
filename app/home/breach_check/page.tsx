"use client";

import { useState, FormEvent } from "react";
import { ShieldCheck, Loader2, AlertTriangle, Ghost } from "lucide-react";
import DOMPurify from "dompurify";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Input from "@/components/ui/input";
import { toast } from "sonner";

type Breach = {
    Id?: string | null;
    Name: string | null;
    Title: string | null;
    Domain: string | null;
    BreachDate: string | null;
    PwnCount: number | null;
    IsSensitive: boolean | null;
    Description: string | null;
    DataClasses: string[] | null;
    LogoPath: string | null;
};

type Status = "idle" | "loading" | "success" | "error";

export default function BreachCheckPage() {
    const [query, setQuery] = useState("");
    const [status, setStatus] = useState<Status>("idle");
    const [breaches, setBreaches] = useState<Breach[]>([]);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;

        setStatus("loading");
        setError(null);
        setBreaches([]);

        try {
            const res = await fetch("/api/breach_check", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ query }),
            });

            if (!res.ok) {
                let message = "Failed to check breaches";
                try {
                    const body = await res.json();
                    if (body?.error) message = body.error;
                } catch {
                    // ignore JSON parse error
                }
                throw new Error(message);
            }

            const data = await res.json();
            setBreaches((data?.breaches ?? []) as Breach[]);
            setStatus("success");

            toast.success(
                (data?.breaches?.length ?? 0) > 0
                    ? "We found breach records for this input."
                    : "No known breaches found for this input."
            );
        } catch (err) {
            console.error("Breach check error:", err);
            setError(
                "Something went wrong while checking breaches. Please try again."
            );
            setStatus("error");
            toast.error("Something went wrong. Please try again.");
        }
    };

    const hasResults = breaches.length > 0;

    return (
        <main className="min-h-screen bg-[#050505]">
            <div className="mx-auto max-w-3xl px-6 pt-24 pb-20 sm:pt-32 space-y-10">
                {/* Header */}
                <header className="text-center space-y-5 max-w-2xl mx-auto">
                    <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs text-white/50">
                        <Ghost className="h-3 w-3 text-emerald-400" />
                        Breach Checker
                    </div>

                    <h1 className="text-3xl sm:text-5xl font-semibold tracking-tight text-white leading-[1.08]">
                        Check your exposure.
                    </h1>
                    <p className="text-base text-white/45 font-light leading-relaxed max-w-lg mx-auto">
                        A breached account isn't just a privacy risk — it's a
                        financial liability. See if your email or domain appears in
                        known data leaks.
                    </p>
                </header>

                {/* Form */}
                <Card className="bg-white/2 border border-white/5 rounded-2xl shadow-2xl">
                    <CardHeader className="pb-4">
                        <CardTitle className="text-base font-medium text-white">
                            Enter an email or domain
                        </CardTitle>
                        <CardDescription className="text-xs text-white/40">
                            Example:{" "}
                            <code className="text-[11px] bg-white/5 px-1.5 py-0.5 rounded">
                                you@example.com
                            </code>{" "}
                            or{" "}
                            <code className="text-[11px] bg-white/5 px-1.5 py-0.5 rounded">
                                example.com
                            </code>
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <form
                            onSubmit={handleSubmit}
                            className="flex flex-col gap-3 sm:flex-row"
                        >
                            <Input
                                id="email"
                                type="email"
                                placeholder="you@example.com"
                                value={query}
                                onChange={setQuery}
                                className="flex-1 bg-white/3 border-white/5 rounded-xl"
                            />
                            <Button
                                type="submit"
                                className="sm:w-auto w-full bg-emerald-500 text-black hover:bg-emerald-400 font-semibold rounded-xl"
                                disabled={status === "loading" || !query.trim()}
                            >
                                {status === "loading" ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Checking…
                                    </>
                                ) : (
                                    "Check now"
                                )}
                            </Button>
                        </form>

                        {status === "error" && error && (
                            <Alert
                                variant="destructive"
                                className="border-red-500/15 bg-red-500/5 rounded-xl"
                            >
                                <AlertTitle className="text-red-400 font-medium text-sm">
                                    Something went wrong
                                </AlertTitle>
                                <AlertDescription className="text-xs text-red-400/70">
                                    {error}
                                </AlertDescription>
                            </Alert>
                        )}

                        {status === "success" && !hasResults && (
                            <Alert className="border-emerald-500/15 bg-emerald-500/5 rounded-xl">
                                <AlertTitle className="flex items-center gap-2 text-emerald-400 font-medium text-sm">
                                    <ShieldCheck className="h-4 w-4" />
                                    No known breaches found
                                </AlertTitle>
                                <AlertDescription className="text-xs text-emerald-400/70">
                                    This email or domain doesn&apos;t appear in the breach
                                    records we currently track. This doesn&apos;t guarantee
                                    complete safety, but it&apos;s a good sign.
                                </AlertDescription>
                            </Alert>
                        )}
                    </CardContent>
                </Card>

                {/* Results */}
                {hasResults && (
                    <section className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-sm font-medium text-white">
                                Breaches found ({breaches.length})
                            </h2>
                            <p className="text-xs text-white/30">
                                Known incidents involving this email or domain.
                            </p>
                        </div>

                        <div className="space-y-3">
                            {breaches.map((breach) => {
                                const dateLabel = breach.BreachDate
                                    ? new Date(
                                          breach.BreachDate
                                      ).toLocaleDateString()
                                    : "Unknown date";

                                const title =
                                    breach.Title ||
                                    breach.Name ||
                                    breach.Domain ||
                                    "Unknown breach";

                                const safeHtml = DOMPurify.sanitize(
                                    breach.Description ??
                                        "This service was involved in a known data exposure."
                                );

                                const isSensitive = breach.IsSensitive ?? false;
                                const pwnCount = breach.PwnCount;

                                return (
                                    <div
                                        key={
                                            breach.Id ??
                                            `${breach.Name}-${breach.Domain}-${breach.BreachDate}`
                                        }
                                        className="rounded-2xl border border-red-500/15 bg-red-500/3 p-5"
                                    >
                                        <div className="flex items-start justify-between gap-3 mb-3">
                                            <div>
                                                <h3 className="text-sm font-medium text-white">
                                                    {title}
                                                </h3>
                                                <p className="text-xs text-red-400/60 mt-0.5">
                                                    {breach.Domain ||
                                                        "Unknown domain"}{" "}
                                                    · {dateLabel}
                                                </p>
                                            </div>
                                            <span className="shrink-0 inline-flex items-center gap-1 rounded-full bg-red-500/10 border border-red-500/20 px-2.5 py-1 text-[10px] font-medium text-red-400">
                                                <AlertTriangle className="h-2.5 w-2.5" />
                                                {isSensitive
                                                    ? "Sensitive"
                                                    : "Breach"}
                                            </span>
                                        </div>

                                        <p
                                            className="text-xs text-white/40 leading-relaxed"
                                            dangerouslySetInnerHTML={{
                                                __html: safeHtml,
                                            }}
                                        />

                                        {Array.isArray(breach.DataClasses) &&
                                            breach.DataClasses.length > 0 && (
                                                <p className="text-[11px] text-white/35 mt-3">
                                                    Exposed:{" "}
                                                    <span className="text-white/50">
                                                        {breach.DataClasses.join(
                                                            ", "
                                                        )}
                                                    </span>
                                                </p>
                                            )}

                                        {typeof pwnCount === "number" && (
                                            <p className="text-[11px] text-red-400/50 mt-1.5">
                                                ~{pwnCount.toLocaleString()}{" "}
                                                accounts impacted
                                            </p>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </section>
                )}
            </div>
        </main>
    );
}
