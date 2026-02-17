"use client";

import { useState } from "react";
import Link from "next/link";
import { Logo } from "@/svgs";
import { ArrowRight, Menu, X } from "lucide-react";

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
                        className="text-white/40 transition-colors hover:text-white"
                        onClick={onClick}
                    >
                        {link.label}
                    </a>
                ) : (
                    <Link
                        key={link.href}
                        href={link.href}
                        className="text-white/40 transition-colors hover:text-white"
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
        <header className="sticky top-0 z-50 border-b border-white/5 bg-[#050505]/80 backdrop-blur-xl">
            <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6">
                {/* Logo */}
                <Link href="/home" onClick={closeMobile} className="flex items-center gap-2.5">
                    <Logo className="h-5 w-auto" />
                    <span className="text-sm font-semibold tracking-tight text-white">
                        GhostSweep
                    </span>
                </Link>

                {/* Desktop nav */}
                <NavLinks className="hidden items-center gap-7 text-[13px] sm:flex" />

                {/* Desktop right */}
                <div className="hidden items-center gap-4 sm:flex">
                    <Link
                        href="/login"
                        className="text-[13px] text-white/40 transition-colors hover:text-white"
                    >
                        Log in
                    </Link>
                    <Link
                        href="/login"
                        className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500 px-4 py-1.5 text-[13px] font-medium text-black shadow-sm transition hover:bg-emerald-400"
                    >
                        Get started
                        <ArrowRight className="h-3 w-3" />
                    </Link>
                </div>

                {/* Mobile menu button */}
                <button
                    type="button"
                    className="inline-flex items-center justify-center rounded-lg p-2 text-white/40 hover:text-white hover:bg-white/5 sm:hidden transition"
                    onClick={() => setMobileOpen((prev) => !prev)}
                    aria-label="Toggle navigation menu"
                    aria-expanded={mobileOpen}
                >
                    {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </button>
            </div>

            {/* Mobile dropdown */}
            {mobileOpen && (
                <div className="border-t border-white/5 bg-[#050505]/95 backdrop-blur-xl sm:hidden">
                    <div className="mx-auto max-w-5xl px-6 py-4 space-y-5">
                        <NavLinks
                            onClick={closeMobile}
                            className="flex flex-col gap-3 text-sm"
                        />

                        <div className="border-t border-white/5 pt-4 space-y-3">
                            <Link
                                href="/login"
                                className="block text-sm text-white/40 transition-colors hover:text-white"
                                onClick={closeMobile}
                            >
                                Log in
                            </Link>
                            <Link
                                href="/login"
                                onClick={closeMobile}
                                className="flex items-center justify-center gap-1.5 rounded-full bg-emerald-500 px-4 py-2.5 text-sm font-medium text-black shadow-sm transition hover:bg-emerald-400"
                            >
                                Get started
                                <ArrowRight className="h-3.5 w-3.5" />
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
}
