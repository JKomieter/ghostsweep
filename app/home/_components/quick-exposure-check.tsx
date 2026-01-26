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
      <div className="space-y-4 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-300">
          <AlertTriangle className="h-3 w-3" />
          Prove the Danger. Instantly.
        </div>
        <h2 className="text-3xl sm:text-4xl font-bold text-white">
          Your email is exposed
        </h2>
        <p className="mx-auto max-w-2xl text-lg text-zinc-400">
          Check if your email or domain appears in known data breaches. It takes 2 seconds.
        </p>
      </div>

      <div className="mx-auto max-w-2xl space-y-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500">
              <Mail className="h-5 w-5" />
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="you@example.com or example.com"
              className="w-full rounded-full border border-white/10 bg-white/5 py-4 pl-12 pr-4 text-white placeholder:text-zinc-500 focus:border-white/20 focus:bg-white/10 focus:outline-none transition"
            />
          </div>

          <button
            type="submit"
            disabled={status === "loading" || !query.trim()}
            className="w-full rounded-full bg-white py-4 font-semibold text-black hover:bg-zinc-100 disabled:opacity-50 transition flex items-center justify-center gap-2"
          >
            {status === "loading" ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Checking…
              </>
            ) : (
              <>
                Check Now
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        {status === "error" && error && (
          <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
            <p className="font-medium">Something went wrong</p>
            <p className="text-xs mt-1">{error}</p>
          </div>
        )}

        {status === "success" && !hasResults && (
          <div className="rounded-lg border border-emerald-500/40 bg-emerald-500/5 p-4">
            <div className="flex items-center gap-2 text-emerald-300 font-medium">
              <ShieldCheck className="h-4 w-4" />
              No known breaches found
            </div>
            <p className="text-xs text-emerald-100/80 mt-2">
              This email or domain doesn't appear in the breach records GhostSweep is currently tracking. This doesn't guarantee complete safety, but it's a good sign.
            </p>
          </div>
        )}

        {/* Results */}
        {hasResults && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-white">
                Breaches found ({breaches.length})
              </h3>
              <p className="text-xs text-zinc-400">
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
                    className="rounded-lg border border-red-500/30 bg-[#050509] p-4 space-y-2"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-white">
                          {title}
                        </p>
                        <p className="text-xs text-red-200/80 mt-0.5">
                          {breach.Domain || "Unknown domain"} • {dateLabel}
                        </p>
                      </div>
                      <span className="inline-flex items-center rounded-full bg-red-500/15 px-2 py-1 text-[11px] font-medium text-red-300 whitespace-nowrap">
                        {isSensitive ? "Sensitive" : "Breach"}
                      </span>
                    </div>

                    <p
                      className="text-xs text-zinc-400 leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: safeHtml }}
                    />

                    {Array.isArray(breach.DataClasses) && breach.DataClasses.length > 0 && (
                      <p className="text-[11px] text-zinc-400">
                        Data types:{" "}
                        <span className="font-medium text-zinc-300">
                          {breach.DataClasses.join(", ")}
                        </span>
                      </p>
                    )}

                    {typeof pwnCount === "number" && (
                      <p className="text-[11px] text-red-200/80">
                        Approx.{" "}
                        <span className="font-semibold">
                          {pwnCount.toLocaleString()}
                        </span>{" "}
                        accounts impacted.
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            <Link
              href="/login"
              className="inline-flex w-full items-center justify-center rounded-full bg-red-600 px-6 py-3 text-sm font-medium text-white hover:bg-red-700 transition gap-2"
            >
              View All Exposed Accounts
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
