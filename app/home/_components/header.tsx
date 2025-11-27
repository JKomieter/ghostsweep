"use client";

import { Logo } from "@/svgs";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default function Header() {

    // Only show the center nav on the marketing home

    return (
        <header className="sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur-sm">
            <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
                {/* Logo */}
                <Link href="/home">
                    <div className="flex items-center gap-2">
                        <Logo className="h-6 w-auto" />
                        <span className="text-sm font-semibold tracking-tight">
                            GhostSweep
                        </span>
                    </div>
                </Link>

                {/* Center nav – only on /home */}
                { (
                    <nav className="hidden items-center gap-6 text-xs text-muted-foreground sm:flex">
                        <Link
                            href="/home/how-it-works"
                            className="transition-colors hover:text-foreground"
                        >
                            How it works
                        </Link>
                        <Link
                            href="/home/security"
                            className="transition-colors hover:text-foreground"
                        >
                            Security
                        </Link>
                        <Link
                            href="/home/blogs"
                            className="transition-colors hover:text-foreground"
                        >
                            Blog
                        </Link>
                        <Link
                            href="/home/breach-check"
                            className="transition-colors hover:text-foreground"
                        >
                            Breach checker
                        </Link>
                        <a
                            href="#pricing"
                            className="transition-colors hover:text-foreground"
                        >
                            Pricing
                        </a>
                        <a href="#faq" className="transition-colors hover:text-foreground">
                            FAQ
                        </a>
                    </nav>
                )}

                {/* Right CTAs */}
                <div className="flex items-center gap-2">
                    <Link
                        href="/login"
                        className="text-xs text-muted-foreground transition-colors hover:text-foreground"
                    >
                        Log in
                    </Link>
                    <Link
                        href="/login"
                        className="inline-flex items-center gap-1 rounded-full bg-primary px-4 py-1.5 text-xs font-medium text-primary-foreground shadow-sm transition hover:opacity-90"
                    >
                        Start free scan
                        <ArrowRight className="h-3 w-3" />
                    </Link>
                </div>
            </div>
        </header>
    );
}