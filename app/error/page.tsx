"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ShieldAlert, RefreshCcw } from "lucide-react"

export default function ErrorPage() {
    return (
        <main className="min-h-screen flex items-center justify-center bg-background text-foreground px-4">
            <div className="w-full max-w-md text-center flex flex-col items-center gap-6">

                {/* Icon */}
                <div className="bg-red-500/10 p-4 rounded-full border border-red-500/20">
                    <ShieldAlert className="h-10 w-10 text-red-700 dark:text-red-300" />
                </div>

                {/* Title */}
                <h1 className="text-2xl font-light tracking-tight text-foreground">
                    Something went wrong
                </h1>

                {/* Description */}
                <p className="text-foreground/60 text-sm leading-relaxed">
                    We couldn’t complete your request.
                    This may be due to an expired link, missing information, or a temporary issue.
                </p>

                {/* Actions */}
                <div className="flex flex-col gap-3 w-full">
                    <Button
                        variant="default"
                        className="w-full flex gap-2 items-center justify-center bg-foreground text-background hover:bg-foreground/90 font-light"
                        onClick={() => window.location.reload()}
                    >
                        <RefreshCcw className="h-4 w-4" />
                        Try again
                    </Button>

                    <Link href="/login" className="w-full">
                        <Button
                            variant="outline"
                            className="w-full text-sm border-foreground/5 bg-foreground/2 hover:bg-foreground/3 hover:border-foreground/10 font-light text-foreground"
                        >
                            Back to Login
                        </Button>
                    </Link>
                </div>

                {/* Footer Help */}
                <p className="text-xs text-foreground/60">
                    Still having trouble?{" "}
                    <Link href="/help" className="text-foreground hover:underline font-light">
                        Visit Help Center
                    </Link>
                </p>
            </div>
        </main>
    )
}