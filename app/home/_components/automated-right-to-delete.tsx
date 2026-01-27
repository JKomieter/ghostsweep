"use client";

import { useState, useEffect } from "react";
import { Mail, Zap, CheckCircle, Clock } from "lucide-react";

type RequestStatus = "idle" | "pending" | "success" | "error";

interface DeletionRequest {
  broker: string;
  status: RequestStatus;
  timestamp?: string;
}

export function AutomatedRightToDelete() {
  const [requests, setRequests] = useState<DeletionRequest[]>([
    { broker: "Acxiom", status: "success", timestamp: "2 min ago" },
    { broker: "Spokeo", status: "success", timestamp: "1 min ago" },
    { broker: "Whitepages", status: "pending" },
    { broker: "CoreLogic", status: "pending" },
    { broker: "MyLife", status: "idle" },
    { broker: "People Data Labs", status: "idle" },
  ]);

  const topBrokers = [
    "Acxiom",
    "Spokeo",
    "Whitepages",
    "CoreLogic",
    "MyLife",
    "People Data Labs",
    "Epsilon",
    "Experian",
  ];

  useEffect(() => {
    // Simulate automatic progression of deletion requests
    const interval = setInterval(() => {
      setRequests((prev) =>
        prev.map((req) => {
          if (req.status === "idle") {
            return { ...req, status: "pending" };
          } else if (
            req.status === "pending" &&
            Math.random() > 0.3
          ) {
            return {
              ...req,
              status: "success",
              timestamp: "just now",
            };
          }
          return req;
        })
      );
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const successCount = requests.filter((r) => r.status === "success").length;
  const pendingCount = requests.filter((r) => r.status === "pending").length;
  const totalCount = requests.length;

  return (
    <section className="space-y-8">
      <div className="space-y-3 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] font-medium text-zinc-300">
          <Zap className="h-3 w-3 text-zinc-400" />
          Right-to-delete workflow
        </div>
        <h2 className="text-2xl sm:text-3xl font-semibold text-white">
          Deletion templates, without the chaos
        </h2>
        <p className="mx-auto max-w-xl text-sm text-zinc-400">
          We prepare CCPA/CPRA-compliant drafts for US data brokers. You review, approve, and send from your own inbox.
        </p>
      </div>

      {/* Live Progress Section */}
      <div className="rounded-2xl border border-white/10 bg-[#050509] p-6 space-y-6">
        <h3 className="font-semibold text-white flex items-center gap-2">
          <Zap className="h-5 w-5 text-green-400" />
          Live Progress
        </h3>

        {/* Progress Stats */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg border border-white/10 bg-white/5 p-4">
            <p className="text-xl font-semibold text-emerald-300">{successCount}</p>
            <p className="text-xs text-zinc-400 mt-1">Requests sent</p>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/5 p-4">
            <p className="text-xl font-semibold text-amber-200">{pendingCount}</p>
            <p className="text-xs text-zinc-400 mt-1">In progress</p>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/5 p-4">
            <p className="text-xl font-semibold text-white">{totalCount}</p>
            <p className="text-xs text-zinc-400 mt-1">Total brokers</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-400">Overall completion</span>
            <span className="text-white font-semibold">
              {Math.round((successCount / totalCount) * 100)}%
            </span>
          </div>
          <div className="bg-white/5 rounded-full h-2.5 overflow-hidden">
            <div
              className="h-full bg-linear-to-r from-green-500 to-emerald-400 transition-all duration-500"
              style={{ width: `${(successCount / totalCount) * 100}%` }}
            />
          </div>
        </div>

        {/* Request List */}
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {requests.map((request) => (
            <div
              key={request.broker}
              className="flex items-center justify-between rounded-lg border border-white/10 bg-white/2 p-3 hover:bg-white/5 transition"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                {request.status === "success" && (
                  <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0" />
                )}
                {request.status === "pending" && (
                  <div className="h-4 w-4 rounded-full border-2 border-yellow-400 border-t-transparent animate-spin shrink-0" />
                )}
                {request.status === "idle" && (
                  <Clock className="h-4 w-4 text-zinc-500 shrink-0" />
                )}

                <span className="text-sm text-white truncate">
                  {request.broker}
                </span>
              </div>

              <div className="text-right">
                <span
                  className={`text-xs font-medium ${
                    request.status === "success"
                      ? "text-emerald-300"
                      : request.status === "pending"
                        ? "text-amber-200"
                        : "text-zinc-500"
                  }`}
                >
                  {request.status === "success" && "Sent"}
                  {request.status === "pending" && "In progress"}
                  {request.status === "idle" && "Queued"}
                </span>
                {request.timestamp && (
                  <p className="text-xs text-zinc-500 mt-0.5">
                    {request.timestamp}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* How It Works */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-white/10 bg-[#050509] p-5 space-y-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full border border-white/15 text-xs text-zinc-200">
            1
          </div>
          <h3 className="font-semibold text-white text-sm">Map Your Identity</h3>
          <p className="text-xs text-zinc-400">
            We verify your name, email, address, and phone number to create an
            accurate identity profile for deletion requests.
          </p>
        </div>

        <div className="rounded-xl border border-white/10 bg-[#050509] p-5 space-y-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full border border-white/15 text-xs text-zinc-200">
            2
          </div>
          <h3 className="font-semibold text-white text-sm">
            Generate CCPA Emails
          </h3>
          <p className="text-xs text-zinc-400">
            We automatically generate legally-compliant CCPA/CPRA &quot;Request to
            Delete&quot; emails for 100+ US brokers.
          </p>
        </div>

        <div className="rounded-xl border border-white/10 bg-[#050509] p-5 space-y-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full border border-white/15 text-xs text-zinc-200">
            3
          </div>
          <h3 className="font-semibold text-white text-sm">
            Auto-Send & Track
          </h3>
          <p className="text-xs text-zinc-400">
            You preview and approve each email, we send from your account, and
            track responses in your dashboard.
          </p>
        </div>
      </div>

      {/* Top Brokers Covered */}
      <div className="rounded-xl border border-white/10 bg-[#050509] p-6 space-y-4">
        <h3 className="font-semibold text-white flex items-center gap-2">
          <Mail className="h-5 w-5 text-zinc-300" />
          Examples of brokers covered
        </h3>
        <div className="grid gap-2 sm:grid-cols-2">
          {topBrokers.slice(0, 8).map((broker) => (
            <div
              key={broker}
              className="flex items-center gap-2 text-sm text-zinc-400"
            >
              <CheckCircle className="h-3.5 w-3.5 text-green-400 shrink-0" />
              {broker}
            </div>
          ))}
        </div>
        <p className="text-xs text-zinc-500">
          Plus additional US data brokers, including LexisNexis, Equifax, TransUnion and others.
        </p>
      </div>

      {/* Cost Comparison */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-white/10 bg-white/2 p-6">
          <p className="text-sm font-semibold text-white mb-3">Manual Deletion</p>
          <div className="space-y-2 text-xs text-zinc-400">
            <p>Many hours of research and emailing</p>
            <p>Each broker has different processes</p>
            <p>No unified tracking or follow-up</p>
            <p>High time cost if done manually</p>
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/5 p-6">
          <p className="text-sm font-semibold text-white mb-3">With GhostSweep</p>
          <div className="space-y-2 text-xs text-zinc-300">
            <p>Typical setup in a few minutes</p>
            <p>Templates designed to be legally consistent</p>
            <p>Central place to track responses</p>
            <p>Current price: $9.99/month</p>
          </div>
        </div>
      </div>
    </section>
  );
}
