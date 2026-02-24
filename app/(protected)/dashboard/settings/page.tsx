"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import Input from "@/components/ui/input";
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
    Mail,
    Shield,
    ShieldCheck,
    Trash2,
    RefreshCw,
    Unplug,
    Loader2,
    Crown,
    AlertTriangle,
    Database,
    Lock,
    ExternalLink,
    CheckCircle,
    Eye,
    FileText,
    Zap,
    Settings,
    Download,
} from "lucide-react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import ConnectAccountModal from "./_components/connect-account-modal";
import { usePrivacyReport } from "@/hooks/use-privacy-report";


// Type definitions
type EmailAccount = { 
    id: string; 
    gmail_address?: string; 
    outlook_address?: string; 
    created_at: string;
    status?: string;
};

type PlanData = { 
    current_plan: "free" | "buster" | "pro";
    scan_credits_remaining?: number;
    renews_at?: string | null;
    has_used_trial: boolean;
};

type OverviewData = {
    totalValue: number;
    totalSubs: number;
    newsletters: number;
    oldAccounts: number;
};

type LatestSweepData = {
    sweepId: string | null;
    status: "pending" | "processing" | "completed" | "failed" | "cancelled" | null;
    servicesFound?: number;
    breachesFound?: number;
    completedAt?: string | null;
    startedAt?: string | null;
};

// Settings Section Component
function SettingsSection({ 
    title, 
    description, 
    icon: Icon, 
    children,
    danger = false,
}: { 
    title: string; 
    description?: string; 
    icon: React.ElementType;
    children: React.ReactNode;
    danger?: boolean;
}) {
    return (
        <div className={`rounded-xl border p-6 ${
            danger 
                ? "border-red-500/30 bg-red-500/5" 
                : "border-white/10 bg-[#0f0f0f]"
        }`}>
            <div className="flex items-start gap-3 mb-4">
                <div className={`p-2 rounded-lg ${
                    danger ? "bg-red-500/10" : "bg-white/5"
                }`}>
                    <Icon className={`h-5 w-5 ${
                        danger ? "text-red-400" : "text-cyan-400"
                    }`} />
                </div>
                <div>
                    <h2 className={`text-lg font-semibold ${
                        danger ? "text-red-400" : "text-white"
                    }`}>{title}</h2>
                    {description && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                            {description}
                        </p>
                    )}
                </div>
            </div>
            {children}
        </div>
    );
}

