"use client";

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Mail, RefreshCw, Unplug } from "lucide-react";
import Input from "@/components/ui/input";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { toast } from "sonner";


export default function ConnectEmailModal({
    open,
    onOpenChangeAction,
}: {
    open: boolean;
    onOpenChangeAction: React.Dispatch<React.SetStateAction<boolean>>;
}) {

    const [removeOpen, setRemoveOpen] = useState(false);
    const [removing, setRemoving] = useState(false);
    const [removeError, setRemoveError] = useState<string | null>(null);
    const queryClient = useQueryClient()

    const { data, status } = useQuery({
        queryKey: ['gmailAccount'],
        queryFn: async (): Promise<{ gmail_address: string | null }> => {
            const res = await fetch('/api/gmail_account');
            if (!res.ok) {
                throw new Error('Failed to fetch Gmail account');
            }
            return res.json();
        },
        refetchOnWindowFocus: false,
    })

    const handleRemoveConnection = async () => {
        setRemoveError(null);
        setRemoving(true);

        try {
            // 🔹 Adjust this DELETE route to match your backend implementation
            const res = await fetch("/api/gmail_account/delete", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
            });

            if (!res.ok) {
                const body = await res.json().catch(() => ({}));
                throw new Error(body.error || "Failed to remove connection");
            }

            setRemoveOpen(false);
        } catch (err) {
            console.error("Error removing Gmail connection:", err);
            toast.error("Couldn’t disconnect this email. Please try again.")
            setRemoveError("Couldn’t disconnect this email. Please try again.");
        } finally {
            setRemoving(false);
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: ['gmailAccount'] }),
                queryClient.invalidateQueries({ queryKey: ['services'] }),
                queryClient.invalidateQueries({ queryKey: ['breaches'] }),
                queryClient.invalidateQueries({ queryKey: ['metrics'] }),
            ])
        }
    };

    const loading = status === "pending"
    const isConnected = !!data?.gmail_address;

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChangeAction}>
                <DialogContent className="sm:max-w-md bg-[#0f0f0f] border border-white/10">
                    <DialogHeader>
                        <DialogTitle className="text-lg">Connected email</DialogTitle>
                        <DialogDescription className="text-xs text-muted-foreground">
                            Link a Gmail account so GhostSweep can scan sign-up, security, and
                            breach-related emails. We only use this to detect services and
                            breaches — not to read your personal messages.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="mt-4 space-y-5">
                        {/* Status + email field */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-medium text-muted-foreground">
                                    Status
                                </span>
                                {isConnected ? (
                                    <Badge className="bg-emerald-500/10 text-emerald-300">
                                        Connected
                                    </Badge>
                                ) : (
                                    <Badge className="bg-zinc-500/10 text-zinc-300">
                                        Not connected
                                    </Badge>
                                )}
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-medium text-muted-foreground">
                                    Gmail account
                                </label>
                                <div className="relative">
                                    <Mail className="absolute right-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="email"
                                        readOnly
                                        value={
                                            loading
                                                ? ""
                                                : data?.gmail_address || (isConnected ? "" : "No email connected")
                                        }
                                        placeholder={loading ? "Loading..." : "No email connected"}
                                        onChange={() => { }}
                                    />
                                </div>
                                <p className="text-[11px] text-muted-foreground">
                                    This email is used only for scans you start, and you can
                                    disconnect at any time.
                                </p>
                            </div>

                            {status === "error" && (
                                <p className="text-[11px] text-red-400">
                                    Problem fetching connected gmail
                                </p>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex gap-2">
                                <Link href="/api/google/oauth/start" >
                                    <Button
                                        size="sm"
                                        disabled={loading}
                                        className="inline-flex items-center gap-1"
                                    >
                                        <RefreshCw className="h-4 w-4" />
                                        {isConnected ? "Reconnect Gmail" : "Connect Gmail"}
                                    </Button>
                                </Link>

                                {isConnected && (
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="border-red-500/40 text-red-400 hover:bg-red-500/10 hover:text-red-300 inline-flex items-center gap-1"
                                        onClick={() => setRemoveOpen(true)}
                                    >
                                        <Unplug className="h-4 w-4" />
                                        Disconnect
                                    </Button>
                                )}
                            </div>

                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onOpenChangeAction(false)}
                            >
                                Close
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Remove connection confirmation */}
            <AlertDialog open={removeOpen} onOpenChange={setRemoveOpen}>
                <AlertDialogContent className="bg-[#0f0f0f] border border-white/10">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Disconnect this email?</AlertDialogTitle>
                        <AlertDialogDescription className="text-xs text-muted-foreground">
                            GhostSweep will no longer be able to run sweeps or check for new
                            breaches for this Gmail account. You can reconnect later at any
                            time.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={removing}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleRemoveConnection}
                            disabled={removing}
                            className="bg-red-600 hover:bg-red-700 text-white"
                        >
                            {removing ? "Disconnecting..." : "Disconnect"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                    {removeError && (
                        <p className="mt-2 text-[11px] text-red-400">{removeError}</p>
                    )}
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}