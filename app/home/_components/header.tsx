"use client";

import { useState } from "react";
import Link from "next/link";
import { Logo } from "@/svgs";
import { ArrowRight, Menu, X } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

const links = [
    { href: "/home/how-it-works", label: "How it works" },
    { href: "/home/security", label: "Security" },
    { href: "/home/blogs", label: "Blog" },
    { href: "/home/breach_check", label: "Breach checker" },
    { href: "/home#pricing", label: "Pricing", anchor: true },
    { href: "/home#faq", label: "FAQ", anchor: true },
];

function NavLinks({
    className = "",
    onClick,
}: {
    className?: string;
    onClick?: () => void;
}) {
    return (
        <nav className={className}>
            {links.map((link) =>
                link.anchor ? (
                    <a
                        key={link.href}
                        href={link.href}
                        className="text-foreground/60 transition-colors hover:text-foreground"
                        onClick={onClick}
                    >
                        {link.label}
                    </a>
                ) : (
                    <Link
                        key={link.href}
                        href={link.href}
                        className="text-foreground/60 transition-colors hover:text-foreground"
                        onClick={onClick}
                    >
                        {link.label}
                    </Link>
                )
            )}
        </nav>
    );
}

export default function Header() {
    const [mobileOpen, setMobileOpen] = useState(false);
    const closeMobile = () => setMobileOpen(false);

    return (
        <header className="sticky top-0 z-50 border-b border-foreground/5 bg-background/80 backdrop-blur-xl">
            <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6">
                {/* Logo */}
                <Link href="/home" onClick={closeMobile} className="flex items-center gap-2.5">
                    <Logo className="h-5 w-auto" />
                    <span className="text-sm font-semibold tracking-tight text-foreground">
                        GhostSweep
                    </span>
                </Link>

                {/* Desktop nav */}
                <NavLinks className="hidden items-center gap-7 text-[13px] lg:flex" />

                {/* Desktop right */}
                <div className="hidden items-center gap-3 lg:flex">
                    <ThemeToggle />
                    <Link
                        href="/login"
                        className="text-[13px] text-foreground/60 transition-colors hover:text-foreground"
                    >
                        Log in
                    </Link>
                    <Link
                        href="/login?mode=signup"
                        className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500 px-4 py-1.5 text-[13px] font-medium text-black shadow-sm transition hover:bg-emerald-400"
                    >
                        Start free scan
                        <ArrowRight className="h-3 w-3" />
                    </Link>
                </div>

                {/* Mobile menu button */}
                <div className="flex items-center gap-1 lg:hidden">
                    <ThemeToggle />
                    <button
                        type="button"
                        className="inline-flex items-center justify-center rounded-lg p-2 text-foreground/60 hover:text-foreground hover:bg-foreground/5 transition"
                        onClick={() => setMobileOpen((prev) => !prev)}
                        aria-label="Toggle navigation menu"
                        aria-expanded={mobileOpen}
                    >
                        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                    </button>
                </div>
            </div>

            {/* Mobile dropdown */}
            {mobileOpen && (
                <div className="border-t border-foreground/5 bg-background/95 backdrop-blur-xl lg:hidden">
                    <div className="mx-auto max-w-5xl px-6 py-4 space-y-5">
                        <NavLinks
                            onClick={closeMobile}
                            className="flex flex-col gap-3 text-sm"
                        />

                        <div className="border-t border-foreground/5 pt-4 space-y-3">
                            <Link
                                href="/login"
                                className="block text-sm text-foreground/60 transition-colors hover:text-foreground"
                                onClick={closeMobile}
                            >
                                Log in
                            </Link>
                            <Link
                                href="/login?mode=signup"
                                onClick={closeMobile}
                                className="flex items-center justify-center gap-1.5 rounded-full bg-emerald-500 px-4 py-2.5 text-sm font-medium text-black shadow-sm transition hover:bg-emerald-400"
                            >
                                Start free scan
                                <ArrowRight className="h-3.5 w-3.5" />
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
}
