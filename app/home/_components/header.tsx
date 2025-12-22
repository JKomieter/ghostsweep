"use client";

import { useState } from "react";
import Link from "next/link";
import { Logo } from "@/svgs";
import { ArrowRight, Menu, X } from "lucide-react";

const NavLinks = ({
    className = "",
    onClick,
}: {
    className?: string;
    onClick?: () => void;
}) => (
    <nav className={className}>
        <Link
            href="/home/how-it-works"
            className="transition-colors hover:text-foreground"
            onClick={onClick}
        >
            How it works
        </Link>
        <Link
            href="/home/security"
            className="transition-colors hover:text-foreground"
            onClick={onClick}
        >
            Security
        </Link>
        <Link
            href="/home/blogs"
            className="transition-colors hover:text-foreground"
            onClick={onClick}
        >
            Blog
        </Link>
        <Link
            href="/home/breach_check"
            className="transition-colors hover:text-foreground"
            onClick={onClick}
        >
            Breach checker
        </Link>
        <a
            href="/home#pricing"
            className="transition-colors hover:text-foreground"
            onClick={onClick}
        >
            Pricing
        </a>
        <a
            href="/home#faq"
            className="transition-colors hover:text-foreground"
            onClick={onClick}
        >
            FAQ
        </a>
    </nav>
);

export default function Header() {
    const [mobileOpen, setMobileOpen] = useState(false);

    const closeMobile = () => setMobileOpen(false);

    return (
        <header className="sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur-sm">
            <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
                {/* Logo */}
                <Link href="/home" onClick={closeMobile}>
                    <div className="flex items-center gap-2">
                        <Logo className="h-6 w-auto" />
                        <span className="text-sm font-semibold tracking-tight">
                            GhostSweep
                        </span>
                    </div>
                </Link>

                {/* Center nav – desktop only */}
                <NavLinks className="hidden items-center gap-6 text-xs text-muted-foreground sm:flex" />

                {/* Right side (desktop) */}
                <div className="hidden items-center gap-3 sm:flex">
                    {/* Policy links (more visible) */}
                    <nav className="flex items-center gap-3 text-[11px] text-muted-foreground">
                        <Link
                            href="/home/privacy"
                            className="transition-colors hover:text-foreground"
                        >
                            Privacy
                        </Link>
                        <Link
                            href="/home/terms"
                            className="transition-colors hover:text-foreground"
                        >
                            Terms
                        </Link>
                    </nav>

                    <div className="h-4 w-px bg-border/60" />

                    {/* CTAs */}
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

                {/* Mobile menu button */}
                <button
                    type="button"
                    className="inline-flex items-center justify-center rounded-md p-2 text-muted-foreground hover:text-foreground hover:bg-muted sm:hidden"
                    onClick={() => setMobileOpen((prev) => !prev)}
                    aria-label="Toggle navigation menu"
                    aria-expanded={mobileOpen}
                >
                    {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </button>
            </div>

            {/* Mobile dropdown */}
            {mobileOpen && (
                <div className="border-t border-border/60 bg-background/95 sm:hidden">
                    <div className="mx-auto max-w-5xl px-4 pb-3 pt-2 space-y-3">
                        <NavLinks
                            onClick={closeMobile}
                            className="flex flex-col gap-2 text-sm text-muted-foreground"
                        />

                        {/* Policy links (mobile) */}
                        <div className="pt-2 border-t border-border/60">
                            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                                <Link
                                    href="/home/privacy"
                                    className="transition-colors hover:text-foreground"
                                    onClick={closeMobile}
                                >
                                    Privacy
                                </Link>
                                <Link
                                    href="/home/terms"
                                    className="transition-colors hover:text-foreground"
                                    onClick={closeMobile}
                                >
                                    Terms
                                </Link>
                            </div>
                        </div>

                        <div className="flex flex-col gap-2 pt-2">
                            <Link
                                href="/login"
                                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                                onClick={closeMobile}
                            >
                                Log in
                            </Link>
                            <Link
                                href="/login"
                                onClick={closeMobile}
                                className="inline-flex items-center justify-center gap-1 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition hover:opacity-90"
                            >
                                Start free scan
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
}