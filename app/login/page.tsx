"use client";

import {
    useState,
    type FormEvent,
    type Dispatch,
    type SetStateAction,
    useRef,
    useEffect,
    Suspense,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, MailIcon, Lock, Shield, Gift, Check, Circle, ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import Input from "@/components/ui/input";
import { Logo } from "@/svgs";
import { toast } from "sonner";
import { login, signup } from "./action";
import { Spinner } from "@/components/ui/spinner";
import Link from "next/link";
import HCaptcha from '@hcaptcha/react-hcaptcha'

// ✅ add your supabase client import (adjust path to your project)
import { createClient } from "@/utils/supabase/client";
import { consumePendingPlanPath, rememberPendingPlan } from "@/lib/pending-plan";
import { PASSWORD_RULES } from "@/utils/password-policy";

type Mode = "signin" | "signup" | "confirm";

// Optional: simple Google icon (no extra deps)
function GoogleIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 48 48" aria-hidden="true">
            <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303C33.58 32.66 29.197 36 24 36c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.047 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.651-.389-3.917z" />
            <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.656 16.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.047 6.053 29.268 4 24 4c-7.682 0-14.344 4.337-17.694 10.691z" />
            <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.197l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.176 0-9.545-3.318-11.275-7.946l-6.52 5.025C9.505 39.556 16.227 44 24 44z" />
            <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a11.99 11.99 0 0 1-4.084 5.565l.003-.002 6.19 5.238C36.971 40.205 44 35 44 24c0-1.341-.138-2.651-.389-3.917z" />
        </svg>
    );
}

function OAuthDivider() {
    return (
        <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-foreground/5" />
            <span className="text-[11px] text-foreground/40">or</span>
            <div className="h-px flex-1 bg-foreground/5" />
        </div>
    );
}

function ContinueWithGoogleButton({ label }: { label: string }) {
    const [loading, setLoading] = useState(false);

    const handleGoogle = async () => {
        setLoading(true);
        try {
            const supabase = createClient();

            const origin =
                typeof window !== "undefined" ? window.location.origin : "";

            // ✅ Choose where the user should land after OAuth
            // - If you have an auth callback route, point there.
            // - Otherwise, point to a page and handle session there.
            const redirectTo = `${origin}/api/auth/callback`;

            const { error } = await supabase.auth.signInWithOAuth({
                provider: "google",
                options: {
                    redirectTo,
                    // If you need refresh tokens for Gmail access, you'd use:
                    // queryParams: { access_type: "offline", prompt: "consent" },
                },
            });

            if (error) throw error;
        } catch (err) {
            console.error(err);
            toast.error("Google sign-in failed. Please try again.");
            setLoading(false);
        }
    };

    return (
        <Button
            type="button"
            variant="outline"
            className="h-11 w-full rounded-lg border-foreground/5 bg-foreground/2 text-foreground hover:bg-foreground/3 hover:border-foreground/10"
            onClick={handleGoogle}
            disabled={loading}
        >
            {loading ? (
                <span className="flex items-center gap-2">
                    <Spinner /> Redirecting…
                </span>
            ) : (
                <span className="flex items-center justify-center gap-2">
                    <GoogleIcon />
                    {label}
                </span>
            )}
        </Button>
    );
}

