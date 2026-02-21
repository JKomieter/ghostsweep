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
import { ExternalLink, CheckCircle2, Filter, Calendar, Mail, Clock, Info, AlertTriangle, Zap, Loader2 } from "lucide-react";

type Newsletter = {
  id: string;
  service_id: string;
  name: string;
  unsubscribe_url: string | null;
  unsubscribe_method: "url" | "email" | "manual" | null;
  newsletter_frequency: "daily" | "multiple_weekly" | "weekly" | "biweekly" | "monthly" | "unknown" | null;
  status: "active" | "unsubscribed" | null;
    email_count: number;
    first_seen: string;
    last_seen: string;
    from_address: string;
};

type NewslettersQueryResult = {
  plan: string;
  blurred: boolean;
  previewOnly: boolean;
  previewCount: number | null;
  totalCount: number;
  activeCount: number;
  unsubscribedCount: number;
  emailsPerMonth: number;
  frequencyBreakdown: {
    daily: number;
    weekly: number;
    monthly: number;
    unknown: number;
  };
  newsletters: Newsletter[];
};

const TABS = [
  { key: "active", label: "Active" },
  { key: "unsubscribed", label: "Unsubscribed" },
];

const FREQUENCY_FILTERS = [
  { key: "all", label: "All" },
  { key: "daily", label: "Daily" },
  { key: "weekly", label: "Weekly" },
  { key: "monthly", label: "Monthly" },
  { key: "unknown", label: "Unknown" },
];

const SORTS = [
  { key: "frequency", label: "Most Frequent" },
  { key: "emails", label: "Most Emails" },
  { key: "recent", label: "Recently Received" },
  { key: "alphabetical", label: "Alphabetical" },
];

function getFrequencyColor(frequency: string | null) {
  switch (frequency) {
    case "daily": return "bg-red-500/10 border-red-500/20 text-red-400";
    case "multiple_weekly": return "bg-orange-500/10 border-orange-500/20 text-orange-400";
    case "weekly": return "bg-blue-500/10 border-blue-500/20 text-blue-400";
    case "biweekly": return "bg-cyan-500/10 border-cyan-500/20 text-cyan-400";
    case "monthly": return "bg-green-500/10 border-green-500/20 text-green-400";
    default: return "bg-gray-500/10 border-gray-500/20 text-gray-400";
  }
}

function formatFrequency(frequency: string | null) {
  if (!frequency || frequency === "unknown") return "Unknown";
  return frequency.charAt(0).toUpperCase() + frequency.slice(1).replace("_", " ");
}

function getTimeSince(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  
  if (diffInDays === 0) return "Today";
  if (diffInDays === 1) return "Yesterday";
  if (diffInDays < 7) return `${diffInDays} days ago`;
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
  return `${Math.floor(diffInDays / 30)} months ago`;
}

