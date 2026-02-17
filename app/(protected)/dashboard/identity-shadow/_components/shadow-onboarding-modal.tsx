"use client";

import { useState, useEffect } from "react";
import {
  Fingerprint,
  Mail,
  Phone,
  User,
  Search,
  ArrowRight,
  X,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "gs_shadow_onboarding_seen";

export default function ShadowOnboardingModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      const seen = localStorage.getItem(STORAGE_KEY);
      if (!seen) setTimeout(() => setOpen(true), 0);
    } catch {
      // SSR or storage unavailable
    }
  }, []);

  const dismiss = () => {
    setOpen(false);
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // silent
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={dismiss}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg rounded-2xl border border-white/10 bg-[#0a0a0a] shadow-2xl overflow-hidden">
        {/* Close */}
        <button
          onClick={dismiss}
          className="absolute right-4 top-4 text-white/20 hover:text-white/60 transition z-10"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Header */}
        <div className="px-6 pt-8 pb-5 border-b border-white/5">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <Fingerprint className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">
                Welcome to Identity Shadow
              </h2>
              <p className="text-xs text-white/35">
                Find ghost accounts across the web
              </p>
            </div>
          </div>
          <p className="text-sm text-white/45 leading-relaxed">
            GhostSweep searches hundreds of websites for accounts tied to your
            identity. To get the best results, add the selectors you actually use
            online.
          </p>
        </div>

        {/* Selector guidance */}
        <div className="px-6 py-5 space-y-4">
          <p className="text-[11px] font-medium uppercase tracking-widest text-white/30">
            What to add as selectors
          </p>

          <div className="space-y-3">
            {/* Usernames */}
            <div className="flex items-start gap-3 rounded-xl bg-white/3 border border-white/5 p-3.5">
              <User className="h-4 w-4 text-amber-400/70 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium text-white mb-1">
                  Usernames you use
                </p>
                <p className="text-xs text-white/40 leading-relaxed">
                  Add usernames you think you&apos;ve signed up with — not your full
                  legal name. One word, no spaces. Hyphens, underscores, and dots
                  are fine.
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {["johndoe", "j_doe99", "jd-gaming"].map((ex) => (
                    <span
                      key={ex}
                      className="rounded bg-white/5 px-2 py-0.5 text-[11px] font-mono text-amber-400/60"
                    >
                      {ex}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Email */}
            <div className="flex items-start gap-3 rounded-xl bg-white/3 border border-white/5 p-3.5">
              <Mail className="h-4 w-4 text-emerald-400/70 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium text-white mb-1">
                  Email addresses
                </p>
                <p className="text-xs text-white/40 leading-relaxed">
                  Add every email you&apos;ve used to sign up for things — personal,
                  work, old ones you forgot about.
                </p>
              </div>
            </div>

            {/* Phone */}
            <div className="flex items-start gap-3 rounded-xl bg-white/3 border border-white/5 p-3.5">
              <Phone className="h-4 w-4 text-blue-400/70 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium text-white mb-1">
                  Phone numbers
                </p>
                <p className="text-xs text-white/40 leading-relaxed">
                  Include country code. Many services link accounts to phone
                  numbers.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* How it works */}
        <div className="px-6 py-4 border-t border-white/5 bg-white/2">
          <div className="flex items-start gap-3 mb-4">
            <Search className="h-4 w-4 text-white/30 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-medium text-white mb-1">
                How the scan works
              </p>
              <p className="text-xs text-white/35 leading-relaxed">
                We search hundreds of services for profiles matching your
                selectors. Each result is cross-referenced with breach databases
                and risk-scored on your dashboard.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <ShieldCheck className="h-4 w-4 text-emerald-400/50 mt-0.5 shrink-0" />
            <p className="text-xs text-white/35 leading-relaxed">
              Your selectors are only used for scanning and are never shared.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-5 border-t border-white/5 flex justify-end">
          <Button
            onClick={dismiss}
            className="bg-emerald-500 text-black hover:bg-emerald-400 font-semibold rounded-lg px-6 text-sm flex items-center gap-2"
          >
            Got it, let&apos;s go
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