function SignInForm({
    email,
    setEmail,
}: {
    email: string;
    setEmail: Dispatch<SetStateAction<string>>;
}) {
    const router = useRouter();
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [shouldShowCaptcha, setShouldShowCaptcha] = useState(false);
    const [captchaToken, setCaptchaToken] = useState<string | null>(null);
    const captchaRef = useRef<HCaptcha>(null);

    const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setErrorMessage(null);

        try {
            // Only attempt login if CAPTCHA is not required or if CAPTCHA is completed
            if (shouldShowCaptcha && !captchaToken) {
                setErrorMessage("Please complete the CAPTCHA verification.");
                setIsLoading(false);
                return;
            }

            const result = await login({ email, password, captchaToken });
            captchaRef.current?.resetCaptcha()
            if (!result.success) {
                setErrorMessage(result.error || "An unexpected error occurred. Please try again.");

                // Show CAPTCHA if backend indicates it's needed
                if (result.shouldShowCaptcha) {
                    setShouldShowCaptcha(true);
                    setCaptchaToken(null);
                }
                setIsLoading(false);
            } else {
                // Keep the button busy until the dashboard takes over
                router.push(consumePendingPlanPath() ?? "/dashboard");
            }
        } catch (error: unknown) {
            console.error("Login error:", error);
            setErrorMessage(
                error instanceof Error ? error.message : "An unexpected error occurred. Please try again."
            );
            setIsLoading(false);
        }
    };

    const needsConfirmation = errorMessage?.toLowerCase().includes("confirm your email") ?? false;

    return (
        <div className="space-y-5">
            {/* ✅ Google OAuth */}
            <ContinueWithGoogleButton label="Continue with Google" />
            <OAuthDivider />

            {/* ✅ Error Message Display */}
            {errorMessage && (
                <div role="alert" className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 space-y-2">
                    <p className="text-sm text-red-600 dark:text-red-400">{errorMessage}</p>
                    {needsConfirmation && email && <ResendConfirmationButton email={email} />}
                </div>
            )}

            {/* ✅ Existing email+password form */}
            <form className="space-y-5" onSubmit={handleLogin}>
                <div className="space-y-2">
                    <label className="text-sm font-light text-foreground/70" htmlFor="email">
                        Email
                    </label>
                    <Input
                        id="email"
                        type="email"
                        placeholder="example@gmail.com"
                        value={email}
                        onChange={setEmail}
                        required
                        autoComplete="email"
                        className="h-11 rounded-lg border-foreground/5 bg-foreground/2 backdrop-blur-sm text-foreground placeholder:text-foreground/40 focus:border-primary focus:ring-primary/20"
                    />
                </div>

                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <label className="text-sm font-light text-foreground/70" htmlFor="password">
                            Password
                        </label>
                        <Link
                            href="/forgot_password"
                            className="text-xs text-primary hover:text-primary/80 transition"
                        >
                            Forgot password?
                        </Link>
                    </div>

                    <div className="relative">
                        <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter your password"
                            value={password}
                            onChange={setPassword}
                            required
                            autoComplete="current-password"
                            className="h-11 rounded-lg border-foreground/5 bg-foreground/2 backdrop-blur-sm text-foreground placeholder:text-foreground/40 focus:border-primary focus:ring-primary/20 pr-10"
                        />
                        <PasswordVisibilityToggle shown={showPassword} onToggle={() => setShowPassword((prev) => !prev)} />
                    </div>
                </div>
                {/* Show CAPTCHA after multiple failed attempts */}
                {shouldShowCaptcha && (
                    <div className="flex justify-center">
                        <HCaptcha
                            ref={captchaRef}
                            sitekey={process.env.NEXT_PUBLIC_HCAPTCHA_SITEKEY!}
                            onVerify={(token) => {
                                setCaptchaToken(token)
                            }}
                        />
                    </div>
                )}
                <Button
                    type="submit"
                    className="h-11 w-full rounded-lg bg-foreground text-background text-sm font-light hover:bg-foreground/90 transition-all duration-200 hover:scale-[1.02] shadow-lg shadow-emerald-500/20"
                    disabled={isLoading || (shouldShowCaptcha && !captchaToken)}
                >
                    {isLoading ? <Spinner /> : "Sign in"}
                </Button>

                <p className="text-center text-[11px] text-foreground/40 leading-relaxed">
                    By continuing, you agree to our{" "}
                    <Link
                        href="/home/terms"
                        className="text-foreground/60 hover:text-foreground transition underline-offset-2 hover:underline"
                    >
                        Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link
                        href="/home/privacy"
                        className="text-foreground/60 hover:text-foreground transition underline-offset-2 hover:underline"
                    >
                        Privacy Policy
                    </Link>
                    .
                </p>
            </form>
        </div>
    );
}

function PasswordVisibilityToggle({ shown, onToggle }: { shown: boolean; onToggle: () => void }) {
    return (
        <button
            className="absolute inset-y-0 right-0 flex items-center pr-3"
            type="button"
            onClick={onToggle}
            aria-label={shown ? "Hide password" : "Show password"}
        >
            {shown ? (
                <EyeOff className="h-4 w-4 text-foreground/40 hover:text-foreground/60 transition" />
            ) : (
                <Eye className="h-4 w-4 text-foreground/40 hover:text-foreground/60 transition" />
            )}
        </button>
    );
}

