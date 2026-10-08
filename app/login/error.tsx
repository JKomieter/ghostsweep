"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LoginError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Login page error:", error);
  }, [error]);

  return (
    <div className="relative flex min-h-screen w-full overflow-hidden bg-linear-to-b from-background via-background to-background">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-40 top-[-10%] h-80 w-80 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="absolute right-[-10%] bottom-[-10%] h-80 w-80 rounded-full bg-cyan-500/10 blur-3xl" />
      </div>

      <div className="relative z-10 flex w-full items-center justify-center px-4">
        <div className="max-w-md space-y-6 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10 border border-red-500/30 mx-auto">
            <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-foreground">
              Something went wrong
            </h1>
            <p className="text-sm text-foreground/60">
              We encountered an error while loading the login page. Please try again.
            </p>
          </div>

          <div className="space-y-3 pt-4">
            <Button
              onClick={reset}
              className="h-11 w-full rounded-lg bg-foreground text-background text-sm font-semibold hover:bg-foreground/90 transition-all duration-200"
            >
              Try again
            </Button>
            <Link href="/" className="block">
              <Button
                variant="outline"
                className="h-11 w-full rounded-lg border-foreground/10 bg-foreground/5 text-foreground hover:bg-foreground/10"
              >
                Go home
              </Button>
            </Link>
          </div>

          {process.env.NODE_ENV === "development" && (
            <div className="mt-6 rounded-lg border border-red-500/20 bg-red-500/5 p-4 text-left">
              <p className="text-xs font-mono text-red-700 dark:text-red-300 wrap-break-word">
                {error.message}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
