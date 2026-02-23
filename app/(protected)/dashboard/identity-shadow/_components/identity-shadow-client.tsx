"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { Fingerprint, Activity, ShieldAlert, ChevronRight } from "lucide-react";
import Link from "next/link";

import RiskRadar from "./risk-radar";
import ShadowCard, { type ShadowProfile } from "./shadow-card";
import SelectorManager from "./selector-manager";
import RemediationQueue from "./remediation-queue";
import ScanButton, { type ScanStatus } from "./scan-button";
import ShadowOnboardingModal from "./shadow-onboarding-modal";
import { Skeleton } from "@/components/ui/skeleton";

type ShadowData = {
  profiles: ShadowProfile[];
  totalCount: number;
  hiddenCount: number;
  criticalCount: number;
  securityScore: {
    score: number;
    vulnerability_score: number;
    last_calculated_at: string;
  } | null;
  selectors: {
    id: number;
    selector_type: string;
    selector_value: string;
    last_scanned_at: string | null;
  }[];
  isPremium: boolean;
};

type ShadowScan = {
  id: string;
  status: ScanStatus;
  progress: number;
  found_count: number;
  message: string | null;
  created_at: string;
  completed_at: string | null;
};

const ACTIVE_STATUSES: ScanStatus[] = ["starting", "scanning", "processing"];

