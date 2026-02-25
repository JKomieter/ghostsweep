"use client";

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import AccountSelect from "./account_select";
import { Loader2, Clock, RefreshCw, Sparkles } from "lucide-react";
import { GmailLogo, OutLookLogo } from "@/svgs";
import Link from "next/link";

type LatestSweep = {
  status: "pending" | "processing" | "completed" | "failed" | "cancelled" | null;
  phaseLabel?: string | null;
  phaseStep?: number | null;
  phaseCount?: number | null;
  messagesProcessed?: number | null;
  progress?: number | null;
};

type GmailAccount = { id: string; gmail_address: string };
type MicrosoftAccount = { id: string; outlook_address: string };

export default function SweepDialog({
  open,
  onOpenChangeAction,
  isInProgress,
  latestSweep,
  getElapsedMinutesAction,
  connectedEmail,
  gmailAccounts,
  microsoftAccounts,
  selectedEmail,
  selectedProvider,
  onChangeSelectedAction,
  planIsFree,
  scanCreditsRemaining,
  isConnecting,
    onStartConnectAction,
  onSweepAction,
  onCancelAction,
  isCancelling,
}: {
  open: boolean;
  onOpenChangeAction: (open: boolean) => void;
  isInProgress: boolean;
  latestSweep?: LatestSweep;
  getElapsedMinutesAction: () => number;
  connectedEmail: string | null;
  gmailAccounts: GmailAccount[];
  microsoftAccounts: MicrosoftAccount[];
  selectedEmail: string;
  selectedProvider: "gmail" | "outlook" | null;
  onChangeSelectedAction: (email: string, provider: "gmail" | "outlook") => void;
  planIsFree: boolean;
  scanCreditsRemaining?: number;
  isConnecting: boolean;
  onStartConnectAction: () => void;
  onSweepAction: () => void;
  onCancelAction: () => void;
  isCancelling: boolean;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChangeAction}>
      <DialogContent className="bg-[#050505] border border-white/10 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base md:text-lg">
            {isInProgress ? "Sweep In Progress" : "Run a GhostSweep"}
          </DialogTitle>
          <DialogDescription className="text-xs text-white/60 md:text-sm">
            {isInProgress ? (
              <span>
                Your sweep is currently {" "}
                <span className="font-medium text-cyan-300">{latestSweep?.status}</span>. Please wait for it to complete.
              </span>
            ) : (
              <>
                We&apos;ll scan your inbox using <span className="font-medium">read-only metadata</span> (sender, subject, date) to detect services and known breaches.
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-3 space-y-3 text-xs md:text-sm">
          {!isInProgress && connectedEmail && (
            <div className="space-y-2">
              <label className="text-xs font-medium text-white/80">Select account to scan:</label>
              <AccountSelect
                gmailAccounts={gmailAccounts}
                microsoftAccounts={microsoftAccounts}
                valueEmail={selectedEmail || null}
                valueProvider={selectedProvider}
                onChangeAction={(email, provider) => onChangeSelectedAction(email, provider)}
              />
            </div>
          )}

          {isInProgress ? (
            <div className="rounded-lg border border-cyan-500/30 bg-cyan-500/10 p-3 space-y-2">
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-cyan-300" />
                <span className="font-medium text-cyan-100">{latestSweep?.phaseLabel ?? "Running GhostSweep…"}</span>
              </div>
              <p className="text-[11px] text-cyan-200/80">
                {latestSweep?.phaseStep && latestSweep?.phaseCount
                  ? `Phase ${latestSweep?.phaseStep} of ${latestSweep?.phaseCount}.`
                  : "Processing your inbox in multiple phases."}{" "}
                This usually takes a few minutes.
              </p>
              {typeof latestSweep?.messagesProcessed === "number" && (
                <p className="text-[11px] text-cyan-200/80">
                  Messages processed: <span className="font-semibold">{latestSweep.messagesProcessed.toLocaleString()}</span>
                </p>
              )}
              {typeof latestSweep?.progress === "number" && (
                <div className="mt-1">
                  <div className="h-1.5 bg-cyan-900/50 rounded-full overflow-hidden">
                    <div className="h-full bg-cyan-400 transition-all duration-300" style={{ width: `${latestSweep.progress}%` }} />
                  </div>
                  <p className="mt-1 text-[11px] text-cyan-200">{latestSweep.progress}% complete</p>
                </div>
              )}
              {getElapsedMinutesAction() > 0 && (
                <p className="text-[11px] text-cyan-200/70">
                  Running for {getElapsedMinutesAction()} minute{getElapsedMinutesAction() !== 1 ? "s" : ""}
                </p>
              )}
            </div>
          ) : connectedEmail ? (
            <>
              {selectedEmail && selectedProvider && (
                <p className="text-white/60 flex items-center gap-2">
                  {selectedProvider === "gmail" ? (
                    <GmailLogo className="h-3.5 w-3.5" />
                  ) : (
                    <OutLookLogo className="h-3.5 w-3.5" />
                  )}
                  <span>Will scan</span>
                  <span className="font-medium text-white truncate max-w-[200px] sm:max-w-[260px]">{selectedEmail}</span>
                </p>
              )}
              <p className="text-white/50">The sweep runs in the background and typically takes 10-20 minutes. You&apos;ll be notified when it completes.</p>
              
              {/* Scan Depth Indicator - Value Discovery */}
              <div className={`rounded-lg border p-3 ${planIsFree ? 'border-white/10 bg-white/5' : 'border-emerald-500/30 bg-emerald-500/10'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <Clock className={`h-4 w-4 ${planIsFree ? 'text-white/50' : 'text-emerald-400'}`} />
                  <span className={`text-xs font-semibold uppercase tracking-wider ${planIsFree ? 'text-white/50' : 'text-emerald-400'}`}>
                    Value Discovery Depth
                  </span>
                </div>
                {planIsFree ? (
                  <div className="space-y-2">
                    <p className="text-sm text-white/70">
                      <span className="font-medium text-white">Quick Scan:</span> Last 2 years of subscriptions & trials
                    </p>
                    <div className="flex items-center gap-2 pt-1 border-t border-white/10">
                      <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                      <Link
                        href="/dashboard/billing?plan=monthly"
                        className="text-xs text-amber-300 hover:text-amber-200 underline underline-offset-2 transition-colors"
                      >
                        Upgrade to Pro for{" "}
                        <span className="font-semibold">5 years</span> of value recovery →
                      </Link>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-white/80">
                    <span className="font-medium text-emerald-300">Deep Audit:</span> 5 years of subscriptions, trials & hidden charges
                  </p>
                )}
              </div>
              
              {planIsFree && (
                <p className="text-xs text-yellow-200/80 border-l-2 border-yellow-500/30 pl-3">Free plan: Up to 10 accounts shown.</p>
              )}

              {/* Buster credits remaining */}
              {!planIsFree && scanCreditsRemaining !== undefined && (
                <div className={`rounded-lg border p-3 flex items-center gap-3 ${
                  scanCreditsRemaining <= 1
                    ? "border-orange-500/30 bg-orange-500/10"
                    : "border-amber-500/30 bg-amber-500/10"
                }`}>
                  <div className="flex gap-1">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className={`h-2.5 w-2.5 rounded-full ${
                          i <= scanCreditsRemaining
                            ? scanCreditsRemaining <= 1 ? "bg-orange-400" : "bg-amber-400"
                            : "bg-white/15"
                        }`}
                      />
                    ))}
                  </div>
                  <p className={`text-xs font-medium ${
                    scanCreditsRemaining <= 1 ? "text-orange-300" : "text-amber-300"
                  }`}>
                    {scanCreditsRemaining} of 3 sweep credit{scanCreditsRemaining !== 1 ? "s" : ""} remaining
                    {scanCreditsRemaining === 1 && " — last one!"}
                  </p>
                </div>
              )}
            </>
          ) : (
            <>
              <p className="text-yellow-200">You haven&apos;t connected an email account yet.</p>
              <p className="text-white/50">Connect Gmail or Outlook to let GhostSweep analyze your email metadata.</p>
            </>
          )}

          {!isInProgress && (
            <div className="space-y-2 rounded-lg border border-cyan-500/20 bg-cyan-500/5 p-3">
              {!connectedEmail ? (
                <>
                  <p className="font-medium text-cyan-300">Permissions Required:</p>
                  <div className="space-y-2 text-[11px] text-white/70">
                    <div className="flex gap-2">
                      <span className="text-emerald-400">✓</span>
                      <div>
                        <span className="font-medium text-white">Read Email</span>
                        <p className="text-white/60">Required to scan your inbox for accounts and breaches</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-amber-400">◆</span>
                      <div>
                        <span className="font-medium text-white">Send Email (Optional)</span>
                        <p className="text-white/60">Allow this to send deletion requests directly from GhostSweep</p>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-medium text-cyan-300 mb-2">Connect more accounts:</p>
                    <div className="flex flex-wrap gap-2">
                      <a href="/api/google/oauth/start" onClick={onStartConnectAction}>
                        <Button size="sm" variant="outline" disabled={isConnecting} className="inline-flex items-center gap-1.5 border-white/20 text-xs">
                          <GmailLogo className="h-3.5 w-3.5" />
                          {isConnecting ? "Connecting..." : "Add Gmail"}
                        </Button>
                      </a>
                      <a href="/api/microsoft/oauth" onClick={onStartConnectAction}>
                        <Button size="sm" variant="outline" disabled={isConnecting} className="inline-flex items-center gap-1.5 border-white/20 text-xs">
                          <OutLookLogo className="h-3.5 w-3.5" />
                          {isConnecting ? "Connecting..." : "Add Outlook"}
                        </Button>
                      </a>
                    </div>
                  </div>
                  
                  {/* Reconnect existing accounts */}
                  {(gmailAccounts.length > 0 || microsoftAccounts.length > 0) && (
                    <div className="pt-3 border-t border-white/10">
                      <p className="text-xs font-medium text-white/50 mb-2 flex items-center gap-1.5">
                        <RefreshCw className="h-3 w-3" />
                        Reconnect an account (if token expired):
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {gmailAccounts.map(acc => (
                          <a key={acc.id} href="/api/google/oauth/start" onClick={onStartConnectAction}>
                            <Button size="sm" variant="ghost" disabled={isConnecting} className="h-7 text-[10px] text-white/60 hover:text-white hover:bg-white/10 gap-1">
                              <RefreshCw className="h-3 w-3" />
                              {acc.gmail_address.split('@')[0]}@...
                            </Button>
                          </a>
                        ))}
                        {microsoftAccounts.map(acc => (
                          <a key={acc.id} href="/api/microsoft/oauth" onClick={onStartConnectAction}>
                            <Button size="sm" variant="ghost" disabled={isConnecting} className="h-7 text-[10px] text-white/60 hover:text-white hover:bg-white/10 gap-1">
                              <RefreshCw className="h-3 w-3" />
                              {acc.outlook_address.split('@')[0]}@...
                            </Button>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
          <Button variant="ghost" size="sm" onClick={() => onOpenChangeAction(false)} className="w-full sm:w-auto">
            {isInProgress ? "Close" : "Cancel"}
          </Button>

          {!isInProgress && (
            <>
              {connectedEmail ? (
                <Button size="sm" onClick={onSweepAction} disabled={!selectedEmail} className="w-full sm:w-auto min-w-[140px]">
                  Start Sweep
                </Button>
              ) : (
                <div className="flex w-full flex-col-reverse gap-2 sm:w-auto sm:flex-row">
                  <a href="/api/google/oauth/start" onClick={onStartConnectAction}>
                    <Button size="sm" disabled={isConnecting} className="w-full sm:w-auto min-w-[130px] bg-red-600 hover:bg-red-700 text-white inline-flex items-center gap-1.5">
                      {isConnecting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Connecting…
                        </>
                      ) : (
                        <>
                          <GmailLogo className="h-3.5 w-3.5" />
                          Connect Gmail
                        </>
                      )}
                    </Button>
                  </a>
                  <a href="/api/microsoft/oauth" onClick={onStartConnectAction}>
                    <Button size="sm" disabled={isConnecting} className="w-full sm:w-auto min-w-[130px] bg-blue-600 hover:bg-blue-700 text-white inline-flex items-center gap-1.5">
                      {isConnecting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Connecting…
                        </>
                      ) : (
                        <>
                          <OutLookLogo className="h-3.5 w-3.5" />
                          Connect Outlook
                        </>
                      )}
                    </Button>
                  </a>
                </div>
              )}
            </>
          )}

          {isInProgress && (
            <Button size="sm" variant="destructive" onClick={onCancelAction} disabled={isCancelling || latestSweep?.status === "cancelled"} className="w-full sm:w-auto">
              {latestSweep?.status === "cancelled" ? "Stopping…" : "Cancel sweep"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
