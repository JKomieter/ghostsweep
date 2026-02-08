/* eslint-disable react/no-unescaped-entities */
"use client";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { ExternalLink, CheckCircle2, Filter, Calendar, AlertTriangle, X, Check, Trash2 } from "lucide-react";

type Subscription = {
  id: string;
  user_id: string;
  service_name: string;
  amount: string;
  billing_frequency: string;
  next_billing_date: string | null;
  email_date: string | null;
  status: "active" | "canceled" | "kept";
  detected_at: string | null;
  logo_url: string | null;
  plan_details: string | null;
  email_subject: string | null;
  cancel_url: string | null;
  cancel_instructions: Array<string> | null;
};

type SubscriptionsQueryResult = {
  plan: string;
  blurred: boolean;
  previewOnly: boolean;
  previewCount: number | null;
  monthlyTotal: number | null;
  annualTotal: number | null;
  totalCount: number;
  canceledCount: number;
  keptCount: number;
  subscriptions: Subscription[];
  lifetimeSavings: number | null;
};

const TABS = [
  { key: "active", label: "Active" },
  { key: "canceled", label: "Canceled" },
  { key: "kept", label: "Kept" },
];

const SORTS = [
  { key: "cost", label: "Highest cost" },
  { key: "recent", label: "Most recent" },
  { key: "unused", label: "Least used" },
];

const FILTERS = [
  { key: "all", label: "All" },
  { key: "daily", label: "Daily" },
  { key: "monthly", label: "Monthly" },
  { key: "annual", label: "Yearly" },
];

function formatCurrency(amount: number) {
  return amount.toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 2 });
}

function getMonthlyAmount(amount: string, frequency: string) {
  const num = Number(amount) || 0;
  switch (frequency) {
    case "daily": return num * 30;
    case "weekly": return num * 4.33;
    case "biweekly": return num * 2.17;
    case "monthly": return num;
    case "quarterly": return num / 3;
    case "annual": return num / 12;
    default: return num;
  }
}

function getAnnualAmount(amount: string, frequency: string) {
  return getMonthlyAmount(amount, frequency) * 12;
}

function getDaysSinceLastBill(emailDate: string | null) {
  if (!emailDate) return null;
  const lastBill = new Date(emailDate);
  const now = new Date();
  return Math.floor((now.getTime() - lastBill.getTime()) / (1000 * 60 * 60 * 24));
}

