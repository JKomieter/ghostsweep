"use client";

import { Button } from "@/components/ui/button";
import { CircleCheck, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { useMemo } from "react";

interface SummaryTabProps {
    lastSeen: string;
    firstSeen: string;
    emailCount: number;
    breached: boolean;
    websiteUrl: string | null;
    contact: string | null | undefined;
    current_plan: "free" | "pro" | undefined;
}

export default function SummaryTab({
    lastSeen,
    firstSeen,
    emailCount,
    breached,
    websiteUrl,
    contact,
}: SummaryTabProps) {
    const riskLabel = useMemo(() => {
        if (breached) return "At risk";
        if (emailCount >= 50) return "Medium risk";
        return "Low risk (so far)";
    }, [breached, emailCount]);

    const defaultNextSteps = useMemo(() => {
        const steps = [
            "Use a unique, strong password for this account.",
            "Enable two-factor authentication if available.",
            "Review recent activity and connected devices.",
        ];

        if (breached) {
            steps.unshift("Change your password immediately and check for reused passwords.");
            steps.push("Check if your email/phone/address is stored and remove anything unnecessary.");
        }

        steps.push('If you no longer use this service, look for "Delete account" or "Close my account" in settings.');
        return steps;
    }, [breached]);

    const copyToClipboard = async (text: string, label: string) => {
        try {
            if (!text) return;

            if (navigator?.clipboard?.writeText) {
                await navigator.clipboard.writeText(text);
            } else {
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

    return (
        <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 rounded-lg border border-white/5 bg-white/2 p-4 text-sm">
                <div className="space-y-1">
                    <div className="text-[11px] uppercase tracking-widest text-white/40">Last seen</div>
                    <div className="font-light text-white">{lastSeen}</div>
                </div>
                <div className="space-y-1">
                    <div className="text-[11px] uppercase tracking-widest text-white/40">First seen</div>
                    <div className="font-light text-white">{firstSeen}</div>
                </div>
                <div className="space-y-1">
                    <div className="text-[11px] uppercase tracking-widest text-white/40">Emails detected</div>
                    <div className="font-light text-white">{emailCount.toLocaleString()}</div>
                </div>
                <div className="space-y-1">
                    <div className="text-[11px] uppercase tracking-widest text-white/40">Status</div>
                    <div className="font-light text-white">{riskLabel}</div>
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

            {/* Recommended next steps */}
            <div className="space-y-3">
                <h3 className="text-[11px] font-medium uppercase tracking-widest text-white/40">Recommended next steps</h3>
                <ul className="list-disc pl-4 text-xs text-white/60 space-y-1.5">
                    {defaultNextSteps.map((s) => (
                        <li key={s}>{s}</li>
                    ))}
                </ul>
            </div>

            {/* Actions */}
            <div className="mt-4 flex flex-col gap-2">
                {websiteUrl && (
                    <Button
                        asChild
                        size="sm"
                        className="justify-between bg-white text-black hover:bg-white/90"
                    >
                        <a href={websiteUrl} target="_blank" rel="noreferrer">
                            Open website
                            <ExternalLink className="h-4 w-4" />
                        </a>
                    </Button>
                )}

                {contact && (
                    <Button
                        variant="ghost"
                        size="sm"
                        className="justify-between border border-white/5 bg-white/2 hover:border-white/10 hover:bg-white/3"
                        onClick={() => copyToClipboard(contact, "Privacy email")}
                    >
                        Copy privacy email
                        <span className="text-xs text-white/60 truncate max-w-[180px]">
                            {contact}
                        </span>
                    </Button>
                )}
            </div>

            <p className="mt-6 text-[11px] leading-relaxed text-white/40 border-t border-white/5 pt-4">
                GhostSweep analyzes your email metadata (From, Subject, Date) to detect services linked to your inbox.
                We never read or store the bodies of your emails.
            </p>
        </div>
    );
}