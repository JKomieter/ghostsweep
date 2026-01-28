"use client";

import { useState } from "react";
import { toast } from "sonner";

type Props = {
  initialEmail?: string;
  initialList?: string;
};

export default function UnsubscribeClient({ initialEmail = "", initialList = "product-updates" }: Props) {
  const [email, setEmail] = useState(initialEmail);
  const [list] = useState(initialList);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email) {
      setError("Please enter your email address.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/unsubscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, list }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to update preferences.");
      }

      setDone(true);
      toast.success("You’ve been unsubscribed.");
    } catch (err) {
      console.error("Unsubscribe error:", err);
      setError("Something went wrong.");
      toast.error("Could not unsubscribe. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className="mt-4 rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-4 backdrop-blur-sm">
        <h2 className="text-sm font-light text-emerald-300">
          You&apos;re unsubscribed
        </h2>
        <p className="mt-1 text-xs text-emerald-300/80">
          {email
            ? `We’ve unsubscribed ${email} from GhostSweep updates for this email type.`
            : "You’re unsubscribed from GhostSweep updates for this email type."}
        </p>
        <p className="mt-2 text-[11px] text-emerald-300/70">
          You may still receive important account or security messages if you
          have a GhostSweep account.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-4">
      <div className="space-y-1.5">
        <label
          htmlFor="email"
          className="block text-xs font-light text-white/60"
        >
          Email address
        </label>
        <input
          id="email"
          type="email"
          value={email}
          placeholder="you@example.com"
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-lg border border-white/5 bg-white/2 px-3 py-2 text-sm text-white placeholder:text-white/40 outline-none focus-visible:ring-2 focus-visible:ring-white/20 backdrop-blur-sm"
        />
      </div>

      {/* If you want multiple lists later, you can expand this */}
      <input type="hidden" value={list} readOnly />

      {error && (
        <p className="text-xs text-red-300 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 backdrop-blur-sm">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full inline-flex items-center justify-center rounded-lg bg-red-500 px-3 py-2 text-sm font-light text-white hover:bg-red-500/90 disabled:opacity-60 disabled:cursor-not-allowed transition"
      >
        {isSubmitting ? "Unsubscribing..." : "Unsubscribe from these emails"}
      </button>
    </form>
  );
}