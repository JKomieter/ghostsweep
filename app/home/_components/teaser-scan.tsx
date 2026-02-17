"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Fingerprint,
  Search,
  ShieldAlert,
  Lock,
  ArrowRight,
  User,
  Mail,
  Loader2,
} from "lucide-react";
import Link from "next/link";

// ─── Types ─────────────────────────────────────────────────────
type TeaserProfile = {
  site_name: string;
  profile_url: string;
};

const VISIBLE_COUNT = 3;

// ─── ProgressBar ───────────────────────────────────────────────
function ProgressBar({ progress }: { progress: number }) {
  return (
    <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
      <div
        className="h-full bg-linear-to-r from-purple-500 to-emerald-500 rounded-full transition-all duration-700 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}

// ─── SiteLogo ──────────────────────────────────────────────────
function SiteLogo({ domain, fallback }: { domain: string; fallback: string }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <span className="text-xs font-bold text-white/60 uppercase font-mono">
        {fallback.slice(0, 2)}
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`https://img.logo.dev/${domain}?token=${process.env.NEXT_PUBLIC_LOGO_DEV_PUBLISHABLE_KEY}&size=64&format=png`}
      alt={domain}
      className="h-full w-full object-contain"
      onError={() => setFailed(true)}
    />
  );
}

// ─── Extract domain helper ─────────────────────────────────────
function extractDomain(url: string): string {
  try {
    return new URL(url).hostname.replace("www.", "");
  } catch {
    return url;
  }
}

