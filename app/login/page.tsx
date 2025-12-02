"use client";

import {
    useState,
    type FormEvent,
    type Dispatch,
    type SetStateAction,
} from "react";
import { Eye, EyeOff, MailIcon } from "lucide-react";

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
        <form className="space-y-4" onSubmit={handleLogin}>
            <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="email">
                    Email
                </label>
                <Input
                    id="email"
                    type="email"
                    placeholder="example@gmail.com"
                    value={email}
                    onChange={setEmail}
                    required
                />
            </div>

            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <label className="text-sm font-medium" htmlFor="password">
                        Password
                    </label>
                    <Link
                        href="/forgot-password"
                        className="text-xs text-primary hover:text-primary/80"
                    >
                        Forgot password?
                    </Link>
                </div>
                <div className="relative">
                    <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder=""
                        value={password}
                        onChange={setPassword}
                        required
                        disableCopyPaste
                    />
                    <button
                        className="absolute inset-y-0 right-0 flex items-center pr-3"
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                    >
                        {showPassword ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
                    </button>
                </div>
            </div>

            <Button
                type="submit"
                className="mt-2 w-full text-sm font-medium"
                disabled={isLoading}
            >
                {isLoading ? <Spinner /> : "Sign in"}
            </Button>

            <span className="mt-3 block text-center text-[11px] text-muted-foreground">
                By continuing, you agree to our{" "}
                <Link
                    href="/home/terms"
                    className="text-xs text-primary hover:text-primary/80"
                >
                    Terms of Service
                </Link>{" "}
                and{" "}
                <Link
                    href="/home/privacy"
                    className="text-xs text-primary hover:text-primary/80"
                >
                    Privacy Policy
                </Link>
                .
            </span>
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
        <form className="space-y-4" onSubmit={handleSignup}>
            <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="email">
                    Email
                </label>
                <Input
                    id="email"
                    type="email"
                    placeholder="example@gmail.com"
                    value={email}
                    onChange={setEmail}
                    required
                />
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="password">
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
                    />
                    <button
                        className="absolute inset-y-0 right-0 flex items-center pr-3"
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                    >
                        {showPassword ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
                    </button>
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="confirmPassword">
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
                />
            </div>

            {showPasswordWarning && <PasswordWarning feedback={passwordFeedback} />}

            <Button
                type="submit"
                className="mt-2 w-full text-sm font-medium"
                disabled={isLoading}
            >
                {isLoading ? <Spinner /> : "Create account"}
            </Button>

            <span className="mt-3 block text-center text-[11px] text-muted-foreground">
                By continuing, you agree to our{" "}
                <Link
                    href="/home/terms"
                    className="text-xs text-primary hover:text-primary/80"
                >
                    Terms of Service
                </Link>{" "}
                and{" "}
                <Link
                    href="/home/privacy"
                    className="text-xs text-primary hover:text-primary/80"
                >
                    Privacy Policy
                </Link>
                .
            </span>
        </form>
    );
}

function PasswordWarning({ feedback }: { feedback: string[] }) {
    return (
        <ul className="mt-1 space-y-1">
            {feedback.map((msg, index) => (
                <li key={index} className="text-xs text-destructive">
                    {msg}
                </li>
            ))}
        </ul>
    );
}

function ConfirmEmail({ email = "email address" }: { email?: string }) {
    return (
        <div className="flex flex-col items-center justify-center">
            <MailIcon className="mb-4 h-12 w-12 text-primary" />
            <div className="text-center">
                <h2 className="mb-2 text-xl font-semibold">Confirm your email</h2>
                <p className="text-sm text-muted-foreground">
                    A confirmation link has been sent to{" "}
                    <strong>{email}</strong>. Please check your inbox and click the
                    link to verify your account.
                </p>
            </div>
        </div>
    );
}

export default function LoginPage() {
    const [mode, setMode] = useState<Mode>("signin");
    const [email, setEmail] = useState("");

    return (
        <div className="fixed flex min-h-screen w-full overflow-hidden bg-background">
            <div className="grid flex-1 grid-cols-1 lg:grid-cols-2">
                {/* Branding */}
                <div
                    className="hidden bg-neutral-700 lg:block"
                    style={{
                        background:
                            "linear-gradient(to bottom, rgba(0,242,222,0.15), rgba(0,0,0,0.6)),url('security.png')",
                    }}
                >
                    <div className="flex h-full flex-col items-start p-12 lg:p-24">
                        <h1 className="text-4xl font-bold">
                            Sweep your{" "}
                            <span className="text-primary">digital footprint</span>.
                        </h1>
                        <p className="mt-4 text-muted-foreground">
                            Connect your inbox, see every company that has your data, and
                            clean up old accounts in minutes.
                        </p>
                        <div className="mt-6 space-y-1 text-xs text-muted-foreground/80">
                            <p>• Read-only access to your inbox.</p>
                            <p>• You can disconnect and delete your data at any time.</p>
                        </div>
                    </div>
                </div>

                {/* Login Form */}
                <div className="relative col-span-1 flex items-center justify-center overflow-y-auto p-6 sm:p-12">
                    {/* Logo */}
                    <div className="absolute left-6 top-6">
                        <div className="flex flex-row items-center">
                            <Logo className="h-10 w-10 md:h-13 md:w-14" />
                            <h4 className="ml-0 text-2xl font-bold">GhostSweep</h4>
                        </div>
                    </div>

                    <div className="mt-48 flex h-full w-full max-w-md flex-col">
                        {mode === "confirm" ? (
                            <ConfirmEmail email={email} />
                        ) : (
                            <>
                                {/* Tabs */}
                                <div className="mb-6 flex border-b border-border">
                                    <button
                                        type="button"
                                        className={`flex-1 cursor-pointer border-b-2 pb-2 text-sm font-medium transition ${mode === "signin"
                                                ? "border-primary text-foreground"
                                                : "border-transparent text-muted-foreground hover:text-foreground"
                                            }`}
                                        onClick={() => setMode("signin")}
                                    >
                                        Sign in
                                    </button>
                                    <button
                                        type="button"
                                        className={`flex-1 cursor-pointer border-b-2 pb-2 text-sm font-medium transition ${mode === "signup"
                                                ? "border-primary text-foreground"
                                                : "border-transparent text-muted-foreground hover:text-foreground"
                                            }`}
                                        onClick={() => setMode("signup")}
                                    >
                                        Create account
                                    </button>
                                </div>

                                {/* Heading */}
                                <div className="mb-6 space-y-1">
                                    <h2 className="text-xl font-semibold">
                                        {mode === "signin"
                                            ? "Welcome back"
                                            : "Get started with GhostSweep"}
                                    </h2>
                                    <p className="text-xs text-muted-foreground">
                                        {mode === "signin"
                                            ? "Sign in to run sweeps and manage your digital footprint."
                                            : "Create an account to scan your inbox and see who has your data."}
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