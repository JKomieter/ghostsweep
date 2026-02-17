"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { 
    ArrowLeft, 
    ExternalLink, 
    Copy, 
    ShieldAlert, 
    ShieldCheck,
    Trash2, 
    Clock, 
    Mail,
    Calendar,
    Globe,
    Tag,
    AlertTriangle,
    CheckCircle2
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import { formatDate } from "@/utils/format_date";
import DeletionEmailModal from "./deletion_email_modal";

type DeletionPlaybook = {
    id: string;
    deletion_url: string | null;
    deletion_email: string | null;
    deletion_method: "self_service" | "email" | "form" | "support" | "not_possible" | "manual" | null;
    deletion_difficulty: "easy" | "medium" | "hard" | "very_hard" | null;
    steps: Array<string | { step: number; title: string; description: string }> | null;
    data_retention_notes: string | null;
    data_deletion_info: string | null;
    identity_verification_notes: string | null;
    subject_suggestion: string | null;
    confidence: number | null;
};

type DeletionRequest = {
    id: string;
    status: string;
    created_at: string;
    sent_at: string | null;
    completed_at: string | null;
    follow_up_count: number | null;
    deletion_method: string | null;
};

type AccountDetails = {
    id: string;
    service_id: string;
    name: string;
    domain: string;
    category: string;
    logo_url: string | null;
    is_breached: boolean;
    email_count: number;
    first_seen_at: string | null;
    last_seen_at: string | null;
    status: string | null;
    email: string | null;
    is_whitelisted: boolean;
    days_since_last_seen: number | null;
    risk_level: "high" | "medium" | "low";
    breaches?: Array<{
        id: string;
        breach_name: string;
        breach_date: string;
        description?: string;
    }>;
    playbook?: DeletionPlaybook | null;
    deletion_request?: DeletionRequest | null;
};

type Props = {
    accountId: string;
};

