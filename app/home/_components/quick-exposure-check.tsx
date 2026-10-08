/* eslint-disable react/no-unescaped-entities */
"use client";

import { useState, FormEvent } from "react";
import { Mail, AlertTriangle, ArrowRight, Loader2, ShieldCheck } from "lucide-react";
import Link from "next/link";
import DOMPurify from "dompurify";

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

export function QuickExposureCheck() {
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
    } catch (err) {
      console.error("Breach check error:", err);
      setError("Something went wrong while checking breaches. Please try again.");
      setStatus("error");
    }
  };

  const hasResults = breaches.length > 0;

  return (
    <section className="space-y-8">
      <div className="space-y-3 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-foreground/10 bg-foreground/5 px-3 py-1.5 text-[11px] font-medium text-foreground/75">
          <AlertTriangle className="h-3 w-3 text-muted-foreground" />
          Optional quick exposure check
        </div>
        <h2 className="text-2xl sm:text-3xl font-semibold text-foreground">
          Check for known breaches
        </h2>
        <p className="mx-auto max-w-xl text-sm text-muted-foreground">
          Enter an email or domain to see if it appears in the breach data GhostSweep is monitoring.
        </p>
      </div>

      <div className="mx-auto max-w-2xl space-y-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
              <Mail className="h-5 w-5" />
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="you@example.com or example.com"
              className="w-full rounded-full border border-foreground/10 bg-foreground/5 py-4 pl-12 pr-4 text-foreground placeholder:text-muted-foreground focus:border-foreground/20 focus:bg-foreground/10 focus:outline-none transition"
            />
          </div>

          <button
            type="submit"
            disabled={status === "loading" || !query.trim()}
            className="w-full rounded-full bg-foreground py-3 text-sm font-medium text-background hover:bg-foreground/90 disabled:opacity-50 transition flex items-center justify-center gap-2"
          >
            {status === "loading" ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Checking…
              </>
            ) : (
              <>
                Run quick check
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        {status === "error" && error && (
          <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-800 dark:text-red-200">
            <p className="font-medium">Something went wrong</p>
            <p className="text-xs mt-1">{error}</p>
          </div>
        )}

        {status === "success" && !hasResults && (
          <div className="rounded-lg border border-emerald-500/25 bg-emerald-500/5 p-4">
            <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-200 font-medium">
              <ShieldCheck className="h-4 w-4" />
              No breaches in this dataset
            </div>
            <p className="text-xs text-emerald-800/80 dark:text-emerald-100/80 mt-2">
              This email or domain doesn't appear in the breach records GhostSweep is currently tracking. It doesn't guarantee complete safety, but it's a positive signal.
            </p>
          </div>
        )}

        {/* Results */}
        {hasResults && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-foreground">
                Breaches found ({breaches.length})
              </h3>
              <p className="text-xs text-muted-foreground">
                Known incidents where this email or domain appeared.
              </p>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {breaches.map((breach) => {
                const dateLabel = breach.BreachDate
                  ? new Date(breach.BreachDate).toLocaleDateString()
                  : "Unknown date";

                const title =
                  breach.Title ||
                  breach.Name ||
                  breach.Domain ||
                  "Unknown breach";

                const safeHtml = DOMPurify.sanitize(
                  breach.Description ?? "This service was involved in a known data exposure or incident."
                );

                const isSensitive = breach.IsSensitive ?? false;
                const pwnCount = breach.PwnCount;

                return (
                  <div
                    key={breach.Id ?? `${breach.Name}-${breach.Domain}-${breach.BreachDate}`}
                    className="rounded-lg border border-foreground/10 bg-background p-4 space-y-2"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">
                          {title}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {breach.Domain || "Unknown domain"} • {dateLabel}
                        </p>
                      </div>
                      <span className="inline-flex items-center rounded-full bg-foreground/5 px-2 py-1 text-[10px] font-medium text-foreground/85 whitespace-nowrap">
                        {isSensitive ? "Sensitive dataset" : "Breach record"}
                      </span>
                    </div>

                    <p
                      className="text-xs text-muted-foreground leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: safeHtml }}
                    />

                    {Array.isArray(breach.DataClasses) && breach.DataClasses.length > 0 && (
                      <p className="text-[11px] text-muted-foreground">
                        Data types:{" "}
                        <span className="font-medium text-foreground/75">
                          {breach.DataClasses.join(", ")}
                        </span>
                      </p>
                    )}

                    {typeof pwnCount === "number" && (
                      <p className="text-[11px] text-muted-foreground">
                        Approx.{" "}
                        <span className="font-semibold text-foreground/85">
                          {pwnCount.toLocaleString()}
                        </span>{" "}
                        accounts included in this incident.
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            <Link
              href="/login?mode=signup"
              className="inline-flex w-full items-center justify-center rounded-full border border-foreground/15 bg-foreground/5 px-5 py-2.5 text-xs font-medium text-foreground hover:bg-foreground/10 transition gap-2"
            >
              Open full GhostSweep dashboard
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