export default function NewslettersPage() {
  const [tab, setTab] = useState("active");
  const [frequencyFilter, setFrequencyFilter] = useState("all");
  const [sort, setSort] = useState("frequency");
  const [selected, setSelected] = useState<string[]>([]);
  const [modalNewsletter, setModalNewsletter] = useState<Newsletter | null>(null);
  const [batchUnsubscribing, setBatchUnsubscribing] = useState(false);
  const [showNukeModal, setShowNukeModal] = useState(false);
  const [nukeInProgress, setNukeInProgress] = useState(false);
  
  const queryClient = useQueryClient();

  // Fetch plan for trial eligibility
  const { data: planData } = useQuery<{ current_plan: string; has_used_trial: boolean }>({
    queryKey: ["plan"],
    queryFn: async () => {
      const res = await fetch("/api/plan");
      if (!res.ok) throw new Error("Failed to fetch plan");
      return res.json();
    },
  });

  // Fetch newsletters data
  const {
    data,
    isLoading: loading,
    error,
  } = useQuery<NewslettersQueryResult, Error>({
    queryKey: ["newsletters", tab, frequencyFilter, sort],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (tab !== "active") params.set("status", tab);
      if (frequencyFilter !== "all") params.set("frequency", frequencyFilter);
      if (sort) params.set("sort", sort);
      const res = await fetch(`/api/dashboard/newsletters?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to load newsletters data.");
      return res.json();
    },
  });

  // Bulk select
  const toggleSelect = (id: string) => setSelected(sel => sel.includes(id) ? sel.filter(x => x !== id) : [...sel, id]);
  const selectAll = () => setSelected(data?.newsletters?.map((n: Newsletter) => n.id) || []);
  const clearSelected = () => setSelected([]);
  const allSelected = selected.length === (data?.newsletters?.length || 0) && selected.length > 0;

  // Update newsletter status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ ids, status }: { ids: string[], status: string }) => {
      const res = await fetch('/api/dashboard/newsletters', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids, status })
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to update newsletters');
      }
      
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["newsletters"] });
      setSelected([]);
      setModalNewsletter(null);
    },
    onError: (error: Error) => {
      console.error('Error updating newsletters:', error);
      alert('Failed to update newsletters. Please try again.');
    }
  });

  const markAsUnsubscribed = (id: string) => {
    updateStatusMutation.mutate({ ids: [id], status: "unsubscribed" });
  };

  // Bulk Nuke mutation - unsubscribe AND delete all emails from selected senders
  const bulkNukeMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      const res = await fetch('/api/dashboard/newsletters/nuke', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids })
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to nuke newsletters');
      }
      
      return res.json();
    },
    onSuccess: async (result) => {
      queryClient.invalidateQueries({ queryKey: ["newsletters"] });
      setSelected([]);
      setShowNukeModal(false);
      
      // Open unsubscribe URLs in batches
      const urlsToOpen = result.urlsToOpen || [];
      if (urlsToOpen.length > 0) {
        const batchSize = 5;
        for (let i = 0; i < urlsToOpen.length; i += batchSize) {
          const batch = urlsToOpen.slice(i, i + batchSize);
          batch.forEach((item: { url: string }) => {
            window.open(item.url, '_blank');
          });
          // Wait 1.5 seconds before next batch to avoid popup blockers
          if (i + batchSize < urlsToOpen.length) {
            await new Promise(resolve => setTimeout(resolve, 1500));
          }
        }
      }
      
      setNukeInProgress(false);
      alert(`Nuked ${result.unsubscribedCount || 0} senders! ${urlsToOpen.length} unsubscribe pages opened. Click unsubscribe on each tab.`);
    },
    onError: (error: Error) => {
      console.error('Error nuking newsletters:', error);
      setNukeInProgress(false);
      alert('Failed to nuke newsletters. Please try again.');
    }
  });

  const executeNuke = async () => {
    if (!selected.length) return;
    setNukeInProgress(true);
    bulkNukeMutation.mutate(selected);
  };

  const batchUnsubscribe = async () => {
    if (!selected.length) return;
    
    const selectedNewsletters = data?.newsletters?.filter(n => selected.includes(n.id)) || [];
    const estimatedEmails = selectedNewsletters.reduce((sum, newsletter) => {
      const emailCount = newsletter.email_count || 0;
      return sum + Math.round(emailCount / 3); // Estimate monthly based on 90-day count
    }, 0);
    
    const confirmed = confirm(
      `Open ${selected.length} unsubscribe pages?\n\nThis will save you ~${estimatedEmails} emails/month`
    );
    
    if (!confirmed) return;
    
    setBatchUnsubscribing(true);
    
    // Open tabs in batches of 10 with 2-second delays
    const newsletters = selectedNewsletters.filter(n => n.unsubscribe_url);
    const batchSize = 10;
    
    for (let i = 0; i < newsletters.length; i += batchSize) {
      const batch = newsletters.slice(i, i + batchSize);
      batch.forEach(newsletter => {
        if (newsletter.unsubscribe_url) {
          window.open(newsletter.unsubscribe_url, '_blank');
        }
      });
      
      // Wait 2 seconds before next batch
      if (i + batchSize < newsletters.length) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    
    setBatchUnsubscribing(false);
    
    // Show toast-like alert
    alert(`Opened ${newsletters.length} unsubscribe pages. Click 'Unsubscribe' on each tab, then come back here.`);
  };

  // UI helpers
  const isPro = data?.plan === "pro";
  const blurred = data?.blurred;
  const previewOnly = data?.previewOnly;
  const previewCount = data?.previewCount || 0;
  const activeCount = data?.activeCount || 0;
  // totalCount is the count of items in the current filtered list
  const unsubscribedCount = data?.unsubscribedCount || 0;
  const emailsPerMonth = data?.emailsPerMonth || 0;
  const frequencyBreakdown = data?.frequencyBreakdown || { daily: 0, weekly: 0, monthly: 0, unknown: 0 };
  
  const getTabCount = (tabKey: string) => {
    switch (tabKey) {
      case "active": return activeCount;
      case "unsubscribed": return unsubscribedCount;
      default: return 0;
    }
  };

  const timeSavings = Math.round(emailsPerMonth / 170); // Assume 170 emails = 1 hour

  // Calculate stats for selected newsletters (for Nuke feature)
  const selectedNewsletters = data?.newsletters?.filter(n => selected.includes(n.id)) || [];
  const selectedMonthlyEmails = selectedNewsletters.reduce((sum, n) => sum + Math.round((n.email_count || 0) / 3), 0);

  return (
    <main className="min-h-screen bg-[#050505] p-4 md:p-10">
      <div className="container mx-auto max-w-6xl">
        
        {/* Header Stats */}
        <div className="relative mx-auto max-w-5xl rounded-xl border border-white/10 bg-black/40 p-1 backdrop-blur-xl shadow-2xl mb-10 overflow-hidden">
          <div className="absolute -inset-1 rounded-xl bg-linear-to-r from-blue-500/20 via-purple-500/20 to-indigo-500/20 blur opacity-50" />
          <div className="relative rounded-lg bg-[#0A0A0A] p-6 sm:p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <div className="text-[10px] uppercase tracking-widest text-white/50 mb-4 font-semibold">Newsletter Subscriptions</div>
                <div className="text-4xl font-light text-white mb-2">
                  {loading ? <Skeleton className="h-10 w-20" /> : activeCount}
                </div>
                <div className="text-sm text-white/40">active subscriptions</div>
              </div>
              
              <div>
                <div className="text-[10px] uppercase tracking-widest text-white/50 mb-4 font-semibold">Monthly Volume</div>
                <div className="text-3xl font-light text-blue-400 mb-2">
                  ~{emailsPerMonth}
                </div>
                <div className="text-sm text-white/40">emails per month</div>
              </div>
              
              <div>
                <div className="text-[10px] uppercase tracking-widest text-white/50 mb-4 font-semibold">Time Savings</div>
                <div className="text-3xl font-light text-emerald-400 mb-2">
                  {timeSavings}h
                </div>
                <div className="text-sm text-white/40">saved per month</div>
              </div>
            </div>
          </div>
        </div>

        {/* Info Alert */}
        <Alert className="mb-8 bg-blue-900/20 border-blue-900/50 text-blue-200">
          <Info className="h-4 w-4" />
          <AlertTitle>How batch unsubscribe works</AlertTitle>
          <AlertDescription>
            We'll open each unsubscribe page in a new tab. You'll need to click the final "Unsubscribe" button on each one. 
            This takes 10-20 minutes instead of hours searching emails.
          </AlertDescription>
        </Alert>

        {/* Frequency Breakdown */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="text-center p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="text-2xl font-light text-white mb-1">{frequencyBreakdown.daily}</div>
            <div className="text-xs text-red-400 uppercase tracking-wide">Daily</div>
          </div>
          <div className="text-center p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="text-2xl font-light text-white mb-1">{frequencyBreakdown.weekly}</div>
            <div className="text-xs text-blue-400 uppercase tracking-wide">Weekly</div>
          </div>
          <div className="text-center p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="text-2xl font-light text-white mb-1">{frequencyBreakdown.monthly}</div>
            <div className="text-xs text-green-400 uppercase tracking-wide">Monthly</div>
          </div>
          <div className="text-center p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="text-2xl font-light text-white mb-1">{frequencyBreakdown.unknown}</div>
            <div className="text-xs text-gray-400 uppercase tracking-wide">Unknown</div>
          </div>
        </div>

        {/* Tabs and Controls */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList className="bg-black/40 border border-white/5">
              {TABS.map(t => (
                <TabsTrigger key={t.key} value={t.key} className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-300">
                  {t.label} ({getTabCount(t.key)})
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
          
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 text-white/70 hover:text-white hover:bg-white/10">
                  <Filter className="mr-2 h-3.5 w-3.5" />{FREQUENCY_FILTERS.find(f => f.key === frequencyFilter)?.label}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-[#1a1d21] border-white/10 text-white">
                {FREQUENCY_FILTERS.map(f => (
                  <DropdownMenuItem key={f.key} onClick={() => setFrequencyFilter(f.key)} className="focus:bg-white/10 cursor-pointer">
                    {f.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 text-white/70 hover:text-white hover:bg-white/10">
                  <Calendar className="mr-2 h-3.5 w-3.5" />{SORTS.find(s => s.key === sort)?.label}
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
          </div>
        </div>

        {/* Bulk Actions */}
        {tab === "active" && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 px-6 py-4 rounded-xl bg-white/2 border border-white/5">
            <div className="flex flex-wrap items-center gap-4">
              <Button variant="ghost" size="sm" className="h-8 text-white/70 hover:text-white hover:bg-white/10" onClick={allSelected ? clearSelected : selectAll}>
                <Checkbox checked={allSelected} className="mr-2 border-white/30 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500" /> 
                {allSelected ? "Deselect All" : "Select All"}
              </Button>
              
              {selected.length > 0 && (
                <div className="text-sm text-white/60">
                  {selected.length} newsletter{selected.length > 1 ? 's' : ''} selected
                </div>
              )}
            </div>
            
            {selected.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-8 border-blue-500/30 text-blue-300 hover:bg-blue-500/10 hover:text-blue-200" 
                  onClick={batchUnsubscribe}
                  disabled={batchUnsubscribing || updateStatusMutation.isPending || (blurred && !isPro)}
                >
                  {batchUnsubscribing ? "Opening pages..." : `Batch Unsubscribe (${selected.length})`}
                </Button>
                
                {/* NUKE THE NOISE - Pro Only */}
                <Button 
                  size="sm" 
                  className="h-8 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white font-semibold shadow-lg shadow-red-500/20 gap-1.5"
                  onClick={() => isPro ? setShowNukeModal(true) : (window.location.href = "/dashboard/billing?plan=monthly")}
                  disabled={batchUnsubscribing || nukeInProgress}
                >
                  <Zap className="h-3.5 w-3.5" />
                  Nuke the Noise ({selected.length})
                  {!isPro && <span className="ml-1 text-[9px] bg-white/20 px-1.5 py-0.5 rounded-full">PRO</span>}
                </Button>
              </div>
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

        {/* Newsletter Cards */}
        <div className="grid grid-cols-1 gap-4">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-40 md:h-24 w-full rounded-2xl bg-white/5" />)
          ) : data?.newsletters && data.newsletters.length > 0 ? (
            data.newsletters.map((newsletter: Newsletter) => (
              <div key={newsletter.id} className="group relative rounded-2xl border border-white/5 bg-white/2 p-6 transition duration-300 hover:bg-white/5 hover:border-white/10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    {tab === "active" && (
                      <Checkbox 
                        checked={selected.includes(newsletter.id)} 
                        onCheckedChange={() => toggleSelect(newsletter.id)} 
                        className="mt-1 h-5 w-5 border-white/20 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500 rounded-md" 
                        disabled={blurred && !isPro}
                      />
                    )}
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-3 mb-2">
                        <h3 className="font-semibold text-white text-lg truncate max-w-[200px] sm:max-w-md">
                          {blurred && !isPro ? "████████" : newsletter.name}
                        </h3>
                        
                        <Badge variant="outline" className={`text-[10px] uppercase tracking-wider ${getFrequencyColor(newsletter.newsletter_frequency)}`}>
                          {formatFrequency(newsletter.newsletter_frequency)}
                        </Badge>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-white/60">
                        <div className="flex items-center gap-1">
                          <Mail className="h-4 w-4" />
                          {newsletter.email_count || 0} emails in last 90 days
                        </div>
                        
                        {newsletter.last_seen && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            Last: {getTimeSince(newsletter.last_seen)}
                          </div>
                        )}
                      </div>
                      
                      {/* Special cases */}
                      {!newsletter.unsubscribe_url && newsletter.unsubscribe_method === "manual" && (
                        <div className="flex items-center gap-1 text-xs text-yellow-400 mt-2">
                          <AlertTriangle className="h-3 w-3" />
                          No unsubscribe link found
                        </div>
                      )}
                      
                      {newsletter.unsubscribe_method === "email" && (
                        <div className="flex items-center gap-1 text-xs text-blue-400 mt-2">
                          <Mail className="h-3 w-3" />
                          Email to unsubscribe
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Actions */}
                  {tab === "active" && (
                    <div className="flex flex-wrap items-center gap-2">
                      {newsletter.unsubscribe_url ? (
                        <Button 
                          size="sm" 
                          className="bg-blue-600 hover:bg-blue-500 text-white text-xs whitespace-nowrap"
                          onClick={() => window.open(newsletter.unsubscribe_url!, '_blank')}
                          disabled={blurred && !isPro}
                        >
                          <ExternalLink className="h-3 w-3 mr-1" />
                          Unsubscribe
                        </Button>
                      ) : newsletter.unsubscribe_method === "email" ? (
                        <Button 
                          size="sm" 
                          className="bg-blue-600 hover:bg-blue-500 text-white text-xs whitespace-nowrap"
                          onClick={() => window.open(`mailto:unsubscribe@${newsletter?.from_address?.split('@')[1] || 'newsletter.com'}?subject=Unsubscribe`, '_blank')}
                          disabled={blurred && !isPro}
                        >
                          <Mail className="h-3 w-3 mr-1" />
                          Email to Unsubscribe
                        </Button>
                      ) : (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="border-white/20 text-white/70 hover:bg-white/10 text-xs whitespace-nowrap"
                          onClick={() => setModalNewsletter(newsletter)}
                          disabled={blurred && !isPro}
                        >
                          Manual Instructions
                        </Button>
                      )}
                      
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-emerald-400 hover:bg-emerald-500/10 text-xs whitespace-nowrap"
                        onClick={() => markAsUnsubscribed(newsletter.id)}
                        disabled={updateStatusMutation.isPending || (blurred && !isPro)}
                      >
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        {updateStatusMutation.isPending ? "Updating..." : "Mark Unsubscribed"}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center text-white/60 py-12">
              {tab === "active" ? (
                <>🎉 No newsletters found!<br />Your inbox is clean.</>
              ) : (
                "No unsubscribed newsletters yet"
              )}
            </div>
          )}
        </div>
        
        {/* Free tier teaser */}
        {previewOnly && data?.newsletters && data.newsletters.length > 0 && data.activeCount > previewCount && (
          <div className="mt-8 rounded-2xl border border-blue-500/30 bg-gradient-to-b from-blue-500/10 to-transparent p-8 text-center">
            <div className="text-5xl mb-4">📧</div>
            <h3 className="text-xl text-white font-semibold mb-3">Your Inbox Is Overflowing</h3>
            <p className="text-white/60 mb-2 max-w-md mx-auto">
              You have <span className="text-blue-400 font-bold">{data.activeCount} newsletters</span> sending ~{emailsPerMonth} emails/month.
              We're only showing {previewCount} of them.
            </p>
            <p className="text-white/40 text-sm mb-6">
              {planData?.has_used_trial ? "Upgrade" : "Start your free trial"} to unsubscribe in bulk and reclaim your inbox.
            </p>
            <a href="/dashboard/billing?plan=monthly" className="inline-flex items-center justify-center rounded-lg bg-blue-500 hover:bg-blue-400 px-6 py-3 text-sm font-semibold text-white transition">
              {planData?.has_used_trial ? "Upgrade to Pro →" : "Start Free Trial →"}
            </a>
          </div>
        )}

        {/* Manual Instructions Modal */}
        <Dialog open={!!modalNewsletter} onOpenChange={open => !open && setModalNewsletter(null)}>
          <DialogContent className="max-w-lg p-0 bg-[#0A0A0A] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
            {modalNewsletter && (
              <>
                <div className="p-6">
                  <DialogHeader>
                    <DialogTitle className="text-xl font-semibold text-white mb-4">
                      Unsubscribe from {modalNewsletter.name}
                    </DialogTitle>
                  </DialogHeader>
                  
                  <div className="space-y-4 text-white/80">
                    <div>
                      <h4 className="font-semibold mb-2">Manual Unsubscribe Steps:</h4>
                      <ol className="list-decimal list-inside space-y-1 text-sm text-white/60">
                        <li>Open any email from {modalNewsletter.name}</li>
                        <li>Scroll to the bottom of the email</li>
                        <li>Look for an "Unsubscribe" link</li>
                        <li>Click the link and follow instructions</li>
                      </ol>
                    </div>
                    
                    <div className="text-sm text-white/50 bg-white/5 p-3 rounded-lg">
                      <strong>Alternative:</strong> Reply to their email with "UNSUBSCRIBE" in the subject line.
                    </div>
                  </div>
                </div>
                
                <div className="p-6 bg-white/2 border-t border-white/5 flex justify-between gap-3">
                  <DialogClose asChild>
                    <Button variant="ghost" className="text-white/60 hover:text-white hover:bg-white/10">
                      Close
                    </Button>
                  </DialogClose>
                  
                  <Button 
                    className="bg-emerald-600 hover:bg-emerald-500 text-white"
                    onClick={() => markAsUnsubscribed(modalNewsletter.id)}
                    disabled={updateStatusMutation.isPending}
                  >
                    <CheckCircle2 className="h-4 w-4 mr-1" />
                    {updateStatusMutation.isPending ? "Updating..." : "Mark as Unsubscribed"}
                  </Button>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* NUKE THE NOISE Modal */}
        <Dialog open={showNukeModal} onOpenChange={setShowNukeModal}>
          <DialogContent className="max-w-lg p-0 bg-[#0A0A0A] border border-red-500/30 rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-6">
              <DialogHeader>
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-red-500/20 to-orange-500/20 border border-red-500/30 flex items-center justify-center">
                    <Zap className="h-6 w-6 text-red-400" />
                  </div>
                  <div>
                    <DialogTitle className="text-xl font-semibold text-white">
                      Nuke the Noise
                    </DialogTitle>
                    <p className="text-sm text-white/50">Unsubscribe + delete all emails</p>
                  </div>
                </div>
              </DialogHeader>
              
              <div className="space-y-4">
                {/* Impact Stats */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-4 text-center">
                    <div className="text-3xl font-light text-white mb-1">{selected.length}</div>
                    <div className="text-xs text-red-400 uppercase tracking-wide">Senders to Nuke</div>
                  </div>
                  <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-4 text-center">
                    <div className="text-3xl font-light text-white mb-1">~{selectedMonthlyEmails}</div>
                    <div className="text-xs text-emerald-400 uppercase tracking-wide">Emails/Mo Saved</div>
                  </div>
                </div>

                {/* What will happen */}
                <div className="rounded-xl bg-white/5 border border-white/10 p-4">
                  <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                    <Zap className="h-4 w-4 text-red-400" />
                    This will:
                  </h4>
                  <ul className="space-y-2 text-sm text-white/70">
                    <li className="flex items-center gap-2">
                      <span className="text-red-400">✓</span>
                      Open {selectedNewsletters.filter(n => n.unsubscribe_url).length} unsubscribe pages
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-red-400">✓</span>
                      Mark all {selected.length} as unsubscribed
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-emerald-400">✓</span>
                      Save ~{selectedMonthlyEmails} emails per month
                    </li>
                  </ul>
                </div>

                {/* Selected senders preview */}
                <div className="rounded-xl bg-white/5 border border-white/10 p-4 max-h-32 overflow-y-auto">
                  <h4 className="font-semibold text-white mb-2 text-sm">Senders to nuke:</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedNewsletters.slice(0, 8).map(n => (
                      <span key={n.id} className="text-xs bg-red-500/10 text-red-300 px-2 py-1 rounded-full border border-red-500/20">
                        {n.name}
                      </span>
                    ))}
                    {selectedNewsletters.length > 8 && (
                      <span className="text-xs text-white/40">+{selectedNewsletters.length - 8} more</span>
                    )}
                  </div>
                </div>

                {/* Info note */}
                <Alert className="bg-blue-900/20 border-blue-500/30 text-blue-200">
                  <Info className="h-4 w-4" />
                  <AlertTitle>How it works</AlertTitle>
                  <AlertDescription className="text-blue-200/70">
                    We&apos;ll open each unsubscribe page in a new tab. Just click &quot;Unsubscribe&quot; on each one.
                  </AlertDescription>
                </Alert>
              </div>
            </div>
            
            <div className="p-6 bg-gradient-to-r from-red-500/5 to-orange-500/5 border-t border-white/5 flex justify-between gap-3">
              <Button 
                variant="ghost" 
                className="text-white/60 hover:text-white hover:bg-white/10"
                onClick={() => setShowNukeModal(false)}
                disabled={nukeInProgress}
              >
                Cancel
              </Button>
              
              <Button 
                className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white font-semibold shadow-lg shadow-red-500/20 gap-2"
                onClick={executeNuke}
                disabled={nukeInProgress}
              >
                {nukeInProgress ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Nuking...
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4" />
                    Nuke {selected.length} Sender{selected.length > 1 ? 's' : ''}
                  </>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </main>
  );
}