export default function AccountDetailsPage({ accountId }: Props) {
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState("overview");
    const [emailModalOpen, setEmailModalOpen] = useState(false);

    // Fetch account details
    const { data: account, status } = useQuery<AccountDetails>({
        queryKey: ["account_details", accountId],
        queryFn: async () => {
            const res = await fetch(`/api/dashboard/accounts/${accountId}`);
            if (!res.ok) throw new Error("Failed to fetch account details");
            return res.json();
        },
        enabled: !!accountId,
    });

    // Toggle whitelist mutation
    const toggleWhitelist = useMutation({
        mutationFn: async (isWhitelisted: boolean) => {
            const res = await fetch("/api/dashboard/accounts", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ids: [accountId], is_whitelisted: isWhitelisted }),
            });
            if (!res.ok) throw new Error("Failed to update whitelist status");
            return res.json();
        },
        onSuccess: () => {
            toast.success(account?.is_whitelisted ? "Removed from trusted list" : "Added to trusted list");
            queryClient.invalidateQueries({ queryKey: ["account_details", accountId] });
            queryClient.invalidateQueries({ queryKey: ["accounts"] });
        },
        onError: () => toast.error("Failed to update status"),
    });

    // Mark as deleted mutation
    const markAsDeleted = useMutation({
        mutationFn: async () => {
            const res = await fetch("/api/dashboard/accounts", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ids: [accountId], status: "deleted" }),
            });
            if (!res.ok) throw new Error("Failed to mark as deleted");
            return res.json();
        },
        onSuccess: () => {
            toast.success("Account marked as deleted");
            queryClient.invalidateQueries({ queryKey: ["account_details", accountId] });
            queryClient.invalidateQueries({ queryKey: ["accounts"] });
        },
        onError: () => toast.error("Failed to mark as deleted"),
    });

    // Restore account mutation
    const restoreAccount = useMutation({
        mutationFn: async () => {
            const res = await fetch("/api/dashboard/accounts", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ids: [accountId], status: "active" }),
            });
            if (!res.ok) throw new Error("Failed to restore account");
            return res.json();
        },
        onSuccess: () => {
            toast.success("Account restored");
            queryClient.invalidateQueries({ queryKey: ["account_details", accountId] });
            queryClient.invalidateQueries({ queryKey: ["accounts"] });
        },
        onError: () => toast.error("Failed to restore account"),
    });

    // Permanently delete account mutation
    const permanentlyDelete = useMutation({
        mutationFn: async () => {
            const res = await fetch(`/api/dashboard/accounts?id=${accountId}`, {
                method: "DELETE",
            });
            if (!res.ok) throw new Error("Failed to permanently delete account");
            return res.json();
        },
        onSuccess: () => {
            toast.success("Account permanently deleted");
            queryClient.invalidateQueries({ queryKey: ["accounts"] });
            window.location.href = "/dashboard/accounts";
        },
        onError: () => toast.error("Failed to delete account"),
    });

    const copyDomain = async () => {
        if (!account?.domain) return;
        try {
            await navigator.clipboard.writeText(account.domain);
            toast.success("Copied", { description: account.domain });
        } catch {
            toast.error("Failed to copy");
        }
    };

    const riskColor = useMemo(() => {
        if (account?.is_breached) return "text-red-400";
        if (account?.days_since_last_seen && account.days_since_last_seen > 365) return "text-amber-400";
        return "text-emerald-400";
    }, [account]);

    const riskLabel = useMemo(() => {
        if (account?.is_breached) return "High Risk - Breached";
        if (account?.days_since_last_seen && account.days_since_last_seen > 365) return "Medium Risk - Unused";
        return "Low Risk";
    }, [account]);

    if (status === "pending") {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Spinner className="h-8 w-8" />
            </div>
        );
    }

    if (status === "error" || !account) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <AlertTriangle className="h-12 w-12 text-red-400" />
                <p className="text-white/60">Failed to load account details</p>
                <Link href="/dashboard/accounts">
                    <Button variant="outline">Back to Accounts</Button>
                </Link>
            </div>
        );
    }

    const isDeleted = account.status === "deleted";

    return (
        <div className="w-full space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="flex items-start gap-4">
                    <Link href="/dashboard/accounts" className="shrink-0">
                        <Button variant="ghost" size="sm" className="gap-2 px-2 border border-white/5 bg-white/2 hover:border-white/10 hover:bg-white/3">
                            <ArrowLeft className="h-4 w-4" />
                            <span className="hidden sm:inline text-sm">Back</span>
                        </Button>
                    </Link>

                    {/* Logo */}
                    <div className="relative h-14 w-14 overflow-hidden rounded-xl border border-white/10 bg-white/5 shrink-0 flex items-center justify-center">
                        {account.logo_url ? (
                            <Image 
                                src={account.logo_url} 
                                alt={account.name} 
                                width={56} 
                                height={56} 
                                className="h-full w-full object-cover" 
                            />
                        ) : (
                            <span className="text-white/40 text-xl font-bold">
                                {account.name?.substring(0, 1).toUpperCase()}
                            </span>
                        )}
                    </div>

                    <div className="min-w-0 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                            <h1 className="text-2xl font-semibold text-white truncate">
                                {account.name}
                            </h1>
                            {account.is_breached && (
                                <Badge variant="destructive" className="gap-1">
                                    <ShieldAlert className="h-3 w-3" />
                                    Breached
                                </Badge>
                            )}
                            {account.is_whitelisted && (
                                <Badge className="gap-1 bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                                    <ShieldCheck className="h-3 w-3" />
                                    Trusted
                                </Badge>
                            )}
                            {isDeleted && (
                                <Badge variant="secondary" className="gap-1">
                                    <Trash2 className="h-3 w-3" />
                                    Deleted
                                </Badge>
                            )}
                        </div>

                        <div className="flex items-center gap-3 text-sm text-white/50">
                            {account.domain && (
                                <button
                                    onClick={copyDomain}
                                    className="flex items-center gap-1 hover:text-white/80 transition-colors"
                                >
                                    <Globe className="h-3.5 w-3.5" />
                                    {account.domain}
                                    <Copy className="h-3 w-3 ml-1" />
                                </button>
                            )}
                            {account.category && (
                                <span className="flex items-center gap-1">
                                    <Tag className="h-3.5 w-3.5" />
                                    {account.category}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                    {account.domain && (
                        <Button
                            variant="outline"
                            size="sm"
                            className="gap-2"
                            onClick={() => window.open(`https://${account.domain}`, "_blank")}
                        >
                            <ExternalLink className="h-4 w-4" />
                            Visit Site
                        </Button>
                    )}
                    <Button
                        variant="outline"
                        size="sm"
                        className={account.is_whitelisted ? "text-emerald-400 border-emerald-500/30" : ""}
                        onClick={() => toggleWhitelist.mutate(!account.is_whitelisted)}
                        disabled={toggleWhitelist.isPending}
                    >
                        {toggleWhitelist.isPending ? (
                            <Spinner className="h-4 w-4" />
                        ) : account.is_whitelisted ? (
                            <>
                                <ShieldCheck className="h-4 w-4 mr-2" />
                                Trusted
                            </>
                        ) : (
                            <>
                                <ShieldCheck className="h-4 w-4 mr-2" />
                                Trust
                            </>
                        )}
                    </Button>
                </div>
            </div>

            {/* Risk Status Banner */}
            <Card className="border-white/5 bg-white/2">
                <CardContent className="py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            {account.is_breached ? (
                                <ShieldAlert className={`h-8 w-8 ${riskColor}`} />
                            ) : account.days_since_last_seen && account.days_since_last_seen > 365 ? (
                                <Clock className={`h-8 w-8 ${riskColor}`} />
                            ) : (
                                <CheckCircle2 className={`h-8 w-8 ${riskColor}`} />
                            )}
                            <div>
                                <p className={`font-medium ${riskColor}`}>{riskLabel}</p>
                                <p className="text-sm text-white/50">
                                    {account.is_breached
                                        ? "This account was found in a data breach. Consider changing your password or deleting the account."
                                        : account.days_since_last_seen && account.days_since_last_seen > 365
                                        ? `No activity in ${Math.floor(account.days_since_last_seen / 365)} year(s). Consider deleting if unused.`
                                        : "This account appears to be in good standing."}
                                </p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="bg-transparent border-b border-white/5 w-full justify-start">
                    <TabsTrigger
                        value="overview"
                        className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-white data-[state=active]:text-white text-white/60 rounded-none"
                    >
                        Overview
                    </TabsTrigger>
                    <TabsTrigger
                        value="deletion"
                        className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-white data-[state=active]:text-white text-white/60 rounded-none"
                    >
                        Deletion
                    </TabsTrigger>
                    {account.is_breached && (
                        <TabsTrigger
                            value="breaches"
                            className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-white data-[state=active]:text-white text-white/60 rounded-none"
                        >
                            Breaches
                        </TabsTrigger>
                    )}
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-6 mt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Account Info */}
                        <Card className="border-white/5 bg-white/2">
                            <CardHeader>
                                <CardTitle className="text-lg">Account Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-white/50 flex items-center gap-2">
                                        <Mail className="h-4 w-4" />
                                        Email
                                    </span>
                                    <span className="text-white">{account.email || "Unknown"}</span>
                                </div>
                                <Separator className="bg-white/5" />
                                <div className="flex justify-between items-center">
                                    <span className="text-white/50 flex items-center gap-2">
                                        <Calendar className="h-4 w-4" />
                                        First Seen
                                    </span>
                                    <span className="text-white">
                                        {account.first_seen_at ? formatDate(account.first_seen_at) : "Unknown"}
                                    </span>
                                </div>
                                <Separator className="bg-white/5" />
                                <div className="flex justify-between items-center">
                                    <span className="text-white/50 flex items-center gap-2">
                                        <Clock className="h-4 w-4" />
                                        Last Seen
                                    </span>
                                    <span className="text-white">
                                        {account.last_seen_at ? formatDate(account.last_seen_at) : "Unknown"}
                                    </span>
                                </div>
                                <Separator className="bg-white/5" />
                                <div className="flex justify-between items-center">
                                    <span className="text-white/50">Email Count</span>
                                    <span className="text-white">{account.email_count} emails</span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Quick Actions */}
                        <Card className="border-white/5 bg-white/2">
                            <CardHeader>
                                <CardTitle className="text-lg">Quick Actions</CardTitle>
                                <CardDescription>Manage this account</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {account.domain && (
                                    <Button
                                        variant="outline"
                                        className="w-full justify-start gap-2"
                                        onClick={() => window.open(`https://${account.domain}`, "_blank")}
                                    >
                                        <ExternalLink className="h-4 w-4" />
                                        Visit {account.name}
                                    </Button>
                                )}
                                <Button
                                    variant="outline"
                                    className={`w-full justify-start gap-2 ${account.is_whitelisted ? "text-emerald-400" : ""}`}
                                    onClick={() => toggleWhitelist.mutate(!account.is_whitelisted)}
                                    disabled={toggleWhitelist.isPending}
                                >
                                    <ShieldCheck className="h-4 w-4" />
                                    {account.is_whitelisted ? "Remove from Trusted" : "Mark as Trusted"}
                                </Button>
                                {!isDeleted ? (
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="destructive" className="w-full justify-start gap-2">
                                                <Trash2 className="h-4 w-4" />
                                                Mark as Deleted
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent className="bg-[#0A0A0A] border-white/10">
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Mark account as deleted?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    This will mark the account as deleted in GhostSweep. Make sure you have already deleted your account on {account.name}&apos;s website.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction
                                                    onClick={() => markAsDeleted.mutate()}
                                                    className="bg-red-600 hover:bg-red-700"
                                                >
                                                    {markAsDeleted.isPending ? <Spinner className="h-4 w-4" /> : "Mark Deleted"}
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                ) : (
                                    <>
                                        <Button
                                            variant="outline"
                                            className="w-full justify-start gap-2"
                                            onClick={() => restoreAccount.mutate()}
                                            disabled={restoreAccount.isPending}
                                        >
                                            {restoreAccount.isPending ? <Spinner className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
                                            Restore Account
                                        </Button>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="destructive" className="w-full justify-start gap-2">
                                                    <Trash2 className="h-4 w-4" />
                                                    Permanently Delete
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent className="bg-[#0A0A0A] border-white/10">
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Permanently delete this account?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        This will permanently remove {account.name} from your GhostSweep dashboard. This action cannot be undone.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction
                                                        onClick={() => permanentlyDelete.mutate()}
                                                        className="bg-red-600 hover:bg-red-700"
                                                    >
                                                        {permanentlyDelete.isPending ? <Spinner className="h-4 w-4" /> : "Delete Forever"}
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* Deletion Tab */}
                <TabsContent value="deletion" className="space-y-6 mt-6">
                    {/* Deletion Request Status Banner */}
                    {account.deletion_request && (
                        <Card className="border-white/5 bg-white/2">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    Deletion Request
                                    <Badge variant="outline" className={`ml-2 ${
                                        account.deletion_request.status === "completed" ? "border-emerald-500/30 text-emerald-400" :
                                        account.deletion_request.status === "sent" || account.deletion_request.status === "received" ? "border-blue-500/30 text-blue-400" :
                                        account.deletion_request.status === "in_progress" || account.deletion_request.status === "needs_verification" ? "border-amber-500/30 text-amber-400" :
                                        account.deletion_request.status === "failed" || account.deletion_request.status === "expired" ? "border-red-500/30 text-red-400" :
                                        "border-slate-500/30 text-slate-400"
                                    }`}>
                                        {account.deletion_request.status === "drafted" && "Drafted"}
                                        {account.deletion_request.status === "sent" && "Sent"}
                                        {account.deletion_request.status === "received" && "Received"}
                                        {account.deletion_request.status === "needs_verification" && "Needs Verification"}
                                        {account.deletion_request.status === "in_progress" && "In Progress"}
                                        {account.deletion_request.status === "completed" && "Completed"}
                                        {account.deletion_request.status === "failed" && "Failed"}
                                        {account.deletion_request.status === "expired" && "Expired"}
                                    </Badge>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                    <div>
                                        <p className="text-white/50">Created</p>
                                        <p className="text-white">{formatDate(account.deletion_request.created_at)}</p>
                                    </div>
                                    {account.deletion_request.sent_at && (
                                        <div>
                                            <p className="text-white/50">Sent</p>
                                            <p className="text-white">{formatDate(account.deletion_request.sent_at)}</p>
                                        </div>
                                    )}
                                    {account.deletion_request.completed_at && (
                                        <div>
                                            <p className="text-white/50">Completed</p>
                                            <p className="text-white">{formatDate(account.deletion_request.completed_at)}</p>
                                        </div>
                                    )}
                                    {account.deletion_request.follow_up_count !== null && account.deletion_request.follow_up_count > 0 && (
                                        <div>
                                            <p className="text-white/50">Follow-ups</p>
                                            <p className="text-white">{account.deletion_request.follow_up_count}</p>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    <Card className="border-white/5 bg-white/2">
                        <CardHeader>
                            <CardTitle className="text-lg">
                                {account.deletion_request ? "Deletion Instructions" : "Delete Your Account"}
                            </CardTitle>
                            <CardDescription>
                                {account.playbook 
                                    ? `We found specific instructions for deleting your ${account.name} account`
                                    : `Follow these steps to delete your account on ${account.name}`
                                }
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {account.deletion_request?.status === "completed" ? (
                                <div className="flex items-center gap-3 p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                                    <CheckCircle2 className="h-6 w-6 text-emerald-400" />
                                    <div>
                                        <p className="font-medium text-emerald-400">Account Deleted</p>
                                        <p className="text-sm text-white/60">
                                            This deletion request has been completed.
                                        </p>
                                    </div>
                                </div>
                            ) : isDeleted ? (
                                <div className="flex items-center gap-3 p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                                    <CheckCircle2 className="h-6 w-6 text-emerald-400" />
                                    <div>
                                        <p className="font-medium text-emerald-400">Account Deleted</p>
                                        <p className="text-sm text-white/60">
                                            You marked this account as deleted.
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    {/* Playbook info banner */}
                                    {account.playbook && (
                                        <div className="flex flex-wrap items-center gap-3 p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                                            <Badge variant="outline" className="border-blue-500/30 text-blue-400">
                                                {account.playbook.deletion_method === "self_service" && "Self Service"}
                                                {account.playbook.deletion_method === "email" && "Email Required"}
                                                {account.playbook.deletion_method === "form" && "Form Submission"}
                                                {account.playbook.deletion_method === "support" && "Contact Support"}
                                                {account.playbook.deletion_method === "not_possible" && "Not Possible"}
                                                {account.playbook.deletion_method === "manual" && "Manual Process"}
                                                {!account.playbook.deletion_method && "Unknown Method"}
                                            </Badge>
                                            {account.playbook.deletion_difficulty && (
                                                <Badge variant="outline" className={`
                                                    ${account.playbook.deletion_difficulty === "easy" ? "border-emerald-500/30 text-emerald-400" : ""}
                                                    ${account.playbook.deletion_difficulty === "medium" ? "border-amber-500/30 text-amber-400" : ""}
                                                    ${account.playbook.deletion_difficulty === "hard" ? "border-orange-500/30 text-orange-400" : ""}
                                                    ${account.playbook.deletion_difficulty === "very_hard" ? "border-red-500/30 text-red-400" : ""}
                                                `}>
                                                    {account.playbook.deletion_difficulty === "easy" && "Easy"}
                                                    {account.playbook.deletion_difficulty === "medium" && "Medium Difficulty"}
                                                    {account.playbook.deletion_difficulty === "hard" && "Hard"}
                                                    {account.playbook.deletion_difficulty === "very_hard" && "Very Hard"}
                                                </Badge>
                                            )}
                                            {account.playbook.confidence !== null && account.playbook.confidence >= 0.8 && (
                                                <Badge variant="outline" className="border-emerald-500/30 text-emerald-400">
                                                    Verified
                                                </Badge>
                                            )}
                                        </div>
                                    )}

                                    {/* Quick action buttons for playbook */}
                                    {account.playbook && (account.playbook.deletion_url || account.playbook.deletion_email) && (
                                        <div className="flex flex-wrap gap-3">
                                            {account.playbook.deletion_url && (
                                                <Button
                                                    variant="outline"
                                                    className="gap-2"
                                                    onClick={() => window.open(account.playbook!.deletion_url!, "_blank")}
                                                >
                                                    <ExternalLink className="h-4 w-4" />
                                                    Open Deletion Page
                                                </Button>
                                            )}
                                            {account.playbook.deletion_email && (
                                                <Button
                                                    variant="outline"
                                                    className="gap-2"
                                                    onClick={() => setEmailModalOpen(true)}
                                                >
                                                    <Mail className="h-4 w-4" />
                                                    Send Deletion Email
                                                </Button>
                                            )}
                                        </div>
                                    )}

                                    <div className="space-y-4">
                                        {/* Use playbook steps if available, otherwise show generic steps */}
                                        {account.playbook?.steps && account.playbook.steps.length > 0 ? (
                                            <>
                                                {account.playbook.steps.map((step, index) => {
                                                    // Handle both string and object step formats
                                                    const isStringStep = typeof step === "string";
                                                    const stepNumber = isStringStep ? index + 1 : (step.step || index + 1);
                                                    const stepTitle = isStringStep ? `Step ${index + 1}` : step.title;
                                                    const stepDescription = isStringStep ? step : step.description;

                                                    return (
                                                        <div key={index} className="flex items-start gap-4 p-4 rounded-lg bg-white/2 border border-white/5">
                                                            <div className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-500/20 text-blue-400 shrink-0">
                                                                {stepNumber}
                                                            </div>
                                                            <div>
                                                                {!isStringStep && <p className="font-medium text-white">{stepTitle}</p>}
                                                                <p className={`text-sm ${isStringStep ? "text-white" : "text-white/60 mt-1"}`}>
                                                                    {stepDescription}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </>
                                        ) : (
                                            <>
                                                <div className="flex items-start gap-4 p-4 rounded-lg bg-white/2 border border-white/5">
                                                    <div className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-500/20 text-blue-400 shrink-0">
                                                        1
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-white">Visit the website</p>
                                                        <p className="text-sm text-white/60 mt-1">
                                                            Go to {account.name}&apos;s website and log into your account.
                                                        </p>
                                                        {account.domain && (
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                className="mt-3 gap-2"
                                                                onClick={() => window.open(`https://${account.domain}`, "_blank")}
                                                            >
                                                                <ExternalLink className="h-4 w-4" />
                                                                Open {account.domain}
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="flex items-start gap-4 p-4 rounded-lg bg-white/2 border border-white/5">
                                                    <div className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-500/20 text-blue-400 shrink-0">
                                                        2
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-white">Find account settings</p>
                                                        <p className="text-sm text-white/60 mt-1">
                                                            Navigate to your account settings or privacy settings. Look for options like &quot;Delete Account&quot;, &quot;Close Account&quot;, or &quot;Deactivate&quot;.
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="flex items-start gap-4 p-4 rounded-lg bg-white/2 border border-white/5">
                                                    <div className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-500/20 text-blue-400 shrink-0">
                                                        3
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-white">Request deletion</p>
                                                        <p className="text-sm text-white/60 mt-1">
                                                            Follow their process to delete your account. You may need to confirm via email.
                                                        </p>
                                                    </div>
                                                </div>
                                            </>
                                        )}

                                        {/* Additional playbook info */}
                                        {account.playbook?.data_retention_notes && (
                                            <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
                                                <p className="font-medium text-amber-400 mb-1">Data Retention</p>
                                                <p className="text-sm text-white/70">{account.playbook.data_retention_notes}</p>
                                            </div>
                                        )}

                                        {account.playbook?.identity_verification_notes && (
                                            <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                                                <p className="font-medium text-blue-400 mb-1">Identity Verification</p>
                                                <p className="text-sm text-white/70">{account.playbook.identity_verification_notes}</p>
                                            </div>
                                        )}

                                        {/* Mark as deleted step */}
                                        <div className="flex items-start gap-4 p-4 rounded-lg bg-white/2 border border-white/5">
                                            <div className="flex items-center justify-center h-8 w-8 rounded-full bg-emerald-500/20 text-emerald-400 shrink-0">
                                                ✓
                                            </div>
                                            <div>
                                                <p className="font-medium text-white">Mark as deleted</p>
                                                <p className="text-sm text-white/60 mt-1">
                                                    Once you&apos;ve deleted your account, mark it as deleted here to track your progress.
                                                </p>
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button className="mt-3 gap-2 bg-emerald-600 hover:bg-emerald-700">
                                                            <CheckCircle2 className="h-4 w-4" />
                                                            I&apos;ve Deleted This Account
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent className="bg-[#0A0A0A] border-white/10">
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                Are you sure you&apos;ve successfully deleted your account on {account.name}? This will mark it as deleted in GhostSweep.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                            <AlertDialogAction
                                                                onClick={() => markAsDeleted.mutate()}
                                                                className="bg-emerald-600 hover:bg-emerald-700"
                                                            >
                                                                {markAsDeleted.isPending ? <Spinner className="h-4 w-4" /> : "Confirm"}
                                                            </AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Breaches Tab */}
                {account.is_breached && (
                    <TabsContent value="breaches" className="space-y-6 mt-6">
                        <Card className="border-white/5 bg-white/2">
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <ShieldAlert className="h-5 w-5 text-red-400" />
                                    Data Breaches
                                </CardTitle>
                                <CardDescription>
                                    Your data was exposed in the following breaches
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {account.breaches && account.breaches.length > 0 ? (
                                    <div className="space-y-4">
                                        {account.breaches.map((breach) => (
                                            <div
                                                key={breach.id}
                                                className="p-4 rounded-lg bg-red-500/5 border border-red-500/20"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <h4 className="font-medium text-white">{breach.breach_name}</h4>
                                                    <Badge variant="destructive">
                                                        {formatDate(breach.breach_date)}
                                                    </Badge>
                                                </div>
                                                {breach.description && (
                                                    <p className="text-sm text-white/60 mt-2">{breach.description}</p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <ShieldAlert className="h-12 w-12 text-red-400/50 mx-auto mb-3" />
                                        <p className="text-white/60">
                                            This account was found in a breach, but details are not available.
                                        </p>
                                        <p className="text-sm text-white/40 mt-1">
                                            We recommend changing your password for this service.
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Recommendations */}
                        <Card className="border-amber-500/20 bg-amber-500/5">
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2 text-amber-400">
                                    <AlertTriangle className="h-5 w-5" />
                                    Recommended Actions
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="h-2 w-2 rounded-full bg-amber-400" />
                                    <p className="text-white/80">Change your password on {account.name}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="h-2 w-2 rounded-full bg-amber-400" />
                                    <p className="text-white/80">Enable two-factor authentication if available</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="h-2 w-2 rounded-full bg-amber-400" />
                                    <p className="text-white/80">Check if you used the same password elsewhere</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="h-2 w-2 rounded-full bg-amber-400" />
                                    <p className="text-white/80">Consider deleting the account if no longer needed</p>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                )}
            </Tabs>

            {/* Deletion Email Modal */}
            {account && (
                <DeletionEmailModal
                    open={emailModalOpen}
                    onOpenChange={setEmailModalOpen}
                    accountId={account.id}
                    serviceName={account.name}
                    domain={account.domain}
                    category={account.category}
                    isBreached={account.is_breached}
                    userEmail={account.email}
                    playbook={account.playbook ?? null}
                />
            )}
        </div>
    );
}
