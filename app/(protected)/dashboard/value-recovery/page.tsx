
"use client";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { useQuery } from "@tanstack/react-query";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Copy, ExternalLink, CheckCircle2, RefreshCw, Filter, Download, AlertTriangle, ShieldCheck, ShieldAlert, ShieldQuestion } from "lucide-react";
import type { ValueRecoveryQueryResult, FoundValue, RiskLevel } from "@/queryTypes";
import DeepAuditBanner from "./_components/deep-audit-banner";

// Risk level configuration
const RISK_CONFIG: Record<RiskLevel, { color: string; bgColor: string; borderColor: string; icon: typeof ShieldCheck; label: string }> = {
  safe: { color: "text-emerald-400", bgColor: "bg-emerald-500/10", borderColor: "border-emerald-500/30", icon: ShieldCheck, label: "Verified Safe" },
  caution: { color: "text-amber-400", bgColor: "bg-amber-500/10", borderColor: "border-amber-500/30", icon: AlertTriangle, label: "Use Caution" },
  high_risk: { color: "text-red-400", bgColor: "bg-red-500/10", borderColor: "border-red-500/30", icon: ShieldAlert, label: "High Risk" },
  unknown: { color: "text-white/40", bgColor: "bg-white/5", borderColor: "border-white/10", icon: ShieldQuestion, label: "Unverified" },
};

const TABS = [
  { key: "all", label: "All" },
  { key: "gift_card", label: "Gift Cards" },
  { key: "coupon", label: "Coupons" },
  { key: "rewards", label: "Rewards" },
  { key: "refund", label: "Refunds" },
];
const SORTS = [
  { key: "value", label: "Highest value" },
  { key: "expiry", label: "Expiring soon" },
  { key: "recent", label: "Recent" },
];

