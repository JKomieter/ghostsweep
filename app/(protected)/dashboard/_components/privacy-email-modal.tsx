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
import type { Service } from "@/types";
import { useState } from "react";

type PrivacyAction = "delete" | "reduce";

interface PrivacyEmailModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    action: PrivacyAction;
    service: Service | undefined;
    userEmail: string;
    userName?: string | null;
}

function buildToAddress(service: Service | null): string {
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

function buildBody(options: {
    action: PrivacyAction;
    serviceName: string;
    userEmail: string;
    userName?: string | null;
}) {
    const { action, serviceName, userEmail, userName } = options;
    const nameLine = userName ? `${userName}` : "Concerned user";

    if (action === "delete") {
        return `Hello ${serviceName} Support,

I am writing to request the deletion of my account and all associated personal data linked to this email address:

Email: ${userEmail}
Service / Account Name: ${serviceName}

Please:

1. Permanently delete my account and all personal data associated with it.
2. Remove my email address from marketing and notification lists.
3. Confirm by reply when this deletion has been completed.

If your company operates under the GDPR, I am exercising my right to erasure under Article 17 of the GDPR. If you operate under other privacy laws (such as the CCPA or similar regulations), please treat this as a request to delete my personal information under the applicable law.

If you require any additional information to locate my account, please let me know.

Thank you,
${nameLine}
${userEmail}`;
    }

    // reduce
    return `Hello ${serviceName} Support,

I’m contacting you regarding my account linked to this email address:

Email: ${userEmail}
Service / Account Name: ${serviceName}

I would like to:

1. Opt out of marketing and promotional emails.
2. Disable any unnecessary data sharing with third parties.
3. Remove any inactive or non-essential data that is no longer needed for providing your core service.

If your company is subject to privacy regulations such as the GDPR or CCPA, please treat this as a request to limit processing of my personal data to what is strictly necessary for providing the service.

If you need any additional information to process this request, please let me know.

Best regards,
${nameLine}
${userEmail}`;
}

export default function PrivacyEmailModal({
    open,
    onOpenChange,
    action,
    service,
    userEmail,
    userName,
}: PrivacyEmailModalProps) {
    
    
    
    const [copied, setCopied] = useState(false);
    
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
    
    if (!service) return null;
    
    const serviceName = service.service.name || "this service";
    const domain = service.service.domain || "";
    const category = service.service.category || "Unknown";

    const toAddress = buildToAddress(service);
    const subject = buildSubject(action, serviceName);
    const body = buildBody({ action, serviceName, userEmail, userName });

    const actionLabel =
    action === "delete" ? "Delete account & data" : "Reduce data usage";

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
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
                                    service.service.is_breached
                                        ? "bg-red-500/20 text-red-300 border-red-500/30"
                                        : "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                                )}
                            >
                                {service.service.is_breached ? "Breached" : "No known breach"}
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
                    <Button
                        size="sm"
                        className="shrink-0 bg-primary text-black hover:bg-primary/80"
                        onClick={handleCopy}
                    >
                        {copied ? "Copied ✓" : "Copy Email"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}