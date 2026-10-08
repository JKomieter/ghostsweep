"use client"
import { Button } from "@/components/ui/button";
import Input from "@/components/ui/input";
import { MoveLeft } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";


export default function ForgotPassword() {
    const [mode, setMode] = useState<"forgot" | "confirm">("forgot");
    const [email, setEmail] = useState("")

    const handleForgotPassword = async (e: React.FormEvent) => {
        e.preventDefault();

        const response = await fetch("/api/reset_password", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email }),
        });

        if (response.ok) {
            setMode("confirm");
            toast.success("Password reset link sent. Check your inbox.");
        } else {
            toast.error("Failed to send reset password email. Please try again.");
            console.error("Failed to send reset password email", response.statusText);
        }
    };

    return (
        <main className="min-h-screen flex items-center justify-center bg-background text-foreground px-4">
            <div className="w-full max-w-md rounded-lg border border-foreground/5 bg-foreground/2 p-6 shadow-lg backdrop-blur-xl">
                {
                    mode === "forgot" &&
                    <>
                        <h1 className="text-xl font-light tracking-tight text-foreground">
                            Forgot your password?
                        </h1>
                        <p className="text-xs text-foreground/60 mt-1">
                            Enter your email address below and we&apos;ll send you a link to reset your password.
                        </p>
                        <form className="w-full mt-6" onSubmit={handleForgotPassword}>
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
                                />
                            </div>
                            <Button type="submit" className="w-full mt-6 text-sm font-light bg-foreground text-background hover:bg-foreground/90">
                                Reset password
                            </Button>


                            <Link href="/login">
                                <Button variant="link" className="w-full mt-4 text-sm font-light text-foreground/60 hover:text-foreground">
                                    <MoveLeft /> Back to login
                                </Button>
                            </Link>
                        </form>
                    </>
                }
                {
                    mode === "confirm" &&
                    <>
                        <h1 className="text-2xl font-light mt-4 text-foreground">
                            Check your email
                        </h1>
                        <p className="text-sm text-foreground/60 mt-2 text-center">
                            We&apos;ve sent a password reset link to <strong className="font-light text-foreground">{email}</strong>. Please check your inbox and follow the instructions to reset your password.
                        </p>
                        <Link href="/login">
                            <Button variant="link" className="w-full mt-4 text-sm font-light text-foreground/60 hover:text-foreground">
                                <MoveLeft /> Back to login
                            </Button>
                        </Link>
                    </>
                }
            </div>
        </main>
    )
}