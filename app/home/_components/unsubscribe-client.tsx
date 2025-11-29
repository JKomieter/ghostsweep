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
      <div className="mt-4 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4">
        <h2 className="text-sm font-semibold text-emerald-200">
          You’re unsubscribed
        </h2>
        <p className="mt-1 text-xs text-emerald-100/80">
          {email
            ? `We’ve unsubscribed ${email} from GhostSweep updates for this email type.`
            : "You’re unsubscribed from GhostSweep updates for this email type."}
        </p>
        <p className="mt-2 text-[11px] text-emerald-100/70">
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
          className="block text-xs font-medium text-white/70"
        >
          Email address
        </label>
        <input
          id="email"
          type="email"
          value={email}
          placeholder="you@example.com"
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-md border border-white/10 bg-black/60 px-3 py-2 text-sm text-white outline-none focus-visible:ring-2 focus-visible:ring-primary"
        />
      </div>

      {/* If you want multiple lists later, you can expand this */}
      <input type="hidden" value={list} readOnly />

      {error && (
        <p className="text-xs text-red-400 bg-red-500/10 rounded-md px-2 py-1">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full inline-flex items-center justify-center rounded-md bg-red-500 px-3 py-2 text-sm font-medium text-black hover:bg-red-400 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isSubmitting ? "Unsubscribing..." : "Unsubscribe from these emails"}
      </button>
    </form>
  );
}