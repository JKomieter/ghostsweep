/* eslint-disable react/no-unescaped-entities */
"use client";

import { ChevronDown, Lock, Eye, Shield } from "lucide-react";
import { useState } from "react";

export function PrivacyTrustSection() {
  const [openId, setOpenId] = useState<string | null>(null);

  const trustItems = [
    {
      id: "privilege",
      icon: Eye,
      title: "Principle of Least Privilege",
      description: "We only read email metadata (headers, from, to, subject).",
      details:
        "We never access the body of your emails, attachments, passwords, or any sensitive content. This approach is called 'metadata-only scanning' and is the gold standard for privacy-first email apps.",
    },
    {
      id: "processing",
      icon: Shield,
      title: "Local Processing & Hashing",
      description:
        "Account mapping is performed using hashed identifiers; your raw data never touches our permanent logs.",
      details:
        "We use cryptographic hashing to create a fingerprint of your data. Even if someone breached our servers, they'd find incomprehensible hash values, not your actual account details. Your raw email data is processed in-memory and discarded immediately—never stored permanently.",
    },
    {
      id: "oauth",
      icon: Lock,
      title: "OAuth 2.0 Security",
      description: "We never see or store your Google/Microsoft password.",
      details:
        "We use OAuth 2.0, the industry-standard protocol. You authenticate directly with Google or Microsoft, and they issue us a temporary, limited-scope token that only grants access to read email metadata. You can revoke this token anytime from your account settings.",
    },
  ];

  return (
    <section className="space-y-8">
      <div className="space-y-4 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-300">
          <Shield className="h-3 w-3" />
          Address #1 Reason People Bounce
        </div>
        <h2 className="text-3xl sm:text-4xl font-bold text-white">
          Privacy Shield: Why We're Different
        </h2>
        <p className="mx-auto max-w-2xl text-lg text-zinc-400">
          You don't need to trust us blindly. Here's exactly how we protect your
          data.
        </p>
      </div>

      {/* Trust Items */}
      <div className="space-y-3">
        {trustItems.map((item) => {
          const Icon = item.icon;
          const isOpen = openId === item.id;

          return (
            <div key={item.id}>
              <button
                onClick={() => setOpenId(isOpen ? null : item.id)}
                className="w-full rounded-xl border border-white/10 bg-[#050509] p-4 text-left hover:bg-white/5 transition"
              >
                <div className="flex items-start gap-3">
                  <Icon className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-white text-sm sm:text-base">
                      {item.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-zinc-400 mt-1">
                      {item.description}
                    </p>
                  </div>
                  <ChevronDown
                    className={`h-5 w-5 text-zinc-400 flex-shrink-0 transition-transform ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </div>
              </button>

              {isOpen && (
                <div className="border-b border-l border-r border-white/10 bg-white/2 p-4 text-sm text-zinc-400 rounded-b-xl">
                  {item.details}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Trust Badges */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-white/10 bg-[#050509] p-5">
          <div className="text-2xl font-bold text-white mb-2">No Selling</div>
          <p className="text-xs text-zinc-400">
            We don't sell your data, run ads, or track you across other
            websites. Your privacy is the product, not the price.
          </p>
        </div>
        <div className="rounded-xl border border-white/10 bg-[#050509] p-5">
          <div className="text-2xl font-bold text-white mb-2">Revoke Anytime</div>
          <p className="text-xs text-zinc-400">
            Disconnect Gmail or Outlook from GhostSweep settings anytime. We
            lose access immediately.
          </p>
        </div>
        <div className="rounded-xl border border-white/10 bg-[#050509] p-5">
          <div className="text-2xl font-bold text-white mb-2">Encrypted</div>
          <p className="text-xs text-zinc-400">
            Data in transit and at rest uses AES-256 encryption. Even our team
            can't decrypt your account mappings.
          </p>
        </div>
        <div className="rounded-xl border border-white/10 bg-[#050509] p-5">
          <div className="text-2xl font-bold text-white mb-2">GDPR Ready</div>
          <p className="text-xs text-zinc-400">
            Full compliance with GDPR, CCPA, and other data protection laws. You
            own your data.
          </p>
        </div>
      </div>
    </section>
  );
}
