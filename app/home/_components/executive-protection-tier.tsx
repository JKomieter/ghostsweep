"use client";

import { BarChart3, ArrowRight, Lock } from "lucide-react";
import Link from "next/link";

export function ExecutiveProtectionTier() {
  return (
    <section className="space-y-6">
      <div className="space-y-2 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] font-medium text-zinc-300">
          <BarChart3 className="h-3 w-3 text-zinc-400" />
          For security and admin teams
        </div>
        <h2 className="text-2xl sm:text-3xl font-semibold text-white">
          Executive protection, handled quietly
        </h2>
      </div>

      {/* Professional Dark Card with Blurred Background */}
      <div className="relative rounded-2xl border border-white/10 overflow-hidden">
        {/* Blurred background */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "url('data:image/svg+xml,%3Csvg width=%22100%22 height=%22100%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Crect fill=%22%23050509%22 width=%22100%22 height=%22100%22/%3E%3Ccircle cx=%2220%22 cy=%2220%22 r=%2215%22 fill=%22%2310b981%22 opacity=%220.3%22/%3E%3Crect x=%2240%22 y=%2235%22 width=%2230%22 height=%2230%22 fill=%22%233b82f6%22 opacity=%220.3%22/%3E%3C/svg%3E')",
            filter: "blur(8px)",
          } as React.CSSProperties}
        />

        {/* Card Content */}
        <div className="relative bg-[#050509]/95 backdrop-blur-sm p-6 sm:p-8 space-y-6">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-500/20 text-amber-400">
                <Lock className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-white">
                  Centralized Identity Monitoring
                </h3>
                <p className="text-sm text-zinc-400 mt-1">
                  Monitor your entire leadership team&apos;s digital footprint and exposure levels in one dashboard.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-500/20 text-amber-400">
                <BarChart3 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-white">
                  Executive Data Wiping
                </h3>
                <p className="text-sm text-zinc-400 mt-1">
                  Coordinated deletion requests to 100+ data brokers, keeping sensitive executive information private.
                </p>
              </div>
            </div>
          </div>

          <div className="border-t border-white/10 pt-4">
            <Link
              href="mailto:support@ghostsweep.com?subject=Inquiry:%20GhostSweep%20Executive%20Admin%20Suite"
              className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 py-2.5 text-xs font-medium text-zinc-50 hover:bg-white/10 transition"
            >
              Talk with the founder
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <p className="text-xs text-zinc-500 mt-3">
              Discreet rollout and pricing for leadership and admin teams.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