// ─── ResultRow (visible) ───────────────────────────────────────
function ResultRow({
  profile,
  index,
}: {
  profile: TeaserProfile;
  index: number;
}) {
  const domain = extractDomain(profile.profile_url);

  return (
    <div
      className="flex items-center gap-4 px-5 py-4 border-b border-white/5 last:border-b-0 animate-in fade-in slide-in-from-bottom-2 duration-500"
      style={{ animationDelay: `${index * 120}ms`, animationFillMode: "both" }}
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/5 overflow-hidden">
        <SiteLogo domain={domain} fallback={profile.site_name} />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white truncate">
          {profile.site_name}
        </p>
        <p className="text-xs text-white/30 font-mono truncate">{domain}</p>
      </div>

      <a
        href={profile.profile_url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-[10px] font-mono text-purple-400/70 hover:text-purple-300 transition hidden sm:block"
      >
        view →
      </a>
    </div>
  );
}

// ─── BlurredRow ────────────────────────────────────────────────
function BlurredRow({ index }: { index: number }) {
  return (
    <div
      className="flex items-center gap-4 px-5 py-4 border-b border-white/5 last:border-b-0 select-none animate-in fade-in duration-500"
      style={{
        animationDelay: `${(VISIBLE_COUNT + index) * 120}ms`,
        animationFillMode: "both",
      }}
    >
      <div className="h-9 w-9 shrink-0 rounded-lg bg-white/5 blur-sm" />
      <div className="flex-1 space-y-1.5">
        <div className="h-3.5 w-24 rounded bg-white/8 blur-sm" />
        <div className="h-2.5 w-36 rounded bg-white/5 blur-sm" />
      </div>
      <div className="h-5 w-14 rounded-full bg-white/5 blur-sm" />
    </div>
  );
}

// ─── TeaserScan ────────────────────────────────────────────────
export default function TeaserScan() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "scanning" | "done" | "error">(
    "idle"
  );
  const [progress, setProgress] = useState(0);
  const [currentMessage, setCurrentMessage] = useState("");
  const [results, setResults] = useState<TeaserProfile[]>([]);
  const [foundCount, setFoundCount] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [scansRemaining, setScansRemaining] = useState<number | null>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Scroll into view once scanning starts
  useEffect(() => {
    if (status === "scanning" && sectionRef.current) {
      sectionRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [status]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  /** Parse SSE lines from the buffered text and process each JSON payload */
  const processLine = useCallback((line: string) => {
    // SSE lines look like  "data: {json}"  — strip the prefix
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith(":")) return; // empty or comment
    const payload = trimmed.startsWith("data: ") ? trimmed.slice(6) : trimmed;
    if (!payload) return;

    let data: Record<string, unknown>;
    try {
      data = JSON.parse(payload);
    } catch {
      return; // malformed
    }

    // Update progress bar & message
    if (typeof data.progress === "number") setProgress(data.progress as number);
    if (data.message) setCurrentMessage(data.message as string);
    if (typeof data.found_count === "number") setFoundCount(data.found_count as number);

    // Append newly discovered profiles
    if (data.new_profiles && Array.isArray(data.new_profiles)) {
      setResults((prev) => {
        const existing = new Set(prev.map((p) => p.profile_url));
        const fresh = (data.new_profiles as TeaserProfile[]).filter(
          (p) => !existing.has(p.profile_url)
        );
        return fresh.length ? [...prev, ...fresh] : prev;
      });
    }

    // Final completed event — full profiles list
    if (data.status === "completed") {
      if (data.profiles && Array.isArray(data.profiles)) {
        setResults(data.profiles as TeaserProfile[]);
        setFoundCount((data.profiles as TeaserProfile[]).length);
      }
      setProgress(100);
      setCurrentMessage("Scan complete.");
      setStatus("done");
    }

    // Failure
    if (data.status === "failed") {
      setErrorMsg((data.message as string) || "Scan failed. Please try again.");
      setStatus("error");
    }
  }, []);

  const connectStream = useCallback(
    async (scanId: string, signal: AbortSignal) => {
      const res = await fetch(`/api/teaser-scan/${scanId}/progress`, {
        headers: { Accept: "text/event-stream" },
        signal,
      });

      if (!res.ok) {
        throw new Error("Failed to connect to scan stream");
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No response body");

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // SSE events are separated by double newlines
        const parts = buffer.split("\n");
        buffer = parts.pop() || "";

        for (const line of parts) {
          processLine(line);
        }
      }

      // Process any remaining buffer
      if (buffer.trim()) processLine(buffer);

      // If the stream ended and we're still scanning, treat as done
      setStatus((prev) => {
        if (prev === "scanning") {
          setProgress(100);
          setCurrentMessage("Scan complete.");
          return "done";
        }
        return prev;
      });
    },
    [processLine]
  );

  const startScan = useCallback(async () => {
    if (!username.trim()) return;

    // Abort any previous stream
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setStatus("scanning");
    setProgress(0);
    setResults([]);
    setFoundCount(0);
    setErrorMsg("");
    setCurrentMessage("Initializing scan…");

    try {
      const res = await fetch("/api/teaser-scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username.trim(),
          email: email.trim() || undefined,
        }),
        signal: controller.signal,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Scan failed" }));
        if (res.status === 429) {
          setIsRateLimited(true);
          throw new Error(err.error || "Daily scan limit reached.");
        }
        throw new Error(err.error || "Scan failed to start");
      }

      const data = await res.json();

      if (!data.scan_id) {
        throw new Error("No scan ID returned");
      }

      // Track remaining scans
      if (typeof data.scans_remaining === "number") {
        setScansRemaining(data.scans_remaining);
      }

      // Step 2: connect to SSE progress stream
      await connectStream(data.scan_id, controller.signal);
    } catch (err) {
      if ((err as Error).name === "AbortError") return;
      setStatus("error");
      setErrorMsg(
        err instanceof Error ? err.message : "Something went wrong"
      );
    }
  }, [username, email, connectStream]);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setStatus("idle");
    setResults([]);
    setProgress(0);
    setFoundCount(0);
    setIsRateLimited(false);
    setUsername("");
    setEmail("");
    setErrorMsg("");
  }, []);

  const canScan = username.trim().length > 0;
  const hiddenCount = Math.max(0, results.length - VISIBLE_COUNT);

  return (
    <div className="w-full" ref={sectionRef}>
      {/* Input form */}
      {status === "idle" && (
        <div className="rounded-2xl border border-white/10 bg-white/2 p-8 backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
              <Fingerprint className="h-5 w-5 text-purple-400" />
            </div>
            <div>
              <h3 className="text-base font-medium text-white">
                Try a free shadow scan
              </h3>
              <p className="text-xs text-white/40">
                See what&apos;s hiding under your digital identity
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/25" />
              <input
                type="text"
                placeholder="Username (e.g. johndoe_42)"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-black/40 py-3.5 pl-10 pr-4 text-sm text-white placeholder-white/25 focus:border-purple-500/40 focus:outline-none focus:ring-1 focus:ring-purple-500/20 transition"
              />
            </div>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/25" />
              <input
                type="email"
                placeholder="Email (optional)"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-black/40 py-3.5 pl-10 pr-4 text-sm text-white placeholder-white/25 focus:border-purple-500/40 focus:outline-none focus:ring-1 focus:ring-purple-500/20 transition"
              />
            </div>
            <button
              onClick={startScan}
              disabled={!canScan}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-purple-500 py-3.5 text-sm font-semibold text-white transition hover:bg-purple-400 disabled:opacity-30 disabled:cursor-not-allowed active:scale-[0.98]"
            >
              <Search className="h-4 w-4" />
              Scan My Shadow
            </button>
          </div>

          <p className="mt-4 text-[10px] text-white/20 text-center">
            {scansRemaining !== null
              ? `${scansRemaining} free scan${scansRemaining !== 1 ? "s" : ""} remaining today`
              : "3 free scans per day · No account required"}
          </p>
        </div>
      )}

      {/* Scanning / Done / Error state */}
      {(status === "scanning" || status === "done" || status === "error") && (
        <div className="rounded-2xl border border-white/10 bg-black/80 overflow-hidden backdrop-blur-sm shadow-2xl shadow-purple-900/10">
          {/* Terminal header */}
          <div className="flex items-center gap-2 border-b border-white/5 px-5 py-3.5 bg-white/3">
            <div className="h-2.5 w-2.5 rounded-full bg-red-500/60" />
            <div className="h-2.5 w-2.5 rounded-full bg-amber-500/60" />
            <div className="h-2.5 w-2.5 rounded-full bg-emerald-500/60" />
            <span className="ml-2 text-[10px] text-white/20 font-mono">
              shadow_scan — {username || email}
            </span>
            {status === "scanning" && (
              <div className="ml-auto flex items-center gap-1.5 text-[10px] text-purple-400 font-mono">
                <Loader2 className="h-3 w-3 animate-spin" />
                Scanning
              </div>
            )}
          </div>

          {/* Progress area */}
          <div className="px-5 py-4 border-b border-white/5 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-white/50 font-mono">{currentMessage}</span>
              <span className="text-white/30 font-mono tabular-nums">
                {progress}%
              </span>
            </div>
            <ProgressBar progress={progress} />

            {status === "done" && (
              <div className="flex items-center gap-4 pt-1 text-xs font-mono">
                <span className="text-emerald-400">
                  ✓ {foundCount} profiles found
                </span>
              </div>
            )}
          </div>

          {/* Results list */}
          {results.length > 0 && (
            <div>
              {/* Visible results */}
              {results.slice(0, VISIBLE_COUNT).map((profile, i) => (
                <ResultRow key={profile.profile_url} profile={profile} index={i} />
              ))}

              {/* Blurred results */}
              {hiddenCount > 0 && (
                <div className="relative">
                  {results.slice(VISIBLE_COUNT).map((_, i) => (
                    <BlurredRow key={i} index={i} />
                  ))}

                  {/* Upgrade overlay */}
                  <div className="absolute inset-0 bg-linear-to-t from-black/95 via-black/70 to-transparent flex flex-col items-center justify-end pb-6">
                    <div className="text-center space-y-3">
                      <div className="inline-flex items-center gap-2 rounded-full bg-white/5 border border-white/10 px-3 py-1.5 text-xs text-white/60">
                        <Lock className="h-3 w-3" />
                        <span>
                          +{hiddenCount} more profile{hiddenCount !== 1 ? "s" : ""} found
                        </span>
                      </div>
                      <div>
                        <Link
                          href="/login"
                          className="group inline-flex items-center gap-2 rounded-full bg-emerald-500 px-6 py-3 text-sm font-semibold text-black transition-all hover:bg-emerald-400 hover:shadow-[0_0_40px_-10px_rgba(16,185,129,0.4)]"
                        >
                          Sign up to reveal all
                          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Error state */}
          {status === "error" && (
            <div className="px-5 py-6 text-center space-y-4">
              <p className="text-sm text-red-400">{errorMsg}</p>
              {isRateLimited ? (
                <div className="space-y-3">
                  <p className="text-xs text-white/40">
                    Create a free account for more scans and full deletion tools.
                  </p>
                  <Link
                    href="/login"
                    className="group inline-flex items-center gap-2 rounded-full bg-emerald-500 px-6 py-3 text-sm font-semibold text-black transition-all hover:bg-emerald-400 hover:shadow-[0_0_40px_-10px_rgba(16,185,129,0.4)]"
                  >
                    Sign up free
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </div>
              ) : (
                <button
                  onClick={reset}
                  className="rounded-lg border border-white/10 bg-white/5 px-5 py-2.5 text-xs font-medium text-white/60 hover:bg-white/10 transition"
                >
                  Try again
                </button>
              )}
            </div>
          )}

          {/* Bottom bar — done state CTA */}
          {status === "done" && (
            <div className="border-t border-white/5 px-5 py-5">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3 text-sm">
                  <ShieldAlert className="h-5 w-5 text-amber-400" />
                  <span className="text-white/60">
                    {foundCount} profile{foundCount !== 1 ? "s" : ""} found —
                    sign up for full scan &amp; deletion
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={reset}
                    className="rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-medium text-white/60 hover:bg-white/10 transition"
                  >
                    Scan again
                  </button>
                  <Link
                    href="/login"
                    className="group inline-flex items-center gap-1.5 rounded-lg bg-emerald-500 px-5 py-2.5 text-xs font-semibold text-black hover:bg-emerald-400 transition"
                  >
                    Get full access
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
