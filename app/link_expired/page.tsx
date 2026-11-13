import type { Metadata } from "next"
import Link from "next/link"
import { Clock } from "lucide-react"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
    title: "Link expired | GhostSweep",
    robots: { index: false, follow: false },
}

type LinkCopy = { title: string; body: string; actionLabel: string; actionHref: string }

// Email links (sign-up confirmation, password reset, email change) are single-use and short-lived.
// Supabase reports expired and already-used links with the same error, so the copy covers both.
function copyFor(type: string | undefined, reason: string | undefined): LinkCopy {
    const problem = reason === "invalid" ? "is invalid" : "has expired or has already been used"

    switch (type) {
        case "recovery":
            return {
                title: "Password reset link expired",
                body: `This password reset link ${problem}. For your security, reset links only work once and expire after a short time. Request a new one to continue.`,
                actionLabel: "Request a new reset link",
                actionHref: "/forgot_password",
            }
        case "email_change":
            return {
                title: "Email change link expired",
                body: `This email change link ${problem}. Sign in and request the email change again from your account settings.`,
                actionLabel: "Go to sign in",
                actionHref: "/login",
            }
        case "signup":
        case "invite":
        case "magiclink":
        case "email":
            return {
                title: "Confirmation link expired",
                body: `This confirmation link ${problem}. Create your account again with the same email address and we'll send you a new link. If you already confirmed your email, just sign in.`,
                actionLabel: "Get a new confirmation link",
                actionHref: "/login?mode=signup",
            }
        default:
            return {
                title: "This link has expired",
                body: `This link ${problem}. Email links only work once and expire after a short time. Please request a new one.`,
                actionLabel: "Go to sign in",
                actionHref: "/login",
            }
    }
}

export default async function LinkExpiredPage({
    searchParams,
}: {
    searchParams: Promise<{ type?: string; reason?: string }>
}) {
    const { type, reason } = await searchParams
    const copy = copyFor(type, reason)

    return (
        <main className="min-h-screen flex items-center justify-center bg-background text-foreground px-4">
            <div className="w-full max-w-md text-center flex flex-col items-center gap-6">
                <div className="bg-amber-500/10 p-4 rounded-full border border-amber-500/20">
                    <Clock className="h-10 w-10 text-amber-700 dark:text-amber-300" />
                </div>

                <h1 className="text-2xl font-light tracking-tight text-foreground">{copy.title}</h1>

                <p className="text-foreground/60 text-sm leading-relaxed">{copy.body}</p>

                <div className="flex flex-col gap-3 w-full">
                    <Link href={copy.actionHref} className="w-full">
                        <Button className="w-full bg-foreground text-background hover:bg-foreground/90 font-light">
                            {copy.actionLabel}
                        </Button>
                    </Link>
                    <Link href="/login" className="w-full">
                        <Button
                            variant="outline"
                            className="w-full text-sm border-foreground/5 bg-foreground/2 hover:bg-foreground/3 hover:border-foreground/10 font-light text-foreground"
                        >
                            Back to sign in
                        </Button>
                    </Link>
                </div>

                <p className="text-xs text-foreground/60">
                    Still having trouble?{" "}
                    <Link href="/help" className="text-foreground hover:underline font-light">
                        Visit Help Center
                    </Link>
                </p>
            </div>
        </main>
    )
}
