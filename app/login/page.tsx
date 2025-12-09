/* eslint-disable react/no-unescaped-entities */
"use client";

import {
    useState,
    type FormEvent,
    type Dispatch,
    type SetStateAction,
} from "react";
import { Eye, EyeOff, MailIcon, Shield, Lock } from "lucide-react";

import { Button } from "@/components/ui/button";
import Input from "@/components/ui/input";
import { Logo } from "@/svgs";
import { checkPasswordStrength } from "@/utils/password-strength-meter";
import { toast } from "sonner";
import { login, signup } from "./action";
import { Spinner } from "@/components/ui/spinner";
import Link from "next/link";

type Mode = "signin" | "signup" | "confirm";

function SignInForm({
    email,
    setEmail,
}: {
    email: string;
    setEmail: Dispatch<SetStateAction<string>>;
}) {
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            await login({ email, password });
            toast.success("Login successful");
        } catch (error: unknown) {
            console.error("Login error:", error);

            const code =
                error && typeof error === "object" && "code" in error
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    ? (error as any).code
                    : undefined;

            if (code === "invalid_credentials") {
                toast.error("Login failed. Please check your email and password.");
            } else {
                toast.error("Something went wrong. Please try again.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form className="space-y-5" onSubmit={handleLogin}>
            <div className="space-y-2">
                <label className="text-sm font-medium text-white/90" htmlFor="email">
                    Email
                </label>
                <Input
                    id="email"
                    type="email"
                    placeholder="example@gmail.com"
                    value={email}
                    onChange={setEmail}
                    required
                    className="h-12 rounded-lg border-white/10 bg-white/5 backdrop-blur-sm text-white placeholder:text-white/40 focus:border-primary focus:ring-primary/20"
                />
            </div>

            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-white/90" htmlFor="password">
                        Password
                    </label>
                    <Link
                        href="/forgot-password"
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
                        className="h-12 rounded-lg border-white/10 bg-white/5 backdrop-blur-sm text-white placeholder:text-white/40 focus:border-primary focus:ring-primary/20 pr-10"
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

            <Button
                type="submit"
                className="h-12 w-full rounded-lg bg-white text-black font-semibold hover:bg-white/90 transition-all duration-200 hover:scale-[1.02] shadow-lg shadow-white/20"
                disabled={isLoading}
            >
                {isLoading ? <Spinner /> : "Sign in"}
            </Button>

            <p className="text-center text-xs text-white/40 leading-relaxed">
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

    const handleSignup = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            toast.error("Passwords do not match.");
            return;
        }

        const { feedback } = checkPasswordStrength(password);
        setPasswordFeedback(feedback);

        if (feedback.length > 0) {
            setShowPasswordWarning(true);
            toast.error("Password is too weak. Please choose a stronger password.");
            return;
        }

        setShowPasswordWarning(false);
        setIsLoading(true);

        try {
            await signup({ email, password });
            setMode("confirm");
        } catch (error) {
            console.error("Signup error:", error);
            toast.error("An error occurred during signup. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form className="space-y-5" onSubmit={handleSignup}>
            <div className="space-y-2">
                <label className="text-sm font-medium text-white/90" htmlFor="email">
                    Email
                </label>
                <Input
                    id="email"
                    type="email"
                    placeholder="example@gmail.com"
                    value={email}
                    onChange={setEmail}
                    required
                    className="h-12 rounded-lg border-white/10 bg-white/5 backdrop-blur-sm text-white placeholder:text-white/40 focus:border-primary focus:ring-primary/20"
                />
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium text-white/90" htmlFor="password">
                    Password
                </label>
                <div className="relative">
                    <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Create a password"
                        value={password}
                        onChange={setPassword}
                        required
                        disableCopyPaste
                        className="h-12 rounded-lg border-white/10 bg-white/5 backdrop-blur-sm text-white placeholder:text-white/40 focus:border-primary focus:ring-primary/20 pr-10"
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
                <label className="text-sm font-medium text-white/90" htmlFor="confirmPassword">
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
                    className="h-12 rounded-lg border-white/10 bg-white/5 backdrop-blur-sm text-white placeholder:text-white/40 focus:border-primary focus:ring-primary/20"
                />
            </div>

            {showPasswordWarning && <PasswordWarning feedback={passwordFeedback} />}

            <Button
                type="submit"
                className="h-12 w-full rounded-lg bg-white text-black font-semibold hover:bg-white/90 transition-all duration-200 hover:scale-[1.02] shadow-lg shadow-white/20"
                disabled={isLoading}
            >
                {isLoading ? <Spinner /> : "Create account"}
            </Button>

            <p className="text-center text-xs text-white/40 leading-relaxed">
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
    );
}

function PasswordWarning({ feedback }: { feedback: string[] }) {
    return (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3">
            <ul className="space-y-1">
                {feedback.map((msg, index) => (
                    <li key={index} className="flex items-start gap-2 text-xs text-red-400">
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
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/20 backdrop-blur-sm">
                <MailIcon className="h-10 w-10 text-primary" />
            </div>
            <div className="space-y-3">
                <h2 className="text-2xl font-bold text-white">Check your email</h2>
                <p className="text-sm text-white/60 max-w-md leading-relaxed">
                    We've sent a confirmation link to{" "}
                    <span className="font-semibold text-white">{email}</span>.
                    Click the link to verify your account and get started.
                </p>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/5 backdrop-blur-sm p-4 max-w-md">
                <p className="text-xs text-white/50">
                    Didn't receive the email? Check your spam folder or{" "}
                    <button className="text-primary hover:text-primary/80 transition underline">
                        resend confirmation
                    </button>
                </p>
            </div>
        </div>
    );
}

export default function LoginPage() {
    const [mode, setMode] = useState<Mode>("signin");
    const [email, setEmail] = useState("");

    return (
        <div className="fixed flex min-h-screen w-full overflow-hidden bg-gradient-to-b from-black via-black to-zinc-950">
            <div className="grid flex-1 grid-cols-1 lg:grid-cols-2">
                {/* Left Side - Branding */}
                <div className="hidden lg:flex relative overflow-hidden">
                    {/* Background with gradient overlay */}
                    <div
                        className="absolute inset-0"
                        style={{
                            background:
                                "linear-gradient(to bottom, rgba(0,242,222,0.1), rgba(0,0,0,0.8)),url('security.png')",
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                        }}
                    />

                    {/* Radial gradient accent */}
                    <div className="absolute inset-0 bg-gradient-radial from-emerald-500/20 via-transparent to-transparent blur-3xl" />

                    {/* Content */}
                    <div className="relative flex flex-col justify-between p-12 xl:p-16 2xl:p-24 z-10">
                        <div className="space-y-8">
                            <div className="flex items-center gap-3">
                                <Logo className="h-12 w-12" />
                                <h2 className="text-2xl font-bold text-white">GhostSweep</h2>
                            </div>

                            <div className="space-y-6 max-w-lg">
                                <h1 className="text-4xl xl:text-5xl font-bold leading-tight bg-gradient-to-b from-white to-white/80 bg-clip-text text-transparent">
                                    Sweep your digital footprint
                                </h1>
                                <p className="text-lg text-white/60 leading-relaxed">
                                    Connect your inbox, see every company that has your data, and clean up old accounts in minutes.
                                </p>
                            </div>
                        </div>

                        {/* Trust signals */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 text-white/70">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 backdrop-blur-sm">
                                    <Shield className="h-5 w-5 text-emerald-400" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-white">Read-only access</p>
                                    <p className="text-xs text-white/50">We never modify your emails</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 text-white/70">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 backdrop-blur-sm">
                                    <Lock className="h-5 w-5 text-emerald-400" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-white">Your data, your control</p>
                                    <p className="text-xs text-white/50">Disconnect anytime</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side - Login Form */}
                <div className="relative col-span-1 flex items-center justify-center overflow-y-auto p-6 sm:p-8 lg:p-12">
                    {/* Mobile Logo */}
                    <div className="absolute left-6 top-6 lg:hidden">
                        <div className="flex items-center gap-2">
                            <Logo className="h-8 w-8" />
                            <h4 className="text-xl font-bold text-white">GhostSweep</h4>
                        </div>
                    </div>

                    {/* Form Container */}
                    <div className="w-full max-w-md space-y-8 mt-20 sm:mt-0">
                        {mode === "confirm" ? (
                            <ConfirmEmail email={email} />
                        ) : (
                            <>
                                {/* Tabs */}
                                <div className="flex rounded-lg border border-white/10 bg-white/5 backdrop-blur-sm p-1">
                                    <button
                                        type="button"
                                        className={`flex-1 rounded-md py-2.5 text-sm font-medium transition-all duration-200 ${mode === "signin"
                                                ? "bg-white text-black shadow-lg"
                                                : "text-white/60 hover:text-white"
                                            }`}
                                        onClick={() => setMode("signin")}
                                    >
                                        Sign in
                                    </button>
                                    <button
                                        type="button"
                                        className={`flex-1 rounded-md py-2.5 text-sm font-medium transition-all duration-200 ${mode === "signup"
                                                ? "bg-white text-black shadow-lg"
                                                : "text-white/60 hover:text-white"
                                            }`}
                                        onClick={() => setMode("signup")}
                                    >
                                        Create account
                                    </button>
                                </div>

                                {/* Heading */}
                                <div className="space-y-2">
                                    <h2 className="text-2xl sm:text-3xl font-bold text-white">
                                        {mode === "signin" ? "Welcome back" : "Get started"}
                                    </h2>
                                    <p className="text-sm text-white/60">
                                        {mode === "signin"
                                            ? "Sign in to manage your digital footprint"
                                            : "Create an account to see who has your data"}
                                    </p>
                                </div>

                                {/* Form */}
                                {mode === "signin" ? (
                                    <SignInForm email={email} setEmail={setEmail} />
                                ) : (
                                    <SignUpForm
                                        email={email}
                                        setEmail={setEmail}
                                        setMode={setMode}
                                    />
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}