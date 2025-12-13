"use client";

import { Button } from "@/components/ui/button";
import { CircleCheck, ExternalLink, Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useMemo, useState } from "react";

interface SummaryTabProps {
    lastSeen: string;
    firstSeen: string;
    emailCount: number;
    breached: boolean;
    websiteUrl: string | null;
    contact: string | null | undefined;
    current_plan: "free" | "pro" | undefined;

    // 🔥 needed if you want AI suggestions for THIS service
    userServiceId?: string; // pass from the page/sheet
}

type AiSuggestionResponse = {
    summary?: string | null; // short overview
    actions?: { title: string; detail?: string | null; priority?: "high" | "medium" | "low" }[];
    securityAlerts?: { title: string; detail?: string | null }[];
    lastGeneratedAt?: string | null;
};

export default function SummaryTab({
    lastSeen,
    firstSeen,
    emailCount,
    breached,
    websiteUrl,
    contact,
    current_plan,
    userServiceId,
}: SummaryTabProps) {
    const [aiLoading, setAiLoading] = useState(false);
    const [aiError, setAiError] = useState<string | null>(null);
    const [aiData, setAiData] = useState<AiSuggestionResponse | null>(null);

    const riskLabel = useMemo(() => {
        if (breached) return "At risk";
        if (emailCount >= 50) return "Medium risk";
        return "Low risk (so far)";
    }, [breached, emailCount]);

    const defaultNextSteps = useMemo(() => {
        // keep this deterministic + cheap for MVP
        const steps = [
            "Use a unique, strong password for this account.",
            "Enable two-factor authentication if available.",
            "Review recent activity and connected devices.",
        ];

        if (breached) {
            steps.unshift("Change your password immediately and check for reused passwords.");
            steps.push("Check if your email/phone/address is stored and remove anything unnecessary.");
        }

        steps.push(
            'If you no longer use this service, look for "Delete account" or "Close my account" in settings.'
        );

        return steps;
    }, [breached]);

    const copyToClipboard = async (text: string, label: string) => {
        try {
            if (!text) return;

            // navigator.clipboard can fail in some contexts (non-https, permissions)
            if (navigator?.clipboard?.writeText) {
                await navigator.clipboard.writeText(text);
            } else {
                // fallback
                const ta = document.createElement("textarea");
                ta.value = text;
                document.body.appendChild(ta);
                ta.select();
                document.execCommand("copy");
                document.body.removeChild(ta);
            }

            toast(() => (
                <div className="flex flex-row items-center gap-2">
                    <CircleCheck color="green" /> {label} copied
                </div>
            ));
        } catch {
            toast.error("Failed to copy", { description: "Please copy manually." });
        }
    };

    const fetchAiSuggestions = async () => {
        if (current_plan !== "pro") {
            toast.error("GhostSweep Professional required", {
                description: "AI suggested actions are Pro-only to keep costs under control.",
            });
            return;
        }
        if (!userServiceId) {
            toast.error("Missing service id", { description: "userServiceId was not provided to SummaryTab." });
            return;
        }

        setAiLoading(true);
        setAiError(null);

        try {
            // ✅ Create this endpoint (recommended):
            // GET /api/user-services/:id/ai-suggestions
            // -> returns cached suggestions if present
            const res = await fetch(`/api/user-services/${userServiceId}/ai-suggestions`, {
                method: "GET",
                headers: { "Content-Type": "application/json" },
            });

            const json = await res.json();

            if (!res.ok) {
                throw new Error(json?.error || "Failed to fetch AI suggestions");
            }

            setAiData(json);
        } catch (e) {
            console.error(e)
            setAiError("Failed to load AI suggestions");
        } finally {
            setAiLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 rounded-lg border border-white/10 bg-black/40 p-3 text-sm">
                <div className="space-y-1">
                    <div className="text-xs text-muted-foreground">Last seen</div>
                    <div className="font-medium">{lastSeen}</div>
                </div>
                <div className="space-y-1">
                    <div className="text-xs text-muted-foreground">First seen</div>
                    <div className="font-medium">{firstSeen}</div>
                </div>
                <div className="space-y-1">
                    <div className="text-xs text-muted-foreground">Emails detected</div>
                    <div className="font-medium">{emailCount.toLocaleString()}</div>
                </div>
                <div className="space-y-1">
                    <div className="text-xs text-muted-foreground">Status</div>
                    <div className="font-medium">{riskLabel}</div>
                </div>
            </div>

            {/* Breach section */}
            <div className="space-y-2">
                <h3 className="text-sm font-semibold">Breaches</h3>
                {breached ? (
                    <p className="text-xs leading-relaxed text-red-200/80 bg-red-500/5 border border-red-500/20 rounded-md p-3">
                        This service appears in at least one known data breach associated with your email.
                        Consider changing your password, enabling two-factor authentication, and reviewing devices/sessions.
                    </p>
                ) : (
                    <p className="text-xs leading-relaxed text-muted-foreground bg-zinc-900/60 border border-zinc-800 rounded-md p-3">
                        No known breaches found for this service from our current breach sources.
                        This does not guarantee the service has never been breached — just that we don’t have a matching record yet.
                    </p>
                )}
            </div>

            {/* Recommended next steps (fast, deterministic MVP) */}
            <div className="space-y-2">
                <h3 className="text-sm font-semibold">Recommended next steps</h3>
                <ul className="list-disc pl-4 text-xs text-muted-foreground space-y-1.5">
                    {defaultNextSteps.map((s) => (
                        <li key={s}>{s}</li>
                    ))}
                </ul>
            </div>

            {/* Optional AI suggestions (Pro-only, on-demand) */}
            <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                    <h3 className="text-sm font-semibold">AI suggested actions</h3>

                    <Button
                        size="sm"
                        variant="outline"
                        className="border-white/20 bg-white/5"
                        onClick={fetchAiSuggestions}
                        disabled={aiLoading || current_plan !== "pro"}
                        title={current_plan !== "pro" ? "Pro-only" : "Generate AI suggestions"}
                    >
                        {aiLoading ? (
                            <span className="flex items-center gap-2">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Generating…
                            </span>
                        ) : (
                            <span className="flex items-center gap-2">
                                <Sparkles className="h-4 w-4" />
                                Generate
                            </span>
                        )}
                    </Button>
                </div>

                {current_plan !== "pro" && (
                    <p className="text-[11px] text-muted-foreground">
                        Pro-only to reduce costs and keep sweeps fast.
                    </p>
                )}

                {aiError && (
                    <p className="text-[11px] text-red-300/80 bg-red-500/5 border border-red-500/20 rounded-md p-2">
                        {aiError}
                    </p>
                )}

                {aiData && (
                    <div className="rounded-md border border-white/10 bg-black/30 p-3 space-y-3">
                        {aiData.summary && (
                            <p className="text-xs text-white/80 leading-relaxed">{aiData.summary}</p>
                        )}

                        {Array.isArray(aiData.securityAlerts) && aiData.securityAlerts.length > 0 && (
                            <div className="space-y-1">
                                <div className="text-xs font-medium text-white">Security alerts</div>
                                <ul className="list-disc pl-4 text-xs text-white/70 space-y-1">
                                    {aiData.securityAlerts.map((a, idx) => (
                                        <li key={idx}>
                                            <span className="font-medium text-white/80">{a.title}</span>
                                            {a.detail ? <span className="text-white/60"> — {a.detail}</span> : null}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {Array.isArray(aiData.actions) && aiData.actions.length > 0 && (
                            <div className="space-y-1">
                                <div className="text-xs font-medium text-white">Suggested actions</div>
                                <ul className="space-y-2">
                                    {aiData.actions.map((a, idx) => (
                                        <li key={idx} className="text-xs text-white/70">
                                            <div className="flex items-start justify-between gap-2">
                                                <span className="font-medium text-white/80">{a.title}</span>
                                                {a.priority ? (
                                                    <span className="text-[10px] px-2 py-0.5 rounded-full border border-white/10 bg-white/5 text-white/60">
                                                        {a.priority}
                                                    </span>
                                                ) : null}
                                            </div>
                                            {a.detail ? <div className="mt-0.5 text-white/60">{a.detail}</div> : null}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {aiData.lastGeneratedAt && (
                            <p className="text-[10px] text-white/50">
                                Last generated: {new Date(aiData.lastGeneratedAt).toLocaleString()}
                            </p>
                        )}
                    </div>
                )}
            </div>

            {/* Actions */}
            <div className="mt-4 flex flex-col gap-2">
                {websiteUrl && (
                    <Button
                        asChild
                        size="sm"
                        className="justify-between bg-primary/10 text-primary border border-primary/40 hover:bg-primary/20"
                    >
                        <a href={websiteUrl} target="_blank" rel="noreferrer">
                            Open website
                            <ExternalLink className="h-4 w-4" />
                        </a>
                    </Button>
                )}

                {contact && (
                    <Button
                        variant="outline"
                        size="sm"
                        className="justify-between border-white/20 bg-white/5"
                        onClick={() => copyToClipboard(contact, "Privacy email")}
                    >
                        Copy privacy email
                        <span className="text-xs text-muted-foreground truncate max-w-[180px]">
                            {contact}
                        </span>
                    </Button>
                )}
            </div>

            <p className="mt-6 text-[11px] leading-relaxed text-muted-foreground border-t border-white/5 pt-4">
                GhostSweep analyzes your email metadata (From, Subject, Date) to detect services linked to your inbox.
                We never read or store the bodies of your emails.
            </p>
        </div>
    );
}