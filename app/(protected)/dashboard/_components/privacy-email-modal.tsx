"use client";

import * as React from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils"; // or remove if you don't have this
import type { PrivacyAction } from "@/types";
import { useState } from "react";
import { toast } from "sonner";
import { ServiceQueryResult } from "./services/service-details";


interface PrivacyEmailModalProps {
    open: boolean;
    onOpenChangeAction: (open: boolean) => void;
    action: PrivacyAction;
    service: ServiceQueryResult | undefined;
    userEmail: string;
    userName?: string | null;
}

function buildToAddress(service: ServiceQueryResult | undefined): string {
    const domain = service?.service.domain || "";
    const defaultPrivacy = service?.service.default_privacy_email || "";

    if (defaultPrivacy) return defaultPrivacy;

    if (domain) {
        return `support@${domain.replace(/^https?:\/\//, "")}`;
    }

    return "support@[service-domain]";
}

function buildSubject(action: PrivacyAction, serviceName: string): string {
    if (action === "delete") {
        return `Request to delete my ${serviceName} account and personal data`;
    }
    return `Request to limit use of my personal data on ${serviceName}`;
}

function buildBody({
    action,
    serviceName,
    userEmail,
    userName,
}: {
    action: PrivacyAction
    serviceName: string
    userEmail: string
    userName?: string | null
}) {
    const signoffName = userName?.trim() || "Concerned user"

    if (action === "delete") {
        return `To the ${serviceName} Privacy / Data Protection Team,

I am formally exercising my data rights under global privacy laws, including:

• GDPR (EU General Data Protection Regulation – Article 17: Right to Erasure)
• CCPA/CPRA (California Consumer Privacy Act)
• Any equivalent regional data-protection regulations applicable to your organization

I am requesting **complete erasure** of all personal data associated with the following identity:

• Email Address: ${userEmail}
• Service / Account Name: ${serviceName}

I am requesting that you:

1. Permanently delete my account and **all** personal data associated with it, including backups, analytics identifiers, logs, content, and any data held by third-party processors acting on your behalf.

2. Immediately remove my email from all marketing, tracking, notification, retention, and re-engagement systems.

3. Cease all further processing of my personal data except where legally required.

4. Provide written confirmation by reply to this email within the legally mandated timeframe (30 days under GDPR) that my data has been erased.

If additional identity verification is required, please specify the exact steps necessary.

Thank you for your cooperation,
${signoffName}
${userEmail}`
    }

    // reduce / limit processing
    return `To the ${serviceName} Privacy / Data Protection Team,

I am exercising my rights under global privacy regulations (including GDPR Article 18: Restriction of Processing and CCPA/CPRA rights) regarding my account linked to:

• Email Address: ${userEmail}
• Service / Account Name: ${serviceName}

I request that you:

1. Stop all non-essential processing of my personal data, including profiling, behavioral tracking, analytics enrichment, and marketing-related usage.

2. Remove my email from all direct marketing, promotional communication, and retargeting systems.

3. Delete any non-essential or outdated personal data not required for delivering your core service.

4. Confirm by reply that processing of my personal data has been restricted accordingly.

If any verification is required, please outline the steps.

Thank you,
${signoffName}
${userEmail}`
}

