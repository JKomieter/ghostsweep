"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { toast } from "sonner";

export interface LatestReport {
  url: string;
  generatedAt: string | null;
}

/** HTTP status /api/report returns when the user's plan doesn't include the report. */
const UPGRADE_REQUIRED_STATUS = 402;

/** How often to check whether a requested report is ready, and when to stop waiting. */
const POLL_INTERVAL_MS = 4_000;
const POLL_TIMEOUT_MS = 3 * 60_000;

/** Allowance for clock differences between the app server and the report generator. */
const CLOCK_SKEW_MS = 5_000;

async function fetchLatestReport(): Promise<{ status: number; report: LatestReport | null }> {
  const res = await fetch("/api/report", { method: "GET", cache: "no-store" });
  if (!res.ok) return { status: res.status, report: null };
  const data = await res.json();
  return {
    status: res.status,
    report: data.url ? { url: data.url, generatedAt: data.generatedAt ?? null } : null,
  };
}

/**
 * @param options.enabled  false for free users — skips the "latest report" lookup
 * @param options.onUpgradeRequired  called instead of an error toast when the plan doesn't include reports
 */
export function usePrivacyReport(options: { enabled?: boolean; onUpgradeRequired?: () => void } = {}) {
  const { enabled = true, onUpgradeRequired } = options;
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoadingLatest, setIsLoadingLatest] = useState(true);
  const [latestReport, setLatestReport] = useState<LatestReport | null>(null);
  const pollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ------------------------------------------------------------------
  // On mount: check whether the user already has a generated report
  // ------------------------------------------------------------------
  useEffect(() => {
    let cancelled = false;
    if (!enabled) return;
    (async () => {
      try {
        const { report } = await fetchLatestReport();
        if (!cancelled && report) setLatestReport(report);
      } catch {
        // swallow — non-critical
      } finally {
        if (!cancelled) setIsLoadingLatest(false);
      }
    })();
    return () => { cancelled = true; };
  }, [enabled]);

  const stopPolling = useCallback(() => {
    if (pollTimerRef.current) {
      clearTimeout(pollTimerRef.current);
      pollTimerRef.current = null;
    }
  }, []);

  // Stop polling when the component using the hook unmounts
  useEffect(() => stopPolling, [stopPolling]);

  // ------------------------------------------------------------------
  // Trigger fresh download — always fetches a new signed URL from server
  // so it never uses an expired link
  // ------------------------------------------------------------------
  const downloadLatestReport = useCallback(async () => {
    try {
      const { status, report } = await fetchLatestReport();
      if (status === UPGRADE_REQUIRED_STATUS && onUpgradeRequired) {
        onUpgradeRequired();
        return;
      }
      if (status !== 200) throw new Error("Could not retrieve report");
      if (!report) throw new Error("No report found");
      setLatestReport(report);
      window.open(report.url, "_blank");
    } catch (err) {
      toast.error((err as Error).message || "Failed to download report");
    }
  }, [onUpgradeRequired]);

  // ------------------------------------------------------------------
  // Wait for the new report by polling the authenticated GET /api/report.
  // (Report links are never broadcast; only the signed-in owner can fetch them.)
  // ------------------------------------------------------------------
  const pollUntilReady = useCallback(
    (requestedAt: number, hadReportBefore: boolean) => {
      const deadline = Date.now() + POLL_TIMEOUT_MS;

      const isNewReport = (report: LatestReport) => {
        if (report.generatedAt) {
          return Date.parse(report.generatedAt) >= requestedAt - CLOCK_SKEW_MS;
        }
        // No timestamp to compare: only a first-ever report can be recognised as new
        return !hadReportBefore;
      };

      const check = async () => {
        pollTimerRef.current = null;
        try {
          const { report } = await fetchLatestReport();
          if (report && isNewReport(report)) {
            setIsGenerating(false);
            setLatestReport(report);
            toast.success("Your privacy report is ready!", {
              description:
                "Click \"Download PDF\" to open it now, or find the download button in Settings → Privacy & Data any time.",
              duration: 0, // stays until dismissed
              action: { label: "Download PDF", onClick: () => window.open(report.url, "_blank") },
            });
            return;
          }
        } catch {
          // transient network error: keep polling until the deadline
        }

        if (Date.now() >= deadline) {
          setIsGenerating(false);
          toast.info("Your report is taking longer than usual", {
            description: "It will appear in Settings → Privacy & Data once it's ready.",
          });
          return;
        }
        pollTimerRef.current = setTimeout(check, POLL_INTERVAL_MS);
      };

      pollTimerRef.current = setTimeout(check, POLL_INTERVAL_MS);
    },
    []
  );

  // ------------------------------------------------------------------
  // Queue a new report generation
  // ------------------------------------------------------------------
  const requestReport = useCallback(async () => {
    if (isGenerating) return;

    try {
      setIsGenerating(true);

      const res = await fetch("/api/report", { method: "POST" });

      if (res.status === UPGRADE_REQUIRED_STATUS && onUpgradeRequired) {
        setIsGenerating(false);
        onUpgradeRequired();
        return;
      }

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Failed to queue report");
      }

      const { requestedAt } = (await res.json()) as { requestedAt?: string };

      toast.info("Generating your privacy report…", {
        description:
          "This usually takes 30–60 seconds. We'll show a notification when it's ready — you can also find the download button in Settings at any time.",
        duration: 15_000,
      });

      stopPolling();
      pollUntilReady(requestedAt ? Date.parse(requestedAt) : Date.now(), latestReport !== null);
    } catch (err) {
      setIsGenerating(false);
      stopPolling();
      toast.error((err as Error).message || "Failed to generate report");
    }
  }, [isGenerating, onUpgradeRequired, stopPolling, pollUntilReady, latestReport]);

  return {
    requestReport,
    downloadLatestReport,
    isGenerating,
    // Free users (enabled=false) never load or see a report
    isLoadingLatest: enabled && isLoadingLatest,
    latestReport: enabled ? latestReport : null,
  };
}
