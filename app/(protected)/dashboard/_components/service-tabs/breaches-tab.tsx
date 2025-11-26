"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate } from "@/utils/format-date";



interface BreachesTabProps {
    breaches: {
        id: string;
        breach_id: string;
        email: string | null;
        domain: string | null;
        breach_date: string | null;
        data_classes: string[] | null;
        is_sensitive: boolean | null;
        raw: {
            [key: string]: unknown;
        } | null;
    }[];
    deleteMyDataAndAccount: () => void
    reduceMyData: () => void
}

export default function BreachesTab({ breaches, deleteMyDataAndAccount, reduceMyData }: BreachesTabProps) {
    if (!breaches || breaches.length === 0) {
        return (
            <div className="text-sm text-white/60 py-6 text-center">
                No known breaches for this service.
            </div>
        );
    }

    return (
        <div className="space-y-4 pt-4">
            {breaches.map((breach) => {
                const description = breach.raw?.description ?? null;

                return (
                    <Card
                        key={breach.id}
                        className="bg-[#0A0A0A] border border-white/10 hover:border-white/20 transition-colors"
                    >
                        <CardContent className="p-4 space-y-3">
                            {/* Header */}
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-white">
                                    {breach.domain || "Unknown Domain"}
                                </h3>

                                <Badge
                                    className={
                                        breach.is_sensitive
                                            ? "bg-red-600/20 text-red-300 border-red-500/30"
                                            : "bg-amber-500/20 text-amber-300 border-amber-500/30"
                                    }
                                >
                                    {breach.is_sensitive ? "Sensitive" : "Standard"}
                                </Badge>
                            </div>

                            {/* Breach Date */}
                            <p className="text-sm text-white/70">
                                Breach Date:{" "}
                                <span className="text-white">
                                    {breach.breach_date ? formatDate(breach.breach_date) : "Unknown"}
                                </span>
                            </p>

                            {/* Data Classes */}
                            {breach.data_classes && breach.data_classes.length > 0 && (
                                <div className="space-y-1">
                                    <p className="text-sm text-white/70">Exposed Data:</p>
                                    <div className="flex flex-wrap gap-2">
                                        {breach.data_classes.map((cls) => (
                                            <Badge
                                                key={cls}
                                                variant="outline"
                                                className="text-xs bg-white/5 border-white/10 text-white/80"
                                            >
                                                {cls}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Description */}
                            {!!description && (
                                <div className="space-y-1">
                                    <p className="text-sm text-white/70">What happened:</p>
                                    <p className="text-xs text-white/60 max-h-28 overflow-y-auto pr-1">
                                        {String(description)}
                                    </p>
                                </div>
                            )}

                            {/* Actions */}
                            <div className="pt-3 border-t border-white/10">
                                <p className="text-xs text-white/60 mb-2">What you can do:</p>
                                <div className="flex gap-3">
                                    <button
                                        onClick={deleteMyDataAndAccount}
                                        className="px-3 py-1.5 rounded-md bg-red-500/20 text-red-300 border border-red-400/20 text-xs hover:bg-red-500/30 transition"
                                    >
                                        Request Account Deletion
                                    </button>
                                    <button
                                        onClick={reduceMyData}
                                        className="px-3 py-1.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-400/20 text-xs hover:bg-amber-500/30 transition"
                                    >
                                        Reduce Data Usage
                                    </button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}