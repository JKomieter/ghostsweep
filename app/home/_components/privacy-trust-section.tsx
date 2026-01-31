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
      title: "Transient Scanning, Zero Storage",
      description: "We read emails to find value, but we never store the body content.",
      details:
        "We scan the body of your emails transiently to identify gift cards, subscriptions, and receipts. Once the value is extracted, the raw email content is discarded immediately. We never store your personal letters or attachments.",
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
        "We use OAuth 2.0, the industry-standard protocol. You authenticate directly with Google or Microsoft, and they issue us a temporary, limited-scope token. You can revoke this token anytime from your account settings.",
    },
  ];

  return (
    <section className="space-y-8">
      <div className="space-y-3 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] font-medium text-zinc-300">
          <Shield className="h-3 w-3 text-zinc-400" />
          How GhostSweep treats your data
        </div>
        <h2 className="text-2xl sm:text-3xl font-semibold text-white">
          Privacy, explained simply
        </h2>
        <p className="mx-auto max-w-xl text-sm text-zinc-400">
          A clear overview of what GhostSweep can see, what it can't, and how we handle your data.
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
          <div className="text-sm font-medium text-white mb-1">No selling</div>
          <p className="text-xs text-zinc-400 leading-relaxed">
            We don't sell your data, run ads, or track you across other
            websites. Your privacy is the product, not the price.
          </p>
        </div>
        <div className="rounded-xl border border-white/10 bg-[#050509] p-5">
          <div className="text-sm font-medium text-white mb-1">Revoke anytime</div>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Disconnect Gmail or Outlook from GhostSweep settings anytime. We
            lose access immediately.
          </p>
        </div>
        <div className="rounded-xl border border-white/10 bg-[#050509] p-5">
          <div className="text-sm font-medium text-white mb-1">Encrypted</div>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Data in transit and at rest uses AES-256 encryption. Even our team
            can't decrypt your account mappings.
          </p>
        </div>
        <div className="rounded-xl border border-white/10 bg-[#050509] p-5">
          <div className="text-sm font-medium text-white mb-1">GDPR ready</div>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Full compliance with GDPR, CCPA, and other data protection laws. You
            own your data.
          </p>
        </div>
      </div>
    </section>
  );
}
