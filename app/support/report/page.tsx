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
            <div className="mx-auto max-w-2xl px-4 py-10 space-y-8">
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
                <header className="space-y-2">
                    <div className="flex items-center gap-2">
                        <Bug className="h-4 w-4 text-primary" />
                        <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                            Report an issue
                        </p>
                    </div>
                    <h1 className="text-xl font-semibold tracking-tight">
                        Something not working as expected?
                    </h1>
                    <p className="max-w-xl text-sm text-muted-foreground">
                        Tell us what went wrong so we can investigate. Include as much detail as
                        you&apos;re comfortable sharing — this helps us fix issues faster and
                        improve GhostSweep for everyone.
                    </p>
                </header>

                {/* Form card */}
                <form
                    onSubmit={handleSubmit}
                    className="space-y-4 rounded-xl border border-white/10 bg-[#050505] p-5"
                >
                    {/* Issue type */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-muted-foreground">
                            Issue type
                        </label>
                        <Select
                            value={issueType}
                            onValueChange={(value) => setIssueType(value as IssueType)}
                        >
                            <SelectTrigger className="h-9 text-xs">
                                <SelectValue placeholder="Select an issue type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="bug">Bug / something broken</SelectItem>
                                <SelectItem value="incorrect-detection">
                                    Incorrect service detection
                                </SelectItem>
                                <SelectItem value="breach-data">
                                    Breach result seems wrong
                                </SelectItem>
                                <SelectItem value="billing">Billing / subscription issue</SelectItem>
                                <SelectItem value="login">Login / Gmail connection issue</SelectItem>
                                <SelectItem value="other">Something else</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Summary */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-muted-foreground">
                            Short summary
                        </label>
                        <Input
                            placeholder="Example: Sweep says I have 0 services, but I know I have several."
                            className="h-9 text-xs"
                            value={summary}
                            onChange={setSummary}
                            id="summary"
                        />
                    </div>

                    {/* Details */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-muted-foreground">
                            What happened?
                        </label>
                        <Textarea
                            rows={5}
                            className="text-xs"
                            placeholder="Include what you were trying to do, what you expected, and what actually happened. If it helps, mention the browser, device, and approximate time."
                            value={details}
                            onChange={(e) => setDetails(e.target.value)}
                        />
                    </div>

                    {/* Optional email */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-muted-foreground">
                            Email (optional)
                        </label>
                        <Input
                            type="email"
                            className="h-9 text-xs"
                            placeholder="We’ll use this only if we need more detail."
                            value={email}
                            onChange={setEmail}
                            id="email"
                        />
                        <p className="text-[11px] text-muted-foreground">
                            If you&apos;re already signed in, you can leave this blank. We&apos;ll
                            associate the report with your account where possible.
                        </p>
                    </div>

                    {/* Status */}
                    {error && (
                        <p className="text-[11px] text-red-400">
                            {error}
                        </p>
                    )}
                    {success && (
                        <p className="text-[11px] text-emerald-400">
                            {success}
                        </p>
                    )}

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-2">
                        <p className="text-[11px] text-muted-foreground">
                            Please don&apos;t include passwords or full card numbers in your
                            description.
                        </p>
                        <Button
                            type="submit"
                            size="sm"
                            className="text-xs"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? "Sending…" : "Submit report"}
                        </Button>
                    </div>
                </form>

                {/* Extra guidance */}
                <section className="rounded-xl border border-white/10 bg-[#050505] p-4 text-[11px] text-muted-foreground">
                    <p className="font-medium text-foreground text-xs mb-1">
                        Urgent billing or access issues
                    </p>
                    <p>
                        If you&apos;re unable to access your account or have a billing-related
                        problem that needs urgent attention, you can also email us directly at{" "}
                        <a
                            href="mailto:support@ghostsweep.app?subject=GhostSweep%20Billing%20Issue"
                            className="text-primary underline"
                        >
                            support@ghostsweep.app
                        </a>
                        .
                    </p>
                </section>
            </div>
        </main>
    )
}