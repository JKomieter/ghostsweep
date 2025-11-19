// app/tools/data-removal/page.tsx
"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, Lock, Mail } from "lucide-react";
import { cn } from "@/lib/utils";
import Input from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";


type Service = {
    id: string;
    name: string | null;
    domain: string | null;
    default_privacy_email: string | null;
    category: string | null;
};



export default function DataRemovalToolPage() {
    const router = useRouter();

    const [selectedServiceId, setSelectedServiceId] = useState<string>("");
    const [copyStatus, setCopyStatus] = useState<string | null>(null);

    // Load plan info
    const { data: plan, status: planStatus} = useQuery({
        queryKey: ['plan'],
        queryFn: async (): Promise<{ current_plan: "free" | "pro" }> => {
            const res = await fetch('/api/plan', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!res.ok) {
                throw new Error('Failed to fetch plan data');
            }

            return res.json();
        },
    })

    const {data: services, status: servicesStatus} = useQuery({
        queryKey: ["allServices"],
        queryFn: async (): Promise<Service[]> => {
            const res = await fetch("/api/services", {
                method: "GET",
                headers: { "Content-Type": "application/json" },
            });

            if (!res.ok) {
                throw new Error("Failed to fetch services");
            }

            const json = (await res.json())
            return json.services
        }
    })

    



    const isPro = plan?.current_plan === "pro";
    const planLoading = planStatus === "pending"
    const servicesLoading = servicesStatus === "pending"

    const selectedService = useMemo(
        () => services?.find((s) => s.id === selectedServiceId) ?? null,
        [services, selectedServiceId]
    );

    const emailSubject = useMemo(() => {
        if (!selectedService) return "Request for deletion of my account and personal data";
        const name = selectedService.name || "your service";
        return `Request for deletion of my ${name} account and personal data`;
    }, [selectedService]);

    const emailBody = useMemo(() => {
        const serviceName = selectedService?.name || "your service";
        const serviceDomain = selectedService?.domain || "";
        const email =  "[your email here]";

        return [
            `To the ${serviceName} Privacy Team,`,
            "",
            `I am writing to formally request the deletion of my ${serviceName} account and all associated personal data.`,
            "",
            `Account email: ${email}`,
            serviceDomain ? `Service domain: ${serviceDomain}` : "",
            "",
            "Please treat this as a request to:",
            "- Permanently delete my account and all personal data associated with it",
            "- Stop any further processing of my personal data",
            "- Remove my data from any third parties where feasible",
            "",
            "Where applicable, I am exercising my rights under relevant data protection laws (such as GDPR / CCPA or similar frameworks).",
            "",
            "Please confirm once my account and data have been deleted, and let me know if you require any further information to process this request.",
            "",
            "Kind regards,",
            email,
        ]
            .filter(Boolean)
            .join("\n");
    }, [selectedService]);

    const privacyEmail = selectedService?.default_privacy_email || "";

    const handleCopyTemplate = async () => {
        try {
            await navigator.clipboard.writeText(`Subject: ${emailSubject}\n\n${emailBody}`);
            setCopyStatus("Template copied to clipboard");
            setTimeout(() => setCopyStatus(null), 2500);
        } catch (err) {
            console.error("Error copying:", err);
            setCopyStatus("Couldn’t copy to clipboard");
            setTimeout(() => setCopyStatus(null), 2500);
        }
    };

    const handleCopyRecipient = async () => {
        if (!privacyEmail) return;
        try {
            await navigator.clipboard.writeText(privacyEmail);
            setCopyStatus("Recipient email copied");
            setTimeout(() => setCopyStatus(null), 2500);
        } catch (err) {
            console.error("Error copying recipient:", err);
            setCopyStatus("Couldn’t copy email");
            setTimeout(() => setCopyStatus(null), 2500);
        }
    };

    const handleOpenEmailClient = () => {
        const to = privacyEmail || "";
        const url = `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(
            emailSubject
        )}&body=${encodeURIComponent(emailBody)}`;
        window.location.href = url;
    };

    const handleUpgrade = () => {
        router.push("/pricing");
    };

    return (
        <div className="min-h-[calc(100vh-4rem)] bg-[#050505] text-white px-4 py-8 sm:px-6 lg:px-10">
            <div className="mx-auto max-w-3xl space-y-6">
                {/* Header */}
                <div className="space-y-2">
                    <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-muted-foreground">
                        <ShieldDot />
                        Privacy tools · Data removal
                    </div>
                    <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                        Data removal email templates
                    </h1>
                    <p className="text-sm text-muted-foreground max-w-xl">
                        Generate ready-to-send emails asking services to delete your account and personal data.
                        Copy, paste, and send it to the service&apos;s privacy or support email.
                    </p>
                </div>

                {/* Plan gate */}
                <div className="rounded-xl border border-white/10 bg-[#0c0c0c] p-4 flex items-center justify-between gap-3">
                    <div className="space-y-1">
                        <p className="text-xs font-medium text-muted-foreground">Plan access</p>
                        {planLoading ? (
                            <p className="text-sm text-muted-foreground">Loading your plan…</p>
                        ) : plan ? (
                            <p className="text-sm">
                                {isPro ? (
                                    <>You&apos;re on <span className="font-semibold">Pro</span>. All privacy tools are unlocked.</>
                                ) : (
                                    <>
                                        You&apos;re on <span className="font-semibold">Free</span>. Data removal templates are a Pro feature.
                                    </>
                                )}
                            </p>
                        ) : (
                            <p className="text-sm text-red-400">Couldn&apos;t load your plan.</p>
                        )}
                        {planStatus === "error" && (
                            <p className="flex items-center gap-1 text-[11px] text-red-400">
                                <AlertCircle className="h-3 w-3" />
                                Problem getting your current plan
                            </p>
                        )}
                    </div>
                    {plan && (
                        <Badge
                            className={cn(
                                "px-3 py-1 text-xs",
                                isPro
                                    ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/40"
                                    : "bg-zinc-700/40 text-zinc-100 border border-zinc-500/40"
                            )}
                        >
                            {isPro ? "Pro" : "Free"}
                        </Badge>
                    )}
                </div>

                {/* If not Pro: lock screen */}
                {!isPro ? (
                    <div className="mt-4 rounded-xl border border-white/10 bg-[#0b0b0b] p-5 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm font-medium">
                                <Lock className="h-4 w-4 text-cyan-300" />
                                <span>Unlock data removal templates</span>
                            </div>
                            <p className="text-xs text-muted-foreground max-w-md">
                                GhostSweep Pro can generate tailored deletion requests for any service we&apos;ve detected
                                in your sweeps. Upgrade to Pro to unlock this tool and take back full control of your data.
                            </p>
                        </div>
                        <Button size="sm" onClick={handleUpgrade}>
                            Upgrade to Pro
                        </Button>
                    </div>
                ) : (
                    // Pro view: main tool
                    <div className="mt-4 space-y-6">
                        {/* Service selection */}
                        <div className="rounded-xl border border-white/10 bg-[#0b0b0b] p-5 space-y-3">
                            <p className="text-sm font-medium">1. Choose a service</p>
                            <p className="text-xs text-muted-foreground">
                                Select a service from your latest sweep. We&apos;ll generate a tailored email you can send to ask
                                them to delete your account and data.
                            </p>

                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                                <div className="flex-1">
                                    <Select
                                        value={selectedServiceId}
                                        onValueChange={(val) => setSelectedServiceId(val)}
                                        disabled={servicesLoading || services?.length === 0}
                                    >
                                        <SelectTrigger className="w-full bg-[#111111] border-white/15 text-sm">
                                            <SelectValue
                                                placeholder={
                                                    servicesLoading
                                                        ? "Loading services..."
                                                        : services?.length === 0
                                                            ? "No services found from sweeps yet"
                                                            : "Select a service"
                                                }
                                            />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {services?.map((service) => (
                                                <SelectItem key={service.id} value={service.id}>
                                                    {service.name || "Unknown service"}
                                                    {service.domain ? ` (${service.domain})` : ""}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {servicesStatus === "error" && (
                                <p className="flex items-center gap-1 text-[11px] text-red-400">
                                    <AlertCircle className="h-3 w-3" />
                                    Problem getting services
                                </p>
                            )}
                        </div>

                        {/* Template preview */}
                        <div className="rounded-xl border border-white/10 bg-[#0b0b0b] p-5 space-y-4">
                            <p className="text-sm font-medium">2. Review & send the email</p>
                            <p className="text-xs text-muted-foreground">
                                Copy this into your email app and send it to the service&apos;s privacy or support email. You can edit
                                the text before sending if you’d like.
                            </p>

                            {/* Recipient */}
                            <div className="space-y-2">
                                <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                                    Recipient email
                                </label>
                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <Mail className="absolute right-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            value={privacyEmail || ""}
                                            readOnly
                                            placeholder="No dedicated privacy email stored for this service"
                                            id="email"
                                            type="email"
                                            onChange={() => {}}
                                        />
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={!privacyEmail}
                                        onClick={handleCopyRecipient}
                                    >
                                        Copy
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={!privacyEmail || !selectedService}
                                        onClick={handleOpenEmailClient}
                                    >
                                        Open mail
                                    </Button>
                                </div>
                                <p className="text-[11px] text-muted-foreground">
                                    If no privacy email is listed, use the service&apos;s support/contact email or contact form instead.
                                </p>
                            </div>

                            {/* Subject */}
                            <div className="space-y-2">
                                <label className="text-xs font-medium text-muted-foreground">Email subject</label>
                                <Input
                                    value={emailSubject}
                                    readOnly
                                    onChange={() =>{}}
                                    id="subject"
                                />
                            </div>

                            {/* Body */}
                            <div className="space-y-2">
                                <label className="text-xs font-medium text-muted-foreground">Email body</label>
                                <Textarea
                                    value={emailBody}
                                    readOnly
                                    rows={12}
                                    className="bg-[#111111] border-white/15 text-xs font-mono"
                                />
                            </div>

                            <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
                                <Button
                                    size="sm"
                                    onClick={handleCopyTemplate}
                                    disabled={!selectedService}
                                >
                                    Copy full template
                                </Button>
                                {copyStatus && (
                                    <p className="text-[11px] text-emerald-300">{copyStatus}</p>
                                )}
                            </div>

                            {!selectedService && (
                                <p className="text-[11px] text-muted-foreground pt-1">
                                    Select a service above to generate a tailored email template.
                                </p>
                            )}
                        </div>

                        {/* Note */}
                        <p className="text-[11px] text-muted-foreground">
                            GhostSweep does not send emails on your behalf. You stay in control — review and send messages from your
                            own email account.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

// Tiny shield-dot icon without pulling in a full icon set if you want a subtle header badge
function ShieldDot() {
    return (
        <span className="relative inline-flex h-3 w-3 items-center justify-center">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-500/40" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-300" />
        </span>
    );
}