function PasswordRules({ password }: { password: string }) {
    return (
        <ul className="grid grid-cols-2 gap-x-3 gap-y-1 pt-1" aria-label="Password requirements">
            {PASSWORD_RULES.map((rule) => {
                const ok = rule.test(password);
                return (
                    <li
                        key={rule.label}
                        className={`flex items-center gap-1.5 text-[11px] transition-colors ${
                            ok ? "text-emerald-700 dark:text-emerald-400" : "text-foreground/50"
                        }`}
                    >
                        {ok ? <Check className="h-3 w-3" /> : <Circle className="h-3 w-3" />}
                        {rule.label}
                    </li>
                );
            })}
        </ul>
    );
}

function ResendConfirmationButton({ email }: { email: string }) {
    const [state, setState] = useState<"idle" | "sending" | "sent">("idle");

    const resend = async () => {
        setState("sending");
        const { error } = await createClient().auth.resend({ type: "signup", email });
        if (error) {
            toast.error("Couldn't resend the email", {
                description: error.message.toLowerCase().includes("rate")
                    ? "Please wait a minute before trying again."
                    : "Please try again in a moment, or contact support@ghostsweep.com.",
            });
            setState("idle");
            return;
        }
        toast.success("Confirmation email sent", { description: `Check ${email} (and your spam folder).` });
        setState("sent");
    };

    return (
        <button
            type="button"
            onClick={resend}
            disabled={state !== "idle"}
            className="text-xs font-medium text-primary hover:text-primary/80 underline underline-offset-2 transition disabled:opacity-60 disabled:no-underline"
        >
            {state === "sending" ? "Sending…" : state === "sent" ? "Email sent" : "Resend confirmation email"}
        </button>
    );
}