export default function SubscriptionsPage() {
  const [tab, setTab] = useState("active");
  const [sort, setSort] = useState("cost");
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState<string[]>([]);
  const [modalSub, setModalSub] = useState<Subscription | null>(null);
  
  const queryClient = useQueryClient();

  // Fetch subscriptions data
  const {
    data,
    isLoading: loading,
    error,
  } = useQuery<SubscriptionsQueryResult, Error>({
    queryKey: ["subscriptions", tab, sort, filter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (tab !== "active") params.set("status", tab);
      if (sort) params.set("sort", sort);
      if (filter !== "all") params.set("frequency", filter);
      const res = await fetch(`/api/dashboard/subscriptions?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to load subscriptions data.");
      return res.json();
    },
  });

  // Bulk select
  const toggleSelect = (id: string) => setSelected(sel => sel.includes(id) ? sel.filter(x => x !== id) : [...sel, id]);
  const selectAll = () => setSelected(data?.subscriptions?.map((s: Subscription) => s.id) || []);
  const clearSelected = () => setSelected([]);
  const allSelected = selected.length === (data?.subscriptions?.length || 0) && selected.length > 0;

  // Update subscription status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ ids, status }: { ids: string[], status: string }) => {
      const res = await fetch('/api/dashboard/subscriptions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids, status })
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to update subscriptions');
      }
      
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
      setSelected([]);
      setModalSub(null);
    },
    onError: (error: Error) => {
      console.error('Error updating subscriptions:', error);
      alert('Failed to update subscriptions. Please try again.');
    }
  });

  const markAsCanceled = (id: string) => {
    updateStatusMutation.mutate({ ids: [id], status: "canceled" });
  };

  const markAsKept = (id: string) => {
    updateStatusMutation.mutate({ ids: [id], status: "kept" });
  };

  const bulkCancel = () => {
    if (!selected.length) return;
    if (confirm(`Are you sure you want to open cancellation pages for ${selected.length} subscription(s)?`)) {
      // Open cancel pages in new tabs
      const subscriptions = data?.subscriptions?.filter(s => selected.includes(s.id)) || [];
      subscriptions.forEach(sub => {
        if (sub.cancel_url) {
          window.open(sub.cancel_url, '_blank');
        }
      });
    }
  };

  // UI helpers
  const isPro = data?.plan === "pro";
  const blurred = data?.blurred;
  const previewOnly = data?.previewOnly;
  const monthlyTotal = data?.monthlyTotal || 0;
  const annualTotal = data?.annualTotal || 0;
  const totalCount = data?.totalCount || 0;
  const canceledCount = data?.canceledCount || 0;
  const keptCount = data?.keptCount || 0;
  const lifetimeSavings = data?.lifetimeSavings || 0;
  const previewCount = data?.previewCount || 0;
  
  const selectedSavings = selected.reduce((sum, id) => {
    const sub = data?.subscriptions?.find(s => s.id === id);
    return sum + (sub ? getAnnualAmount(sub.amount, sub.billing_frequency) : 0);
  }, 0);

  const getTabCount = (tabKey: string) => {
    switch (tabKey) {
      case "active": return totalCount;
      case "canceled": return canceledCount;
      case "kept": return keptCount;
      default: return 0;
    }
  };

  return (
    <main className="min-h-screen bg-[#050505] p-4 md:p-10">
      <div className="container mx-auto max-w-6xl">
        
        {/* Stats Header */}
        <div className="relative mx-auto max-w-5xl rounded-xl border border-white/10 bg-black/40 p-1 backdrop-blur-xl shadow-2xl mb-10 overflow-hidden">
          <div className="absolute -inset-1 rounded-xl bg-gradient-to-r from-red-500/20 via-orange-500/20 to-yellow-500/20 blur opacity-50" />
          <div className="relative rounded-lg bg-[#0A0A0A] p-6 sm:p-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="md:col-span-2">
                <div className="text-[10px] uppercase tracking-widest text-white/50 mb-4 font-semibold">Monthly Spending</div>
                <div className="text-4xl font-light text-red-400 mb-2">
                  {loading ? <Skeleton className="h-10 w-32" /> : (
                    previewOnly ? (
                      <span className="blur-sm select-none">$•••.••</span>
                    ) : formatCurrency(monthlyTotal)
                  )}
                </div>
                <div className="text-lg text-white/60">
                  {previewOnly ? <span className="blur-sm select-none">$•,•••</span> : formatCurrency(annualTotal)}/year
                </div>
                <div className="text-sm text-white/40 mt-2">
                  {loading ? <Skeleton className="h-4 w-20" /> : `${totalCount} active subscriptions`}
                </div>
              </div>
              
              <div>
                <div className="text-[10px] uppercase tracking-widest text-white/50 mb-4 font-semibold">Potential Savings</div>
                <div className="text-2xl font-light text-emerald-400">
                  {previewOnly ? <span className="blur-sm select-none">$•,•••</span> : formatCurrency(annualTotal)}
                </div>
                <div className="text-xs text-white/40 mt-1">if cancel all</div>
              </div>
              
              <div>
                <div className="text-[10px] uppercase tracking-widest text-white/50 mb-4 font-semibold">Lifetime Saved</div>
                <div className="text-2xl font-light text-emerald-400">
                  {previewOnly ? <span className="blur-sm select-none">$•,•••</span> : formatCurrency(lifetimeSavings)}
                </div>
                <div className="text-xs text-white/40 mt-1">from cancellations</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs and Controls */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
          <div className="w-full lg:w-auto overflow-x-auto pb-2 lg:pb-0 scrollbar-hide">
            <Tabs value={tab} onValueChange={setTab} className="w-full">
              <TabsList className="bg-black/40 border border-white/5 w-full justify-start md:justify-center lg:justify-start min-w-max">
                {TABS.map(t => (
                  <TabsTrigger key={t.key} value={t.key} className="data-[state=active]:bg-red-500/20 data-[state=active]:text-red-300 min-w-[100px]">
                    {t.label} ({getTabCount(t.key)})
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 text-white/70 hover:text-white hover:bg-white/10">
                  <Filter className="mr-2 h-3.5 w-3.5" />{SORTS.find(s => s.key === sort)?.label}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-[#1a1d21] border-white/10 text-white">
                {SORTS.map(s => (
                  <DropdownMenuItem key={s.key} onClick={() => setSort(s.key)} className="focus:bg-white/10 cursor-pointer">
                    {s.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 text-white/70 hover:text-white hover:bg-white/10">
                  <Calendar className="mr-2 h-3.5 w-3.5" />{FILTERS.find(f => f.key === filter)?.label}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-[#1a1d21] border-white/10 text-white">
                {FILTERS.map(f => (
                  <DropdownMenuItem key={f.key} onClick={() => setFilter(f.key)} className="focus:bg-white/10 cursor-pointer">
                    {f.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Bulk Actions */}
        {tab === "active" && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 px-6 py-4 rounded-xl bg-white/2 border border-white/5">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <Button variant="ghost" size="sm" className="h-8 text-white/70 hover:text-white hover:bg-white/10 w-fit" onClick={allSelected ? clearSelected : selectAll}>
                <Checkbox checked={allSelected} className="mr-2 border-white/30 data-[state=checked]:bg-red-500 data-[state=checked]:border-red-500" /> 
                {allSelected ? "Clear" : "Select All"}
              </Button>
              
              {selected.length > 0 && (
                <div className="text-sm text-white/60">
                  Canceling {selected.length} subscription(s) will save <span className="text-emerald-400 font-medium">{formatCurrency(selectedSavings)}/year</span>
                </div>
              )}
            </div>
            
            {selected.length > 0 && (
              <Button variant="outline" size="sm" className="h-8 border-red-500/30 text-red-300 hover:bg-red-500/10 hover:text-red-200 whitespace-nowrap w-fit" onClick={bulkCancel}>
                Open {selected.length} Cancel Page{selected.length > 1 ? 's' : ''}
              </Button>
            )}
          </div>
        )}

        {/* Error */}
        {error && (
          <Alert variant="destructive" className="mb-4 bg-red-900/20 border-red-900/50 text-red-200">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{typeof error === 'string' ? error : error?.message}</AlertDescription>
          </Alert>
        )}

        {/* Subscription Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-48 w-full rounded-2xl bg-white/5" />)
          ) : data?.subscriptions && data.subscriptions.length > 0 ? (
            data.subscriptions.map((sub: Subscription) => {
              const monthlyAmount = getMonthlyAmount(sub.amount, sub.billing_frequency);
              const annualAmount = getAnnualAmount(sub.amount, sub.billing_frequency);
              const daysSinceLastBill = getDaysSinceLastBill(sub.email_date);
              const isUnused = daysSinceLastBill && daysSinceLastBill > 30;
              const isHighValue = annualAmount > 500;
              
              return (
                <div key={sub.id} className="group relative rounded-2xl border border-white/5 bg-white/2 p-4 sm:p-6 transition duration-300 hover:bg-white/5 hover:border-white/10">
                  <div className="flex items-start gap-4">
                    {tab === "active" && (
                      <div className="pt-1.5 shrink-0">
                        <Checkbox 
                          checked={selected.includes(sub.id)} 
                          onCheckedChange={() => toggleSelect(sub.id)} 
                          className="h-5 w-5 border-white/20 data-[state=checked]:bg-red-500 data-[state=checked]:border-red-500 rounded-md" 
                        />
                      </div>
                    )}
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row gap-5">
                        <div className="h-12 w-12 shrink-0 rounded-xl bg-white/5 p-2 border border-white/10 flex items-center justify-center">
                          {sub.logo_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={sub.logo_url} alt={sub.service_name} className="h-full w-full object-contain" />
                          ) : (
                            <div className="text-white/40 text-xs font-mono">{sub.service_name.slice(0, 2).toUpperCase()}</div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                            <div className="min-w-0">
                              <h3 className="font-semibold text-white text-lg truncate">
                                {blurred && !isPro ? "██████" : sub.service_name}
                              </h3>
                              {sub.plan_details && (
                                <p className="text-sm text-white/50 mt-0.5 truncate">
                                  {blurred && !isPro ? "████" : sub.plan_details}
                                </p>
                              )}
                              <div className="flex flex-wrap items-center gap-2 mt-1">
                                <Badge variant="outline" className={`text-[10px] uppercase tracking-wider border-white/10 text-white/50 ${
                                  sub.status === 'canceled' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                                  sub.status === 'kept' ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' :
                                  'bg-red-500/10 border-red-500/20 text-red-400'
                                }`}>
                                  {sub.status === 'canceled' ? 'Canceled' : sub.status === 'kept' ? 'Kept' : 'Active'}
                                </Badge>
                                
                                {sub.billing_frequency && (
                                  <span className="text-xs text-white/40 capitalize">{sub.billing_frequency}</span>
                                )}
                              </div>
                            </div>
                            
                            <div className="sm:text-right shrink-0">
                              <div className="text-2xl font-light text-red-400">
                                {blurred && !isPro ? "$██" : formatCurrency(monthlyAmount)}
                              </div>
                              <div className="text-xs text-white/40">per month</div>
                            </div>
                          </div>
                          
                          <div className="text-sm text-white/60 mb-4 space-y-0.5">
                            <div className="flex justify-between sm:block">
                              <span className="sm:inline">Annual cost: </span>
                              <span className="text-red-300 font-medium">{blurred && !isPro ? "$███" : formatCurrency(annualAmount)}</span>
                            </div>
                            {sub.next_billing_date && (
                              <div className="flex justify-between sm:block">
                                <span className="sm:inline">Next bill: </span>
                                <span>{new Date(sub.next_billing_date).toLocaleDateString()}</span>
                              </div>
                            )}
                            {sub.email_date && (
                              <div className="flex justify-between sm:block">
                                <span className="sm:inline">Last charged: </span>
                                <span>{new Date(sub.email_date).toLocaleDateString()}</span>
                              </div>
                            )}
                          </div>
                          
                          {/* Warning badges */}
                          <div className="flex flex-wrap gap-2 mb-4">
                            {isHighValue && (
                              <div className="flex items-center gap-1 text-[10px] sm:text-xs text-orange-400 bg-orange-500/10 px-2 py-1 rounded-full border border-orange-500/20">
                                <AlertTriangle className="h-3 w-3" />
                                <span className="truncate">High value: {formatCurrency(annualAmount)}/y</span>
                              </div>
                            )}
                            {isUnused && (
                              <div className="flex items-center gap-1 text-[10px] sm:text-xs text-yellow-400 bg-yellow-500/10 px-2 py-1 rounded-full border border-yellow-500/20">
                                <AlertTriangle className="h-3 w-3" />
                                Unused: {daysSinceLastBill}d
                              </div>
                            )}
                          </div>
                          
                          {/* Actions */}
                          {tab === "active" && (
                            <div className="flex flex-wrap gap-2">
                              <Button 
                                size="sm" 
                                className="bg-red-600 hover:bg-red-500 text-white text-[10px] sm:text-xs h-8"
                                onClick={() => sub.cancel_url && window.open(sub.cancel_url, '_blank')}
                                disabled={blurred && !isPro || !sub.cancel_url}
                              >
                                <ExternalLink className="h-3 w-3 mr-1" />
                                Cancel
                              </Button>
                              
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="border-white/20 text-white/70 hover:bg-white/10 text-[10px] sm:text-xs h-8"
                                onClick={() => setModalSub(sub)}
                                disabled={blurred && !isPro}
                              >
                                Steps
                              </Button>
                              
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="text-emerald-400 hover:bg-emerald-500/10 text-[10px] sm:text-xs h-8"
                                onClick={() => markAsCanceled(sub.id)}
                                disabled={updateStatusMutation.isPending || (blurred && !isPro)}
                              >
                                <Check className="h-3 w-3 mr-1" />
                                {updateStatusMutation.isPending ? "..." : "Mark Canceled"}
                              </Button>
                              
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="text-blue-400 hover:bg-blue-500/10 text-[10px] sm:text-xs h-8"
                                onClick={() => markAsKept(sub.id)}
                                disabled={updateStatusMutation.isPending || (blurred && !isPro)}
                              >
                                Keep
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-full text-center text-white/60 py-12">
              {tab === "active" ? (
                <>🎉 No active subscriptions found!</>
              ) : tab === "canceled" ? (
                "No canceled subscriptions yet"
              ) : (
                "No subscriptions marked as kept"
              )}
            </div>
          )}
        </div>
        
        {/* Free tier overlay */}
        {previewOnly && data?.subscriptions && data.subscriptions.length > 0 && (
          <div className="mt-8 rounded-2xl border border-red-500/30 bg-gradient-to-b from-red-500/10 to-transparent p-8 text-center">
            <div className="text-5xl mb-4">💸</div>
            <h3 className="text-xl text-white font-semibold mb-3">You&apos;re Leaking Money</h3>
            <p className="text-white/60 mb-2 max-w-md mx-auto">
              You have <span className="text-red-400 font-bold">{totalCount} subscriptions</span> silently draining your bank account.
              We&apos;re only showing {previewCount} of them.
            </p>
            <p className="text-white/40 text-sm mb-6">
              Upgrade to see the full list, view costs, and cancel them with one click.
            </p>
            <a href="/dashboard/billing" className="inline-flex items-center justify-center rounded-lg bg-red-500 hover:bg-red-400 px-6 py-3 text-sm font-semibold text-white transition">
              Stop the Bleeding →
            </a>
          </div>
        )}

        {/* Instructions Modal */}
        <Dialog open={!!modalSub} onOpenChange={open => !open && setModalSub(null)}>
          <DialogContent className="max-w-lg p-0 bg-[#0A0A0A] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
            {modalSub && (
              <>
                <div className="p-6">
                  <DialogHeader>
                    <div className="flex items-center gap-4 mb-4">
                      <div className="h-12 w-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center p-2">
                        {modalSub.logo_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={modalSub.logo_url} alt={modalSub.service_name} className="h-full w-full object-contain" />
                        ) : (
                          <div className="text-white/40 text-xs font-mono">{modalSub.service_name.slice(0, 2).toUpperCase()}</div>
                        )}
                      </div>
                      <div>
                        <DialogTitle className="text-xl font-semibold text-white">{modalSub.service_name}</DialogTitle>
                        {modalSub.plan_details && (
                          <p className="text-sm text-white/50">{modalSub.plan_details}</p>
                        )}
                        <div className="text-emerald-400 font-medium">
                          Save {formatCurrency(getAnnualAmount(modalSub.amount, modalSub.billing_frequency))}/year
                        </div>
                      </div>
                    </div>
                  </DialogHeader>
                  
                  <div className="space-y-4 text-white/80">
                    {modalSub.cancel_instructions && modalSub.cancel_instructions.length > 0 ? (
                      <div>
                        <h4 className="font-semibold mb-2">Cancellation Steps:</h4>
                        <ol className="list-decimal list-inside space-y-1 text-sm text-white/60">
                          {modalSub.cancel_instructions.map((instruction, index) => (
                            <li key={index}>{instruction}</li>
                          ))}
                        </ol>
                      </div>
                    ) : (
                      <div>
                        <h4 className="font-semibold mb-2">Cancellation Steps:</h4>
                        <ol className="list-decimal list-inside space-y-1 text-sm text-white/60">
                          <li>Visit the cancellation page</li>
                          <li>Sign in to your account</li>
                          <li>Find "Cancel Subscription" or "Account Settings"</li>
                          <li>Confirm cancellation</li>
                        </ol>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="p-6 bg-white/2 border-t border-white/5 flex justify-between gap-3">
                  <DialogClose asChild>
                    <Button variant="ghost" className="text-white/60 hover:text-white hover:bg-white/10">
                      Close
                    </Button>
                  </DialogClose>
                  
                  <div className="flex gap-2">
                    <Button 
                      className="bg-red-600 hover:bg-red-500 text-white"
                      onClick={() => modalSub.cancel_url && window.open(modalSub.cancel_url, '_blank')}
                      disabled={!modalSub.cancel_url}
                    >
                      <ExternalLink className="h-4 w-4 mr-1" />
                      Go to Cancel Page
                    </Button>
                    
                    <Button 
                      className="bg-emerald-600 hover:bg-emerald-500 text-white"
                      onClick={() => markAsCanceled(modalSub.id)}
                      disabled={updateStatusMutation.isPending}
                    >
                      <Check className="h-4 w-4 mr-1" />
                      {updateStatusMutation.isPending ? "Updating..." : "I've Canceled This"}
                    </Button>
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </main>
  );
}
