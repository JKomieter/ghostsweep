"use client";
import { Button } from "@/components/ui/button";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { LoaderCircle } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

export default function SweepCard() {
    const [isSweeping, setIsSweeping] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);
    const queryClient = useQueryClient();

    const { data } = useQuery({
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

    const onSweep = async () => {
        toast(() => (
            <div>
                <span>
                    Sweeping your inbox… this may take up to 30–60 seconds.
                </span>
                <span className="text-sm">
                    Please keep this page open and don’t refresh.
                </span>
            </div>
        ))
        try {
            setIsSweeping(true);
            const res = await fetch('/api/sweep/run');
            const data = await res.json();
            if (!res.ok) {
                if (data.code === 'GMAIL_ACCOUNT_NOT_FOUND') {
                    toast.error('No Gmail account connected. Please connect your Gmail first.');
                    return
                } else if (data.code === "MONTHLY_LIMIT_REACHED") {
                    toast.error(() => (
                        <div>
                            <span className="font-medium">You’ve Hit Your Monthly Sweep Limit</span>
                            <p className="text-sm text-muted-foreground">
                                Stay protected. Go Pro for unlimited sweeps and detailed insights.
                            </p>
                            <Button variant="outline" size="sm" className="mt-2">
                                Upgrade to Pro
                            </Button>
                        </div>
                    ))
                }
                else throw new Error(data.error);
            }
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: ['gmailAccount'] }),
                queryClient.invalidateQueries({ queryKey: ['services'] }),
                queryClient.invalidateQueries({ queryKey: ['breaches'] }),
                queryClient.invalidateQueries({ queryKey: ['metrics'] }),
            ])
        } catch (error) {
            console.error('Error running sweep:', JSON.stringify(error));
            toast.error('Failed to run sweep. Please try again later.')
        } finally {
            setIsSweeping(false);
        }
    };

    return (
        <div className="rounded-xl bg-[#111418] border border-white/10 p-6 w-full shadow-lg">
            <h2 className="text-xl font-semibold text-white">Run a Sweep</h2>
            <p className="text-sm text-white/50 mt-1">
                GhostSweep analyzes only email metadata (sender, subject, date) to
                detect services and breaches.
            </p>

            {!data?.gmail_address ? (
                <>
                    <Link href="/api/google/oauth/start" onClick={() => setIsConnecting(true)}>
                        <Button
                            className="mt-5 w-full py-3 rounded-lg bg-primary"
                            disabled={isConnecting}
                        >
                            {isConnecting ? (
                                <>
                                    <LoaderCircle className="animate-spin" /> Connecting...
                                </>
                            ) : (
                                "Connect Gmail"
                            )}
                        </Button>
                    </Link>
                    <p className="text-xs text-white/40 mt-3 text-center">
                        Read-only access. We never store email content.
                    </p>
                </>
            ) : (
                <>
                    <div className="mt-4 text-xs text-white/50">
                        Connected as <span className="text-white">{data.gmail_address}</span>
                    </div>

                    <Button
                        onClick={onSweep}
                        disabled={isSweeping}
                        className={`mt-4 w-full py-3 font-semibold`}
                    >
                        {isSweeping ? (
                            <>
                                <LoaderCircle className="animate-spin" /> Sweeping...
                            </>
                        ) : "Run Sweep"}
                    </Button>

                    <p className="text-xs text-white/40 mt-3 text-center">
                        Read-only Gmail metadata · Safe & private
                    </p>
                </>
            )}
        </div>
    );
}

