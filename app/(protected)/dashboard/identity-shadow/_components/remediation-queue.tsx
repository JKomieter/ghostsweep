"use client";

import { Shield, Eye, Lock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

type BreachEntry = {
  shadow_profile_id: string;
  site_name: string;
  has_breach: boolean;
  profile_url: string;
};

export default function RemediationQueue({
  profiles,
  isPremium,
}: {
  profiles: BreachEntry[];
  isPremium: boolean;
}) {
  const breachedProfiles = profiles.filter((p) => p.has_breach);

  const handleReveal = () => {
    if (!isPremium) {
      // Navigate to billing / checkout
      window.location.href = "/dashboard/billing?plan=monthly";
    }
  };

  return (
    <div className="space-y-6">
      {/* Breach Ticker */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
          <span className="text-[11px] font-medium uppercase tracking-widest text-foreground/40">
            Active Breaches
          </span>
        </div>

        {breachedProfiles.length === 0 ? (
          <div className="rounded-lg border border-foreground/5 bg-foreground/2 p-4 text-center">
            <Shield className="h-5 w-5 text-emerald-500/60 mx-auto mb-2" />
            <p className="text-xs text-foreground/30">No breaches detected</p>
          </div>
        ) : (
          <div className="space-y-1.5 max-h-[280px] overflow-y-auto pr-1 custom-scrollbar">
            {breachedProfiles.map((entry, i) => (
              <div
                key={i}
                className="rounded-md border border-red-500/10 bg-red-500/3 px-3 py-2.5 hover:border-red-500/20 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-foreground/60">
                    {entry.site_name}
                  </span>
                  <span className="text-[10px] font-mono text-red-600 dark:text-red-400 uppercase">
                    leaked
                  </span>
                </div>
                <p
                  className={`text-[10px] font-mono mt-1 ${
                    isPremium ? "text-foreground/40" : "blur-[3px] text-foreground/40 select-none"
                  }`}
                >
                  {entry.profile_url}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Reveal Toggle / Upgrade CTA */}
      {!isPremium && breachedProfiles.length > 0 && (
        <div className="rounded-lg border border-emerald-500/20 bg-linear-to-br from-emerald-500/5 to-transparent p-4">
          <div className="flex items-center gap-2 mb-2">
            <Lock className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              Reveal Full Data
            </span>
          </div>
          <p className="text-[11px] text-foreground/40 mb-3 leading-relaxed">
            Upgrade to see full profile URLs, leaked credentials, and unlock
            automated account deletion.
          </p>
          <Button
            size="sm"
            onClick={handleReveal}
            className="w-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/30 text-xs gap-1.5"
          >
            Upgrade to Pro
            <ArrowRight className="h-3 w-3" />
          </Button>
        </div>
      )}

      {/* Cleartext toggle for premium users */}
      {isPremium && breachedProfiles.length > 0 && (
        <div className="flex items-center justify-between rounded-lg border border-foreground/5 bg-foreground/2 px-3 py-2.5">
          <div className="flex items-center gap-2">
            <Eye className="h-3.5 w-3.5 text-foreground/40" />
            <span className="text-xs text-foreground/60">Show Full URLs</span>
          </div>
          <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
        </div>
      )}
    </div>
  );
}
