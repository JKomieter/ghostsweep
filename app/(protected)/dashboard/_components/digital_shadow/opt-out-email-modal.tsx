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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Copy, Mail, CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import Input from "@/components/ui/input";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { DataBroker, OptOutRequest } from "@/types";
import useGetUser from "@/hooks/use-get-user";

type Region = "california" | "eu" | "other";

interface OptOutEmailModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    brokerId: string;
    brokerName: string;
    existingRequest?: Partial<OptOutRequest> | null;
}

export default function OptOutEmailModal({
    open,
    onOpenChange,
    brokerId,
    brokerName,
    existingRequest,
}: OptOutEmailModalProps) {
    const [region, setRegion] = React.useState<Region>("other");
    const [copied, setCopied] = React.useState(false);
    const [subject, setSubject] = React.useState("");
    const [body, setBody] = React.useState("");
    const queryClient = useQueryClient();

    const { data: user } = useGetUser(); // Get current user from Clerk

    const { data: broker } = useQuery({
        queryKey: ["broker", brokerId],
        enabled: open,
        queryFn: async (): Promise<DataBroker> => {
            const res = await fetch(`/api/broker/${brokerId}`);
            const data = await res.json();
            if (!res.ok) throw new Error("Failed to load broker");
            return data.broker;
        },
    });

    // Move mutation hook before early return
    const sendOptOutMutation = useMutation({
        mutationFn: async () => {
            const res = await fetch(`/api/broker/${brokerId}/send_opt_out_email`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: {
                        to: broker?.contact_email,
                        subject: subject,
                        body: body,
                    }
                }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to send opt-out email");
            return data;
        },
        onSuccess: () => {
            toast.success("Opt-out email sent successfully");
            queryClient.invalidateQueries({ queryKey: ["digital_shadow"] });
            setTimeout(() => {
                onOpenChange(false);
            }, 1500);
        },
        onError: (err) => {
            toast.error("Failed to send email");
            console.error("Error sending opt-out email:", err);
        },
    });

    // Initialize subject and body from default email on broker/region change
    React.useEffect(() => {
        if (broker) {
            const userEmail = user?.email || "[YOUR_EMAIL]";
            const defaultEmail = buildOptOutEmail({
                broker,
                region,
                userEmail,
            });
            setSubject(defaultEmail.subject);
            setBody(defaultEmail.body);
        }
    }, [broker, region, user]);

    if (!broker) {
        return null;
    }

    const userEmail = user?.email || "[YOUR_EMAIL]";

    const defaultEmail = buildOptOutEmail({
        broker,
        region,
        userEmail,
    });

    const email = {
        to: defaultEmail.to,
        subject,
        body,
    };

    const handleSend = () => {
        sendOptOutMutation.mutate();
    };

    async function handleCopy() {
        await navigator.clipboard.writeText(
            `To: ${email.to}\nSubject: ${email.subject}\n\n${email.body}`
        );
        setCopied(true);
        toast.success("Email copied to clipboard");
        setTimeout(() => setCopied(false), 2000);
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-xl">
                        {existingRequest ? "Resend" : ""} Opt-Out Request for {brokerName}
                    </DialogTitle>
                    <DialogDescription>
                        Legally compliant email citing CCPA, GDPR, and privacy laws.
                    </DialogDescription>
                </DialogHeader>

                {existingRequest && (
                    <div className="rounded-lg bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 p-4">
                        <div className="flex gap-3">
                            <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                            <div className="text-sm">
                                <div className="font-medium text-amber-900 dark:text-amber-100 mb-1">
                                    You&apos;ve already contacted this broker
                                </div>
                                <div className="text-amber-700 dark:text-amber-300">
                                    Status: {existingRequest.status} · Method: {existingRequest.method || "N/A"} ·
                                    Last updated: {existingRequest.updated_at ? new Date(existingRequest.updated_at).toLocaleDateString() : "N/A"}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Region selector */}
                <div className="space-y-2">
                    <Label htmlFor="region">Your Region (for legal compliance)</Label>
                    <select
                        id="region"
                        value={region}
                        onChange={(e) => setRegion(e.target.value as Region)}
                        className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    >
                        <option value="california">California (CCPA/CPRA)</option>
                        <option value="virginia">Virginia (VCDPA)</option>
                        <option value="colorado">Colorado (CPA)</option>
                        <option value="connecticut">Connecticut (CTDPA)</option>
                        <option value="eu">European Union (GDPR)</option>
                        <option value="uk">United Kingdom (UK GDPR)</option>
                        <option value="canada">Canada (PIPEDA)</option>
                        <option value="other">Other / Multiple Laws</option>
                    </select>
                </div>

                {/* Email preview */}
                <div className="space-y-3">
                    <div className="space-y-2">
                        <Label htmlFor="to">To</Label>
                        <Input
                            id="to"
                            value={email.to || ""}
                            onChange={() => { }}
                            readOnly
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="subject">Subject</Label>
                        <Input
                            id="subject"
                            value={subject}
                            onChange={setSubject}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="body">Email Body</Label>
                        <Textarea
                            id="body"
                            value={body}
                            onChange={(e) => setBody(e.currentTarget.value)}
                            className="font-mono text-sm min-h-[400px]"
                        />
                    </div>
                </div>

                {/* Info banner */}
                <div className="rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 p-4">
                    <div className="flex gap-3">
                        <CheckCircle2 className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                        <div className="text-sm">
                            <div className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                                This email is legally compliant
                            </div>
                            <div className="text-blue-700 dark:text-blue-300">
                                Cites applicable privacy laws for your region. Brokers must respond within 45 days.
                            </div>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-3">
                    <Button
                        onClick={handleSend}
                        disabled={sendOptOutMutation.isPending}
                        className="flex-1 min-w-[200px]"
                    >
                        {sendOptOutMutation.isPending ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Preparing...
                            </>
                        ) : (
                            <>
                                <Mail className="h-4 w-4 mr-2" />
                                {existingRequest ? "Resend Email" : "Send via Email"}
                            </>
                        )}
                    </Button>

                    <Button
                        variant="outline"
                        onClick={handleCopy}
                        disabled={copied}
                    >
                        {copied ? (
                            <>
                                <CheckCircle2 className="h-4 w-4 mr-2" />
                                Copied!
                            </>
                        ) : (
                            <>
                                <Copy className="h-4 w-4 mr-2" />
                                Copy Email
                            </>
                        )}
                    </Button>

                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                    >
                        Close
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}


function buildOptOutEmail({
    broker,
    region,
    userEmail,
    userName
}: {
    broker: DataBroker;
    region: "california" | "eu" | "other";
    userEmail: string;
    userName?: string;
}) {
    const laws =
        region === "california"
            ? "the California Consumer Privacy Act (CCPA/CPRA)"
            : region === "eu"
                ? "the General Data Protection Regulation (GDPR)"
                : "applicable data protection laws";

    return {
        to: broker.contact_email,
        subject: `Data Deletion Request`,
        body: `To whom it may concern,

I am writing to formally request the deletion of all personal data your organization has collected about me, in accordance with ${laws}.

REQUEST DETAILS:
• Email address: ${userEmail}
• Full name: ${userName || "[Your Full Name]"}
• Date of request: ${new Date().toLocaleDateString()}

I request that you:
1. Delete all personal data associated with me
2. Cease any further processing or sale of my data
3. Confirm deletion within the legally required timeframe

This request is being sent from my verified email address.

Thank you for your cooperation.

Sincerely,
${userEmail}
`,
    };
}