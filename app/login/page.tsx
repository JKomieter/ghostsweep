"use client"
import { Button } from "@/components/ui/button";
import Input from "@/components/ui/input";
import { Logo } from "@/svgs";
import { checkPasswordStrength } from "@/utils/password-strength-meter";
import { useState } from "react";
import { toast } from "sonner"
import { login, signup } from "./action";
import { Eye, EyeOff, MailIcon } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import Link from "next/link";

function SignInForm({
    email, setEmail,
}: {
    email: string;
    setEmail: React.Dispatch<React.SetStateAction<string>>;
}) {

    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setIsLoading(true);
            await login({ email, password });
            toast("Login successful!");
        } catch (error) {
            console.error("Login error:", error);
            if (error instanceof Error && error.message === "Invalid login credentials") {
                toast.error("Login failed. Please check your username and password");
                return
            }
        } finally {
            setIsLoading(false);
        }
    }

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
                    <button className="absolute inset-y-0 right-0 pr-3 flex items-center" type="button" onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ?
                            <EyeOff color="gray" />
                            : <Eye color="gray" />}
                    </button>
                </div>
            </div>

            <Button
                type="submit"
                className="w-full mt-2  text-sm font-medium"
            >
                {isLoading ? <Spinner /> : "Sign in"}
            </Button>

            <p className="text-[11px] text-muted-foreground text-center mt-3">
                By continuing, you agree to our Terms of Service and Privacy Policy.
            </p>
        </form>
    );
}

function SignUpForm({
    email, setEmail, setMode
}: {
    email: string;
    setEmail: React.Dispatch<React.SetStateAction<string>>;
    setMode: React.Dispatch<React.SetStateAction<"signin" | "signup" | "confirm">>;
}) {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPasswordWarning, setShowPasswordWarning] = useState(false);
    const [passwordFeedback, setPasswordFeedback] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleSignup = (async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            // Check if passwords match
            if (password !== confirmPassword) {
                toast("Passwords do not match.");
                return;
            }
            // Check password strength
            const { feedback } = checkPasswordStrength(password);
            setPasswordFeedback(feedback);
            if (feedback.length > 0) {
                setShowPasswordWarning(true);
                toast("Password is too weak. Please choose a stronger password.");
                return;
            }
            setShowPasswordWarning(false);
            setIsLoading(true);
            await signup({ email, password });
            setMode("confirm");
        } catch (error) {
            console.error("Signup error:", error);
            toast("An error occurred during signup. Please try again.");
        } finally {
            setIsLoading(false);
        }
    })



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
                    <button className="absolute inset-y-0 right-0 pr-3 flex items-center" type="button" onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ?
                            <EyeOff color="gray" />
                            : <Eye color="gray" />}
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
                className="w-full mt-2 text-sm font-medium"
            >
                {isLoading ? <Spinner /> : "Create account"}
            </Button>

            <p className="text-[11px] text-muted-foreground text-center mt-3">
                By creating an account, you agree to our Terms of Service and Privacy Policy.
            </p>
        </form>
    );
}

function PasswordWarning({
    feedback,
}: { feedback: string[] }) {

    return (
        <ul className="mt-1">
            {feedback.map((msg, index) => (
                <p key={index} className="text-xs text-destructive mt-1">
                    {msg}
                </p>
            ))}
        </ul>
    )
}

function ConfirmEmail({ email = "email address" }: { email?: string }) {
    return (
        <div className="flex items-center justify-center flex-col">
            <div>
                <MailIcon className="w-12 h-12 text-primary mx-auto mb-4" />
            </div>
            <div className="text-center">
                <h2 className="text-xl font-semibold mb-2">Confirm your email</h2>
                <p className="text-sm text-muted-foreground">
                    A confirmation link has been sent to your <strong>{email}</strong>. Please check your inbox and click the link to verify your account.
                </p>
            </div>
        </div>
    )
}

export default function LoginPage() {
    const [mode, setMode] = useState<"signin" | "signup" | "confirm">("signin");
    const [email, setEmail] = useState("");

    return (
        <div className="min-h-screen w-full overflow-hidden fixed bg-background flex">
            <div className="flex-1 grid lg:grid-cols-2 grid-cols-1">

                {/* Branding */}
                <div className="lg:block hidden bg-neutral-700" style={{
                    background: "linear-gradient(to bottom, rgba(0,242,222,0.15), rgba(0,0,0,0.6)),url('security.png')"
                }}>
                    <div className="inline-flex flex-col items-start h-full p-12 lg:p-24">
                        <h1 className="text-4xl font-bold">
                            Sweep your <span className="text-primary">digital footprint</span>.
                        </h1>
                        <p className="mt-4 text-muted-foreground">
                            Connect your inbox, see every company that has your data, and clean
                            up old accounts in minutes
                        </p>
                        <div className="text-xs text-muted-foreground/80 space-y-1 mt-6">
                            <p>• Read-only access to your inbox.</p>
                            <p>• You can disconnect and delete your data at any time.</p>
                        </div>
                    </div>
                </div>
                {/* Login Form */}
                <div className="lg:col-span-1 col-span-1 flex items-center justify-center p-6 sm:p-12 relative overflow-y-scroll">

                    {/* Logo */}
                    <div className="absolute top-6 left-6">
                        <div className="flex flex-row items-center">
                            <Logo className="w-14 h-13" />
                            <h4 className="ml-0 text-2xl font-bold">GhostSweep</h4>
                        </div>
                    </div>

                    <div className="h-full w-full max-w-md flex flex-col mt-48">
                        {
                            mode === "confirm" ? <ConfirmEmail /> :
                                <>
                                    {/* tabs */}
                                    <div className="flex border-b border-border mb-6">
                                        <button
                                            className={`flex-1 pb-2 text-sm font-medium transition border-b-2 cursor-pointer ${mode === "signin"
                                                ? "border-primary text-foreground"
                                                : "border-transparent text-muted-foreground hover:text-foreground"
                                                }`}
                                            onClick={() => setMode("signin")}
                                        >
                                            Sign in
                                        </button>
                                        <button
                                            className={`flex-1 pb-2 text-sm font-medium transition border-b-2 cursor-pointer ${mode === "signup"
                                                ? "border-primary text-foreground"
                                                : "border-transparent text-muted-foreground hover:text-foreground"
                                                }`}
                                            onClick={() => setMode("signup")}
                                        >
                                            Create account
                                        </button>
                                    </div>

                                    {/* Heading */}
                                    <div className="space-y-1 mb-6">
                                        <h2 className="text-xl font-semibold">
                                            {mode === "signin" ? "Welcome back" : "Get started with GhostSweep"}
                                        </h2>
                                        <p className="text-xs text-muted-foreground">
                                            {mode === "signin"
                                                ? "Sign in to run sweeps and manage your digital footprint."
                                                : "Create an account to scan your inbox and see who has your data."}
                                        </p>
                                    </div>

                                    {/* Form */}
                                    {mode === "signin" ? <SignInForm email={email} setEmail={setEmail} /> : <SignUpForm email={email} setEmail={setEmail} setMode={setMode} />}
                                </>
                        }
                    </div>
                </div>
            </div>
        </div>
    )
}