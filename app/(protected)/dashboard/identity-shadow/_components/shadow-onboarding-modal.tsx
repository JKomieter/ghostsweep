"use client";

import { useState, useEffect } from "react";
import {
  Fingerprint,
  Mail,
  Phone,
  User,
  ArrowRight,
  ShieldCheck,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";

const STORAGE_KEY = "gs_shadow_onboarding_seen";

const SELECTOR_TIPS = [
  {
    icon: User,
    iconClass: "text-amber-700/70 dark:text-amber-400/70",
    title: "Usernames you use",
    body: "Handles you've signed up with, not your legal name. One word; hyphens, underscores and dots are fine.",
    examples: ["johndoe", "j_doe99", "jd-gaming"],
  },
  {
    icon: Mail,
    iconClass: "text-emerald-600/70 dark:text-emerald-400/70",
    title: "Email addresses",
    body: "Every email you've signed up with: personal, work, and old ones you've forgotten.",
  },
  {
    icon: Phone,
    iconClass: "text-blue-600/70 dark:text-blue-400/70",
    title: "Phone numbers",
    body: "Include the country code. Many services link accounts to a phone number.",
  },
];

interface ShadowOnboardingModalProps {
  /** Controlled open state (e.g. reopened from a help button). */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export default function ShadowOnboardingModal({
  open: controlledOpen,
  onOpenChange,
}: ShadowOnboardingModalProps) {
  const [autoOpen, setAutoOpen] = useState(false);

  // Show automatically on the first visit only.
  useEffect(() => {
    try {
      if (!localStorage.getItem(STORAGE_KEY)) setTimeout(() => setAutoOpen(true), 0);
    } catch {
      // storage unavailable
    }
  }, []);

  const open = autoOpen || !!controlledOpen;

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setAutoOpen(false);
      try {
        localStorage.setItem(STORAGE_KEY, "1");
      } catch {
        // silent
      }
    }
    onOpenChange?.(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        showCloseButton={false}
        className={
          // Mobile: bottom sheet. sm+: centred dialog. Both height-capped with a scrolling body.
          "flex flex-col gap-0 p-0 overflow-hidden bg-card border-foreground/10 " +
          "top-auto bottom-0 left-0 translate-x-0 translate-y-0 max-w-full rounded-b-none rounded-t-2xl max-h-[85dvh] " +
          "max-sm:data-[state=open]:zoom-in-100 max-sm:data-[state=closed]:zoom-out-100 " +
          "max-sm:data-[state=open]:slide-in-from-bottom-10 max-sm:data-[state=closed]:slide-out-to-bottom-10 " +
          "sm:top-[50%] sm:bottom-auto sm:left-[50%] sm:translate-x-[-50%] sm:translate-y-[-50%] sm:max-w-lg sm:rounded-lg sm:max-h-[min(90dvh,44rem)]"
        }
      >
        {/* Close: 40px tap target, always visible */}
        <DialogClose
          className="absolute right-2 top-2 sm:right-3 sm:top-3 z-10 flex h-10 w-10 items-center justify-center rounded-full text-foreground/40 hover:text-foreground/80 hover:bg-foreground/5 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </DialogClose>

        {/* Grab handle (mobile affordance) */}
        <div className="sm:hidden flex justify-center pt-2.5 pb-1" aria-hidden>
          <div className="h-1 w-10 rounded-full bg-foreground/15" />
        </div>

        {/* Header (fixed) */}
        <div className="shrink-0 px-5 pt-3 pb-4 sm:px-6 sm:pt-6 border-b border-foreground/10 pr-12">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 shrink-0 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <Fingerprint className="h-4.5 w-4.5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="min-w-0">
              <DialogTitle className="text-base font-semibold text-foreground leading-tight">
                Welcome to Identity Shadow
              </DialogTitle>
              <DialogDescription className="text-xs text-foreground/45 mt-1">
                Add the selectors you use online so we can find accounts tied to you.
              </DialogDescription>
            </div>
          </div>
        </div>

        {/* Body (scrolls) */}
        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-5 py-4 sm:px-6 sm:py-5 space-y-3">
          <p className="text-xs font-medium text-foreground/55">What to add</p>

          {SELECTOR_TIPS.map(({ icon: Icon, iconClass, title, body, examples }) => (
            <div
              key={title}
              className="flex items-start gap-3 rounded-lg bg-foreground/3 border border-foreground/10 p-3"
            >
              <Icon className={`h-4 w-4 mt-0.5 shrink-0 ${iconClass}`} />
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground">{title}</p>
                <p className="text-xs text-foreground/55 leading-relaxed mt-0.5">{body}</p>
                {examples && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {examples.map((ex) => (
                      <span
                        key={ex}
                        className="rounded bg-foreground/5 px-2 py-0.5 text-[11px] font-mono text-amber-700/70 dark:text-amber-400/70"
                      >
                        {ex}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          <p className="text-xs text-foreground/45 leading-relaxed pt-1">
            We check hundreds of services for matching profiles, cross-reference
            each one with breach databases, and risk-score the results.
          </p>
          <p className="flex items-start gap-2 text-xs text-foreground/45 leading-relaxed">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600/60 dark:text-emerald-400/60 mt-0.5 shrink-0" />
            Your selectors are only used for scanning and are never shared.
          </p>
        </div>

        {/* Footer (pinned) */}
        <div className="shrink-0 px-5 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-6 sm:py-4 border-t border-foreground/10 bg-card">
          <Button
            onClick={() => handleOpenChange(false)}
            className="w-full sm:w-auto sm:ml-auto sm:flex h-11 sm:h-9 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold rounded-lg px-6 text-sm items-center gap-2"
          >
            Got it, let&apos;s go
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
