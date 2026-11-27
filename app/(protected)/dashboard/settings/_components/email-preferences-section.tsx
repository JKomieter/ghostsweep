"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Mail } from "lucide-react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";

type Prefs = { marketing: boolean };

// Settings card for email preferences. Matches the page's SettingsSection markup.
// id="email" so email footers can link straight here (/dashboard/settings#email).
export default function EmailPreferencesSection() {
    const queryClient = useQueryClient();

    const { data, isLoading } = useQuery<Prefs>({
        queryKey: ["email-preferences"],
        queryFn: async () => {
            const res = await fetch("/api/account/email-preferences");
            if (!res.ok) throw new Error("Failed to load email settings");
            return res.json();
        },
    });

    const mutation = useMutation({
        mutationFn: async (marketing: boolean) => {
            const res = await fetch("/api/account/email-preferences", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ marketing }),
            });
            if (!res.ok) throw new Error("Failed to save email settings");
            return (await res.json()) as Prefs;
        },
        onSuccess: (prefs) => {
            queryClient.setQueryData(["email-preferences"], prefs);
            toast.success(prefs.marketing ? "Tips and offers turned on" : "Tips and offers turned off");
        },
        onError: () => toast.error("Couldn't save your email settings. Please try again."),
    });

    return (
        <div id="email" className="rounded-xl border p-6 border-foreground/10 bg-card scroll-mt-20">
            <div className="flex items-start gap-3 mb-4">
                <div className="p-2 rounded-lg bg-foreground/5">
                    <Mail className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
                </div>
                <div>
                    <h2 className="text-lg font-semibold text-foreground">Emails</h2>
                    <p className="text-xs text-muted-foreground mt-0.5">Choose what GhostSweep emails you about</p>
                </div>
            </div>

            <div className="space-y-3">
                <div className="flex items-center justify-between gap-4 p-3 rounded-lg bg-background/40 border border-foreground/10">
                    <div>
                        <p className="text-sm font-medium text-foreground">Tips and offers</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            Reminders about what your scan found, upgrade offers and referral rewards.
                        </p>
                    </div>
                    {isLoading ? (
                        <Skeleton className="h-5 w-9 rounded-full bg-foreground/10" />
                    ) : (
                        <Switch
                            checked={mutation.isPending ? mutation.variables : (data?.marketing ?? true)}
                            disabled={mutation.isPending || !data}
                            onCheckedChange={(checked) => mutation.mutate(checked)}
                            aria-label="Tips and offers emails"
                        />
                    )}
                </div>
                <p className="text-xs text-muted-foreground">
                    Scan results and important account or security emails are always sent.
                </p>
            </div>
        </div>
    );
}
