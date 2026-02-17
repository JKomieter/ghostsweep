/* eslint-disable @next/next/no-img-element */
"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, EyeOff, Trash2, RotateCcw, X } from "lucide-react";

export type ShadowProfileStatus = "active" | "ignored" | "deleted";

export type ShadowProfile = {
  id: string;
  site_name: string;
  profile_url: string;
  risk_level: number;
  status: ShadowProfileStatus;
  last_verified_at: string;
  has_breach: boolean;
};

export default function ShadowCard({
  profile,
  onStatusChange,
  onDelete,
}: {
  profile: ShadowProfile;
  onStatusChange: (id: string, status: ShadowProfileStatus) => void;
  onDelete: (id: string) => void;
}) {
  const isHighRisk = profile.has_breach || profile.risk_level >= 4;
  const isMediumRisk = profile.risk_level >= 2 && profile.risk_level < 4;

  // Extract domain from URL
  const domain = (() => {
    try {
      return new URL(profile.profile_url).hostname.replace("www.", "");
    } catch {
      return profile.site_name;
    }
  })();

  // Calculate how old the account is
  const discoveredDate = profile.last_verified_at
    ? new Date(profile.last_verified_at).toISOString().split("T")[0]
    : "Unknown";

  return (
    <div
      className={`group relative rounded-lg border bg-white/2 p-5 transition-all duration-300 ${
        isHighRisk
          ? "border-red-500/30 hover:border-red-500/60 shadow-[0_0_15px_rgba(255,49,49,0.06)]"
          : isMediumRisk
          ? "border-amber-500/20 hover:border-amber-500/40"
          : "border-white/5 hover:border-white/10"
      }`}
    >
      {/* Scan line effect on hover */}
      <div className="absolute inset-0 overflow-hidden rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        <div className="absolute inset-x-0 h-px bg-linear-to-r from-transparent via-emerald-500/40 to-transparent animate-[scanline_2s_linear_infinite]" />
      </div>

      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-white/5 overflow-hidden">
            <img
              src={`https://img.logo.dev/${domain}?token=${process.env.NEXT_PUBLIC_LOGO_DEV_PUBLISHABLE_KEY}&size=64&format=png`}
              alt={domain}
              className="h-full w-full object-contain"
              onError={(e) => {
                const el = e.currentTarget;
                el.style.display = "none";
                el.parentElement!.innerHTML = `<span class="text-xs font-bold text-white/60 uppercase font-mono">${domain.slice(0, 2)}</span>`;
              }}
            />
          </div>
          <div>
            <p className="text-sm font-medium text-white">{domain}</p>
          </div>
        </div>
        {isHighRisk && (
          <Badge className="bg-red-500/15 text-red-400 border-red-500/30 text-[10px] font-mono uppercase tracking-wider">
            High Risk
          </Badge>
        )}
        {isMediumRisk && !isHighRisk && (
          <Badge className="bg-amber-500/15 text-amber-400 border-amber-500/30 text-[10px] font-mono uppercase tracking-wider">
            Medium
          </Badge>
        )}
        {!isHighRisk && !isMediumRisk && (
          <Badge className="bg-white/5 text-white/40 border-white/10 text-[10px] font-mono uppercase tracking-wider">
            Low
          </Badge>
        )}
      </div>

      {/* Data rows */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center justify-between text-xs">
          <span className="text-white/30 font-mono uppercase tracking-wider">
            Site
          </span>
          <span className="text-white/70 font-mono">{profile.site_name}</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-white/30 font-mono uppercase tracking-wider">
            Discovered
          </span>
          <span className="text-white/70 font-mono">{discoveredDate}</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-white/30 font-mono uppercase tracking-wider">
            Status
          </span>
          <span
            className={`font-mono ${
              profile.status === "active"
                ? "text-emerald-400"
                : profile.status === "deleted"
                ? "text-red-400"
                : "text-amber-400"
            }`}
          >
            {profile.status}
          </span>
        </div>
        {profile.has_breach && (
          <div className="flex items-center justify-between text-xs">
            <span className="text-white/30 font-mono uppercase tracking-wider">
              Breach
            </span>
            <span className="text-red-400 font-mono flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
              Compromised
            </span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.open(profile.profile_url, "_blank")}
          className="flex-1 border-white/10 text-white/60 hover:border-emerald-500/40 hover:text-emerald-400 hover:bg-emerald-500/5 font-mono text-xs uppercase tracking-wider gap-1.5"
        >
          <ExternalLink className="h-3 w-3" />
          Visit
        </Button>
        {profile.status === "active" && (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onStatusChange(profile.id, "ignored")}
              className="border-white/10 text-white/40 hover:text-amber-400 hover:border-amber-500/30 hover:bg-amber-500/5"
              title="Ignore"
            >
              <EyeOff className="h-3 w-3" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onStatusChange(profile.id, "deleted")}
              className="border-white/10 text-white/40 hover:text-red-400 hover:border-red-500/30 hover:bg-red-500/5"
              title="Mark as deleted"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </>
        )}
        {profile.status !== "active" && (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onStatusChange(profile.id, "active")}
              className="border-white/10 text-white/40 hover:text-emerald-400 hover:border-emerald-500/30 hover:bg-emerald-500/5"
              title="Restore to active"
            >
              <RotateCcw className="h-3 w-3" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(profile.id)}
              className="border-white/10 text-white/40 hover:text-red-500 hover:border-red-500/40 hover:bg-red-500/5"
              title="Remove permanently"
            >
              <X className="h-3 w-3" />
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
