"use client";

import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

export function ThemeToggle({ className }: { className?: string }) {
    const { resolvedTheme, setTheme } = useTheme();

    // Icons switch via the `dark` class so server and client markup always match
    return (
        <button
            type="button"
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            aria-label="Toggle light and dark mode"
            className={cn(
                "inline-flex h-8 w-8 items-center justify-center rounded-full text-foreground/60 transition hover:bg-foreground/5 hover:text-foreground",
                className
            )}
        >
            <Moon className="h-4 w-4 dark:hidden" />
            <Sun className="hidden h-4 w-4 dark:block" />
        </button>
    );
}