function formatCurrency(amount: number) {
  return amount.toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

export default function ValueRecoveryPage() {
  const [tab, setTab] = useState("all");
  const [sort, setSort] = useState("value");
  const [status, setStatus] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [modalValue, setModalValue] = useState<FoundValue | null>(null);

  // Fetch value-recovery data with useQuery
  const {
    data,
    isLoading: loading,
    error,
    // refetch,
  } = useQuery<ValueRecoveryQueryResult, Error>({
    queryKey: ["value-recovery", tab, sort, status],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (tab !== "all") params.set("type", tab);
      if (sort) params.set("sort", sort);
      if (status) params.set("status", status);
      const res = await fetch(`/api/dashboard/value-recovery?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to load value recovery data.");
      return res.json();
    },
  });

  const queryClient = useQueryClient();

  // Plan query for trial eligibility
  const { data: planData } = useQuery<{ current_plan: string; has_used_trial: boolean }>({
    queryKey: ["plan"],
    queryFn: async () => {
      const res = await fetch("/api/plan");
      if (!res.ok) throw new Error("Failed to fetch plan");
      return res.json();
    },
  });

  // Bulk select
  const toggleSelect = (id: string) => setSelected(sel => sel.includes(id) ? sel.filter(x => x !== id) : [...sel, id]);
  const selectAll = () => setSelected(data?.values?.map((v: FoundValue) => v.id) || []);
  const clearSelected = () => setSelected([]);

  // Bulk recovery mutation
  const bulkRecoveryMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      const res = await fetch('/api/dashboard/value-recovery', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids, action: 'recover' })
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to mark items as recovered');
      }
      
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["value-recovery"] });
      setSelected([]);
    },
    onError: (error: Error) => {
      console.error('Error marking items as recovered:', error);
      alert('Failed to mark items as recovered. Please try again.');
    }
  });

  // Individual recovery mutation
  const individualRecoveryMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch('/api/dashboard/value-recovery', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: [id], action: 'recover' })
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to mark item as recovered');
      }
      
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["value-recovery"] });
      setModalValue(null);
    },
    onError: (error: Error) => {
      console.error('Error marking item as recovered:', error);
      alert('Failed to mark item as recovered. Please try again.');
    }
  });

  // Bulk mark as recovered
  const markAllRecovered = () => {
    if (!selected.length) return;
    bulkRecoveryMutation.mutate(selected);
  };

  // Individual mark as recovered
  const markAsRecovered = (id: string) => {
    individualRecoveryMutation.mutate(id);
  };

  // Export (mock)
  const exportList = (type: "csv" | "pdf") => {
    // TODO: Implement export
    alert(`Exporting as ${type.toUpperCase()}`);
  };

  // UI helpers
  const isPro = data?.plan === "pro";
  const previewOnly = data?.previewOnly;
  const previewCount = data?.previewCount || 0;
  const total = data?.totalValue || 0;
  const recovered = data?.recoveredCount || 0;
  const count = data?.totalCount || 0;
  const progress = count ? Math.round((recovered / count) * 100) : 0;
  const allSelected = selected.length === (data?.values?.length || 0) && selected.length > 0;


  // Only show a simple empty state inside the grid if there are no values

  return (

    <main className="min-h-screen bg-[#050505] p-4 md:p-10">
      <div className="container mx-auto max-w-5xl">
      
      {/* Deep Audit upgrade banner for free users */}
      <DeepAuditBanner />
      
      <div className="relative mx-auto max-w-4xl rounded-xl border border-white/10 bg-black/40 p-1 backdrop-blur-xl shadow-2xl mb-10 overflow-hidden">
        <div className="absolute -inset-1 rounded-xl bg-gradient-to-r from-emerald-500/20 via-blue-500/20 to-purple-500/20 blur opacity-50" />
        <div className="relative rounded-lg bg-[#0A0A0A] p-6 sm:p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-8">
          <div>
            <div className="text-[10px] uppercase tracking-widest text-white/50 mb-4 font-semibold">Potential Value</div>
            <div className="text-4xl font-light text-white flex items-baseline gap-3">
              <span className="text-emerald-400">
                {loading ? <Skeleton className="h-10 w-32" /> : (
                  previewOnly ? <span className="blur-sm select-none">$•,•••</span> : formatCurrency(total)
                )}
              </span>
              <span className="text-lg font-light text-white/40">recoverable</span>
            </div>
          </div>
          <div className="flex flex-col gap-3 min-w-[240px]">
             <div className="flex items-center justify-between text-xs text-white/50 uppercase tracking-wider font-semibold">
                <span>Recovery Status</span>
                <span className="text-emerald-400">{progress}%</span>
             </div>
            <Progress value={progress} className="h-2 bg-white/10"  />
            <div className="flex items-center gap-2 text-sm text-white/60">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              {loading ? <Skeleton className="h-4 w-20" /> : <span className="text-xs font-mono">{recovered} / {count} items processed</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Filters and sort */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8 px-4 sm:px-6 py-4 rounded-xl bg-white/2 border border-white/5">
        <div className="w-full lg:w-auto overflow-x-auto pb-2 lg:pb-0 scrollbar-hide">
          <Tabs value={tab} onValueChange={setTab} className="w-full">
            <TabsList className="bg-black/40 border border-white/5 w-full justify-start md:justify-center lg:justify-start min-w-max">
              {TABS.map(t => (
                <TabsTrigger 
                  key={t.key} 
                  value={t.key} 
                  className="data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-300 min-w-[80px]"
                >
                  {t.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 text-white/70 hover:text-white hover:bg-white/10">
                  <Filter className="mr-2 h-3.5 w-3.5" />
                  {SORTS.find(s => s.key === sort)?.label}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-[#1a1d21] border-white/10 text-white">
                {SORTS.map(s => <DropdownMenuItem key={s.key} onClick={() => setSort(s.key)} className="focus:bg-white/10 cursor-pointer">{s.label}</DropdownMenuItem>)}
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="h-4 w-px bg-white/10 mx-1" />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 text-white/70 hover:text-white hover:bg-white/10">
                  <RefreshCw className="mr-2 h-3.5 w-3.5" />
                  {status ? status.charAt(0).toUpperCase() + status.slice(1) : "All"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-[#1a1d21] border-white/10 text-white">
                <DropdownMenuItem onClick={() => setStatus("")} className="focus:bg-white/10 cursor-pointer">All</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatus("active")} className="focus:bg-white/10 cursor-pointer">Active</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatus("recovered")} className="focus:bg-white/10 cursor-pointer">Recovered</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatus("expired")} className="focus:bg-white/10 cursor-pointer">Expired</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatus("ignored")} className="focus:bg-white/10 cursor-pointer">Ignored</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="h-8 text-white/70 hover:text-white hover:bg-white/10" onClick={allSelected ? clearSelected : selectAll} disabled={previewOnly}>
              <Checkbox checked={allSelected} className="mr-2 border-white/30 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500" /> {allSelected ? "Clear" : "All"}
            </Button>
            
            <Button 
              variant="outline" 
              size="sm" 
              className="h-8 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/10 hover:text-emerald-200" 
              disabled={!selected.length || bulkRecoveryMutation.isPending || previewOnly} 
              onClick={markAllRecovered}
            >
              <span className="hidden sm:inline">
                {previewOnly ? "Upgrade to Recover" : bulkRecoveryMutation.isPending ? "Processing..." : "Recover Selected"}
              </span>
              <span className="sm:hidden">
                {previewOnly ? "Upgrade" : bulkRecoveryMutation.isPending ? "..." : "Recover"}
              </span>
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-white/50 hover:text-white hover:bg-white/10" disabled={previewOnly}>
                  <Download className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-[#1a1d21] border-white/10 text-white">
                <DropdownMenuItem onClick={() => exportList("csv")} className="focus:bg-white/10 cursor-pointer">Export CSV</DropdownMenuItem>
                <DropdownMenuItem onClick={() => exportList("pdf")} className="focus:bg-white/10 cursor-pointer">Export PDF</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && <Alert variant="destructive" className="mb-4 bg-red-900/20 border-red-900/50 text-red-200"><AlertTitle>Error</AlertTitle><AlertDescription>{typeof error === 'string' ? error : error?.message}</AlertDescription></Alert>}

      {/* Value cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-40 w-full rounded-2xl bg-white/5" />)
        ) : data?.values && data.values.length > 0 ? (
          data.values.map((item: FoundValue) => (
            <div key={item.id} className="group relative rounded-2xl border border-white/5 bg-white/2 p-6 transition duration-300 hover:bg-white/5 hover:border-white/10 cursor-pointer" onClick={() => setModalValue(item)}>
              <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                 <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full bg-white/10 text-white hover:bg-white/20"><ExternalLink className="h-4 w-4" /></Button>
              </div>
              
              <div className="flex items-start gap-5">
                <div className="pt-1" onClick={e => e.stopPropagation()}>
                    <Checkbox checked={selected.includes(item.id)} onCheckedChange={() => toggleSelect(item.id)} className="h-5 w-5 border-white/20 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500 rounded-md" />
                </div>
                
                <div className="h-12 w-12 rounded-xl bg-white/5 p-2 border border-white/10 flex items-center justify-center">
                    {item.logo_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            src={item.logo_url}
                            alt="logo"
                            className="h-full w-full object-contain opacity-80 group-hover:opacity-100 transition-opacity"
                            onError={e => {
                                (e.currentTarget as HTMLImageElement).style.display = "none";
                            }}
                        />
                    ) : (
                        <span className="text-2xl font-bold text-white/70">
                            {item.service_name?.charAt(0).toUpperCase() || "?"}
                        </span>
                    )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-semibold text-white text-lg truncate pr-8">{item.service_name || "Unknown"}</h3>
                  </div>
                  
                  <div className="flex items-center gap-2 mb-4 flex-wrap">
                     <Badge variant="secondary" className="bg-white/5 hover:bg-white/10 text-white/60 border border-white/5 font-mono text-[10px] tracking-wider uppercase">{item.type.replace("_", " ")}</Badge>
                     <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${
                        item.status === 'active' ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10' : 
                        item.status === 'expired' ? 'border-red-500/30 text-red-500 bg-red-400/10' : 
                        'border-blue-500/30 text-blue-400 bg-blue-500/10'
                     }`}>
                        {(item.status ?? "unknown").toUpperCase()}
                     </span>
                     {/* Risk Level Badge */}
                     {(() => {
                        const riskLevel = (item.risk_level || "unknown") as RiskLevel;
                        const config = RISK_CONFIG[riskLevel];
                        const RiskIcon = config.icon;
                        return (
                          <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full border ${config.borderColor} ${config.color} ${config.bgColor}`}>
                            <RiskIcon className="h-3 w-3" />
                            {config.label}
                          </span>
                        );
                     })()}
                  </div>

                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-light text-white group-hover:text-emerald-300 transition-colors">{formatCurrency(Number(item.amount) || 0)}</span>
                  </div>
                   <div className="text-xs text-white/40 mt-2 font-mono">Found {item.detected_at && new Date(item.detected_at).toLocaleDateString()}</div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center text-white/60 py-12">No value found.</div>
        )}
        
        {/* Free tier teaser */}
        {previewOnly && count > previewCount && (
          <div className="col-span-full mt-2 rounded-2xl border border-amber-500/30 bg-gradient-to-b from-amber-500/10 via-orange-500/5 to-transparent p-8 text-center relative overflow-hidden">
            <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-amber-500/10 blur-3xl" />
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 mb-4 px-3 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/30">
                <span className="text-xs font-semibold uppercase tracking-widest text-amber-400">
                  🔒 More Hidden In Your History
                </span>
              </div>
              <h3 className="text-xl text-white font-semibold mb-3">
                Your Quick Scan found <span className="text-amber-400">{count} items</span> from the last 2 years
              </h3>
              <p className="text-white/60 mb-2 max-w-md mx-auto">
                You&apos;re only seeing <span className="text-white font-medium">{previewCount}</span> of them. 
                Our <span className="text-amber-300 font-medium">Deep Audit</span> goes back <span className="text-amber-300 font-medium">5 years</span> and typically finds 3× more value.
              </p>
              <p className="text-white/40 text-sm mb-6">
                Unlock gift cards, coupons, rewards points, and refunds hiding deeper in your inbox.
              </p>
              <a href="/dashboard/billing?plan=monthly" className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 px-6 py-3 text-sm font-semibold text-black transition shadow-lg shadow-amber-500/20">
                <span>{planData?.has_used_trial ? "Upgrade to Pro" : "Start Free Trial"}</span>
                <span>→</span>
              </a>
            </div>
          </div>
        )}
        {/* Modal for value details */}
        <Dialog open={!!modalValue} onOpenChange={open => !open && setModalValue(null)}>
          <DialogContent className="max-w-xl p-0 bg-[#0A0A0A] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
             
             {modalValue && (
             <>
              <div className="p-6 pb-0">
                  <DialogHeader>
                    <div className="flex items-start justify-between gap-4 mb-4">
                        <div className="flex items-start gap-4">
                            <div className="h-14 w-14 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center p-2">
                              {modalValue.logo_url ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={modalValue.logo_url} alt="logo" className="h-full w-full object-contain" />
                              ) : (
                                <span className="text-3xl font-bold text-white/70">
                                  {modalValue.service_name?.charAt(0).toUpperCase() || "?"}
                                </span>
                              )}
                            </div>
                            <div>
                                <DialogTitle className="text-xl font-semibold text-white tracking-tight mb-1">{modalValue.service_name}</DialogTitle>
                                <div className="flex items-center gap-2 flex-wrap">
                                     <Badge variant="outline" className="text-[10px] uppercase tracking-wider bg-white/5 border-white/10 text-white/50">{modalValue.type.replace("_", " ")}</Badge>
                                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                                        modalValue.status === 'active' ? 'text-emerald-400 bg-emerald-400/10' : 
                                        modalValue.status === 'expired' ? 'text-red-400 bg-red-400/10' : 
                                        'text-blue-400 bg-blue-400/10'
                                    }`}>
                                        {(modalValue.status ?? "unknown").toUpperCase()}
                                    </span>
                                    {/* Risk Level Badge in Modal */}
                                    {(() => {
                                      const riskLevel = (modalValue.risk_level || "unknown") as RiskLevel;
                                      const config = RISK_CONFIG[riskLevel];
                                      const RiskIcon = config.icon;
                                      return (
                                        <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full border ${config.borderColor} ${config.color} ${config.bgColor}`}>
                                          <RiskIcon className="h-3 w-3" />
                                          {config.label}
                                        </span>
                                      );
                                    })()}
                                </div>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-3xl font-light text-white">{formatCurrency(Number(modalValue.amount) || 0)}</div>
                            <div className="text-xs text-white/40 font-mono">ESTIMATED VALUE</div>
                        </div>
                    </div>
                  </DialogHeader>
              </div>

              {/* Risk Warning Alert */}
              {(modalValue.risk_level === "high_risk" || modalValue.risk_level === "caution") && (
                <div className={`mx-6 p-4 rounded-xl border ${
                  modalValue.risk_level === "high_risk" 
                    ? "bg-red-500/10 border-red-500/30" 
                    : "bg-amber-500/10 border-amber-500/30"
                }`}>
                  <div className="flex items-start gap-3">
                    {modalValue.risk_level === "high_risk" ? (
                      <ShieldAlert className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                    ) : (
                      <AlertTriangle className="h-5 w-5 text-amber-400 flex-shrink-0 mt-0.5" />
                    )}
                    <div>
                      <h4 className={`text-sm font-semibold mb-1 ${
                        modalValue.risk_level === "high_risk" ? "text-red-400" : "text-amber-400"
                      }`}>
                        {modalValue.risk_level === "high_risk" 
                          ? "⚠️ High Risk - Do Not Use" 
                          : "⚠️ Proceed with Caution"}
                      </h4>
                      <p className="text-sm text-white/70">
                        {modalValue.warning_message || (
                          modalValue.risk_level === "high_risk"
                            ? "This value has been flagged as potentially harmful. It may be fraudulent, phishing-related, or from an untrusted source. We strongly recommend not using this code or link."
                            : "This value has not been fully verified. Please verify the source before redeeming. Check that the sender email matches the official service."
                        )}
                      </p>
                      {modalValue.risk_level === "high_risk" && (
                        <div className="mt-3 p-2 bg-red-500/10 rounded-lg border border-red-500/20">
                          <p className="text-xs text-red-300">
                            <strong>Safety Tips:</strong> Do not click links from unknown senders. Never share personal information. Report suspicious emails to the service provider.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="px-6 py-6 space-y-8">
                 {/* Email Info Section */}
                 <div>
                     <div className="grid grid-cols-[80px_1fr] gap-x-4 gap-y-2 items-center text-sm">
                        <span className="text-white/40 font-medium text-xs uppercase tracking-wide">Subject</span>
                        <div className="text-white/90 truncate min-w-0">{modalValue.email_subject || "No subject"}</div>
                        
                        <span className="text-white/40 font-medium text-xs uppercase tracking-wide">Sender</span>
                        <div className="text-white/90 truncate min-w-0">{modalValue.email_from || "Unknown"}</div>

                         <span className="text-white/40 font-medium text-xs uppercase tracking-wide">Date</span>
                         <span className="text-white/90">{modalValue.email_date || "-"}</span>
                     </div>
                 </div>

                 {/* Snippet / Data */}
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <div className="space-y-4">
                        <h4 className="text-xs uppercase tracking-widest text-white/40 font-semibold">Secure Data</h4>
                        
                        {/* High-risk items: block access to codes */}
                        {modalValue.risk_level === "high_risk" ? (
                          <div className="p-4 rounded-lg bg-red-500/5 border border-red-500/20">
                            <div className="flex items-center gap-2 text-red-400 mb-2">
                              <ShieldAlert className="h-4 w-4" />
                              <span className="text-sm font-medium">Access Blocked</span>
                            </div>
                            <p className="text-xs text-white/50">
                              For your safety, codes and links from high-risk sources are hidden. 
                              If you believe this is a mistake, please verify with the original sender.
                            </p>
                          </div>
                        ) : (
                        <div className="space-y-4">
                           {modalValue.code && (
                              <div>
                                 <div className="text-[10px] text-white/40 uppercase tracking-widest mb-1.5">Code</div>
                                 <div className="flex items-center gap-2 group cursor-pointer" onClick={() => navigator.clipboard.writeText(modalValue.code || "")}>
                                    <span className="font-mono text-lg text-emerald-400 tracking-wide">{modalValue.code}</span>
                                    <Copy className="h-3.5 w-3.5 text-white/20 group-hover:text-emerald-400 transition-colors" />
                                 </div>
                              </div>
                           )}

                           {modalValue.pin && (
                              <div>
                                 <div className="text-[10px] text-white/40 uppercase tracking-widest mb-1.5">PIN</div>
                                 <div className="flex items-center gap-2 group cursor-pointer" onClick={() => navigator.clipboard.writeText(modalValue.pin || "")}>
                                    <span className="font-mono text-lg text-emerald-400 tracking-wide">{modalValue.pin}</span>
                                    <Copy className="h-3.5 w-3.5 text-white/20 group-hover:text-emerald-400 transition-colors" />
                                 </div>
                              </div>
                           )}

                           {modalValue.redemption_url && (
                              <div>
                                 <div className="text-[10px] text-white/40 uppercase tracking-widest mb-1.5">Link</div>
                                 <a href={modalValue.redemption_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors break-all">
                                    Redemption URL <ExternalLink className="h-3 w-3 opacity-50" />
                                 </a>
                              </div>
                           )}

                           {!modalValue.code && !modalValue.pin && !modalValue.redemption_url && (
                              <div className="text-white/30 text-sm italic">No codes extracted.</div>
                           )}
                        </div>
                        )}
                     </div>

                     <div className="space-y-4">
                        <h4 className="text-xs uppercase tracking-widest text-white/40 font-semibold">Context</h4>
                         <div className="text-sm text-white/60 leading-relaxed italic border-l-2 border-white/5 pl-4 py-1">
                            {modalValue.email_body_snippet ? (
                               <>
                                 &quot;{modalValue.email_body_snippet}&quot;
                               </>
                            ) : (
                               <span className="text-white/30">No snippet available.</span>
                            )}
                        </div>
                     </div>
                 </div>
              </div>

                 {/* Timestamps */}
                 <div className="px-6 pb-6">
                    <div className="flex items-center justify-between text-[10px] text-white/30 font-mono pt-4 border-t border-white/5">
                        <div>DETECTED: {new Date(modalValue.detected_at || "").toLocaleString()}</div>
                        <div>ID: {modalValue.id.slice(0, 8)}</div>
                    </div>
                 </div>
              
               <div className="p-6 bg-white/2 border-t border-white/5 flex justify-end gap-3">
                   <DialogClose asChild>
                       <Button variant="ghost" className="text-white/60 hover:text-white hover:bg-white/10">Close</Button>
                   </DialogClose>
                   {modalValue.risk_level === "high_risk" ? (
                     <Button 
                       className="bg-red-600/50 text-white/50 cursor-not-allowed" 
                       disabled
                       title="Cannot mark high-risk items as recovered for your safety"
                     >
                       <ShieldAlert className="h-4 w-4 mr-2" />
                       Blocked for Safety
                     </Button>
                   ) : (
                     <Button className="bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/20" 
                       disabled={individualRecoveryMutation.isPending}
                       onClick={() => modalValue && markAsRecovered(modalValue.id)}>
                         {individualRecoveryMutation.isPending ? "Processing..." : "Mark as Recovered"}
                     </Button>
                   )}
               </div>
               </>
             )}
          </DialogContent>
        </Dialog>
      </div>
      </div>
    </main>
  );
}
