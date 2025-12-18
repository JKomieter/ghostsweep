"use client";

import * as React from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Input from "@/components/ui/input";
import countries from "@/constant/countries";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Spinner } from "@/components/ui/spinner";

interface DeletionProfileModalProps {
    open: boolean;
    onOpenChangeAction: (open: boolean) => void;
    initialFullName?: string | null;
    initialCountry?: string | null;
    setIsDeletionEmailModalOpen?: React.Dispatch<React.SetStateAction<boolean>>
}

export function DeletionProfileModal({
    open,
    onOpenChangeAction,
    initialFullName,
    initialCountry,
    setIsDeletionEmailModalOpen
}: DeletionProfileModalProps) {
    const [fullName, setFullName] = React.useState(initialFullName ?? "");
    const [country, setCountry] = React.useState(initialCountry ?? "");
    const [isSaving, setIsSaving] = React.useState(false);
    const queryClient = useQueryClient()

    // Reset form each time the modal opens
    React.useEffect(() => {
        if (open) {
            setFullName(initialFullName ?? "");
            setCountry(initialCountry ?? "");
        }
    }, [open, initialFullName, initialCountry]);

    const handleSave = useMutation({
        mutationFn: async () => {
            setIsSaving(true);
            const res = await fetch("/api/deletion_profile/post", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    full_name: fullName.trim(),
                    country: country.trim(),
                }),
            });

            return res
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["deletion-profile"] })
            toast.success("Deletion profile saved.");
            onOpenChangeAction(false);
            if (setIsDeletionEmailModalOpen) setIsDeletionEmailModalOpen(true)
        },
        onError: (error) => {
            console.error(error);
            toast.error("Couldn’t save your profile. Please try again.");
        },
        onSettled: () => {
            setIsSaving(false);
        }
    })

    return (
        <Dialog open={open} onOpenChange={onOpenChangeAction}>
            <DialogContent className="sm:max-w-md bg-[#050505] border border-white/10">
                <DialogHeader className="space-y-2">
                    <DialogTitle className="flex flex-col gap-1">
                        <span className="text-xs uppercase tracking-wide text-muted-foreground">
                            Deletion profile
                        </span>
                        <span className="text-lg font-semibold">
                            Set up your deletion details
                        </span>
                    </DialogTitle>
                    <DialogDescription className="text-xs text-muted-foreground">
                        We’ll use this information to personalize your privacy request
                        emails so companies can verify your identity more easily.
                        GhostSweep never shares this profile with anyone except in the
                        templates you send yourself.
                    </DialogDescription>
                </DialogHeader>

                <div className="mt-3 space-y-4 text-sm">
                    <div className="space-y-2">
                        <div
                            className="text-[11px] uppercase tracking-wide text-muted-foreground"
                        >
                            Full name
                        </div>
                        <Input
                            id="full-name"
                            value={fullName}
                            onChange={setFullName}
                            placeholder="e.g. Ama K. Mensah"
                        />
                    </div>

                    <div className="space-y-2">
                        <div
                            className="text-[11px] uppercase tracking-wide text-muted-foreground"
                        >
                            Country
                        </div>
                        <Select value={country} onValueChange={(val) => setCountry(val)}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select your country" />
                            </SelectTrigger>
                            <SelectContent>
                                {countries.map((country) => (
                                    <SelectItem key={country.country} value={country.country}>
                                        {country.country}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <p className="text-[11px] text-muted-foreground">
                        You can edit this later in Settings. New deletion emails will
                        automatically use your latest profile.
                    </p>
                </div>

                <div className="mt-4 flex justify-end gap-2">
                    <Button
                        size="sm"
                        variant="outline"
                        className="text-xs"
                        onClick={() => onOpenChangeAction(false)}
                        disabled={isSaving}
                    >
                        Cancel
                    </Button>
                    <Button
                        size="sm"
                        className="bg-primary text-black hover:bg-primary/80 text-xs"
                        onClick={() => handleSave.mutateAsync()}
                        disabled={isSaving}
                    >
                        {isSaving ? (
                            <Spinner />
                        ) : "Save profile"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}