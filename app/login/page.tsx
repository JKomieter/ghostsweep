/* eslint-disable react/no-unescaped-entities */
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
import { Eye, EyeOff, MailIcon, Lock, Shield, Gift } from "lucide-react";

import { Button } from "@/components/ui/button";
import Input from "@/components/ui/input";
import { Logo } from "@/svgs";
import { checkPasswordStrength } from "@/utils/password_strength_meter";
import { toast } from "sonner";
import { login, signup } from "./action";
import { Spinner } from "@/components/ui/spinner";
import Link from "next/link";
import HCaptcha from '@hcaptcha/react-hcaptcha'

// ✅ add your supabase client import (adjust path to your project)
import { createClient } from "@/utils/supabase/client";

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
            <div className="h-px flex-1 bg-white/5" />
            <span className="text-[11px] text-white/40">or</span>
            <div className="h-px flex-1 bg-white/5" />
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
            className="h-11 w-full rounded-lg border-white/5 bg-white/2 text-white hover:bg-white/3 hover:border-white/10"
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
                toast.error(result.error || "Login failed");

                // Show CAPTCHA if backend indicates it's needed
                if (result.shouldShowCaptcha) {
                    setShouldShowCaptcha(true);
                    setCaptchaToken(null);
                }
            } else {
                toast.success("Login successful");
                // Reset CAPTCHA state on success
                setShouldShowCaptcha(false);
                setCaptchaToken(null);

                // Redirect after a brief delay to allow toast to show
                setTimeout(() => {
                    router.push("/dashboard");
                }, 500);
            }
        } catch (error: unknown) {
            console.error("Login error:", error);

            let message = "An unexpected error occurred. Please try again.";

            if (error instanceof Error) {
                message = error.message;
            }

            setErrorMessage(message);
            toast.error(message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-5">
            {/* ✅ Google OAuth */}
            <ContinueWithGoogleButton label="Continue with Google" />
            <OAuthDivider />

            {/* ✅ Error Message Display */}
            {errorMessage && (
                <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3">
                    <p className="text-sm text-red-400">{errorMessage}</p>
                </div>
            )}

            {/* ✅ Existing email+password form */}
            <form className="space-y-5" onSubmit={handleLogin}>
                <div className="space-y-2">
                    <label className="text-sm font-light text-white/70" htmlFor="email">
                        Email
                    </label>
                    <Input
                        id="email"
                        type="email"
                        placeholder="example@gmail.com"
                        value={email}
                        onChange={setEmail}
                        required
                        className="h-11 rounded-lg border-white/5 bg-white/2 backdrop-blur-sm text-white placeholder:text-white/40 focus:border-primary focus:ring-primary/20"
                    />
                </div>

                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <label className="text-sm font-light text-white/70" htmlFor="password">
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
                            disableCopyPaste
                            className="h-11 rounded-lg border-white/5 bg-white/2 backdrop-blur-sm text-white placeholder:text-white/40 focus:border-primary focus:ring-primary/20 pr-10"
                        />
                        <button
                            className="absolute inset-y-0 right-0 flex items-center pr-3"
                            type="button"
                            onClick={() => setShowPassword((prev) => !prev)}
                        >
                            {showPassword ? (
                                <EyeOff className="h-4 w-4 text-white/40 hover:text-white/60 transition" />
                            ) : (
                                <Eye className="h-4 w-4 text-white/40 hover:text-white/60 transition" />
                            )}
                        </button>
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
                    className="h-11 w-full rounded-lg bg-white text-black text-sm font-light hover:bg-white/90 transition-all duration-200 hover:scale-[1.02] shadow-lg shadow-emerald-500/20"
                    disabled={isLoading || (shouldShowCaptcha && !captchaToken)}
                >
                    {isLoading ? <Spinner /> : "Sign In"}
                </Button>

                <p className="text-center text-[11px] text-white/40 leading-relaxed">
                    By continuing, you agree to our{" "}
                    <Link
                        href="/home/terms"
                        className="text-white/60 hover:text-white transition underline-offset-2 hover:underline"
                    >
                        Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link
                        href="/home/privacy"
                        className="text-white/60 hover:text-white transition underline-offset-2 hover:underline"
                    >
                        Privacy Policy
                    </Link>
                    .
                </p>
            </form>
        </div>
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
    const [showPasswordWarning, setShowPasswordWarning] = useState(false);
    const [passwordFeedback, setPasswordFeedback] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [captchaToken, setCaptchaToken] = useState<string | null>(null);
    const captchaRef = useRef<HCaptcha>(null);

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

        if (password !== confirmPassword) {
            const msg = "Passwords do not match.";
            setErrorMessage(msg);
            toast.error(msg);
            return;
        }

        const { feedback } = checkPasswordStrength(password);
        setPasswordFeedback(feedback);

        if (feedback.length > 0) {
            setShowPasswordWarning(true);
            const msg = "Password is too weak. Please choose a stronger password.";
            setErrorMessage(msg);
            toast.error(msg);
            return;
        }

        setShowPasswordWarning(false);
        setIsLoading(true);

        try {
            const result = await signup({ email, password, captchaToken });
            captchaRef.current?.resetCaptcha()
            if (!result.success) {
                setErrorMessage(result.error || "An error occurred during signup. Please try again.");
                toast.error(result.error || "Signup failed");
            } else {
                toast.success("Account created successfully! Check your email to confirm.");
                setMode("confirm");
            }
        } catch (error) {
            console.error("Signup error:", error);
            let message = "An error occurred during signup. Please try again.";
            
            if (error instanceof Error) {
                message = error.message;
            }
            
            setErrorMessage(message);
            toast.error(message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-5">
            {/* ✅ Google OAuth for signup too */}
            <ContinueWithGoogleButton label="Continue with Google" />
            <OAuthDivider />

            {/* ✅ Error Message Display */}
            {errorMessage && (
                <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3">
                    <p className="text-sm text-red-300">{errorMessage}</p>
                </div>
            )}

            {/* ✅ Existing signup form */}
            <form className="space-y-5" onSubmit={handleSignup}>
                <div className="space-y-2">
                    <label className="text-sm font-light text-white/70" htmlFor="email">
                        Email
                    </label>
                    <Input
                        id="email"
                        type="email"
                        placeholder="example@gmail.com"
                        value={email}
                        onChange={setEmail}
                        required
                        className="h-11 rounded-lg border-white/5 bg-white/2 backdrop-blur-sm text-white placeholder:text-white/40 focus:border-primary focus:ring-primary/20"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-light text-white/70" htmlFor="password">
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
                            disableCopyPaste
                            className="h-11 rounded-lg border-white/5 bg-white/2 backdrop-blur-sm text-white placeholder:text-white/40 focus:border-primary focus:ring-primary/20 pr-10"
                        />
                        <button
                            className="absolute inset-y-0 right-0 flex items-center pr-3"
                            type="button"
                            onClick={() => setShowPassword((prev) => !prev)}
                        >
                            {showPassword ? (
                                <EyeOff className="h-4 w-4 text-white/40 hover:text-white/60 transition" />
                            ) : (
                                <Eye className="h-4 w-4 text-white/40 hover:text-white/60 transition" />
                            )}
                        </button>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-light text-white/70" htmlFor="confirmPassword">
                        Confirm password
                    </label>
                    <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="Repeat your password"
                        value={confirmPassword}
                        onChange={setConfirmPassword}
                        required
                        disableCopyPaste
                        className="h-11 rounded-lg border-white/5 bg-white/2 backdrop-blur-sm text-white placeholder:text-white/40 focus:border-primary focus:ring-primary/20"
                    />
                </div>


                {showPasswordWarning && <PasswordWarning feedback={passwordFeedback} />}

                <HCaptcha
                    sitekey={process.env.NEXT_PUBLIC_HCAPTCHA_SITEKEY!}
                    onVerify={(token) => setCaptchaToken(token)}
                    ref={captchaRef}
                />
                
                <Button
                    type="submit"
                    className="h-11 w-full rounded-lg bg-white text-black text-sm font-light hover:bg-white/90 transition-all duration-200 hover:scale-[1.02] shadow-lg shadow-emerald-500/20"
                    disabled={isLoading}
                >
                    {isLoading ? <Spinner /> : "See My Forgotten Accounts"}
                </Button>

                <p className="text-center text-[11px] text-white/40 leading-relaxed">
                    By continuing, you agree to our{" "}
                    <Link
                        href="/home/terms"
                        className="text-white/60 hover:text-white transition underline-offset-2 hover:underline"
                    >
                        Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link
                        href="/home/privacy"
                        className="text-white/60 hover:text-white transition underline-offset-2 hover:underline"
                    >
                        Privacy Policy
                    </Link>
                    .
                </p>
            </form>
        </div>
    );
}

function PasswordWarning({ feedback }: { feedback: string[] }) {
    return (
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3">
            <ul className="space-y-1">
                {feedback.map((msg, index) => (
                    <li key={index} className="flex items-start gap-2 text-xs text-red-300">
                        <span className="mt-0.5">•</span>
                        <span>{msg}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
}

function ConfirmEmail({ email = "email address" }: { email?: string }) {
    return (
        <div className="flex flex-col items-center justify-center text-center space-y-6">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/15 border border-primary/20 backdrop-blur-sm">
                <MailIcon className="h-10 w-10 text-primary" />
            </div>
            <div className="space-y-3">
                <h2 className="text-2xl font-light text-white">Check your email</h2>
                <p className="text-sm text-white/60 max-w-md leading-relaxed">
                    We've sent a confirmation link to{" "}
                    <span className="font-light text-white">{email}</span>. Click the link
                    to verify your account and get started.
                </p>
            </div>
            <div className="rounded-lg border border-white/5 bg-white/2 backdrop-blur-sm p-4 max-w-md text-left">
                <p className="text-xs text-white/50">
                    Didn&apos;t receive the email? Check your spam folder or{" "}
                    <button className="text-primary hover:text-primary/80 transition underline underline-offset-2">
                        resend confirmation
                    </button>
                    .
                </p>
            </div>
        </div>
    );
}

function LoginContent() {
    const searchParams = useSearchParams();
    const referralCode = searchParams.get("ref");
    const hasReferral = Boolean(referralCode);
    const [mode, setMode] = useState<Mode>(() =>
        hasReferral ? "signup" : "signin"
    );
    const [email, setEmail] = useState("");

    useEffect(() => {
        if (referralCode) {
            localStorage.setItem("referral_code", referralCode);
        }
    }, [referralCode]);

    return (
        <div className="relative flex min-h-screen w-full overflow-hidden bg-[#050505]">
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute -left-40 top-[-10%] h-80 w-80 rounded-full bg-emerald-500/10 blur-3xl" />
                <div className="absolute right-[-10%] bottom-[-10%] h-80 w-80 rounded-full bg-cyan-500/10 blur-3xl" />
            </div>
            {/* (snip) */}
            <div className="relative z-10 grid flex-1 grid-cols-1 lg:grid-cols-2">
                {/* Left side */}
                {/* Left Side - Branding */}
                <div className="hidden lg:flex relative overflow-hidden border-r border-white/5">
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
                            <div className="flex items-center gap-3">
                                <Logo className="h-11 w-11" />
                                <div>
                                    <h2 className="text-2xl font-light text-white">GhostSweep</h2>
                                    <p className="text-xs text-white/60">
                                        Privacy, visibility, and control.
                                    </p>
                                </div>
                            </div>

                            {/* Hero copy */}
                            <div className="space-y-5 max-w-lg">
                                <h1 className="text-4xl xl:text-5xl font-light leading-tight bg-linear-to-b from-white to-white/70 bg-clip-text text-transparent">
                                    Sweep your digital footprint clean.
                                </h1>
                                <p className="text-sm md:text-base text-white/60 leading-relaxed">
                                    Connect your inbox, see every company that has your data, and
                                    send deletion requests in minutes—without hunting through old
                                    emails.
                                </p>
                            </div>
                        </div>

                        {/* Trust / security badges */}
                        <div className="space-y-4 max-w-sm">
                            <div className="flex items-center gap-3 text-white/80">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-black/40 border border-white/5 backdrop-blur-sm">
                                    <Shield className="h-5 w-5 text-emerald-400" />
                                </div>
                                <div className="space-y-0.5">
                                    <p className="text-sm font-light text-white">
                                        Read-only inbox access
                                    </p>
                                    <p className="text-[11px] text-white/55">
                                        GhostSweep never sends emails or deletes messages on your
                                        behalf.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 text-white/80">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-black/40 border border-white/5 backdrop-blur-sm">
                                    <Lock className="h-5 w-5 text-emerald-400" />
                                </div>
                                <div className="space-y-0.5">
                                    <p className="text-sm font-light text-white">
                                        Your data, your control
                                    </p>
                                    <p className="text-[11px] text-white/55">
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
                        <div className="flex items-center gap-2">
                            <Logo className="h-7 w-7" />
                            <h4 className="text-lg font-light text-white">GhostSweep</h4>
                        </div>
                    </div>

                    <div className="w-full max-w-md">
                        {hasReferral && (
                            <div className="mb-6 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-emerald-100 shadow-lg shadow-emerald-500/10">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500/20">
                                        <Gift className="h-5 w-5 text-emerald-400" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm font-semibold">Referral link active!</p>
                                        <p className="text-[12px] text-emerald-100/70">
                                            Create an account now to lock in your <span className="text-emerald-400 font-semibold">50% discount</span> on GhostSweep Pro.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div className="mt-16 sm:mt-10 rounded-lg border border-white/5 bg-white/2 backdrop-blur-xl p-6 sm:p-7 shadow-[0_18px_60px_rgba(0,0,0,0.75)] space-y-7">
                            {mode === "confirm" ? (
                                <ConfirmEmail email={email} />
                            ) : (
                                <>
                                    <div className="flex rounded-full border border-white/5 bg-white/2 backdrop-blur-sm p-1">
                                        <button
                                            type="button"
                                            className={`flex-1 rounded-full py-2.5 text-xs sm:text-sm font-light transition-all duration-200 ${mode === "signin"
                                                    ? "bg-white text-black shadow shadow-emerald-400/30"
                                                    : "text-white/60 hover:text-white"
                                                }`}
                                            onClick={() => setMode("signin")}
                                        >
                                            Sign in
                                        </button>
                                        <button
                                            type="button"
                                            className={`flex-1 rounded-full py-2.5 text-xs sm:text-sm font-light transition-all duration-200 ${mode === "signup"
                                                    ? "bg-white text-black shadow shadow-emerald-400/30"
                                                    : "text-white/60 hover:text-white"
                                                }`}
                                            onClick={() => setMode("signup")}
                                        >
                                            Create account
                                        </button>
                                    </div>

                                    <div className="space-y-1.5">
                                        <h2 className="text-2xl sm:text-3xl font-light text-white tracking-tight">
                                            {mode === "signin" ? "Welcome back" : "Create your account"}
                                        </h2>
                                        <p className="text-sm text-white/60">
                                            {mode === "signin"
                                                ? "Sign in to manage your digital footprint and privacy requests."
                                                : "Get a clear map of who has your data—and start cleaning it up."}
                                        </p>
                                    </div>

                                    {mode === "signin" ? (
                                        <SignInForm email={email} setEmail={setEmail} />
                                    ) : (
                                        <SignUpForm email={email} setEmail={setEmail} setMode={setMode} />
                                    )}
                                </>
                            )}
                        </div>

                        <p className="mt-4 text-[11px] text-center text-white/35">
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
            <div className="flex min-h-screen items-center justify-center bg-[#050505]">
                <Spinner />
            </div>
        }>
            <LoginContent />
        </Suspense>
    );
}