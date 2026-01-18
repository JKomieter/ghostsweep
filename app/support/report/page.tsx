// app/support/report/page.tsx
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Bug, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import Input from "@/components/ui/input"
import { toast } from "sonner"

type IssueType =
    | "bug"
    | "incorrect-detection"
    | "breach-data"
    | "billing"
    | "login"
    | "other"

export default function ReportIssuePage() {
    const router = useRouter()
    const [issueType, setIssueType] = useState<IssueType>("bug")
    const [summary, setSummary] = useState("")
    const [details, setDetails] = useState("")
    const [email, setEmail] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)
        setSuccess(null)

        if (!summary.trim() || !details.trim()) {
            setError("Please provide a short summary and some details about the issue.")
            return
        }

        try {
            setIsSubmitting(true)

            // You can wire this to a Supabase function or an API route
            const res = await fetch("/api/support/report", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    issueType,
                    summary,
                    details,
                    email: email || null,
                }),
            })

            if (!res.ok) {
                throw new Error("Failed to submit issue")
            }

            setSuccess("Thanks — your report has been received.")
            setSummary("")
            setDetails("")
            setEmail("")
            toast.success("Thanks — your report has been received.")
            // Optional: redirect after a delay
            // setTimeout(() => router.push("/dashboard"), 1500)
        } catch (err) {
            console.error(err)
            setError("Something went wrong while sending your report. Please try again.")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <main className="min-h-screen bg-background text-foreground">
            <div className="mx-auto max-w-2xl px-4 py-12 space-y-8">
                {/* Back link */}
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                    <ArrowLeft className="h-3 w-3" />
                    Back
                </button>

                {/* Header */}
                <header className="space-y-3 border-b border-white/5 pb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <Bug className="h-5 w-5 text-primary" />
                        </div>
                        <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                            Report an issue
                        </p>
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        Something not working?
                    </h1>
                    <p className="max-w-xl text-sm text-muted-foreground leading-relaxed">
                        We take bug reports seriously. Tell us what went wrong, and we&apos;ll investigate right away. The more detail you share, the faster we can fix it.
                    </p>
                </header>

                {/* Form card */}
                <form
                    onSubmit={handleSubmit}
                    className="space-y-6 rounded-xl border border-white/10 bg-[#050505] p-6 md:p-8"
                >
                    {/* Issue type */}
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-foreground block">
                            What&apos;s the issue?
                        </label>
                        <Select
                            value={issueType}
                            onValueChange={(value) => setIssueType(value as IssueType)}
                        >
                            <SelectTrigger className="h-10 text-sm">
                                <SelectValue placeholder="Select an issue type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="bug">🐛 Bug / Something is broken</SelectItem>
                                <SelectItem value="incorrect-detection">
                                    🔍 Incorrect service detection
                                </SelectItem>
                                <SelectItem value="breach-data">
                                    ⚠️ Breach result seems wrong
                                </SelectItem>
                                <SelectItem value="billing">💳 Billing / Subscription issue</SelectItem>
                                <SelectItem value="login">🔐 Login / Gmail connection issue</SelectItem>
                                <SelectItem value="other">❓ Something else</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Summary */}
                    <div className="space-y-2">
                        <label htmlFor="summary" className="text-sm font-semibold text-foreground block">
                            Brief summary <span className="text-red-400">*</span>
                        </label>
                        <Input
                            id="summary"
                            placeholder="e.g., 'Sweep reports 0 services but I know I have connected accounts'"
                            className="h-10 text-sm"
                            value={summary}
                            onChange={setSummary}
                        />
                        <p className="text-xs text-muted-foreground">
                            Keep it short and specific
                        </p>
                    </div>

                    {/* Details */}
                    <div className="space-y-2">
                        <label htmlFor="details" className="text-sm font-semibold text-foreground block">
                            What happened? <span className="text-red-400">*</span>
                        </label>
                        <Textarea
                            id="details"
                            rows={6}
                            className="text-sm resize-none"
                            placeholder="Walk us through:
• What you were doing when the issue occurred
• What you expected to happen
• What actually happened instead
• Any error messages you saw
• Browser, device, and approximate time of the issue"
                            value={details}
                            onChange={(e) => setDetails(e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground">
                            More details help us fix issues faster
                        </p>
                    </div>

                    {/* Optional email */}
                    <div className="space-y-2">
                        <label htmlFor="email" className="text-sm font-semibold text-foreground block">
                            Email <span className="text-xs font-normal text-muted-foreground">(optional)</span>
                        </label>
                        <Input
                            id="email"
                            type="email"
                            className="h-10 text-sm"
                            placeholder="your@email.com"
                            value={email}
                            onChange={setEmail}
                        />
                        <p className="text-xs text-muted-foreground">
                            Only used if we need follow-up details. Signed-in users can leave this blank.
                        </p>
                    </div>

                    {/* Security notice */}
                    <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3">
                        <p className="text-xs text-amber-200">
                            <strong>⚠️ Keep it secure:</strong> Don&apos;t include passwords, full card numbers, or sensitive personal data.
                        </p>
                    </div>

                    {/* Status Messages */}
                    {error && (
                        <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-3">
                            <p className="text-sm text-red-400">
                                {error}
                            </p>
                        </div>
                    )}
                    {success && (
                        <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3">
                            <p className="text-sm text-emerald-400">
                                ✓ {success}
                            </p>
                        </div>
                    )}

                    {/* Submit Button */}
                    <Button
                        type="submit"
                        size="lg"
                        className="w-full text-base font-semibold"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? "Sending…" : "Submit report"}
                    </Button>
                </form>

                {/* Extra guidance */}
                <section className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-6">
                    <div className="space-y-3">
                        <p className="font-semibold text-foreground text-sm flex items-center gap-2">
                            🚨 Urgent issues?
                        </p>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            For account access or billing emergencies, email us directly at{" "}
                            <a
                                href="mailto:support@ghostsweep.com?subject=GhostSweep%20Urgent%20Issue"
                                className="text-blue-400 hover:text-blue-300 font-semibold underline"
                            >
                                support@ghostsweep.com
                            </a>
                            {" "}and we&apos;ll get back to you ASAP.
                        </p>
                    </div>
                </section>
            </div>
        </main>
    )
}