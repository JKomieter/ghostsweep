"use client";

import { useState, useRef, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import type { RealtimeChannel } from "@supabase/supabase-js";

export function usePrivacyReport() {
  const [isGenerating, setIsGenerating] = useState(false);
  const channelRef = useRef<RealtimeChannel | null>(null);

  const cleanup = useCallback(() => {
    if (channelRef.current) {
      const supabase = createClient();
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }
  }, []);

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
        description: "This may take a moment. We'll notify you when it's ready.",
        duration: 12_000,
      });

      // Subscribe to the user-scoped Realtime channel the server broadcasts on
      const supabase = createClient();
      const channel = supabase.channel(`report:${userId}`);
      channelRef.current = channel;

      channel
        .on("broadcast", { event: "report_ready" }, (msg) => {
          const url = msg.payload?.url as string | undefined;
          setIsGenerating(false);
          cleanup();

          toast.success("Your privacy report is ready!", {
            description: "Your PDF has been generated and is ready to download.",
            duration: 30_000,
            action: url
              ? {
                  label: "Download PDF",
                  onClick: () => window.open(url, "_blank"),
                }
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

  return { requestReport, isGenerating };
}
