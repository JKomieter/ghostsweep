"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { clearTeaserHandoff, readTeaserHandoff, type TeaserHandoff } from "@/lib/teaser-handoff";

// Picks up the homepage teaser scan the visitor ran before signing up, so their first dashboard
// visit continues that result instead of starting from nothing. One click adds the username to
// their Identity Shadow scan, where those profiles can be tracked and removed.
export default function TeaserHandoffBanner() {
    const router = useRouter();
    const [handoff, setHandoff] = useState<TeaserHandoff | null>(null);
    const [saving, setSaving] = useState(false);

    // Browser storage is only readable after mount
    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setHandoff(readTeaserHandoff());
    }, []);

    if (!handoff) return null;

    const dismiss = () => {
        clearTeaserHandoff();
        setHandoff(null);
    };

    const addToShadowScan = async () => {
        setSaving(true);
        try {
            const res = await fetch("/api/user-selectors", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ selector_value: handoff.username }),
            });
            // 409 means it's already being tracked, which is just as good
            if (!res.ok && res.status !== 409) throw new Error("Failed to add username");
            clearTeaserHandoff();
            router.push("/dashboard/identity-shadow");
        } catch {
            toast.error("Couldn't add that username", {
                description: "You can add it yourself on the Identity Shadow page.",
            });
            setSaving(false);
        }
    };

    const n = handoff.profilesFound;

    return (
        <section className="relative rounded-lg border border-foreground/10 bg-card p-6 md:p-7">
            <button
                onClick={dismiss}
                className="absolute top-3 right-3 p-1.5 rounded-md text-foreground/55 hover:bg-foreground/[0.05] hover:text-foreground/70 transition-colors"
                aria-label="Dismiss"
            >
                <X className="h-4 w-4" />
            </button>

            <p className="font-mono text-xs text-foreground/55">From your homepage scan</p>
            <h2 className="mt-2 pr-8 text-xl md:text-2xl font-medium text-foreground">
                We found <span className="font-mono tabular-nums">{n}</span> public profile{n === 1 ? "" : "s"} for{" "}
                <span className="font-mono">@{handoff.username}</span>
            </h2>
            <p className="mt-2 max-w-xl text-sm text-foreground/65">
                {handoff.sites.length > 0 && (
                    <>Including {handoff.sites.join(", ")}. </>
                )}
                Add this username to your shadow scan to see every profile, check which ones were in
                breaches, and get the steps to remove them.
            </p>

            <button
                onClick={addToShadowScan}
                disabled={saving}
                className="group mt-5 inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
            >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Track these profiles
                {!saving && <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />}
            </button>
        </section>
    );
}
