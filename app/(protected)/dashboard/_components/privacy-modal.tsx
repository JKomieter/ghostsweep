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
import { Skeleton } from "@/components/ui/skeleton";
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
import {
    ShieldCheck,
    Trash2,
    Download,
    Lock,
    AlertCircle,
} from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export default function PrivacyToolsModal({
    open,
    onOpenChangeAction,
}: {
    open: boolean;
    onOpenChangeAction: React.Dispatch<React.SetStateAction<boolean>>;
}) {

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [deleteError, setDeleteError] = useState<string | null>(null);
    const [deleteSuccess, setDeleteSuccess] = useState<string | null>(null);
    const queryClient = useQueryClient()

    const { data: plan, status } = useQuery({
        queryKey: ['plan'],
        queryFn: async (): Promise<{ current_plan: "free" | "pro", renews_at: string | null }> => {
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

    const loadingPlan = status === "pending"
    const isPro = plan?.current_plan === "pro";

    const handleUpgrade = () => {
        // Replace with your real upgrade flow / checkout
        window.location.href = "/pricing";
    };

    const handleDeleteSweepData = async () => {
        setDeleteError(null);
        setDeleteSuccess(null);
        setDeleteLoading(true);

        try {
            const res = await fetch("/api/delete-sweep-data", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
            });

            if (!res.ok) {
                const body = await res.json().catch(() => ({}));
                throw new Error(body.error || "Failed to delete data");
            }

            setDeleteSuccess("All sweep data for this account has been deleted.");
            setDeleteDialogOpen(false);
            toast.success("All sweep data for this account has been deleted.")
        } catch (err) {
            toast.error("Couldn’t delete your data. Please try again.")
            console.error("Error deleting sweep data:", err);
            setDeleteError("Couldn’t delete your data. Please try again.");
        } finally {
            setDeleteLoading(false);
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: ['services'] }),
                queryClient.invalidateQueries({ queryKey: ['breaches'] }),
                queryClient.invalidateQueries({ queryKey: ['metrics'] }),
            ])
        }
    };

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChangeAction}>
                <DialogContent className="sm:max-w-md bg-[#0f0f0f] border border-white/10">
                    <DialogHeader>
                        <DialogTitle className="text-lg flex items-center gap-2">
                            <ShieldCheck className="h-4 w-4 text-cyan-300" />
                            Privacy tools
                        </DialogTitle>
                        <DialogDescription className="text-xs text-muted-foreground">
                            Control how GhostSweep stores and helps you act on your data.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="mt-4 space-y-6">
                        {/* Plan info / context */}
                        <div className="flex items-center justify-between gap-2 rounded-lg border border-white/10 bg-[#111111] px-3 py-2">
                            <div className="flex flex-col">
                                <span className="text-xs text-muted-foreground">
                                    Plan access
                                </span>
                                {loadingPlan ? (
                                    <Skeleton className="mt-1 h-4 w-24 bg-white/10" />
                                ) : plan ? (
                                    <span className="text-sm text-white">
                                        {isPro ? "Pro – full privacy tools unlocked" : "Free – limited tools"}
                                    </span>
                                ) : (
                                    <span className="text-sm text-red-400">
                                        Couldn’t load plan
                                    </span>
                                )}
                            </div>
                            {plan && (
                                <Badge
                                    className={
                                        isPro
                                            ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/40"
                                            : "bg-zinc-700/40 text-zinc-100 border border-zinc-500/40"
                                    }
                                >
                                    {isPro ? "Pro" : "Free"}
                                </Badge>
                            )}
                        </div>

                        {status === "error" && (
                            <p className="flex items-center gap-1 text-[11px] text-red-400">
                                <AlertCircle className="h-3 w-3" />
                                Problem getting your current plan
                            </p>
                        )}

                        {/* Data removal email template (Pro only) */}
                        <div className="space-y-2 rounded-lg border border-white/10 bg-[#111111] p-3">
                            <div className="flex items-center justify-between gap-2">
                                <div className="flex flex-col gap-1">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium text-white">
                                            Data removal email templates
                                        </span>
                                        {!isPro && (
                                            <Badge className="bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 text-[10px]">
                                                Pro
                                            </Badge>
                                        )}
                                    </div>
                                    <p className="text-[11px] text-muted-foreground">
                                        Generate ready-to-send emails asking services to delete your
                                        account and personal data, referencing your rights.
                                    </p>
                                </div>
                                {isPro ? (
                                    <Button
                                        size="sm"
                                        className="shrink-0"
                                        onClick={() => {
                                            // TODO: open your template UI / navigate e.g. /tools/data-removal
                                            // For now maybe show a toast or navigate to a placeholder page.
                                            window.location.href = "/dashboard/tools/data-removal";
                                        }}
                                    >
                                        Open
                                    </Button>
                                ) : (
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="shrink-0 inline-flex items-center gap-1"
                                        onClick={handleUpgrade}
                                    >
                                        <Lock className="h-3 w-3" />
                                        Upgrade
                                    </Button>
                                )}
                            </div>
                        </div>

                        {/* Delete all sweep data */}
                        <div className="space-y-2 rounded-lg border border-red-500/40 bg-[#180d0d] p-3">
                            <div className="flex items-center justify-between gap-2">
                                <div className="flex flex-col gap-1">
                                    <span className="text-sm font-medium text-red-200">
                                        Delete all sweep data
                                    </span>
                                    <p className="text-[11px] text-red-200/80">
                                        Permanently remove your detected services, breach history,
                                        and scan events from GhostSweep. This does not disconnect
                                        your Gmail account.
                                    </p>
                                </div>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="border-red-500/60 text-red-200 hover:bg-red-500/10 hover:text-red-100 shrink-0 inline-flex items-center gap-1"
                                    onClick={() => {
                                        setDeleteError(null);
                                        setDeleteSuccess(null);
                                        setDeleteDialogOpen(true);
                                    }}
                                >
                                    <Trash2 className="h-3 w-3" />
                                    Delete
                                </Button>
                            </div>
                            {deleteSuccess && (
                                <p className="text-[11px] text-emerald-300 mt-1">
                                    {deleteSuccess}
                                </p>
                            )}
                            {deleteError && (
                                <p className="text-[11px] text-red-400 mt-1">
                                    {deleteError}
                                </p>
                            )}
                        </div>

                        {/* Download data (future) */}
                        <div className="space-y-2 rounded-lg border border-white/10 bg-[#111111] p-3 opacity-70">
                            <div className="flex items-center justify-between gap-2">
                                <div className="flex flex-col gap-1">
                                    <span className="text-sm font-medium text-white">
                                        Download your data
                                    </span>
                                    <p className="text-[11px] text-muted-foreground">
                                        Export a full report of your sweeps, detected services, and
                                        breaches as a file you can keep. Coming soon.
                                    </p>
                                </div>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    disabled
                                    className="shrink-0 inline-flex items-center gap-1 cursor-not-allowed"
                                >
                                    <Download className="h-3 w-3" />
                                    Soon
                                </Button>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="flex justify-end pt-2">
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

            {/* Confirm delete all sweep data */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent className="bg-[#0f0f0f] border border-white/10">
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            Delete all GhostSweep data for this account?
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-xs text-muted-foreground">
                            GhostSweep will disconnect this Gmail account and delete its sweep results (services found and breach data).
                            You won’t be able to run new sweeps or check for new breaches until you reconnect.
                            You can reconnect this email at any time.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={deleteLoading}>
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteSweepData}
                            disabled={deleteLoading}
                            className="bg-red-600 hover:bg-red-700 text-white"
                        >
                            {deleteLoading ? "Deleting..." : "Delete data"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}