function SignUpForm({
    email,
    setEmail,
    setMode,
}: {
    email: string;
    setEmail: Dispatch<SetStateAction<string>>;
    setMode: Dispatch<SetStateAction<Mode>>;
}) {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [captchaToken, setCaptchaToken] = useState<string | null>(null);
    const captchaRef = useRef<HCaptcha>(null);

    const passwordOk = PASSWORD_RULES.every((rule) => rule.test(password));
    const mismatch = confirmPassword.length > 0 && confirmPassword !== password;
    const alreadyRegistered = errorMessage?.toLowerCase().includes("already registered") ?? false;

    const handleSignup = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setErrorMessage(null);

        if (typeof window !== "undefined") {
            try {
                const params = new URLSearchParams(window.location.search);
                const referralCode = params.get("ref");
                if (referralCode) {
                    localStorage.setItem("referral_code", referralCode);
                }
            } catch {
                // Ignore localStorage/query parsing errors
            }
        }

        if (!passwordOk) {
            setErrorMessage("Your password doesn't meet all the requirements yet.");
            return;
        }

        if (password !== confirmPassword) {
            setErrorMessage("Passwords do not match.");
            return;
        }

        if (!captchaToken) {
            setErrorMessage("Please complete the verification check above.");
            return;
        }

        setIsLoading(true);

        try {
            const result = await signup({ email, password, captchaToken });
            captchaRef.current?.resetCaptcha()
            setCaptchaToken(null);
            if (!result.success) {
                setErrorMessage(result.error || "An error occurred during signup. Please try again.");
            } else {
                setMode("confirm");
            }
        } catch (error) {
            console.error("Signup error:", error);
            setErrorMessage(
                error instanceof Error ? error.message : "An error occurred during signup. Please try again."
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-5">
            {/* ✅ Google OAuth for signup too */}
            <ContinueWithGoogleButton label="Sign up with Google" />
            <OAuthDivider />

            {/* ✅ Error Message Display */}
            {errorMessage && (
                <div role="alert" className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 space-y-2">
                    <p className="text-sm text-red-700 dark:text-red-300">{errorMessage}</p>
                    {alreadyRegistered && (
                        <button
                            type="button"
                            onClick={() => setMode("signin")}
                            className="text-xs font-medium text-primary hover:text-primary/80 underline underline-offset-2"
                        >
                            Sign in with {email || "this email"} instead
                        </button>
                    )}
                </div>
            )}

            {/* ✅ Existing signup form */}
            <form className="space-y-5" onSubmit={handleSignup}>
                <div className="space-y-2">
                    <label className="text-sm font-light text-foreground/70" htmlFor="email">
                        Email
                    </label>
                    <Input
                        id="email"
                        type="email"
                        placeholder="example@gmail.com"
                        value={email}
                        onChange={setEmail}
                        required
                        autoComplete="email"
                        className="h-11 rounded-lg border-foreground/5 bg-foreground/2 backdrop-blur-sm text-foreground placeholder:text-foreground/40 focus:border-primary focus:ring-primary/20"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-light text-foreground/70" htmlFor="password">
                        Password
                    </label>
                    <div className="relative">
                        <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Create a strong password"
                            value={password}
                            onChange={setPassword}
                            required
                            autoComplete="new-password"
                            className="h-11 rounded-lg border-foreground/5 bg-foreground/2 backdrop-blur-sm text-foreground placeholder:text-foreground/40 focus:border-primary focus:ring-primary/20 pr-10"
                        />
                        <PasswordVisibilityToggle shown={showPassword} onToggle={() => setShowPassword((prev) => !prev)} />
                    </div>
                    <PasswordRules password={password} />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-light text-foreground/70" htmlFor="confirmPassword">
                        Confirm password
                    </label>
                    <Input
                        id="confirmPassword"
                        type={showPassword ? "text" : "password"}
                        placeholder="Repeat your password"
                        value={confirmPassword}
                        onChange={setConfirmPassword}
                        required
                        autoComplete="new-password"
                        className="h-11 rounded-lg border-foreground/5 bg-foreground/2 backdrop-blur-sm text-foreground placeholder:text-foreground/40 focus:border-primary focus:ring-primary/20"
                    />
                    {mismatch && (
                        <p className="text-[11px] text-red-600 dark:text-red-400">Passwords don&apos;t match yet.</p>
                    )}
                </div>

                <div className="flex justify-center">
                    <HCaptcha
                        sitekey={process.env.NEXT_PUBLIC_HCAPTCHA_SITEKEY!}
                        onVerify={(token) => setCaptchaToken(token)}
                        onExpire={() => setCaptchaToken(null)}
                        ref={captchaRef}
                    />
                </div>

                <Button
                    type="submit"
                    className="h-11 w-full rounded-lg bg-foreground text-background text-sm font-light hover:bg-foreground/90 transition-all duration-200 hover:scale-[1.02] shadow-lg shadow-emerald-500/20"
                    disabled={isLoading}
                >
                    {isLoading ? <Spinner /> : "Create free account"}
                </Button>

                <p className="text-center text-[11px] text-foreground/40 leading-relaxed">
                    By continuing, you agree to our{" "}
                    <Link
                        href="/home/terms"
                        className="text-foreground/60 hover:text-foreground transition underline-offset-2 hover:underline"
                    >
                        Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link
                        href="/home/privacy"
                        className="text-foreground/60 hover:text-foreground transition underline-offset-2 hover:underline"
                    >
                        Privacy Policy
                    </Link>
                    .
                </p>
            </form>
        </div>
    );
}

function ConfirmEmail({ email, onChangeEmail }: { email: string; onChangeEmail: () => void }) {
    return (
        <div className="flex flex-col items-center justify-center text-center space-y-6">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/15 border border-primary/20 backdrop-blur-sm">
                <MailIcon className="h-10 w-10 text-primary" />
            </div>
            <div className="space-y-3">
                <h2 className="text-2xl font-light text-foreground">Check your email</h2>
                <p className="text-sm text-foreground/60 max-w-md leading-relaxed">
                    We&apos;ve sent a confirmation link to{" "}
                    <span className="font-medium text-foreground">{email || "your email address"}</span>. Click it
                    and you&apos;ll land in your dashboard, ready to connect your inbox and run your first scan.
                </p>
            </div>
            <div className="w-full rounded-lg border border-foreground/5 bg-foreground/2 backdrop-blur-sm p-4 max-w-md text-left space-y-2">
                <p className="text-xs text-foreground/50">
                    Didn&apos;t get it after a minute? Check your spam or promotions folder.
                </p>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                    {email && <ResendConfirmationButton email={email} />}
                    <button
                        type="button"
                        onClick={onChangeEmail}
                        className="text-xs text-foreground/60 hover:text-foreground underline underline-offset-2 transition"
                    >
                        Use a different email
                    </button>
                </div>
            </div>
        </div>
    );
}

function SignupSteps() {
    const steps = ["Create account", "Connect inbox", "See your accounts"];
    return (
        <ol className="flex items-center gap-2 text-[11px] text-foreground/55" aria-label="Sign-up steps">
            {steps.map((step, i) => (
                <li key={step} className="flex items-center gap-2">
                    <span
                        className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-semibold ${
                            i === 0 ? "bg-emerald-500 text-black" : "border border-foreground/15 text-foreground/50"
                        }`}
                    >
                        {i + 1}
                    </span>
                    <span className={i === 0 ? "text-foreground/80" : undefined}>{step}</span>
                    {i < steps.length - 1 && <span className="h-px w-3 bg-foreground/15" aria-hidden="true" />}
                </li>
            ))}
        </ol>
    );
}


function LoginContent() {
    const searchParams = useSearchParams();
    const referralCode = searchParams.get("ref");
    const emailParam = searchParams.get("email");
    const hasReferral = Boolean(referralCode);
    const hasEmailParam = Boolean(emailParam);
    const wantsSignup = searchParams.get("mode") === "signup";
    const [mode, setMode] = useState<Mode>(() =>
        hasReferral || hasEmailParam || wantsSignup ? "signup" : "signin"
    );
    const [email, setEmail] = useState(emailParam ?? "");

    const planParam = searchParams.get("plan");
    const authError =
        searchParams.get("error") === "oauth"
            ? "We couldn't finish signing you in with Google. Please try again, or use email and password."
            : null;

    useEffect(() => {
        if (referralCode) {
            localStorage.setItem("referral_code", referralCode);
        }
    }, [referralCode]);

    // Carry a plan picked on the pricing section through sign-up/sign-in to checkout
    useEffect(() => {
        rememberPendingPlan(planParam);
    }, [planParam]);

    return (
        <div className="relative flex min-h-screen w-full overflow-hidden bg-background">
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute -left-40 top-[-10%] h-80 w-80 rounded-full bg-emerald-500/10 blur-3xl" />
                <div className="absolute right-[-10%] bottom-[-10%] h-80 w-80 rounded-full bg-cyan-500/10 blur-3xl" />
            </div>
            {/* (snip) */}
            <div className="relative z-10 grid flex-1 grid-cols-1 lg:grid-cols-2">
                {/* Left side */}
                {/* Left Side - Branding */}
                <div className="hidden lg:flex relative overflow-hidden border-r border-foreground/5">
                    {/* Background */}
                    <div
                        className="absolute inset-0 opacity-80"
                        style={{
                            background:
                                "linear-gradient(to bottom, rgba(16,185,129,0.25), rgba(0,0,0,0.9)), url('security.png')",
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                        }}
                    />

                    {/* Extra radial glow */}
                    <div className="absolute inset-0 bg-gradient-radial from-emerald-400/30 via-transparent to-transparent blur-2xl" />

                    <div className="relative flex flex-col justify-between p-12 xl:p-16 2xl:p-20">
                        <div className="space-y-10">
                            {/* Logo */}
                            <Link href="/home" className="flex items-center gap-3 w-fit">
                                <Logo className="h-11 w-11" />
                                <div>
                                    <h2 className="text-2xl font-light text-foreground">GhostSweep</h2>
                                    <p className="text-xs text-foreground/60">
                                        Privacy, visibility, and control.
                                    </p>
                                </div>
                            </Link>

                            {/* Hero copy */}
                            <div className="space-y-5 max-w-lg">
                                <h1 className="text-4xl xl:text-5xl font-light leading-tight bg-linear-to-b from-foreground to-foreground/70 bg-clip-text text-transparent">
                                    Sweep your digital footprint clean.
                                </h1>
                                <p className="text-sm md:text-base text-foreground/60 leading-relaxed">
                                    Connect your inbox, see every company that has your data, and
                                    get the links and contacts to delete them—without hunting through old
                                    emails.
                                </p>
                            </div>
                        </div>

                        {/* Trust / security badges */}
                        <div className="space-y-4 max-w-sm">
                            <div className="flex items-center gap-3 text-foreground/80">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-background/40 border border-foreground/5 backdrop-blur-sm">
                                    <Shield className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                                </div>
                                <div className="space-y-0.5">
                                    <p className="text-sm font-light text-foreground">
                                        Read-only inbox access
                                    </p>
                                    <p className="text-[11px] text-foreground/55">
                                        GhostSweep never sends emails or deletes messages on your
                                        behalf.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 text-foreground/80">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-background/40 border border-foreground/5 backdrop-blur-sm">
                                    <Lock className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                                </div>
                                <div className="space-y-0.5">
                                    <p className="text-sm font-light text-foreground">
                                        Your data, your control
                                    </p>
                                    <p className="text-[11px] text-foreground/55">
                                        Disconnect with a click. GhostSweep forgets your tokens and
                                        stops scanning.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right side unchanged except it uses updated forms */}
                <div className="relative col-span-1 flex items-center justify-center px-5 py-10 sm:px-8 lg:px-12">
                    <div className="absolute left-5 top-5 lg:hidden">
                        <Link href="/home" className="flex items-center gap-2">
                            <Logo className="h-7 w-7" />
                            <h4 className="text-lg font-light text-foreground">GhostSweep</h4>
                        </Link>
                    </div>
                    <Link
                        href="/home"
                        className="absolute right-5 top-6 lg:left-12 lg:right-auto inline-flex items-center gap-1.5 text-xs text-foreground/55 hover:text-foreground transition"
                    >
                        <ArrowLeft className="h-3.5 w-3.5" />
                        Back to home
                    </Link>

                    <div className="w-full max-w-md">
                        {hasReferral && (
                            <div className="mb-6 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-emerald-800 dark:text-emerald-100 shadow-lg shadow-emerald-500/10">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500/20">
                                        <Gift className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm font-semibold">Referral link active!</p>
                                        <p className="text-[12px] text-emerald-800/70 dark:text-emerald-100/70">
                                            Create an account now to lock in your <span className="text-emerald-600 dark:text-emerald-400 font-semibold">50% discount</span> on GhostSweep Pro.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div className="mt-16 sm:mt-10 rounded-lg border border-foreground/5 bg-foreground/2 backdrop-blur-xl p-6 sm:p-7 shadow-[0_18px_60px_rgba(0,0,0,0.75)] space-y-7">
                            {mode === "confirm" ? (
                                <ConfirmEmail email={email} onChangeEmail={() => setMode("signup")} />
                            ) : (
                                <>
                                    <div className="flex rounded-full border border-foreground/5 bg-foreground/2 backdrop-blur-sm p-1">
                                        <button
                                            type="button"
                                            className={`flex-1 rounded-full py-2.5 text-xs sm:text-sm font-light transition-all duration-200 ${mode === "signin"
                                                    ? "bg-foreground text-background shadow shadow-emerald-400/30"
                                                    : "text-foreground/60 hover:text-foreground"
                                                }`}
                                            onClick={() => setMode("signin")}
                                        >
                                            Sign in
                                        </button>
                                        <button
                                            type="button"
                                            className={`flex-1 rounded-full py-2.5 text-xs sm:text-sm font-light transition-all duration-200 ${mode === "signup"
                                                    ? "bg-foreground text-background shadow shadow-emerald-400/30"
                                                    : "text-foreground/60 hover:text-foreground"
                                                }`}
                                            onClick={() => setMode("signup")}
                                        >
                                            Create account
                                        </button>
                                    </div>

                                    {authError && (
                                        <div role="alert" className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-600 dark:text-red-400">
                                            {authError}
                                        </div>
                                    )}

                                    <div className="space-y-1.5">
                                        <h2 className="text-2xl sm:text-3xl font-light text-foreground tracking-tight">
                                            {mode === "signin" ? "Welcome back" : "Create your free account"}
                                        </h2>
                                        <p className="text-sm text-foreground/60">
                                            {mode === "signin"
                                                ? "Sign in to manage your digital footprint and privacy requests."
                                                : "Free to start, no credit card. You'll connect your inbox next."}
                                        </p>
                                        {mode === "signup" && (
                                            <div className="pt-2">
                                                <SignupSteps />
                                            </div>
                                        )}
                                    </div>

                                    {mode === "signin" ? (
                                        <SignInForm email={email} setEmail={setEmail} />
                                    ) : (
                                        <SignUpForm email={email} setEmail={setEmail} setMode={setMode} />
                                    )}
                                </>
                            )}
                        </div>

                        <p className="mt-4 text-[11px] text-center text-foreground/35">
                            Protected with OAuth. GhostSweep never sees your email password.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={
            <div className="flex min-h-screen items-center justify-center bg-background">
                <Spinner />
            </div>
        }>
            <LoginContent />
        </Suspense>
    );
}