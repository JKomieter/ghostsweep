"use client";

import React, {  useEffect, useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { createClient } from "@/utils/supabase/client";
import Input from "@/components/ui/input";
import { checkPasswordStrength } from "@/utils/password_strength_meter";
import { toast } from "sonner";
import { CircleCheck } from "lucide-react";

export default function Profile({
    open,
    onOpenChangeAction,
}: {
    open: boolean;
    onOpenChangeAction: React.Dispatch<React.SetStateAction<boolean>>;
}) {
    const supabase = createClient();

    const [email, setEmail] = useState("");
    const [loadingUser, setLoadingUser] = useState(false);
    const [userError, setUserError] = useState<string | null>(null);

    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [passwordError, setPasswordError] = useState<string | null>(null);
    const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);

    const [deleteOpen, setDeleteOpen] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [deleteError, setDeleteError] = useState<string | null>(null);

    // Load user email when modal opens
    useEffect(() => {
        if (!open) return;

        const loadUser = async () => {
            try {
                setLoadingUser(true);
                setUserError(null);
                const { data, error } = await supabase.auth.getUser();

                if (error) {
                    console.error("Error fetching user:", error);
                    setUserError("Couldn’t load your profile. Please try again.");
                    return;
                }

                if (data.user) {
                    setEmail(data.user.email ?? "");
                }
            } finally {
                setLoadingUser(false);
            }
        };

        void loadUser();
    }, [open, supabase]);

    const handleChangePassword = async () => {
        setPasswordError(null);
        setPasswordSuccess(null);

        if (!newPassword || !confirmPassword) {
            setPasswordError("Please fill in both password fields.");
            return;
        }

        if (newPassword !== confirmPassword) {
            setPasswordError("Passwords do not match.");
            return;
        }

        if (newPassword.length < 8) {
            setPasswordError("Password should be at least 8 characters.");
            return;
        }

        const { feedback } = checkPasswordStrength(newPassword);

        if (feedback.length > 0) {
            setPasswordError("Password must be 8+ characters with uppercase, lowercase, and a special symbol.")
            return
        }

        try {
            setPasswordLoading(true);
            const { error } = await supabase.auth.updateUser({ password: newPassword });

            if (error) {
                console.error("Error updating password:", error);
                setPasswordError(error.message || "Couldn’t update password.");
                return;
            }

            toast.success(() => (
                <div className="flex fle-row items-center gap-2">
                    <CircleCheck color="green" /> Password changed successfully
                </div>
            ));
            setPasswordSuccess("Password changed successfully")
            setNewPassword("");
            setConfirmPassword("");
        } finally {
            setPasswordLoading(false);
        }
    };

    const handleDeleteAccount = async () => {
        setDeleteError(null);
        setDeleteLoading(true);

        try {
            // You must implement this API route on the server using a service role key.
            const res = await fetch("/api/account/delete", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
            });

            if (!res.ok) {
                const body = await res.json().catch(() => ({}));
                setDeleteError(body.error || "Could not delete your account.");
                toast.error("Could not delete your account.")
                return;
            }

            // After successful deletion: log out + redirect
            await supabase.auth.signOut();
            window.location.href = "/login"; 
        } catch (err) {
            console.error("Error deleting account:", err);
            setDeleteError("Something went wrong. Please try again.");
        } finally {
            setDeleteLoading(false);
        }
    };

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChangeAction}>
                <DialogContent className="sm:max-w-md bg-card border border-foreground/10">
                    <DialogHeader>
                        <DialogTitle className="text-lg">Profile</DialogTitle>
                        <DialogDescription className="text-xs text-muted-foreground">
                            Manage your account details and security.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="mt-4 space-y-6">
                        {/* Email */}
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-muted-foreground">
                                Email
                            </label>
                            <Input
                                value={loadingUser ? "" : email}
                                readOnly
                                placeholder={loadingUser ? "Loading..." : ""} 
                                id={"email"} 
                                onChange={() => {}}                            />
                            <p className="text-[11px] text-muted-foreground">
                                This is the email linked to your GhostSweep account.
                            </p>
                            {userError && (
                                <p className="text-[11px] text-red-600 dark:text-red-400 mt-1">{userError}</p>
                            )}
                        </div>

                        {/* Change password */}
                        <div className="space-y-2">
                            <p className="text-xs font-medium text-muted-foreground">
                                Change password
                            </p>
                            <div className="space-y-2">
                                <Input
                                    type="password"
                                    placeholder="New password"
                                    value={newPassword}
                                    onChange={setNewPassword}
                                    id="password"
                                />
                                <Input
                                    type="password"
                                    placeholder="Confirm new password"
                                    value={confirmPassword}
                                    onChange={setConfirmPassword}
                                    id="confirmPassword"
                                />
                            </div>
                            {passwordError && (
                                <p className="text-[11px] text-red-600 dark:text-red-400 mt-1">{passwordError}</p>
                            )}
                            {passwordSuccess && (
                                <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1">
                                    {passwordSuccess}
                                </p>
                            )}
                            <Button
                                size="sm"
                                className="mt-1"
                                onClick={handleChangePassword}
                                disabled={passwordLoading}
                            >
                                {passwordLoading ? "Updating..." : "Update password"}
                            </Button>
                        </div>

                        {/* Delete account */}
                        <div className="border-t border-foreground/10 pt-4">
                            <p className="text-xs font-medium text-red-600 dark:text-red-400 mb-1">
                                Danger zone
                            </p>
                            <p className="text-[11px] text-muted-foreground mb-2">
                                Permanently delete your account and all associated GhostSweep data.
                                This action cannot be undone.
                            </p>
                            <Button
                                variant="outline"
                                size="sm"
                                className="border-red-500/50 text-red-600 dark:text-red-400 hover:bg-red-500/10 hover:text-red-700 dark:hover:text-red-300"
                                onClick={() => setDeleteOpen(true)}
                            >
                                Delete account
                            </Button>
                            {deleteError && (
                                <p className="text-[11px] text-red-600 dark:text-red-400 mt-2">{deleteError}</p>
                            )}
                        </div>

                        {/* Footer actions */}
                        <div className="flex items-center justify-end pt-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onOpenChangeAction(false)}
                            >
                                Close
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Delete confirmation modal */}
            <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <AlertDialogContent className="bg-card border border-foreground/10">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete account?</AlertDialogTitle>
                        <AlertDialogDescription className="text-xs text-muted-foreground">
                            This will permanently delete your GhostSweep account and all stored
                            sweep data. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={deleteLoading}>
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteAccount}
                            disabled={deleteLoading}
                            className="bg-red-600 hover:bg-red-700 text-white"
                        >
                            {deleteLoading ? "Deleting..." : "Delete account"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}