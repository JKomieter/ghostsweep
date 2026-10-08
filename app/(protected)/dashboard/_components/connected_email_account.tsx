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
import { Mail, RefreshCw, Unplug, Loader2 } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export default function ConnectEmailModal({
    open,
    onOpenChangeAction,
}: {
    open: boolean;
    onOpenChangeAction: React.Dispatch<React.SetStateAction<boolean>>;
}) {
    const [removeOpen, setRemoveOpen] = useState(false);
    const [removeError, setRemoveError] = useState<string | null>(null);
    const [accountToRemove, setAccountToRemove] = useState<{ id: string; email: string; type: "gmail" | "microsoft" } | null>(null);
    const queryClient = useQueryClient();

    type EmailAccount = { id: string; gmail_address?: string; outlook_address?: string; created_at: string };

    const { data, status } = useQuery({
        queryKey: ["emailAccounts"],
        queryFn: async (): Promise<{ gmailAccounts: EmailAccount[]; microsoftAccounts: EmailAccount[] }> => {
            const [gmailRes, microsoftRes] = await Promise.all([
                fetch("/api/gmail_account"),
                fetch("/api/microsoft_account"),
            ]);

            const gmail = gmailRes.ok ? await gmailRes.json() : { accounts: [] };
            const microsoft = microsoftRes.ok ? await microsoftRes.json() : { accounts: [] };

            return {
                gmailAccounts: gmail.accounts || [],
                microsoftAccounts: microsoft.accounts || [],
            };
        },
        refetchOnWindowFocus: false,
    });

    const removeConnectionMutation = useMutation({
        mutationFn: async ({ id, email, type }: { id: string; email: string; type: "gmail" | "microsoft" }) => {
            const endpoint = type === "gmail" 
                ? `/api/gmail_account/delete`
                : `/api/microsoft_account/delete`;

            const res = await fetch(endpoint, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ accountId: id }),
            });

            if (!res.ok) {
                const body = await res.json().catch(() => ({}));
                throw new Error(body.error || "Failed to remove connection");
            }

            return { email };
        },
        onSuccess: (data) => {
            toast.success(`${data.email} disconnected. GhostSweep can no longer access this email.`);
            setRemoveOpen(false);
            setAccountToRemove(null);
            setRemoveError(null);
        },
        onError: (error: Error) => {
            console.error(`Error removing email connection:`, error);
            toast.error("Couldn't disconnect this email. Please try again.");
            setRemoveError("Couldn't disconnect this email. Please try again.");
        },
        onSettled: async () => {
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: ["emailAccounts"] }),
                queryClient.invalidateQueries({ queryKey: ["gmailAccount"] }),
                queryClient.invalidateQueries({ queryKey: ["microsoftAccount"] }),
                queryClient.invalidateQueries({ queryKey: ["metrics"] }),
            ]);
        },
    });

    const handleRemoveConnection = () => {
        if (!accountToRemove) return;
        removeConnectionMutation.mutate(accountToRemove);
    };

    const loading = status === "pending";
    const removing = removeConnectionMutation.isPending;
    const gmailAccounts = data?.gmailAccounts || [];
    const microsoftAccounts = data?.microsoftAccounts || [];
    const totalAccounts = gmailAccounts.length + microsoftAccounts.length;
    const isConnected = totalAccounts > 0;

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChangeAction}>
                <DialogContent className="sm:max-w-md bg-card border border-foreground/10">
                    <DialogHeader>
                        <DialogTitle className="text-lg">Connected email</DialogTitle>
                        <DialogDescription className="text-xs text-muted-foreground">
                            Link a Gmail or Outlook account so GhostSweep can scan sign-up, security, and
                            breach-related emails. We only use this to detect services and
                            breaches — not to read your personal messages.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="mt-4 space-y-5">
                        {/* Status */}
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-muted-foreground">
                                Status
                            </span>
                            {isConnected ? (
                                <Badge className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
                                    {totalAccounts} {totalAccounts === 1 ? "account" : "accounts"} connected
                                </Badge>
                            ) : (
                                <Badge className="bg-foreground/10 text-foreground/75">
                                    Not connected
                                </Badge>
                            )}
                        </div>

                        {/* Connected accounts list */}
                        {isConnected && (
                            <div className="space-y-2">
                                <label className="text-xs font-medium text-muted-foreground">
                                    Connected accounts
                                </label>
                                <div className="space-y-2">
                                    {gmailAccounts.map((account) => (
                                        <div key={account.id} className="flex items-center justify-between rounded-md border border-foreground/10 bg-background/40 px-3 py-2">
                                            <div className="flex items-center gap-2 flex-1 min-w-0">
                                                <Mail className="h-4 w-4 text-red-600 dark:text-red-400 shrink-0" />
                                                <span className="text-sm text-foreground truncate">{account.gmail_address}</span>
                                            </div>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-500/10 h-8 px-2"
                                                onClick={() => {
                                                    setAccountToRemove({ 
                                                        id: account.id, 
                                                        email: account.gmail_address || "", 
                                                        type: "gmail" 
                                                    });
                                                    setRemoveOpen(true);
                                                }}
                                                disabled={removing}
                                            >
                                                {removing && accountToRemove?.id === account.id ? (
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    <Unplug className="h-4 w-4" />
                                                )}
                                            </Button>
                                        </div>
                                    ))}
                                    {microsoftAccounts.map((account) => (
                                        <div key={account.id} className="flex items-center justify-between rounded-md border border-foreground/10 bg-background/40 px-3 py-2">
                                            <div className="flex items-center gap-2 flex-1 min-w-0">
                                                <Mail className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0" />
                                                <span className="text-sm text-foreground truncate">{account.outlook_address}</span>
                                            </div>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-500/10 h-8 px-2"
                                                onClick={() => {
                                                    setAccountToRemove({ 
                                                        id: account.id, 
                                                        email: account.outlook_address || "", 
                                                        type: "microsoft" 
                                                    });
                                                    setRemoveOpen(true);
                                                }}
                                                disabled={removing}
                                            >
                                                {removing && accountToRemove?.id === account.id ? (
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    <Unplug className="h-4 w-4" />
                                                )}
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                                <p className="text-[11px] text-muted-foreground">
                                    These accounts are used only for scans you start. You can disconnect any account at any time.
                                </p>
                            </div>
                        )}

                        {status === "error" && (
                            <p className="text-[11px] text-red-600 dark:text-red-400">
                                Problem fetching connected email accounts.
                            </p>
                        )}

                        {!isConnected && (
                            <p className="text-sm text-muted-foreground">
                                Connect Gmail or Outlook to let GhostSweep scan for accounts and breaches.
                            </p>
                        )}

                        {/* Actions */}
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex flex-wrap gap-2">
                                <a href="/api/google/oauth/start">
                                    <Button
                                        size="sm"
                                        disabled={loading || removing}
                                        className="inline-flex items-center gap-1"
                                    >
                                        <RefreshCw className="h-4 w-4" />
                                        {gmailAccounts.length > 0 ? "Add" : "Connect"} Gmail
                                    </Button>
                                </a>

                                <a href="/api/microsoft/oauth">
                                    <Button
                                        size="sm"
                                        disabled={loading || removing}
                                        className="inline-flex items-center gap-1"
                                    >
                                        <RefreshCw className="h-4 w-4" />
                                        {microsoftAccounts.length > 0 ? "Add" : "Connect"} Outlook
                                    </Button>
                                </a>
                            </div>

                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onOpenChangeAction(false)}
                                disabled={removing}
                            >
                                Close
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Remove connection confirmation */}
            <AlertDialog open={removeOpen} onOpenChange={setRemoveOpen}>
                <AlertDialogContent className="bg-card border border-foreground/10">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Disconnect {accountToRemove?.email}?</AlertDialogTitle>
                        <AlertDialogDescription className="text-xs text-muted-foreground">
                            GhostSweep will disconnect this email account and delete its sweep
                            results (services found and breach data). You can reconnect this email at any time.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={removing}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleRemoveConnection}
                            disabled={removing}
                            className="bg-red-600 hover:bg-red-700 text-white inline-flex items-center gap-2"
                        >
                            {removing ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Disconnecting…
                                </>
                            ) : (
                                "Disconnect"
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                    {removeError && (
                        <p className="mt-2 text-[11px] text-red-600 dark:text-red-400">{removeError}</p>
                    )}
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}