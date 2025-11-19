import { Logo } from "@/svgs";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";


export default function Header() {
    const pathname = usePathname();

    const showNav = pathname == "/home"

    return (
        <header className="border-b border-border/60 bg-background/80 backdrop-blur-sm sticky top-0 z-30">
            <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
                <Link href="/home">
                    <div className="flex items-center gap-2">
                        <Logo className="h-6 w-auto" />
                        <span className="text-sm font-semibold tracking-tight">
                            GhostSweep
                        </span>
                    </div>
                </Link>
                {showNav &&
                <nav className="hidden items-center gap-6 text-xs text-muted-foreground sm:flex">
                    <a href="#how" className="hover:text-foreground transition-colors">
                        How it works
                    </a>
                    <a
                        href="#security"
                        className="hover:text-foreground transition-colors"
                    >
                        Security
                    </a>
                    <a
                        href="#pricing"
                        className="hover:text-foreground transition-colors"
                    >
                        Pricing
                    </a>
                    <a href="#faq" className="hover:text-foreground transition-colors">
                        FAQ
                    </a>
                </nav>}
                <div className="flex items-center gap-2">
                    <Link
                        href="/login"
                        className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                        Log in
                    </Link>
                    <Link
                        href="/login"
                        className="inline-flex items-center gap-1 rounded-full bg-primary px-4 py-1.5 text-xs font-medium text-primary-foreground shadow-sm hover:opacity-90 transition"
                    >
                        Start free scan
                        <ArrowRight className="h-3 w-3" />
                    </Link>
                </div>
            </div>
        </header>
    )
}