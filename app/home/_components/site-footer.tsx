import Link from "next/link";
import { Instagram, Music2 } from "lucide-react";

export default function SiteFooter() {
    return (
        <footer className="border-t border-foreground/10 py-12 bg-foreground/2">
            <div className="mx-auto max-w-5xl px-6">
                <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
                    <span className="text-foreground font-semibold tracking-tight">GhostSweep</span>

                    <p className="text-xs text-foreground/55">
                        © {new Date().getFullYear()} GhostSweep Inc. Privacy-first.
                    </p>

                    <div className="flex flex-wrap justify-center items-center gap-6 text-sm text-foreground/60">
                        <Link href="/about" className="hover:text-foreground transition">About</Link>
                        <Link href="/home/privacy" className="hover:text-foreground transition">Privacy</Link>
                        <Link href="/home/terms" className="hover:text-foreground transition">Terms</Link>
                        <Link href="/home/security" className="hover:text-foreground transition">Security</Link>
                        <Link href="mailto:support@ghostsweep.com" className="hover:text-foreground transition">Support</Link>
                        <div className="flex items-center gap-4 border-l border-foreground/10 pl-6">
                            <Link
                                href="https://www.instagram.com/ghost_sweep/"
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="GhostSweep on Instagram"
                                className="hover:text-foreground transition"
                            >
                                <Instagram className="h-4 w-4" />
                            </Link>
                            <Link
                                href="https://www.tiktok.com/@ghostsweep_?lang=en"
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="GhostSweep on TikTok"
                                className="hover:text-foreground transition"
                            >
                                <Music2 className="h-4 w-4" />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
