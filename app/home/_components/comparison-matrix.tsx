"use client";

import { CheckCircle, X } from "lucide-react";

export function ComparisonMatrix() {
  const features = [
    {
      name: "Account Discovery",
      description: "Find forgotten accounts across the web",
      manual: false,
      deleteMe: false,
      ghostsweep: true,
      ghostsweepDetail: "10+ Year History",
    },
    {
      name: "Shadow Mapping",
      description: "Visualize exposure and data broker connections",
      manual: false,
      deleteMe: false,
      ghostsweep: true,
      ghostsweepDetail: "Interactive Network Graph",
    },
    {
      name: "Data Broker Opt-Out",
      description: "Deletion templates for 100+ data brokers",
      manual: true,
      manual_detail: "100+ Hours",
      deleteMe: true,
      deleteMe_detail: "Yearly Subscription",
      ghostsweep: true,
      ghostsweepDetail: "Templates & tracking",
    },
    {
      name: "Credential Audit",
      description: "Find password leaks and breached accounts",
      manual: false,
      deleteMe: false,
      ghostsweep: true,
      ghostsweepDetail: "HaveIBeenPwned Integration",
    },
    {
      name: "Multi-User (B2B)",
      description: "Admin dashboard for team/executive management",
      manual: false,
      deleteMe: false,
      ghostsweep: true,
      ghostsweepDetail: "Built-in Admin Suite",
    },
    {
      name: "CCPA Compliance",
      description: "Legal right-to-delete workflow",
      manual: true,
      manual_detail: "DIY",
      deleteMe: true,
      deleteMe_detail: "Basic",
      ghostsweep: true,
      ghostsweepDetail: "Guided workflow",
    },
    {
      name: "Privacy-First",
      description: "Zero-storage scanning, no password access",
      manual: true,
      manual_detail: "Your control",
      deleteMe: false,
      ghostsweep: true,
      ghostsweepDetail: "OAuth 2.0, CASA Certified",
    },
    {
      name: "Cost",
      description: "Annual cost for single user",
      manual: true,
      manual_detail: "$0 (Your time)",
      deleteMe: true,
      deleteMe_detail: "$129-149/year",
      ghostsweep: true,
      ghostsweepDetail: "$79/year (or $9.99/mo)",
    },
  ];

  return (
    <section className="space-y-8">
      <div className="space-y-2 text-center">
        <h2 className="text-2xl sm:text-3xl font-semibold text-white">
          How GhostSweep compares
        </h2>
        <p className="mx-auto max-w-2xl text-sm text-zinc-400">
          A side-by-side view of manual work, traditional services, and GhostSweep.
        </p>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block rounded-2xl border border-white/10 bg-[#050509] overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 bg-white/5">
              <th className="text-left p-4 font-semibold text-white min-w-[220px]">
                Feature
              </th>
              <th className="text-center p-4 font-semibold text-white">
                Manual Deletion
              </th>
              <th className="text-center p-4 font-semibold text-white">
                DeleteMe / Onerep
              </th>
              <th className="text-center p-4 font-semibold text-white">
                GhostSweep
              </th>
            </tr>
          </thead>
          <tbody>
            {features.map((feature, i) => (
              <tr key={i} className="border-b border-white/10 hover:bg-white/2 transition">
                <td className="p-4">
                  <p className="font-medium text-white">{feature.name}</p>
                  <p className="text-xs text-zinc-400 mt-1">
                    {feature.description}
                  </p>
                </td>
                <td className="p-4 text-center">
                  {feature.manual ? (
                    <div className="space-y-1">
                      <CheckCircle className="h-5 w-5 text-yellow-400 mx-auto" />
                      {feature.manual_detail && (
                        <p className="text-xs text-zinc-400">
                          {feature.manual_detail}
                        </p>
                      )}
                    </div>
                  ) : (
                    <X className="h-5 w-5 text-zinc-600 mx-auto" />
                  )}
                </td>
                <td className="p-4 text-center">
                  {feature.deleteMe ? (
                    <div className="space-y-1">
                      <CheckCircle className="h-5 w-5 text-blue-400 mx-auto" />
                      {feature.deleteMe_detail && (
                        <p className="text-xs text-zinc-400">
                          {feature.deleteMe_detail}
                        </p>
                      )}
                    </div>
                  ) : (
                    <X className="h-5 w-5 text-zinc-600 mx-auto" />
                  )}
                </td>
                <td className="p-4 text-center">
                  {feature.ghostsweep ? (
                    <div className="space-y-1">
                      <CheckCircle className="h-5 w-5 text-emerald-400 mx-auto" />
                      {feature.ghostsweepDetail && (
                        <p className="text-xs text-emerald-300">
                          {feature.ghostsweepDetail}
                        </p>
                      )}
                    </div>
                  ) : (
                    <X className="h-5 w-5 text-zinc-600 mx-auto" />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {features.map((feature, i) => (
          <div
            key={i}
            className="rounded-xl border border-white/10 bg-[#050509] p-4 space-y-3"
          >
            <div>
              <p className="font-semibold text-white text-sm">{feature.name}</p>
              <p className="text-xs text-zinc-400 mt-1">
                {feature.description}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="rounded bg-white/5 p-2">
                <p className="text-xs text-zinc-400 mb-1">Manual</p>
                {feature.manual ? (
                  <div className="space-y-1">
                    <CheckCircle className="h-4 w-4 text-yellow-400 mx-auto" />
                    {feature.manual_detail && (
                      <p className="text-[10px] text-zinc-500">
                        {feature.manual_detail}
                      </p>
                    )}
                  </div>
                ) : (
                  <X className="h-4 w-4 text-zinc-600 mx-auto" />
                )}
              </div>

              <div className="rounded bg-white/5 p-2">
                <p className="text-xs text-zinc-400 mb-1">DeleteMe</p>
                {feature.deleteMe ? (
                  <div className="space-y-1">
                    <CheckCircle className="h-4 w-4 text-blue-400 mx-auto" />
                    {feature.deleteMe_detail && (
                      <p className="text-[10px] text-zinc-500">
                        {feature.deleteMe_detail}
                      </p>
                    )}
                  </div>
                ) : (
                  <X className="h-4 w-4 text-zinc-600 mx-auto" />
                )}
              </div>

              <div className="rounded border border-white/10 bg-white/5 p-2">
                <p className="text-xs text-zinc-200 mb-1 font-medium">
                  GhostSweep
                </p>
                {feature.ghostsweep ? (
                  <div className="space-y-1">
                    <CheckCircle className="h-4 w-4 text-emerald-400 mx-auto" />
                    {feature.ghostsweepDetail && (
                      <p className="text-[10px] text-zinc-400">
                        {feature.ghostsweepDetail}
                      </p>
                    )}
                  </div>
                ) : (
                  <X className="h-4 w-4 text-zinc-600 mx-auto" />
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Note */}
      <div className="rounded-xl border border-white/10 bg-white/2 p-6 text-center space-y-3">
        <p className="text-sm text-zinc-400">
          This is a simplified view. Your inbox and risk profile are unique.
        </p>
        <p className="text-xs text-zinc-500">
          You can try Pro features free for 1 day to see how it feels in practice.
        </p>
      </div>
    </section>
  );
}