export default function SettingsPage() {
    const supabase = createClient();
    const queryClient = useQueryClient();
    
    // User email for delete confirmation
    const [userEmail, setUserEmail] = useState("");
    
    // Dialog states
    const [disconnectDialogOpen, setDisconnectDialogOpen] = useState(false);
    const [deleteDataDialogOpen, setDeleteDataDialogOpen] = useState(false);
    const [deleteAccountDialogOpen, setDeleteAccountDialogOpen] = useState(false);
    const [connectAccountModalOpen, setConnectAccountModalOpen] = useState(false);
    
    // Confirmation inputs
    const [deleteConfirmText, setDeleteConfirmText] = useState("");
    const [deleteEmailConfirm, setDeleteEmailConfirm] = useState("");
    
    // Account to disconnect
    const [accountToDisconnect, setAccountToDisconnect] = useState<{ 
        id: string; 
        email: string; 
        type: "gmail" | "microsoft" 
    } | null>(null);

    // Load user email
    useEffect(() => {
        const loadUser = async () => {
            const { data } = await supabase.auth.getUser();
            if (data.user?.email) {
                setUserEmail(data.user.email);
            }
        };
        loadUser();
    }, [supabase]);

    // Fetch email accounts
    const { data: emailAccounts, isLoading: emailAccountsLoading } = useQuery({
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
    });

    // Fetch plan
    const { data: planData, isLoading: planLoading } = useQuery<PlanData>({
        queryKey: ["plan"],
        queryFn: async () => {
            const res = await fetch("/api/plan");
            if (!res.ok) throw new Error("Failed to fetch plan");
            return res.json();
        },
    });

    // Fetch overview stats
    const { data: overviewData, isLoading: overviewLoading } = useQuery<OverviewData>({
        queryKey: ["dashboard-overview"],
        queryFn: async () => {
            const res = await fetch("/api/dashboard/overview");
            if (!res.ok) throw new Error("Failed to fetch overview");
            return res.json();
        },
    });

    // Fetch latest sweep (include read sweeps for settings page)
    const { data: sweepData, isLoading: sweepLoading } = useQuery<LatestSweepData>({
        queryKey: ["latestSweep", "settings"],
        queryFn: async () => {
            const res = await fetch("/api/sweep/status/latest?includeRead=true");
            if (!res.ok) throw new Error("Failed to fetch sweep");
            return res.json();
        },
    });

    // Disconnect email mutation
    const disconnectMutation = useMutation({
        mutationFn: async ({ id, type }: { id: string; type: "gmail" | "microsoft" }) => {
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
                throw new Error(body.error || "Failed to disconnect");
            }

            return res.json();
        },
        onSuccess: () => {
            toast.success("Email disconnected successfully. Your data has been kept.");
            setDisconnectDialogOpen(false);
            setAccountToDisconnect(null);
            queryClient.invalidateQueries({ queryKey: ["emailAccounts"] });
        },
        onError: (error: Error) => {
            toast.error(error.message || "Failed to disconnect email");
        },
    });

    // Delete all data mutation
    const deleteDataMutation = useMutation({
        mutationFn: async () => {
            const res = await fetch("/api/delete_sweep_data", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
            });

            if (!res.ok) {
                const body = await res.json().catch(() => ({}));
                throw new Error(body.error || "Failed to delete data");
            }

            return res.json();
        },
        onSuccess: () => {
            toast.success("All scanned data has been deleted. You can run a new scan anytime.");
            setDeleteDataDialogOpen(false);
            setDeleteConfirmText("");
            queryClient.invalidateQueries({ queryKey: ["dashboard-overview"] });
            queryClient.invalidateQueries({ queryKey: ["user_services"] });
            queryClient.invalidateQueries({ queryKey: ["metrics"] });
        },
        onError: (error: Error) => {
            toast.error(error.message || "Failed to delete data");
        },
    });

    // Delete account mutation
    const deleteAccountMutation = useMutation({
        mutationFn: async () => {
            const res = await fetch("/api/account/delete", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
            });

            if (!res.ok) {
                const body = await res.json().catch(() => ({}));
                throw new Error(body.error || "Failed to delete account");
            }

            return res.json();
        },
        onSuccess: () => {
            toast.success("Account deleted successfully");
            window.location.href = "/home";
        },
        onError: (error: Error) => {
            toast.error(error.message || "Failed to delete account");
        },
    });

    // Handle billing portal
    const handleManageBilling = async () => {
        try {
            const res = await fetch("/api/stripe/customer_portal_session", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
            });

            if (!res.ok) throw new Error("Failed to create billing portal session");

            const data = await res.json();
            window.location.href = data.url;
        } catch (error) {
            toast.error("Could not open billing portal. Please try again.");
            console.error("Billing portal error:", error);
        }
    };

    // Run scan handler
    const handleRunScan = () => {
        window.location.href = "/dashboard";
    };

    const gmailAccounts = emailAccounts?.gmailAccounts || [];
    const microsoftAccounts = emailAccounts?.microsoftAccounts || [];
    const totalAccounts = gmailAccounts.length + microsoftAccounts.length;
    const isPro = planData?.current_plan === "pro" || planData?.current_plan === "buster";
    const { requestReport, downloadLatestReport, isGenerating: isReportGenerating, isLoadingLatest: isReportLatestLoading, latestReport } = usePrivacyReport();

    return (
        <main className="min-h-screen p-4 md:p-8 max-w-4xl mx-auto">
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <Settings className="h-6 w-6 text-cyan-400" />
                    <h1 className="text-2xl font-bold text-white">Settings</h1>
                </div>
                <p className="text-sm text-muted-foreground">
                    Manage your account, connected emails, scan preferences, and privacy settings.
                </p>
            </div>

            <div className="space-y-6">
                {/* Connected Accounts Section */}
                <SettingsSection
                    title="Connected Accounts"
                    description="Manage email accounts linked to GhostSweep for scanning"
                    icon={Mail}
                >
                    <div className="space-y-4">
                        {/* Security badges */}
                        <div className="flex flex-wrap gap-2 mb-4">
                            <Badge className="bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                                <Eye className="h-3 w-3 mr-1" />
                                Read-only access
                            </Badge>
                            <Badge className="bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                                <ShieldCheck className="h-3 w-3 mr-1" />
                                CASA Tier 2 Certified
                            </Badge>
                        </div>

                        {emailAccountsLoading ? (
                            <div className="space-y-2">
                                <Skeleton className="h-14 w-full bg-white/10" />
                            </div>
                        ) : totalAccounts === 0 ? (
                            <div className="text-center py-6 border border-dashed border-white/20 rounded-lg">
                                <Mail className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                                <p className="text-sm text-muted-foreground mb-3">
                                    No email accounts connected
                                </p>
                                <Button 
                                    size="sm" 
                                    className="bg-cyan-500 hover:bg-cyan-600"
                                    onClick={() => setConnectAccountModalOpen(true)}
                                >
                                    Connect Email
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {gmailAccounts.map((account) => (
                                    <div 
                                        key={account.id}
                                        className="flex items-center justify-between rounded-lg border border-white/10 bg-black/40 px-4 py-3"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-full bg-red-500/10">
                                                <Mail className="h-4 w-4 text-red-400" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-white">
                                                    {account.gmail_address}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    <CheckCircle className="h-3 w-3 inline mr-1 text-emerald-400" />
                                                    Connected
                                                    {sweepData?.completedAt && (
                                                        <span className="ml-2">
                                                            • Last scan: {new Date(sweepData.completedAt).toLocaleDateString()}
                                                        </span>
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="text-muted-foreground hover:text-white"
                                                onClick={() => window.location.href = "/api/google/oauth/start"}
                                            >
                                                <RefreshCw className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                                onClick={() => {
                                                    setAccountToDisconnect({
                                                        id: account.id,
                                                        email: account.gmail_address || "",
                                                        type: "gmail",
                                                    });
                                                    setDisconnectDialogOpen(true);
                                                }}
                                            >
                                                <Unplug className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}

                                {microsoftAccounts.map((account) => (
                                    <div 
                                        key={account.id}
                                        className="flex items-center justify-between rounded-lg border border-white/10 bg-black/40 px-4 py-3"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-full bg-blue-500/10">
                                                <Mail className="h-4 w-4 text-blue-400" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-white">
                                                    {account.outlook_address}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    <CheckCircle className="h-3 w-3 inline mr-1 text-emerald-400" />
                                                    Connected
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="text-muted-foreground hover:text-white"
                                                onClick={() => window.location.href = "/api/microsoft/authorize"}
                                            >
                                                <RefreshCw className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                                onClick={() => {
                                                    setAccountToDisconnect({
                                                        id: account.id,
                                                        email: account.outlook_address || "",
                                                        type: "microsoft",
                                                    });
                                                    setDisconnectDialogOpen(true);
                                                }}
                                            >
                                                <Unplug className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}

                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="w-full mt-3"
                                    onClick={() => setConnectAccountModalOpen(true)}
                                >
                                    + Add another account
                                </Button>
                            </div>
                        )}
                    </div>
                </SettingsSection>

                {/* Scan Settings Section */}
                <SettingsSection
                    title="Scan Settings"
                    description="Control how and when GhostSweep scans your email"
                    icon={RefreshCw}
                >
                    <div className="space-y-4">
                        {/* Scan info */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="p-3 rounded-lg bg-black/40 border border-white/10">
                                <p className="text-xs text-muted-foreground">Last scan</p>
                                {sweepLoading ? (
                                    <Skeleton className="h-5 w-20 mt-1 bg-white/10" />
                                ) : (
                                    <p className="text-sm font-medium text-white">
                                        {sweepData?.completedAt 
                                            ? new Date(sweepData.completedAt).toLocaleDateString()
                                            : "Never"}
                                    </p>
                                )}
                            </div>
                            <div className="p-3 rounded-lg bg-black/40 border border-white/10">
                                <p className="text-xs text-muted-foreground">Status</p>
                                <p className="text-sm font-medium text-white capitalize">
                                    {sweepData?.status || "Idle"}
                                </p>
                            </div>
                            <div className="p-3 rounded-lg bg-black/40 border border-white/10">
                                <p className="text-xs text-muted-foreground">Services found</p>
                                <p className="text-sm font-medium text-white">
                                    {sweepData?.servicesFound ?? 0}
                                </p>
                            </div>
                            <div className="p-3 rounded-lg bg-black/40 border border-white/10">
                                <p className="text-xs text-muted-foreground">Breaches found</p>
                                <p className="text-sm font-medium text-white">
                                    {sweepData?.breachesFound ?? 0}
                                </p>
                            </div>
                        </div>

                        {/* Run scan now button */}
                        <Button 
                            onClick={handleRunScan}
                            className="w-full bg-cyan-500 hover:bg-cyan-600"
                            disabled={sweepData?.status === "processing" || sweepData?.status === "pending"}
                        >
                            {sweepData?.status === "processing" || sweepData?.status === "pending" ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Scan in progress...
                                </>
                            ) : (
                                <>
                                    <Zap className="h-4 w-4 mr-2" />
                                    Run Scan Now
                                </>
                            )}
                        </Button>
                    </div>
                </SettingsSection>

                {/* Privacy & Data Section */}
                <SettingsSection
                    title="Privacy & Data"
                    description="Control your data and understand our privacy practices"
                    icon={Shield}
                >
                    <div className="space-y-4">
                        {/* Data summary */}
                        <div className="p-4 rounded-lg bg-black/40 border border-white/10">
                            <div className="flex items-center gap-2 mb-3">
                                <Database className="h-4 w-4 text-cyan-400" />
                                <p className="text-sm font-medium text-white">Your Data</p>
                            </div>
                            {overviewLoading ? (
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-40 bg-white/10" />
                                    <Skeleton className="h-4 w-32 bg-white/10" />
                                </div>
                            ) : (
                                <ul className="text-xs text-muted-foreground space-y-1">
                                    <li>• Found values: {overviewData?.totalValue ? `$${overviewData.totalValue.toFixed(2)}` : "$0.00"}</li>
                                    <li>• Subscriptions: {overviewData?.totalSubs || 0} tracked</li>
                                    <li>• Newsletters: {overviewData?.newsletters || 0} subscriptions</li>
                                    <li>• Old accounts: {overviewData?.oldAccounts || 0} accounts</li>
                                    <li>• Last scan: {sweepData?.completedAt ? new Date(sweepData.completedAt).toLocaleString() : "Never"}</li>
                                </ul>
                            )}
                        </div>

                        {/* Security info */}
                        <div className="p-4 rounded-lg bg-black/40 border border-white/10">
                            <div className="flex items-center gap-2 mb-3">
                                <Lock className="h-4 w-4 text-emerald-400" />
                                <p className="text-sm font-medium text-white">Your Security</p>
                            </div>
                            <ul className="text-xs text-muted-foreground space-y-1">
                                <li>• OAuth 2.0 (Read-only access)</li>
                                <li>• CASA Tier 2 Certified</li>
                                <li>• We never store email content</li>
                                <li>• Only metadata about services</li>
                            </ul>
                        </div>

                        {/* Privacy Report */}
                        {latestReport && (
                            <Button
                                variant="outline"
                                onClick={downloadLatestReport}
                                className="w-full border-cyan-500/50 bg-cyan-500/5 text-cyan-300 hover:bg-cyan-500/15"
                            >
                                <Download className="h-4 w-4 mr-2" />
                                Download Last Report
                                {latestReport.generatedAt && (
                                    <span className="ml-auto text-xs text-cyan-500/70">
                                        {new Date(latestReport.generatedAt).toLocaleDateString()}
                                    </span>
                                )}
                            </Button>
                        )}
                        <Button
                            variant="outline"
                            onClick={requestReport}
                            disabled={isReportGenerating || isReportLatestLoading}
                            className="w-full border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10"
                        >
                            {isReportGenerating ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                                <Download className="h-4 w-4 mr-2" />
                            )}
                            {isReportGenerating ? "Generating report…" : latestReport ? "Regenerate Report" : "Generate Privacy Report"}
                        </Button>

                        {/* Action button */}
                        <Button
                            variant="outline"
                            onClick={() => setDeleteDataDialogOpen(true)}
                            className="w-full border-red-500/30 text-red-400 hover:bg-red-500/10"
                        >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete All Scanned Data
                        </Button>

                        {/* Policy links */}
                        <div className="flex items-center gap-4 pt-2 border-t border-white/10">
                            <Link 
                                href="/home/privacy" 
                                className="text-xs text-muted-foreground hover:text-white transition flex items-center gap-1"
                            >
                                <FileText className="h-3 w-3" />
                                Privacy Policy
                                <ExternalLink className="h-3 w-3" />
                            </Link>
                            <Link 
                                href="/home/terms" 
                                className="text-xs text-muted-foreground hover:text-white transition flex items-center gap-1"
                            >
                                <FileText className="h-3 w-3" />
                                Terms of Service
                                <ExternalLink className="h-3 w-3" />
                            </Link>
                        </div>
                    </div>
                </SettingsSection>

                {/* Account & Billing Section */}
                <SettingsSection
                    title="Account & Billing"
                    description="Manage your subscription and payment settings"
                    icon={Crown}
                >
                    <div className="space-y-4">
                        {/* Plan info */}
                        <div className="flex items-center justify-between p-4 rounded-lg bg-black/40 border border-white/10">
                            <div>
                                <p className="text-xs text-muted-foreground mb-1">Current plan</p>
                                {planLoading ? (
                                    <Skeleton className="h-6 w-24 bg-white/10" />
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <Badge className={
                                            isPro 
                                                ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/40"
                                                : "bg-zinc-700/40 text-zinc-100 border border-zinc-500/40"
                                        }>
                                            {isPro ? "Professional" : "Free"}
                                        </Badge>
                                        {isPro && (
                                            <span className="text-xs text-muted-foreground">
                                                $19.99/month
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>
                            {isPro && planData?.renews_at && (
                                <div className="text-right">
                                    <p className="text-xs text-muted-foreground">Next renewal</p>
                                    <p className="text-sm font-medium text-white">
                                        {new Date(planData.renews_at).toLocaleDateString()}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Action buttons */}
                        {isPro ? (
                            <div className="flex flex-wrap gap-3">
                                <Button
                                    variant="outline"
                                    onClick={handleManageBilling}
                                    className="flex-1"
                                >
                                    Manage Billing
                                    <ExternalLink className="h-4 w-4 ml-2" />
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={handleManageBilling}
                                    className="flex-1 border-amber-500/30 text-amber-400 hover:bg-amber-500/10"
                                >
                                    Cancel Subscription
                                </Button>
                            </div>
                        ) : (
                            <Link href="/dashboard/billing?plan=monthly" className="block">
                                <Button className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600">
                                    <Crown className="h-4 w-4 mr-2" />
                                    {planData?.has_used_trial ? "Upgrade to Pro" : "Start Free Trial"}
                                </Button>
                            </Link>
                        )}
                    </div>
                </SettingsSection>

                {/* Danger Zone Section */}
                <SettingsSection
                    title="Danger Zone"
                    description="Irreversible actions that affect your account"
                    icon={AlertTriangle}
                    danger
                >
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 rounded-lg border border-red-500/20 bg-red-500/5">
                            <div>
                                <p className="text-sm font-medium text-white">Delete Account Permanently</p>
                                <p className="text-xs text-muted-foreground">
                                    This will delete all your data, cancel your subscription, and remove your account forever.
                                </p>
                            </div>
                            <Button
                                variant="destructive"
                                onClick={() => setDeleteAccountDialogOpen(true)}
                                className="shrink-0"
                            >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete Account
                            </Button>
                        </div>
                    </div>
                </SettingsSection>
            </div>

            {/* Disconnect Email Dialog */}
            <AlertDialog open={disconnectDialogOpen} onOpenChange={setDisconnectDialogOpen}>
                <AlertDialogContent className="bg-[#0f0f0f] border border-white/10">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                            <Unplug className="h-5 w-5 text-amber-400" />
                            Disconnect {accountToDisconnect?.email}?
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-muted-foreground">
                            This will stop scanning this email account. Your existing data will be kept. 
                            You can reconnect anytime.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => {
                                if (accountToDisconnect) {
                                    disconnectMutation.mutate({
                                        id: accountToDisconnect.id,
                                        type: accountToDisconnect.type,
                                    });
                                }
                            }}
                            className="bg-amber-500 hover:bg-amber-600"
                            disabled={disconnectMutation.isPending}
                        >
                            {disconnectMutation.isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                "Disconnect"
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Delete All Data Dialog */}
            <AlertDialog open={deleteDataDialogOpen} onOpenChange={setDeleteDataDialogOpen}>
                <AlertDialogContent className="bg-[#0f0f0f] border border-white/10">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2 text-red-400">
                            <Trash2 className="h-5 w-5" />
                            Delete All Scanned Data?
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-muted-foreground">
                            This will permanently delete all gift cards, subscriptions, newsletters, and 
                            accounts we&apos;ve found. Your account and subscription will be kept.
                            <br /><br />
                            <span className="text-red-400 font-medium">This action cannot be undone.</span>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="py-4">
                        <label className="text-sm text-muted-foreground mb-2 block">
                            Type <span className="font-mono text-white">DELETE</span> to confirm:
                        </label>
                        <Input
                            id="delete-data-confirm"
                            value={deleteConfirmText}
                            onChange={setDeleteConfirmText}
                            placeholder="DELETE"
                            className="bg-black/40 border-white/10"
                        />
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setDeleteConfirmText("")}>
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => deleteDataMutation.mutate()}
                            className="bg-red-500 hover:bg-red-600"
                            disabled={deleteConfirmText !== "DELETE" || deleteDataMutation.isPending}
                        >
                            {deleteDataMutation.isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                "Delete All Data"
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Delete Account Dialog */}
            <AlertDialog open={deleteAccountDialogOpen} onOpenChange={setDeleteAccountDialogOpen}>
                <AlertDialogContent className="bg-[#0f0f0f] border border-red-500/30">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2 text-red-400">
                            <AlertTriangle className="h-5 w-5" />
                            Delete Account Permanently?
                        </AlertDialogTitle>
                        <AlertDialogDescription asChild>
                            <div className="text-muted-foreground space-y-3">
                                <p>This will:</p>
                                <ul className="list-disc list-inside space-y-1 text-sm">
                                    <li>Delete all your scanned data</li>
                                    <li>Cancel your Pro subscription (if active)</li>
                                    <li>Revoke Gmail/Outlook access</li>
                                    <li>Delete your account permanently</li>
                                </ul>
                                <p className="text-red-400 font-medium">
                                    This action cannot be undone.
                                </p>
                            </div>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="py-4">
                        <label className="text-sm text-muted-foreground mb-2 block">
                            Type your email <span className="font-mono text-white">{userEmail}</span> to confirm:
                        </label>
                        <Input
                        id="delete-email-confirm"
                            value={deleteEmailConfirm}
                            onChange={setDeleteEmailConfirm}
                            placeholder={userEmail}
                            className="bg-black/40 border-white/10"
                        />
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setDeleteEmailConfirm("")}>
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => deleteAccountMutation.mutate()}
                            className="bg-red-500 hover:bg-red-600"
                            disabled={deleteEmailConfirm !== userEmail || deleteAccountMutation.isPending}
                        >
                            {deleteAccountMutation.isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                "Delete Account Forever"
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Connect Account Modal */}
            <ConnectAccountModal 
                open={connectAccountModalOpen} 
                onOpenChangeAction={setConnectAccountModalOpen} 
            />
        </main>
    );
}