export default function PrivacyEmailModal({
    open,
    onOpenChangeAction,
    action,
    service,
    userEmail,
    userName,
}: PrivacyEmailModalProps) {
    const [copied, setCopied] = useState(false);
    const [markingSent, setMarkingSent] = useState(false)
    
    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(
                `To: ${toAddress}\nSubject: ${subject}\n\n${body}`
            );
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error("Failed to copy email template", err);
        }
    };

    

    const serviceName = service?.service.name || "this service";
    const domain = service?.service.domain || "";
    const category = service?.service.category || "Unknown";

    const toAddress = buildToAddress(service);
    const subject = buildSubject(action, serviceName);
    const body = buildBody({ action, serviceName, userEmail, userName });

    const actionLabel =
        action === "delete" ? "Delete account & data" : "Reduce data usage";

    const handleMarkSent = async () => {
        if (!service) return
        setMarkingSent(true)

        try {
            const res = await fetch("/api/send-privacy-requests", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    service_id: service.service.id,
                    action,
                    to_address: toAddress,
                    subject,
                }),
            })

            if (!res.ok) throw new Error("Failed to mark as sent")

            toast.success("Request marked as sent. We’ll track replies for you.")
            onOpenChangeAction(false)
        } catch (e) {
            console.error(e)
            toast.error("Couldn’t save request. Try again.")
        } finally {
            setMarkingSent(false)
        }
    }
    
    
    return (
        <Dialog open={open} onOpenChange={onOpenChangeAction}>
            <DialogContent className="sm:max-w-lg bg-[#050505] border border-white/10">
                <DialogHeader className="space-y-2">
                    <DialogTitle className="flex flex-col gap-1">
                        <span className="text-xs uppercase tracking-wide text-muted-foreground">
                            Privacy request email
                        </span>
                        <span className="text-lg font-semibold">
                            {serviceName}
                        </span>
                    </DialogTitle>
                    <DialogDescription className="space-y-2">
                        <div className="flex flex-wrap gap-2">
                            <Badge
                                variant="outline"
                                className="capitalize text-xs text-muted-foreground"
                            >
                                {category}
                            </Badge>
                            {domain && (
                                <span className="text-xs text-muted-foreground">
                                    {domain}
                                </span>
                            )}
                            <Badge
                                className={cn(
                                    "text-xs",
                                    service?.service.is_breached
                                        ? "bg-red-500/20 text-red-300 border-red-500/30"
                                        : "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                                )}
                            >
                                {service?.service.is_breached ? "Breached" : "No known breach"}
                            </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            This is a ready-to-send email you can use to contact{" "}
                            {serviceName} about your data. Copy it, paste into your email app,
                            and send it to the address shown below.
                        </p>
                    </DialogDescription>
                </DialogHeader>

                {/* To + Subject */}
                <div className="mt-4 space-y-3 text-xs">
                    <div className="space-y-1">
                        <div className="text-[11px] uppercase tracking-wide text-muted-foreground">
                            To
                        </div>
                        <div className="rounded-md border border-white/10 bg-black/60 px-3 py-2 font-mono text-[11px] text-emerald-200">
                            {toAddress}
                        </div>
                    </div>
                    <div className="space-y-1">
                        <div className="text-[11px] uppercase tracking-wide text-muted-foreground">
                            Subject
                        </div>
                        <div className="rounded-md border border-white/10 bg-black/60 px-3 py-2 font-mono text-[11px] text-slate-100">
                            {subject}
                        </div>
                    </div>
                </div>

                {/* Body */}
                <div className="mt-4 space-y-1">
                    <div className="text-[11px] uppercase tracking-wide text-muted-foreground">
                        Email body – {actionLabel}
                    </div>
                    <div className="max-h-64 overflow-auto rounded-md border border-white/10 bg-black/70 p-3">
                        <pre className="whitespace-pre-wrap wrap-break-words font-mono text-[11px] leading-relaxed text-slate-100">
                            {body}
                        </pre>
                    </div>
                </div>

                {/* Actions */}
                <div className="mt-5 flex items-center justify-between gap-3">
                    <p className="text-[11px] text-muted-foreground max-w-xs">
                        GhostSweep does not send this email for you. Copy it and send from
                        your own inbox to complete the request.
                    </p>
                    <div className="flex gap-2">
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={handleMarkSent}
                            disabled={markingSent}
                        >
                            {markingSent ? "Saving..." : "I sent it"}
                        </Button>

                        <Button
                            size="sm"
                            className="shrink-0 bg-primary text-black hover:bg-primary/80"
                            onClick={handleCopy}
                        >
                            {copied ? "Copied ✓" : "Copy Email"}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}