export default function IdentityShadowClient() {
  const [activeScanId, setActiveScanId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Derive scanning state from poll data
  const isActiveStatus = (status: ScanStatus) =>
    status !== null && ACTIVE_STATUSES.includes(status);

  const { data, isLoading } = useQuery<ShadowData>({
    queryKey: ["shadow-data"],
    queryFn: async () => {
      const res = await fetch("/api/shadow-profiles");
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
    staleTime: 30_000,
  });

  // Poll for the latest scan status
  const { data: scanData } = useQuery<{ scan: ShadowScan | null }>({
    queryKey: ["shadow-scan", activeScanId],
    queryFn: async () => {
      const res = await fetch("/api/shadow-profiles/scan");
      if (!res.ok) throw new Error("Failed to fetch scan status");
      const result = await res.json();
      const scan = result.scan as ShadowScan | null;

      // Handle terminal states inside the queryFn to avoid setState in effects
      if (scan && !isActiveStatus(scan.status) && activeScanId) {
        if (scan.status === "completed") {
          toast.success("Scan complete", {
            description: `Found ${scan.found_count} shadow profile${scan.found_count !== 1 ? "s" : ""}. Your shadow map has been updated.`,
          });
          queryClient.invalidateQueries({ queryKey: ["shadow-data"] });
        } else if (scan.status === "failed") {
          toast.error("Scan failed", {
            description: scan.message || "Something went wrong during the scan.",
          });
        }
        // Clear the scan ID on next tick to stop polling
        setTimeout(() => setActiveScanId(null), 0);
      }

      return result;
    },
    refetchInterval: (query) => {
      const scan = query.state.data?.scan;
      if (scan && isActiveStatus(scan.status)) return 2_500;
      return false;
    },
    enabled: activeScanId !== null,
  });

  const currentScan = scanData?.scan ?? null;
  const isScanning = currentScan !== null && isActiveStatus(currentScan.status);
  const scanProgress = currentScan?.progress ?? 0;
  const scanFoundCount = currentScan?.found_count ?? 0;
  const scanMessage = currentScan?.message ?? null;
  const scanStatus = currentScan?.status ?? null;

  // On mount, check if there's an in-progress scan
  useEffect(() => {
    async function checkExistingScan() {
      try {
        const res = await fetch("/api/shadow-profiles/scan");
        if (!res.ok) return;
        const { scan } = await res.json();
        if (scan && isActiveStatus(scan.status)) {
          setActiveScanId(scan.id);
        }
      } catch {
        // silent
      }
    }
    checkExistingScan();
  }, []);

  const scanMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/shadow-profiles/scan", { method: "POST" });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Scan failed");
      }
      return res.json() as Promise<{ scanId: string; status: string }>;
    },
    onSuccess: (data) => {
      setActiveScanId(data.scanId);
      toast.info("Scan initiated", {
        description: "Searching the shadows… this may take a moment.",
      });
    },
    onError: (err: Error) => {
      toast.error("Scan failed", { description: err.message });
    },
  });

  const statusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await fetch("/api/shadow-profiles", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to update status");
      }
      return res.json();
    },
    onSuccess: (_, { status }) => {
      const label = status === "deleted" ? "Marked as deleted" : status === "ignored" ? "Ignored" : "Restored";
      toast.success(label, {
        description: status === "deleted"
          ? "This profile has been marked as deleted."
          : status === "ignored"
          ? "This profile will be hidden from priority view."
          : "This profile is active again.",
      });
      queryClient.invalidateQueries({ queryKey: ["shadow-data"] });
    },
    onError: (err: Error) => {
      toast.error("Update failed", { description: err.message });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/shadow-profiles?id=${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to delete");
      }
      return res.json();
    },
    onSuccess: () => {
      toast.success("Permanently removed", {
        description: "This shadow profile has been deleted.",
      });
      queryClient.invalidateQueries({ queryKey: ["shadow-data"] });
    },
    onError: (err: Error) => {
      toast.error("Delete failed", { description: err.message });
    },
  });

  const handleStatusChange = (id: string, status: string) => {
    statusMutation.mutate({ id, status });
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  const profiles = data?.profiles ?? [];
  const selectors = data?.selectors ?? [];
  const isPremium = data?.isPremium ?? false;
  const totalCount = data?.totalCount ?? 0;
  const hiddenCount = data?.hiddenCount ?? 0;
  const criticalCount = data?.criticalCount ?? 0;
  const score = data?.securityScore;

  const { data: planData } = useQuery<{ current_plan: "free" | "buster" | "pro"; has_used_trial: boolean }>({
    queryKey: ["plan"],
    queryFn: async () => {
      const res = await fetch("/api/plan");
      if (!res.ok) throw new Error("Failed to fetch plan");
      return res.json();
    },
  });
  const hasUsedTrial = planData?.has_used_trial ?? false;

  return (
    <div className="p-4 md:p-8 min-h-[calc(100vh-3.5rem)]">
      {/* Onboarding guidance modal for first-time visitors */}
      <ShadowOnboardingModal />

      {/* Scanline overlay when scanning */}
      {isScanning && (
        <div className="fixed inset-0 z-50 pointer-events-none">
          <div className="absolute inset-x-0 h-0.5 bg-linear-to-r from-transparent via-emerald-500/60 to-transparent animate-[scanline_1.5s_linear_infinite]" />
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5">
              <Fingerprint className="h-4 w-4 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-lg font-medium text-white">
                Identity Shadow
              </h1>
              <p className="text-xs text-white/30">
                Ghost accounts & exposure map
              </p>
            </div>
          </div>
          <ScanButton
            isScanning={isScanning}
            progress={scanProgress}
            status={scanStatus}
            foundCount={scanFoundCount}
            message={scanMessage}
            onScan={() => scanMutation.mutate()}
          />
        </div>

        {/* 3-Column Layout */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Sidebar */}
          <div className="lg:w-60 shrink-0 space-y-6">
            {/* Risk Radar */}
            <div className="rounded-lg border border-white/5 bg-white/2 p-4">
              {isLoading ? (
                <div className="flex flex-col items-center gap-3 py-8">
                  <Skeleton className="h-40 w-40 rounded-full" />
                  <Skeleton className="h-4 w-24" />
                </div>
              ) : (
                <RiskRadar
                  totalCount={totalCount}
                  criticalCount={criticalCount}
                  isScanning={isScanning}
                />
              )}
            </div>

            {/* Security Score */}
            <div className="rounded-lg border border-white/5 bg-white/2 p-4">
              <span className="text-[11px] font-medium uppercase tracking-widest text-white/40">
                Security Score
              </span>
              {isLoading ? (
                <Skeleton className="h-10 w-20 mt-2" />
              ) : score ? (
                <div className="mt-2 flex items-end gap-2">
                  <span
                    className={`text-4xl font-light tracking-tight ${
                      score.score >= 70
                        ? "text-emerald-400"
                        : score.score >= 40
                        ? "text-amber-400"
                        : "text-red-400"
                    }`}
                  >
                    {score.score}
                  </span>
                  <span className="text-xs text-white/20 mb-1">/100</span>
                </div>
              ) : (
                <p className="text-sm text-white/20 mt-2">Not yet calculated</p>
              )}
              {score?.vulnerability_score != null && (
                <div className="mt-3 flex items-center gap-2">
                  <ShieldAlert className="h-3 w-3 text-white/20" />
                  <span className="text-[11px] text-white/30">
                    Vulnerability: {score.vulnerability_score}
                  </span>
                </div>
              )}
            </div>

            {/* Selectors */}
            <div className="rounded-lg border border-white/5 bg-white/2 p-4">
              {isLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                </div>
              ) : (
                <SelectorManager selectors={selectors} />
              )}
            </div>

            {/* Quick Nav */}
            <div className="rounded-lg border border-white/5 bg-white/2 p-3">
              <span className="text-[11px] font-medium uppercase tracking-widest text-white/40 px-1 mb-2 block">
                Quick Links
              </span>
              {[
                { label: "Breaches", href: "/dashboard/breaches", icon: ShieldAlert },
                { label: "Accounts", href: "/dashboard/accounts", icon: Activity },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center justify-between px-2 py-2 rounded-md text-xs text-white/50 hover:text-white/80 hover:bg-white/3 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <item.icon className="h-3 w-3" />
                    {item.label}
                  </div>
                  <ChevronRight className="h-3 w-3 opacity-40" />
                </Link>
              ))}
            </div>
          </div>

          {/* Center Panel - Shadow Map */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[11px] font-medium uppercase tracking-widest text-white/40">
                Shadow Map — {totalCount} account{totalCount !== 1 ? "s" : ""}{" "}
                discovered
              </span>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-48 rounded-lg" />
                ))}
              </div>
            ) : profiles.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-lg border border-white/5 bg-white/2 py-20">
                <Fingerprint className="h-10 w-10 text-white/10 mb-4" />
                <p className="text-sm text-white/30 mb-1">
                  No shadow profiles found yet
                </p>
                <p className="text-xs text-white/15">
                  Add a selector and trigger a scan to discover ghost accounts
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {profiles.map((profile) => (
                  <ShadowCard
                    key={profile.id}
                    profile={profile}
                    onStatusChange={handleStatusChange}
                    onDelete={handleDelete}
                  />
                ))}

                {/* Blurred teaser cards for hidden profiles */}
                {hiddenCount > 0 &&
                  Array.from({ length: Math.min(hiddenCount, 4) }).map(
                    (_, i) => (
                      <div
                        key={`hidden-${i}`}
                        className="relative rounded-lg border border-white/5 bg-white/2 p-5 overflow-hidden"
                      >
                        <div className="blur-[6px] pointer-events-none select-none space-y-3">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-md bg-white/5" />
                            <div className="space-y-1.5">
                              <div className="h-3 w-24 rounded bg-white/8" />
                              <div className="h-2 w-32 rounded bg-white/5" />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="h-2.5 w-full rounded bg-white/5" />
                            <div className="h-2.5 w-3/4 rounded bg-white/5" />
                            <div className="h-2.5 w-1/2 rounded bg-white/5" />
                          </div>
                        </div>
                      </div>
                    )
                  )}

                {/* Upgrade banner — only for free users */}
                {hiddenCount > 0 && planData?.current_plan === "free" && (
                  <div className="md:col-span-2 flex items-center justify-between rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-5 py-4">
                    <div>
                      <p className="text-sm font-medium text-white">
                        +{hiddenCount} more shadow profile{hiddenCount !== 1 ? "s" : ""} hidden
                      </p>
                      <p className="text-xs text-white/40 mt-0.5">
                        Upgrade to see all discovered accounts and take action
                      </p>
                    </div>
                    <Link
                      href="/dashboard/billing?plan=monthly"
                      className="shrink-0 rounded-md bg-emerald-500/15 border border-emerald-500/30 px-4 py-2 text-xs font-mono uppercase tracking-wider text-emerald-400 hover:bg-emerald-500/25 transition-colors"
                    >
                      {hasUsedTrial ? "Upgrade" : "Start Free Trial"}
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Sidebar - Remediation Queue */}
          <div className="lg:w-[260px] shrink-0">
            <div className="rounded-lg border border-white/5 bg-white/2 p-4">
              <div className="flex items-center gap-2 mb-4">
                <ShieldAlert className="h-3.5 w-3.5 text-red-400/60" />
                <span className="text-[11px] font-medium uppercase tracking-widest text-white/40">
                  Remediation Queue
                </span>
              </div>
              {isLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </div>
              ) : (
                <RemediationQueue
                  profiles={profiles.map((p) => ({
                    shadow_profile_id: p.id,
                    site_name: p.site_name,
                    has_breach: p.has_breach,
                    profile_url: p.profile_url,
                  }))}
                  isPremium={isPremium}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
