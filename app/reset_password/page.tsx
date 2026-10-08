"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import Input from "@/components/ui/input"
import { toast } from "sonner"

const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{8,}$/

export default function ResetPasswordPage() {
    const supabase = createClient()
    const router = useRouter()
    // const searchParams = useSearchParams()

    const [newPassword, setNewPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [passwordError, setPasswordError] = useState<string | null>(null)
    const [generalError, setGeneralError] = useState<string | null>(null)
    const [successMessage, setSuccessMessage] = useState<string | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isCheckingSession, setIsCheckingSession] = useState(true)

    // Optional: check that we actually have a valid session (for recovery links)
    useEffect(() => {
        const checkSession = async () => {
            const { data, error } = await supabase.auth.getUser()
            if (error || !data.user) {
                // If there is no user, this link may be invalid/expired
                // You can either:
                // - show an error, or
                // - let them still try (Supabase may still allow updateUser if session is valid)
                setGeneralError(
                    "This reset link may be invalid or expired. Try requesting a new password reset email."
                )
            }
            setIsCheckingSession(false)
        }

        // If you added any custom query params (like token_hash/type) you can read them:
        // const tokenHash = searchParams.get("token_hash")
        // const type = searchParams.get("type")
        // For standard Supabase recovery links, a session will already be set.
        checkSession()
    }, [supabase])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setPasswordError(null)
        setGeneralError(null)
        setSuccessMessage(null)

        if (!passwordRegex.test(newPassword)) {
            setPasswordError(
                "Password must be at least 8 characters, with one uppercase, one lowercase, one number, and one special character."
            )
            return
        }

        if (newPassword !== confirmPassword) {
            setPasswordError("Passwords do not match.")
            return
        }

        setIsSubmitting(true)

        try {
            // For both:
            // - logged-in user changing password
            // - user coming from a Supabase recovery link
            // this will update the current user's password.
            const { error } = await supabase.auth.updateUser({
                password: newPassword,
            })

            if (error) {
                console.error("Error updating password:", error)
                setGeneralError("Could not reset password. This link may have expired.")
                return
            }

            // Clear form
            setNewPassword("")
            setConfirmPassword("")

            toast.success("Password updated successfully.")

            // Redirect the user directly to dashboard
            router.push("/dashboard")
        } catch (err) {
            console.error(err)
            setGeneralError("Something went wrong. Please try again.")
        } finally {
            setIsSubmitting(false)
        }
    }

    if (isCheckingSession) {
        return (
            <main className="min-h-screen flex items-center justify-center bg-background text-foreground">
                <div className="flex items-center gap-2 text-sm text-foreground/60">
                    <Spinner className="text-foreground" />
                    Checking reset link…
                </div>
            </main>
        )
    }

    return (
        <main className="min-h-screen flex items-center justify-center bg-background text-foreground px-4">
            <div className="w-full max-w-md rounded-lg border border-foreground/5 bg-foreground/2 p-6 shadow-lg backdrop-blur-xl">
                <div className="mb-4 space-y-1">
                    <p className="text-[11px] font-light uppercase tracking-widest text-foreground/40">
                        Reset password
                    </p>
                    <h1 className="text-xl font-light tracking-tight text-foreground">
                        Set a new password
                    </h1>
                    <p className="text-xs text-foreground/60">
                        Choose a strong password that you don&apos;t use anywhere else.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-xs font-light text-foreground/70">
                            New password
                        </label>
                        <Input
                            id="password"
                            type="password"
                            autoComplete="new-password"
                            className="h-9 text-sm"
                            value={newPassword}
                            onChange={setNewPassword}
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-light text-foreground/70">
                            Confirm new password
                        </label>
                        <Input
                            id="confirmPassword"
                            type="password"
                            autoComplete="new-password"
                            className="h-9 text-sm"
                            value={confirmPassword}
                            onChange={setConfirmPassword}
                        />
                    </div>

                    <p className="text-[11px] text-foreground/60">
                        Must be at least 8 characters and include one uppercase letter, one
                        lowercase letter, one number, and one special character.
                    </p>

                    {passwordError && (
                        <p className="text-[11px] text-red-700 dark:text-red-300">{passwordError}</p>
                    )}
                    {generalError && (
                        <p className="text-[11px] text-red-700 dark:text-red-300">{generalError}</p>
                    )}
                    {successMessage && (
                        <p className="text-[11px] text-emerald-700 dark:text-emerald-300">{successMessage}</p>
                    )}

                    <Button
                        type="submit"
                        className="mt-2 w-full bg-foreground text-background hover:bg-foreground/90 font-light"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? "Updating…" : "Reset password"}
                    </Button>

                    <p className="mt-3 text-center text-[11px] text-foreground/60">
                        If this link doesn&apos;t work, request a new reset email from the{" "}
                        <a href="/forgot_password" className="text-foreground hover:underline font-light">
                            Forgot password
                        </a>{" "}
                        page.
                    </p>
                </form>
            </div>
        </main>
    )
}