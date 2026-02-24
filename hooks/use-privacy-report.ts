"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import type { RealtimeChannel } from "@supabase/supabase-js";

export interface LatestReport {
  url: string;
  generatedAt: string | null;
}

export function usePrivacyReport() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoadingLatest, setIsLoadingLatest] = useState(true);
  const [latestReport, setLatestReport] = useState<LatestReport | null>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);

  // ------------------------------------------------------------------
  // On mount: check whether the user already has a generated report
  // ------------------------------------------------------------------
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/report", { method: "GET" });
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled && data.url) {
          setLatestReport({ url: data.url, generatedAt: data.generatedAt ?? null });
        }
      } catch {
        // swallow — non-critical
      } finally {
        if (!cancelled) setIsLoadingLatest(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const cleanup = useCallback(() => {
    if (channelRef.current) {
      const supabase = createClient();
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }
  }, []);

  // ------------------------------------------------------------------
  // Trigger fresh download — always fetches a new signed URL from server
  // so it never uses an expired link
  // ------------------------------------------------------------------
  const downloadLatestReport = useCallback(async () => {
    try {
      const res = await fetch("/api/report", { method: "GET" });
      if (!res.ok) throw new Error("Could not retrieve report");
      const data = await res.json();
      if (!data.url) throw new Error("No report found");
      setLatestReport({ url: data.url, generatedAt: data.generatedAt ?? null });
      window.open(data.url, "_blank");
    } catch (err) {
      toast.error((err as Error).message || "Failed to download report");
    }
  }, []);

  // ------------------------------------------------------------------
  // Queue a new report generation
  // ------------------------------------------------------------------
  const requestReport = useCallback(async () => {
    if (isGenerating) return;

    try {
      setIsGenerating(true);

      const res = await fetch("/api/report", { method: "POST" });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Failed to queue report");
      }

      const { userId } = await res.json();

      toast.info("Generating your privacy report…", {
        description:
          "This usually takes 30–60 seconds. We'll show a notification when it's ready — you can also find the download button in Settings at any time.",
        duration: 15_000,
      });

      // Subscribe to the user-scoped Realtime channel the orchestration server
      // broadcasts on once the PDF is ready.
      const supabase = createClient();
      const channel = supabase.channel(`report:${userId}`);
      channelRef.current = channel;

      channel
        .on("broadcast", { event: "report_ready" }, (msg) => {
          const url = msg.payload?.url as string | undefined;
          const generatedAt = msg.payload?.generatedAt as string | undefined ?? new Date().toISOString();

          setIsGenerating(false);
          if (url) {
            setLatestReport({ url, generatedAt });
          }
          cleanup();

          toast.success("Your privacy report is ready!", {
            description:
              "Click \"Download PDF\" to open it now, or find the download button in Settings → Privacy & Data any time.",
            duration: 0, // stays until dismissed
            action: url
              ? { label: "Download PDF", onClick: () => window.open(url, "_blank") }
              : undefined,
          });
        })
        .subscribe();
    } catch (err) {
      setIsGenerating(false);
      cleanup();
      toast.error((err as Error).message || "Failed to generate report");
    }
  }, [isGenerating, cleanup]);

  return {
    requestReport,
    downloadLatestReport,
    isGenerating,
    isLoadingLatest,
    latestReport,
  };
}
