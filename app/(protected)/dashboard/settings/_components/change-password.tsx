"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import Input from "@/components/ui/input";
import { logout } from "@/utils/client-logout";
import { REAUTH_REQUIRED_CODE } from "@/utils/reauth-code";
import { isPasswordValid, PASSWORD_REQUIREMENTS_MESSAGE } from "@/utils/password-policy";

// Sets or changes the signed-in user's password. The server (/api/account/password) requires a
// recent sign-in, enforces the password policy, and signs out every other session afterwards.
export default function ChangePassword() {
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [reauthRequired, setReauthRequired] = useState(false);

    const handleSubmit = async () => {
        setError(null);

        if (!newPassword || !confirmPassword) {
            setError("Please fill in both password fields.");
            return;
        }
        if (newPassword !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }
        if (!isPasswordValid(newPassword)) {
            setError(PASSWORD_REQUIREMENTS_MESSAGE);
            return;
        }

        try {
            setLoading(true);
            const res = await fetch("/api/account/password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ password: newPassword }),
            });

            if (!res.ok) {
                const body = await res.json().catch(() => ({}));
                if (body.code === REAUTH_REQUIRED_CODE) setReauthRequired(true);
                setError(body.error || "Couldn’t update password.");
                return;
            }

            toast.success("Password changed. You’ve been signed out on all other devices.");
            setNewPassword("");
            setConfirmPassword("");
        } catch {
            setError("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-3">
            <div className="grid gap-2 sm:grid-cols-2">
                <Input
                    type="password"
                    placeholder="New password"
                    value={newPassword}
                    onChange={setNewPassword}
                    id="new-password"
                />
                <Input
                    type="password"
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={setConfirmPassword}
                    id="confirm-new-password"
                />
            </div>
            <p className="text-xs text-muted-foreground">
                At least 12 characters, with upper and lower case letters, a number and a symbol.
                Changing your password signs you out on all other devices.
            </p>
            {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
            {reauthRequired && (
                <div className="rounded-md border border-amber-500/30 bg-amber-500/10 p-3 space-y-2">
                    <p className="text-xs text-amber-800 dark:text-amber-300">
                        For your security, changing your password needs a recent sign-in.
                        Sign in again, then come back to make this change.
                    </p>
                    <Button size="sm" variant="outline" onClick={() => logout({ scope: "local" })}>
                        Sign in again
                    </Button>
                </div>
            )}
            <Button onClick={handleSubmit} disabled={loading}>
                {loading ? "Updating…" : "Update password"}
            </Button>
        </div>
    );
}
