"use client";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mail, ShieldCheck, Eye, ArrowRight, Loader2 } from "lucide-react";
import { useState } from "react";

// Google and Microsoft brand icons
function GoogleIcon({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
    );
}

function MicrosoftIcon({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1 1h10v10H1V1z" fill="#F25022"/>
            <path d="M13 1h10v10H13V1z" fill="#7FBA00"/>
            <path d="M1 13h10v10H1V13z" fill="#00A4EF"/>
            <path d="M13 13h10v10H13V13z" fill="#FFB900"/>
        </svg>
    );
}

export default function ConnectAccountModal({
    open,
    onOpenChangeAction,
}: {
    open: boolean;
    onOpenChangeAction: (open: boolean) => void;
}) {
    const [connecting, setConnecting] = useState<"google" | "microsoft" | null>(null);

    const handleConnectGoogle = () => {
        setConnecting("google");
        window.location.href = "/api/google/oauth/start";
    };

    const handleConnectMicrosoft = () => {
        setConnecting("microsoft");
        window.location.href = "/api/microsoft/oauth";
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChangeAction}>
            <DialogContent className="sm:max-w-lg bg-[#0a0a0a] border border-white/10">
                <DialogHeader>
                    <DialogTitle className="text-xl flex items-center gap-2">
                        <Mail className="h-5 w-5 text-cyan-400" />
                        Connect Email Account
                    </DialogTitle>
                    <DialogDescription className="text-sm text-muted-foreground">
                        Link your Gmail or Outlook account so GhostSweep can scan for services, 
                        subscriptions, and data breaches. We only scan sign-up and security emails 
                        — never personal messages.
                    </DialogDescription>
                </DialogHeader>

                <div className="mt-6 space-y-4">
                    {/* Security badges */}
                    <div className="flex flex-wrap gap-2">
                        <Badge className="bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                            <Eye className="h-3 w-3 mr-1" />
                            Read-only access
                        </Badge>
                        <Badge className="bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                            <ShieldCheck className="h-3 w-3 mr-1" />
                            CASA Tier 2 Certified
                        </Badge>
                    </div>

                    {/* Provider buttons */}
                    <div className="space-y-3">
                        {/* Google */}
                        <button
                            onClick={handleConnectGoogle}
                            disabled={connecting !== null}
                            className="w-full flex items-center justify-between p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <div className="flex items-center gap-4">
                                <div className="p-3 rounded-xl bg-white/10">
                                    <GoogleIcon className="h-6 w-6" />
                                </div>
                                <div className="text-left">
                                    <p className="text-sm font-semibold text-white">
                                        Connect with Google
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        Gmail, Google Workspace
                                    </p>
                                </div>
                            </div>
                            {connecting === "google" ? (
                                <Loader2 className="h-5 w-5 text-muted-foreground animate-spin" />
                            ) : (
                                <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-white group-hover:translate-x-1 transition-all" />
                            )}
                        </button>

                        {/* Microsoft */}
                        <button
                            onClick={handleConnectMicrosoft}
                            disabled={connecting !== null}
                            className="w-full flex items-center justify-between p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <div className="flex items-center gap-4">
                                <div className="p-3 rounded-xl bg-white/10">
                                    <MicrosoftIcon className="h-6 w-6" />
                                </div>
                                <div className="text-left">
                                    <p className="text-sm font-semibold text-white">
                                        Connect with Microsoft
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        Outlook, Hotmail, Office 365
                                    </p>
                                </div>
                            </div>
                            {connecting === "microsoft" ? (
                                <Loader2 className="h-5 w-5 text-muted-foreground animate-spin" />
                            ) : (
                                <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-white group-hover:translate-x-1 transition-all" />
                            )}
                        </button>
                    </div>

                    {/* Privacy note */}
                    <div className="p-4 rounded-lg bg-black/40 border border-white/5">
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            <span className="text-white font-medium">Your privacy is protected.</span>{" "}
                            GhostSweep uses OAuth 2.0 with read-only permissions. We never store 
                            email content — only metadata about detected services. You can disconnect 
                            at any time.
                        </p>
                    </div>

                    {/* Cancel button */}
                    <div className="flex justify-end pt-2">
                        <Button
                            variant="ghost"
                            onClick={() => onOpenChangeAction(false)}
                            disabled={connecting !== null}
                        >
                            Cancel
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
