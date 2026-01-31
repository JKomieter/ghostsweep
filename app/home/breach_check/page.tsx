"use client";

import { useState, FormEvent } from "react";
import {  ShieldCheck, Loader2 } from "lucide-react";
import DOMPurify from "dompurify"

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
                headers: {
                    "Content-Type": "application/json",
                },
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
            setError("Something went wrong while checking breaches. Please try again.");
            setStatus("error");
            toast.error("Something went wrong. Please try again.");
        }
    };

    const hasResults = breaches.length > 0;

    return (
        <main className="min-h-screen bg-[#050505] text-white px-4 py-8">
            <div className="mx-auto max-w-3xl space-y-6">
                <header className="space-y-2">
                    <h1 className="text-2xl font-light tracking-tight text-white">
                        Digital Shadow & Breach Check
                    </h1>
                    <p className="text-sm text-white/60 max-w-xl">
                        A breached account isn't just a privacy risk—it's a financial liability. 
                        Check if your email or domains appear in known data leaks that expose payment methods or personal data.
                    </p>
                </header>

                <Card className="bg-white/2 border border-white/5 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="text-base font-light text-white">
                            Enter an email or domain
                        </CardTitle>
                        <CardDescription className="text-xs text-white/60">
                            Example: <code className="text-[11px] bg-white/10 px-1 rounded">you@example.com</code> or{" "}
                            <code className="text-[11px] bg-white/10 px-1 rounded">example.com</code>
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
                                placeholder="you@example.com or example.com"
                                value={query}
                                onChange={setQuery}
                                className="flex-1 bg-white/5 border-white/5"
                            />
                            <Button
                                type="submit"
                                className="sm:w-auto w-full bg-white text-black hover:bg-white/90 font-light"
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
                            <Alert variant="destructive" className="mt-2 border-red-500/20 bg-red-500/10">
                                <AlertTitle className="text-red-300 font-light">Something went wrong</AlertTitle>
                                <AlertDescription className="text-xs text-red-300/80">
                                    {error}
                                </AlertDescription>
                            </Alert>
                        )}

                        {status === "success" && !hasResults && (
                            <Alert className="mt-2 border-emerald-500/20 bg-emerald-500/10">
                                <AlertTitle className="flex items-center gap-2 text-emerald-300 font-light">
                                    <ShieldCheck className="h-4 w-4" />
                                    No known breaches found
                                </AlertTitle>
                                <AlertDescription className="text-xs text-emerald-300/80">
                                    This email or domain doesn&apos;t appear in the breach records
                                    GhostSweep is currently tracking. This doesn&apos;t guarantee
                                    complete safety, but it&apos;s a good sign.
                                </AlertDescription>
                            </Alert>
                        )}
                    </CardContent>
                </Card>

                {/* Results */}
                {hasResults && (
                    <section className="space-y-3">
                        <div className="flex items-center justify-between">
                            <h2 className="text-sm font-light text-white">
                                Breaches found ({breaches.length})
                            </h2>
                            <p className="text-xs text-white/60">
                                These are known incidents where this email or domain appeared.
                            </p>
                        </div>

                        <div className="space-y-3">
                            {breaches.map((breach) => {
                                const dateLabel = breach.BreachDate
                                    ? new Date(breach.BreachDate).toLocaleDateString()
                                    : "Unknown date";

                                const title =
                                    breach.Title ||
                                    breach.Name ||
                                    breach.Domain ||
                                    "Unknown breach";

                                const safeHtml = DOMPurify.sanitize(breach.Description ?? "This service was involved in a known data exposure or incident.");

                                const isSensitive = breach.IsSensitive ?? false;
                                const pwnCount = breach.PwnCount;

                                return (
                                    <Card
                                        key={breach.Id ?? `${breach.Name}-${breach.Domain}-${breach.BreachDate}`}
                                        className="bg-white/2 border border-red-500/20 backdrop-blur-sm"
                                    >
                                        <CardHeader className="pb-2">
                                            <div className="flex items-center justify-between gap-3">
                                                <div>
                                                    <CardTitle className="text-sm font-light text-white">
                                                        {title}
                                                    </CardTitle>
                                                    <CardDescription className="text-xs text-red-300/80">
                                                        {breach.Domain || "Unknown domain"} •{" "}
                                                        {dateLabel}
                                                    </CardDescription>
                                                </div>
                                                <span className="inline-flex items-center rounded-full bg-red-500/15 px-2 py-1 text-[11px] font-light text-red-300">
                                                    {isSensitive ? "Sensitive" : "Breach"}
                                                </span>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="space-y-2">
                                            <p
                                                className="text-xs text-white/60 leading-relaxed"
                                                dangerouslySetInnerHTML={{ __html: safeHtml }}
                                            />

                                            {Array.isArray(breach.DataClasses) &&
                                                breach.DataClasses.length > 0 && (
                                                    <p className="text-[11px] text-white/60">
                                                        Data types exposed:{" "}
                                                        <span className="font-light text-white">
                                                            {breach.DataClasses.join(", ")}
                                                        </span>
                                                    </p>
                                                )}

                                            {typeof pwnCount === "number" && (
                                                <p className="text-[11px] text-red-300/80">
                                                    Approx.{" "}
                                                    <span className="font-light text-red-300">
                                                        {pwnCount.toLocaleString()}
                                                    </span>{" "}
                                                    accounts impacted.
                                                </p>
                                            )}
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    </section>
                )}
            </div>
        </main>
    );
}