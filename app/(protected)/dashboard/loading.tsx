"use client"

import { Loader2 } from "lucide-react"

export default function Loading() {
    return (
        <main className="min-h-screen flex items-center justify-center bg-background text-foreground">
            <div className="flex flex-col items-center gap-4">

                {/* Spinner */}
                <div className="p-4 rounded-full bg-[#0f0f0f] border border-white/10">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>

                {/* Text */}
                <h2 className="text-lg font-medium tracking-tight">
                    Loading GhostSweep…
                </h2>

                <p className="text-sm text-muted-foreground">
                    Securing your privacy. Please wait.
                </p>
            </div>
        </main>
    )
}