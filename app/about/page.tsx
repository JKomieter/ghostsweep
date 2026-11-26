import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Header from "@/app/home/_components/header";
import SiteFooter from "@/app/home/_components/site-footer";

const PAGE_URL = "https://www.ghostsweep.com/about";
const TITLE = "About GhostSweep — Why I Built It";
const DESCRIPTION =
    "GhostSweep's founder on how a forgotten online store account led to credit card fraud — and why he built a tool to find every account you forgot you made.";
const OG_IMAGE = "https://znlaksqttxokoeavwqjf.supabase.co/storage/v1/object/public/news/ghost-svgrepo-com.png";

export const metadata: Metadata = {
    title: TITLE,
    description: DESCRIPTION,
    openGraph: {
        title: TITLE,
        description: DESCRIPTION,
        url: PAGE_URL,
        type: "website",
        siteName: "GhostSweep",
        images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: "GhostSweep" }],
    },
    twitter: {
        card: "summary_large_image",
        title: TITLE,
        description: DESCRIPTION,
        images: [OG_IMAGE],
    },
    alternates: {
        canonical: PAGE_URL,
    },
};

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-background text-foreground selection:bg-emerald-500/30">
            <Header />

            <main className="py-16 sm:py-24">
                <article className="mx-auto max-w-[680px] px-6">
                    <p className="font-mono text-xs uppercase tracking-[0.12em] text-foreground/55 mb-4">
                        About
                    </p>
                    <h1 className="text-3xl sm:text-4xl font-medium text-foreground leading-tight">
                        Why I built GhostSweep
                    </h1>

                    <div className="mt-10 flex flex-col items-start gap-8 sm:flex-row sm:gap-10">
                        <div className="relative h-36 w-36 shrink-0 overflow-hidden rounded-2xl border border-foreground/10 shadow-sm sm:h-44 sm:w-44">
                            {/* TODO: add the founder photo at public/images/founder.jpg (file doesn't exist yet). */}
                            <Image
                                src="https://ghostsweep.t3.storage.dev/f1789004-4f47-4d23-a5c9-d66f62e532f3.jpg"
                                alt="Joel Komieter, founder of GhostSweep"
                                fill
                                sizes="(min-width: 640px) 176px, 144px"
                                className="object-cover"
                                priority
                            />
                        </div>

                        <div className="space-y-5 text-base sm:text-[17px] text-foreground/75 leading-relaxed">
                            <p>
                                In 2023, I ordered a hoodie from an online store I&rsquo;d never used
                                before. The package never arrived. I moved on and forgot about it,
                                including the account I&rsquo;d made there.
                            </p>
                            <p>
                                A few months later, my bank flagged suspicious activity on my credit
                                card. Someone was trying to use my card details, and the trail led
                                back to that store.
                            </p>
                        </div>
                    </div>

                    <div className="mt-5 space-y-5 text-base sm:text-[17px] text-foreground/75 leading-relaxed">
                        <p>
                            That scared me enough to go digging. I searched my inbox for every online
                            store I&rsquo;d signed up for and stopped counting at 15. Then I found all
                            the other accounts: apps I&rsquo;d tried once, newsletters, services I
                            didn&rsquo;t even remember. Every one of them still had my details, and I
                            had no idea which were safe.
                        </p>
                        <p>
                            There was no simple way to see it all in one place, so I built one.
                            GhostSweep started as a tool to clean up my own digital footprint. Now it
                            helps you find your forgotten accounts, see which ones are risky and close
                            them before someone else uses them.
                        </p>
                    </div>

                    <p className="mt-8 text-sm text-foreground/60">
                        &mdash; <span className="font-semibold text-foreground">Joel Komieter</span>,
                        founder of GhostSweep, Takoradi, Ghana
                    </p>

                    <div className="mt-12 border-t border-foreground/10 pt-10 text-center sm:text-left">
                        <Link
                            href="/login?mode=signup"
                            className="group inline-flex items-center justify-center gap-2 rounded-md bg-primary px-7 py-3.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                        >
                            Start my free scan
                            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                        </Link>
                    </div>
                </article>
            </main>

            <SiteFooter />
        </div>
    );
}
