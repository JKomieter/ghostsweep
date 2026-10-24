import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { clampCount, shareHeadline, SITE_URL } from "@/lib/share";

type PageProps = { searchParams: Promise<{ n?: string; ref?: string }> };

// Referral codes are short alphanumerics; anything else is dropped rather than echoed into links
const cleanRef = (ref?: string) => (ref && /^[A-Za-z0-9_-]{1,64}$/.test(ref) ? ref : null);

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
    const { n } = await searchParams;
    const count = clampCount(n);
    const title = shareHeadline(count);
    const description = "GhostSweep finds every account you forgot you made, then helps you delete them. Check yours free.";
    const image = `${SITE_URL}/api/og/share?n=${count}`;
    return {
        title,
        description,
        robots: { index: false },
        openGraph: { title, description, images: [{ url: image, width: 1200, height: 630 }] },
        twitter: { card: "summary_large_image", title, description, images: [image] },
    };
}

export default async function SharePage({ searchParams }: PageProps) {
    const { n, ref } = await searchParams;
    const count = clampCount(n);
    const code = cleanRef(ref);
    const signupHref = code ? `/login?ref=${encodeURIComponent(code)}` : "/login?mode=signup";

    return (
        <main className="min-h-screen bg-background px-4 py-16 sm:py-24">
            <div className="mx-auto max-w-2xl text-center">
                <Image
                    src={`/api/og/share?n=${count}`}
                    alt={shareHeadline(count)}
                    width={1200}
                    height={630}
                    unoptimized
                    className="w-full rounded-2xl border border-foreground/10 shadow-xl"
                />
                <h1 className="mt-10 text-3xl sm:text-4xl font-semibold tracking-tight text-foreground">
                    How many ghost accounts do you have?
                </h1>
                <p className="mt-4 text-foreground/65">
                    GhostSweep scans your inbox for every account you&apos;ve signed up for, flags the breached and
                    forgotten ones, and helps you delete them.
                </p>
                {code && (
                    <p className="mt-3 text-sm font-medium text-emerald-700 dark:text-emerald-400">
                        Your friend&apos;s link gets you 50% off your first payment.
                    </p>
                )}
                <Link
                    href={signupHref}
                    className="mt-8 inline-flex items-center gap-2 rounded-full bg-emerald-500 px-8 py-4 text-base font-semibold text-black shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-400"
                >
                    Find my ghost accounts (free)
                    <ArrowRight className="h-4 w-4" />
                </Link>
            </div>
        </main>
    );
}
